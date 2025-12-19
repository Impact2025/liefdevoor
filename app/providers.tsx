'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { AdaptiveUIProvider } from '@/components/adaptive'
import { InstallPrompt, IOSInstallInstructions } from '@/components/ui'
import { analytics, identifyUser } from '@/lib/analytics'

// Analytics tracker component
function AnalyticsTracker() {
  const { data: session } = useSession()

  useEffect(() => {
    analytics.init()
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      identifyUser(session.user.email, {
        email: session.user.email,
        name: session.user.name || undefined,
      })
    }
  }, [session])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance per component mount
  // This ensures SSR compatibility
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global defaults for all queries
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <AdaptiveUIProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AnalyticsTracker />
          {children}
          <InstallPrompt delay={10000} />
          <IOSInstallInstructions />
        </SessionProvider>
      </QueryClientProvider>
    </AdaptiveUIProvider>
  )
}
