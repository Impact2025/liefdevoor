/**
 * MultiStepRegisterForm Component - World-Class Edition
 *
 * Premium registration flow with:
 * - Real-time email availability checking
 * - Live password strength feedback
 * - Smart name validation
 * - Professional error handling with detailed feedback
 * - Smooth animations and haptic feedback
 */

'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Button, Checkbox, Alert, Turnstile, useTurnstile } from '@/components/ui'
import { usePost } from '@/hooks'
import {
  Check,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Sparkles
} from 'lucide-react'

export interface MultiStepRegisterFormProps {
  onSuccess?: () => void
}

interface FormData {
  email: string
  password: string
  name: string
  acceptedTerms: boolean
}

interface EmailCheckState {
  checking: boolean
  available: boolean | null
  message: string
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

// Name validation
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/
const validateName = (name: string): { valid: boolean; message: string } => {
  if (!name) return { valid: false, message: 'Naam is verplicht' }
  if (name.length < 2) return { valid: false, message: 'Naam moet minimaal 2 tekens zijn' }
  if (name.length > 50) return { valid: false, message: 'Naam mag maximaal 50 tekens zijn' }
  if (!NAME_REGEX.test(name)) return { valid: false, message: 'Naam mag alleen letters bevatten' }
  return { valid: true, message: '' }
}

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validateEmail = (email: string): { valid: boolean; message: string } => {
  if (!email) return { valid: false, message: 'Email is verplicht' }
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: 'Voer een geldig email adres in' }
  if (email.length > 255) return { valid: false, message: 'Email is te lang' }
  return { valid: true, message: '' }
}

// API Error mapping for user-friendly messages
const getErrorMessage = (error: string): { title: string; description: string; action?: string } => {
  const errorMap: Record<string, { title: string; description: string; action?: string }> = {
    'Er bestaat al een account met dit emailadres': {
      title: 'Email al in gebruik',
      description: 'Er bestaat al een account met dit emailadres.',
      action: 'Probeer in te loggen of gebruik een ander emailadres.'
    },
    'Naam bevat ongeldige tekens': {
      title: 'Ongeldige naam',
      description: 'Je naam mag alleen letters, spaties en streepjes bevatten.',
      action: 'Verwijder speciale tekens uit je naam.'
    },
    'Wachtwoord moet minimaal 8 tekens bevatten': {
      title: 'Wachtwoord te kort',
      description: 'Je wachtwoord moet minimaal 8 tekens bevatten.',
      action: 'Kies een langer wachtwoord.'
    },
    'Rate limit exceeded': {
      title: 'Te veel pogingen',
      description: 'Je hebt te veel registratiepogingen gedaan.',
      action: 'Wacht een paar minuten en probeer opnieuw.'
    },
  }

  // Find matching error or return default
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  return {
    title: 'Er ging iets mis',
    description: error || 'Er is een onverwachte fout opgetreden.',
    action: 'Probeer het opnieuw of neem contact op met support.'
  }
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function MultiStepRegisterForm({ onSuccess }: MultiStepRegisterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams?.get('source') // Track doelgroep source (e.g., 'visueel', 'autisme', 'lvb')

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
  const [emailCheck, setEmailCheck] = useState<EmailCheckState>({
    checking: false,
    available: null,
    message: '',
  })
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Turnstile state voor bot protection
  const {
    token: turnstileToken,
    setToken: setTurnstileToken,
    resetToken: resetTurnstileToken,
    waitForToken
  } = useTurnstile()
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false)

  // Debounced email for availability check
  const debouncedEmail = useDebounce(formData.email, 500)

  const { post, isLoading, error: apiError } = usePost('/api/register', {
    onSuccess: () => {
      setShowSuccessAnimation(true)
      setTimeout(() => {
        onSuccess?.()
        router.push('/verify-email?email=' + encodeURIComponent(formData.email))
      }, 1500)
    },
    onError: () => {
      // Reset Turnstile token zodat gebruiker opnieuw kan proberen
      resetTurnstileToken()
    },
  })

  // Check email availability
  useEffect(() => {
    const checkEmail = async () => {
      const emailValidation = validateEmail(debouncedEmail)
      if (!emailValidation.valid) {
        setEmailCheck({ checking: false, available: null, message: '' })
        return
      }

      setEmailCheck({ checking: true, available: null, message: 'Controleren...' })

      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: debouncedEmail }),
        })

        if (res.ok) {
          const data = await res.json()
          setEmailCheck({
            checking: false,
            available: data.available,
            message: data.available ? 'Email is beschikbaar' : 'Dit email is al in gebruik',
          })
        } else {
          // API doesn't exist yet, assume available
          setEmailCheck({ checking: false, available: true, message: '' })
        }
      } catch {
        // Silently fail - email will be validated on submit
        setEmailCheck({ checking: false, available: null, message: '' })
      }
    }

    if (debouncedEmail) {
      checkEmail()
    }
  }, [debouncedEmail])

  // Live password validation
  const passwordChecks = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      passed: req.test(formData.password),
    }))
  }, [formData.password])

  const isPasswordValid = passwordChecks.every((check) => check.passed)
  const passwordStrength = passwordChecks.filter((c) => c.passed).length

  // Live name validation
  const nameValidation = useMemo(() => {
    if (!formData.name) return { valid: true, message: '' } // Don't show error before typing
    return validateName(formData.name)
  }, [formData.name])

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<string, string>> = {}

    if (step === 1) {
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.message
      } else if (emailCheck.available === false) {
        newErrors.email = 'Dit emailadres is al in gebruik'
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
      const nameVal = validateName(formData.name)
      if (!nameVal.valid) {
        newErrors.name = nameVal.message
      }

      if (!formData.acceptedTerms) {
        newErrors.acceptedTerms = 'Je moet akkoord gaan met de voorwaarden'
      }
      // Turnstile check wordt nu automatisch gedaan bij submit via waitForToken
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
    // Wacht automatisch op Turnstile token als nog niet klaar
    let tokenToUse = turnstileToken
    const shouldEnforce = process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    if (shouldEnforce && !tokenToUse) {
      setIsWaitingForVerification(true)
      tokenToUse = await waitForToken(10000) // Max 10 seconden wachten
      setIsWaitingForVerification(false)

      if (!tokenToUse) {
        setErrors(prev => ({
          ...prev,
          turnstile: 'Beveiligingsverificatie duurde te lang. Probeer opnieuw.'
        }))
        return
      }
    }

    await post({
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      turnstileToken: tokenToUse, // Turnstile verification token
      source: source || undefined, // Track doelgroep source for auto-enabling accessibility
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

  // Success Animation Overlay
  if (showSuccessAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account aangemaakt!</h2>
        <p className="text-slate-600">Je wordt doorgestuurd...</p>
        <div className="mt-4 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
        </div>
      </motion.div>
    )
  }

  // Parse API error for display
  const parsedError = apiError ? getErrorMessage(apiError.message) : null

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
                    ? 'bg-rose-500'
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

      {/* Enhanced Error Message */}
      <AnimatePresence>
        {parsedError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-800">{parsedError.title}</h3>
                  <p className="text-sm text-red-700 mt-1">{parsedError.description}</p>
                  {parsedError.action && (
                    <p className="text-sm text-red-600 mt-2 font-medium">{parsedError.action}</p>
                  )}
                </div>
              </div>
              {parsedError.title === 'Email al in gebruik' && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
                  >
                    Ga naar inloggen
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    endIcon={
                      emailCheck.checking ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : emailCheck.available === true ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : emailCheck.available === false ? (
                        <X className="w-4 h-4 text-red-500" />
                      ) : null
                    }
                  />
                  {/* Email availability message */}
                  {emailCheck.message && !errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-1.5 text-sm flex items-center gap-1.5 ${
                        emailCheck.available === false ? 'text-red-600' :
                        emailCheck.available === true ? 'text-green-600' :
                        'text-slate-500'
                      }`}
                    >
                      {emailCheck.checking && <Loader2 className="w-3 h-3 animate-spin" />}
                      {emailCheck.available === true && <Check className="w-3 h-3" />}
                      {emailCheck.available === false && <AlertCircle className="w-3 h-3" />}
                      {emailCheck.message}
                    </motion.p>
                  )}
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

                {/* Live Password Requirements */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    Je wachtwoord moet bevatten:
                  </p>
                  {passwordChecks.map((check) => (
                    <motion.div
                      key={check.id}
                      initial={false}
                      animate={{
                        color: check.passed ? '#16a34a' : '#64748b',
                      }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          scale: check.passed ? [1, 1.2, 1] : 1,
                          backgroundColor: check.passed ? '#dcfce7' : '#f1f5f9',
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                      >
                        {check.passed ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <X className="w-3 h-3 text-slate-400" />
                        )}
                      </motion.div>
                      <span>{check.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((idx) => {
                      const isActive = idx < passwordStrength
                      let color = 'bg-slate-200'
                      if (isActive) {
                        if (passwordStrength <= 1) color = 'bg-red-500'
                        else if (passwordStrength <= 2) color = 'bg-orange-500'
                        else if (passwordStrength <= 3) color = 'bg-yellow-500'
                        else color = 'bg-green-500'
                      }
                      return (
                        <motion.div
                          key={idx}
                          initial={false}
                          animate={{ backgroundColor: isActive ? undefined : '#e2e8f0' }}
                          className={`flex-1 h-1.5 rounded-full transition-colors ${color}`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                    {passwordStrength === 4 ? (
                      <>
                        <Sparkles className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 font-medium">Sterk wachtwoord!</span>
                      </>
                    ) : passwordStrength >= 2 ? (
                      'Bijna daar...'
                    ) : (
                      'Vul alle eisen in'
                    )}
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
                    error={errors.name || (!nameValidation.valid && formData.name ? nameValidation.message : undefined)}
                    fullWidth
                    required
                    disabled={isLoading}
                    autoFocus
                    startIcon={<User className="w-5 h-5" />}
                    endIcon={
                      formData.name && nameValidation.valid ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : null
                    }
                  />
                  {/* Name validation hint */}
                  {formData.name && !nameValidation.valid && !errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-sm text-amber-600 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {nameValidation.message}
                    </motion.p>
                  )}
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
                          className="text-rose-500 hover:text-rose-600 font-medium underline"
                        >
                          algemene voorwaarden
                        </a>{' '}
                        en{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-rose-500 hover:text-rose-600 font-medium underline"
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

                {/* Cloudflare Turnstile - Bot Protection */}
                <Turnstile
                  onSuccess={setTurnstileToken}
                  onError={() => {
                    setErrors((prev) => ({ ...prev, turnstile: 'Verificatie mislukt. Herlaad de pagina.' }))
                  }}
                  onExpire={resetTurnstileToken}
                  action="register"
                />
                {errors.turnstile && (
                  <p className="mt-2 text-sm text-red-600">{errors.turnstile}</p>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Je gegevens zijn veilig en versleuteld</span>
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
          disabled={
            isLoading ||
            isWaitingForVerification ||
            (currentStep === 1 && emailCheck.available === false) ||
            (currentStep === 2 && !isPasswordValid) ||
            (currentStep === 3 && !nameValidation.valid)
          }
          isLoading={(isLoading || isWaitingForVerification) && currentStep === STEPS.length}
          className="flex-1 bg-rose-500 hover:bg-rose-600"
          size="lg"
        >
          {currentStep < STEPS.length
            ? 'Volgende'
            : isWaitingForVerification
              ? 'Beveiliging controleren...'
              : 'Account aanmaken'}
        </Button>
      </div>

      {/* Login Link */}
      {currentStep === 1 && (
        <div className="mt-6 text-center text-sm text-slate-600">
          Heb je al een account?{' '}
          <a href="/login" className="text-rose-500 hover:text-rose-600 font-medium">
            Log hier in
          </a>
        </div>
      )}
    </div>
  )
}
