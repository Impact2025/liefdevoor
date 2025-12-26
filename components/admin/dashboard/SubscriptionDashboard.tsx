'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface SubscriptionStats {
  overview: {
    totalActive: number
    monthlyRevenue: string
    newThisMonth: number
    churnRate: string
    churnedCount: number
  }
  subscriptionsByPlan: Record<string, number>
  recentSubscriptions: Array<{
    id: string
    userName: string
    userEmail: string | null
    plan: string
    status: string
    startDate: Date
    endDate: Date | null
    cancelledAt: Date | null
    createdAt: Date
  }>
  trends: Array<{
    date: string
    newSubscriptions: number
    cancelled: number
    net: number
  }>
  paymentStats: {
    recentPayments: any[]
    failedPayments: number
    totalRevenue: number
  } | null
}

/**
 * Subscription & Payment Dashboard Component
 *
 * Displays subscription metrics, trends, and recent activity
 */
export default function SubscriptionDashboard() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/subscriptions/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats({
        ...data,
        recentSubscriptions: data.recentSubscriptions.map((sub: any) => ({
          ...sub,
          startDate: new Date(sub.startDate),
          endDate: sub.endDate ? new Date(sub.endDate) : null,
          cancelledAt: sub.cancelledAt ? new Date(sub.cancelledAt) : null,
          createdAt: new Date(sub.createdAt)
        }))
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      toast.error('Failed to load subscription stats')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'basic':
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'premium':
        return 'bg-blue-100 text-blue-800'
      case 'gold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load subscription stats
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscriptions & Payments</h2>
          <p className="text-sm text-gray-600">Monitor subscription metrics and revenue</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Active Subscriptions"
          value={stats.overview.totalActive}
          color="blue"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Monthly Revenue"
          value={`€${stats.overview.monthlyRevenue}`}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="New This Month"
          value={stats.overview.newThisMonth}
          color="indigo"
        />
        <StatCard
          icon={<TrendingDown className="w-6 h-6" />}
          label="Churn Rate"
          value={`${stats.overview.churnRate}%`}
          color="red"
          subtitle={`${stats.overview.churnedCount} cancelled`}
        />
        {stats.paymentStats && (
          <StatCard
            icon={<CreditCard className="w-6 h-6" />}
            label="Failed Payments"
            value={stats.paymentStats.failedPayments}
            color="orange"
          />
        )}
      </div>

      {/* Plan Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscriptions by Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(stats.subscriptionsByPlan).map(([plan, count]) => (
            <div key={plan} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(plan)}`}>
                  {plan.toUpperCase()}
                </span>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${(count / stats.overview.totalActive) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">30-Day Trend</h3>
        <div className="space-y-2">
          {stats.trends.slice(-7).map(trend => (
            <div key={trend.date} className="flex items-center space-x-4">
              <span className="text-xs text-gray-600 w-20">{trend.date}</span>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-100 rounded-full h-6 flex">
                  {trend.newSubscriptions > 0 && (
                    <div
                      className="bg-green-500 rounded-l-full flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(trend.newSubscriptions / 10) * 100}%` }}
                    >
                      +{trend.newSubscriptions}
                    </div>
                  )}
                  {trend.cancelled > 0 && (
                    <div
                      className="bg-red-500 rounded-r-full flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(trend.cancelled / 10) * 100}%` }}
                    >
                      -{trend.cancelled}
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium w-12 ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.net >= 0 ? '+' : ''}{trend.net}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ends</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentSubscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sub.userName}</div>
                      <div className="text-xs text-gray-500">{sub.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPlanColor(sub.plan)}`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(sub.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {sub.cancelledAt ? (
                      <span className="text-red-600">Cancelled {formatDate(sub.cancelledAt)}</span>
                    ) : (
                      formatDate(sub.endDate)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Stat Card Component
 */
function StatCard({
  icon,
  label,
  value,
  color,
  subtitle
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  }

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium opacity-90">{label}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  )
}
