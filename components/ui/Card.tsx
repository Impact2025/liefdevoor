/**
 * Card Component
 *
 * Flexible card container with header, body, and footer sections.
 * Perfect for profile cards, match cards, blog posts, etc.
 */

'use client'

import React from 'react'

export interface CardProps {
  /** Card content */
  children: React.ReactNode
  /** Optional header content */
  header?: React.ReactNode
  /** Optional footer content */
  footer?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Click handler for interactive cards */
  onClick?: () => void
  /** Hover effect */
  hoverable?: boolean
}

/**
 * Card container component
 *
 * @example
 * ```tsx
 * <Card
 *   header={<h2>Profile</h2>}
 *   footer={<Button>Edit</Button>}
 *   hoverable
 * >
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  header,
  footer,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-md overflow-hidden'
  const hoverStyles = hoverable || onClick ? 'transition-shadow hover:shadow-lg cursor-pointer' : ''
  const classes = `${baseStyles} ${hoverStyles} ${className}`.trim()

  return (
    <div className={classes} onClick={onClick}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  )
}

/**
 * CardHeader - Semantic header component
 */
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  )
}

/**
 * CardBody - Semantic body component
 */
export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * CardFooter - Semantic footer component
 */
export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  )
}
