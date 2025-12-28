/**
 * Email Verification Error Page - WORLD CLASS Edition
 *
 * Displays helpful error messages with actionable next steps
 */

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Button, Alert } from '@/components/ui'
import { usePost } from '@/hooks'

type ErrorReason = 'INVALID' | 'EXPIRED' | 'ALREADY_VERIFIED' | 'ERROR' | 'missing_token' | 'server_error'

interface ErrorConfig {
  icon: 'error' | 'warning' | 'success'
  title: string
  description: string
  actionText?: string
  actionType?: 'resend' | 'login' | 'contact'
  showEmail?: boolean
}

const ERROR_CONFIGS: Record<ErrorReason, ErrorConfig> = {
  INVALID: {
    icon: 'error',
    title: 'Ongeldige verificatie link',
    description: 'Deze verificatie link is niet geldig. Mogelijk is je account al geverifieerd of is de link incorrect.',
    actionText: 'Probeer opnieuw',
    actionType: 'resend',
    showEmail: true,
  },
  EXPIRED: {
    icon: 'warning',
    title: 'Verificatie link verlopen',
    description: 'Deze verificatie link is verlopen. Verificatie links zijn 24 uur geldig voor je veiligheid.',
    actionText: 'Nieuwe link aanvragen',
    actionType: 'resend',
    showEmail: true,
  },
  ALREADY_VERIFIED: {
    icon: 'success',
    title: 'Account al geverifieerd',
    description: 'Goed nieuws! Je account is al geverifieerd. Je kunt direct inloggen.',
    actionText: 'Ga naar login',
    actionType: 'login',
  },
  ERROR: {
    icon: 'error',
    title: 'Er ging iets mis',
    description: 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.',
    actionText: 'Contact opnemen',
    actionType: 'contact',
  },
  missing_token: {
    icon: 'error',
    title: 'Ontbrekende verificatie link',
    description: 'De verificatie link is incompleet. Check je email en klik opnieuw op de link.',
  },
  server_error: {
    icon: 'error',
    title: 'Server fout',
    description: 'Er is een tijdelijke server fout opgetreden. Probeer het over een paar minuten opnieuw.',
    actionText: 'Probeer opnieuw',
    actionType: 'resend',
  },
}

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [resendSuccess, setResendSuccess] = useState(false)

  const reason = (searchParams.get('reason') || 'ERROR') as ErrorReason
  const message = searchParams.get('message')
  const email = searchParams.get('email')

  const config = ERROR_CONFIGS[reason] || ERROR_CONFIGS.ERROR

  const { post: resendEmail, isLoading } = usePost('/api/auth/resend-verification', {
    onSuccess: () => {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    },
  })

  const handleAction = async () => {
    switch (config.actionType) {
      case 'resend':
        if (email) {
          await resendEmail({ email })
        }
        break
      case 'login':
        router.push('/login')
        break
      case 'contact':
        router.push('/contact')
        break
    }
  }

  const getIconSvg = () => {
    switch (config.icon) {
      case 'error':
        return (
          <svg
            className="w-12 h-12 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg
            className="w-12 h-12 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )
      case 'success':
        return (
          <svg
            className="w-12 h-12 text-green-500"
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
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            {getIconSvg()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {message || config.description}
          </p>

          {/* Email Display */}
          {config.showEmail && email && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm font-medium text-gray-900">{email}</p>
            </div>
          )}

          {/* Success Message */}
          {resendSuccess && (
            <Alert variant="success" className="mb-4">
              Nieuwe verificatie email verstuurd! Check je inbox.
            </Alert>
          )}

          {/* Action Button */}
          {config.actionText && config.actionType && (
            <Button
              variant={config.icon === 'success' ? 'primary' : 'secondary'}
              fullWidth
              onClick={handleAction}
              isLoading={isLoading}
              disabled={resendSuccess}
              className="mb-4"
            >
              {resendSuccess && config.actionType === 'resend' ? 'Email verstuurd!' : config.actionText}
            </Button>
          )}

          {/* Help Text */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Blijf je problemen ervaren?
            </p>
            <a
              href="/contact"
              className="text-sm text-rose-600 hover:text-rose-500 font-medium"
            >
              Neem contact op met support
            </a>
          </div>

          {/* Back to Home */}
          <div className="mt-6">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              ← Terug naar homepage
            </a>
          </div>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-300 font-mono">
              Debug: reason={reason}, email={email || 'none'}
            </p>
          </div>
        )}
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

export default function VerificationErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorPageContent />
    </Suspense>
  )
}
