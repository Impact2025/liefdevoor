'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Trash2,
  Loader2,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Feedback {
  id: string
  articleId: string
  article: {
    id: string
    titleNl: string
    slug: string
  }
  userId: string | null
  user?: {
    name: string | null
    email: string
  } | null
  isHelpful: boolean
  comment: string | null
  createdAt: string
}

interface FeedbackStats {
  total: number
  helpful: number
  notHelpful: number
  withComments: number
  helpfulRate: number
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'helpful' | 'not-helpful' | 'with-comments'>('all')
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    helpful: 0,
    notHelpful: 0,
    withComments: 0,
    helpfulRate: 0
  })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/admin/kennisbank/feedback')
      if (response.ok) {
        const data = await response.json()
        const feedbackList = data.data?.feedback || []
        setFeedback(feedbackList)

        // Calculate stats
        const total = feedbackList.length
        const helpful = feedbackList.filter((f: Feedback) => f.isHelpful).length
        const notHelpful = total - helpful
        const withComments = feedbackList.filter((f: Feedback) => f.comment).length
        const helpfulRate = total > 0 ? Math.round((helpful / total) * 100) : 0

        setStats({ total, helpful, notHelpful, withComments, helpfulRate })
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm('Weet je zeker dat je deze feedback wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/admin/kennisbank/feedback/${feedbackId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFeedback(prev => prev.filter(f => f.id !== feedbackId))
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  // Filter feedback based on selection
  const filteredFeedback = feedback.filter(f => {
    switch (filter) {
      case 'helpful':
        return f.isHelpful
      case 'not-helpful':
        return !f.isHelpful
      case 'with-comments':
        return f.comment
      default:
        return true
    }
  })

  // Group by article for display
  const groupedByArticle = filteredFeedback.reduce((acc, f) => {
    const articleId = f.articleId
    if (!acc[articleId]) {
      acc[articleId] = {
        article: f.article,
        items: [],
        helpful: 0,
        notHelpful: 0
      }
    }
    acc[articleId].items.push(f)
    if (f.isHelpful) {
      acc[articleId].helpful++
    } else {
      acc[articleId].notHelpful++
    }
    return acc
  }, {} as Record<string, { article: Feedback['article'], items: Feedback[], helpful: number, notHelpful: number }>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/kennisbank"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artikel Feedback</h1>
          <p className="text-gray-500 mt-1">
            Bekijk en beheer feedback van gebruikers
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Totaal</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nuttig</p>
              <p className="text-xl font-bold text-gray-900">{stats.helpful}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Niet Nuttig</p>
              <p className="text-xl font-bold text-gray-900">{stats.notHelpful}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.helpfulRate >= 70 ? 'bg-emerald-100' : stats.helpfulRate >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {stats.helpfulRate >= 70 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : stats.helpfulRate >= 50 ? (
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Nuttig %</p>
              <p className="text-xl font-bold text-gray-900">{stats.helpfulRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alle ({stats.total})
          </button>
          <button
            onClick={() => setFilter('helpful')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'helpful'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Nuttig ({stats.helpful})
          </button>
          <button
            onClick={() => setFilter('not-helpful')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'not-helpful'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Niet Nuttig ({stats.notHelpful})
          </button>
          <button
            onClick={() => setFilter('with-comments')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'with-comments'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Met Commentaar ({stats.withComments})
          </button>
        </div>
      </div>

      {/* Feedback List - Grouped by Article */}
      <div className="space-y-4">
        {Object.keys(groupedByArticle).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Geen feedback gevonden</h3>
            <p className="text-gray-500">
              Er is nog geen feedback voor deze filter.
            </p>
          </div>
        ) : (
          Object.entries(groupedByArticle)
            .sort(([, a], [, b]) => b.items.length - a.items.length)
            .map(([articleId, data]) => {
              const isExpanded = expandedIds.has(articleId)
              const helpfulRate = Math.round((data.helpful / data.items.length) * 100)

              return (
                <div key={articleId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(articleId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        helpfulRate >= 70 ? 'bg-emerald-100' : helpfulRate >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          helpfulRate >= 70 ? 'text-emerald-600' : helpfulRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{data.article.titleNl}</h3>
                        <p className="text-sm text-gray-500">
                          {data.items.length} feedback • {helpfulRate}% nuttig
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <ThumbsUp className="w-4 h-4" />
                          {data.helpful}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <ThumbsDown className="w-4 h-4" />
                          {data.notHelpful}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t divide-y">
                      {data.items.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                item.isHelpful ? 'bg-emerald-100' : 'bg-red-100'
                              }`}>
                                {item.isHelpful ? (
                                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <ThumbsDown className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-gray-900">
                                    {item.user?.name || 'Anoniem'}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(item.createdAt)}
                                  </span>
                                </div>
                                {item.comment && (
                                  <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg border">
                                    "{item.comment}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/kennisbank/${data.article.slug}`}
                                target="_blank"
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Bekijk artikel"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => deleteFeedback(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Verwijderen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
