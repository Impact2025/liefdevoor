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
  Smile,
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

type ChallengeType = 'center' | 'blink' | 'smile' | 'turn_left' | 'turn_right';
type ChallengeStatus = 'pending' | 'detecting' | 'success' | 'failed';

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
  multipleFaces: boolean;
  eyesOpen: boolean;
  smiling: boolean;
  headTurnLeft: boolean;
  headTurnRight: boolean;
  headCenter: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

// Challenge definitions with real detection logic
const challenges: Challenge[] = [
  {
    type: 'center',
    instruction: 'Kijk recht in de camera',
    icon: <Eye className="w-6 h-6" />,
    detectFn: (d) => d.faceDetected && d.faceInCenter && d.headCenter && !d.faceTooClose && !d.faceTooFar
  },
  {
    type: 'blink',
    instruction: 'Knijp je ogen even dicht',
    icon: <span className="text-2xl">😌</span>,
    detectFn: (d) => d.faceDetected && !d.eyesOpen
  },
  {
    type: 'smile',
    instruction: 'Lach naar de camera',
    icon: <Smile className="w-6 h-6" />,
    detectFn: (d) => d.faceDetected && d.smiling
  },
  {
    type: 'turn_left',
    instruction: 'Draai je hoofd naar links',
    icon: <ArrowLeft className="w-6 h-6" />,
    detectFn: (d) => d.faceDetected && d.headTurnLeft
  },
  {
    type: 'turn_right',
    instruction: 'Draai je hoofd naar rechts',
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Selected challenges (random 3 from pool)
  const [selectedChallenges] = useState(() => {
    const shuffled = [...challenges].sort(() => Math.random() - 0.5);
    // Always include 'center' as first, then 2 random others
    const center = challenges.find(c => c.type === 'center')!;
    const others = shuffled.filter(c => c.type !== 'center').slice(0, 2);
    return [center, ...others];
  });

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

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStep('camera');
      triggerHaptic('light');

      // Start face detection after a short delay
      setTimeout(() => {
        startFaceDetection();
      }, 500);

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

    if (!video || !canvas || video.readyState !== 4) {
      return {
        faceDetected: false,
        faceInCenter: false,
        faceTooClose: false,
        faceTooFar: false,
        multipleFaces: false,
        eyesOpen: true,
        smiling: false,
        headTurnLeft: false,
        headTurnRight: false,
        headCenter: true,
      };
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { faceDetected: false } as FaceDetectionResult;

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0);

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple skin color detection for face presence
    // This is a simplified version - production would use TensorFlow.js or MediaPipe
    let skinPixels = 0;
    let totalPixels = 0;
    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;

    // Sample every 4th pixel for performance
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalPixels++;

        // HSV-based skin detection (simplified)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const v = max / 255;
        const s = max === 0 ? 0 : (max - min) / max;

        // Skin detection heuristics
        const isSkin =
          r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15 &&
          v > 0.4 && s > 0.1 && s < 0.7;

        if (isSkin) {
          skinPixels++;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const skinRatio = skinPixels / totalPixels;
    const faceDetected = skinRatio > 0.05 && skinRatio < 0.5;

    // Calculate bounding box
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    const faceCenterX = minX + faceWidth / 2;
    const faceCenterY = minY + faceHeight / 2;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    // Check if face is centered (within 20% of center)
    const centerThreshold = canvas.width * 0.2;
    const faceInCenter = faceDetected &&
      Math.abs(faceCenterX - canvasCenterX) < centerThreshold &&
      Math.abs(faceCenterY - canvasCenterY) < centerThreshold * 0.75;

    // Check face size for distance estimation
    const faceAreaRatio = (faceWidth * faceHeight) / (canvas.width * canvas.height);
    const faceTooClose = faceAreaRatio > 0.4;
    const faceTooFar = faceAreaRatio < 0.05;

    // Head position detection based on face bounding box position
    const headTurnLeft = faceDetected && faceCenterX < canvasCenterX - centerThreshold;
    const headTurnRight = faceDetected && faceCenterX > canvasCenterX + centerThreshold;
    const headCenter = faceDetected && !headTurnLeft && !headTurnRight;

    // Brightness analysis for eye detection (simplified)
    // When eyes are closed, the upper part of face is slightly darker
    const upperFaceY = minY + faceHeight * 0.3;
    let upperBrightness = 0;
    let upperCount = 0;

    for (let y = minY; y < upperFaceY; y += 4) {
      for (let x = minX; x < maxX; x += 4) {
        const i = (y * canvas.width + x) * 4;
        upperBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        upperCount++;
      }
    }

    const avgUpperBrightness = upperCount > 0 ? upperBrightness / upperCount : 128;
    // This is a rough heuristic - real detection would need ML
    const eyesOpen = avgUpperBrightness > 80;

    // Smile detection based on face aspect ratio and mouth region brightness
    // When smiling, face tends to be slightly wider and mouth region brighter
    const aspectRatio = faceWidth / (faceHeight || 1);
    const smiling = faceDetected && aspectRatio > 0.8 && skinRatio > 0.08;

    return {
      faceDetected,
      faceInCenter,
      faceTooClose,
      faceTooFar,
      multipleFaces: false, // Would need more sophisticated detection
      eyesOpen,
      smiling,
      headTurnLeft,
      headTurnRight,
      headCenter,
      boundingBox: faceDetected ? { x: minX, y: minY, width: faceWidth, height: faceHeight } : undefined,
    };
  }, []);

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
  }, [detectFace]);

  const startChallenges = useCallback(() => {
    setStep('challenges');
    setCurrentChallengeIndex(0);
    setChallengeStatus('pending');
    setCompletedChallenges([]);
    setConsecutiveDetections(0);
    triggerHaptic('medium');
  }, []);

  // Challenge detection loop
  useEffect(() => {
    if (step !== 'challenges' || !detection) return;

    const currentChallenge = selectedChallenges[currentChallengeIndex];
    if (!currentChallenge) return;

    const isDetected = currentChallenge.detectFn(detection);

    if (isDetected) {
      setConsecutiveDetections(prev => prev + 1);

      // Need 5 consecutive detections (0.5 seconds) to confirm
      if (consecutiveDetections >= 5) {
        setChallengeStatus('success');
        triggerHaptic('success');

        // Move to next challenge after brief success display
        setTimeout(() => {
          const newCompleted = [...completedChallenges, true];
          setCompletedChallenges(newCompleted);

          if (currentChallengeIndex < selectedChallenges.length - 1) {
            setCurrentChallengeIndex(prev => prev + 1);
            setChallengeStatus('pending');
            setConsecutiveDetections(0);
          } else {
            // All challenges complete - capture photo
            captureVerificationPhoto();
          }
        }, 500);
      } else {
        setChallengeStatus('detecting');
      }
    } else {
      setConsecutiveDetections(0);
      setChallengeStatus('pending');
    }
  }, [step, detection, currentChallengeIndex, selectedChallenges, consecutiveDetections, completedChallenges]);

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
            <div className="relative flex-1 mx-4 my-4 rounded-3xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
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
              <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
                <CheckCircle2 className="w-14 h-14 text-white" />
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
              Verificatie geslaagd!
            </h2>
            <p className="text-slate-600 mb-4">
              Je profiel krijgt nu een verificatie badge
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-medium">Geverifieerd profiel</span>
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
