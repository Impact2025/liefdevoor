/**
 * CityAutocomplete Component
 *
 * Wereldklasse city autocomplete with:
 * - Fuzzy search through Dutch cities
 * - Province display
 * - Auto-fill coordinates
 * - Keyboard navigation
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Check } from 'lucide-react'
import { searchCities, type CityOption } from '@/lib/services/geocoding'

interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (city: CityOption) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  className = '',
  placeholder = 'Amsterdam, Rotterdam...',
  disabled = false,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CityOption[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Search cities when input changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchCities(value, 8)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setSelectedCity(null)
  }

  const handleSelectCity = (city: CityOption) => {
    onChange(city.name)
    setSelectedCity(city)
    setShowSuggestions(false)
    setSelectedIndex(-1)

    if (onSelect) {
      onSelect(city)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectCity(suggestions[selectedIndex])
        }
        break

      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {selectedCity ? <MapPin size={20} className="text-green-500" /> : <Search size={20} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-11 pr-4 py-3 rounded-xl border-2
            transition-all duration-200
            ${selectedCity ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
            placeholder:text-gray-400
          `}
        />

        {selectedCity && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <Check size={20} />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((city, index) => (
              <button
                key={`${city.name}-${city.province}`}
                type="button"
                onClick={() => handleSelectCity(city)}
                className={`
                  w-full px-4 py-3 text-left transition-colors
                  flex items-center justify-between gap-3
                  ${index === selectedIndex ? 'bg-rose-50' : 'hover:bg-gray-50'}
                  ${index !== 0 ? 'border-t border-gray-100' : ''}
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MapPin
                    size={16}
                    className={index === selectedIndex ? 'text-rose-500' : 'text-gray-400'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {city.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {city.province}
                    </div>
                  </div>
                </div>

                {city.population && (
                  <div className="text-xs text-gray-400 tabular-nums">
                    {(city.population / 1000).toFixed(0)}k
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Helper text */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Gebruik ↑↓ pijltjes en Enter om te selecteren
          </div>
        </div>
      )}

      {/* Helper text */}
      {!showSuggestions && !selectedCity && (
        <p className="mt-2 text-sm text-gray-500">
          Begin met typen om steden te zoeken
        </p>
      )}

      {selectedCity && (
        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <Check size={14} />
          {selectedCity.name}, {selectedCity.province}
        </p>
      )}
    </div>
  )
}
