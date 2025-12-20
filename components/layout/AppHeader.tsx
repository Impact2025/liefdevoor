/**
 * App Header Component - World Class Edition
 *
 * Shared sticky header with logo for all app pages
 * Features:
 * - Liefde Voor Iedereen logo
 * - Sticky positioning for mobile
 * - Optional title and action buttons
 * - Trust Teal accent color
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ReactNode } from 'react'

interface AppHeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  actions?: ReactNode
  className?: string
}

export function AppHeader({
  title,
  subtitle,
  showLogo = true,
  actions,
  className = '',
}: AppHeaderProps) {
  return (
    <header
      className={`bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 safe-top ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {showLogo && (
              <Link href="/discover" className="flex-shrink-0">
                <Image
                  src="/images/LiefdevoorIedereen_logo.png"
                  alt="Liefde Voor Iedereen"
                  width={140}
                  height={40}
                  priority
                  className="h-8 sm:h-10 w-auto"
                />
              </Link>
            )}
            {title && (
              <div className="border-l border-stone-200 pl-3 ml-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
