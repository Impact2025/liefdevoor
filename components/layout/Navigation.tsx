/**
 * Navigation Component - World Class Edition
 *
 * Professional Tinder-style bottom navigation for mobile
 * Features: Ontdek, De selectie, Zoek, Likes, Profiel
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Star,
  Search,
  Sparkles,
  User,
  MessageCircle,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  iconFilled?: React.ReactNode
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  // Don't show navigation on auth pages
  if (!session || pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null
  }

  const navItems: NavItem[] = [
    {
      name: 'Ontdek',
      href: '/discover',
      icon: <Heart size={24} strokeWidth={2} />,
      iconFilled: <Heart size={24} fill="currentColor" strokeWidth={0} />,
    },
    {
      name: 'De selectie',
      href: '/matches',
      icon: <Star size={24} strokeWidth={2} />,
      iconFilled: <Star size={24} fill="currentColor" strokeWidth={0} />,
    },
    {
      name: 'Zoek',
      href: '/search',
      icon: <Search size={24} strokeWidth={2} />,
      iconFilled: <Search size={24} strokeWidth={2.5} />,
    },
    {
      name: 'Likes',
      href: '/likes',
      icon: <Sparkles size={24} strokeWidth={2} />,
      iconFilled: <Sparkles size={24} fill="currentColor" strokeWidth={0} />,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/discover" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <Heart size={22} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-gray-900">DateApp</span>
            </Link>

            {/* Nav Items */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                      ${active
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    {active ? item.iconFilled || item.icon : item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Link
                href="/notifications"
                className={`p-2 rounded-xl transition-all ${
                  isActive('/notifications') ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Bell size={22} />
              </Link>
              <Link
                href="/settings"
                className={`p-2 rounded-xl transition-all ${
                  isActive('/settings') ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Settings size={22} />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-semibold text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>

                {/* Desktop Dropdown Menu */}
                <AnimatePresence>
                  {showMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMenu(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-4 bg-gradient-to-r from-rose-50 to-rose-100 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{session.user?.name}</p>
                          <p className="text-sm text-gray-600 truncate">{session.user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <User size={18} className="text-gray-500" />
                            <span className="text-gray-700">Mijn Profiel</span>
                          </Link>
                          <Link
                            href="/matches"
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <MessageCircle size={18} className="text-gray-500" />
                            <span className="text-gray-700">Berichten</span>
                          </Link>
                          <Link
                            href="/prijzen"
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <Sparkles size={18} className="text-amber-500" />
                            <span className="text-gray-700">Premium</span>
                          </Link>
                          <div className="my-2 border-t border-gray-100" />
                          <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                          >
                            <LogOut size={18} />
                            <span className="font-medium">Uitloggen</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for desktop top navigation */}
      <div className="hidden md:block h-16" />

      {/* Mobile Navigation - Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 safe-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.filter(item => !item.desktopOnly).map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-2 rounded-xl transition-all
                  ${active
                    ? 'text-rose-500'
                    : 'text-gray-400 active:bg-gray-50'
                  }
                `}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    ${active ? 'scale-110' : ''}
                    transition-transform
                  `}
                >
                  {active ? item.iconFilled || item.icon : item.icon}
                </motion.div>
                <span className={`
                  text-[10px] mt-1 font-semibold tracking-tight
                  ${active ? 'text-rose-500' : 'text-gray-500'}
                `}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Profile/Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`
              flex flex-col items-center justify-center py-2 rounded-xl transition-all
              ${pathname?.startsWith('/profile') || pathname?.startsWith('/settings')
                ? 'text-rose-500'
                : 'text-gray-400 active:bg-gray-50'
              }
            `}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <User size={24} strokeWidth={2} />
            </motion.div>
            <span className="text-[10px] mt-1 font-semibold tracking-tight text-gray-500">Profiel</span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMenu(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />

              {/* Menu Panel */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-lg">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{session.user?.name}</p>
                      <p className="text-sm text-gray-600 truncate">{session.user?.email}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <User size={20} className="text-rose-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Mijn Profiel</span>
                        <p className="text-sm text-gray-500">Bewerk je foto's en info</p>
                      </div>
                    </Link>

                    <Link
                      href="/matches"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <MessageCircle size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Berichten</span>
                        <p className="text-sm text-gray-500">Chat met je matches</p>
                      </div>
                    </Link>

                    <Link
                      href="/notifications"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bell size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Notificaties</span>
                        <p className="text-sm text-gray-500">Bekijk je meldingen</p>
                      </div>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Settings size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Instellingen</span>
                        <p className="text-sm text-gray-500">Privacy en voorkeuren</p>
                      </div>
                    </Link>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <LogOut size={20} className="text-red-600" />
                        </div>
                        <span className="font-semibold">Uitloggen</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Safe area for iPhone notch */}
                <div className="h-safe-bottom bg-white" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for mobile bottom navigation */}
      <div className="md:hidden h-20" />
    </>
  )
}
