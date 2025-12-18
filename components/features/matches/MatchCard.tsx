/**
 * MatchCard Component
 *
 * Individual match card showing user and last message
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge } from '@/components/ui'
import type { Match } from '@/lib/types'

export interface MatchCardProps {
  match: Match
  onClick?: (matchId: string) => void
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick(match.id)
    } else {
      router.push(`/chat/${match.id}`)
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInMs = now.getTime() - messageDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMinutes < 1) return 'Nu'
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`
    if (diffInHours < 24) return `${diffInHours}u geleden`
    if (diffInDays < 7) return `${diffInDays}d geleden`

    return messageDate.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg text-left"
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar
          src={match.otherUser.profileImage}
          alt={match.otherUser.name ?? "User"}
          size="lg"
          status="online"
        />
        {match.unreadCount && match.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="error" size="sm">
              {match.unreadCount}
            </Badge>
          </div>
        )}
      </div>

      {/* User info & message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {match.otherUser.name}
          </h3>
          {match.lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTimestamp(match.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {match.otherUser.city && (
          <p className="text-sm text-gray-500 mb-1">{match.otherUser.city}</p>
        )}

        {match.lastMessage ? (
          <p
            className={`text-sm truncate ${
              match.unreadCount && match.unreadCount > 0
                ? 'text-gray-900 font-medium'
                : 'text-gray-600'
            }`}
          >
            {match.lastMessage.isFromMe && 'Jij: '}
            {match.lastMessage.content || '🎙️ Voice message'}
          </p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Stuur een bericht om te beginnen
          </p>
        )}
      </div>

      {/* Chevron */}
      <svg
        className="w-5 h-5 text-gray-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
