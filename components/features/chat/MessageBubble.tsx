/**
 * MessageBubble Component
 *
 * Individual message bubble in chat
 */

'use client'

import React from 'react'
import { Avatar } from '@/components/ui'
import type { Message } from '@/lib/types'

export interface MessageBubbleProps {
  message: Message
  showAvatar?: boolean
}

export function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`flex gap-2 ${message.isFromMe ? 'flex-row-reverse' : 'flex-row'} items-end`}
    >
      {/* Avatar */}
      {showAvatar && !message.isFromMe && (
        <Avatar
          src={message.sender?.profileImage}
          alt={message.sender?.name ?? "User"}
          size="sm"
        />
      )}
      {showAvatar && message.isFromMe && <div className="w-8" />}

      {/* Message content */}
      <div
        className={`max-w-[70%] ${message.isFromMe ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <div
          className={`
            px-4 py-2 rounded-2xl
            ${
              message.isFromMe
                ? 'bg-rose-600 text-white rounded-br-sm'
                : 'bg-gray-200 text-gray-900 rounded-bl-sm'
            }
          `}
        >
          {message.content ? (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : message.audioUrl ? (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Spraakbericht</span>
            </div>
          ) : null}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-1">
          {formatTime(message.createdAt)}
          {message.isFromMe && (
            <span className="ml-1">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </span>
      </div>

      {!showAvatar && <div className="w-8" />}
    </div>
  )
}
