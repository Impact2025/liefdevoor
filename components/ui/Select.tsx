/**
 * Select Component
 *
 * Dropdown select input with consistent styling
 */

import React, { forwardRef, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      placeholder,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 appearance-none bg-white'
    const normalClasses = 'border-gray-300 focus:border-rose-500 focus:ring-rose-500/20'
    const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed'
    const widthClass = fullWidth ? 'w-full' : ''

    const selectClasses = `
      ${baseClasses}
      ${error ? errorClasses : normalClasses}
      ${disabled ? disabledClasses : ''}
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
          <select
            ref={ref}
            disabled={disabled}
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select'
