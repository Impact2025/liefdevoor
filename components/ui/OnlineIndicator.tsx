/**
 * Online Indicator Component
 *
 * Shows online/offline status with a green dot
 */

import React from 'react'

export interface OnlineIndicatorProps {
  isOnline: boolean
  showText?: boolean
  lastSeenText?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OnlineIndicator({
  isOnline,
  showText = false,
  lastSeenText,
  size = 'md',
  className = '',
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const dotClass = isOnline
    ? 'bg-green-500 animate-pulse'
    : 'bg-gray-400'

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`${sizeClasses[size]} ${dotClass} rounded-full ring-2 ring-white`}
        aria-hidden="true"
      />
      {showText && (
        <span className={`${textSizeClasses[size]} ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
          {isOnline ? 'Online' : (lastSeenText || 'Offline')}
        </span>
      )}
    </span>
  )
}
