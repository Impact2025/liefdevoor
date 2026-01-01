'use client'

/**
 * useAudioGuidance - Hook voor audio begeleiding in LVB mode
 *
 * Features:
 * - Speelt audio af voor een actie
 * - Fallback naar TTS als geen audio file
 * - Cache management voor audio bestanden
 * - Volume control
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

interface AudioGuidanceOptions {
  autoPlay?: boolean // Automatisch afspelen bij mount
  volume?: number // 0-1
  rate?: number // Speech rate voor TTS
}

interface AudioGuidanceReturn {
  play: () => void
  stop: () => void
  isPlaying: boolean
  isLoading: boolean
  error: string | null
}

// Audio cache om herhaald laden te voorkomen
const audioCache = new Map<string, HTMLAudioElement>()

export function useAudioGuidance(
  text: string,
  audioUrl?: string,
  options: AudioGuidanceOptions = {}
): AudioGuidanceReturn {
  const { speakForced, stopSpeaking, isSpeaking, isLVBMode } = useAccessibility()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { autoPlay = false, volume = 1, rate = 0.8 } = options

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && isLVBMode) {
      play()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, isLVBMode])

  const play = useCallback(() => {
    setError(null)

    // If using pre-recorded audio
    if (audioUrl) {
      // Check cache first
      if (audioCache.has(audioUrl)) {
        audioRef.current = audioCache.get(audioUrl)!
      } else {
        setIsLoading(true)
        audioRef.current = new Audio(audioUrl)
        audioRef.current.volume = volume

        audioRef.current.oncanplaythrough = () => {
          setIsLoading(false)
          audioCache.set(audioUrl, audioRef.current!)
        }

        audioRef.current.onerror = () => {
          setIsLoading(false)
          setError('Audio kon niet worden geladen')
          // Fallback to TTS
          speakForced(text)
        }
      }

      audioRef.current!.onended = () => setIsPlaying(false)

      if (isPlaying) {
        audioRef.current!.pause()
        audioRef.current!.currentTime = 0
        setIsPlaying(false)
      } else {
        audioRef.current!.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            setError('Audio kon niet worden afgespeeld')
            console.error('Audio playback error:', err)
            // Fallback to TTS
            speakForced(text)
          })
      }
    } else if (text) {
      // Use TTS
      if (isSpeaking) {
        stopSpeaking()
        setIsPlaying(false)
      } else {
        speakForced(text)
        setIsPlaying(true)
      }
    }
  }, [audioUrl, text, volume, isPlaying, isSpeaking, speakForced, stopSpeaking])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    stopSpeaking()
    setIsPlaying(false)
  }, [stopSpeaking])

  // Track TTS speaking state
  useEffect(() => {
    if (!audioUrl && !isSpeaking && isPlaying) {
      setIsPlaying(false)
    }
  }, [isSpeaking, isPlaying, audioUrl])

  return {
    play,
    stop,
    isPlaying: isPlaying || (isSpeaking && !audioUrl),
    isLoading,
    error,
  }
}

// Predefined audio guidance texts for common actions
export const GUIDANCE_TEXTS = {
  // Discover/Swipe actions
  like: 'Klik op deze knop om te laten zien dat je deze persoon leuk vindt. Als jullie elkaar allebei leuk vinden, krijg je een match!',
  dislike: 'Klik op deze knop om door te gaan naar de volgende persoon. Je kunt altijd later terugkomen.',
  superLike: 'Super Like! Dit is speciaal. De andere persoon ziet dat jij hen extra leuk vindt. Je hebt een beperkt aantal Super Likes.',

  // Chat actions
  sendMessage: 'Klik hier om je bericht te versturen. Controleer eerst of je tevreden bent met wat je hebt geschreven.',
  voiceMessage: 'Houd deze knop ingedrukt om een spraakbericht op te nemen. Laat los om te stoppen.',

  // Profile actions
  editProfile: 'Klik hier om je profiel aan te passen. Je kunt je foto, naam en wat je over jezelf vertelt veranderen.',
  viewProfile: 'Klik hier om het volledige profiel van deze persoon te bekijken.',

  // Safety warnings
  warningPrivateInfo: 'Pas op! Je staat op het punt om privégegevens zoals een telefoonnummer of bankrekening te delen. Dit kan gevaarlijk zijn. Weet je het zeker?',
  warningScam: 'Let op! Dit bericht bevat mogelijk verdachte inhoud. Deel nooit geld of persoonlijke gegevens met iemand die je niet kent.',

  // Onboarding steps
  onboardingPhoto: 'In deze stap upload je een foto van jezelf. Kies een duidelijke foto waarop je goed te zien bent.',
  onboardingGoal: 'Wat zoek je? Kies of je op zoek bent naar vriendschap, een relatie, of allebei.',
  onboardingPersonality: 'Beantwoord deze vragen over jezelf. Er zijn geen foute antwoorden, wees gewoon eerlijk!',
  onboardingComplete: 'Gefeliciteerd! Je profiel is klaar. Je kunt nu beginnen met het ontdekken van andere mensen.',
}

export default useAudioGuidance
