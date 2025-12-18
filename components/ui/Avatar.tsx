/**
 * Avatar Component
 *
 * User avatar with fallback to initials and different sizes
 */

import React from 'react'
import Image from 'next/image'

export interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
  status?: 'online' | 'offline' | 'away' | 'busy'
  className?: string
  onClick?: () => void
}

export function Avatar({
  src,
  alt,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  onClick,
}: AvatarProps) {
  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  }

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  }

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg'

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const containerClasses = `
    relative inline-flex items-center justify-center
    ${sizeClasses[size]}
    ${shapeClass}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={containerClasses} onClick={onClick}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${shapeClass}`}
          sizes={sizeClasses[size]}
        />
      ) : (
        <div
          className={`
            w-full h-full flex items-center justify-center
            bg-gradient-to-br from-primary-400 to-primary-600
            text-white font-semibold
            ${shapeClass}
          `}
        >
          {getInitials(alt)}
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            border-2 border-white
            rounded-full
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

/**
 * Avatar Group Component
 *
 * Display multiple avatars in a stack
 */
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null
    alt: string
  }>
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max)
  const remaining = Math.max(0, avatars.length - max)

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="ring-2 ring-white rounded-full"
          style={{ zIndex: displayAvatars.length - index }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${size === 'xs' ? 'w-6 h-6 text-xs' : ''}
            ${size === 'sm' ? 'w-8 h-8 text-sm' : ''}
            ${size === 'md' ? 'w-10 h-10 text-base' : ''}
            ${size === 'lg' ? 'w-12 h-12 text-lg' : ''}
            ${size === 'xl' ? 'w-16 h-16 text-xl' : ''}
            ${size === '2xl' ? 'w-24 h-24 text-2xl' : ''}
            flex items-center justify-center
            bg-gray-200 text-gray-600 font-semibold
            rounded-full ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
