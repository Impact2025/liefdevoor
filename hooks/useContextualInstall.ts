/**
 * Contextual Install Prompt Hook
 * Triggers install prompt at optimal moments for better conversion
 */

import { useState, useEffect, useCallback } from 'react'
import { usePWA } from './usePWA'

type InstallTrigger =
  | 'first_match'      // After user gets their first match
  | 'multiple_swipes'  // After 5+ swipes
  | 'return_visit'     // On 3rd+ visit
  | 'message_sent'     // After sending first message
  | 'profile_complete' // After completing profile
  | 'timed'           // Default time-based

interface UseContextualInstallOptions {
  trigger?: InstallTrigger
  delay?: number
  skipIfDismissed?: boolean
}

export function useContextualInstall(options: UseContextualInstallOptions = {}) {
  const { trigger = 'timed', delay = 5000, skipIfDismissed = true } = options
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (isInstalled || !isInstallable) return

    // Check if user dismissed before
    if (skipIfDismissed) {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        const dismissedAt = new Date(dismissed)
        const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 7) return // Don't show for 7 days
      }
    }

    // Get user's interaction history
    const visitCount = parseInt(localStorage.getItem('visit-count') || '0', 10)
    const swipeCount = parseInt(localStorage.getItem('swipe-count') || '0', 10)
    const matchCount = parseInt(localStorage.getItem('match-count') || '0', 10)
    const messageCount = parseInt(localStorage.getItem('message-count') || '0', 10)

    let shouldTrigger = false

    switch (trigger) {
      case 'first_match':
        shouldTrigger = matchCount === 1
        break
      case 'multiple_swipes':
        shouldTrigger = swipeCount >= 5
        break
      case 'return_visit':
        shouldTrigger = visitCount >= 3
        break
      case 'message_sent':
        shouldTrigger = messageCount === 1
        break
      case 'profile_complete':
        // Check if profile is complete (you can customize this)
        const profileComplete = localStorage.getItem('profile-complete') === 'true'
        shouldTrigger = profileComplete
        break
      case 'timed':
      default:
        shouldTrigger = true
        break
    }

    if (shouldTrigger) {
      const timer = setTimeout(() => {
        setShouldShow(true)

        // Track which trigger showed the prompt
        if (window.gtag) {
          window.gtag('event', 'pwa_contextual_prompt_shown', {
            event_category: 'PWA',
            trigger: trigger
          })
        }
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isInstalled, isInstallable, trigger, delay, skipIfDismissed])

  const handleInstall = useCallback(async () => {
    const success = await installApp()

    if (success && window.gtag) {
      window.gtag('event', 'pwa_contextual_install', {
        event_category: 'PWA',
        trigger: trigger
      })
    }

    setShouldShow(false)
    return success
  }, [installApp, trigger])

  const handleDismiss = useCallback(() => {
    setShouldShow(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())

    if (window.gtag) {
      window.gtag('event', 'pwa_contextual_dismissed', {
        event_category: 'PWA',
        trigger: trigger
      })
    }
  }, [trigger])

  return {
    shouldShow,
    handleInstall,
    handleDismiss,
    trigger
  }
}

/**
 * Helper functions to track user actions
 */
export const trackUserAction = {
  visit: () => {
    const count = parseInt(localStorage.getItem('visit-count') || '0', 10)
    localStorage.setItem('visit-count', (count + 1).toString())
  },

  swipe: () => {
    const count = parseInt(localStorage.getItem('swipe-count') || '0', 10)
    localStorage.setItem('swipe-count', (count + 1).toString())
  },

  match: () => {
    const count = parseInt(localStorage.getItem('match-count') || '0', 10)
    localStorage.setItem('match-count', (count + 1).toString())
  },

  message: () => {
    const count = parseInt(localStorage.getItem('message-count') || '0', 10)
    localStorage.setItem('message-count', (count + 1).toString())
  },

  profileComplete: () => {
    localStorage.setItem('profile-complete', 'true')
  }
}
