'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle2,
  TrendingDown,
  Zap,
  AlertCircle,
  Database,
  Upload,
  Key,
  Clock,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react'

interface TechStats {
  safety: {
    scamDetections: number
    reports: number
    blocks: number
    verifications: number
    systemStatus: 'OK' | 'WARNING' | 'CRITICAL'
  }
  funnel: {
    visitors: number
    registrations: number
    profileComplete: number
    firstSwipe: number
    firstMatch: number
    firstMessage: number
    period: string
  }
  errors: ErrorLogEntry[]
  activeErrorCount: number
}

interface ErrorLogEntry {
  id: string
  type: 'API' | 'Database' | 'Upload' | 'Auth'
  message: string
  status: 'open' | 'monitoring' | 'resolved'
  timestamp: Date
  count: number
}

interface TechDashboardProps {
  stats?: TechStats
  onViewAllErrors?: () => void
  onExportStats?: () => void
  onRefresh?: () => void
}

export default function TechDashboard({
  stats,
  onViewAllErrors,
  onExportStats,
  onRefresh
}: TechDashboardProps) {
  const [loading, setLoading] = useState(!stats)
  const [techStats, setTechStats] = useState<TechStats | null>(stats || null)

  useEffect(() => {
    if (!stats) {
      fetchTechStats()
    }
  }, [stats])

  const fetchTechStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/tech-stats')
      if (response.ok) {
        const data = await response.json()
        setTechStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch tech stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchTechStats()
    onRefresh?.()
  }

  if (loading || !techStats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900 rounded-2xl p-6 animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 bg-slate-800 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Calculate funnel percentages
  const calcPercent = (value: number, base: number) => {
    if (base === 0) return 0
    return Math.round((value / base) * 100)
  }

  const funnelPercentages = {
    registrations: calcPercent(techStats.funnel.registrations, techStats.funnel.visitors),
    profileComplete: calcPercent(techStats.funnel.profileComplete, techStats.funnel.registrations),
    firstSwipe: calcPercent(techStats.funnel.firstSwipe, techStats.funnel.profileComplete),
    firstMatch: calcPercent(techStats.funnel.firstMatch, techStats.funnel.firstSwipe),
    firstMessage: calcPercent(techStats.funnel.firstMessage, techStats.funnel.firstMatch)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-emerald-500'
      case 'WARNING': return 'bg-amber-500'
      case 'CRITICAL': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: 'open' | 'monitoring' | 'resolved') => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Open</span>
      case 'monitoring':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Monitoring</span>
      case 'resolved':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Opgelost</span>
    }
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'API': return <Zap className="w-4 h-4" />
      case 'Database': return <Database className="w-4 h-4" />
      case 'Upload': return <Upload className="w-4 h-4" />
      case 'Auth': return <Key className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getSafetyIndicator = (count: number, threshold: number) => {
    if (count === 0) return 'bg-emerald-500'
    if (count < threshold) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Technisch Dashboard</h2>
          <p className="text-gray-600 text-sm">Real-time monitoring & analytics</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Vernieuwen
        </button>
      </div>

      {/* Three Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Veiligheid Monitor */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-lg">Veiligheid Monitor</h3>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(techStats.safety.systemStatus)} text-white`}>
              Systeem {techStats.safety.systemStatus}
            </span>
          </div>

          <div className="space-y-3">
            {/* Scam Detecties */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Scam detecties</p>
                  <p className="text-xs text-slate-400">{techStats.safety.scamDetections} vandaag</p>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${getSafetyIndicator(techStats.safety.scamDetections, 10)}`}></div>
            </div>

            {/* Rapportages */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Rapportages</p>
                  <p className="text-xs text-slate-400">{techStats.safety.reports} vandaag</p>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${getSafetyIndicator(techStats.safety.reports, 5)}`}></div>
            </div>

            {/* Blokkades */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Blokkades</p>
                  <p className="text-xs text-slate-400">{techStats.safety.blocks} vandaag</p>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${getSafetyIndicator(techStats.safety.blocks, 20)}`}></div>
            </div>

            {/* Verificaties */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Verificaties</p>
                  <p className="text-xs text-slate-400">{techStats.safety.verifications} vandaag</p>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>

          {/* View All Link */}
          <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all">
            Bekijk alle meldingen
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Conversie Funnel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-slate-400 rotate-180" />
              <h3 className="font-bold text-lg">Conversie Funnel</h3>
            </div>
            <span className="text-xs text-slate-400">{techStats.funnel.period}</span>
          </div>

          <div className="space-y-4">
            {/* Bezoekers */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">Bezoekers</span>
                <span className="text-2xl font-bold">{techStats.funnel.visitors.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-full rounded-full"></div>
              </div>
            </div>

            {/* Registraties */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">Registraties</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{techStats.funnel.registrations.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{funnelPercentages.registrations}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(funnelPercentages.registrations * 3, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Profiel compleet */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">Profiel compleet</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{techStats.funnel.profileComplete.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{funnelPercentages.profileComplete}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(funnelPercentages.profileComplete, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Eerste swipe */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">Eerste swipe</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{techStats.funnel.firstSwipe.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{funnelPercentages.firstSwipe}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(funnelPercentages.firstSwipe, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Eerste match */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">Eerste match</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{techStats.funnel.firstMatch.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{funnelPercentages.firstMatch}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(funnelPercentages.firstMatch, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Eerste bericht */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">Eerste bericht</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{techStats.funnel.firstMessage.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{funnelPercentages.firstMessage}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(funnelPercentages.firstMessage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Log */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-lg">Error Log</h3>
            </div>
            {techStats.activeErrorCount > 0 && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                {techStats.activeErrorCount} actief
              </span>
            )}
          </div>

          <div className="space-y-3">
            {techStats.errors.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p className="text-sm">Geen actieve errors</p>
              </div>
            ) : (
              techStats.errors.slice(0, 4).map((error) => (
                <div
                  key={error.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs mt-0.5">{formatTime(error.timestamp)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getErrorIcon(error.type)}
                        <p className="font-medium text-white text-sm">{error.type}</p>
                        {error.count > 1 && (
                          <span className="text-xs text-slate-400">x{error.count}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">{error.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(error.status)}
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={onExportStats}
              className="py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all border border-slate-600"
            >
              <Download className="w-4 h-4" />
              Exporteer
            </button>
            <button
              onClick={onViewAllErrors}
              className="py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              Alle errors
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
