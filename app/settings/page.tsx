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
import type { GeocodingResult, CityOption } from '@/lib/services/geocoding'
import { MapPin } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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

          // Update location state
          if (data.postcode) setPostcode(data.postcode)
          if (data.city) setCity(data.city)
          if (data.latitude) setLatitude(data.latitude)
          if (data.longitude) setLongitude(data.longitude)

          // Update settings state
          setSettings(prev => ({
            ...prev,
            minAge: data.minAgePreference || 18,
            maxAge: data.maxAgePreference || 99,
            maxDistance: data.preferences?.maxDistance || 100,
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
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8">
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
