/**
 * Text-to-Speech Component
 *
 * Accessible component that reads text aloud for visually impaired users
 * Uses Web Speech API (SpeechSynthesis)
 *
 * Features:
 * - Play/pause/stop controls
 * - Dutch language support
 * - Rate and pitch control
 * - Visual feedback during playback
 * - Keyboard accessible
 *
 * @example
 * ```tsx
 * <TextToSpeech text="Hallo, ik ben Jan, 68 jaar uit Amsterdam" />
 * ```
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useAdaptiveUI } from '@/components/adaptive/AdaptiveUIProvider'

// ============================================================================
// TYPES
// ============================================================================

interface TextToSpeechProps {
  text: string
  autoPlay?: boolean
  showControls?: boolean
  variant?: 'button' | 'icon' | 'minimal'
  label?: string
  rate?: number // 0.1 to 10, default 1
  pitch?: number // 0 to 2, default 1
  volume?: number // 0 to 1, default 1
  className?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TextToSpeech({
  text,
  autoPlay = false,
  showControls = true,
  variant = 'button',
  label = 'Lees voor',
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
  className = '',
  onStart,
  onEnd,
  onError,
}: TextToSpeechProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { preferences, announceToScreenReader } = useAdaptiveUI()

  // ============================================================================
  // CHECK BROWSER SUPPORT
  // ============================================================================

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
    } else {
      console.warn('Text-to-Speech not supported in this browser')
    }
  }, [])

  // ============================================================================
  // AUTO-PLAY
  // ============================================================================

  useEffect(() => {
    if (autoPlay && isSupported && preferences.textToSpeech && text) {
      const timer = setTimeout(() => {
        handlePlay()
      }, 500) // Small delay for better UX
      return () => clearTimeout(timer)
    }
  }, [autoPlay, isSupported, preferences.textToSpeech, text])

  // ============================================================================
  // SPEECH HANDLERS
  // ============================================================================

  const handlePlay = useCallback(() => {
    if (!isSupported || !text) return

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'nl-NL' // Dutch language
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
        announceToScreenReader('Voorlezen gestart')
        onStart?.()
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        announceToScreenReader('Voorlezen voltooid')
        onEnd?.()
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        setIsSpeaking(false)
        setIsPaused(false)
        const error = new Error(`Speech synthesis error: ${event.error}`)
        onError?.(error)
      }

      utterance.onpause = () => {
        setIsPaused(true)
        announceToScreenReader('Voorlezen gepauzeerd')
      }

      utterance.onresume = () => {
        setIsPaused(false)
        announceToScreenReader('Voorlezen hervat')
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Error starting speech synthesis:', error)
      onError?.(error as Error)
    }
  }, [isSupported, text, rate, pitch, volume, announceToScreenReader, onStart, onEnd, onError])

  const handlePause = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [isSupported])

  const handleResume = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [isSupported])

  const handleStop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    announceToScreenReader('Voorlezen gestopt')
  }, [isSupported, announceToScreenReader])

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Don't render if not supported or TTS is disabled
  if (!isSupported || !preferences.textToSpeech) {
    return null
  }

  // Minimal variant - just icon, no controls
  if (variant === 'minimal') {
    return (
      <button
        onClick={isSpeaking ? handleStop : handlePlay}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors focus-ring ${className}`}
        aria-label={isSpeaking ? 'Stop voorlezen' : label}
        type="button"
      >
        {isSpeaking ? (
          <VolumeX className="w-5 h-5 text-primary-aaa" />
        ) : (
          <Volume2 className="w-5 h-5 text-gray-600" />
        )}
      </button>
    )
  }

  // Icon variant - icon with pause/play toggle
  if (variant === 'icon') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!isSpeaking ? (
          <button
            onClick={handlePlay}
            className="p-3 rounded-full bg-primary-aaa hover:bg-primary-aaa-hover text-white transition-all focus-ring-aaa"
            aria-label={label}
            type="button"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={handleResume}
                className="p-3 rounded-full bg-success-aaa hover:bg-success-aaa-hover text-white transition-all focus-ring-aaa"
                aria-label="Hervat voorlezen"
                type="button"
              >
                <Play className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="p-3 rounded-full bg-success-aaa hover:bg-success-aaa-hover text-white transition-all focus-ring-aaa"
                aria-label="Pauzeer voorlezen"
                type="button"
              >
                <Pause className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleStop}
              className="p-3 rounded-full bg-danger-aaa hover:bg-danger-aaa-hover text-white transition-all focus-ring-aaa"
              aria-label="Stop voorlezen"
              type="button"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    )
  }

  // Button variant - full button with text
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isSpeaking ? (
        <button
          onClick={handlePlay}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-primary-aaa hover:bg-primary-aaa-hover text-white font-medium transition-all focus-ring-aaa min-h-touch"
          aria-label={label}
          type="button"
        >
          <Volume2 className="w-5 h-5" />
          <span>{label}</span>
        </button>
      ) : (
        <>
          {isPaused ? (
            <button
              onClick={handleResume}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-success-aaa hover:bg-success-aaa-hover text-white font-medium transition-all focus-ring-aaa min-h-touch"
              aria-label="Hervat voorlezen"
              type="button"
            >
              <Play className="w-5 h-5" />
              <span>Hervat</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-success-aaa hover:bg-success-aaa-hover text-white font-medium transition-all focus-ring-aaa min-h-touch"
              aria-label="Pauzeer voorlezen"
              type="button"
            >
              <Pause className="w-5 h-5" />
              <span>Pauzeer</span>
            </button>
          )}
          <button
            onClick={handleStop}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-danger-aaa hover:bg-danger-aaa-hover text-white font-medium transition-all focus-ring-aaa min-h-touch"
            aria-label="Stop voorlezen"
            type="button"
          >
            <VolumeX className="w-5 h-5" />
            <span>Stop</span>
          </button>
        </>
      )}
    </div>
  )
}

// ============================================================================
// PROFILE CARD TEXT-TO-SPEECH WRAPPER
// ============================================================================

interface ProfileTextToSpeechProps {
  profile: {
    name: string
    age: number
    city?: string
    bio?: string
    interests?: string[]
  }
  variant?: 'button' | 'icon' | 'minimal'
  className?: string
}

/**
 * Specialized TTS component for profile cards
 * Formats profile information into natural Dutch speech
 */
export function ProfileTextToSpeech({
  profile,
  variant = 'icon',
  className = ''
}: ProfileTextToSpeechProps) {
  const text = React.useMemo(() => {
    const parts: string[] = []

    // Name and age
    parts.push(`${profile.name}, ${profile.age} jaar`)

    // Location
    if (profile.city) {
      parts.push(`uit ${profile.city}`)
    }

    // Bio
    if (profile.bio) {
      parts.push(profile.bio)
    }

    // Interests
    if (profile.interests && profile.interests.length > 0) {
      parts.push(`Interesses: ${profile.interests.join(', ')}`)
    }

    return parts.join('. ')
  }, [profile])

  return (
    <TextToSpeech
      text={text}
      variant={variant}
      label="Lees profiel voor"
      className={className}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TextToSpeech
