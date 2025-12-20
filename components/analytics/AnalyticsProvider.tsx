/**
 * Analytics Provider
 * Handles automatic page tracking and user identification
 */

'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePageTracking } from '@/hooks/usePageTracking'
import { hasConsentFor } from '@/lib/cookie-consent'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  // Automatic page view tracking
  usePageTracking()

  // User identification
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

      console.log('[Analytics] User identified:', session.user.id)
    }
  }, [session])

  return <>{children}</>
}
