/**
 * Email Verification Confirmation Page - WORLD CLASS Edition
 *
 * This page shows BEFORE actually verifying the email
 * Prevents email security scanners from consuming tokens
 */

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Bijna klaar!
            </h1>
            <p className="text-rose-100">
              Bevestig je emailadres om je account te activeren
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Welcome Message */}
            <div className="mb-6">
              <p className="text-gray-700 text-lg mb-2">
                Welkom{name ? `, ${name}` : ''}!
              </p>
              <p className="text-gray-600 text-sm">
                Klik op onderstaande knop om je account te activeren en direct te beginnen met het ontdekken van nieuwe mensen.
              </p>
            </div>

            {/* Email Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Email adres</p>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="error" className="mb-6">
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
              className="mb-4"
            >
              {isVerifying ? 'Account activeren...' : 'Activeer mijn account'}
            </Button>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    Beveiligde verificatie
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Voor je veiligheid vragen we je om je email te bevestigen voordat je account wordt geactiveerd.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Heb je je niet aangemeld?{' '}
              <a
                href="/contact"
                className="text-rose-600 hover:text-rose-500 font-medium"
              >
                Meld het ons
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Na activatie word je doorgestuurd naar het inlogscherm
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="animate-pulse text-gray-500">Laden...</div>
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
