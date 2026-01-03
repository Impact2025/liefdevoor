/**
 * Login Page - World-Class Edition
 *
 * With email verification success messages and brand styling
 */

'use client'

import { LoginForm } from '@/components/forms'
import { Alert } from '@/components/ui'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const registered = searchParams.get('registered')

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
            {verified ? 'Je account is actief! Log in om te beginnen.' : 'Welkom terug! Log in om verder te gaan.'}
          </p>
        </div>

        {/* Success Messages */}
        {verified && (
          <>
            <Alert variant="success" className="mb-4">
              Je email is geverifieerd! Je kunt nu inloggen.
            </Alert>
            {/* Hint for email app browser users */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Problemen met inloggen? Open deze pagina in je normale browser (Chrome/Safari) via het menu-icoontje rechtsboven.
              </p>
            </div>
          </>
        )}

        {registered && (
          <Alert variant="info" className="mb-6">
            Account aangemaakt! Check je email om je account te activeren.
          </Alert>
        )}

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Inloggen
          </h2>

          <LoginForm callbackUrl="/discover" />
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Nog geen account?{' '}
            <Link
              href="/register"
              className="text-rose-500 hover:text-rose-600 font-semibold transition-colors"
            >
              Registreer gratis
            </Link>
          </p>
        </div>

        {/* Trust Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Veilige SSL-verbinding</span>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  )
}
