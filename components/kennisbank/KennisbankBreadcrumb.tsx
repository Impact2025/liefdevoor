'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface KennisbankBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function KennisbankBreadcrumb({
  items,
  className = ''
}: KennisbankBreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-1 text-sm ${className}`} aria-label="Breadcrumb">
      {/* Home */}
      <Link
        href="/kennisbank"
        className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only sm:not-sr-only">Kennisbank</span>
      </Link>

      {/* Items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-700 truncate max-w-[150px] sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
