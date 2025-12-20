/**
 * Analytics Provider - World-Class Edition
 *
 * Handles automatic page tracking and user identification
 * with proper Suspense boundaries for Next.js 14+ compatibility
 */

'use client'

import { useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/gtag'
import { hasConsentFor } from '@/lib/cookie-consent'

/**
 * Internal component that handles page tracking with useSearchParams
 * Must be wrapped in Suspense boundary
 */
function PageTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && hasConsentFor('analytics')) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(url)
    }
  }, [pathname, searchParams])

  return null
}

/**
 * Internal component for user identification
 */
function UserIdentifier() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!hasConsentFor('analytics')) return

    if (session?.user && typeof window !== 'undefined' && window.gtag) {
      // Set user ID for cross-session tracking
      window.gtag('config', 'G-7DS7HL7B96', {
        user_id: session.user.id,
      })

      // Set user properties for segmentation
      window.gtag('set', 'user_properties', {
        user_id: session.user.id,
        subscription_tier: (session.user as any).subscriptionTier || 'FREE',
        is_verified: (session.user as any).isVerified || false,
        is_photo_verified: (session.user as any).isPhotoVerified || false,
        gender: (session.user as any).gender || 'unknown',
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] User identified:', session.user.id)
      }
    }
  }, [session])

  return null
}

/**
 * Main Analytics Provider with proper Suspense boundaries
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Page tracking wrapped in Suspense for SSR compatibility */}
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>

      {/* User identification (no Suspense needed - uses session) */}
      <UserIdentifier />

      {children}
    </>
  )
}
