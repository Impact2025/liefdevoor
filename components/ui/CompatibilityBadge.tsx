/**
 * Compatibility Score Badge
 *
 * Shows match percentage with color coding
 */

import React from 'react'

export interface CompatibilityBadgeProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CompatibilityBadge({
  score,
  showLabel = true,
  size = 'md',
  className = '',
}: CompatibilityBadgeProps) {
  // Color coding based on score
  const getColorClass = (s: number) => {
    if (s >= 80) return 'bg-green-500 text-white'
    if (s >= 60) return 'bg-green-400 text-white'
    if (s >= 40) return 'bg-yellow-400 text-gray-900'
    return 'bg-gray-300 text-gray-700'
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[2rem]',
    md: 'text-sm px-2 py-1 min-w-[2.5rem]',
    lg: 'text-base px-3 py-1.5 min-w-[3rem]',
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-1
        font-bold rounded-full
        ${getColorClass(score)}
        ${sizeClasses[size]}
        ${className}
      `}
      title={`${score}% match`}
    >
      {score}%
      {showLabel && size !== 'sm' && (
        <span className="font-normal text-xs opacity-80">match</span>
      )}
    </span>
  )
}
