'use client'

/**
 * Migration Campaign Dashboard - Admin Page
 *
 * Real-time monitoring of the OogvoorLiefde → LiefdevoorIedereen migration
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Users,
  MousePointer,
  CheckCircle,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'

interface MigrationStats {
  overview: {
    total: number
    pending: number
    emailsSent: number
    landingVisited: number
    activated: number
    activatedWithLegacy: number
  }
  conversionRates: {
    emailToLanding: string
    landingToActivated: string
    overall: string
  }
  segments: {
    segment: string
    total: number
    pending: number
    sent: number
    activated: number
  }[]
  recentActivations: {
    firstName: string
    oldEmail: string
    claimedAt: string
    segment: string
  }[]
  today: {
    emails_today: number
    activated_today: number
  }
  hourlyActivity: {
    hour: number
    count: number
  }[]
}

export default function MigrationDashboardPage() {
  const [stats, setStats] = useState<MigrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/migration/stats')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setStats(result.data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'GOLD': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'DORMANT': return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressWidth = (value: number, max: number) => {
    return max > 0 ? Math.round((value / max) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Migratie Dashboard</h1>
                <p className="text-slate-400">OogvoorLiefde → LiefdevoorIedereen</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-slate-400">
                  Laatst bijgewerkt: {lastUpdated.toLocaleTimeString('nl-NL')}
                </span>
              )}
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ververs
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Totaal Gebruikers</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.overview.total.toLocaleString('nl-NL')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Emails Verzonden</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.overview.emailsSent.toLocaleString('nl-NL')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Landing Bezocht</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.overview.landingVisited.toLocaleString('nl-NL')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Geactiveerd</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.overview.activatedWithLegacy.toLocaleString('nl-NL')}
                  <span className="text-sm font-normal text-slate-400 ml-1">(+155)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel & Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Funnel */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              Conversie Funnel
            </h2>

            <div className="space-y-4">
              {/* Email Sent */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">📧 Email Verzonden</span>
                  <span className="font-medium">{stats.overview.emailsSent.toLocaleString('nl-NL')}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressWidth(stats.overview.emailsSent, stats.overview.total)}%` }}
                  />
                </div>
              </div>

              {/* Landing Visited */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">👁️ Landing Bezocht</span>
                  <span className="font-medium">{stats.overview.landingVisited.toLocaleString('nl-NL')}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressWidth(stats.overview.landingVisited, stats.overview.total)}%` }}
                  />
                </div>
              </div>

              {/* Activated */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">✅ Geactiveerd</span>
                  <span className="font-medium">{stats.overview.activatedWithLegacy.toLocaleString('nl-NL')}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressWidth(stats.overview.activatedWithLegacy, stats.overview.total)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Conversion Rates */}
            <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.conversionRates.emailToLanding}%</p>
                <p className="text-xs text-slate-500">Email → Landing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.conversionRates.landingToActivated}%</p>
                <p className="text-xs text-slate-500">Landing → Activated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.conversionRates.overall}%</p>
                <p className="text-xs text-slate-500">Overall</p>
              </div>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Vandaag
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.today.emails_today}</p>
                <p className="text-sm text-purple-700">Emails verzonden</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{stats.today.activated_today}</p>
                <p className="text-sm text-emerald-700">Accounts geactiveerd</p>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-700">Nog te versturen</span>
                </div>
                <span className="text-2xl font-bold text-slate-700">
                  {stats.overview.pending.toLocaleString('nl-NL')}
                </span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${getProgressWidth(stats.overview.pending, stats.overview.total)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Segments & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Per Segment */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Per Segment</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-medium">Segment</th>
                    <th className="pb-3 font-medium text-right">Totaal</th>
                    <th className="pb-3 font-medium text-right">Te gaan</th>
                    <th className="pb-3 font-medium text-right">Verzonden</th>
                    <th className="pb-3 font-medium text-right">Activated</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.segments.map((seg) => (
                    <tr key={seg.segment} className="border-b border-slate-100 last:border-0">
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getSegmentColor(seg.segment)}`}>
                          {seg.segment}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">{seg.total}</td>
                      <td className="py-3 text-right text-slate-500">{seg.pending}</td>
                      <td className="py-3 text-right text-purple-600">{seg.sent}</td>
                      <td className="py-3 text-right text-emerald-600 font-medium">{seg.activated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activations */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recente Activaties</h2>

            {stats.recentActivations.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nog geen activaties</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivations.map((activation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{activation.firstName}</p>
                        <p className="text-xs text-slate-500">{activation.oldEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getSegmentColor(activation.segment)}`}>
                        {activation.segment}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(activation.claimedAt).toLocaleString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
