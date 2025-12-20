/**
 * Matches Page - Wereldklasse Edition
 *
 * Uses the new MatchList component for clean, reusable code
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MatchList } from '@/components/features'
import { AppHeader } from '@/components/layout'
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
    <div className="min-h-screen bg-stone-50">
      <AppHeader
        title="Matches"
        subtitle="Start een gesprek met je matches"
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden my-6 mx-4">
          <MatchList
            onMatchClick={(matchId) => router.push(`/chat/${matchId}`)}
          />
        </div>
      </div>
    </div>
  )
}
