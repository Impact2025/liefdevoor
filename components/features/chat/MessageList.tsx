/**
 * MessageList Component
 *
 * Scrollable list of messages in a conversation
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { SkeletonProfile, Alert } from '@/components/ui'
import type { Message } from '@/lib/types'

export interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  error?: Error | null
  onLoadMore?: () => void
  hasMore?: boolean
}

export function MessageList({
  messages,
  isLoading,
  error,
  onLoadMore,
  hasMore,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)

    return groups
  }, {} as Record<string, Message[]>)

  // Check if we should show avatar (only on first message in group from same sender)
  const shouldShowAvatar = (message: Message, index: number, dayMessages: Message[]) => {
    if (index === 0) return true
    const previousMessage = dayMessages[index - 1]
    return previousMessage.senderId !== message.senderId
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 p-4 space-y-4">
        <SkeletonProfile />
        <SkeletonProfile />
        <SkeletonProfile />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Alert variant="error">
          Er is een fout opgetreden bij het laden van berichten.
        </Alert>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-600">
            Nog geen berichten. Stuur een bericht om de conversatie te starten!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {/* Load more button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-rose-600 hover:text-rose-700 disabled:opacity-50"
          >
            {isLoading ? 'Laden...' : 'Laad oudere berichten'}
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date} className="space-y-3">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <div className="px-4 py-1 bg-gray-200 rounded-full">
              <span className="text-xs font-medium text-gray-600">{date}</span>
            </div>
          </div>

          {/* Messages for this date */}
          {dayMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={shouldShowAvatar(message, index, dayMessages)}
            />
          ))}
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
