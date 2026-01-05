'use client'

import { Search, Ban, UserCheck, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import BulkActionBar from '@/components/admin/tables/BulkActionBar'
import UserActivityTimeline from '@/components/admin/UserActivityTimeline'

// Helper function to format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${diffYears}y ago`
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isVerified: boolean
  safetyScore: number
  createdAt: string
  lastSeen: string | null
  _count?: {
    matches1?: number
    matches2?: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface UsersTableProps {
  users: User[]
  loading: boolean
  search: string
  roleFilter: string
  pagination: Pagination
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onPageChange: (page: number) => void
  onUserAction: (userId: string, action: 'ban' | 'unban') => Promise<void>
}

/**
 * Admin Users Table Component
 *
 * Displays user list with search, filtering, and management actions
 */
export default function UsersTable({
  users,
  loading,
  search,
  roleFilter,
  pagination,
  onSearchChange,
  onRoleFilterChange,
  onPageChange,
  onUserAction,
}: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [viewingActivity, setViewingActivity] = useState<User | null>(null)

  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    const actionText = action === 'ban' ? 'ban' : 'unban'

    try {
      await toast.promise(
        onUserAction(userId, action),
        {
          loading: `${actionText === 'ban' ? 'Banning' : 'Unbanning'} user...`,
          success: `User ${actionText === 'ban' ? 'banned' : 'unbanned'} successfully!`,
          error: `Failed to ${actionText} user`,
        }
      )
    } catch (error) {
      // Error toast already shown by promise
      console.error(`Failed to ${actionText} user:`, error)
    }
  }

  const handleBulkAction = async (action: 'ban' | 'unban' | 'approve' | 'reject', reason?: string) => {
    const userIds = Array.from(selectedUsers)

    const response = await fetch('/api/admin/users/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, action, reason })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Bulk action failed')
    }

    // Clear selection and refresh list
    setSelectedUsers(new Set())
    // Trigger parent component to refetch users
    onPageChange(pagination.page)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Safety Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Online
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${selectedUsers.has(user.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'BANNED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.safetyScore}/100
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(user._count?.matches1 || 0) + (user._count?.matches2 || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatRelativeTime(user.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatRelativeTime(user.lastSeen)}
                      </div>
                      {user.lastSeen && (
                        <div className="text-xs text-gray-500">
                          {new Date(user.lastSeen).toLocaleDateString('nl-NL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setViewingActivity(user)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center transition-colors"
                          title="View activity timeline"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        {user.role !== 'BANNED' ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="text-red-600 hover:text-red-900 flex items-center transition-colors"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'unban')}
                            className="text-green-600 hover:text-green-900 flex items-center transition-colors"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Unban
                          </button>
                        )}
                      </div>
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
            {pagination.total} users
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

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedUsers.size}
        onClearSelection={() => setSelectedUsers(new Set())}
        onBulkAction={handleBulkAction}
        actions={['ban', 'unban', 'approve', 'reject']}
      />

      {/* Activity Timeline Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {viewingActivity.name || 'Unknown User'}
                </h2>
                <p className="text-sm text-gray-600">{viewingActivity.email}</p>
              </div>
              <button
                onClick={() => setViewingActivity(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              <UserActivityTimeline
                userId={viewingActivity.id}
                userName={viewingActivity.name || undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
