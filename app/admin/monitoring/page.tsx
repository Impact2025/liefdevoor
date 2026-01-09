/**
 * WERELDKLASSE Real-Time Monitoring Dashboard
 *
 * Features:
 * - Real-time health metrics
 * - Auto-refresh every 30 seconds
 * - Color-coded alerts
 * - Detailed drill-down
 * - Export capabilities
 */

'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Mail, Users, Shield, AlertCircle } from 'lucide-react'

interface HealthMetrics {
  timestamp: string
  overall: 'healthy' | 'degraded' | 'critical'
  email: {
    status: 'operational' | 'degraded' | 'down'
    last24h: {
      sent: number
      delivered: number
      failed: number
      deliveryRate: number
    }
    verificationEmails: {
      sent: number
      deliveryRate: number
    }
  }
  registration: {
    last24h: number
    last7d: number
    verificationRate: number
    onboardingCompletionRate: number
    profileCompleteRate: number
  }
  spam: {
    detectedLast24h: number
    blockedLast24h: number
    failedLoginsLast24h: number
    spamRate: number
  }
  errors: {
    last24h: number
    last7d: number
    critical: number
  }
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical'
    message: string
    metric?: string
    value?: number
    threshold?: number
  }>
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/monitoring/health')
      if (!res.ok) throw new Error('Failed to fetch metrics')
      const data = await res.json()
      setMetrics(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600 bg-green-50'
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
      case 'down':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-5 h-5" />
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'critical':
      case 'down':
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading && !metrics) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg">Loading metrics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-500 mt-1">Real-time health & performance metrics</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-refresh (30s)</span>
            </label>

            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {lastUpdate && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString('nl-NL')}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {metrics && (
        <>
          {/* Overall Status */}
          <div className={`mb-8 p-6 rounded-xl ${getStatusColor(metrics.overall)} border-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(metrics.overall)}
                <div>
                  <h2 className="text-lg font-semibold">Overall System Status</h2>
                  <p className="text-sm capitalize">{metrics.overall}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{metrics.alerts.filter(a => a.severity === 'critical').length}</p>
                <p className="text-sm">Critical Alerts</p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Email System */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Email System</h3>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.email.status)}`}>
                {getStatusIcon(metrics.email.status)}
                <span className="capitalize">{metrics.email.status}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent (24h):</span>
                  <span className="font-medium">{metrics.email.last24h.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Rate:</span>
                  <span className="font-medium">{metrics.email.last24h.deliveryRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification:</span>
                  <span className="font-medium">{metrics.email.verificationEmails.sent}</span>
                </div>
              </div>
            </div>

            {/* Registration */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Registration</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {metrics.registration.last24h}
              </div>
              <div className="text-sm text-gray-500 mb-4">New users (24h)</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification:</span>
                  <span className={`font-medium ${metrics.registration.verificationRate < 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.registration.verificationRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Onboarding:</span>
                  <span className={`font-medium ${metrics.registration.onboardingCompletionRate < 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.registration.onboardingCompletionRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Spam */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Spam Protection</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {metrics.spam.blockedLast24h}
              </div>
              <div className="text-sm text-gray-500 mb-4">Blocked (24h)</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Spam Rate:</span>
                  <span className={`font-medium ${metrics.spam.spamRate > 30 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.spam.spamRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed Logins:</span>
                  <span className="font-medium">{metrics.spam.failedLoginsLast24h}</span>
                </div>
              </div>
            </div>

            {/* Errors */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">System Errors</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {metrics.errors.last24h}
              </div>
              <div className="text-sm text-gray-500 mb-4">Errors (24h)</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 7 days:</span>
                  <span className="font-medium">{metrics.errors.last7d}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Critical:</span>
                  <span className={`font-medium ${metrics.errors.critical > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.errors.critical}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">System Alerts</h2>
            {metrics.alerts.length === 0 ? (
              <p className="text-gray-500">No alerts</p>
            ) : (
              <div className="space-y-3">
                {metrics.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 border-red-500'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        {alert.metric && (
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.metric}: {alert.value} (threshold: {alert.threshold})
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 uppercase">{alert.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/emails"
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email Logs</p>
                  <p className="text-sm text-gray-500">View email history</p>
                </div>
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">User Management</p>
                  <p className="text-sm text-gray-500">Manage users</p>
                </div>
              </a>
              <a
                href="/admin/spam"
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Shield className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Spam Management</p>
                  <p className="text-sm text-gray-500">Review spam</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
