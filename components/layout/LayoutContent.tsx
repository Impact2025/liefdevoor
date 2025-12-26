'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navigation } from '@/components/layout/Navigation'
import { CookieBanner } from '@/components/legal/CookieBanner'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
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

      {/* Support Chatbot - Contextual display on help/support pages only */}
      {shouldShowChatbot && <Chatbot />}
    </>
  )
}
