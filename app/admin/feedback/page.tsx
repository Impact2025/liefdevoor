'use client'

/**
 * World-Class Feedback Admin Dashboard
 *
 * Real-time analytics with NPS tracking, segment comparison,
 * and actionable insights
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3, TrendingUp, TrendingDown, Users, Star, MessageSquare,
  ThumbsUp, ThumbsDown, Minus, RefreshCw, Download, Filter,
  ChevronDown, ChevronUp, AlertTriangle, Sparkles, ArrowLeft
} from 'lucide-react'

interface FeedbackResponse {
  id: string
  userId: string | null
  satisfaction: number
  easeOfUse: number
  designRating: number
  missingFeatures: string[]
  otherMissing: string | null
  bestFeature: string | null
  improvements: string | null
  wouldRecommend: number
  additionalComments: string | null
  createdAt: string
  completionTime?: number
  segment?: string
}

interface FeedbackStats {
  total: number
  avg_satisfaction: number
  avg_ease: number
  avg_design: number
  avg_nps: number
}

interface NPSData {
  score: number
  promoters: number
  passives: number
  detractors: number
}

interface DashboardData {
  stats: FeedbackStats
  nps: NPSData
  responses: FeedbackResponse[]
  missingFeaturesCounts: Record<string, number>
  dailyResponses: { date: string; count: number }[]
  npsHistory: { date: string; score: number }[]
}

const MISSING_FEATURES_LABELS: Record<string, string> = {
  'chat_history': 'Oude chatgeschiedenis',
  'contacts': 'Contacten/favorieten',
  'photos': 'Meer foto opties',
  'search_filters': 'Betere zoekfilters',
  'profile_views': 'Profielbezoekers',
  'notifications': 'Push notificaties',
  'mobile_app': 'Mobile app',
  'nothing': 'Mist niets'
}

export default function FeedbackAdminPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'promoters' | 'passives' | 'detractors'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/feedback')
      if (!res.ok) {
        if (res.status === 401) throw new Error('Niet ingelogd')
        if (res.status === 403) throw new Error('Geen toegang')
        throw new Error('Kon data niet laden')
      }
      const json = await res.json()

      // Process data for charts
      const responses = json.data.responses as FeedbackResponse[]

      // Count missing features
      const missingFeaturesCounts: Record<string, number> = {}
      responses.forEach(r => {
        const features = r.missingFeatures || []
        features.forEach((f: string) => {
          missingFeaturesCounts[f] = (missingFeaturesCounts[f] || 0) + 1
        })
      })

      // Group by day
      const dailyMap = new Map<string, number>()
      responses.forEach(r => {
        const date = new Date(r.createdAt).toISOString().split('T')[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      })
      const dailyResponses = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14) // Last 14 days

      // NPS history (mock for now, would need historical tracking)
      const npsHistory = dailyResponses.map(d => ({
        date: d.date,
        score: json.data.nps.score + Math.floor(Math.random() * 10 - 5) // Simulated variation
      }))

      setData({
        stats: json.data.stats,
        nps: json.data.nps,
        responses,
        missingFeaturesCounts,
        dailyResponses,
        npsHistory
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-emerald-600'
    if (score >= 0) return 'text-amber-600'
    return 'text-red-600'
  }

  const getNPSLabel = (score: number) => {
    if (score >= 70) return 'Excellent'
    if (score >= 50) return 'Goed'
    if (score >= 30) return 'Redelijk'
    if (score >= 0) return 'Verbetering nodig'
    return 'Kritiek'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600'
    if (rating >= 4) return 'text-emerald-500'
    if (rating >= 3.5) return 'text-amber-500'
    if (rating >= 3) return 'text-amber-600'
    return 'text-red-500'
  }

  const filteredResponses = data?.responses.filter(r => {
    if (filter === 'all') return true
    if (filter === 'promoters') return r.wouldRecommend >= 9
    if (filter === 'passives') return r.wouldRecommend >= 7 && r.wouldRecommend <= 8
    if (filter === 'detractors') return r.wouldRecommend <= 6
    return true
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <Link href="/admin" className="text-rose-500 hover:underline mt-4 inline-block">
            Terug naar admin
          </Link>
        </div>
      </div>
    )
  }

  if (!data || data.responses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Terug naar admin
          </Link>
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Nog geen feedback</h2>
            <p className="text-slate-500 mb-6">
              Er zijn nog geen survey responses ontvangen.
            </p>
            <Link
              href="/feedback"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Bekijk de survey
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Feedback Dashboard</h1>
                <p className="text-sm text-slate-500">{data.stats.total} responses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* NPS Score */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">NPS Score</span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                data.nps.score >= 50 ? 'bg-emerald-100 text-emerald-700' :
                data.nps.score >= 0 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getNPSLabel(data.nps.score)}
              </div>
            </div>
            <div className={`text-4xl font-bold ${getNPSColor(data.nps.score)}`}>
              {data.nps.score}
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1 text-emerald-600">
                <ThumbsUp className="w-4 h-4" /> {data.nps.promoters}
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <Minus className="w-4 h-4" /> {data.nps.passives}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <ThumbsDown className="w-4 h-4" /> {data.nps.detractors}
              </span>
            </div>
          </div>

          {/* Satisfaction */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Tevredenheid</span>
              <Star className="w-5 h-5 text-amber-400 fill-current" />
            </div>
            <div className={`text-4xl font-bold ${getRatingColor(Number(data.stats.avg_satisfaction))}`}>
              {Number(data.stats.avg_satisfaction).toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(data.stats.avg_satisfaction))
                      ? 'text-amber-400 fill-current'
                      : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="text-sm text-slate-500 ml-2">gemiddeld</span>
            </div>
          </div>

          {/* Ease of Use */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Gemak activatie</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className={`text-4xl font-bold ${getRatingColor(Number(data.stats.avg_ease))}`}>
              {Number(data.stats.avg_ease).toFixed(1)}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${(Number(data.stats.avg_ease) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Design Rating */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Design rating</span>
              <Sparkles className="w-5 h-5 text-rose-500" />
            </div>
            <div className={`text-4xl font-bold ${getRatingColor(Number(data.stats.avg_design))}`}>
              {Number(data.stats.avg_design).toFixed(1)}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all"
                style={{ width: `${(Number(data.stats.avg_design) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Missing Features Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              Wat missen gebruikers?
            </h3>
            <div className="space-y-4">
              {Object.entries(data.missingFeaturesCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([feature, count]) => {
                  const percentage = Math.round((count / data.stats.total) * 100)
                  const label = MISSING_FEATURES_LABELS[feature] || feature

                  return (
                    <div key={feature}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-sm text-slate-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            feature === 'nothing' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Response overzicht
            </h3>

            <div className="space-y-6">
              {/* Response breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Promoters (9-10)</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {Math.round((data.nps.promoters / data.stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(data.nps.promoters / data.stats.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Passives (7-8)</span>
                  <span className="text-sm font-medium text-amber-600">
                    {Math.round((data.nps.passives / data.stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${(data.nps.passives / data.stats.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Detractors (0-6)</span>
                  <span className="text-sm font-medium text-red-600">
                    {Math.round((data.nps.detractors / data.stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(data.nps.detractors / data.stats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Daily average */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Gem. per dag</span>
                  <span className="text-lg font-semibold text-slate-800">
                    {data.dailyResponses.length > 0
                      ? (data.stats.total / data.dailyResponses.length).toFixed(1)
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Responses */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                Individuele responses
              </h3>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
                >
                  <option value="all">Alle ({data.stats.total})</option>
                  <option value="promoters">Promoters ({data.nps.promoters})</option>
                  <option value="passives">Passives ({data.nps.passives})</option>
                  <option value="detractors">Detractors ({data.nps.detractors})</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredResponses.slice(0, 20).map(response => {
              const isExpanded = expandedResponse === response.id
              const npsType = response.wouldRecommend >= 9 ? 'promoter' :
                              response.wouldRecommend >= 7 ? 'passive' : 'detractor'

              return (
                <div key={response.id} className="p-6">
                  <button
                    onClick={() => setExpandedResponse(isExpanded ? null : response.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          npsType === 'promoter' ? 'bg-emerald-500' :
                          npsType === 'passive' ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {response.wouldRecommend}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-800">
                              {response.userId ? `Gebruiker ${response.userId.slice(0, 8)}` : 'Anoniem'}
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(response.createdAt).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-current" />
                              {response.satisfaction}/5
                            </span>
                            {response.bestFeature && (
                              <span className="truncate max-w-xs">
                                "{response.bestFeature}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-6 pl-14 space-y-4">
                      {/* Ratings */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <span className="text-xs text-slate-500">Tevredenheid</span>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= response.satisfaction ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <span className="text-xs text-slate-500">Gemak</span>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= response.easeOfUse ? 'text-emerald-400 fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <span className="text-xs text-slate-500">Design</span>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= response.designRating ? 'text-rose-400 fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Missing features */}
                      {response.missingFeatures && response.missingFeatures.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-2">Mist van OogvoorLiefde</span>
                          <div className="flex flex-wrap gap-2">
                            {response.missingFeatures.map((f: string) => (
                              <span key={f} className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs">
                                {MISSING_FEATURES_LABELS[f] || f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best feature */}
                      {response.bestFeature && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Beste feature</span>
                          <p className="text-sm text-slate-700 bg-emerald-50 rounded-lg p-3">
                            "{response.bestFeature}"
                          </p>
                        </div>
                      )}

                      {/* Improvements */}
                      {response.improvements && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Verbeterpunten</span>
                          <p className="text-sm text-slate-700 bg-amber-50 rounded-lg p-3">
                            "{response.improvements}"
                          </p>
                        </div>
                      )}

                      {/* Additional comments */}
                      {response.additionalComments && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Extra opmerkingen</span>
                          <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                            "{response.additionalComments}"
                          </p>
                        </div>
                      )}

                      {/* Completion time */}
                      {response.completionTime && (
                        <div className="text-xs text-slate-400">
                          Survey ingevuld in {Math.floor(response.completionTime / 60)}m {response.completionTime % 60}s
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredResponses.length > 20 && (
            <div className="p-4 text-center border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Toont 20 van {filteredResponses.length} responses
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
