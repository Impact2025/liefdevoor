/**
 * Checkbox Component
 *
 * Styled checkbox with label support
 */

import React, { forwardRef, InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  error?: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, className = '', disabled, ...props }, ref) => {
    const checkboxClasses = `
      w-5 h-5 rounded border-2 border-gray-300
      text-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-0
      transition-colors cursor-pointer
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${error ? 'border-red-500' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ')

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={checkboxClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={props.id}
                className={`
                  text-sm font-medium text-gray-700
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-red-600 mt-1" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
