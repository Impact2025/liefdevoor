/**
 * Settings Page - Wereldklasse Edition
 *
 * User preferences and account settings with:
 * - Wereldklasse location editor
 * - Discovery preferences
 * - Notifications
 * - Account management
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout'
import { Button, Input, Select, Alert } from '@/components/ui'
import { Gender } from '@prisma/client'
import { PostcodeInput } from '@/components/features/location/PostcodeInput'
import { CityAutocomplete } from '@/components/features/location/CityAutocomplete'
import { LocationMap } from '@/components/features/location/LocationMap'
import { LocationPrivacy } from '@/components/features/location/LocationPrivacy'
import { IncognitoToggle } from '@/components/features/incognito'
import { SubscriptionCard, PlanComparison, BillingHistory } from '@/components/subscription'
import { useAdaptiveUI } from '@/components/adaptive/AdaptiveUIProvider'
import type { GeocodingResult, CityOption } from '@/lib/services/geocoding'
import { MapPin, EyeOff, Eye, Type, MousePointer, Palette, Crown, ChevronDown, ChevronUp } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { preferences, updatePreferences, enableVisionImpairedMode, disableVisionImpairedMode } = useAdaptiveUI()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPlanComparison, setShowPlanComparison] = useState(false)
  const [showBillingHistory, setShowBillingHistory] = useState(false)

  // Location state
  const [postcode, setPostcode] = useState('')
  const [city, setCity] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [inputMethod, setInputMethod] = useState<'postcode' | 'city'>('postcode')
  const [locationChanged, setLocationChanged] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    minAge: 18,
    maxAge: 99,
    maxDistance: 100,
    showMe: 'EVERYONE' as 'EVERYONE' | Gender,
    emailNotifications: true,
    pushNotifications: true,
  })

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          const profile = data.profile || data

          // Update location state
          if (profile.postcode) setPostcode(profile.postcode)
          if (profile.city) setCity(profile.city)
          if (profile.latitude) setLatitude(profile.latitude)
          if (profile.longitude) setLongitude(profile.longitude)

          // Preferences is now stored as Json type, no parsing needed
          const prefs = profile.preferences || {}

          // Update settings state
          setSettings(prev => ({
            ...prev,
            minAge: prefs?.minAge || profile.minAgePreference || 18,
            maxAge: prefs?.maxAge || profile.maxAgePreference || 99,
            maxDistance: prefs?.maxDistance || 100,
            showMe: prefs?.showMe || 'EVERYONE',
          }))
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [session?.user?.id])

  // Handle postcode geocoding result
  const handlePostcodeGeocode = (result: GeocodingResult) => {
    setCity(result.city)
    setLatitude(result.latitude)
    setLongitude(result.longitude)
    setLocationChanged(true)
  }

  // Handle city selection from autocomplete
  const handleCitySelect = (selectedCity: CityOption) => {
    setCity(selectedCity.name)
    setLatitude(selectedCity.latitude)
    setLongitude(selectedCity.longitude)
    setLocationChanged(true)
  }

  // Redirect if not authenticated
  if (status === 'loading' || isFetching) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse text-rose-600">Laden...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Save preferences
      const prefsResponse = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!prefsResponse.ok) {
        throw new Error('Failed to save preferences')
      }

      // Save location if changed
      if (locationChanged) {
        const locationResponse = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postcode: postcode || undefined,
            city: city || undefined,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
          }),
        })

        if (!locationResponse.ok) {
          throw new Error('Failed to save location')
        }
      }

      setSuccess(true)
      setLocationChanged(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Er is een fout opgetreden bij het opslaan van je instellingen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 lg:ml-64 lg:pt-6">
      <AppHeader
        title="Instellingen"
        subtitle="Beheer je voorkeuren"
        actions={
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Terug"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }
      />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Success Alert */}
          {success && (
            <Alert variant="success">
              Je instellingen zijn succesvol opgeslagen!
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {/* Subscription Card - Professional Feature */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Abonnement</h2>
              <p className="text-sm text-gray-500">Beheer je lidmaatschap</p>
            </div>
            <SubscriptionCard />

            {/* Plan Comparison Toggle */}
            <div className="mt-3">
              <button
                onClick={() => setShowPlanComparison(!showPlanComparison)}
                className="w-full bg-white border border-gray-200 hover:border-teal-300 rounded-lg p-3 transition-all flex items-center justify-between group"
              >
                <span className="text-sm font-medium text-gray-700">Vergelijk abonnementen</span>
                {showPlanComparison ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {showPlanComparison && (
                <div className="mt-3 bg-white rounded-lg border border-gray-200 p-6">
                  <PlanComparison />
                </div>
              )}
            </div>

            {/* Billing History Toggle */}
            <div className="mt-3">
              <button
                onClick={() => setShowBillingHistory(!showBillingHistory)}
                className="w-full bg-white border border-gray-200 hover:border-teal-300 rounded-lg p-3 transition-all flex items-center justify-between group"
              >
                <span className="text-sm font-medium text-gray-700">Factuurgeschiedenis</span>
                {showBillingHistory ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {showBillingHistory && (
                <div className="mt-3">
                  <BillingHistory />
                </div>
              )}
            </div>
          </div>

          {/* Location Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Locatie
                </h2>
                <p className="text-sm text-gray-500">
                  Update je locatie voor betere matches
                </p>
              </div>
            </div>

            {/* Input method toggle */}
            <div className="mb-4 flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMethod('postcode')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                  inputMethod === 'postcode'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Postcode
              </button>
              <button
                type="button"
                onClick={() => setInputMethod('city')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                  inputMethod === 'city'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stad
              </button>
            </div>

            <div className="space-y-4">
              {/* Input fields */}
              {inputMethod === 'postcode' ? (
                <PostcodeInput
                  value={postcode}
                  onChange={(value) => {
                    setPostcode(value)
                    setLocationChanged(true)
                  }}
                  onGeocode={handlePostcodeGeocode}
                  autoGeocode={true}
                />
              ) : (
                <CityAutocomplete
                  value={city}
                  onChange={(value) => {
                    setCity(value)
                    setLocationChanged(true)
                  }}
                  onSelect={handleCitySelect}
                />
              )}

              {/* Location result card with map */}
              {city && latitude && longitude && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{city}</p>
                      {postcode && (
                        <p className="text-sm text-gray-600">{postcode}</p>
                      )}
                    </div>
                    {locationChanged && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        Niet opgeslagen
                      </span>
                    )}
                  </div>

                  {/* Mini map */}
                  <LocationMap
                    latitude={latitude}
                    longitude={longitude}
                    city={city}
                    height="180px"
                    showPrivacyCircle={true}
                    circleRadius={2000}
                    interactive={false}
                  />
                </div>
              )}

              {/* Privacy notice */}
              <LocationPrivacy variant="compact" />
            </div>
          </div>

          {/* Discovery Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ontdek Voorkeuren
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leeftijdsbereik: {settings.minAge} - {settings.maxAge} jaar
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Minimaal</label>
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={settings.minAge}
                      onChange={(e) => setSettings({ ...settings, minAge: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Maximaal</label>
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={settings.maxAge}
                      onChange={(e) => setSettings({ ...settings, maxAge: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximale afstand: {settings.maxDistance} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={settings.maxDistance}
                  onChange={(e) => setSettings({ ...settings, maxDistance: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <Select
                label="Toon mij"
                value={settings.showMe}
                onChange={(e) => setSettings({ ...settings, showMe: e.target.value as any })}
                fullWidth
                options={[
                  { value: 'EVERYONE', label: 'Iedereen' },
                  { value: Gender.MALE, label: 'Mannen' },
                  { value: Gender.FEMALE, label: 'Vrouwen' },
                  { value: Gender.NON_BINARY, label: 'Non-binair' },
                ]}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notificaties
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Email notificaties</div>
                  <div className="text-sm text-gray-500">Ontvang updates via email</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Push notificaties</div>
                  <div className="text-sm text-gray-500">Ontvang realtime notificaties</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
              </label>
            </div>
          </div>

          {/* Toegankelijkheid (Accessibility) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Toegankelijkheid
                </h2>
                <p className="text-sm text-gray-500">
                  Optimaliseer de app voor slechtzienden en andere beperkingen
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Vision Impaired Mode - Master Toggle */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
                <label className="flex items-start justify-between cursor-pointer">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      Slechtzienden Modus
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Activeert extra groot lettertype (125%), maximaal contrast (WCAG AAA), en voorleesfunctie
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.visionImpairedMode}
                    onChange={(e) => {
                      if (e.target.checked) {
                        enableVisionImpairedMode()
                      } else {
                        disableVisionImpairedMode()
                      }
                    }}
                    className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 ml-4"
                  />
                </label>
              </div>

              {/* Individual Settings */}
              <div className="border-t pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Palette className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Extra Hoog Contrast</div>
                      <div className="text-sm text-gray-500">WCAG AAA compliant (7:1 ratio)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.extraHighContrast}
                    onChange={(e) => updatePreferences({ extraHighContrast: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Type className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Voorleesfunctie</div>
                      <div className="text-sm text-gray-500">Laat tekst voorlezen met een knop</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.textToSpeech}
                    onChange={(e) => updatePreferences({ textToSpeech: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Type className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Grote Tekst</div>
                      <div className="text-sm text-gray-500">Vergroot alle tekst met 12.5%</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.largeText}
                    onChange={(e) => updatePreferences({ largeText: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <MousePointer className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Grote Knoppen</div>
                      <div className="text-sm text-gray-500">Minimaal 56px aanraakvlak</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.largeTargets}
                    onChange={(e) => updatePreferences({ largeTargets: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kleurenblind Modus
                </label>
                <select
                  value={preferences.colorBlindMode}
                  onChange={(e) => updatePreferences({ colorBlindMode: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="none">Geen</option>
                  <option value="deuteranopia">Deuteranopia (Rood-groen)</option>
                  <option value="protanopia">Protanopia (Rood-groen)</option>
                  <option value="tritanopia">Tritanopia (Blauw-geel)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-gray-900">Bewerk Profiel</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => router.push('/settings/privacy')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium text-gray-900">Privacy Instellingen</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Incognito Mode - Premium Feature */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <IncognitoToggle />
          </div>

          {/* More Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 space-y-1">
              <button
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">Hulp & Ondersteuning</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-20 md:bottom-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
