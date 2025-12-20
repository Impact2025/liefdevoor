/**
 * Desktop Sidebar Navigation - Ourtime Style
 *
 * Left sidebar navigation for desktop, hidden on mobile
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Heart, MessageCircle, Search, User, ThumbsUp } from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Don't show sidebar on auth pages or when not logged in
  if (!session || pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/onboarding')) {
    return null
  }

  const sidebarItems: SidebarItem[] = [
    {
      name: 'Ontdek',
      href: '/discover',
      icon: <Heart className="w-6 h-6" />,
    },
    {
      name: 'Likes',
      href: '/likes',
      icon: <ThumbsUp className="w-6 h-6" />,
    },
    {
      name: 'Zoekopdracht',
      href: '/search',
      icon: <Search className="w-6 h-6" />,
    },
    {
      name: 'Berichten',
      href: '/matches',
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      name: 'Mijn profiel',
      href: '/profile',
      icon: <User className="w-6 h-6" />,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200">
        <Link href="/discover" className="flex items-center">
          <Image
            src="/images/LiefdevoorIedereen_logo.png"
            alt="Liefde Voor Iedereen"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                ${
                  active
                    ? 'bg-rose-50 text-rose-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className={active ? 'text-rose-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className="text-base">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <Link href="/terms" className="block hover:text-rose-600">
            Algemene voorwaarden
          </Link>
          <Link href="/privacy" className="block hover:text-rose-600">
            Privacybeleid
          </Link>
          <Link href="/help" className="block hover:text-rose-600">
            Help
          </Link>
        </div>
      </div>
    </aside>
  )
}
