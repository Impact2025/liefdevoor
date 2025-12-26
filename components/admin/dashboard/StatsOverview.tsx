'use client'

import { Users, Heart, BarChart3, Shield } from 'lucide-react'
import StatCard from '@/components/admin/shared/StatCard'

interface DashboardStats {
  totalUsers: number
  totalMatches: number
  activeUsers: number
  reportedUsers: number
}

interface StatsOverviewProps {
  stats: DashboardStats
}

/**
 * Admin Dashboard Stats Overview Component
 *
 * Displays key metrics in a 4-card grid using reusable StatCard components:
 * - Total Users
 * - Total Matches
 * - Active Users
 * - Reported Users
 */
export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          textColor="text-blue-900"
        />

        <StatCard
          title="Total Matches"
          value={stats.totalMatches}
          icon={Heart}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          textColor="text-green-900"
        />

        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={BarChart3}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          textColor="text-yellow-900"
        />

        <StatCard
          title="Reported Users"
          value={stats.reportedUsers}
          icon={Shield}
          bgColor="bg-red-50"
          iconColor="text-red-600"
          textColor="text-red-900"
        />
      </div>

      {/* Helper Text */}
      <div className="text-center text-gray-500">
        <p>Select a tab from the sidebar to manage specific features.</p>
      </div>
    </div>
  )
}
