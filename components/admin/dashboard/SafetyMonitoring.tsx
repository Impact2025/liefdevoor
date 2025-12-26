'use client'

import { Shield, Users, BarChart3, UserCheck, Settings } from 'lucide-react'
import StatCard from '@/components/admin/shared/StatCard'

interface SafetyStats {
  highRiskUsers: number
  mediumRiskUsers: number
  avgSafetyScore: number
  safeInteractions: number
}

interface SafetyMonitoringProps {
  stats: SafetyStats
  onAction?: (action: string) => void
}

/**
 * Admin Safety Monitoring Component
 *
 * Safety metrics and alerts dashboard
 */
export default function SafetyMonitoring({
  stats,
  onAction,
}: SafetyMonitoringProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Monitoring</h2>

      {/* Safety Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="High Risk Users"
          value={stats.highRiskUsers}
          icon={Shield}
          bgColor="bg-red-50"
          iconColor="text-red-600"
          textColor="text-red-900"
        />

        <StatCard
          title="Medium Risk"
          value={stats.mediumRiskUsers}
          icon={Users}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          textColor="text-yellow-900"
        />

        <StatCard
          title="Avg Safety Score"
          value={stats.avgSafetyScore}
          icon={BarChart3}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          textColor="text-blue-900"
        />

        <StatCard
          title="Safe Interactions"
          value={stats.safeInteractions}
          icon={UserCheck}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          textColor="text-green-900"
        />
      </div>

      {/* Safety Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Alerts</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Low Safety Score Alert:</strong> Monitor users with safety scores below
                  50.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>System Status:</strong> All safety monitoring systems are operational.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Safety Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onAction?.('review-high-risk')}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-4 h-4 mr-2" />
            Review High-Risk Users
          </button>
          <button
            onClick={() => onAction?.('generate-report')}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Safety Report
          </button>
          <button
            onClick={() => onAction?.('update-rules')}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Update Safety Rules
          </button>
        </div>
      </div>
    </div>
  )
}
