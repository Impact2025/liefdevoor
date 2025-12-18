/**
 * useDiscoverUsers Hook
 *
 * Fetch and manage discover feed users with filters
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DiscoverUser, DiscoverFilters, ApiResponse, Pagination } from '@/lib/types'

interface UseDiscoverUsersResult {
  users: DiscoverUser[]
  setUsers: React.Dispatch<React.SetStateAction<DiscoverUser[]>>
  pagination: Pagination | null
  isLoading: boolean
  error: Error | null
  refetch: (filters?: DiscoverFilters) => Promise<void>
  hasMore: boolean
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

  const fetchUsers = useCallback(async (newFilters?: DiscoverFilters) => {
    try {
      setIsLoading(true)
      setError(null)

      const currentFilters = newFilters || filters
      const params = new URLSearchParams()

      if (currentFilters.name) params.append('name', currentFilters.name)
      if (currentFilters.minAge) params.append('minAge', currentFilters.minAge.toString())
      if (currentFilters.maxAge) params.append('maxAge', currentFilters.maxAge.toString())
      if (currentFilters.gender) params.append('gender', currentFilters.gender)
      if (currentFilters.city) params.append('city', currentFilters.city)
      if (currentFilters.page) params.append('page', currentFilters.page.toString())
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString())

      const response = await fetch(`/api/discover?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const data: ApiResponse<{ users: DiscoverUser[]; pagination: Pagination }> =
        await response.json()

      if (data.success && data.data) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
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
  }
}
