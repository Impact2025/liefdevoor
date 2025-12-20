/**
 * Analytics Wrapper - AVG/GDPR Compliant
 *
 * Wraps the analytics system with consent checks.
 * Analytics will ONLY track events if user has given consent.
 *
 * IMPORTANT: This fixes the AVG violation where analytics
 * was previously running without user consent.
 */

import {
  analytics as originalAnalytics,
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
} from './analytics'
import { hasConsentFor } from './cookie-consent'

// Track if analytics has been initialized
let analyticsInitialized = false

/**
 * Initialize analytics ONLY if user has given consent
 * Call this after consent has been granted
 */
export function initializeAnalytics(): void {
  if (analyticsInitialized) {
    console.log('[Analytics Wrapper] Already initialized')
    return
  }

  if (!hasConsentFor('analytics')) {
    console.log('[Analytics Wrapper] No consent - analytics disabled')
    return
  }

  // Initialize the original analytics
  originalAnalytics.init()
  analyticsInitialized = true
  console.log('[Analytics Wrapper] Analytics initialized with consent')
}

/**
 * Check if analytics is ready to track
 */
function canTrack(): boolean {
  if (!hasConsentFor('analytics')) {
    console.log(
      '[Analytics Wrapper] Event blocked - no analytics consent'
    )
    return false
  }

  if (!analyticsInitialized) {
    console.log(
      '[Analytics Wrapper] Event blocked - analytics not initialized'
    )
    return false
  }

  return true
}

/**
 * Consent-aware analytics wrapper
 * Proxies all analytics functions but only executes if consent is given
 */
export const analytics = {
  /**
   * Initialize analytics (with consent check)
   */
  init: () => {
    initializeAnalytics()
  },

  /**
   * Track an event (with consent check)
   */
  track: (event: string, properties?: Record<string, any>) => {
    if (!canTrack()) return

    originalAnalytics.track(event, properties)
  },

  /**
   * Identify a user (with consent check)
   */
  identify: (userId: string, properties?: Record<string, any>) => {
    if (!canTrack()) return

    originalAnalytics.identify(userId, properties)
  },

  /**
   * Track a page view (with consent check)
   */
  page: (pageName: string, properties?: Record<string, any>) => {
    if (!canTrack()) return

    originalAnalytics.page(pageName, properties)
  },

  /**
   * Reset analytics (clears user data)
   */
  reset: () => {
    if (!analyticsInitialized) return

    originalAnalytics.reset()
    console.log('[Analytics Wrapper] Analytics reset')
  },

  /**
   * Destroy analytics (cleanup)
   */
  destroy: () => {
    if (!analyticsInitialized) return

    originalAnalytics.destroy()
    analyticsInitialized = false
    console.log('[Analytics Wrapper] Analytics destroyed')
  },

  /**
   * Check if analytics is initialized
   */
  isInitialized: () => analyticsInitialized,
}

// Re-export event constants for convenience
export { ANALYTICS_EVENTS }

// Convenience functions
export const trackEvent = (
  event: string,
  properties?: Record<string, any>
) => {
  analytics.track(event, properties)
}

export const identifyUser = (
  userId: string,
  properties?: Record<string, any>
) => {
  analytics.identify(userId, properties)
}

export const trackPage = (
  pageName: string,
  properties?: Record<string, any>
) => {
  analytics.page(pageName, properties)
}

/**
 * Listen for consent changes and update analytics accordingly
 */
if (typeof window !== 'undefined') {
  window.addEventListener('cookieConsentChanged', (event: Event) => {
    const customEvent = event as CustomEvent
    const { analytics: analyticsConsent } = customEvent.detail

    if (analyticsConsent && !analyticsInitialized) {
      // User just gave consent - initialize analytics
      initializeAnalytics()
      console.log('[Analytics Wrapper] Analytics enabled by user')
    } else if (!analyticsConsent && analyticsInitialized) {
      // User revoked consent - destroy analytics
      analytics.destroy()
      console.log('[Analytics Wrapper] Analytics disabled by user')
    }
  })
}
