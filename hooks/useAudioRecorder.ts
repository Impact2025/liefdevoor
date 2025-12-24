/**
 * useAudioRecorder Hook
 *
 * Custom hook for recording audio using the MediaRecorder API.
 * Supports recording, playback, and returns a blob for upload.
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseAudioRecorderReturn {
  // State
  isRecording: boolean
  isPaused: boolean
  isPlaying: boolean
  duration: number
  audioUrl: string | null
  audioBlob: Blob | null
  error: string | null

  // Actions
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  playAudio: () => void
  stopAudio: () => void
  resetRecording: () => void
}

export interface UseAudioRecorderOptions {
  maxDuration?: number // Maximum recording duration in seconds
  onRecordingComplete?: (blob: Blob, url: string) => void
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const { maxDuration = 60, onRecordingComplete } = options

  // State
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  // Reset recording state
  const resetRecording = useCallback(() => {
    cleanup()
    setIsRecording(false)
    setIsPaused(false)
    setIsPlaying(false)
    setDuration(0)
    setAudioUrl(null)
    setAudioBlob(null)
    setError(null)
    audioChunksRef.current = []
    mediaRecorderRef.current = null
  }, [cleanup])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      resetRecording()

      // Request microphone permission with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Optimize for speech (voice messages)
          channelCount: 1, // Mono instead of stereo (50% size reduction)
          sampleRate: 16000, // Lower sample rate for speech (vs 48000)
        }
      })
      streamRef.current = stream

      // Create MediaRecorder with OPUS codec for maximum compression
      // Opus @ 24kbps is optimal for speech quality vs size
      let mimeType = 'audio/webm;codecs=opus'
      let audioBitsPerSecond = 24000 // 24 kbps - optimal for speech

      // Fallback to supported formats
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else {
          mimeType = 'audio/ogg'
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond, // Force low bitrate for compression
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setIsRecording(false)
        setIsPaused(false)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Callback
        onRecordingComplete?.(blob, url)
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      startTimeRef.current = Date.now()

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)

    } catch (err) {
      console.error('Failed to start recording:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microfoontoegang geweigerd. Sta microfoontoegang toe in je browser.')
        } else if (err.name === 'NotFoundError') {
          setError('Geen microfoon gevonden. Sluit een microfoon aan.')
        } else {
          setError('Kon opname niet starten: ' + err.message)
        }
      } else {
        setError('Kon opname niet starten')
      }
    }
  }, [maxDuration, onRecordingComplete, resetRecording])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, isPaused])

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimeRef.current = Date.now() - (duration * 1000)

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)

        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)
    }
  }, [isRecording, isPaused, duration, maxDuration, stopRecording])

  // Play recorded audio
  const playAudio = useCallback(() => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
      }

      audio.play()
      setIsPlaying(true)
    }
  }, [audioUrl, isPlaying])

  // Stop playing audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [cleanup, audioUrl])

  return {
    isRecording,
    isPaused,
    isPlaying,
    duration,
    audioUrl,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playAudio,
    stopAudio,
    resetRecording,
  }
}

// Format duration as MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
