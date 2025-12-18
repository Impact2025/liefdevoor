/**
 * MessageInput Component
 *
 * Input field for sending messages
 */

'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { Button, Textarea } from '@/components/ui'
import { usePost } from '@/hooks'

export interface MessageInputProps {
  matchId: string
  onMessageSent?: (message: any) => void
  disabled?: boolean
}

export function MessageInput({ matchId, onMessageSent, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { post, isLoading } = usePost('/api/messages', {
    onSuccess: (data) => {
      setMessage('')
      onMessageSent?.(data)
      textareaRef.current?.focus()
    },
  })

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) return

    await post({
      matchId,
      content: trimmedMessage,
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Typ een bericht..."
            rows={1}
            resize="none"
            disabled={disabled || isLoading}
            maxLength={2000}
            className="min-h-[44px] max-h-32 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Druk op Enter om te versturen, Shift+Enter voor een nieuwe regel
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!message.trim() || disabled || isLoading}
          isLoading={isLoading}
          className="flex-shrink-0 h-11"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span className="sr-only">Versturen</span>
        </Button>
      </div>
    </form>
  )
}
