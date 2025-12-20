/**
 * LoadingSpinner Component
 *
 * Animated loading spinner with size variants.
 * Can be used standalone or inside buttons.
 */

'use client'

import React from 'react'

export interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Optional label text */
  label?: string
  /** Center in container */
  centered?: boolean
  /** Custom color class */
  className?: string
}

/**
 * Loading spinner component
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" label="Loading..." />
 *
 * <LoadingSpinner size="lg" centered />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  label,
  centered = false,
  className = '',
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinnerColor = className || 'text-rose-500'

  const containerClasses = centered
    ? 'flex flex-col items-center justify-center min-h-[200px]'
    : 'flex items-center gap-2'

  return (
    <div className={containerClasses}>
      <svg
        className={`animate-spin ${sizeStyles[size]} ${spinnerColor}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span className="text-gray-600 text-sm">{label}</span>
      )}
    </div>
  )
}

/**
 * Page Loading - Full page loading state
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  )
}

/**
 * Inline Loading - Small inline loader
 */
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}
