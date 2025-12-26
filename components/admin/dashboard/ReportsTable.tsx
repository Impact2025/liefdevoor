'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  reporter: {
    name: string
    email: string
  }
  reported: {
    name: string
    email: string
    safetyScore: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ReportsTableProps {
  reports: Report[]
  loading: boolean
  statusFilter: string
  pagination: Pagination
  onStatusFilterChange: (status: string) => void
  onPageChange: (page: number) => void
  onReportAction: (reportId: string, action: 'resolve' | 'dismiss') => Promise<void>
}

/**
 * Admin Reports Table Component
 *
 * Displays user reports with filtering and resolution actions
 */
export default function ReportsTable({
  reports,
  loading,
  statusFilter,
  pagination,
  onStatusFilterChange,
  onPageChange,
  onReportAction,
}: ReportsTableProps) {
  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await toast.promise(
        onReportAction(reportId, action),
        {
          loading: `${action === 'resolve' ? 'Resolving' : 'Dismissing'} report...`,
          success: `Report ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully!`,
          error: `Failed to ${action} report`,
        }
      )
    } catch (error) {
      console.error(`Failed to ${action} report:`, error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Management</h2>

      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="pending">Pending Reports</option>
          <option value="resolved">Resolved Reports</option>
          <option value="dismissed">Dismissed Reports</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.reason.replace('_', ' ').toUpperCase()}
                        </div>
                        {report.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {report.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.reporter.name}</div>
                      <div className="text-sm text-gray-500">{report.reporter.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.reported.name}</div>
                      <div className="text-sm text-gray-500">{report.reported.email}</div>
                      <div className="text-xs text-gray-400">
                        Safety: {report.reported.safetyScore}/100
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {report.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReportAction(report.id, 'resolve')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
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
            {pagination.total} reports
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
