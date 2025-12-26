'use client'

import { Download, FileText, Table } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DataExportProps {
  types: Array<{
    value: 'users' | 'matches' | 'reports' | 'subscriptions' | 'audit_logs'
    label: string
  }>
}

/**
 * Data Export Component
 *
 * Allows admins to export data in CSV or JSON format
 */
export default function DataExport({ types }: DataExportProps) {
  const [selectedType, setSelectedType] = useState(types[0]?.value || 'users')
  const [format, setFormat] = useState<'csv' | 'json'>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          format,
          filters: {}
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename="')[1]?.split('"')[0]
        : `export_${selectedType}.${format}`

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${selectedType} exported successfully!`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Download className="w-6 h-6 text-green-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setFormat('csv')}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                format === 'csv'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
              }`}
            >
              <Table className="w-4 h-4 inline mr-2" />
              CSV
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                format === 'json'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              JSON
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        <strong>Note:</strong> Exports are limited to 10,000 records and rate-limited to 5 exports per hour.
      </p>
    </div>
  )
}
