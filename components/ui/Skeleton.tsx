/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation
 */

import React from 'react'

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
  animate?: boolean
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  animate = true,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const widthStyle = width ? (typeof width === 'number' ? `${width}px` : width) : undefined
  const heightStyle = height ? (typeof height === 'number' ? `${height}px` : height) : undefined

  return (
    <div
      className={`
        bg-gray-200
        ${variantClasses[variant]}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
      aria-busy="true"
      aria-live="polite"
    />
  )
}

/**
 * Pre-built skeleton layouts
 */

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <Skeleton variant="rectangular" height={300} className="rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="75%" height={24} />
        <Skeleton variant="text" width="50%" height={16} />
        <div className="flex gap-2 mt-4">
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={80} height={32} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="80%" height={14} />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProfile key={i} />
      ))}
    </div>
  )
}
