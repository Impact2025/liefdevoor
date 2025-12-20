/**
 * MultiStepRegisterForm Component
 *
 * Simplified registration flow (OurTime-inspired):
 * - Step 1: Email
 * - Step 2: Password with LIVE feedback
 * - Step 3: Name + Terms
 *
 * Personal details (birthdate, gender, etc.) are collected in onboarding
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Button, Checkbox, Alert } from '@/components/ui'
import { usePost } from '@/hooks'
import { Check, X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export interface MultiStepRegisterFormProps {
  onSuccess?: () => void
}

interface FormData {
  email: string
  password: string
  name: string
  acceptedTerms: boolean
}

// Step configuration
const STEPS = [
  { id: 1, title: 'Email', description: 'Waar kunnen we je bereiken?' },
  { id: 2, title: 'Wachtwoord', description: 'Kies een veilig wachtwoord' },
  { id: 3, title: 'Je naam', description: 'Hoe mogen we je noemen?' },
]

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'Minimaal 8 tekens', test: (p: string) => p.length >= 8 },
  { id: 'lowercase', label: 'Een kleine letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'Een hoofdletter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'Een cijfer (0-9)', test: (p: string) => /[0-9]/.test(p) },
]

export function MultiStepRegisterForm({ onSuccess }: MultiStepRegisterFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [direction, setDirection] = useState(0)

  const { post, isLoading, error: apiError } = usePost('/api/register', {
    onSuccess: () => {
      onSuccess?.()
      router.push('/verify-email?email=' + encodeURIComponent(formData.email))
    },
  })

  // Live password validation
  const passwordChecks = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      passed: req.test(formData.password),
    }))
  }, [formData.password])

  const isPasswordValid = passwordChecks.every((check) => check.passed)

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<string, string>> = {}

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = 'Email is verplicht'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Ongeldig email adres'
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Wachtwoord is verplicht'
      } else if (!isPasswordValid) {
        newErrors.password = 'Wachtwoord voldoet niet aan alle eisen'
      }
    }

    if (step === 3) {
      if (!formData.name) {
        newErrors.name = 'Naam is verplicht'
      } else if (formData.name.length < 2) {
        newErrors.name = 'Naam moet minimaal 2 karakters zijn'
      }

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
        setDirection(1)
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    await post({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    })
  }

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptedTerms'
      ? e.target.checked
      : e.target.value

    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNext()
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/onboarding' })
  }

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

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
                    ? 'bg-pink-500'
                    : 'bg-slate-200'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Stap {currentStep} van {STEPS.length}
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-1">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-sm text-slate-600">
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
      <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
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
            {/* Step 1: Email */}
            {currentStep === 1 && (
              <>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    label="Email adres"
                    placeholder="jouw@email.nl"
                    value={formData.email}
                    onChange={handleChange('email')}
                    onKeyDown={handleKeyDown}
                    error={errors.email}
                    fullWidth
                    required
                    autoComplete="email"
                    disabled={isLoading}
                    autoFocus
                    startIcon={<Mail className="w-5 h-5" />}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600">
                    We sturen je een bevestigingsmail om je account te activeren.
                  </p>
                </div>

                {/* Social Login Option */}
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-500">
                        Of registreer met
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    size="lg"
                    onClick={handleGoogleSignIn}
                    className="mt-4 border-2 border-slate-200 hover:border-slate-300"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Password with LIVE feedback */}
            {currentStep === 2 && (
              <>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Kies je wachtwoord"
                    placeholder="Voer je wachtwoord in"
                    value={formData.password}
                    onChange={handleChange('password')}
                    onKeyDown={handleKeyDown}
                    error={errors.password}
                    fullWidth
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    autoFocus
                    startIcon={<Lock className="w-5 h-5" />}
                    endIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-slate-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Live Password Requirements - OurTime Style */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Je wachtwoord moet bevatten:
                  </p>
                  {passwordChecks.map((check) => (
                    <div
                      key={check.id}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        check.passed ? 'text-green-600' : 'text-slate-500'
                      }`}
                    >
                      {check.passed ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((idx) => {
                      const passedCount = passwordChecks.filter((c) => c.passed).length
                      const isActive = idx < passedCount
                      let color = 'bg-slate-200'
                      if (isActive) {
                        if (passedCount <= 1) color = 'bg-red-500'
                        else if (passedCount <= 2) color = 'bg-orange-500'
                        else if (passedCount <= 3) color = 'bg-yellow-500'
                        else color = 'bg-green-500'
                      }
                      return (
                        <div
                          key={idx}
                          className={`flex-1 h-1.5 rounded-full transition-colors ${color}`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {passwordChecks.filter((c) => c.passed).length === 4
                      ? 'Sterk wachtwoord'
                      : passwordChecks.filter((c) => c.passed).length >= 2
                      ? 'Bijna daar...'
                      : 'Vul alle eisen in'}
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Name + Terms */}
            {currentStep === 3 && (
              <>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    label="Je voornaam"
                    placeholder="Hoe heet je?"
                    value={formData.name}
                    onChange={handleChange('name')}
                    onKeyDown={handleKeyDown}
                    error={errors.name}
                    fullWidth
                    required
                    disabled={isLoading}
                    autoFocus
                    startIcon={<User className="w-5 h-5" />}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600">
                    Dit is de naam die andere gebruikers zien. Je kunt dit later nog aanpassen.
                  </p>
                </div>

                <div className="pt-2">
                  <Checkbox
                    id="acceptedTerms"
                    label={
                      <span className="text-slate-700">
                        Ik ga akkoord met de{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-pink-500 hover:text-pink-600 font-medium underline"
                        >
                          algemene voorwaarden
                        </a>{' '}
                        en{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-pink-500 hover:text-pink-600 font-medium underline"
                        >
                          privacybeleid
                        </a>
                      </span>
                    }
                    checked={formData.acceptedTerms}
                    onChange={handleChange('acceptedTerms')}
                    error={errors.acceptedTerms}
                    disabled={isLoading}
                  />
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
            className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Terug
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={isLoading || (currentStep === 2 && !isPasswordValid)}
          isLoading={isLoading && currentStep === STEPS.length}
          className="flex-1 bg-pink-500 hover:bg-pink-600"
          size="lg"
        >
          {currentStep < STEPS.length ? 'Volgende' : 'Account aanmaken'}
        </Button>
      </div>

      {/* Login Link */}
      {currentStep === 1 && (
        <div className="mt-6 text-center text-sm text-slate-600">
          Heb je al een account?{' '}
          <a href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
            Log hier in
          </a>
        </div>
      )}
    </div>
  )
}
