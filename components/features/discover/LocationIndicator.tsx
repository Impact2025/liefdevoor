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
  const tooltipText = isPassportActive
    ? `✈️ ${effectiveCity}${passportExpiresAt ? ` • Nog ${timeRemaining(passportExpiresAt)}` : ''}`
    : `📍 ${effectiveCity}${effectivePostcode ? ` (${effectivePostcode})` : ''}`

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      title={tooltipText}
      className={`
        relative group
        w-10 h-10
        bg-white/10 backdrop-blur-md rounded-xl
        flex items-center justify-center
        hover:bg-white/20 transition-all
        cursor-pointer
        ${isPassportActive ? 'ring-2 ring-rose-400/60 shadow-lg shadow-rose-400/20' : ''}
      `}
    >
      {/* Icon only - ultra minimal */}
      <div className={`
        flex-shrink-0
        ${isPassportActive ? 'animate-pulse' : ''}
      `}>
        {isPassportActive ? (
          <Plane size={18} className="text-rose-400" />
        ) : (
          <MapPin size={18} className="text-white/80" />
        )}
      </div>

      {/* Active indicator dot */}
      {isPassportActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-gray-900 animate-pulse" />
      )}

      {/* Hover tooltip - shows full info */}
      <div className="
        absolute top-full left-1/2 -translate-x-1/2 mt-2
        bg-gray-900 text-white text-xs py-1.5 px-2.5 rounded-lg
        opacity-0 group-hover:opacity-100
        transition-opacity pointer-events-none
        whitespace-nowrap z-50
        shadow-xl
      ">
        {tooltipText}
      </div>
    </motion.button>
  )
}
