/**
 * Ticket Conversation Component
 * Display ticket messages and reply form
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Message {
  id: string
  message: string
  isStaffReply: boolean
  createdAt: Date | string
  author: {
    id: string
    name: string | null
    profileImage: string | null
    role: string
  }
}

interface TicketConversationProps {
  ticketId: string
  initialMessages: Message[]
  currentUserId: string
  status: string
}

export function TicketConversation({
  ticketId,
  initialMessages,
  currentUserId,
  status
}: TicketConversationProps) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyMessage.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticketId}/messages`, {
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

      // Add message to UI
      setMessages((prev) => [...prev, data.data.message])
      setReplyMessage('')

      // Refresh page to get updated ticket status
      router.refresh()
    } catch (error: any) {
      console.error('Error sending reply:', error)
      alert(error.message || 'Er ging iets mis bij het versturen van je bericht. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isClosed = status === 'CLOSED'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Messages */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {messages.map((message, index) => {
          const isFromCurrentUser = message.author.id === currentUserId
          const isStaff = message.isStaffReply

          return (
            <div key={message.id} className={`flex gap-4 ${isFromCurrentUser ? '' : 'flex-row-reverse'}`}>
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
              <div className={`flex-1 ${isFromCurrentUser ? 'text-left' : 'text-right'}`}>
                <div className="flex items-center gap-2 mb-1">
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
                  isFromCurrentUser
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-rose-500 text-white'
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
            <p className="text-xs text-gray-500">
              Neem contact op met support als je dit ticket wilt heropenen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReply}>
            <label htmlFor="reply" className="block text-sm font-medium text-gray-900 mb-2">
              Voeg een bericht toe
            </label>
            <textarea
              id="reply"
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Typ je bericht..."
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed mb-4"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Je ontvangt een email wanneer het support team reageert
              </p>
              <Button
                type="submit"
                variant="primary"
                disabled={!replyMessage.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Versturen...' : 'Verstuur bericht'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
