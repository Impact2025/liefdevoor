/**
 * MultiStepRegisterForm Component
 *
 * World-class multi-step registration flow
 * - Simple enough for LVB users
 * - Professional enough for everyone
 * - Smooth animations & progress tracking
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Button, Select, Checkbox, Alert } from '@/components/ui'
import { usePost } from '@/hooks'
import type { RegisterFormData } from '@/lib/types'
import { Gender } from '@prisma/client'

export interface MultiStepRegisterFormProps {
  onSuccess?: () => void
}

// Step configuration
const STEPS = [
  { id: 1, title: 'Account', description: 'Maak je account aan' },
  { id: 2, title: 'Over jou', description: 'Vertel over jezelf' },
  { id: 3, title: 'Profiel', description: 'Maak je profiel compleet' },
  { id: 4, title: 'Foto', description: 'Voeg een foto toe (optioneel)' },
]

export function MultiStepRegisterForm({ onSuccess }: MultiStepRegisterFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RegisterFormData & { city?: string; bio?: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: Gender.MALE,
    city: '',
    bio: '',
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const { post, isLoading, error: apiError } = usePost('/api/register', {
    onSuccess: () => {
      onSuccess?.()
      router.push('/verify-email?email=' + encodeURIComponent(formData.email))
    },
  })

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<string, string>> = {}

    if (step === 1) {
      // Name
      if (!formData.name) {
        newErrors.name = 'Naam is verplicht'
      } else if (formData.name.length < 2) {
        newErrors.name = 'Naam moet minimaal 2 karakters zijn'
      }

      // Email
      if (!formData.email) {
        newErrors.email = 'Email is verplicht'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Ongeldig email adres'
      }

      // Password
      if (!formData.password) {
        newErrors.password = 'Wachtwoord is verplicht'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Wachtwoord moet minimaal 8 karakters zijn'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Wachtwoord moet een hoofdletter, kleine letter en cijfer bevatten'
      }

      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Wachtwoorden komen niet overeen'
      }
    }

    if (step === 2) {
      // Birth date
      if (!formData.birthDate) {
        newErrors.birthDate = 'Geboortedatum is verplicht'
      } else {
        const birthDate = new Date(formData.birthDate)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 18) {
          newErrors.birthDate = 'Je moet minimaal 18 jaar oud zijn'
        } else if (age > 100) {
          newErrors.birthDate = 'Ongeldige geboortedatum'
        }
      }
    }

    if (step === 3) {
      // City (optional but recommended)
      if (formData.city && formData.city.length < 2) {
        newErrors.city = 'Ongeldige plaatsnaam'
      }

      // Bio (optional)
      if (formData.bio && formData.bio.length > 500) {
        newErrors.bio = 'Bio mag maximaal 500 karakters zijn'
      }

      // Terms (only checked in step 3)
      if (!formData.acceptedTerms) {
        newErrors.acceptedTerms = 'Je moet akkoord gaan met de voorwaarden'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    await post({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      birthDate: formData.birthDate,
      gender: formData.gender,
      city: formData.city,
      bio: formData.bio,
    })
  }

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'acceptedTerms'
      ? (e.target as HTMLInputElement).checked
      : e.target.value

    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSkipPhoto = () => {
    handleSubmit()
  }

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  const [[page, direction], setPage] = useState([0, 0])

  React.useEffect(() => {
    setPage([currentStep, currentStep > page ? 1 : -1])
  }, [currentStep])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 ${step.id !== STEPS.length ? 'mr-2' : ''}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  step.id <= currentStep
                    ? 'bg-primary-600'
                    : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Stap {currentStep} van {STEPS.length}
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-sm text-gray-600">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {apiError && (
        <Alert variant="error" className="mb-6">
          {apiError.message}
        </Alert>
      )}

      {/* Form Steps */}
      <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="space-y-6"
          >
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <>
                {/* Social Login Option */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    size="lg"
                    onClick={() => {/* TODO: Implement Google OAuth */}}
                    className="border-2"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Doorgaan met Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        Of met email
                      </span>
                    </div>
                  </div>
                </div>

                <Input
                  id="name"
                  type="text"
                  label="Naam"
                  placeholder="Je volledige naam"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                  fullWidth
                  required
                  disabled={isLoading}
                  autoFocus
                  startIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />

                <Input
                  id="email"
                  type="email"
                  label="Email adres"
                  placeholder="jouw@email.nl"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  fullWidth
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  startIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />

                <Input
                  id="password"
                  type="password"
                  label="Wachtwoord"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  helperText="Min. 8 karakters, met hoofdletter en cijfer"
                  startIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                />

                <Input
                  id="confirmPassword"
                  type="password"
                  label="Bevestig wachtwoord"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={errors.confirmPassword}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  startIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
              </>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <>
                <Input
                  id="birthDate"
                  type="date"
                  label="Geboortedatum"
                  value={formData.birthDate}
                  onChange={handleChange('birthDate')}
                  error={errors.birthDate}
                  fullWidth
                  required
                  disabled={isLoading}
                  autoFocus
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                    .toISOString()
                    .split('T')[0]}
                />

                <Select
                  id="gender"
                  label="Geslacht"
                  value={formData.gender}
                  onChange={handleChange('gender')}
                  fullWidth
                  required
                  disabled={isLoading}
                  options={[
                    { value: Gender.MALE, label: 'Man' },
                    { value: Gender.FEMALE, label: 'Vrouw' },
                    { value: Gender.NON_BINARY, label: 'Non-binair' },
                  ]}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Je leeftijd wordt berekend uit je geboortedatum en wordt op je profiel getoond.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Profile Details */}
            {currentStep === 3 && (
              <>
                <Input
                  id="city"
                  type="text"
                  label="Woonplaats"
                  placeholder="Bijvoorbeeld: Amsterdam"
                  value={formData.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                  fullWidth
                  disabled={isLoading}
                  autoFocus
                  helperText="Optioneel, maar helpt bij het vinden van matches in de buurt"
                  startIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                />

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Over jezelf
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    placeholder="Vertel iets over jezelf... Wat zijn je hobby's? Waar hou je van?"
                    value={formData.bio}
                    onChange={handleChange('bio')}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.bio?.length || 0} / 500 karakters
                  </p>
                </div>

                <Checkbox
                  id="acceptedTerms"
                  label={
                    <span>
                      Ik ga akkoord met de{' '}
                      <a href="/terms" target="_blank" className="text-primary-600 hover:underline">
                        algemene voorwaarden
                      </a>{' '}
                      en{' '}
                      <a href="/privacy" target="_blank" className="text-primary-600 hover:underline">
                        privacybeleid
                      </a>
                    </span>
                  }
                  checked={formData.acceptedTerms}
                  onChange={handleChange('acceptedTerms')}
                  error={errors.acceptedTerms}
                  disabled={isLoading}
                />
              </>
            )}

            {/* Step 4: Photo Upload */}
            {currentStep === 4 && (
              <>
                <div className="text-center py-8">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Voeg een profielfoto toe
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Profielen met een foto krijgen 10x meer matches!
                  </p>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      size="lg"
                      disabled
                    >
                      📸 Foto uploaden
                    </Button>

                    <p className="text-xs text-gray-500">
                      Je kunt ook later een foto toevoegen in je profiel
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ℹ️ Foto upload wordt in de volgende update toegevoegd. Je kunt nu eerst je account aanmaken.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1"
          >
            ← Terug
          </Button>
        )}

        {currentStep < STEPS.length ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            Volgende →
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            isLoading={isLoading}
            className="flex-1"
            size="lg"
          >
            Account aanmaken
          </Button>
        )}
      </div>

      {/* Skip photo option in step 4 */}
      {currentStep === 4 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleSkipPhoto}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Overslaan en account aanmaken
          </button>
        </div>
      )}

      {/* Login Link */}
      {currentStep === 1 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Heb je al een account?{' '}
          <a href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Log hier in
          </a>
        </div>
      )}
    </div>
  )
}
