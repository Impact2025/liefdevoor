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
      title={isPassportActive ? `${effectiveCity} via Passport` : effectiveCity} // Tooltip
      className={`
        relative group
        bg-white/10 backdrop-blur-md rounded-xl px-3 py-2
        flex items-center gap-2
        hover:bg-white/20 transition-all
        cursor-pointer
        ${isPassportActive ? 'ring-2 ring-rose-400/50' : ''}
      `}
    >
      {/* Icon with visual accent */}
      <div className={`
        flex-shrink-0
        ${isPassportActive ? 'animate-pulse' : ''}
      `}>
        {isPassportActive ? (
          <Plane size={16} className="text-rose-400" />
        ) : (
          <MapPin size={16} className="text-white/80" />
        )}
      </div>

      {/* Postcode only (compact!) */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-white whitespace-nowrap">
          {effectivePostcode || effectiveCity}
        </span>

        {/* Passport timer badge */}
        {isPassportActive && passportExpiresAt && (
          <span className="text-xs px-1.5 py-0.5 bg-rose-500/80 rounded text-white whitespace-nowrap">
            {timeRemaining(passportExpiresAt)}
          </span>
        )}
      </div>

      {/* Hover tooltip - shows full city name */}
      <div className="
        absolute top-full left-1/2 -translate-x-1/2 mt-2
        bg-gray-900 text-white text-xs py-1 px-2 rounded
        opacity-0 group-hover:opacity-100
        transition-opacity pointer-events-none
        whitespace-nowrap z-50
      ">
        {effectiveCity}
      </div>
    </motion.button>
  )
}
