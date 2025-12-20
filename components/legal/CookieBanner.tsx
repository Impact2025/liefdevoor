/**
 * Cookie Consent Banner
 * AVG/GDPR compliant cookie consent banner
 *
 * Appears at bottom of screen for visitors who haven't given consent yet.
 * Provides 3 options:
 * - Accept all cookies
 * - Accept only necessary cookies
 * - Customize preferences (opens modal)
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  hasGivenConsent,
  acceptAllCookies,
  acceptNecessaryOnly,
  getCookieConsent,
} from '@/lib/cookie-consent'
import { initializeAnalytics } from '@/lib/analytics-wrapper'
import { CookiePreferencesModal } from './CookiePreferencesModal'

export function CookieBanner() {
  const { data: session } = useSession()
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = hasGivenConsent()

    if (!consentGiven) {
      // Show banner after small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } else {
      // User has consent - check if analytics should be initialized
      const consent = getCookieConsent()
      if (consent?.categories.analytics) {
        initializeAnalytics()
      }
    }
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies(session?.user?.id)
    setShowBanner(false)

    // Initialize analytics since user accepted
    initializeAnalytics()
  }

  const handleAcceptNecessary = () => {
    acceptNecessaryOnly(session?.user?.id)
    setShowBanner(false)
  }

  const handleCustomize = () => {
    setShowPreferences(true)
  }

  const handlePreferencesSaved = () => {
    setShowPreferences(false)
    setShowBanner(false)

    // Check if analytics consent was given
    const consent = getCookieConsent()
    if (consent?.categories.analytics) {
      initializeAnalytics()
    }
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-rose-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Wij matchen, maar niet met uw data zonder toestemming.
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bij Liefde Voor Iedereen gebruiken we cookies om de app veilig
                en snel te laten werken (<strong>Noodzakelijk</strong>) en om
                technische fouten op te sporen (<strong>Analytisch</strong>).
                Met uw toestemming gebruiken we ook cookies om onze
                abonnementsdiensten te verbeteren.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Lees meer in onze{' '}
                <Link
                  href="/cookies"
                  className="text-rose-600 hover:text-rose-700 underline"
                >
                  Cookieverklaring
                </Link>{' '}
                en{' '}
                <Link
                  href="/privacy"
                  className="text-rose-600 hover:text-rose-700 underline"
                >
                  Privacy policy
                </Link>
                .
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
              >
                Alles accepteren
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Alleen noodzakelijk
              </button>
              <button
                onClick={handleCustomize}
                className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-lg border-2 border-rose-600 hover:bg-rose-50 transition-colors"
              >
                Voorkeuren instellen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <CookiePreferencesModal
          onClose={() => setShowPreferences(false)}
          onSave={handlePreferencesSaved}
        />
      )}
    </>
  )
}
