'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Activity, TrendingUp, Calendar, Filter } from 'lucide-react'

interface ActivityEvent {
  id: string
  type: 'swipe' | 'match' | 'message' | 'report' | 'login' | 'subscription'
  timestamp: Date
  icon: string
  title: string
  description: string
  metadata?: Record<string, any>
}

interface ActivityStats {
  totalSwipes: number
  totalMatches: number
  totalMessages: number
  totalReportsSent: number
  totalReportsReceived: number
  totalLogins: number
  totalSubscriptions: number
}

interface UserActivityTimelineProps {
  userId: string
  userName?: string
}

/**
 * User Activity Timeline Component
 *
 * Displays complete activity history for a user with filtering
 */
export default function UserActivityTimeline({ userId, userName }: UserActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchActivity()
  }, [userId])

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/activity`)
      if (!response.ok) throw new Error('Failed to fetch activity')

      const data = await response.json()
      setActivities(data.activities.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      })))
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      toast.error('Failed to load activity timeline')
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter)

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'swipe': return 'bg-blue-100 text-blue-800'
      case 'match': return 'bg-green-100 text-green-800'
      case 'message': return 'bg-purple-100 text-purple-800'
      case 'report': return 'bg-red-100 text-red-800'
      case 'login': return 'bg-gray-100 text-gray-800'
      case 'subscription': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-indigo-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
              <p className="text-sm text-gray-500">
                {userName ? `Complete history for ${userName}` : 'Complete activity history'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchActivity}
            className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Swipes" value={stats.totalSwipes} color="blue" />
            <StatCard label="Matches" value={stats.totalMatches} color="green" />
            <StatCard label="Messages" value={stats.totalMessages} color="purple" />
            <StatCard label="Reports Sent" value={stats.totalReportsSent} color="orange" />
            <StatCard label="Reports Received" value={stats.totalReportsReceived} color="red" />
            <StatCard label="Logins" value={stats.totalLogins} color="gray" />
            <StatCard label="Subscriptions" value={stats.totalSubscriptions} color="yellow" />
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {['all', 'swipe', 'match', 'message', 'report', 'login', 'subscription'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading activity...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0"
              >
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTypeColor(activity.type)}`}>
                    {activity.icon}
                  </div>
                  {index !== filteredActivities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>

                      {/* Metadata preview */}
                      {activity.metadata?.preview && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{activity.metadata.preview}"
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  {/* Type badge */}
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-50 text-gray-700',
    yellow: 'bg-yellow-50 text-yellow-700'
  }

  return (
    <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}
