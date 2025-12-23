'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navigation } from '@/components/layout/Navigation'
import { CookieBanner } from '@/components/legal/CookieBanner'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Don't show sidebar/navigation on admin pages
  const isAdminPage = pathname?.startsWith('/admin')

  // Don't apply sidebar padding on auth pages or landing page when not logged in
  const shouldShowSidebar = session &&
    !pathname?.startsWith('/login') &&
    !pathname?.startsWith('/register') &&
    !pathname?.startsWith('/onboarding') &&
    !isAdminPage

  // Don't show navigation on admin pages
  if (isAdminPage) {
    return (
      <>
        {children}
        <CookieBanner />
      </>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content with conditional sidebar offset on desktop */}
      <div className={shouldShowSidebar ? 'lg:pl-64' : ''}>
        <Navigation />
        {children}
      </div>

      <CookieBanner />
      <InstallPrompt />
    </>
  )
}
