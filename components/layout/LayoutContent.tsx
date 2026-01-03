'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navigation } from '@/components/layout/Navigation'
import { CookieBanner } from '@/components/legal/CookieBanner'
import { Chatbot } from '@/components/helpdesk/Chatbot'

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

  // Only show chatbot on support/help pages to avoid overlap with bottom navigation
  const chatbotPages = ['/support', '/settings', '/help', '/faq', '/contact']
  const shouldShowChatbot = session && chatbotPages.some(page => pathname?.startsWith(page))

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
    <div>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-rose-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Ga naar hoofdinhoud
      </a>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content with conditional sidebar offset on desktop */}
      <div className={shouldShowSidebar ? 'lg:pl-64' : ''}>
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>

      <CookieBanner />

      {/* Support Chatbot - Contextual display on help/support pages only */}
      {shouldShowChatbot && <Chatbot />}
    </div>
  )
}
