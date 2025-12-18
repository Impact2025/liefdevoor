/**
 * useCurrentUser Hook
 *
 * Fetch and manage the current authenticated user's profile.
 * Provides loading state, error handling, and revalidation.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserProfile, ApiResponse } from '@/lib/types'

interface UseCurrentUserResult {
  user: UserProfile | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to get the current user's profile
 *
 * @returns User data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { user, isLoading, error, refetch } = useCurrentUser()
 *
 * if (isLoading) return <LoadingSpinner />
 * if (error) return <ErrorMessage error={error} />
 * if (!user) return <LoginPrompt />
 *
 * return <ProfileView user={user} onUpdate={refetch} />
 * ```
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/profile')

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          setUser(null)
          return
        }
        throw new Error(`Failed to fetch user: ${response.statusText}`)
      }

      const data: ApiResponse<{ profile: UserProfile }> = await response.json()

      if (data.success && data.data) {
        setUser(data.data.profile)
      } else {
        throw new Error(data.error?.message || 'Failed to load user')
      }
    } catch (err) {
      console.error('Error fetching current user:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  }
}
