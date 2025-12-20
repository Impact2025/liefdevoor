/**
 * Matches Page - Wereldklasse Edition
 *
 * Uses the new MatchList component for clean, reusable code
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MatchList } from '@/components/features'
import { PageLoading } from '@/components/ui'

export default function MatchesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  if (status === 'loading') {
    return <PageLoading />
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary-600">
            💬 Jouw Matches
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Start een gesprek met je matches
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden my-8 mx-4">
          <MatchList
            onMatchClick={(matchId) => router.push(`/chat/${matchId}`)}
          />
        </div>
      </div>
    </div>
  )
}
