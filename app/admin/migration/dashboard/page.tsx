'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  MailIcon,
  MousePointerClickIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UsersIcon,
  EuroIcon
} from 'lucide-react'

interface DashboardStats {
  overview: {
    totalUsers: number
    claimed: number
    activated: number
    conversionRate: number
    revenueImpact: number
  }
  funnel: {
    emailSent: number
    emailOpened: number
    linkClicked: number
    landingVisited: number
    claimed: number
    activated: number
  }
  segments: Array<{
    segment: string
    total: number
    sent: number
    claimed: number
    activated: number
    conversionRate: number
  }>
  emailMetrics: {
    sent: number
    opened: number
    clicked: number
    openRate: number
    clickRate: number
  }
  abTests?: Array<{
    variant: string
    sent: number
    opened: number
    openRate: number
  }>
  recentClaims: Array<{
    id: string
    name: string
    segment: string
    claimedAt: string
    status: string
  }>
}

export default function MigrationDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/migration/dashboard')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircleIcon className="w-5 h-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchStats}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const conversionTarget = 20
  const conversionHealth = stats.overview.conversionRate >= conversionTarget ? 'healthy' : 'warning'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Migration Campaign Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString('nl-NL')}
            </p>
          </div>
          <Button
            onClick={fetchStats}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={stats.overview.totalUsers.toLocaleString()}
            icon={<UsersIcon className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${stats.overview.conversionRate}%`}
            subtitle={`Target: ${conversionTarget}%`}
            icon={<TrendingUpIcon className="w-5 h-5" />}
            color={conversionHealth === 'healthy' ? 'green' : 'yellow'}
            trend={stats.overview.conversionRate >= conversionTarget ? 'up' : 'down'}
          />
          <MetricCard
            title="Claimed Today"
            value={stats.overview.claimed.toString()}
            subtitle={`${stats.overview.activated} activated`}
            icon={<CheckCircleIcon className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Revenue Impact"
            value={`€${stats.overview.revenueImpact.toFixed(0)}`}
            subtitle="Estimated MRR"
            icon={<EuroIcon className="w-5 h-5" />}
            color="emerald"
          />
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User journey from email to activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={stats.funnel} />
          </CardContent>
        </Card>

        {/* Email Performance & Segment Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MailIcon className="w-5 h-5 mr-2" />
                Email Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmailMetrics data={stats.emailMetrics} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
              <CardDescription>
                Conversion by user segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentList segments={stats.segments} />
            </CardContent>
          </Card>
        </div>

        {/* A/B Test Results */}
        {stats.abTests && stats.abTests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>A/B Test Results</CardTitle>
              <CardDescription>
                Subject line variant performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ABTestResults data={stats.abTests} />
            </CardContent>
          </Card>
        )}

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>
              Latest account activations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentClaimsList claims={stats.recentClaims} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// METRIC CARD COMPONENT
// ============================================

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'emerald'
  trend?: 'up' | 'down'
}

function MetricCard({ title, value, subtitle, icon, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center text-sm">
              {trend === 'up' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-600" />
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// FUNNEL CHART COMPONENT
// ============================================

function FunnelChart({ data }: { data: DashboardStats['funnel'] }) {
  const stages = [
    { label: 'Email Sent', count: data.emailSent, color: 'bg-blue-500' },
    { label: 'Opened', count: data.emailOpened, color: 'bg-indigo-500' },
    { label: 'Clicked', count: data.linkClicked, color: 'bg-purple-500' },
    { label: 'Visited', count: data.landingVisited, color: 'bg-pink-500' },
    { label: 'Claimed', count: data.claimed, color: 'bg-red-500' },
    { label: 'Activated', count: data.activated, color: 'bg-emerald-500' }
  ]

  const maxCount = data.emailSent

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
        const prevCount = index > 0 ? stages[index - 1].count : maxCount
        const conversionRate = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '0.0'

        return (
          <div key={stage.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{stage.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-semibold">
                  {stage.count.toLocaleString()}
                </span>
                {index > 0 && (
                  <span className="text-gray-500">
                    ({conversionRate}%)
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${stage.color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">
                {percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// EMAIL METRICS COMPONENT
// ============================================

function EmailMetrics({ data }: { data: DashboardStats['emailMetrics'] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Total Sent</span>
        <span className="text-lg font-semibold">{data.sent.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Opened</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{data.opened.toLocaleString()}</span>
          <Badge variant={data.openRate >= 25 ? 'default' : 'secondary'}>
            {data.openRate}%
          </Badge>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Clicked</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{data.clicked.toLocaleString()}</span>
          <Badge variant={data.clickRate >= 5 ? 'default' : 'secondary'}>
            {data.clickRate}%
          </Badge>
        </div>
      </div>
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Open Rate</p>
            <p className="text-2xl font-bold text-blue-600">{data.openRate}%</p>
            <p className="text-xs text-gray-500">Target: 25%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Click Rate</p>
            <p className="text-2xl font-bold text-purple-600">{data.clickRate}%</p>
            <p className="text-xs text-gray-500">Target: 5%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SEGMENT LIST COMPONENT
// ============================================

function SegmentList({ segments }: { data: DashboardStats['segments'] }) {
  const targets: Record<string, number> = {
    VIP: 40,
    GOLD: 35,
    ACTIVE: 25,
    DORMANT: 10,
    INACTIVE: 5
  }

  return (
    <div className="space-y-3">
      {segments.map((segment) => {
        const target = targets[segment.segment] || 10
        const isOnTarget = segment.conversionRate >= target

        return (
          <div key={segment.segment} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{segment.segment}</span>
                <span className="text-gray-500">({segment.sent} sent)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${isOnTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                  {segment.conversionRate}%
                </span>
                {isOnTarget ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircleIcon className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                  isOnTarget ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min((segment.conversionRate / target) * 100, 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// A/B TEST RESULTS COMPONENT
// ============================================

function ABTestResults({ data }: { data: Array<any> }) {
  const maxOpenRate = Math.max(...data.map(v => v.openRate))

  return (
    <div className="space-y-4">
      {data.map((variant) => {
        const isWinner = variant.openRate === maxOpenRate

        return (
          <div key={variant.variant} className="flex items-center gap-4">
            <div className="w-16 text-center">
              <Badge variant={isWinner ? 'default' : 'outline'} className="text-lg">
                {variant.variant}
              </Badge>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {variant.sent} sent, {variant.opened} opened
                </span>
                <span className={`font-semibold ${isWinner ? 'text-green-600' : 'text-gray-700'}`}>
                  {variant.openRate}%
                </span>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isWinner ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${variant.openRate * 3}%` }}
                />
              </div>
            </div>
            {isWinner && (
              <span className="text-xs font-semibold text-green-600">WINNER</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// RECENT CLAIMS LIST COMPONENT
// ============================================

function RecentClaimsList({ claims }: { claims: DashboardStats['recentClaims'] }) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent claims yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
        <div key={claim.id} className="flex items-center justify-between py-3 border-b last:border-0">
          <div>
            <p className="font-medium text-gray-900">{claim.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(claim.claimedAt).toLocaleString('nl-NL')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{claim.segment}</Badge>
            <Badge variant={claim.status === 'ACTIVATED' ? 'default' : 'secondary'}>
              {claim.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
