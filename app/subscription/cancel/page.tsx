'use client'

import { useRouter } from 'next/navigation'

export default function SubscriptionCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Betaling geannuleerd
        </h1>

        <p className="text-gray-600 mb-6">
          Je hebt de betaling geannuleerd. Geen zorgen, je kunt altijd later upgraden!
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">Wat nu?</h2>
          <ul className="text-sm text-blue-800 space-y-2 text-left">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Je kunt de gratis functies blijven gebruiken
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Upgrade later wanneer je klaar bent
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Start nu met matchen!
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/subscription')}
            className="w-full bg-stone-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition-colors"
          >
            Bekijk abonnementen
          </button>

          <button
            onClick={() => router.push('/discover')}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Ga naar Discover
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
          >
            Terug naar home
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          💡 Tip: Premium gebruikers hebben 5x meer matches!
        </p>
      </div>
    </div>
  )
}
