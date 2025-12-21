/**
 * Navigation Component - World Class Desktop & Mobile Edition
 *
 * Desktop: Sidebar navigation like Ourtime
 * Mobile: Bottom navigation like Tinder
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
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
  Zap,
  EyeOff,
  Crown,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  iconFilled?: React.ReactNode
}

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)

  // Fetch user data
  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile?.profileImage) {
            setUserPhoto(data.profile.profileImage)
          }
        })
        .catch(console.error)

      fetch('/api/subscription')
        .then(res => res.json())
        .then(data => {
          setIsPremium(data.isPlus || data.isComplete)
        })
        .catch(console.error)
    }
  }, [session])

  // Don't show navigation on auth pages
  if (!session || pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/onboarding')) {
    return null
  }

  const navItems: NavItem[] = [
    {
      name: 'Ontdek',
      href: '/discover',
      icon: <Heart size={22} strokeWidth={2} />,
      iconFilled: <Heart size={22} fill="currentColor" strokeWidth={0} />,
    },
    {
      name: 'Likes',
      href: '/likes',
      icon: <Sparkles size={22} strokeWidth={2} />,
      iconFilled: <Sparkles size={22} fill="currentColor" strokeWidth={0} />,
    },
    {
      name: 'Zoekopdracht',
      href: '/search',
      icon: <Search size={22} strokeWidth={2} />,
      iconFilled: <Search size={22} strokeWidth={2.5} />,
    },
    {
      name: 'Berichten',
      href: '/matches',
      icon: <MessageCircle size={22} strokeWidth={2} />,
      iconFilled: <MessageCircle size={22} fill="currentColor" strokeWidth={0} />,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Sidebar + Header */}
      {/* ============================================ */}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/discover" className="flex items-center gap-3">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={180}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                  ${active
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {active ? item.iconFilled || item.icon : item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* Mijn Profiel - with user photo */}
          <Link
            href="/profile"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
              ${isActive('/profile')
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {userPhoto ? (
              <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-rose-200">
                <Image
                  src={userPhoto}
                  alt="Profiel"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <User size={22} strokeWidth={2} />
            )}
            <span>Mijn profiel</span>
          </Link>
        </nav>

        {/* Footer Links */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 space-y-1">
            <Link href="/terms" className="hover:text-gray-600 block">Algemene voorwaarden</Link>
            <Link href="/privacy" className="hover:text-gray-600 block">Privacybeleid</Link>
            <Link href="/safety" className="hover:text-gray-600 block">Help</Link>
          </div>
        </div>
      </aside>

      {/* Desktop Top Header (right side) */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-100 z-40 items-center justify-end px-6 gap-3">
        {/* Premium Action Buttons */}
        <Link
          href="/prijzen"
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-all font-medium text-sm"
        >
          <Zap size={18} />
          <span>Boost</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all font-medium text-sm"
        >
          <EyeOff size={18} />
          <span>Incognito</span>
        </Link>

        <Link
          href="/prijzen"
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all font-medium text-sm shadow-lg shadow-rose-200"
        >
          <Crown size={18} />
          <span>Premium</span>
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className={`p-2.5 rounded-full transition-all ${
            isActive('/notifications') ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Bell size={22} />
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className={`p-2.5 rounded-full transition-all ${
            isActive('/settings') ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Settings size={22} />
        </Link>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all"
          >
            {userPhoto ? (
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-rose-200">
                <Image
                  src={userPhoto}
                  alt="Profiel"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-semibold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
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
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                  {/* User Info Header */}
                  <div className="p-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {userPhoto ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-rose-200">
                          <Image
                            src={userPhoto}
                            alt="Profiel"
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-bold text-xl">
                          {session.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                        {isPremium && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
                            <Crown size={12} /> Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-gray-400" />
                        <span className="text-gray-700">Bewerk profiel</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={18} className="text-gray-400" />
                        <span className="text-gray-700">Instellingen</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </Link>

                    {!isPremium && (
                      <Link
                        href="/prijzen"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors mt-1"
                      >
                        <div className="flex items-center gap-3">
                          <Crown size={18} className="text-amber-500" />
                          <span className="text-amber-700 font-medium">Upgrade naar Premium</span>
                        </div>
                        <ChevronRight size={16} className="text-amber-400" />
                      </Link>
                    )}

                    <div className="my-2 border-t border-gray-100" />

                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-600"
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
      </header>

      {/* Desktop Content Spacer */}
      <div className="hidden lg:block pl-64 pt-16" />

      {/* ============================================ */}
      {/* TABLET LAYOUT - Top Navigation */}
      {/* ============================================ */}
      <nav className="hidden md:flex lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/discover" className="flex items-center gap-2">
              <Image
                src="/images/LiefdevoorIedereen_logo.png"
                alt="Liefde Voor Iedereen"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
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
                      flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm
                      ${active
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    {active ? item.iconFilled || item.icon : item.icon}
                    <span className="font-medium hidden xl:inline">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link href="/notifications" className="p-2 rounded-xl text-gray-500 hover:bg-gray-50">
                <Bell size={20} />
              </Link>
              <Link href="/settings" className="p-2 rounded-xl text-gray-500 hover:bg-gray-50">
                <Settings size={20} />
              </Link>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-semibold text-sm"
              >
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Content Spacer */}
      <div className="hidden md:block lg:hidden h-16" />

      {/* ============================================ */}
      {/* MOBILE LAYOUT - Bottom Navigation */}
      {/* ============================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 safe-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.slice(0, 4).map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-2 rounded-xl transition-all
                  ${active ? 'text-rose-500' : 'text-gray-400'}
                `}
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  {active ? item.iconFilled || item.icon : item.icon}
                </motion.div>
                <span className={`text-[10px] mt-1 font-semibold ${active ? 'text-rose-500' : 'text-gray-500'}`}>
                  {item.name === 'Zoekopdracht' ? 'Zoek' : item.name}
                </span>
              </Link>
            )
          })}

          {/* Profile Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center justify-center py-2 text-gray-400"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <User size={22} strokeWidth={2} />
            </motion.div>
            <span className="text-[10px] mt-1 font-semibold text-gray-500">Profiel</span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMenu(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
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
                    {userPhoto ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-rose-200">
                        <Image src={userPhoto} alt="Profiel" width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-lg">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{session.user?.name}</p>
                      <p className="text-sm text-gray-600 truncate">{session.user?.email}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Link href="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <User size={20} className="text-rose-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Mijn Profiel</span>
                    </Link>

                    <Link href="/notifications" onClick={() => setShowMenu(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bell size={20} className="text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Notificaties</span>
                    </Link>

                    <Link href="/settings" onClick={() => setShowMenu(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Settings size={20} className="text-gray-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Instellingen</span>
                    </Link>

                    <Link href="/prijzen" onClick={() => setShowMenu(false)} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Crown size={20} className="text-amber-600" />
                      </div>
                      <span className="font-semibold text-amber-700">Premium</span>
                    </Link>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 text-red-600"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <LogOut size={20} className="text-red-600" />
                        </div>
                        <span className="font-semibold">Uitloggen</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Spacer */}
      <div className="md:hidden h-20" />
    </>
  )
}
