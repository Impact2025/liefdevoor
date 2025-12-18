/**
 * useMatches Hook
 *
 * Fetch and manage user matches with real-time updates.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Match, ApiResponse } from '@/lib/types'

interface UseMatchesResult {
  matches: Match[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to get user's matches
 *
 * @returns Matches data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { matches, isLoading, error, refetch } = useMatches()
 *
 * if (isLoading) return <LoadingSkeleton />
 * if (error) return <ErrorAlert error={error} />
 *
 * return (
 *   <MatchList matches={matches} onUpdate={refetch} />
 * )
 * ```
 */
export function useMatches(): UseMatchesResult {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/matches')

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`)
      }

      const data: ApiResponse<{ matches: Match[] }> = await response.json()

      if (data.success && data.data) {
        setMatches(data.data.matches)
      } else {
        throw new Error(data.error?.message || 'Failed to load matches')
      }
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setMatches([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  return {
    matches,
    isLoading,
    error,
    refetch: fetchMatches,
  }
}
