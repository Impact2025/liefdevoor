'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  FolderTree,
  Wrench,
  MessageSquare,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ArrowRight,
  FileText,
  Users,
  BarChart3,
  Clock,
  Loader2
} from 'lucide-react'

interface Stats {
  articles: {
    total: number
    published: number
    draft: number
    pillar: number
  }
  categories: number
  tools: number
  feedback: {
    total: number
    helpful: number
    notHelpful: number
  }
  views: number
  recentArticles: Array<{
    id: string
    titleNl: string
    slug: string
    viewCount: number
    isPublished: boolean
    updatedAt: string
  }>
}

export default function AdminKennisbankPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/kennisbank/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  // Mock stats for initial display
  const displayStats = stats || {
    articles: { total: 0, published: 0, draft: 0, pillar: 0 },
    categories: 0,
    tools: 0,
    feedback: { total: 0, helpful: 0, notHelpful: 0 },
    views: 0,
    recentArticles: []
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kennisbank Beheer</h1>
          <p className="text-gray-500 mt-1">
            Beheer artikelen, categorieën en tools
          </p>
        </div>
        <Link
          href="/admin/kennisbank/artikelen/nieuw"
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuw Artikel
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Artikelen</p>
              <p className="text-2xl font-bold text-gray-900">{displayStats.articles.total}</p>
              <p className="text-xs text-gray-400">
                {displayStats.articles.published} gepubliceerd
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categorieën</p>
              <p className="text-2xl font-bold text-gray-900">{displayStats.categories}</p>
              <p className="text-xs text-gray-400">
                {displayStats.articles.pillar} pillar pages
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Totaal Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.views.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">alle tijd</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Feedback Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.feedback.total > 0
                  ? `${Math.round((displayStats.feedback.helpful / displayStats.feedback.total) * 100)}%`
                  : '-'}
              </p>
              <p className="text-xs text-gray-400">
                {displayStats.feedback.helpful} positief
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/kennisbank/artikelen"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Artikelen</h3>
                <p className="text-sm text-gray-500">
                  {displayStats.articles.total} artikelen beheren
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/admin/kennisbank/categorieen"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Categorieën</h3>
                <p className="text-sm text-gray-500">
                  {displayStats.categories} categorieën beheren
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/admin/kennisbank/tools"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tools</h3>
                <p className="text-sm text-gray-500">
                  {displayStats.tools} tools configureren
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Recent Bewerkt</h2>
            <Link
              href="/admin/kennisbank/artikelen"
              className="text-sm text-rose-600 hover:text-rose-700"
            >
              Alles bekijken
            </Link>
          </div>

          {displayStats.recentArticles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nog geen artikelen</p>
              <Link
                href="/admin/kennisbank/artikelen/nieuw"
                className="text-rose-600 hover:text-rose-700 text-sm mt-2 inline-block"
              >
                Maak je eerste artikel
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayStats.recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/kennisbank/artikelen/${article.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {article.titleNl}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(article.updatedAt).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    article.isPublished
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {article.isPublished ? 'Live' : 'Concept'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Article Types Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Content Overzicht</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gepubliceerd</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: displayStats.articles.total > 0
                        ? `${(displayStats.articles.published / displayStats.articles.total) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {displayStats.articles.published}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Concepten</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: displayStats.articles.total > 0
                        ? `${(displayStats.articles.draft / displayStats.articles.total) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {displayStats.articles.draft}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pillar Pages</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: displayStats.articles.total > 0
                        ? `${(displayStats.articles.pillar / displayStats.articles.total) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {displayStats.articles.pillar}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Snelle Acties</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/kennisbank/artikelen?filter=draft"
                className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Concepten ({displayStats.articles.draft})</span>
              </Link>
              <Link
                href="/admin/kennisbank/feedback"
                className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Feedback ({displayStats.feedback.total})</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Portal Promo */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Professional Portal</h3>
              <p className="text-white/80 text-sm">
                Beheer accounts en content voor professionals
              </p>
            </div>
          </div>
          <Link
            href="/admin/professionals"
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Beheren
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
