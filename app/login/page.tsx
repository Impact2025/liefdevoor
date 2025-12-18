/**
 * Login Page - World-Class Edition
 *
 * With email verification success messages
 */

'use client'

import { LoginForm } from '@/components/forms'
import { Alert } from '@/components/ui'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const registered = searchParams.get('registered')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            💖 Liefde Voor Iedereen
          </h1>
          <p className="text-gray-600">
            {verified ? 'Je account is actief! Log in om te beginnen.' : 'Welkom terug! Log in om verder te gaan.'}
          </p>
        </div>

        {/* Success Messages */}
        {verified && (
          <Alert variant="success" className="mb-6">
            🎉 Je email is geverifieerd! Je kunt nu inloggen.
          </Alert>
        )}

        {registered && (
          <Alert variant="info" className="mb-6">
            Account aangemaakt! Check je email om je account te activeren.
          </Alert>
        )}

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Inloggen
          </h2>

          <LoginForm callbackUrl="/discover" />
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Nog geen account?{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Registreer gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <LoginContent />
    </Suspense>
  )
}
