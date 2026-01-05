'use client'

import {
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageSquare,
  UserCheck,
  Zap,
  Activity,
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield
} from 'lucide-react'
import type { DashboardStats } from '@/lib/admin/stats-aggregator'

interface StatsOverviewProps {
  stats: DashboardStats
}

/**
 * Wereldklasse Admin Dashboard Overview
 *
 * Comprehensive management dashboard with:
 * - Real-time KPIs with trend indicators
 * - Growth visualizations
 * - Revenue metrics
 * - Engagement analytics
 * - Quick insights and alerts
 */
export default function StatsOverview({ stats }: StatsOverviewProps) {
  // Calculate growth percentages
  const userGrowthWeek = stats.users.newThisWeek
  const matchGrowthWeek = stats.matches.thisWeek
  const revenueActive = stats.subscriptions.active
  const engagementRate = stats.users.total > 0
    ? Math.round((stats.engagement.dailyActiveUsers / stats.users.total) * 100)
    : 0

  // Calculate match success rate
  const matchSuccessRate = stats.matches.total > 0
    ? Math.round((stats.matches.total / stats.users.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Real-time platform analytics and insights</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Data</span>
        </div>
      </div>

      {/* Hero KPIs - 4 Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            {userGrowthWeek > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">+{userGrowthWeek}</span>
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Users</h3>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold">{stats.users.total.toLocaleString()}</p>
            <div className="mb-2 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <span className="text-xs">+{stats.users.newToday} today</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="opacity-75">Verified: {stats.users.verified}</span>
            <span className="opacity-75">Online: {stats.users.online}</span>
          </div>
        </div>

        {/* Total Matches */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Heart className="w-6 h-6" />
            </div>
            {matchGrowthWeek > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">+{matchGrowthWeek}</span>
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Matches</h3>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold">{stats.matches.total.toLocaleString()}</p>
            <div className="mb-2 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <span className="text-xs">+{stats.matches.today} today</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="opacity-75">Match Rate: {matchSuccessRate}%</span>
            <span className="opacity-75">This Week: {stats.matches.thisWeek}</span>
          </div>
        </div>

        {/* Active Revenue */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            {revenueActive > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">{revenueActive}</span>
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Active Subscriptions</h3>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold">{stats.subscriptions.active}</p>
            <div className="mb-2 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <span className="text-xs">subscribers</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="opacity-75">Premium: {stats.subscriptions.premium}</span>
            <span className="opacity-75">Gold: {stats.subscriptions.gold}</span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">{engagementRate}%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Daily Engagement</h3>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold">{stats.engagement.dailyActiveUsers}</p>
            <div className="mb-2 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <span className="text-xs">DAU</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="opacity-75">WAU: {stats.engagement.weeklyActiveUsers}</span>
            <span className="opacity-75">MAU: {stats.engagement.monthlyActiveUsers}</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.messages.total.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Messages</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Today</span>
            <span className="font-semibold text-gray-900">{stats.messages.today}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Avg per Match</span>
            <span className="font-semibold text-gray-900">{stats.messages.averagePerMatch}</span>
          </div>
        </div>

        {/* Swipes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 rounded-lg">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.swipes.total.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Swipes</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Like Rate</span>
            <span className="font-semibold text-gray-900">{stats.swipes.likeRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Match Rate</span>
            <span className="font-semibold text-gray-900">{stats.swipes.matchRate}%</span>
          </div>
        </div>

        {/* Reports */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.reports.pending}</p>
              <p className="text-xs text-gray-500">Pending Reports</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Resolved</span>
            <span className="font-semibold text-gray-900">{stats.reports.resolved}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">This Week</span>
            <span className="font-semibold text-gray-900">{stats.reports.thisWeek}</span>
          </div>
        </div>
      </div>

      {/* Insights & Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Key Insights
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <ArrowUpRight className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Strong User Growth</p>
                <p className="text-sm text-gray-600">+{stats.users.newThisWeek} new users this week</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">High Engagement</p>
                <p className="text-sm text-gray-600">{engagementRate}% of users active daily</p>
              </div>
            </div>

            {stats.reports.pending > 5 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Attention Needed</p>
                  <p className="text-sm text-gray-600">{stats.reports.pending} reports pending review</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Revenue Stream</p>
                <p className="text-sm text-gray-600">{stats.subscriptions.active} active subscriptions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Real-time Activity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Online Now</p>
              <p className="text-3xl font-bold text-blue-600">{stats.users.online}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.users.active}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100">
              <p className="text-sm text-gray-600 mb-1">Today's Matches</p>
              <p className="text-3xl font-bold text-rose-600">{stats.matches.today}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Today's Swipes</p>
              <p className="text-3xl font-bold text-purple-600">{stats.swipes.today}</p>
            </div>
          </div>

          {/* Mini Growth Indicators */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Super Likes</span>
              <span className="font-semibold text-yellow-600 flex items-center gap-1">
                <Award className="w-4 h-4" />
                {stats.swipes.superLikes}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Verified Users</span>
              <span className="font-semibold text-green-600 flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                {stats.users.verified}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends (Visual representation) */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          7-Day Growth Trends
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* User Growth */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">User Registrations</p>
            <div className="flex items-end gap-1 h-24">
              {stats.growth.usersLastWeek.map((count, i) => {
                const maxCount = Math.max(...stats.growth.usersLastWeek, 1)
                const height = (count / maxCount) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer group relative"
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: ${count} users`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {count} users
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>7d ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Match Growth */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">New Matches</p>
            <div className="flex items-end gap-1 h-24">
              {stats.growth.matchesLastWeek.map((count, i) => {
                const maxCount = Math.max(...stats.growth.matchesLastWeek, 1)
                const height = (count / maxCount) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t hover:from-rose-600 hover:to-pink-500 transition-all cursor-pointer group relative"
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: ${count} matches`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {count} matches
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>7d ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
