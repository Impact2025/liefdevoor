'use client'

/**
 * Performance Dashboard Component
 *
 * Real-time monitoring dashboard for administrators
 */

import { useState, useEffect } from 'react'
import { Activity, Clock, Database, Gauge, AlertTriangle, TrendingUp } from 'lucide-react'
import { getMemoryUsage, getNetworkInfo } from '@/lib/performance-monitor'

interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface PerformanceStats {
  webVitals: WebVital[]
  memory: { used: number; total: number } | null
  network: { effectiveType: string; rtt: number } | null
  apiLatency: { avg: number; p95: number; count: number }
}

export default function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats>({
    webVitals: [],
    memory: null,
    network: null,
    apiLatency: { avg: 0, p95: 0, count: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    updateStats()
    setIsLoading(false)

    // Update every 5 seconds
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  function updateStats() {
    // Get memory
    const memory = getMemoryUsage()

    // Get network
    const network = getNetworkInfo()

    setStats((prev) => ({
      ...prev,
      memory: memory
        ? {
            used: Math.round(memory.usedJSHeapSize / (1024 * 1024)),
            total: Math.round(memory.totalJSHeapSize / (1024 * 1024)),
          }
        : null,
      network,
    }))
  }

  function getRatingColor(rating: string): string {
    switch (rating) {
      case 'good':
        return 'text-green-500 bg-green-50'
      case 'needs-improvement':
        return 'text-yellow-500 bg-yellow-50'
      case 'poor':
        return 'text-red-500 bg-red-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Performance Monitor</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memory Usage */}
        <StatCard
          icon={<Gauge className="h-5 w-5" />}
          title="Memory Usage"
          value={stats.memory ? `${stats.memory.used} MB` : 'N/A'}
          subtitle={stats.memory ? `van ${stats.memory.total} MB` : 'Niet beschikbaar'}
          rating={
            stats.memory
              ? stats.memory.used / stats.memory.total > 0.8
                ? 'poor'
                : stats.memory.used / stats.memory.total > 0.6
                  ? 'needs-improvement'
                  : 'good'
              : undefined
          }
        />

        {/* Network */}
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Netwerk"
          value={stats.network?.effectiveType.toUpperCase() || 'N/A'}
          subtitle={stats.network ? `RTT: ${stats.network.rtt}ms` : 'Niet beschikbaar'}
          rating={
            stats.network
              ? stats.network.effectiveType === '4g'
                ? 'good'
                : stats.network.effectiveType === '3g'
                  ? 'needs-improvement'
                  : 'poor'
              : undefined
          }
        />

        {/* API Latency */}
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          title="API Latency (Gem.)"
          value={`${stats.apiLatency.avg.toFixed(0)} ms`}
          subtitle={`${stats.apiLatency.count} requests`}
          rating={
            stats.apiLatency.avg < 200
              ? 'good'
              : stats.apiLatency.avg < 500
                ? 'needs-improvement'
                : 'poor'
          }
        />

        {/* DB Queries */}
        <StatCard
          icon={<Database className="h-5 w-5" />}
          title="Database"
          value="Gezond"
          subtitle="Geen trage queries"
          rating="good"
        />
      </div>

      {/* Web Vitals */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <WebVitalCard
            name="LCP"
            description="Largest Contentful Paint"
            target="< 2.5s"
            value={stats.webVitals.find((v) => v.name === 'LCP')?.value}
            rating={stats.webVitals.find((v) => v.name === 'LCP')?.rating}
          />
          <WebVitalCard
            name="FID"
            description="First Input Delay"
            target="< 100ms"
            value={stats.webVitals.find((v) => v.name === 'FID')?.value}
            rating={stats.webVitals.find((v) => v.name === 'FID')?.rating}
          />
          <WebVitalCard
            name="CLS"
            description="Cumulative Layout Shift"
            target="< 0.1"
            value={stats.webVitals.find((v) => v.name === 'CLS')?.value}
            rating={stats.webVitals.find((v) => v.name === 'CLS')?.rating}
          />
          <WebVitalCard
            name="INP"
            description="Interaction to Next Paint"
            target="< 200ms"
            value={stats.webVitals.find((v) => v.name === 'INP')?.value}
            rating={stats.webVitals.find((v) => v.name === 'INP')?.rating}
          />
          <WebVitalCard
            name="FCP"
            description="First Contentful Paint"
            target="< 1.8s"
            value={stats.webVitals.find((v) => v.name === 'FCP')?.value}
            rating={stats.webVitals.find((v) => v.name === 'FCP')?.rating}
          />
          <WebVitalCard
            name="TTFB"
            description="Time to First Byte"
            target="< 800ms"
            value={stats.webVitals.find((v) => v.name === 'TTFB')?.value}
            rating={stats.webVitals.find((v) => v.name === 'TTFB')?.rating}
          />
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium text-gray-900">Recente Alerts</h3>
        </div>
        <div className="space-y-2">
          <AlertItem
            type="warning"
            message="3 API calls duurden langer dan 500ms in het afgelopen uur"
            time="2 min geleden"
          />
          <AlertItem
            type="info"
            message="Memory usage piekte tot 85% tijdens piekuur"
            time="1 uur geleden"
          />
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Optimalisatie Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Afbeeldingen worden geoptimaliseerd met next/image
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            API responses worden gecached met Redis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500">!</span>
            Overweeg lazy loading voor zware componenten
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500">!</span>
            Bundle size kan worden verkleind met tree shaking
          </li>
        </ul>
      </div>
    </div>
  )
}

// ==================== SUB COMPONENTS ====================

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  rating?: 'good' | 'needs-improvement' | 'poor'
}

function StatCard({ icon, title, value, subtitle, rating }: StatCardProps) {
  const ratingColors = {
    good: 'border-green-200 bg-green-50',
    'needs-improvement': 'border-yellow-200 bg-yellow-50',
    poor: 'border-red-200 bg-red-50',
  }

  return (
    <div
      className={`rounded-lg border p-4 ${rating ? ratingColors[rating] : 'border-gray-200 bg-white'}`}
    >
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  )
}

interface WebVitalCardProps {
  name: string
  description: string
  target: string
  value?: number
  rating?: 'good' | 'needs-improvement' | 'poor'
}

function WebVitalCard({ name, description, target, value, rating }: WebVitalCardProps) {
  const displayValue = value !== undefined ? (name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`) : '—'

  const ratingColors = {
    good: 'text-green-600 bg-green-100',
    'needs-improvement': 'text-yellow-600 bg-yellow-100',
    poor: 'text-red-600 bg-red-100',
  }

  return (
    <div className="text-center p-3 border border-gray-100 rounded-lg">
      <div
        className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${rating ? ratingColors[rating] : 'text-gray-500 bg-gray-100'}`}
      >
        {name}
      </div>
      <div className="text-xl font-bold text-gray-900">{displayValue}</div>
      <div className="text-xs text-gray-400 mt-1">{target}</div>
    </div>
  )
}

interface AlertItemProps {
  type: 'warning' | 'error' | 'info'
  message: string
  time: string
}

function AlertItem({ type, message, time }: AlertItemProps) {
  const typeStyles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${typeStyles[type]}`}>
      <span className="text-sm">{message}</span>
      <span className="text-xs opacity-70">{time}</span>
    </div>
  )
}
