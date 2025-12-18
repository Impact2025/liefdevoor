/**
 * MatchList Component
 *
 * List of all user matches
 */

'use client'

import React, { useState } from 'react'
import { useMatches } from '@/hooks'
import { MatchCard } from './MatchCard'
import { SkeletonList, Alert, Input } from '@/components/ui'
import { useDebounce } from '@/hooks'

export interface MatchListProps {
  onMatchClick?: (matchId: string) => void
}

export function MatchList({ onMatchClick }: MatchListProps) {
  const { matches, isLoading, error, refetch } = useMatches()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const filteredMatches = matches.filter((match) =>
    (match.otherUser.name ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-4">
        <SkeletonList count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="error">
          Er is een fout opgetreden bij het laden van je matches.
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Probeer opnieuw
          </button>
        </Alert>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nog geen matches
        </h3>
        <p className="text-gray-600 mb-4">
          Begin met swipen om nieuwe mensen te ontmoeten!
        </p>
        <a
          href="/discover"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Naar Discover
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      {matches.length > 3 && (
        <div className="p-4 border-b border-gray-200">
          <Input
            type="text"
            placeholder="Zoek in je matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            startIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>
      )}

      {/* Matches list */}
      <div className="flex-1 overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Geen matches gevonden voor "{searchTerm}"
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={onMatchClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
