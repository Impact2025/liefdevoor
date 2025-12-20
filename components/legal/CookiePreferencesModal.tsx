/**
 * Cookie Preferences Modal
 * Allows granular control over cookie categories
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { X, Check, Info } from 'lucide-react'
import {
  getCookieConsent,
  setCookieConsent,
  type ConsentCategories,
  DEFAULT_CONSENT,
} from '@/lib/cookie-consent'

interface CookiePreferencesModalProps {
  onClose: () => void
  onSave: () => void
}

export function CookiePreferencesModal({
  onClose,
  onSave,
}: CookiePreferencesModalProps) {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<ConsentCategories>(DEFAULT_CONSENT)

  useEffect(() => {
    // Load existing preferences if available
    const existing = getCookieConsent()
    if (existing) {
      setPreferences(existing.categories)
    }
  }, [])

  const handleSave = () => {
    setCookieConsent(preferences, session?.user?.id)
    onSave()
  }

  const toggleCategory = (category: keyof ConsentCategories) => {
    // Necessary cookies cannot be disabled
    if (category === 'necessary') return

    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Cookie Voorkeuren
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          <p className="text-gray-600">
            Wij respecteren uw privacy. U kunt hieronder aangeven welke cookies
            u wilt toestaan. Noodzakelijke cookies zijn altijd actief omdat ze
            essentieel zijn voor de werking van de website.
          </p>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {/* Noodzakelijk */}
            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Noodzakelijke cookies
                    </h3>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                      Altijd actief
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Deze cookies zijn essentieel voor de werking van de website.
                    Zonder deze cookies kan de website niet goed functioneren.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Sessie management (inloggen)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>CSRF bescherming (beveiliging)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Cookie voorkeuren opslaan</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-rose-500 rounded-full flex items-center px-1 cursor-not-allowed opacity-50">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className={`border-2 rounded-xl p-4 transition-colors ${
              preferences.analytics
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analytische cookies
                    </h3>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Helpen ons begrijpen hoe bezoekers de website gebruiken, zodat
                    we de gebruikerservaring kunnen verbeteren en fouten kunnen
                    oplossen.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Gebruiksstatistieken (swipes, matches)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Error tracking (Sentry)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Sessie duur en activiteit</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleCategory('analytics')}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-rose-500' : 'bg-gray-300'
                    }`}
                    aria-label="Analytics cookies in/uitschakelen"
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div className={`border-2 rounded-xl p-4 transition-colors ${
              preferences.marketing
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Marketing cookies
                    </h3>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Worden gebruikt om relevante advertenties te tonen en
                    marketingcampagnes te meten. Helpen ons te begrijpen welke
                    promoties effectief zijn.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Payment provider tracking (MultiSafePay)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Campagne tracking</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleCategory('marketing')}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-rose-500' : 'bg-gray-300'
                    }`}
                    aria-label="Marketing cookies in/uitschakelen"
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Links */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Voor meer informatie over hoe we uw gegevens verwerken, bekijk
              onze{' '}
              <Link
                href="/privacy"
                className="font-semibold underline hover:text-blue-700"
              >
                Privacy policy
              </Link>{' '}
              en{' '}
              <Link
                href="/cookies"
                className="font-semibold underline hover:text-blue-700"
              >
                Cookieverklaring
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            Voorkeuren opslaan
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  )
}
