/**
 * Google Analytics Helper Functions
 * AVG-compliant tracking utilities
 */

import { hasConsentFor } from './cookie-consent'

// Type definitions for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

export const GA_MEASUREMENT_ID = 'G-7DS7HL7B96'

/**
 * Track a custom event to Google Analytics
 * Only tracks if user has given analytics consent
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!hasConsentFor('analytics')) {
    console.log('[GA] Event blocked - no consent:', eventName)
    return
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
    console.log('[GA] Event tracked:', eventName, eventParams)
  }
}

/**
 * Track a page view
 */
export function trackPageView(url: string) {
  if (!hasConsentFor('analytics')) {
    return
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

/**
 * Track user signup
 */
export function trackSignup(method: string) {
  trackEvent('sign_up', {
    method, // 'email', 'google', etc.
  })
}

/**
 * Track user login
 */
export function trackLogin(method: string) {
  trackEvent('login', {
    method,
  })
}

/**
 * Track subscription purchase
 */
export function trackPurchase(transactionId: string, value: number, plan: string) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency: 'EUR',
    items: [
      {
        item_id: plan,
        item_name: `${plan} Subscription`,
        item_category: 'Subscription',
        price: value,
        quantity: 1,
      },
    ],
  })
}

/**
 * Track match creation
 */
export function trackMatch() {
  trackEvent('match_created', {
    event_category: 'engagement',
  })
}

/**
 * Track message sent
 */
export function trackMessageSent(messageType: 'text' | 'audio') {
  trackEvent('message_sent', {
    event_category: 'engagement',
    message_type: messageType,
  })
}

/**
 * Track swipe action
 */
export function trackSwipe(action: 'like' | 'pass' | 'super_like') {
  trackEvent('swipe', {
    event_category: 'engagement',
    swipe_action: action,
  })
}

/**
 * Track profile view
 */
export function trackProfileView() {
  trackEvent('profile_view', {
    event_category: 'engagement',
  })
}

/**
 * Track error
 */
export function trackError(errorMessage: string, errorLevel: 'warning' | 'error' | 'fatal') {
  trackEvent('error', {
    event_category: 'errors',
    error_message: errorMessage,
    error_level: errorLevel,
  })
}
