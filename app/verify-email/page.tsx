/**
 * Email Verification Page
 *
 * Shown after registration - prompts user to verify email
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Button, Alert } from '@/components/ui'
import { usePost } from '@/hooks'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resendSuccess, setResendSuccess] = useState(false)

  const { post: resendEmail, isLoading } = usePost('/api/auth/resend-verification', {
    onSuccess: () => {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    },
  })

  const handleResend = async () => {
    await resendEmail({ email })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Email Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary-600"
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

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check je email!
          </h1>

          <p className="text-gray-600 mb-6">
            We hebben een verificatie email gestuurd naar:
          </p>

          {/* Email Address */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Wat nu?</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Open je email inbox</li>
              <li>2. Zoek de email van Liefde Voor Iedereen</li>
              <li>3. Klik op de grote knop &quot;Activeer mijn account&quot;</li>
              <li>4. Je wordt automatisch ingelogd!</li>
            </ol>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <Alert variant="success" className="mb-4">
              Email opnieuw verstuurd! Check je inbox.
            </Alert>
          )}

          {/* Resend Button */}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleResend}
            isLoading={isLoading}
            disabled={resendSuccess}
          >
            {resendSuccess ? 'Email verstuurd!' : 'Stuur opnieuw'}
          </Button>

          {/* Help Text */}
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">Zie je de email niet?</p>
            <ul className="space-y-1">
              <li>Check je spam/ongewenste berichten</li>
              <li>Wacht nog 1-2 minuten</li>
              <li>Controleer of je het juiste email adres hebt gebruikt</li>
            </ul>
          </div>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Terug naar login
            </a>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Problemen met verificatie?{' '}
            <a href="/contact" className="text-primary-600 hover:underline">
              Neem contact op
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="animate-pulse text-gray-500">Laden...</div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
