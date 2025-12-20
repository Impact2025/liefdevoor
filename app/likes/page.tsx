/**
 * Likes Page
 *
 * Shows users who liked you
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout'
import { PageLoading } from '@/components/ui'

export default function LikesPage() {
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
      <AppHeader title="Likes" subtitle="Mensen die jou leuk vinden" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-rose-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Binnenkort beschikbaar
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Hier kun je straks zien wie jou leuk vindt. Deze functie is momenteel in ontwikkeling.
          </p>
        </div>
      </main>
    </div>
  )
}
