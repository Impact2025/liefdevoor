/**
 * useNotifications Hook
 *
 * Fetch and manage user notifications with unread count.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Notification, ApiResponse } from '@/lib/types'

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

/**
 * Hook to get user's notifications
 *
 * @returns Notifications data and management functions
 *
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   markAllAsRead
 * } = useNotifications()
 *
 * return (
 *   <div>
 *     <Badge count={unreadCount} />
 *     <NotificationList
 *       notifications={notifications}
 *       onRead={markAsRead}
 *     />
 *   </div>
 * )
 * ```
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/notifications')

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`)
      }

      const data: ApiResponse<{ notifications: Notification[] }> = await response.json()

      if (data.success && data.data) {
        setNotifications(data.data.notifications)
      } else {
        throw new Error(data.error?.message || 'Failed to load notifications')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      )
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
