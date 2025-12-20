/**
 * Textarea Component
 *
 * Multi-line text input with character counter
 */

import React, { forwardRef, TextareaHTMLAttributes, useState } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  showCharCount?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      showCharCount = false,
      resize = 'vertical',
      className = '',
      disabled,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const baseClasses = 'px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2'
    const normalClasses = 'border-gray-300 focus:border-rose-500 focus:ring-rose-500/20'
    const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed'
    const widthClass = fullWidth ? 'w-full' : ''
    const resizeClass = `resize-${resize}`

    const textareaClasses = `
      ${baseClasses}
      ${error ? errorClasses : normalClasses}
      ${disabled ? disabledClasses : ''}
      ${widthClass}
      ${resizeClass}
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

        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />

        <div className="flex items-center justify-between mt-2">
          <div>
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p className={`text-sm ${charCount > maxLength ? 'text-red-600' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
