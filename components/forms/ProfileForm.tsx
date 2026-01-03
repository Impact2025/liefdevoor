/**
 * ProfileForm Component - Wereldklasse Edition
 *
 * Features all onboarding elements:
 * - PostcodeInput with auto-geocoding
 * - CityAutocomplete
 * - Visual interest chips
 * - LookingFor preference
 * - Age preference sliders
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Input, Textarea, Select, Button, Alert } from '@/components/ui'
import { PostcodeInput } from '@/components/features/location/PostcodeInput'
import { CityAutocomplete } from '@/components/features/location/CityAutocomplete'
import { usePut } from '@/hooks'
import type { ProfileUpdateData, UserProfile, UserPreferences, PsychProfileData, DealbreakersData } from '@/lib/types'
import type { GeocodingResult, CityOption } from '@/lib/services/geocoding'
import { Gender } from '@prisma/client'
import { MapPin, Heart, Users, Sparkles, Check, Briefcase, GraduationCap, Ruler, Wine, Cigarette, Baby, Brain, MessageCircle, Shield, Target } from 'lucide-react'

// Interest categories (same as onboarding)
const INTEREST_CATEGORIES = [
  {
    category: 'Sport & Beweging',
    interests: ['Fitness', 'Wandelen', 'Fietsen', 'Hardlopen', 'Yoga', 'Zwemmen', 'Voetbal', 'Tennis'],
  },
  {
    category: 'Entertainment',
    interests: ['Films', 'Series', 'Muziek', 'Gaming', 'Lezen', 'Theater', 'Concerten', 'Podcasts'],
  },
  {
    category: 'Eten & Drinken',
    interests: ['Koken', 'Wijn', 'Uit eten', 'Bakken', 'Koffie', 'Vegetarisch', 'Borrelen'],
  },
  {
    category: 'Ontspanning',
    interests: ['Reizen', 'Natuur', 'Fotografie', 'Tuinieren', 'Kunst', 'DIY', 'Mediteren'],
  },
  {
    category: 'Sociaal',
    interests: ['Uitgaan', 'Festivals', 'Vrienden', 'Familie', 'Dieren', 'Vrijwilligerswerk'],
  },
]

const MAX_INTERESTS = 5

// Looking for options
const lookingForOptions = [
  { value: 'MALE', label: 'Mannen', description: 'Ik zoek naar mannen' },
  { value: 'FEMALE', label: 'Vrouwen', description: 'Ik zoek naar vrouwen' },
  { value: 'BOTH', label: 'Iedereen', description: 'Ik sta open voor iedereen' },
]

// Lifestyle options
const drinkingOptions = [
  { value: '', label: 'Selecteer...' },
  { value: 'Nooit', label: 'Nooit' },
  { value: 'Zelden', label: 'Zelden' },
  { value: 'Sociaal', label: 'Sociaal' },
  { value: 'Regelmatig', label: 'Regelmatig' },
]

const smokingOptions = [
  { value: '', label: 'Selecteer...' },
  { value: 'Nooit', label: 'Nooit' },
  { value: 'Soms sociaal', label: 'Soms sociaal' },
  { value: 'Regelmatig', label: 'Regelmatig' },
]

const childrenOptions = [
  { value: '', label: 'Selecteer...' },
  { value: 'Geen, wil ook geen', label: 'Geen, wil ook geen' },
  { value: 'Geen, wil wel', label: 'Geen, wil wel' },
  { value: 'Heb kinderen', label: 'Heb kinderen' },
  { value: 'Heb kinderen, wil meer', label: 'Heb kinderen, wil meer' },
]

export interface ProfileFormProps {
  initialData?: UserProfile
  onSuccess?: (updatedProfile: UserProfile) => void
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  // Parse birthDate into day/month/year
  const parseBirthDate = (dateString?: string | null) => {
    if (!dateString) return { day: '', month: '', year: '' }
    const date = new Date(dateString)
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      year: String(date.getFullYear())
    }
  }

  // Basic form data
  const [name, setName] = useState(initialData?.name || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const birthParts = parseBirthDate(initialData?.birthDate)
  const [birthDay, setBirthDay] = useState(birthParts.day)
  const [birthMonth, setBirthMonth] = useState(birthParts.month)
  const [birthYear, setBirthYear] = useState(birthParts.year)
  const [gender, setGender] = useState<Gender | undefined>(initialData?.gender || undefined)

  // Lifestyle data
  const [occupation, setOccupation] = useState(initialData?.occupation || '')
  const [education, setEducation] = useState(initialData?.education || '')
  const [height, setHeight] = useState<number | ''>(initialData?.height || '')
  const [drinking, setDrinking] = useState(initialData?.drinking || '')
  const [smoking, setSmoking] = useState(initialData?.smoking || '')
  const [children, setChildren] = useState(initialData?.children || '')

  // Location data
  const [postcode, setPostcode] = useState(initialData?.postcode || '')
  const [city, setCity] = useState(initialData?.city || '')
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null)
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null)
  const [locationMethod, setLocationMethod] = useState<'postcode' | 'city'>('postcode')

  // Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData?.preferences?.interests || []
  )
  const [lookingFor, setLookingFor] = useState<string>(
    initialData?.preferences?.genderPreference || ''
  )
  const [minAge, setMinAge] = useState(initialData?.preferences?.minAge || 18)
  const [maxAge, setMaxAge] = useState(initialData?.preferences?.maxAge || 99)

  // PsychProfile data
  const [relationshipGoal, setRelationshipGoal] = useState<string>(
    initialData?.psychProfile?.relationshipGoal || ''
  )
  const [introvertScale, setIntrovertScale] = useState<number>(
    initialData?.psychProfile?.introvertScale || 5
  )
  const [emotionalScale, setEmotionalScale] = useState<number>(
    initialData?.psychProfile?.emotionalScale || 5
  )
  const [spontaneityScale, setSpontaneityScale] = useState<number>(
    initialData?.psychProfile?.spontaneityScale || 5
  )
  const [adventureScale, setAdventureScale] = useState<number>(
    initialData?.psychProfile?.adventureScale || 5
  )
  const [conflictStyle, setConflictStyle] = useState<string>(
    initialData?.psychProfile?.conflictStyle || ''
  )
  const [communicationStyle, setCommunicationStyle] = useState<string>(
    initialData?.psychProfile?.communicationStyle || ''
  )
  // Love Languages
  const [loveLangWords, setLoveLangWords] = useState<number>(
    initialData?.psychProfile?.loveLangWords || 3
  )
  const [loveLangTime, setLoveLangTime] = useState<number>(
    initialData?.psychProfile?.loveLangTime || 3
  )
  const [loveLangGifts, setLoveLangGifts] = useState<number>(
    initialData?.psychProfile?.loveLangGifts || 3
  )
  const [loveLangActs, setLoveLangActs] = useState<number>(
    initialData?.psychProfile?.loveLangActs || 3
  )
  const [loveLangTouch, setLoveLangTouch] = useState<number>(
    initialData?.psychProfile?.loveLangTouch || 3
  )

  // Dealbreakers data
  const [mustNotSmoke, setMustNotSmoke] = useState<boolean>(
    initialData?.dealbreakers?.mustNotSmoke || false
  )
  const [mustNotDrink, setMustNotDrink] = useState<boolean>(
    initialData?.dealbreakers?.mustNotDrink || false
  )
  const [mustWantChildren, setMustWantChildren] = useState<boolean>(
    initialData?.dealbreakers?.mustWantChildren || false
  )
  const [mustBeVerified, setMustBeVerified] = useState<boolean>(
    initialData?.dealbreakers?.mustBeVerified || false
  )
  const [maxDistance, setMaxDistance] = useState<number>(
    initialData?.dealbreakers?.maxDistance || 50
  )

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const { put, isLoading, error: apiError } = usePut('/api/profile', {
    onSuccess: (data: any) => {
      setSuccessMessage('Profiel succesvol bijgewerkt!')
      onSuccess?.(data.profile)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setBio(initialData.bio || '')
      const parts = parseBirthDate(initialData.birthDate)
      setBirthDay(parts.day)
      setBirthMonth(parts.month)
      setBirthYear(parts.year)
      setGender(initialData.gender || undefined)
      setOccupation(initialData.occupation || '')
      setEducation(initialData.education || '')
      setHeight(initialData.height || '')
      setDrinking(initialData.drinking || '')
      setSmoking(initialData.smoking || '')
      setChildren(initialData.children || '')
      setPostcode(initialData.postcode || '')
      setCity(initialData.city || '')
      setLatitude(initialData.latitude || null)
      setLongitude(initialData.longitude || null)
      setSelectedInterests(initialData.preferences?.interests || [])
      setLookingFor(initialData.preferences?.genderPreference || '')
      setMinAge(initialData.preferences?.minAge || 18)
      setMaxAge(initialData.preferences?.maxAge || 99)
      // PsychProfile
      setRelationshipGoal(initialData.psychProfile?.relationshipGoal || '')
      setIntrovertScale(initialData.psychProfile?.introvertScale || 5)
      setEmotionalScale(initialData.psychProfile?.emotionalScale || 5)
      setSpontaneityScale(initialData.psychProfile?.spontaneityScale || 5)
      setAdventureScale(initialData.psychProfile?.adventureScale || 5)
      setConflictStyle(initialData.psychProfile?.conflictStyle || '')
      setCommunicationStyle(initialData.psychProfile?.communicationStyle || '')
      setLoveLangWords(initialData.psychProfile?.loveLangWords || 3)
      setLoveLangTime(initialData.psychProfile?.loveLangTime || 3)
      setLoveLangGifts(initialData.psychProfile?.loveLangGifts || 3)
      setLoveLangActs(initialData.psychProfile?.loveLangActs || 3)
      setLoveLangTouch(initialData.psychProfile?.loveLangTouch || 3)
      // Dealbreakers
      setMustNotSmoke(initialData.dealbreakers?.mustNotSmoke || false)
      setMustNotDrink(initialData.dealbreakers?.mustNotDrink || false)
      setMustWantChildren(initialData.dealbreakers?.mustWantChildren || false)
      setMustBeVerified(initialData.dealbreakers?.mustBeVerified || false)
      setMaxDistance(initialData.dealbreakers?.maxDistance || 50)
    }
  }, [initialData])

  // Handle postcode geocoding
  const handlePostcodeGeocode = (result: GeocodingResult) => {
    setCity(result.city)
    setLatitude(result.latitude)
    setLongitude(result.longitude)
  }

  // Handle city selection
  const handleCitySelect = (selectedCity: CityOption) => {
    setCity(selectedCity.name)
    setLatitude(selectedCity.latitude)
    setLongitude(selectedCity.longitude)
  }

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest)
      }
      if (prev.length >= MAX_INTERESTS) {
        return prev
      }
      return [...prev, interest]
    })
  }

  // Age slider handlers
  const handleMinAgeChange = useCallback((value: number) => {
    const newMin = Math.min(value, maxAge - 1)
    setMinAge(newMin)
  }, [maxAge])

  const handleMaxAgeChange = useCallback((value: number) => {
    const newMax = Math.max(value, minAge + 1)
    setMaxAge(newMax)
  }, [minAge])

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (name && name.length < 2) {
      newErrors.name = 'Naam moet minimaal 2 karakters zijn'
    }

    if (bio && bio.length > 500) {
      newErrors.bio = 'Bio mag maximaal 500 karakters zijn'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)

    if (!validateForm()) return

    // Combine day/month/year into birthDate format (YYYY-MM-DD)
    let birthDate: string | undefined = undefined
    if (birthDay && birthMonth && birthYear) {
      const date = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay))
      birthDate = date.toISOString().split('T')[0]
    }

    const preferences: UserPreferences = {
      interests: selectedInterests,
      genderPreference: lookingFor as Gender || undefined,
      minAge,
      maxAge,
    }

    const psychProfile: PsychProfileData = {
      relationshipGoal: relationshipGoal || undefined,
      introvertScale,
      emotionalScale,
      spontaneityScale,
      adventureScale,
      conflictStyle: conflictStyle || undefined,
      communicationStyle: communicationStyle || undefined,
      loveLangWords,
      loveLangTime,
      loveLangGifts,
      loveLangActs,
      loveLangTouch,
    }

    const dealbreakers: DealbreakersData = {
      mustNotSmoke,
      mustNotDrink,
      mustWantChildren,
      mustBeVerified,
      maxDistance,
    }

    await put({
      name: name || undefined,
      bio: bio || undefined,
      birthDate: birthDate || undefined,
      gender: gender || undefined,
      occupation: occupation || undefined,
      education: education || undefined,
      height: height || undefined,
      drinking: drinking || undefined,
      smoking: smoking || undefined,
      children: children || undefined,
      city: city || undefined,
      postcode: postcode || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      preferences,
      psychProfile,
      dealbreakers,
    })
  }

  // Calculate age range slider positions
  const minPercent = ((minAge - 18) / (99 - 18)) * 100
  const maxPercent = ((maxAge - 18) / (99 - 18)) * 100

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {apiError && (
        <Alert variant="error">
          {apiError.message}
        </Alert>
      )}

      {/* === BASIC INFO SECTION === */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Basis informatie
        </h3>

        <Input
          id="name"
          type="text"
          label="Naam"
          placeholder="Je volledige naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          fullWidth
          disabled={isLoading}
        />

        <Textarea
          id="bio"
          label="Bio"
          placeholder="Vertel iets over jezelf..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={errors.bio}
          fullWidth
          rows={4}
          maxLength={500}
          showCharCount
          disabled={isLoading}
        />

        {/* Geboortedatum - 3 losse velden (wereldklasse UX!) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Geboortedatum
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Dag"
                value={birthDay}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                  setBirthDay(val)
                }}
                disabled={isLoading}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">DD</p>
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Maand"
                value={birthMonth}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                  setBirthMonth(val)
                }}
                disabled={isLoading}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">MM</p>
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Jaar"
                value={birthYear}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setBirthYear(val)
                }}
                disabled={isLoading}
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">JJJJ</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Bijv. 15 - 06 - 1990 (Je moet minimaal 18 jaar zijn)
          </p>
        </div>

        <Select
          id="gender"
          label="Geslacht"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          fullWidth
          disabled={isLoading}
          options={[
            { value: Gender.MALE, label: 'Man' },
            { value: Gender.FEMALE, label: 'Vrouw' },
            { value: Gender.NON_BINARY, label: 'Non-binair' },
          ]}
        />
      </section>

      {/* === LIFESTYLE SECTION === */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-rose-500" />
          Werk & Lifestyle
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="occupation"
            type="text"
            label="Beroep"
            placeholder="Bijv. Software Developer"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            fullWidth
            disabled={isLoading}
            startIcon={<Briefcase className="w-4 h-4" />}
          />

          <Input
            id="education"
            type="text"
            label="Opleiding"
            placeholder="Bijv. HBO Informatica"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            fullWidth
            disabled={isLoading}
            startIcon={<GraduationCap className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Ruler className="w-4 h-4 inline mr-1" />
              Lengte (cm)
            </label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : '')}
              fullWidth
              disabled={isLoading}
              min={120}
              max={220}
            />
          </div>

          <Select
            id="drinking"
            label="Alcohol"
            value={drinking}
            onChange={(e) => setDrinking(e.target.value)}
            fullWidth
            disabled={isLoading}
            options={drinkingOptions}
          />

          <Select
            id="smoking"
            label="Roken"
            value={smoking}
            onChange={(e) => setSmoking(e.target.value)}
            fullWidth
            disabled={isLoading}
            options={smokingOptions}
          />

          <Select
            id="children"
            label="Kinderen"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            fullWidth
            disabled={isLoading}
            options={childrenOptions}
          />
        </div>
      </section>

      {/* === LOCATION SECTION === */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          Locatie
        </h3>

        {/* Location method toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setLocationMethod('postcode')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              locationMethod === 'postcode'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Postcode
          </button>
          <button
            type="button"
            onClick={() => setLocationMethod('city')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              locationMethod === 'city'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Stad
          </button>
        </div>

        {/* Location input */}
        {locationMethod === 'postcode' ? (
          <PostcodeInput
            value={postcode}
            onChange={setPostcode}
            onGeocode={handlePostcodeGeocode}
            autoGeocode={true}
            disabled={isLoading}
          />
        ) : (
          <CityAutocomplete
            value={city}
            onChange={setCity}
            onSelect={handleCitySelect}
            disabled={isLoading}
          />
        )}

        {/* Location result */}
        {city && latitude && longitude && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{city}</p>
              {postcode && <p className="text-sm text-gray-500">{postcode}</p>}
            </div>
          </motion.div>
        )}
      </section>

      {/* === LOOKING FOR SECTION === */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Wie zoek je?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {lookingForOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLookingFor(option.value)}
              disabled={isLoading}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                lookingFor === option.value
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{option.label}</h4>
              <p className="text-sm text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* === AGE PREFERENCE SECTION === */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-500" />
          Leeftijdsvoorkeur
        </h3>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          {/* Age Display */}
          <div className="text-center mb-6">
            <span className="text-3xl font-bold text-rose-500">{minAge}</span>
            <span className="text-xl text-gray-400 mx-3">-</span>
            <span className="text-3xl font-bold text-rose-500">
              {maxAge === 99 ? '99+' : maxAge}
            </span>
            <p className="text-sm text-gray-500 mt-1">jaar oud</p>
          </div>

          {/* Dual Range Slider */}
          <div className="relative h-2 mb-6">
            <div className="absolute inset-0 bg-gray-200 rounded-full" />
            <div
              className="absolute h-full bg-rose-500 rounded-full"
              style={{
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`,
              }}
            />

            <input
              type="range"
              min={18}
              max={99}
              value={minAge}
              onChange={(e) => handleMinAgeChange(parseInt(e.target.value))}
              disabled={isLoading}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />

            <input
              type="range"
              min={18}
              max={99}
              value={maxAge}
              onChange={(e) => handleMaxAgeChange(parseInt(e.target.value))}
              disabled={isLoading}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: '18-25', min: 18, max: 25 },
              { label: '25-35', min: 25, max: 35 },
              { label: '35-45', min: 35, max: 45 },
              { label: '45-55', min: 45, max: 55 },
              { label: '55+', min: 55, max: 99 },
            ].map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => {
                  setMinAge(range.min)
                  setMaxAge(range.max)
                }}
                disabled={isLoading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  minAge === range.min && maxAge === range.max
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* === INTERESTS SECTION === */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          Interesses
        </h3>

        {/* Selected count */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: MAX_INTERESTS }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx < selectedInterests.length ? 'bg-rose-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {selectedInterests.length} / {MAX_INTERESTS} gekozen
          </span>
        </div>

        {/* Interest categories */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {INTEREST_CATEGORIES.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                {category.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {category.interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest)
                  const isDisabled = !isSelected && selectedInterests.length >= MAX_INTERESTS

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      disabled={isDisabled || isLoading}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-rose-500 text-white'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-rose-500 hover:text-rose-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {interest}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === PERSOONLIJKHEID SECTION === */}
      <section className="space-y-6 pt-6 border-t-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-rose-500" />
          Persoonlijkheid & Voorkeuren
        </h3>

        {/* Relationship Goal */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Target className="w-4 h-4 inline mr-1.5" />
            Wat zoek je in een relatie?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: 'casual', label: 'Casual', emoji: '🌟', desc: 'Geen druk' },
              { value: 'serious', label: 'Serieus', emoji: '💑', desc: 'Voor de lange termijn' },
              { value: 'marriage', label: 'Huwelijk', emoji: '💍', desc: 'Trouwen' },
              { value: 'open', label: 'Open', emoji: '🌈', desc: 'Flexibel' },
            ].map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => setRelationshipGoal(goal.value)}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 transition-all ${
                  relationshipGoal === goal.value
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-1">{goal.emoji}</div>
                <div className="font-semibold text-sm">{goal.label}</div>
                <div className="text-xs text-gray-500">{goal.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vibe Scales */}
        <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-4">Jouw persoonlijkheid</h4>

          {/* Introvert/Extravert Scale */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">🤫 Introvert</span>
              <span className="text-sm font-medium text-rose-600">{introvertScale}/10</span>
              <span className="text-sm text-gray-600">Extravert 🎉</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={introvertScale}
              onChange={(e) => setIntrovertScale(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Rationeel/Emotioneel Scale */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">🧠 Rationeel</span>
              <span className="text-sm font-medium text-rose-600">{emotionalScale}/10</span>
              <span className="text-sm text-gray-600">Emotioneel 💖</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={emotionalScale}
              onChange={(e) => setEmotionalScale(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Planner/Spontaan Scale */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">📅 Planner</span>
              <span className="text-sm font-medium text-rose-600">{spontaneityScale}/10</span>
              <span className="text-sm text-gray-600">Spontaan ✨</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={spontaneityScale}
              onChange={(e) => setSpontaneityScale(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Routine/Avontuurlijk Scale */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">🏠 Routine</span>
              <span className="text-sm font-medium text-rose-600">{adventureScale}/10</span>
              <span className="text-sm text-gray-600">Avontuurlijk 🗺️</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={adventureScale}
              onChange={(e) => setAdventureScale(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Communication & Conflict Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Communicatiestijl
            </label>
            <Select
              id="communicationStyle"
              value={communicationStyle}
              onChange={(e) => setCommunicationStyle(e.target.value)}
              fullWidth
              disabled={isLoading}
              options={[
                { value: '', label: 'Selecteer...' },
                { value: 'direct', label: 'Direct' },
                { value: 'diplomatic', label: 'Diplomatiek' },
                { value: 'analytical', label: 'Analytisch' },
                { value: 'expressive', label: 'Expressief' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Hoe ga je om met conflicten?
            </label>
            <Select
              id="conflictStyle"
              value={conflictStyle}
              onChange={(e) => setConflictStyle(e.target.value)}
              fullWidth
              disabled={isLoading}
              options={[
                { value: '', label: 'Selecteer...' },
                { value: 'AVOIDING', label: 'Vermijden' },
                { value: 'ACCOMMODATING', label: 'Toegeven' },
                { value: 'COMPETING', label: 'Winnen' },
                { value: 'COMPROMISING', label: 'Compromis' },
                { value: 'COLLABORATING', label: 'Samenwerken' },
              ]}
            />
          </div>
        </div>

        {/* Love Languages */}
        <div className="space-y-4 bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Love Languages - Hoe voel jij je het meest geliefd?
          </h4>

          <div className="space-y-4">
            {/* Words of Affirmation */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">💬 Bevestigende woorden</span>
                <span className="text-sm font-semibold text-rose-600">{loveLangWords}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={loveLangWords}
                onChange={(e) => setLoveLangWords(parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Quality Time */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">⏰ Quality time</span>
                <span className="text-sm font-semibold text-rose-600">{loveLangTime}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={loveLangTime}
                onChange={(e) => setLoveLangTime(parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Gifts */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">🎁 Cadeaus ontvangen</span>
                <span className="text-sm font-semibold text-rose-600">{loveLangGifts}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={loveLangGifts}
                onChange={(e) => setLoveLangGifts(parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Acts of Service */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">🤝 Behulpzaamheid</span>
                <span className="text-sm font-semibold text-rose-600">{loveLangActs}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={loveLangActs}
                onChange={(e) => setLoveLangActs(parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Physical Touch */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">🤗 Fysieke aanraking</span>
                <span className="text-sm font-semibold text-rose-600">{loveLangTouch}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={loveLangTouch}
                onChange={(e) => setLoveLangTouch(parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* === DEALBREAKERS SECTION === */}
      <section className="space-y-6 pt-6 border-t-2 border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-rose-500" />
            Dealbreakers & Filters
          </h3>
          <p className="text-sm text-gray-600">
            Stel je voorkeuren in om betere matches te krijgen
          </p>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
          {/* Must Not Smoke */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">🚭 Mag niet roken</p>
              <p className="text-sm text-gray-500">Alleen niet-rokers tonen</p>
            </div>
            <button
              type="button"
              onClick={() => setMustNotSmoke(!mustNotSmoke)}
              disabled={isLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                mustNotSmoke ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  mustNotSmoke ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Must Not Drink */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">🍺 Mag niet (regelmatig) drinken</p>
              <p className="text-sm text-gray-500">Alleen mensen die zelden/nooit drinken</p>
            </div>
            <button
              type="button"
              onClick={() => setMustNotDrink(!mustNotDrink)}
              disabled={isLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                mustNotDrink ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  mustNotDrink ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Must Want Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">👶 Moet kinderen willen</p>
              <p className="text-sm text-gray-500">Alleen mensen die kinderen willen</p>
            </div>
            <button
              type="button"
              onClick={() => setMustWantChildren(!mustWantChildren)}
              disabled={isLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                mustWantChildren ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  mustWantChildren ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Must Be Verified */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">✅ Moet geverifieerd zijn</p>
              <p className="text-sm text-gray-500">Alleen geverifieerde profielen</p>
            </div>
            <button
              type="button"
              onClick={() => setMustBeVerified(!mustBeVerified)}
              disabled={isLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                mustBeVerified ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  mustBeVerified ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Max Distance Slider */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">📍 Maximale afstand</h4>
              <p className="text-sm text-gray-600">Hoe ver mag je match wonen?</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-rose-500">{maxDistance}</span>
              <span className="text-lg text-gray-500 ml-1">km</span>
            </div>
          </div>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            disabled={isLoading}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>5 km</span>
            <span>50 km</span>
            <span>100 km</span>
            <span>200 km</span>
          </div>
        </div>
      </section>

      {/* === SUBMIT === */}
      {/* Sticky save button for mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
            {isLoading ? 'Bezig met opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>

      {/* Desktop save buttons */}
      <div className="hidden lg:flex gap-4 pt-4 border-t border-gray-200">
        <Button type="submit" variant="primary" isLoading={isLoading} size="lg">
          Opslaan
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          size="lg"
          onClick={() => {
            if (initialData) {
              setName(initialData.name || '')
              setBio(initialData.bio || '')
              const parts = parseBirthDate(initialData.birthDate)
              setBirthDay(parts.day)
              setBirthMonth(parts.month)
              setBirthYear(parts.year)
              setGender(initialData.gender || undefined)
              setOccupation(initialData.occupation || '')
              setEducation(initialData.education || '')
              setHeight(initialData.height || '')
              setDrinking(initialData.drinking || '')
              setSmoking(initialData.smoking || '')
              setChildren(initialData.children || '')
              setPostcode(initialData.postcode || '')
              setCity(initialData.city || '')
              setLatitude(initialData.latitude || null)
              setLongitude(initialData.longitude || null)
              setSelectedInterests(initialData.preferences?.interests || [])
              setLookingFor(initialData.preferences?.genderPreference || '')
              setMinAge(initialData.preferences?.minAge || 18)
              setMaxAge(initialData.preferences?.maxAge || 99)
              // Reset PsychProfile
              setRelationshipGoal(initialData.psychProfile?.relationshipGoal || '')
              setIntrovertScale(initialData.psychProfile?.introvertScale || 5)
              setEmotionalScale(initialData.psychProfile?.emotionalScale || 5)
              setSpontaneityScale(initialData.psychProfile?.spontaneityScale || 5)
              setAdventureScale(initialData.psychProfile?.adventureScale || 5)
              setConflictStyle(initialData.psychProfile?.conflictStyle || '')
              setCommunicationStyle(initialData.psychProfile?.communicationStyle || '')
              setLoveLangWords(initialData.psychProfile?.loveLangWords || 3)
              setLoveLangTime(initialData.psychProfile?.loveLangTime || 3)
              setLoveLangGifts(initialData.psychProfile?.loveLangGifts || 3)
              setLoveLangActs(initialData.psychProfile?.loveLangActs || 3)
              setLoveLangTouch(initialData.psychProfile?.loveLangTouch || 3)
              // Reset Dealbreakers
              setMustNotSmoke(initialData.dealbreakers?.mustNotSmoke || false)
              setMustNotDrink(initialData.dealbreakers?.mustNotDrink || false)
              setMustWantChildren(initialData.dealbreakers?.mustWantChildren || false)
              setMustBeVerified(initialData.dealbreakers?.mustBeVerified || false)
              setMaxDistance(initialData.dealbreakers?.maxDistance || 50)
            }
          }}
        >
          Annuleren
        </Button>
      </div>
    </form>
  )
}
