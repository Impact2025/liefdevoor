'use client'

import { Heart, BarChart3, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import StatCard from '@/components/admin/shared/StatCard'

interface Match {
  id: string
  createdAt: string
  user1: {
    name: string | null
    email: string
    safetyScore: number
  }
  user2: {
    name: string | null
    email: string
    safetyScore: number
  }
  _count: {
    messages: number
  }
}

interface MatchStats {
  totalMatches: number
  matchesLast30Days: number
  avgMessagesPerMatch: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface MatchesTableProps {
  matches: Match[]
  matchStats: MatchStats
  loading: boolean
  pagination: Pagination
  onPageChange: (page: number) => void
}

/**
 * Admin Matches Table Component
 *
 * Displays match oversight with statistics and match list
 */
export default function MatchesTable({
  matches,
  matchStats,
  loading,
  pagination,
  onPageChange,
}: MatchesTableProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Oversight</h2>

      {/* Match Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Matches"
          value={matchStats.totalMatches}
          icon={Heart}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          textColor="text-blue-900"
        />

        <StatCard
          title="Matches (30 days)"
          value={matchStats.matchesLast30Days}
          icon={BarChart3}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          textColor="text-green-900"
        />

        <StatCard
          title="Avg Messages/Match"
          value={matchStats.avgMessagesPerMatch.toFixed(1)}
          icon={Users}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          textColor="text-purple-900"
        />
      </div>

      {/* Matches Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Safety Scores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No matches found
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Match #{match.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {match.user1.name || 'User 1'} ({match.user1.email})
                        </div>
                        <div className="text-sm text-gray-900">
                          {match.user2.name || 'User 2'} ({match.user2.email})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          User 1: {match.user1.safetyScore}/100
                        </div>
                        <div className="text-sm text-gray-900">
                          User 2: {match.user2.safetyScore}/100
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {match._count.messages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} matches
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
