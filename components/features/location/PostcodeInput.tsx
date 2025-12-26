/**
 * PostcodeInput Component
 *
 * Wereldklasse Dutch postcode input with:
 * - Auto-formatting (1234AB → 1234 AB)
 * - Real-time validation
 * - Error messaging
 * - Geocoding integration
 */

'use client'

import { useState, useEffect } from 'react'
import { MapPin, Check, X } from 'lucide-react'
import { isValidDutchPostcode, formatDutchPostcode, geocodePostcodeClient } from '@/lib/services/geocoding'
import type { GeocodingResult } from '@/lib/services/geocoding'

interface PostcodeInputProps {
  value: string
  onChange: (value: string) => void
  onGeocode?: (result: GeocodingResult) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  autoGeocode?: boolean // Auto-geocode when valid postcode entered
}

export function PostcodeInput({
  value,
  onChange,
  onGeocode,
  className = '',
  placeholder = '1012 AB',
  disabled = false,
  autoGeocode = true,
}: PostcodeInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Validate postcode when it changes
  useEffect(() => {
    if (!value || value.length < 6) {
      setIsValid(null)
      setErrorMessage('')
      return
    }

    const cleaned = value.replace(/\s/g, '')

    if (cleaned.length === 6) {
      const valid = isValidDutchPostcode(cleaned)
      setIsValid(valid)

      if (!valid) {
        setErrorMessage('Ongeldige postcode (formaat: 1234 AB)')
      } else {
        setErrorMessage('')

        // Auto-geocode if enabled
        if (autoGeocode && onGeocode) {
          handleGeocode(cleaned)
        }
      }
    }
  }, [value, autoGeocode, onGeocode])

  const handleGeocode = async (postcode: string) => {
    if (!onGeocode) return

    setIsValidating(true)
    try {
      const result = await geocodePostcodeClient(postcode)

      if (result) {
        onGeocode(result)
      } else {
        setErrorMessage('Postcode niet gevonden')
        setIsValid(false)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setErrorMessage('Fout bij ophalen locatie')
    } finally {
      setIsValidating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.toUpperCase()

    // Remove all spaces first
    let cleaned = input.replace(/\s/g, '')

    // Limit to 6 characters (4 digits + 2 letters)
    cleaned = cleaned.slice(0, 6)

    // Only allow digits for first 4 chars, letters for last 2
    const digits = cleaned.slice(0, 4).replace(/[^0-9]/g, '')
    const letters = cleaned.slice(4, 6).replace(/[^A-Z]/g, '')
    cleaned = digits + letters

    // Auto-format with space after 4 digits
    if (cleaned.length > 4) {
      input = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
    } else {
      input = cleaned
    }

    onChange(input)
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin size={20} />
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || isValidating}
          maxLength={7} // "1234 AB" = 7 chars
          className={`
            w-full pl-11 pr-11 py-3 rounded-xl border-2 font-medium
            transition-all duration-200
            ${isValid === true ? 'border-green-500 bg-green-50' : ''}
            ${isValid === false ? 'border-red-500 bg-red-50' : ''}
            ${isValid === null ? 'border-gray-300 bg-white' : ''}
            ${disabled || isValidating ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
            placeholder:text-gray-400
          `}
        />

        {/* Validation indicator */}
        {isValidating && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isValidating && isValid === true && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <Check size={20} />
          </div>
        )}

        {!isValidating && isValid === false && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <X size={20} />
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <X size={14} />
          {errorMessage}
        </p>
      )}

      {/* Helper text */}
      {!errorMessage && !isValid && (
        <p className="mt-2 text-sm text-gray-500">
          Vul je postcode in (bijv. 1012 AB)
        </p>
      )}
    </div>
  )
}
