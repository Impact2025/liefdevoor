/**
 * BillingHistory - Show subscription billing history
 *
 * Displays past payments and invoices
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Receipt,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/pricing'

interface BillingRecord {
  id: string
  date: Date
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
  invoiceUrl?: string
  plan?: string
}

interface BillingHistoryProps {
  className?: string
}

export function BillingHistory({ className = '' }: BillingHistoryProps) {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBillingHistory()
  }, [])

  const fetchBillingHistory = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockData: BillingRecord[] = [
        {
          id: '1',
          date: new Date('2024-12-01'),
          amount: 9.95,
          status: 'paid',
          description: 'Liefde Plus - Maandelijks abonnement',
          plan: 'PLUS',
          invoiceUrl: '/invoices/1.pdf'
        },
        {
          id: '2',
          date: new Date('2024-11-01'),
          amount: 9.95,
          status: 'paid',
          description: 'Liefde Plus - Maandelijks abonnement',
          plan: 'PLUS',
          invoiceUrl: '/invoices/2.pdf'
        },
        {
          id: '3',
          date: new Date('2024-10-01'),
          amount: 9.95,
          status: 'paid',
          description: 'Liefde Plus - Maandelijks abonnement',
          plan: 'PLUS',
          invoiceUrl: '/invoices/3.pdf'
        },
      ]

      setRecords(mockData)
    } catch (error) {
      console.error('Error fetching billing history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Betaald'
      case 'pending':
        return 'In behandeling'
      case 'failed':
        return 'Mislukt'
      default:
        return 'Onbekend'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Factuurgeschiedenis</h3>
            <p className="text-sm text-gray-500">Bekijk je eerdere betalingen en download facturen</p>
          </div>
        </div>
      </div>

      {/* Billing Records */}
      <div className="p-6">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Geen factuurgeschiedenis gevonden</p>
            <p className="text-sm text-gray-400 mt-1">
              Jouw betalingen zullen hier verschijnen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Date */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{record.description}</p>
                      {record.plan && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {record.plan === 'PLUS' ? 'Liefde Plus' :
                           record.plan === 'COMPLETE' ? 'Liefde Compleet' : 'Basis'}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(record.amount)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {getStatusLabel(record.status)}
                    </div>

                    {/* Invoice Download */}
                    {record.invoiceUrl && record.status === 'paid' && (
                      <button
                        onClick={() => window.open(record.invoiceUrl, '_blank')}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Download factuur"
                      >
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {records.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>Totaal betaald</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(records.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingHistory
