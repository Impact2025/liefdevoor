'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  bgColor?: string
  iconColor?: string
  textColor?: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

/**
 * Reusable Stat Card Component for Admin Dashboard
 *
 * Displays a single metric with icon, value, and optional trend indicator
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  bgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  textColor = 'text-blue-900',
  subtitle,
  trend,
}: StatCardProps) {
  return (
    <div className={`${bgColor} p-6 rounded-lg transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className={`w-8 h-8 ${iconColor}`} />
          <div className="ml-4">
            <p className={`text-sm font-medium ${iconColor}`}>{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>

        {trend && (
          <div
            className={`ml-4 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}
