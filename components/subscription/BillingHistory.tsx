/**
 * BillingHistory - Show subscription billing history
 *
 * Responsive design: stack on mobile, horizontal on desktop
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
      <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 sm:p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Betaald'
      case 'pending':
        return 'Behandeling'
      case 'failed':
        return 'Mislukt'
      default:
        return 'Onbekend'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden ${className}`}>
      {/* Header - Mobiel Optimized */}
      <div className="p-4 sm:p-6 border-b border-slate-200/50 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Factuurgeschiedenis</h3>
            <p className="text-xs sm:text-sm text-slate-600 truncate">Bekijk eerdere betalingen</p>
          </div>
        </div>
      </div>

      {/* Billing Records - MOBIEL RESPONSIVE */}
      <div className="p-4 sm:p-6">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Geen factuurgeschiedenis</p>
            <p className="text-sm text-gray-400 mt-1">
              Jouw betalingen verschijnen hier
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
                className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 hover:border-slate-300/50 transition-all"
              >
                {/* MOBILE LAYOUT - Stack everything */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                  {/* Top Row - Date & Status on Mobile */}
                  <div className="flex items-center justify-between sm:hidden">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {new Date(record.date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span className="hidden xs:inline">{getStatusLabel(record.status)}</span>
                    </div>
                  </div>

                  {/* Description & Plan */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate sm:text-base">
                      {record.plan === 'PLUS' ? 'Liefde Plus' :
                       record.plan === 'COMPLETE' ? 'Liefde Compleet' : 'Basis'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">Maandelijks abonnement</p>
                  </div>

                  {/* Desktop Date - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {new Date(record.date).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Bottom Row - Amount & Actions */}
                  <div className="flex items-center justify-between sm:contents">
                    {/* Amount */}
                    <div>
                      <p className="text-xl sm:text-lg font-bold text-slate-900">
                        €{record.amount.toFixed(2)}
                      </p>
                    </div>

                    {/* Desktop Status - Hidden on mobile */}
                    <div className={`hidden sm:flex px-3 py-1.5 rounded-full border text-xs font-medium items-center gap-1.5 ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {getStatusLabel(record.status)}
                    </div>

                    {/* Download Button */}
                    {record.invoiceUrl && record.status === 'paid' && (
                      <button
                        onClick={() => window.open(record.invoiceUrl, '_blank')}
                        className="p-2 sm:p-2.5 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-200"
                        title="Download factuur"
                      >
                        <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary - Mobiel Optimized */}
      {records.length > 0 && (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Totaal betaald</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatPrice(records.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingHistory
