/**
 * Email Verification Confirmation Page
 *
 * Clean design matching login page style
 * Shows BEFORE actually verifying - prevents email scanners from consuming tokens
 */

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import Image from 'next/image'
import { Button, Alert } from '@/components/ui'

function ConfirmVerificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const name = searchParams.get('name')

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
            Welkom{name ? `, ${name}` : ''}!
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
