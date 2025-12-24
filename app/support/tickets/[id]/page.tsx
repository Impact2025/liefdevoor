/**
 * Ticket Detail Page
 * View ticket details and conversation
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { TicketConversation } from '@/components/helpdesk/TicketConversation'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { title: 'Login vereist' }
  }

  const ticket = await prisma.helpDeskTicket.findUnique({
    where: { id: params.id },
    select: { subject: true }
  })

  if (!ticket) {
    return { title: 'Ticket niet gevonden' }
  }

  return {
    title: ticket.subject,
    description: `Support ticket: ${ticket.subject}`
  }
}

export default async function TicketDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/support/tickets/' + params.id)
  }

  const ticket = await prisma.helpDeskTicket.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          role: true
        }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              role: true
            }
          }
        }
      }
    }
  })

  if (!ticket) {
    notFound()
  }

  // Check if user owns this ticket
  if (ticket.userId !== session.user.id) {
    redirect('/support/tickets')
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { icon: string; label: string }> = {
      LOW: { icon: '🟢', label: 'Laag' },
      MEDIUM: { icon: '🟡', label: 'Normaal' },
      HIGH: { icon: '🟠', label: 'Hoog' },
      URGENT: { icon: '🔴', label: 'Urgent' }
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

  const priority = getPriorityLabel(ticket.priority)
  const ticketNumber = ticket.id.slice(-8).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/support/tickets"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar Mijn Tickets
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
            <span className="flex items-center gap-2">
              <span>{priority.icon}</span>
              <span>Prioriteit: {priority.label}</span>
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aangemaakt: {new Date(ticket.createdAt).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Conversation */}
          <div className="lg:col-span-2">
            <TicketConversation
              ticketId={ticket.id}
              initialMessages={ticket.messages}
              currentUserId={session.user.id}
              status={ticket.status}
            />
          </div>

          {/* Sidebar - Ticket Info */}
          <div className="space-y-6">
            {/* Original Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Oorspronkelijke Beschrijving</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Assigned To */}
            {ticket.assignedTo && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Toegewezen aan</h3>
                <div className="flex items-center gap-3">
                  {ticket.assignedTo.profileImage ? (
                    <img
                      src={ticket.assignedTo.profileImage}
                      alt={ticket.assignedTo.name || 'Support'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                      <span className="text-rose-600 font-medium text-sm">
                        {(ticket.assignedTo.name || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{ticket.assignedTo.name}</p>
                    <p className="text-xs text-gray-500">Support Team</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Info */}
            {ticket.status === 'WAITING' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-900 mb-1">Wacht op jouw reactie</h4>
                    <p className="text-sm text-yellow-700">
                      Het support team wacht op een reactie van jou.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {ticket.status === 'RESOLVED' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-900 mb-1">Ticket opgelost</h4>
                    <p className="text-sm text-green-700">
                      Dit ticket is gemarkeerd als opgelost. Je kunt nog steeds reageren als je meer hulp nodig hebt.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

                {ticket.updatedAt.getTime() !== ticket.createdAt.getTime() && (
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

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Hulp nodig?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Bekijk onze FAQ voor snelle antwoorden
              </p>
              <Link
                href="/support/faq"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Naar FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
