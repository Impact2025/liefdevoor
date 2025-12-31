'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react'

interface KennisbankSearchProps {
  placeholder?: string
  variant?: 'default' | 'hero' | 'minimal'
  className?: string
  autoFocus?: boolean
}

const popularSearches = [
  'scam herkennen',
  'eerste date tips',
  'ghosting',
  'liefdetalen',
  'profiel tips',
]

const recentSearchesKey = 'kennisbank-recent-searches'

export default function KennisbankSearch({
  placeholder = 'Zoek in de kennisbank...',
  variant = 'default',
  className = '',
  autoFocus = false
}: KennisbankSearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(recentSearchesKey)
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const saveSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem(recentSearchesKey, JSON.stringify(updated))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearch(query)
      router.push(`/kennisbank/zoeken?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleQuickSearch = (term: string) => {
    setQuery(term)
    saveSearch(term)
    router.push(`/kennisbank/zoeken?q=${encodeURIComponent(term)}`)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(recentSearchesKey)
  }

  const baseInputClasses = 'w-full bg-transparent outline-none text-gray-900 placeholder-gray-500'

  if (variant === 'hero') {
    return (
      <div className={`relative ${className}`}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className={`w-full pl-14 pr-14 py-5 text-lg bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all ${baseInputClasses}`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Dropdown */}
        {isFocused && !query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Recent</p>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Wissen
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Populair
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-rose-100 hover:text-rose-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`pl-9 pr-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 ${baseInputClasses}`}
          />
        </div>
      </form>
    )
  }

  // Default variant
  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all ${baseInputClasses}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}
