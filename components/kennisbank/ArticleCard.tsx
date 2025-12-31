'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Clock,
  Eye,
  ThumbsUp,
  BookOpen,
  FileText,
  Star,
  Accessibility
} from 'lucide-react'

interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt?: string
    featuredImage?: string | null
    category: {
      slug: string
      name: string
    }
    articleType?: string
    hasEasyRead?: boolean
    viewCount?: number
    helpfulCount?: number
    publishedAt?: Date | string
  }
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

const articleTypeLabels: Record<string, { label: string; color: string }> = {
  PILLAR: { label: 'Pillar', color: 'bg-rose-100 text-rose-700' },
  GUIDE: { label: 'Gids', color: 'bg-blue-100 text-blue-700' },
  CHECKLIST: { label: 'Checklist', color: 'bg-green-100 text-green-700' },
  GLOSSARY: { label: 'Begrip', color: 'bg-purple-100 text-purple-700' },
  SUCCESS_STORY: { label: 'Succesverhaal', color: 'bg-amber-100 text-amber-700' },
  FAQ: { label: 'FAQ', color: 'bg-gray-100 text-gray-700' },
  TOOL: { label: 'Tool', color: 'bg-indigo-100 text-indigo-700' },
  PROFESSIONAL: { label: 'Professional', color: 'bg-cyan-100 text-cyan-700' },
}

export default function ArticleCard({
  article,
  variant = 'default',
  className = ''
}: ArticleCardProps) {
  const href = `/kennisbank/${article.category.slug}/${article.slug}`
  const typeInfo = article.articleType ? articleTypeLabels[article.articleType] : null

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={`group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${className}`}
      >
        <FileText className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.hasEasyRead && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
              <Accessibility className="w-3 h-3" />
              Makkelijk lezen
            </span>
          )}
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 ${className}`}
      >
        {article.featuredImage && (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="relative p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            {typeInfo && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {typeInfo.label}
              </span>
            )}
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {article.category.name}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:underline underline-offset-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-white/90 text-sm line-clamp-2 mb-4">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-white/70">
            {article.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount.toLocaleString('nl-NL')}
              </span>
            )}
            {article.helpfulCount !== undefined && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {article.helpfulCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={href}
      className={`group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all ${className}`}
    >
      {/* Image */}
      {article.featuredImage && (
        <div className="relative h-40 bg-gray-100">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {typeInfo && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          )}
          {article.hasEasyRead && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              <Accessibility className="w-3 h-3" />
              Makkelijk lezen
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {article.category.name}
          </span>
          <div className="flex items-center gap-3">
            {article.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount > 1000
                  ? `${(article.viewCount / 1000).toFixed(1)}k`
                  : article.viewCount}
              </span>
            )}
            {article.helpfulCount !== undefined && article.helpfulCount > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-3 h-3" />
                {article.helpfulCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
