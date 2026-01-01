'use client'

/**
 * VisualConsentBlock - Enkel visueel consent blok
 *
 * Onderdeel van het "Comic Contract" systeem voor LVB gebruikers.
 * Toont privacy/consent informatie met grote iconen en simpele tekst.
 */

import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

export type ConsentBlockType = 'what' | 'why' | 'who'

interface VisualConsentBlockProps {
  type: ConsentBlockType
  icon: React.ReactNode
  title: string
  description: string
  audioText?: string
}

const typeStyles: Record<ConsentBlockType, {
  bg: string
  border: string
  icon: string
  label: string
}> = {
  what: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    icon: 'bg-sky-500',
    label: 'WAT',
  },
  why: {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    icon: 'bg-rose-500',
    label: 'WAAROM',
  },
  who: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    icon: 'bg-emerald-500',
    label: 'WIE',
  },
}

export function VisualConsentBlock({
  type,
  icon,
  title,
  description,
  audioText,
}: VisualConsentBlockProps) {
  const { speakForced, isLVBMode } = useAccessibility()
  const styles = typeStyles[type]

  const handleAudioClick = () => {
    const text = audioText || `${styles.label}: ${title}. ${description}`
    speakForced(text)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative rounded-2xl border-2 p-6
        ${styles.bg} ${styles.border}
      `}
    >
      {/* Type label */}
      <div className={`
        absolute -top-3 left-4 px-3 py-1 rounded-full
        text-xs font-bold text-white uppercase tracking-wider
        ${styles.icon}
      `}>
        {styles.label}
      </div>

      <div className="flex items-start gap-4 pt-2">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center
          text-white ${styles.icon}
        `}>
          <span className="text-3xl">{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {title}
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Audio button for LVB mode */}
        {isLVBMode && (
          <button
            onClick={handleAudioClick}
            className={`
              flex-shrink-0 p-2 rounded-full transition-colors
              ${styles.bg} hover:opacity-80
            `}
            aria-label="Luister uitleg"
          >
            <Volume2 className="w-5 h-5 text-slate-600" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default VisualConsentBlock
