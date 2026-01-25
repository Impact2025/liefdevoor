/**
 * Admin Ticket Detail Page
 * View and manage a support ticket
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  message: string
  isStaffReply: boolean
  createdAt: string
  author: {
    id: string
    name: string | null
    profileImage: string | null
    role: string
  }
}

interface Ticket {
  id: string
  subject: string
  description: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
    profileImage: string | null
  }
  assignedTo: {
    id: string
    name: string | null
  } | null
  messages: Message[]
}

interface PageProps {
  params: {
    id: string
  }
}

export default function AdminTicketDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTicket()
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const fetchTicket = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/helpdesk/tickets/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ticket niet gevonden')
      }

      setTicket(data.data.ticket)
    } catch (err: any) {
      console.error('Error fetching ticket:', err)
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!ticket) return

    try {
      const response = await fetch(`/api/admin/helpdesk/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update status')

      await fetchTicket()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Er ging iets mis bij het updaten van de status')
    }
  }

  const handleUpdatePriority = async (priority: string) => {
    if (!ticket) return

    try {
      const response = await fetch(`/api/admin/helpdesk/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      })

      if (!response.ok) throw new Error('Failed to update priority')

      await fetchTicket()
    } catch (error) {
      console.error('Error updating priority:', error)
      alert('Er ging iets mis bij het updaten van de prioriteit')
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket || !replyMessage.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Er ging iets mis')
      }

      setReplyMessage('')
      await fetchTicket()
    } catch (error: any) {
      console.error('Error sending reply:', error)
      alert(error.message || 'Er ging iets mis bij het versturen van je bericht.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      OPEN: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In behandeling' },
      WAITING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Wacht op gebruiker' },
      RESOLVED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Opgelost' },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Gesloten' }
    }

    const badge = badges[status] || badges.OPEN

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { color: string; label: string }> = {
      LOW: { color: 'text-green-600', label: 'Laag' },
      MEDIUM: { color: 'text-yellow-600', label: 'Normaal' },
      HIGH: { color: 'text-orange-600', label: 'Hoog' },
      URGENT: { color: 'text-red-600', label: 'Urgent' }
    }
    return labels[priority] || labels.MEDIUM
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket niet gevonden</h1>
            <p className="text-gray-600 mb-6">{error || 'Dit ticket bestaat niet of is verwijderd.'}</p>
            <Link
              href="/admin/support"
              className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Terug naar Support
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const ticketNumber = ticket.id.slice(-8).toUpperCase()
  const priority = getPriorityLabel(ticket.priority)
  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/support"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar Support Tickets
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-500">#{ticketNumber}</span>
                {getStatusBadge(ticket.status)}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium">{getCategoryLabel(ticket.category)}</span>
            </span>
            <span className={`flex items-center gap-2 ${priority.color}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{priority.label}</span>
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(ticket.createdAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Conversation */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Messages */}
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {ticket.messages.map((message) => {
                  const isStaff = message.isStaffReply

                  return (
                    <div key={message.id} className={`flex gap-4 ${isStaff ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.author.profileImage ? (
                          <img
                            src={message.author.profileImage}
                            alt={message.author.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isStaff ? 'bg-blue-100' : 'bg-rose-100'
                          }`}>
                            <span className={`font-medium text-sm ${
                              isStaff ? 'text-blue-600' : 'text-rose-600'
                            }`}>
                              {(message.author.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${isStaff ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isStaff ? 'justify-end' : ''}`}>
                          <span className="font-medium text-gray-900">
                            {message.author.name || 'Gebruiker'}
                          </span>
                          {isStaff && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Support Team
                            </span>
                          )}
                        </div>

                        <div className={`inline-block max-w-[85%] rounded-lg px-4 py-3 ${
                          isStaff
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {isClosed ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">Dit ticket is gesloten.</p>
                    <button
                      onClick={() => handleUpdateStatus('OPEN')}
                      className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Ticket heropenen
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReply}>
                    <label htmlFor="reply" className="block text-sm font-medium text-gray-900 mb-2">
                      Reageer als Support Team
                    </label>
                    <textarea
                      id="reply"
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Typ je antwoord..."
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed mb-4"
                    />
                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={!replyMessage.trim() || isSubmitting}
                        className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Versturen...' : 'Verstuur antwoord'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Gebruiker</h3>
              <div className="flex items-center gap-3">
                {ticket.user.profileImage ? (
                  <img
                    src={ticket.user.profileImage}
                    alt={ticket.user.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-rose-600 font-medium text-sm">
                      {(ticket.user.name || ticket.user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{ticket.user.name || 'Onbekend'}</p>
                  <p className="text-xs text-gray-500">{ticket.user.email}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Beheer</h3>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In behandeling</option>
                    <option value="WAITING">Wacht op gebruiker</option>
                    <option value="RESOLVED">Opgelost</option>
                    <option value="CLOSED">Gesloten</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                  >
                    <option value="LOW">Laag</option>
                    <option value="MEDIUM">Normaal</option>
                    <option value="HIGH">Hoog</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Original Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Oorspronkelijke Beschrijving</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Tijdlijn</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div>
                    <p className="text-gray-600">Aangemaakt</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString('nl-NL')} om{' '}
                      {new Date(ticket.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {ticket.updatedAt !== ticket.createdAt && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div>
                      <p className="text-gray-600">Laatst bijgewerkt</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(ticket.updatedAt).toLocaleDateString('nl-NL')} om{' '}
                        {new Date(ticket.updatedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.resolvedAt && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-gray-600">Opgelost</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(ticket.resolvedAt).toLocaleDateString('nl-NL')} om{' '}
                        {new Date(ticket.resolvedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
