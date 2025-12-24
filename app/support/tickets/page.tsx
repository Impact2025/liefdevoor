/**
 * Tickets List Page
 * View all user's support tickets
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  _count: {
    messages: number
  }
}

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/helpdesk/tickets?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTickets(data.data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      OPEN: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In behandeling' },
      WAITING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Wacht op jou' },
      RESOLVED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Opgelost' },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Gesloten' }
    }

    const badge = badges[status as keyof typeof badges] || badges.OPEN

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      LOW: { icon: '🟢', label: 'Laag' },
      MEDIUM: { icon: '🟡', label: 'Normaal' },
      HIGH: { icon: '🟠', label: 'Hoog' },
      URGENT: { icon: '🔴', label: 'Urgent' }
    }

    const badge = badges[priority as keyof typeof badges] || badges.MEDIUM

    return (
      <span className="text-xs text-gray-600 flex items-center gap-1">
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ACCOUNT: 'Account',
      MATCHING: 'Matching',
      MESSAGES: 'Berichten',
      PAYMENTS: 'Betalingen',
      VERIFICATION: 'Verificatie',
      SAFETY: 'Veiligheid',
      TECHNICAL: 'Technisch',
      FEATURE: 'Feature verzoek',
      OTHER: 'Overig'
    }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/support"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar Support
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mijn Tickets</h1>
              <p className="text-lg text-gray-600">
                Bekijk en beheer je support tickets
              </p>
            </div>
            <Link
              href="/support/tickets/new"
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nieuw Ticket
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
            {[
              { value: 'all', label: 'Alle tickets' },
              { value: 'OPEN', label: 'Open' },
              { value: 'IN_PROGRESS', label: 'In behandeling' },
              { value: 'WAITING', label: 'Wacht op jou' },
              { value: 'RESOLVED', label: 'Opgelost' },
              { value: 'CLOSED', label: 'Gesloten' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen tickets gevonden</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all'
                ? 'Je hebt nog geen support tickets aangemaakt.'
                : `Je hebt geen tickets met status "${statusFilter}".`}
            </p>
            <Link
              href="/support/tickets/new"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Maak je eerste ticket aan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/tickets/${ticket.id}`}
                className="block bg-white rounded-lg p-6 border border-gray-200 hover:border-rose-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                      {getStatusBadge(ticket.status)}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {getCategoryLabel(ticket.category)}
                      </span>
                      <span>{getPriorityBadge(ticket.priority)}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {ticket._count.messages} bericht{ticket._count.messages !== 1 ? 'en' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(ticket.createdAt).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Last Updated */}
                    {ticket.updatedAt !== ticket.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Laatst bijgewerkt: {new Date(ticket.updatedAt).toLocaleDateString('nl-NL')} om{' '}
                        {new Date(ticket.updatedAt).toLocaleTimeString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
