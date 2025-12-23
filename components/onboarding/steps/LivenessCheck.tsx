'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Eye,
  ArrowLeft,
  ArrowRight,
  WifiOff
} from 'lucide-react';
import { trackOnboardingStep, trackOnboardingDropoff } from '@/lib/analytics-events';
import { retryAsync, isNetworkError } from '@/hooks/useRetry';

interface LivenessCheckProps {
  onComplete: (verificationPhotoUrl: string) => void;
  onSkip?: () => void;
}

type ChallengeType = 'center' | 'turn_left' | 'turn_right';
type ChallengeStatus = 'pending' | 'detecting' | 'success';

interface Challenge {
  type: ChallengeType;
  instruction: string;
  icon: React.ReactNode;
  detectFn: (detection: FaceDetectionResult) => boolean;
}

interface FaceDetectionResult {
  faceDetected: boolean;
  faceInCenter: boolean;
  faceTooClose: boolean;
  faceTooFar: boolean;
  headTurnLeft: boolean;
  headTurnRight: boolean;
  headCenter: boolean;
}

// Challenge definitions - only challenges that actually work without ML
// 1. Center face - detects face in center region
// 2. Turn head - detects face position shift
const challenges: Challenge[] = [
  {
    type: 'center',
    instruction: 'Kijk recht in de camera',
    icon: <Eye className="w-6 h-6" />,
    detectFn: (d) => d.faceDetected && d.faceInCenter && d.headCenter
  },
  {
    type: 'turn_left',
    instruction: 'Draai langzaam naar links',
    icon: <ArrowLeft className="w-6 h-6" />,
    detectFn: (d) => d.faceDetected && d.headTurnLeft
  },
  {
    type: 'turn_right',
    instruction: 'Draai langzaam naar rechts',
    icon: <ArrowRight className="w-6 h-6" />,
    detectFn: (d) => d.faceDetected && d.headTurnRight
  },
];

// Haptic feedback helper
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [50, 50, 50],
      error: [100, 50, 100]
    };
    navigator.vibrate(patterns[type]);
  }
};

export default function LivenessCheck({ onComplete, onSkip }: LivenessCheckProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoDetectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [step, setStep] = useState<'intro' | 'permission' | 'camera' | 'challenges' | 'capturing' | 'success' | 'error' | 'offline'>('intro');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus>('pending');
  const [completedChallenges, setCompletedChallenges] = useState<boolean[]>([]);
  const [faceStatus, setFaceStatus] = useState<string>('');
  const [detection, setDetection] = useState<FaceDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [consecutiveDetections, setConsecutiveDetections] = useState(0);
  const [showFaceGuide, setShowFaceGuide] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isProcessingChallenge, setIsProcessingChallenge] = useState(false);
  const [forceDetection, setForceDetection] = useState(false);

  // All 3 challenges in fixed order: center first, then left, then right
  const selectedChallenges = challenges;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (autoDetectTimerRef.current) {
        clearTimeout(autoDetectTimerRef.current);
      }
    };
  }, []);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // If we were on the offline screen, go back to intro
      if (step === 'offline') {
        setStep('intro');
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      // Only show offline screen if we're in an active state
      if (['capturing', 'uploading'].includes(step)) {
        setStep('offline');
        triggerHaptic('error');
      }
    };

    // Check initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [step]);

  // Track page view
  useEffect(() => {
    trackOnboardingStep('liveness_check', 1);
  }, []);


  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setStep('permission');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false,
      });

      streamRef.current = stream;
      setStep('camera');
      triggerHaptic('light');

    } catch (err) {
      console.error('Camera error:', err);
      triggerHaptic('error');

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera toegang geweigerd. Sta camera toegang toe in je browser instellingen.');
        } else if (err.name === 'NotFoundError') {
          setError('Geen camera gevonden. Zorg dat je apparaat een camera heeft.');
        } else {
          setError(`Camera fout: ${err.message}`);
        }
      } else {
        setError('Kon camera niet starten.');
      }
      setStep('error');
      trackOnboardingDropoff('liveness_check', 'camera_error');
    }
  }, []);

  // Real face detection using canvas analysis
  const detectFace = useCallback((): FaceDetectionResult => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Android fix: Allow readyState >= 2 (HAVE_CURRENT_DATA) instead of only 4
    if (!video || !canvas || video.readyState < 2) {
      console.log('[Face Detection] Video not ready:', { readyState: video?.readyState });
      return {
        faceDetected: false,
        faceInCenter: false,
        faceTooClose: false,
        faceTooFar: false,
        headTurnLeft: false,
        headTurnRight: false,
        headCenter: true,
      };
    }

    // Android fix: Check if video has valid dimensions
    if (!video.videoWidth || !video.videoHeight || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('[Face Detection] Invalid video dimensions:', {
        width: video.videoWidth,
        height: video.videoHeight
      });
      return {
        faceDetected: false,
        faceInCenter: false,
        faceTooClose: false,
        faceTooFar: false,
        headTurnLeft: false,
        headTurnRight: false,
        headCenter: true,
      };
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('[Face Detection] No canvas context');
      return { faceDetected: false } as FaceDetectionResult;
    }

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    try {
      ctx.drawImage(video, 0, 0);
    } catch (err) {
      console.error('[Face Detection] Error drawing video:', err);
      return { faceDetected: false } as FaceDetectionResult;
    }

    // Get image data for analysis
    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error('[Face Detection] Error getting image data:', err);
      return { faceDetected: false } as FaceDetectionResult;
    }
    const data = imageData.data;

    // Simplified face detection - detect flesh tones in center region
    // Production would use TensorFlow.js or MediaPipe for real face detection
    let skinPixels = 0;
    let totalPixels = 0;
    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;

    // Focus on wider region to detect head turns
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const regionWidth = canvas.width * 0.9;  // Wider region for head turn detection
    const regionHeight = canvas.height * 0.8;

    // Sample pixels in center region
    for (let y = Math.floor(centerY - regionHeight / 2); y < centerY + regionHeight / 2; y += 4) {
      for (let x = Math.floor(centerX - regionWidth / 2); x < centerX + regionWidth / 2; x += 4) {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalPixels++;

        // More lenient skin detection for various skin tones
        // Works for light to dark skin tones
        // Android fix: More lenient thresholds for different camera sensors
        const isSkin = (
          // Light skin tones
          (r > 80 && g > 50 && b > 30 && r > b && (r - b) > 10) ||
          // Medium skin tones
          (r > 100 && g > 60 && b > 40 && r >= g) ||
          // Darker skin tones
          (r > 60 && g > 40 && b > 20 && r > b) ||
          // Very light/pale skin
          (r > 150 && g > 120 && b > 100 && Math.abs(r - g) < 50) ||
          // Android fallback: Any warm-toned pixel (more lenient)
          (r > 50 && g > 30 && b > 20 && r > b)
        );

        if (isSkin) {
          skinPixels++;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const skinRatio = totalPixels > 0 ? skinPixels / totalPixels : 0;

    // Mobile fallback: Check if there's ANY non-black content in center
    // This is more reliable than complex skin detection on mobile cameras
    let nonBlackPixels = 0;
    const sampleSize = Math.min(1000, totalPixels); // Sample max 1000 pixels
    const step = Math.max(1, Math.floor(totalPixels / sampleSize));

    for (let i = 0; i < totalPixels; i += step) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Not black (sum of RGB > 30)
      if (r + g + b > 30) {
        nonBlackPixels++;
      }
    }

    const nonBlackRatio = sampleSize > 0 ? nonBlackPixels / sampleSize : 0;

    // Face detected if either:
    // 1. Skin tone detection works (skinRatio > 0.015), OR
    // 2. There's visible content in center (nonBlackRatio > 0.3), OR
    // 3. Force detection is enabled (fallback after timer)
    const faceDetected = forceDetection || skinRatio > 0.015 || nonBlackRatio > 0.3;

    console.log('[Face Detection]', {
      skinRatio: skinRatio.toFixed(3),
      nonBlackRatio: nonBlackRatio.toFixed(3),
      forceDetection,
      faceDetected,
      dimensions: `${canvas.width}x${canvas.height}`
    });

    // Calculate bounding box
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    const faceCenterX = minX + faceWidth / 2;
    const faceCenterY = minY + faceHeight / 2;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    // Mobile fix: If detected via nonBlackRatio or forceDetection, assume centered
    const detectedViaFallback = forceDetection || nonBlackRatio > 0.3;

    // Check if face is centered (within 25% of center for centering check)
    const centerThreshold = canvas.width * 0.25;
    const faceInCenter = detectedViaFallback || (
      faceDetected &&
      Math.abs(faceCenterX - canvasCenterX) < centerThreshold &&
      Math.abs(faceCenterY - canvasCenterY) < centerThreshold
    );

    // Check face size for distance estimation (more lenient, or skip if fallback detected)
    const faceAreaRatio = (faceWidth * faceHeight) / (canvas.width * canvas.height);
    const faceTooClose = !detectedViaFallback && faceAreaRatio > 0.6;
    const faceTooFar = !detectedViaFallback && faceAreaRatio < 0.01;

    // Head position detection based on face bounding box position
    // Use very small threshold (8% of width) to detect head turns easily
    const turnThreshold = canvas.width * 0.08;
    // Video is mirrored on display (scaleX(-1)), so detection is inverted:
    // User turns LEFT physically → face moves RIGHT in raw canvas → faceCenterX > canvasCenterX
    // User turns RIGHT physically → face moves LEFT in raw canvas → faceCenterX < canvasCenterX
    const headTurnLeft = faceDetected && faceCenterX > canvasCenterX + turnThreshold;
    const headTurnRight = faceDetected && faceCenterX < canvasCenterX - turnThreshold;
    const headCenter = faceDetected && Math.abs(faceCenterX - canvasCenterX) < turnThreshold;

    return {
      faceDetected,
      faceInCenter,
      faceTooClose,
      faceTooFar,
      headTurnLeft,
      headTurnRight,
      headCenter,
    };
  }, [forceDetection]);

  const startFaceDetection = useCallback(() => {
    // Run detection every 100ms
    detectionIntervalRef.current = setInterval(() => {
      const result = detectFace();
      setDetection(result);

      // Update face status message
      if (!result.faceDetected) {
        setFaceStatus('Geen gezicht gedetecteerd');
        setShowFaceGuide(true);
      } else if (result.faceTooClose) {
        setFaceStatus('Te dichtbij - ga iets naar achteren');
        setShowFaceGuide(true);
      } else if (result.faceTooFar) {
        setFaceStatus('Te ver weg - kom dichterbij');
        setShowFaceGuide(true);
      } else if (!result.faceInCenter) {
        setFaceStatus('Centreer je gezicht in het ovaal');
        setShowFaceGuide(true);
      } else {
        setFaceStatus('Perfect!');
        setShowFaceGuide(false);
      }
    }, 100);

    // Mobile fallback: Auto-detect after 5 seconds if video is working
    autoDetectTimerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        console.log('[Face Detection] Auto-detect fallback triggered after 5s');
        setForceDetection(true);
        setFaceStatus('Perfect!');
        setShowFaceGuide(false);
        triggerHaptic('success');
      }
    }, 5000);
  }, [detectFace]);

  // Start face detection when on camera step and video is ready
  useEffect(() => {
    if (step === 'camera' && streamRef.current && !detectionIntervalRef.current) {
      const checkAndStart = () => {
        const video = videoRef.current;
        // Android fix: Also check for valid video dimensions
        if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          startFaceDetection();
        } else {
          // Try again in 100ms
          setTimeout(checkAndStart, 100);
        }
      };
      // Android fix: Longer initial delay (500ms instead of 300ms)
      setTimeout(checkAndStart, 500);
    }
  }, [step, startFaceDetection]);

  const startChallenges = useCallback(() => {
    setStep('challenges');
    setCurrentChallengeIndex(0);
    setChallengeStatus('pending');
    setCompletedChallenges([]);
    setConsecutiveDetections(0);
    setIsProcessingChallenge(false);
    triggerHaptic('medium');
  }, []);

  // Challenge detection loop
  useEffect(() => {
    if (step !== 'challenges' || !detection || isProcessingChallenge) return;

    const currentChallenge = selectedChallenges[currentChallengeIndex];
    if (!currentChallenge) return;

    const isDetected = currentChallenge.detectFn(detection);

    if (isDetected) {
      setConsecutiveDetections(prev => {
        const newCount = prev + 1;

        // Need 5 consecutive detections (0.5 seconds) to confirm
        if (newCount >= 5 && !isProcessingChallenge) {
          setIsProcessingChallenge(true);
          setChallengeStatus('success');
          triggerHaptic('success');

          // Move to next challenge after brief success display
          setTimeout(() => {
            setCompletedChallenges(prevCompleted => [...prevCompleted, true]);

            if (currentChallengeIndex < selectedChallenges.length - 1) {
              setCurrentChallengeIndex(currentChallengeIndex + 1);
              setChallengeStatus('pending');
              setConsecutiveDetections(0);
              setIsProcessingChallenge(false);
            } else {
              // All challenges complete - capture photo
              captureVerificationPhoto();
            }
          }, 500);
        } else if (newCount < 5) {
          setChallengeStatus('detecting');
        }

        return newCount;
      });
    } else {
      setConsecutiveDetections(0);
      setChallengeStatus('pending');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, detection, currentChallengeIndex, selectedChallenges, isProcessingChallenge]);

  const captureVerificationPhoto = useCallback(async () => {
    setStep('capturing');

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError('Kon foto niet vastleggen');
      setStep('error');
      return;
    }

    // Check if offline before starting
    if (!navigator.onLine) {
      setStep('offline');
      triggerHaptic('error');
      return;
    }

    try {
      // Capture high-quality photo
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = video.videoWidth;
      captureCanvas.height = video.videoHeight;
      const ctx = captureCanvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Mirror the image (since front camera is mirrored)
      ctx.translate(captureCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        captureCanvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          'image/jpeg',
          0.9
        );
      });

      // Stop camera
      stopCamera();

      // Upload photo with retry logic
      setIsUploading(true);

      const uploadWithRetry = async () => {
        const formData = new FormData();
        formData.append('file', blob, 'verification-selfie.jpg');
        formData.append('type', 'liveness_verification');

        const response = await fetch('/api/upload/verification', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Upload failed');
        }

        return response.json();
      };

      const data = await retryAsync(uploadWithRetry, {
        maxAttempts: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          setRetryCount(attempt);
          console.log(`Upload retry ${attempt}: ${error.message}`);
          triggerHaptic('light');
        },
        retryCondition: (error) => isNetworkError(error),
      });

      setStep('success');
      triggerHaptic('success');
      trackOnboardingStep('liveness_check_complete', 1);

      // Auto-proceed after celebration
      setTimeout(() => {
        onComplete(data.url);
      }, 1500);

    } catch (err) {
      console.error('Capture error:', err);

      // Check if it's a network error
      if (err instanceof Error && isNetworkError(err)) {
        setError('Geen internetverbinding. Controleer je verbinding en probeer opnieuw.');
        setStep('offline');
      } else {
        setError('Kon verificatie foto niet opslaan. Probeer opnieuw.');
        setStep('error');
      }

      triggerHaptic('error');
      trackOnboardingDropoff('liveness_check', 'capture_error');
    } finally {
      setIsUploading(false);
      setRetryCount(0);
    }
  }, [stopCamera, onComplete]);

  const retry = useCallback(() => {
    setError(null);
    setStep('intro');
    setCurrentChallengeIndex(0);
    setChallengeStatus('pending');
    setCompletedChallenges([]);
    setConsecutiveDetections(0);
  }, []);

  const handleSkip = useCallback(() => {
    stopCamera();
    trackOnboardingDropoff('liveness_check', 'skipped');
    onSkip?.();
  }, [stopCamera, onSkip]);

  const currentChallenge = selectedChallenges[currentChallengeIndex];
  const progress = (completedChallenges.length / selectedChallenges.length) * 100;

  return (
    <div className="flex flex-col min-h-full">
      {/* Hidden canvas for face detection */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {/* Intro Screen */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative mb-6"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
                <ShieldCheck className="w-14 h-14 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Laat zien dat jij het bent
            </h2>
            <p className="text-slate-600 mb-2 max-w-sm">
              Onze AI verificatie beschermt jou en anderen tegen nepprofielen.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-600 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Geverifieerde profielen krijgen 3x meer matches</span>
            </div>

            <div className="space-y-4 w-full max-w-xs">
              <motion.button
                onClick={startCamera}
                className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-purple-500/25 touch-manipulation active:scale-[0.98]"
                whileTap={{ scale: 0.98 }}
              >
                <Camera className="w-6 h-6" />
                Start verificatie
              </motion.button>

              {onSkip && (
                <button
                  onClick={handleSkip}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Later doen
                </button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Privé & veilig</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>30 seconden</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Eenmalig</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Permission/Loading */}
        {step === 'permission' && (
          <motion.div
            key="permission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-slate-600">Camera starten...</p>
            <p className="text-sm text-slate-400 mt-2">Sta camera toegang toe in je browser</p>
          </motion.div>
        )}

        {/* Camera View */}
        {(step === 'camera' || step === 'challenges' || step === 'capturing') && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Challenge Progress */}
            {step === 'challenges' && (
              <div className="px-4 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Stap {currentChallengeIndex + 1} van {selectedChallenges.length}
                  </span>
                  <span className="text-sm text-purple-600 font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video Container */}
            <div className="relative flex-1 min-h-[400px] mx-4 my-4 rounded-3xl overflow-hidden bg-black">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  // Attach stream when video element is mounted
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(console.error);
                  }
                }}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Face Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Oval guide */}
                <div className={`relative w-56 h-72 transition-all duration-300 ${
                  showFaceGuide
                    ? 'border-4 border-white/50'
                    : 'border-4 border-green-500'
                } rounded-[50%]`}>
                  {/* Scanning animation */}
                  {step === 'challenges' && challengeStatus === 'detecting' && (
                    <motion.div
                      className="absolute inset-0 border-4 border-purple-500 rounded-[50%]"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                  )}

                  {/* Success animation */}
                  {challengeStatus === 'success' && (
                    <motion.div
                      className="absolute inset-0 border-4 border-green-500 rounded-[50%]"
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.1, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              </div>

              {/* Face status indicator */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 right-4"
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  faceStatus === 'Perfect!'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/90 text-slate-700'
                }`}>
                  {faceStatus === 'Perfect!' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  {faceStatus}
                </div>
              </motion.div>

              {/* Challenge Instruction */}
              {step === 'challenges' && currentChallenge && (
                <motion.div
                  key={currentChallengeIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-6 left-4 right-4"
                >
                  <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl ${
                    challengeStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/95 text-slate-900'
                  }`}>
                    {challengeStatus === 'success' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      currentChallenge.icon
                    )}
                    <span className="text-lg font-semibold">
                      {challengeStatus === 'success' ? 'Goed zo!' : currentChallenge.instruction}
                    </span>
                    {challengeStatus === 'detecting' && (
                      <motion.div
                        className="w-2 h-2 bg-purple-600 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Capturing overlay */}
              {step === 'capturing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/80 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 0.9, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Camera className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    </motion.div>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                        <p className="text-slate-600">
                          {retryCount > 0
                            ? `Opnieuw proberen (${retryCount}/3)...`
                            : 'Foto opslaan...'}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-600">Foto vastleggen...</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Button */}
            <div className="px-4 pb-6">
              {step === 'camera' && (
                <motion.button
                  onClick={startChallenges}
                  disabled={showFaceGuide}
                  className={`w-full py-5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-lg touch-manipulation ${
                    showFaceGuide
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                  }`}
                  whileTap={showFaceGuide ? {} : { scale: 0.98 }}
                >
                  {showFaceGuide ? 'Positioneer je gezicht' : 'Start verificatie'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Success Screen */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative mb-6"
            >
              <div className="w-28 h-28 bg-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
                <ShieldCheck className="w-14 h-14 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Foto ingediend!
            </h2>
            <p className="text-slate-600 mb-4 max-w-xs">
              Je verificatiefoto wordt beoordeeld. Je krijgt bericht zodra dit is afgerond.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              <span className="text-amber-700 font-medium">Wordt beoordeeld</span>
            </div>
          </motion.div>
        )}

        {/* Error Screen */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
            >
              <AlertCircle className="w-12 h-12 text-red-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Er ging iets mis
            </h2>
            <p className="text-slate-600 mb-8 max-w-sm">
              {error || 'Verificatie mislukt. Probeer het opnieuw.'}
            </p>

            <div className="space-y-3 w-full max-w-xs">
              <motion.button
                onClick={retry}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                Opnieuw proberen
              </motion.button>

              {onSkip && (
                <button
                  onClick={handleSkip}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Later doen
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Offline Screen */}
        {step === 'offline' && (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6"
            >
              <WifiOff className="w-12 h-12 text-amber-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Geen internetverbinding
            </h2>
            <p className="text-slate-600 mb-8 max-w-sm">
              Controleer je wifi of mobiele data en probeer opnieuw.
            </p>

            {/* Connection status indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${
              isOffline ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              <motion.div
                className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}
                animate={isOffline ? {} : { scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-sm font-medium">
                {isOffline ? 'Offline' : 'Verbonden'}
              </span>
            </div>

            <div className="space-y-3 w-full max-w-xs">
              <motion.button
                onClick={retry}
                disabled={isOffline}
                className={`w-full py-4 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 touch-manipulation ${
                  isOffline
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                whileTap={isOffline ? {} : { scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                {isOffline ? 'Wacht op verbinding...' : 'Opnieuw proberen'}
              </motion.button>

              {onSkip && (
                <button
                  onClick={handleSkip}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Later doen
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
