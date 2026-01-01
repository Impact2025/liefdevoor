'use client'

/**
 * GuidanceButton - LVB-vriendelijke knop met audio begeleiding
 *
 * Features:
 * - Grote knop (min 56px) met icoon + tekst
 * - "Luister uitleg" knop met audio
 * - Framer Motion "ademende" animatie bij hover
 * - Ondersteunt TTS of pre-recorded audio
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, Loader2 } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

interface GuidanceButtonProps {
  label: string
  icon: React.ReactNode
  audioText?: string // Text voor TTS uitleg
  audioUrl?: string // URL naar pre-recorded audio
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'normal' | 'large' | 'xlarge'
  disabled?: boolean
  loading?: boolean
  showAudioButton?: boolean // Toon "Luister uitleg" knop
  className?: string
}

const variantStyles = {
  primary: {
    base: 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600',
    audio: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  },
  secondary: {
    base: 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50',
    audio: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  },
  danger: {
    base: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
    audio: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  success: {
    base: 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600',
    audio: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },
}

const sizeStyles = {
  normal: {
    button: 'p-4 text-lg min-h-[56px]',
    icon: 'scale-110',
    audio: 'text-sm px-3 py-1.5',
  },
  large: {
    button: 'p-5 text-xl min-h-[64px]',
    icon: 'scale-125',
    audio: 'text-base px-4 py-2',
  },
  xlarge: {
    button: 'p-6 text-2xl min-h-[72px]',
    icon: 'scale-150',
    audio: 'text-lg px-5 py-2.5',
  },
}

export function GuidanceButton({
  label,
  icon,
  audioText,
  audioUrl,
  onClick,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  showAudioButton = true,
  className = '',
}: GuidanceButtonProps) {
  const { speakForced, stopSpeaking, isSpeaking, isLVBMode } = useAccessibility()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Play audio explanation
  const playGuidance = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // If using pre-recorded audio
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl)
        audioRef.current.onended = () => setIsPlayingAudio(false)
        audioRef.current.onerror = () => {
          setIsPlayingAudio(false)
          // Fallback to TTS
          if (audioText) {
            speakForced(audioText)
          }
        }
      }

      if (isPlayingAudio) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlayingAudio(false)
      } else {
        audioRef.current.play()
        setIsPlayingAudio(true)
      }
    } else if (audioText) {
      // Use TTS
      if (isSpeaking) {
        stopSpeaking()
      } else {
        speakForced(audioText)
      }
    }
  }, [audioUrl, audioText, isPlayingAudio, isSpeaking, speakForced, stopSpeaking])

  const hasAudio = audioText || audioUrl
  const showAudio = showAudioButton && hasAudio && isLVBMode
  const isCurrentlyPlaying = isPlayingAudio || (isSpeaking && !audioUrl)

  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]

  return (
    <div className={`flex flex-col gap-3 items-center ${className}`}>
      {/* Audio help button */}
      <AnimatePresence>
        {showAudio && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={playGuidance}
            className={`
              flex items-center gap-2 rounded-full font-semibold
              transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
              ${sizes.audio} ${styles.audio}
            `}
            aria-label={isCurrentlyPlaying ? 'Stop uitleg' : 'Luister uitleg'}
          >
            {isCurrentlyPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Luister uitleg
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main action button */}
      <motion.button
        onClick={onClick}
        disabled={disabled || loading}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        animate={{
          // "Breathing" animation when hovered in LVB mode
          scale: isLVBMode && isHovered && !disabled ? [1, 1.02, 1] : 1,
        }}
        transition={{
          scale: {
            duration: 1.5,
            repeat: isLVBMode && isHovered ? Infinity : 0,
            ease: 'easeInOut',
          },
        }}
        className={`
          flex items-center justify-center gap-4 w-full rounded-2xl
          font-bold shadow-sm border-2 transition-all
          focus:outline-none focus:ring-4 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizes.button} ${styles.base}
          ${disabled ? '' : 'cursor-pointer'}
        `}
        aria-busy={loading}
        aria-disabled={disabled}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <span className={sizes.icon}>{icon}</span>
        )}
        <span>{label}</span>
      </motion.button>
    </div>
  )
}

// Preset button variations for common actions
export function LikeButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <GuidanceButton
      label="Leuk!"
      icon={<span className="text-2xl">❤️</span>}
      audioText="Klik op deze knop om te laten zien dat je deze persoon leuk vindt. Als jullie elkaar allebei leuk vinden, krijg je een match!"
      onClick={onClick}
      variant="success"
      size="xlarge"
      disabled={disabled}
      loading={loading}
    />
  )
}

export function DislikeButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <GuidanceButton
      label="Volgende"
      icon={<span className="text-2xl">👋</span>}
      audioText="Klik op deze knop om door te gaan naar de volgende persoon. Je kunt altijd later terugkomen."
      onClick={onClick}
      variant="secondary"
      size="large"
      disabled={disabled}
      loading={loading}
    />
  )
}

export function SuperLikeButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <GuidanceButton
      label="Super Leuk!"
      icon={<span className="text-2xl">⭐</span>}
      audioText="Super Like! Dit is speciaal. De andere persoon ziet dat jij hen extra leuk vindt. Je hebt een beperkt aantal Super Likes."
      onClick={onClick}
      variant="primary"
      size="xlarge"
      disabled={disabled}
      loading={loading}
    />
  )
}

export function MessageButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <GuidanceButton
      label="Stuur bericht"
      icon={<span className="text-2xl">💬</span>}
      audioText="Klik hier om een bericht te sturen naar deze persoon. Je kunt typen of een spraakbericht opnemen."
      onClick={onClick}
      variant="primary"
      size="large"
      disabled={disabled}
      loading={loading}
    />
  )
}

export default GuidanceButton
