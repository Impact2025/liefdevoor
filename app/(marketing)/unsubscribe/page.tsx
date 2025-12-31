'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Mail, Bell, Heart, Star, Calendar, Gift, Loader2 } from 'lucide-react'

interface Preferences {
  marketingEmailsConsent: boolean
  dailyDigest: boolean
  profileNudge: boolean
  perfectMatch: boolean
  reEngagement: boolean
  weeklyHighlights: boolean
  specialEvents: boolean
  productUpdates: boolean
  maxEmailsPerDay: number
  maxEmailsPerWeek: number
}

const preferenceCategories = [
  {
    key: 'dailyDigest',
    label: 'Dagelijkse Digest',
    description: 'Dagelijks overzicht van profielbezoeken en likes',
    icon: Mail,
  },
  {
    key: 'weeklyHighlights',
    label: 'Weekoverzicht',
    description: 'Wekelijkse samenvatting van je activiteit',
    icon: Calendar,
  },
  {
    key: 'perfectMatch',
    label: 'Match Suggesties',
    description: 'Gepersonaliseerde match aanbevelingen',
    icon: Heart,
  },
  {
    key: 'profileNudge',
    label: 'Profiel Tips',
    description: 'Tips om je profiel te verbeteren',
    icon: Star,
  },
  {
    key: 'reEngagement',
    label: 'Herinneringen',
    description: 'Herinneringen als je een tijdje niet actief bent',
    icon: Bell,
  },
  {
    key: 'specialEvents',
    label: 'Speciale Acties',
    description: 'Seizoensgebonden campagnes en aanbiedingen',
    icon: Gift,
  },
]

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [token, email])

  const fetchPreferences = async () => {
    try {
      const params = new URLSearchParams()
      if (token) params.set('token', token)
      if (email) params.set('email', email)

      const response = await fetch(`/api/email/unsubscribe?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPreferences(data.preferences)
      } else {
        setError('Kon voorkeuren niet laden. Mogelijk is de link verlopen.')
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden van je voorkeuren.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof Preferences) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    })
  }

  const handleSave = async () => {
    if (!preferences) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          action: 'update_preferences',
          preferences: {
            dailyDigest: preferences.dailyDigest,
            profileNudge: preferences.profileNudge,
            perfectMatch: preferences.perfectMatch,
            reEngagement: preferences.reEngagement,
            weeklyHighlights: preferences.weeklyHighlights,
            specialEvents: preferences.specialEvents,
            productUpdates: preferences.productUpdates,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Je voorkeuren zijn opgeslagen!')
      } else {
        setError(data.error || 'Er is een fout opgetreden.')
      }
    } catch {
      setError('Er is een fout opgetreden bij het opslaan.')
    } finally {
      setSaving(false)
    }
  }

  const handleUnsubscribeAll = async () => {
    if (!confirm('Weet je zeker dat je van ALLE marketing e-mails wilt uitschrijven?')) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          action: 'unsubscribe_all',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Je bent uitgeschreven van alle marketing e-mails.')
        setPreferences(prev => prev ? {
          ...prev,
          marketingEmailsConsent: false,
          dailyDigest: false,
          profileNudge: false,
          perfectMatch: false,
          reEngagement: false,
          weeklyHighlights: false,
          specialEvents: false,
        } : null)
      } else {
        setError(data.error || 'Er is een fout opgetreden.')
      }
    } catch {
      setError('Er is een fout opgetreden.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  if (error && !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oeps!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            E-mail Voorkeuren
          </h1>
          <p className="text-gray-600">
            Kies welke e-mails je van ons wilt ontvangen
          </p>
          {email && (
            <p className="text-sm text-gray-500 mt-2">
              Voorkeuren voor: <strong>{email}</strong>
            </p>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && preferences && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Preference Cards */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              E-mail Categorieën
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Schakel categorieën in of uit naar wens
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {preferenceCategories.map((category) => {
              const Icon = category.icon
              const isEnabled = preferences?.[category.key as keyof Preferences] as boolean

              return (
                <div
                  key={category.key}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-pink-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${isEnabled ? 'text-pink-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.label}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(category.key as keyof Preferences)}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                      border-2 border-transparent transition-colors duration-200 ease-in-out
                      ${isEnabled ? 'bg-pink-500' : 'bg-gray-200'}
                    `}
                    disabled={saving}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full
                        bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="
              flex-1 bg-pink-500 text-white font-semibold py-3 px-6 rounded-xl
              hover:bg-pink-600 transition-colors disabled:opacity-50
              flex items-center justify-center gap-2
            "
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Voorkeuren Opslaan
              </>
            )}
          </button>

          <button
            onClick={handleUnsubscribeAll}
            disabled={saving}
            className="
              flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl
              hover:bg-gray-200 transition-colors disabled:opacity-50
            "
          >
            Uitschrijven van alles
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Je ontvangt altijd nog transactionele e-mails zoals wachtwoord resets
            en betalingsbevestigingen.
          </p>
          <p className="mt-2">
            <a href="/" className="text-pink-500 hover:underline">
              Terug naar Liefde Voor Iedereen
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
