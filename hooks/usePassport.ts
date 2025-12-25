/**
 * usePassport Hook
 *
 * Complete state management for Passport feature:
 * - Current passport status
 * - Recent cities
 * - Favorite cities
 * - Live city search
 * - Activate/clear passport
 * - Add/remove favorites
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'

interface City {
  name: string
  lat: number
  lng: number
  province?: string
  distanceFromHome?: number | null
  population?: number
}

interface PassportCity {
  id?: string
  city: string
  latitude: number
  longitude: number
  distanceFromHome?: number | null
  usedAt?: string
  duration?: number
}

interface CurrentPassport {
  city: string
  latitude: number
  longitude: number
  expiresAt: string
}

interface HomeLocation {
  city: string | null
  latitude: number | null
  longitude: number | null
}

interface SearchResult {
  name: string
  lat: number
  lng: number
  province?: string
  type?: string
  postcode?: string
  population?: number
}

interface TrendingCity {
  city: string
  latitude: number
  longitude: number
  travelers: number
  distanceFromHome?: number | null
}

interface PassportData {
  hasFeature: boolean
  currentPassport: CurrentPassport | null
  homeLocation: HomeLocation
  recentCities: PassportCity[]
  favoriteCities: PassportCity[]
  popularCities: City[]
  trendingCities: TrendingCity[]
}

export function usePassport() {
  // Data state
  const [data, setData] = useState<PassportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Action states
  const [isActivating, setIsActivating] = useState(false)
  const [isAddingFavorite, setIsAddingFavorite] = useState(false)

  // Fetch passport data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/passport')
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Er ging iets mis')
      }

      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Search cities
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchCities = async () => {
      try {
        setIsSearching(true)
        const res = await fetch(`/api/passport/search?q=${encodeURIComponent(debouncedQuery)}`)
        const json = await res.json()

        if (res.ok && json.results) {
          setSearchResults(json.results)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }

    searchCities()
  }, [debouncedQuery])

  // Activate passport
  const activatePassport = useCallback(async (
    city: string,
    latitude: number,
    longitude: number,
    duration: number = 24
  ) => {
    try {
      setIsActivating(true)
      setError(null)

      const res = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, latitude, longitude, duration }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Er ging iets mis')
      }

      // Refresh data
      await fetchData()
      return { success: true, message: json.message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Er ging iets mis'
      setError(message)
      return { success: false, message }
    } finally {
      setIsActivating(false)
    }
  }, [fetchData])

  // Clear passport
  const clearPassport = useCallback(async () => {
    try {
      setIsActivating(true)
      setError(null)

      const res = await fetch('/api/passport', { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Er ging iets mis')
      }

      // Refresh data
      await fetchData()
      return { success: true, message: json.message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Er ging iets mis'
      setError(message)
      return { success: false, message }
    } finally {
      setIsActivating(false)
    }
  }, [fetchData])

  // Add favorite
  const addFavorite = useCallback(async (
    city: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      setIsAddingFavorite(true)
      setError(null)

      const res = await fetch('/api/passport/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, latitude, longitude }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Er ging iets mis')
      }

      // Refresh data
      await fetchData()
      return { success: true, message: json.message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Er ging iets mis'
      setError(message)
      return { success: false, message }
    } finally {
      setIsAddingFavorite(false)
    }
  }, [fetchData])

  // Remove favorite
  const removeFavorite = useCallback(async (city: string) => {
    try {
      setIsAddingFavorite(true)
      setError(null)

      const res = await fetch(`/api/passport/favorites?city=${encodeURIComponent(city)}`, {
        method: 'DELETE',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Er ging iets mis')
      }

      // Refresh data
      await fetchData()
      return { success: true, message: json.message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Er ging iets mis'
      setError(message)
      return { success: false, message }
    } finally {
      setIsAddingFavorite(false)
    }
  }, [fetchData])

  // Check if city is a favorite
  const isFavorite = useCallback((cityName: string) => {
    return data?.favoriteCities.some(f => f.city === cityName) ?? false
  }, [data?.favoriteCities])

  // Calculate hours remaining
  const hoursRemaining = data?.currentPassport?.expiresAt
    ? Math.max(0, Math.ceil((new Date(data.currentPassport.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0

  return {
    // State
    isLoading,
    error,
    hasFeature: data?.hasFeature ?? false,
    currentPassport: data?.currentPassport ?? null,
    homeLocation: data?.homeLocation ?? null,
    recentCities: data?.recentCities ?? [],
    favoriteCities: data?.favoriteCities ?? [],
    popularCities: data?.popularCities ?? [],
    trendingCities: data?.trendingCities ?? [],

    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,

    // Actions
    activatePassport,
    clearPassport,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchData,

    // Loading states
    isActivating,
    isAddingFavorite,

    // Computed
    isPassportActive: !!data?.currentPassport,
    hoursRemaining,
  }
}
