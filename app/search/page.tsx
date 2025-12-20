/**
 * Search Page
 *
 * Advanced search for finding specific profiles
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout'
import { PageLoading } from '@/components/ui'

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <PageLoading />
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AppHeader title="Zoekopdracht" subtitle="Vind je perfecte match" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Binnenkort beschikbaar
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Hier kun je straks uitgebreid zoeken naar profielen op basis van je voorkeuren. Deze functie is momenteel in ontwikkeling.
          </p>
        </div>
      </main>
    </div>
  )
}
