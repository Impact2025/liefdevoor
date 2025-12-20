/**
 * Privacy Settings Page
 * Allows users to:
 * - Manage cookie preferences
 * - Request data export (AVG Artikel 20)
 * - Request account deletion (AVG Artikel 17)
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Download, Trash2, Cookie, Shield, AlertCircle } from 'lucide-react'
import { getCookieConsent, setCookieConsent, type ConsentCategories } from '@/lib/cookie-consent'
import { initializeAnalytics, analytics } from '@/lib/analytics-wrapper'

export default function PrivacySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cookiePrefs, setCookiePrefs] = useState<ConsentCategories>({
    necessary: true,
    analytics: false,
    marketing: false,
  })
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load current cookie preferences
  useEffect(() => {
    const consent = getCookieConsent()
    if (consent) {
      setCookiePrefs(consent.categories)
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-rose-600">Laden...</div>
      </div>
    )
  }

  if (!session) return null

  const handleCookieUpdate = (category: keyof ConsentCategories) => {
    if (category === 'necessary') return // Cannot disable necessary cookies

    const newPrefs = {
      ...cookiePrefs,
      [category]: !cookiePrefs[category],
    }

    setCookiePrefs(newPrefs)
    setCookieConsent(newPrefs, session.user.id)

    // Reinitialize or destroy analytics based on consent
    if (category === 'analytics') {
      if (newPrefs.analytics) {
        initializeAnalytics()
      } else {
        analytics.destroy()
      }
    }

    setMessage({ type: 'success', text: 'Cookie voorkeuren bijgewerkt' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDataExport = async () => {
    setExportLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/privacy/data-export', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Data export aanvraag mislukt')
      }

      const data = await response.json()
      setMessage({
        type: 'success',
        text: 'Data export aangevraagd! U ontvangt binnen 24 uur een download link per email.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Er is een fout opgetreden. Probeer het later opnieuw.',
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    setDeleteLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/privacy/account-delete', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Account verwijdering mislukt')
      }

      setMessage({
        type: 'success',
        text: 'Account verwijdering gepland. U heeft 30 dagen bedenktijd. U ontvangt een bevestigingsmail.',
      })
      setShowDeleteConfirm(false)

      // Redirect to home after 3 seconds
      setTimeout(() => router.push('/'), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Er is een fout opgetreden. Probeer het later opnieuw.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Terug"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Privacy Instellingen</h1>
              <p className="text-sm text-gray-500">Beheer uw privacy en gegevens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-900'
                  : 'bg-red-50 border border-red-200 text-red-900'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Cookie Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-rose-600" />
              <h2 className="text-lg font-semibold text-gray-900">Cookie Voorkeuren</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Beheer welke cookies u wilt toestaan. Noodzakelijke cookies zijn altijd actief.
            </p>

            <div className="space-y-4">
              {/* Necessary */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Noodzakelijke cookies</div>
                  <div className="text-sm text-gray-500">Altijd actief</div>
                </div>
                <div className="w-12 h-6 bg-rose-500 rounded-full flex items-center px-1 cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-6" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Analytische cookies</div>
                  <div className="text-sm text-gray-500">Helpt ons de app te verbeteren</div>
                </div>
                <button
                  onClick={() => handleCookieUpdate('analytics')}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    cookiePrefs.analytics ? 'bg-rose-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                      cookiePrefs.analytics ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Marketing cookies</div>
                  <div className="text-sm text-gray-500">Voor relevante advertenties</div>
                </div>
                <button
                  onClick={() => handleCookieUpdate('marketing')}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    cookiePrefs.marketing ? 'bg-rose-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                      cookiePrefs.marketing ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Data Export</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Download een kopie van al uw gegevens. U ontvangt een JSON bestand met al uw
              profielinformatie, matches, berichten en activiteiten.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              AVG Artikel 20 - Recht op dataportabiliteit
            </p>
            <button
              onClick={handleDataExport}
              disabled={exportLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {exportLoading ? 'Aanvragen...' : 'Data Export Aanvragen'}
            </button>
          </div>

          {/* Account Deletion */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Account Verwijderen</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Verwijder uw account permanent. Dit kan niet ongedaan worden gemaakt. U heeft 30
              dagen bedenktijd voordat uw account definitief wordt verwijderd.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              AVG Artikel 17 - Recht om vergeten te worden
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Account Verwijderen
              </button>
            ) : (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 mb-2">Weet u het zeker?</p>
                    <p className="text-sm text-red-800 mb-4">
                      Deze actie plant de verwijdering van uw account. U heeft 30 dagen om dit
                      te annuleren. Na 30 dagen worden al uw gegevens permanent verwijderd.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccountDeletion}
                    disabled={deleteLoading}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    {deleteLoading ? 'Verwijderen...' : 'Ja, Verwijder Mijn Account'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Uw privacy is belangrijk</p>
                <p>
                  Lees onze{' '}
                  <a href="/privacy" className="underline font-semibold hover:text-blue-700">
                    Privacy Policy
                  </a>{' '}
                  voor meer informatie over hoe we uw gegevens beschermen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
