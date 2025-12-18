'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AdaptiveUIProvider } from '@/components/adaptive'

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
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </AdaptiveUIProvider>
  )
}
