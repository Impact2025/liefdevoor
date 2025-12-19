'use client'

import { useState, useCallback } from 'react'

interface CompatibilityResult {
  compatibility: number
  factors: string[]
}

interface UseCompatibilityReturn {
  compatibility: CompatibilityResult | null
  isLoading: boolean
  error: string | null
  fetchCompatibility: (targetUserId: string) => Promise<void>
}

/**
 * Hook for fetching compatibility score with another user
 */
export function useCompatibility(): UseCompatibilityReturn {
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompatibility = useCallback(async (targetUserId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/discover/ranked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch compatibility')
      }

      const data = await response.json()
      setCompatibility(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    compatibility,
    isLoading,
    error,
    fetchCompatibility,
  }
}

/**
 * Get compatibility color based on percentage
 */
export function getCompatibilityColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-500'
  if (percentage >= 60) return 'text-yellow-500'
  if (percentage >= 40) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Get compatibility label based on percentage
 */
export function getCompatibilityLabel(percentage: number): string {
  if (percentage >= 80) return 'Uitstekend'
  if (percentage >= 60) return 'Goed'
  if (percentage >= 40) return 'Gemiddeld'
  return 'Laag'
}
