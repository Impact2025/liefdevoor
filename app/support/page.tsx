/**
 * Support Overview Page
 * Main entry point for user support - FAQ, tickets, chatbot
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Support & Hulp',
  description: 'Hulp nodig? Bekijk veelgestelde vragen, maak een support ticket aan of chat met onze AI assistent.',
}

export default async function SupportPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/support')
  }

  // Get user's recent tickets
  const recentTickets = await prisma.helpDeskTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      subject: true,
      status: true,
      category: true,
      createdAt: true,
      _count: {
        select: { messages: true }
      }
    }
  })

  // Get ticket stats
  const ticketStats = await prisma.helpDeskTicket.groupBy({
    by: ['status'],
    where: { userId: session.user.id },
    _count: true
  })

  const openTickets = ticketStats.find(s => s.status === 'OPEN')?._count || 0
  const inProgressTickets = ticketStats.find(s => s.status === 'IN_PROGRESS')?._count || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support & Hulp</h1>
          <p className="text-lg text-gray-600">
            Hoe kunnen we je helpen? Kies een van de onderstaande opties.
          </p>
        </div>

        {/* Quick Stats */}
        {(openTickets > 0 || inProgressTickets > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-900">
                Je hebt {openTickets} open ticket{openTickets !== 1 ? 's' : ''}
                {inProgressTickets > 0 && ` en ${inProgressTickets} in behandeling`}
              </p>
            </div>
          </div>
        )}

        {/* Main Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* FAQ */}
          <Link
            href="/support/faq"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Veelgestelde Vragen</h2>
            <p className="text-gray-600 mb-4">
              Vind snel antwoord op je vraag in onze uitgebreide kennisbank.
            </p>
            <div className="flex items-center text-purple-600 font-medium">
              Bekijk FAQ
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Chatbot */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Chat Assistent</h2>
            <p className="text-gray-600 mb-4">
              Chat direct met onze AI assistent voor snelle antwoorden.
            </p>
            <div className="flex items-center text-rose-600 font-medium">
              Altijd beschikbaar rechtsonder
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Support Tickets */}
          <Link
            href="/support/tickets/new"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Support Ticket</h2>
            <p className="text-gray-600 mb-4">
              Maak een ticket aan voor persoonlijke hulp van ons team.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Nieuw ticket aanmaken
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Recent Tickets */}
        {recentTickets.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recente Tickets</h2>
              <Link
                href="/support/tickets"
                className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                Bekijk alle tickets
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/tickets/${ticket.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'RESOLVED' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {ticket.status === 'OPEN' ? 'Open' :
                           ticket.status === 'IN_PROGRESS' ? 'In behandeling' :
                           ticket.status === 'WAITING' ? 'Wacht op jou' :
                           ticket.status === 'RESOLVED' ? 'Opgelost' :
                           'Gesloten'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(ticket.createdAt).toLocaleDateString('nl-NL')}</span>
                        <span>{ticket._count.messages} bericht{ticket._count.messages !== 1 ? 'en' : ''}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Populaire Onderwerpen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/support/faq?category=account"
              className="p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900 mb-1">Account</h3>
              <p className="text-sm text-gray-600">Login, wachtwoord, profiel</p>
            </Link>

            <Link
              href="/support/faq?category=matching"
              className="p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">❤️</div>
              <h3 className="font-medium text-gray-900 mb-1">Matching</h3>
              <p className="text-sm text-gray-600">Matches, algoritme, voorkeuren</p>
            </Link>

            <Link
              href="/support/faq?category=messages"
              className="p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-medium text-gray-900 mb-1">Berichten</h3>
              <p className="text-sm text-gray-600">Chat, notificaties, media</p>
            </Link>

            <Link
              href="/support/faq?category=payments"
              className="p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-medium text-gray-900 mb-1">Betalingen</h3>
              <p className="text-sm text-gray-600">Abonnementen, facturen</p>
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Hulp nodig? Ons team reageert meestal binnen 24 uur op support tickets.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Of mail ons op{' '}
            <a href="mailto:support@liefdevooriedereen.nl" className="text-rose-600 hover:text-rose-700">
              support@liefdevooriedereen.nl
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
