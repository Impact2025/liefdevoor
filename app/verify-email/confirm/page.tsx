/**
 * Email Verification Confirmation Page
 *
 * Clean design matching login page style
 * Validates token on load, then shows confirm button
 * Direct link from email (no API redirect needed)
 */

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Button, Alert } from '@/components/ui'

type ValidationState = 'loading' | 'valid' | 'invalid' | 'expired' | 'already_verified' | 'error'

function ConfirmVerificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationState, setValidationState] = useState<ValidationState>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const token = searchParams.get('token')
  // Fallback to URL params if API hasn't loaded yet
  const urlEmail = searchParams.get('email')
  const urlName = searchParams.get('name')

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationState('invalid')
      setError('Ongeldige verificatie link - geen token gevonden')
      return
    }

    const validateTokenOnLoad = async () => {
      try {
        const response = await fetch(`/api/auth/verify-status?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setValidationState('valid')
          setEmail(data.email || urlEmail)
          setUserName(data.userName || urlName)
        } else {
          // Map error codes to states
          switch (data.errorCode) {
            case 'EXPIRED':
              setValidationState('expired')
              setEmail(data.email)
              break
            case 'ALREADY_VERIFIED':
              setValidationState('already_verified')
              setEmail(data.email)
              break
            default:
              setValidationState('invalid')
          }
          setError(data.message)
        }
      } catch (err) {
        console.error('[Verify] Validation error:', err)
        setValidationState('error')
        setError('Kon de link niet valideren. Probeer het opnieuw.')
      }
    }

    validateTokenOnLoad()
  }, [token, urlEmail, urlName])

  const handleConfirm = async () => {
    if (!token) {
      setError('Ongeldige verificatie link')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Verificatie mislukt')
      }

      // Success! Redirect to login with verified flag
      router.push('/login?verified=true')
    } catch (err) {
      console.error('[Verify] Error:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) return

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (data.success) {
        setError(null)
        alert('Nieuwe verificatie link verstuurd! Check je email.')
      }
    } catch (err) {
      console.error('[Resend] Error:', err)
    }
  }

  // Loading state
  if (validationState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={280}
              height={80}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Verificatie link controleren...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error states
  if (validationState === 'invalid' || validationState === 'error') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={280}
              height={80}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ongeldige link</h2>
            <p className="text-slate-600 mb-6">{error || 'Deze verificatie link is niet geldig.'}</p>
            <Button variant="secondary" fullWidth onClick={() => router.push('/login')}>
              Naar inloggen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Expired state
  if (validationState === 'expired') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={280}
              height={80}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Link verlopen</h2>
            <p className="text-slate-600 mb-6">Deze verificatie link is verlopen. Vraag een nieuwe aan.</p>
            {email && (
              <p className="text-sm text-slate-500 mb-4">{email}</p>
            )}
            <Button variant="primary" fullWidth onClick={handleResend}>
              Nieuwe link aanvragen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Already verified state
  if (validationState === 'already_verified') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={280}
              height={80}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Al geverifieerd!</h2>
            <p className="text-slate-600 mb-6">Je account is al geactiveerd. Je kunt direct inloggen.</p>
            <Button variant="primary" fullWidth onClick={() => router.push('/login')}>
              Naar inloggen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Valid state - show confirm button
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={280}
              height={80}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Bevestig je email om je account te activeren
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Welkom{userName ? `, ${userName}` : ''}!
          </h2>
          <p className="text-slate-600 text-sm text-center mb-6">
            Klik op de knop om je account te activeren
          </p>

          {/* Email Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg
                  className="w-5 h-5 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Email adres</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {email || 'Laden...'}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-emerald-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Confirm Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleConfirm}
            isLoading={isVerifying}
            disabled={isVerifying || !token}
          >
            {isVerifying ? 'Account activeren...' : 'Activeer mijn account'}
          </Button>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Beveiligde verificatie</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Niet aangemeld?{' '}
            <a
              href="/contact"
              className="text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Meld het ons
            </a>
          </p>
        </div>

        {/* Trust Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Na activatie word je doorgestuurd naar inloggen</span>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Laden...</p>
      </div>
    </div>
  )
}

export default function ConfirmVerificationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmVerificationContent />
    </Suspense>
  )
}
