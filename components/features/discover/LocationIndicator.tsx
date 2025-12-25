'use client'

import { MapPin, Plane } from 'lucide-react'
import { motion } from 'framer-motion'

interface LocationIndicatorProps {
  effectiveCity: string
  effectivePostcode?: string | null
  isPassportActive: boolean
  passportExpiresAt?: Date | null
  onClick?: () => void
}

function timeRemaining(expiresAt: Date): string {
  const now = new Date()
  const diff = new Date(expiresAt).getTime() - now.getTime()

  if (diff <= 0) return 'verlopen'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} dag${days > 1 ? 'en' : ''}`
  if (hours > 0) return `${hours} uur`
  return 'bijna verlopen'
}

export function LocationIndicator({
  effectiveCity,
  effectivePostcode,
  isPassportActive,
  passportExpiresAt,
  onClick
}: LocationIndicatorProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-white/15 transition-colors cursor-pointer"
    >
      {isPassportActive ? (
        <>
          <Plane size={16} className="text-rose-400 flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-white truncate max-w-full">
              {effectiveCity}
            </span>
            {passportExpiresAt && (
              <span className="text-xs text-white/70">
                Nog {timeRemaining(passportExpiresAt)}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <MapPin size={16} className="text-white/80 flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-white truncate max-w-full">
              {effectiveCity}
            </span>
            {effectivePostcode && (
              <span className="text-xs text-white/70">
                {effectivePostcode}
              </span>
            )}
          </div>
        </>
      )}
    </motion.button>
  )
}
