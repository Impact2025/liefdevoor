/**
 * Input Component
 *
 * Reusable text input with consistent styling and validation states
 */

import React, { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      endIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2'
    const normalClasses = 'border-gray-300 focus:border-rose-500 focus:ring-rose-500/20'
    const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed'
    const iconPadding = startIcon ? 'pl-11' : endIcon ? 'pr-11' : ''
    const widthClass = fullWidth ? 'w-full' : ''

    const inputClasses = `
      ${baseClasses}
      ${error ? errorClasses : normalClasses}
      ${disabled ? disabledClasses : ''}
      ${iconPadding}
      ${widthClass}
      ${className}
    `.trim().replace(/\s+/g, ' ')

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${props.id}-error`} className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
