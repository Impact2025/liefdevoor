/**
 * Badge Component
 *
 * Small status indicators and labels
 */

import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-stone-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }

  const badgeClasses = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <span className={badgeClasses}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

/**
 * Notification Badge Component
 *
 * Number badge for notifications (e.g., unread count)
 */
export interface NotificationBadgeProps {
  count: number
  max?: number
  show?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

export function NotificationBadge({
  count,
  max = 99,
  show = true,
  position = 'top-right',
  className = '',
}: NotificationBadgeProps) {
  if (!show || count <= 0) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  }

  return (
    <span
      className={`
        absolute ${positionClasses[position]}
        flex items-center justify-center
        min-w-[1.25rem] h-5 px-1
        bg-red-500 text-white
        text-xs font-bold
        rounded-full
        ring-2 ring-white
        ${className}
      `}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  )
}
