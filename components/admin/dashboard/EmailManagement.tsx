'use client'

import { Send, TrendingUp, Filter, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { FormEvent } from 'react'

interface EmailStats {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalFailed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
}

interface EmailFilters {
  type: string
  category: string
  status: string
  email: string
  dateFrom: string
  dateTo: string
}

interface TestEmailForm {
  type: string
  email: string
}

interface Email {
  id: string
  email: string
  type: string
  category: string
  subject: string
  status: string
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  bouncedAt?: string
  user?: {
    name: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface EmailManagementProps {
  stats: EmailStats
  filters: EmailFilters
  testForm: TestEmailForm
  emails: Email[]
  loading: boolean
  sendingTest: boolean
  pagination: Pagination
  onFiltersChange: (field: keyof EmailFilters, value: string) => void
  onClearFilters: () => void
  onTestFormChange: (field: keyof TestEmailForm, value: string) => void
  onSendTest: () => Promise<void>
  onPageChange: (page: number) => void
}

/**
 * Admin Email Management Component
 *
 * Email logs, statistics, and test email functionality
 */
export default function EmailManagement({
  stats,
  filters,
  testForm,
  emails,
  loading,
  sendingTest,
  pagination,
  onFiltersChange,
  onClearFilters,
  onTestFormChange,
  onSendTest,
  onPageChange,
}: EmailManagementProps) {
  const handleSendTest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await toast.promise(
        onSendTest(),
        {
          loading: 'Sending test email...',
          success: 'Test email sent successfully!',
          error: 'Failed to send test email',
        }
      )
    } catch (error) {
      console.error('Failed to send test email:', error)
    }
  }

  const hasActiveFilters =
    filters.type || filters.category || filters.status || filters.email || filters.dateFrom || filters.dateTo

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Management</h2>

      {/* Email Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <Send className="w-6 h-6 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-blue-600 mt-2">Total Sent</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalSent.toLocaleString()}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-600">Delivery Rate</p>
          <p className="text-2xl font-bold text-green-900">{stats.deliveryRate}%</p>
          <p className="text-xs text-green-600 mt-1">{stats.totalDelivered.toLocaleString()} delivered</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-600">Open Rate</p>
          <p className="text-2xl font-bold text-purple-900">{stats.openRate}%</p>
          <p className="text-xs text-purple-600 mt-1">{stats.totalOpened.toLocaleString()} opened</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-600">Click Rate</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.clickRate}%</p>
          <p className="text-xs text-yellow-600 mt-1">{stats.totalClicked.toLocaleString()} clicked</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-red-600">Bounce Rate</p>
          <p className="text-2xl font-bold text-red-900">{stats.bounceRate}%</p>
          <p className="text-xs text-red-600 mt-1">{stats.totalBounced.toLocaleString()} bounced</p>
        </div>
      </div>

      {/* Test Email Form */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Send className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Send Test Email</h3>
        </div>
        <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-4">
          <select
            value={testForm.type}
            onChange={(e) => onTestFormChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="match">Match Notification</option>
            <option value="message">Message Notification</option>
            <option value="password-reset">Password Reset</option>
            <option value="birthday">Birthday Email</option>
          </select>
          <input
            type="email"
            placeholder="Email address"
            value={testForm.email}
            onChange={(e) => onTestFormChange('email', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={sendingTest}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="transactional">Transactional</option>
            <option value="engagement">Engagement</option>
            <option value="marketing">Marketing</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => onFiltersChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="match">Match</option>
            <option value="message">Message</option>
            <option value="password_reset">Password Reset</option>
            <option value="birthday">Birthday</option>
            <option value="verification">Verification</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFiltersChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="text"
            placeholder="Search email..."
            value={filters.email}
            onChange={(e) => onFiltersChange('email', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange('dateFrom', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="From date"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange('dateTo', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="To date"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Email Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No emails found</p>
                    <p className="text-sm mt-2">
                      Try adjusting your filters or send a test email to get started
                    </p>
                  </td>
                </tr>
              ) : (
                emails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{email.email}</div>
                      {email.user && <div className="text-sm text-gray-500">{email.user.name}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{email.type}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {email.category.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{email.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          email.status === 'delivered' || email.status === 'opened' || email.status === 'clicked'
                            ? 'bg-green-100 text-green-800'
                            : email.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : email.status === 'bounced'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(email.sentAt).toLocaleString('nl-NL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-xs">
                        {email.deliveredAt && (
                          <span className="text-green-600" title="Delivered">
                            ✓
                          </span>
                        )}
                        {email.openedAt && (
                          <span className="text-blue-600" title="Opened">
                            👁
                          </span>
                        )}
                        {email.clickedAt && (
                          <span className="text-purple-600" title="Clicked">
                            🖱
                          </span>
                        )}
                        {email.bouncedAt && (
                          <span className="text-yellow-600" title="Bounced">
                            ⚠
                          </span>
                        )}
                        {!email.deliveredAt && !email.bouncedAt && email.status === 'failed' && (
                          <span className="text-red-600" title="Failed">
                            ✗
                          </span>
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
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} emails
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
