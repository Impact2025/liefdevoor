/**
 * Global Error Handler - World-Class Edition
 *
 * Catches React rendering errors in the App Router
 * and reports them to Sentry for monitoring
 */

'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorType: 'global-error',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <html lang="nl">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
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
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oeps! Er ging iets mis
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              We hebben een onverwachte fout ontdekt. Ons team is op de hoogte gesteld en we werken aan een oplossing.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-gray-500 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 px-6 rounded-full font-bold hover:from-rose-600 hover:to-purple-700 transition-all shadow-lg"
              >
                Probeer opnieuw
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                Terug naar home
              </button>
            </div>

            {/* Support Link */}
            <p className="mt-6 text-sm text-gray-500">
              Blijft dit probleem zich voordoen?{' '}
              <a href="/contact" className="text-rose-600 hover:underline">
                Neem contact op
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
