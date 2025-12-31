'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  Heart,
  MessageCircle,
  Users,
  BookOpen,
  Star,
  Briefcase,
  Wrench,
  ChevronRight,
  Home
} from 'lucide-react'

interface Category {
  slug: string
  name: string
  icon: typeof Shield
  color: string
  count?: number
}

const categories: Category[] = [
  { slug: 'veiligheid', name: 'Veiligheid', icon: Shield, color: 'text-red-600' },
  { slug: 'inclusief-daten', name: 'Inclusief Daten', icon: Heart, color: 'text-pink-600' },
  { slug: 'communicatie', name: 'Communicatie', icon: MessageCircle, color: 'text-blue-600' },
  { slug: 'relaties', name: 'Relaties', icon: Users, color: 'text-purple-600' },
  { slug: 'begrippenlijst', name: 'Begrippenlijst', icon: BookOpen, color: 'text-emerald-600' },
  { slug: 'succesverhalen', name: 'Succesverhalen', icon: Star, color: 'text-amber-600' },
  { slug: 'voor-professionals', name: 'Voor Professionals', icon: Briefcase, color: 'text-indigo-600' },
  { slug: 'tools', name: 'Tools', icon: Wrench, color: 'text-gray-600' },
]

interface KennisbankSidebarProps {
  categoryCounts?: Record<string, number>
  className?: string
}

export default function KennisbankSidebar({
  categoryCounts = {},
  className = ''
}: KennisbankSidebarProps) {
  const pathname = usePathname()

  const isActive = (slug: string) => {
    return pathname?.includes(`/kennisbank/${slug}`)
  }

  return (
    <nav className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      {/* Home Link */}
      <Link
        href="/kennisbank"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2 ${
          pathname === '/kennisbank'
            ? 'bg-rose-50 text-rose-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Home className="w-4 h-4" />
        Overzicht
      </Link>

      {/* Divider */}
      <div className="border-t border-gray-100 my-3" />

      {/* Categories */}
      <div className="space-y-1">
        <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Categorieën
        </p>
        {categories.map((category) => {
          const Icon = category.icon
          const active = isActive(category.slug)
          const count = categoryCounts[category.slug]

          return (
            <Link
              key={category.slug}
              href={`/kennisbank/${category.slug}`}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-rose-600' : category.color}`} />
                <span className="font-medium">{category.name}</span>
              </span>
              <span className="flex items-center gap-1">
                {count !== undefined && (
                  <span className={`text-xs ${active ? 'text-rose-500' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'text-rose-500' : 'text-gray-400'}`} />
              </span>
            </Link>
          )
        })}
      </div>

      {/* Quick Links */}
      <div className="border-t border-gray-100 mt-4 pt-4">
        <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Snelle Links
        </p>
        <div className="space-y-1">
          <Link
            href="/kennisbank/zoeken"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
          >
            <span>🔍</span>
            <span>Zoeken</span>
          </Link>
          <Link
            href="/kennisbank/tools/scam-checker"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
          >
            <span>🛡️</span>
            <span>Scam Checker</span>
          </Link>
          <Link
            href="/professionals"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
          >
            <span>👔</span>
            <span>Professional worden</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
