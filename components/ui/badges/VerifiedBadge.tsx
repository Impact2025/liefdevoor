/**
 * VerifiedBadge - Photo Verification Badge
 *
 * Tinder/Bumble-style verification badge for profiles
 */

import { Shield, CheckCircle } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'shield' | 'check'
  showLabel?: boolean
  className?: string
}

export function VerifiedBadge({
  size = 'md',
  variant = 'shield',
  showLabel = false,
  className = '',
}: VerifiedBadgeProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const Icon = variant === 'shield' ? Shield : CheckCircle

  if (showLabel) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full ${className}`}>
        <Icon className={sizes[size]} />
        <span className="text-xs font-bold">Geverifieerd</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center justify-center bg-blue-500 rounded-full p-0.5 ${className}`}>
      <Icon className={`${sizes[size]} text-white`} fill="white" />
    </div>
  )
}
