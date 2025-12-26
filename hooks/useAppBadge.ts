/**
 * App Badge Hook
 * Shows unread count on app icon (PWA only)
 * Supported on: Chrome/Edge (Desktop & Android), Safari (iOS 16.4+)
 */

import { useEffect } from 'react'

interface AppBadgeAPI {
  setAppBadge(count?: number): Promise<void>
  clearAppBadge(): Promise<void>
}

declare global {
  interface Navigator {
    setAppBadge?: (count?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
}

export function useAppBadge(unreadCount: number = 0) {
  useEffect(() => {
    // Check if Badge API is supported
    if (!('setAppBadge' in navigator)) {
      console.log('[App Badge] Not supported on this browser')
      return
    }

    // Set badge with unread count
    const updateBadge = async () => {
      try {
        if (unreadCount > 0) {
          await navigator.setAppBadge!(unreadCount)
          console.log(`[App Badge] Set to ${unreadCount}`)
        } else {
          await navigator.clearAppBadge!()
          console.log('[App Badge] Cleared')
        }
      } catch (error) {
        console.error('[App Badge] Error:', error)
      }
    }

    updateBadge()

    // Clear badge when user leaves the page (optional)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && unreadCount === 0) {
        navigator.clearAppBadge?.()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [unreadCount])

  // Return helper functions
  return {
    setBadge: async (count: number) => {
      if ('setAppBadge' in navigator) {
        await navigator.setAppBadge!(count)
      }
    },
    clearBadge: async () => {
      if ('clearAppBadge' in navigator) {
        await navigator.clearAppBadge!()
      }
    },
    isSupported: 'setAppBadge' in navigator
  }
}

/**
 * Helper component to automatically manage app badge
 * Usage: <AppBadgeManager unreadMessages={5} unreadNotifications={3} />
 */
export function AppBadgeManager({
  unreadMessages = 0,
  unreadNotifications = 0
}: {
  unreadMessages?: number
  unreadNotifications?: number
}) {
  const totalUnread = unreadMessages + unreadNotifications
  useAppBadge(totalUnread)
  return null
}
