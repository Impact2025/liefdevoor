/**
 * Video Verification Component
 *
 * Guides users through liveness detection verification
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react'

interface Challenge {
  type: 'blink' | 'smile' | 'turn_left' | 'turn_right' | 'nod'
  instruction: string
  duration: number
}

interface VerificationState {
  status: 'idle' | 'loading' | 'ready' | 'recording' | 'processing' | 'success' | 'failed'
  challenges: Challenge[]
  currentChallenge: number
  error?: string
  failureReasons?: string[]
}

export function VideoVerification() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const framesRef = useRef<string[]>([])

  const [state, setState] = useState<VerificationState>({
    status: 'idle',
    challenges: [],
    currentChallenge: 0,
  })
  const [countdown, setCountdown] = useState(0)
  const [progress, setProgress] = useState(0)

  // Fetch challenges
  const loadChallenges = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }))

    try {
      const res = await fetch('/api/verification/video')
      const data = await res.json()

      if (data.alreadyVerified) {
        setState((s) => ({ ...s, status: 'success' }))
        return
      }

      setState((s) => ({
        ...s,
        status: 'ready',
        challenges: data.challenges,
        currentChallenge: 0,
      }))
    } catch (error) {
      setState((s) => ({
        ...s,
        status: 'failed',
        error: 'Kon verificatie niet starten',
      }))
    }
  }, [])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      return true
    } catch (error) {
      setState((s) => ({
        ...s,
        status: 'failed',
        error: 'Geen toegang tot camera. Geef toestemming en probeer opnieuw.',
      }))
      return false
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  // Capture frame
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    const cameraStarted = await startCamera()
    if (!cameraStarted) return

    setState((s) => ({ ...s, status: 'recording' }))
    framesRef.current = []
    setProgress(0)

    // Wait for video to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Record for each challenge
    const { challenges } = state
    let totalDuration = challenges.reduce((sum, c) => sum + c.duration, 0)
    let elapsed = 0

    for (let i = 0; i < challenges.length; i++) {
      setState((s) => ({ ...s, currentChallenge: i }))
      const challenge = challenges[i]

      // Countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      setCountdown(0)

      // Capture frames during challenge
      const framesPerSecond = 5
      const totalFrames = challenge.duration * framesPerSecond

      for (let f = 0; f < totalFrames; f++) {
        const frame = captureFrame()
        if (frame) {
          framesRef.current.push(frame)
        }
        elapsed += 1 / framesPerSecond
        setProgress((elapsed / totalDuration) * 100)
        await new Promise((resolve) => setTimeout(resolve, 1000 / framesPerSecond))
      }
    }

    // Process verification
    setState((s) => ({ ...s, status: 'processing' }))
    stopCamera()
    await submitVerification()
  }, [state.challenges, startCamera, stopCamera, captureFrame])

  // Submit verification
  const submitVerification = useCallback(async () => {
    try {
      const res = await fetch('/api/verification/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenges: state.challenges,
          frames: framesRef.current,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setState((s) => ({ ...s, status: 'success' }))
      } else {
        setState((s) => ({
          ...s,
          status: 'failed',
          failureReasons: data.reasons,
        }))
      }
    } catch (error) {
      setState((s) => ({
        ...s,
        status: 'failed',
        error: 'Verificatie mislukt. Probeer opnieuw.',
      }))
    }
  }, [state.challenges])

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Initial load
  useEffect(() => {
    loadChallenges()
  }, [loadChallenges])

  const currentChallenge = state.challenges[state.currentChallenge]

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Video Verificatie</h2>
        <p className="text-gray-600 mt-2">
          Bewijs dat je echt bent met een korte video
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Video Container */}
        <div className="relative aspect-[4/3] bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay for different states */}
          <AnimatePresence>
            {state.status === 'idle' || state.status === 'loading' ? (
              <motion.div
                className="absolute inset-0 bg-gray-900 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Camera wordt voorbereid...</p>
                </div>
              </motion.div>
            ) : null}

            {countdown > 0 && (
              <motion.div
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="text-8xl font-bold text-white"
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                >
                  {countdown}
                </motion.span>
              </motion.div>
            )}

            {state.status === 'recording' && countdown === 0 && currentChallenge && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-white text-xl font-medium text-center">
                  {currentChallenge.instruction}
                </p>
              </motion.div>
            )}

            {state.status === 'processing' && (
              <motion.div
                className="absolute inset-0 bg-black/70 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center text-white">
                  <motion.div
                    className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  />
                  <p>Verificatie wordt verwerkt...</p>
                </div>
              </motion.div>
            )}

            {state.status === 'success' && (
              <motion.div
                className="absolute inset-0 bg-green-500/90 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-2xl font-bold">Geverifieerd!</p>
                  <p className="mt-2 opacity-80">Je profiel heeft nu een badge</p>
                </div>
              </motion.div>
            )}

            {state.status === 'failed' && (
              <motion.div
                className="absolute inset-0 bg-red-500/90 flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center text-white">
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl font-bold mb-2">Verificatie Mislukt</p>
                  {state.failureReasons && (
                    <ul className="text-sm opacity-80 space-y-1">
                      {state.failureReasons.map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  )}
                  {state.error && <p className="text-sm opacity-80">{state.error}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          {state.status === 'recording' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Face guide overlay */}
          {(state.status === 'ready' || state.status === 'recording') && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse
                  cx="50"
                  cy="45"
                  rx="25"
                  ry="32"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6">
          {state.status === 'ready' && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2">Instructies:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Zorg voor goede verlichting</li>
                  <li>• Houd je gezicht in het ovaal</li>
                  <li>• Volg de opdrachten op het scherm</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Je krijgt deze opdrachten:</h3>
                <div className="flex gap-2">
                  {state.challenges.map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                    >
                      {c.instruction}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={startRecording}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Start Verificatie
              </button>
            </div>
          )}

          {state.status === 'failed' && (
            <button
              onClick={() => {
                setState({
                  status: 'idle',
                  challenges: [],
                  currentChallenge: 0,
                })
                loadChallenges()
              }}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Opnieuw Proberen
            </button>
          )}

          {state.status === 'success' && (
            <button
              onClick={() => window.location.href = '/profile'}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Naar Profiel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
