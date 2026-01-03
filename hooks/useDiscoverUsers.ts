/**
 * useDiscoverUsers Hook
 *
 * Fetch and manage discover feed users with filters
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DiscoverUser, DiscoverFilters, ApiResponse, Pagination } from '@/lib/types'

interface ShowcaseInfo {
  enabled: boolean
  count: number
  realProfileCount: number
  message: string | null
}

interface UseDiscoverUsersResult {
  users: DiscoverUser[]
  setUsers: React.Dispatch<React.SetStateAction<DiscoverUser[]>>
  pagination: Pagination | null
  isLoading: boolean
  error: Error | null
  refetch: (filters?: DiscoverFilters) => Promise<void>
  hasMore: boolean
  showcase: ShowcaseInfo | null // 🎭 Showcase metadata
}

/**
 * Hook to fetch discover feed users
 *
 * @param initialFilters - Optional initial filters
 * @returns Discover users, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { users, isLoading, refetch, hasMore } = useDiscoverUsers({
 *   minAge: 25,
 *   maxAge: 35,
 *   gender: 'FEMALE'
 * })
 * ```
 */
export function useDiscoverUsers(
  initialFilters: DiscoverFilters = {}
): UseDiscoverUsersResult {
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<DiscoverFilters>(initialFilters)
  const [showcase, setShowcase] = useState<ShowcaseInfo | null>(null) // 🎭 Showcase state

  const fetchUsers = useCallback(async (newFilters?: DiscoverFilters) => {
    try {
      setIsLoading(true)
      setError(null)

      const currentFilters = newFilters || filters
      const params = new URLSearchParams()

      // Basic filters
      if (currentFilters.name) params.append('name', currentFilters.name)
      if (currentFilters.minAge) params.append('minAge', currentFilters.minAge.toString())
      if (currentFilters.maxAge) params.append('maxAge', currentFilters.maxAge.toString())
      if (currentFilters.gender) params.append('gender', currentFilters.gender)
      if (currentFilters.city) params.append('city', currentFilters.city)
      if (currentFilters.postcode) params.append('postcode', currentFilters.postcode)
      if (currentFilters.maxDistance) params.append('maxDistance', currentFilters.maxDistance.toString())
      if (currentFilters.page) params.append('page', currentFilters.page.toString())
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString())

      // Advanced filters - arrays to comma-separated strings
      if (currentFilters.smoking?.length) params.append('smoking', currentFilters.smoking.join(','))
      if (currentFilters.drinking?.length) params.append('drinking', currentFilters.drinking.join(','))
      if (currentFilters.children?.length) params.append('children', currentFilters.children.join(','))
      if (currentFilters.minHeight) params.append('minHeight', currentFilters.minHeight.toString())
      if (currentFilters.maxHeight) params.append('maxHeight', currentFilters.maxHeight.toString())
      if (currentFilters.education?.length) params.append('education', currentFilters.education.join(','))
      if (currentFilters.religion?.length) params.append('religion', currentFilters.religion.join(','))
      if (currentFilters.languages?.length) params.append('languages', currentFilters.languages.join(','))
      if (currentFilters.ethnicity?.length) params.append('ethnicity', currentFilters.ethnicity.join(','))
      if (currentFilters.interests?.length) params.append('interests', currentFilters.interests.join(','))
      if (currentFilters.sports?.length) params.append('sports', currentFilters.sports.join(','))
      if (currentFilters.relationshipGoal?.length) params.append('relationshipGoal', currentFilters.relationshipGoal.join(','))
      if (currentFilters.verifiedOnly) params.append('verifiedOnly', 'true')
      if (currentFilters.onlineRecently) params.append('onlineRecently', 'true')

      const response = await fetch(`/api/discover?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const data: ApiResponse<{ users: DiscoverUser[]; pagination: Pagination; showcase?: ShowcaseInfo }> =
        await response.json()

      if (data.success && data.data) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
        // 🎭 Store showcase metadata
        if (data.data.showcase) {
          setShowcase(data.data.showcase)
        } else {
          setShowcase(null)
        }
        if (newFilters) {
          setFilters(newFilters)
        }
      } else {
        throw new Error(data.error?.message || 'Failed to load users')
      }
    } catch (err) {
      console.error('Error fetching discover users:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, []) // Only fetch on mount, use refetch for updates

  return {
    users,
    setUsers,
    pagination,
    isLoading,
    error,
    refetch: fetchUsers,
    hasMore: pagination?.hasNextPage || false,
    showcase, // 🎭 Expose showcase metadata
  }
}
