/**
 * Alert Component
 *
 * Status messages and notifications
 */

import React from 'react'

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onClose?: () => void
  icon?: React.ReactNode
  className?: string
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  className = '',
}: AlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      title: 'text-blue-900',
      content: 'text-blue-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    success: {
      container: 'bg-green-50 border-green-200',
      title: 'text-green-900',
      content: 'text-green-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      title: 'text-yellow-900',
      content: 'text-yellow-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    error: {
      container: 'bg-red-50 border-red-200',
      title: 'text-red-900',
      content: 'text-red-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={`
        flex gap-3 p-4 rounded-lg border
        ${styles.container}
        ${className}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${styles.title}`}>
        {icon || styles.icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        {title && (
          <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
            {title}
          </h3>
        )}
        <div className={`text-sm ${styles.content}`}>
          {children}
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${styles.title} hover:opacity-70 transition-opacity`}
          aria-label="Close alert"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
