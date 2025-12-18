/**
 * React Query API Hooks
 *
 * Centralized API calls with automatic caching, refetching, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DiscoverUser, Match, Message, Notification } from '@/lib/types'

// ==========================================
// QUERY KEYS (for cache management)
// ==========================================

export const queryKeys = {
  // User queries
  user: {
    profile: () => ['user', 'profile'] as const,
    preferences: () => ['user', 'preferences'] as const,
  },

  // Discover queries
  discover: {
    all: () => ['discover'] as const,
    list: (filters?: any) => ['discover', 'list', filters] as const,
  },

  // Match queries
  matches: {
    all: () => ['matches'] as const,
    list: () => ['matches', 'list'] as const,
    detail: (id: string) => ['matches', 'detail', id] as const,
  },

  // Message queries
  messages: {
    all: () => ['messages'] as const,
    list: (matchId: string) => ['messages', 'list', matchId] as const,
  },

  // Notification queries
  notifications: {
    all: () => ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
}

// ==========================================
// FETCH HELPERS
// ==========================================

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'API request failed')
  }

  const data = await response.json()
  return data.data || data
}

// ==========================================
// DISCOVER HOOKS
// ==========================================

export function useDiscoverUsers(filters?: { minAge?: number; maxAge?: number; gender?: string }) {
  const queryString = filters
    ? '?' + new URLSearchParams(filters as any).toString()
    : ''

  return useQuery({
    queryKey: queryKeys.discover.list(filters),
    queryFn: () => apiFetch<DiscoverUser[]>(`/api/discover${queryString}`),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ==========================================
// MATCH HOOKS
// ==========================================

export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches.list(),
    queryFn: () => apiFetch<Match[]>('/api/matches'),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId),
    queryFn: () => apiFetch<Match>(`/api/matches/${matchId}`),
    enabled: !!matchId,
  })
}

// ==========================================
// MESSAGE HOOKS
// ==========================================

export function useMessages(matchId: string) {
  return useQuery({
    queryKey: queryKeys.messages.list(matchId),
    queryFn: () => apiFetch<{ messages: Message[] }>(`/api/messages/${matchId}`),
    enabled: !!matchId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId, content }: { matchId: string; content: string }) => {
      return apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ matchId, content }),
      })
    },
    onSuccess: (_, variables) => {
      // Invalidate messages list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(variables.matchId),
      })
      // Also invalidate matches list (to update last message)
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.list(),
      })
    },
  })
}

// ==========================================
// NOTIFICATION HOOKS
// ==========================================

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => apiFetch<Notification[]>('/api/notifications'),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Poll every minute
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const data = await apiFetch<{ count: number }>('/api/notifications/unread-count')
      return data.count
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Poll every minute
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => {
      return apiFetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      })
    },
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      })
    },
  })
}

// ==========================================
// SWIPE/MATCH HOOKS
// ==========================================

export function useSwipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ swipedId, isLike }: { swipedId: string; isLike: boolean }) => {
      return apiFetch('/api/swipe', {
        method: 'POST',
        body: JSON.stringify({ swipedId, isLike }),
      })
    },
    onSuccess: (data: any) => {
      // Remove swiped user from discover cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.discover.all(),
      })

      // If it's a match, invalidate matches list
      if (data.isMatch) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.matches.all(),
        })
      }
    },
  })
}

// ==========================================
// USER PROFILE HOOKS
// ==========================================

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => apiFetch('/api/user/profile'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => {
      return apiFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(),
      })
    },
  })
}

// ==========================================
// UTILITY HOOKS
// ==========================================

/**
 * Prefetch data for better UX
 * Call this when user is likely to navigate to a page
 */
export function usePrefetch() {
  const queryClient = useQueryClient()

  return {
    prefetchMatches: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.matches.list(),
        queryFn: () => apiFetch<Match[]>('/api/matches'),
      })
    },
    prefetchNotifications: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: () => apiFetch<Notification[]>('/api/notifications'),
      })
    },
  }
}
