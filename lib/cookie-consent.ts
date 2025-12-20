/**
 * Cookie Consent Manager
 * AVG/GDPR compliant consent management system
 *
 * Manages user consent for different cookie categories:
 * - Necessary: Always enabled (functional cookies)
 * - Analytics: Opt-in required (tracking, analytics)
 * - Marketing: Opt-in required (ads, marketing cookies)
 */

const CONSENT_STORAGE_KEY = 'cookie-consent'
const CONSENT_VERSION = '2.0'

export interface ConsentCategories {
  necessary: boolean  // Altijd true (functionele cookies zijn verplicht)
  analytics: boolean  // Opt-in vereist
  marketing: boolean  // Opt-in vereist
}

export interface ConsentData {
  categories: ConsentCategories
  version: string
  timestamp: string
}

/**
 * Default consent state (alleen noodzakelijke cookies)
 */
export const DEFAULT_CONSENT: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
}

/**
 * Haal de huidige consent status op uit localStorage
 * Returns null als er nog geen consent is gegeven
 */
export function getCookieConsent(): ConsentData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return null

    const data: ConsentData = JSON.parse(stored)

    // Verify version - if version changed, ask for consent again
    if (data.version !== CONSENT_VERSION) {
      console.log('[Cookie Consent] Version mismatch, clearing old consent')
      localStorage.removeItem(CONSENT_STORAGE_KEY)
      return null
    }

    return data
  } catch (error) {
    console.error('[Cookie Consent] Failed to parse consent:', error)
    return null
  }
}

/**
 * Sla consent keuze op in localStorage
 * En sync naar database indien gebruiker is ingelogd
 */
export function setCookieConsent(
  categories: ConsentCategories,
  userId?: string
): void {
  if (typeof window === 'undefined') return

  const consentData: ConsentData = {
    categories: {
      necessary: true, // Enforce: necessary is always true
      analytics: categories.analytics,
      marketing: categories.marketing,
    },
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  }

  // Save to localStorage
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
    console.log('[Cookie Consent] Consent saved:', consentData.categories)
  } catch (error) {
    console.error('[Cookie Consent] Failed to save consent:', error)
  }

  // Sync to database if user is logged in
  if (userId) {
    syncConsentToDatabase(consentData, userId)
  }

  // Trigger custom event for listeners
  window.dispatchEvent(
    new CustomEvent('cookieConsentChanged', {
      detail: consentData.categories,
    })
  )
}

/**
 * Check of consent is gegeven voor een specifieke categorie
 */
export function hasConsentFor(category: keyof ConsentCategories): boolean {
  const consent = getCookieConsent()

  // Necessary cookies are always allowed
  if (category === 'necessary') return true

  // If no consent given yet, default is false (except for necessary)
  if (!consent) return false

  return consent.categories[category]
}

/**
 * Intrek alle consent (behalve necessary)
 */
export function revokeConsent(userId?: string): void {
  setCookieConsent(DEFAULT_CONSENT, userId)
  console.log('[Cookie Consent] Consent revoked')
}

/**
 * Check of gebruiker al consent heeft gegeven (true/false)
 */
export function hasGivenConsent(): boolean {
  return getCookieConsent() !== null
}

/**
 * Accepteer alle cookies (convenience function)
 */
export function acceptAllCookies(userId?: string): void {
  setCookieConsent(
    {
      necessary: true,
      analytics: true,
      marketing: true,
    },
    userId
  )
  console.log('[Cookie Consent] All cookies accepted')
}

/**
 * Accepteer alleen noodzakelijke cookies (convenience function)
 */
export function acceptNecessaryOnly(userId?: string): void {
  setCookieConsent(DEFAULT_CONSENT, userId)
  console.log('[Cookie Consent] Only necessary cookies accepted')
}

/**
 * Sync consent naar database via API
 * @private
 */
async function syncConsentToDatabase(
  consentData: ConsentData,
  userId: string
): Promise<void> {
  try {
    const response = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...consentData.categories,
        consentVersion: consentData.version,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to sync consent to database')
    }

    console.log('[Cookie Consent] Synced to database for user:', userId)
  } catch (error) {
    console.error('[Cookie Consent] Database sync failed:', error)
    // Niet fatal - localStorage is de single source of truth
  }
}

/**
 * Load consent from database for logged-in user
 * Merges with localStorage (localStorage takes precedence)
 */
export async function loadConsentFromDatabase(userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/consent?userId=${userId}`)

    if (!response.ok) {
      console.log('[Cookie Consent] No database consent found')
      return
    }

    const dbConsent = await response.json()
    const localConsent = getCookieConsent()

    // If no local consent, use database consent
    if (!localConsent && dbConsent) {
      setCookieConsent(
        {
          necessary: true,
          analytics: dbConsent.analytics,
          marketing: dbConsent.marketing,
        },
        userId
      )
      console.log('[Cookie Consent] Loaded from database')
    } else if (localConsent) {
      // If local consent exists, sync it to database (local is source of truth)
      syncConsentToDatabase(localConsent, userId)
    }
  } catch (error) {
    console.error('[Cookie Consent] Failed to load from database:', error)
  }
}

/**
 * Get consent categories as analytics-friendly object
 * Useful for tracking consent rates
 */
export function getConsentAnalytics(): {
  hasConsent: boolean
  analytics: boolean
  marketing: boolean
} {
  const consent = getCookieConsent()
  return {
    hasConsent: consent !== null,
    analytics: consent?.categories.analytics || false,
    marketing: consent?.categories.marketing || false,
  }
}
