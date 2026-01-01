/**
 * MessageInput Component
 *
 * Input field for sending messages with LVB safety integration
 */

'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { Button, Textarea } from '@/components/ui'
import { SafetyWarningModal, type WarningType } from '@/components/safety/SafetyWarningModal'
import { useAccessibility } from '@/contexts/AccessibilityContext'

export interface MessageInputProps {
  matchId: string
  onMessageSent?: (message: any) => void
  disabled?: boolean
}

interface LVBWarning {
  type: WarningType
  message: string
  detections?: unknown
}

export function MessageInput({ matchId, onMessageSent, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // LVB Safety modal state
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [lvbWarning, setLvbWarning] = useState<LVBWarning | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  const { settings } = useAccessibility()

  const sendMessage = async (content: string, lvbConfirmed: boolean = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          content,
          lvbConfirmed,
        }),
      })

      const data = await response.json()

      // Handle LVB confirmation required (428 status)
      if (response.status === 428 && data.lvbConfirmationRequired) {
        setPendingMessage(content)
        setLvbWarning({
          type: data.warning?.type || 'generic',
          message: data.warning?.message || 'Let op! Dit bericht bevat gevoelige informatie.',
          detections: data.warning?.detections,
        })
        setShowWarningModal(true)
        setIsLoading(false)
        return
      }

      // Handle other errors
      if (!response.ok || !data.success) {
        const errorMessage = data.error?.message || `Request failed with status ${response.status}`
        throw new Error(errorMessage)
      }

      // Success!
      setMessage('')
      setPendingMessage(null)
      setLvbWarning(null)
      onMessageSent?.(data.message || data.data?.message)
      textareaRef.current?.focus()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis'
      setError(errorMessage)
      console.error('[MessageInput] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) return

    await sendMessage(trimmedMessage)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Handle confirmation from SafetyWarningModal
  const handleWarningConfirm = async () => {
    setShowWarningModal(false)
    if (pendingMessage) {
      await sendMessage(pendingMessage, true)
    }
  }

  // Handle cancel from SafetyWarningModal
  const handleWarningCancel = () => {
    setShowWarningModal(false)
    setPendingMessage(null)
    setLvbWarning(null)
    textareaRef.current?.focus()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        {/* Error message */}
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

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
              {settings.lvbMode
                ? 'Druk op de knop om te versturen'
                : 'Druk op Enter om te versturen, Shift+Enter voor een nieuwe regel'
              }
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!message.trim() || disabled || isLoading}
            isLoading={isLoading}
            className={`flex-shrink-0 ${settings.lvbMode ? 'h-14 px-6' : 'h-11'}`}
          >
            <svg className={`${settings.lvbMode ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            {settings.lvbMode && <span className="ml-2">Versturen</span>}
            <span className={settings.lvbMode ? 'sr-only' : 'sr-only'}>Versturen</span>
          </Button>
        </div>
      </form>

      {/* LVB Safety Warning Modal */}
      <SafetyWarningModal
        isOpen={showWarningModal}
        onClose={handleWarningCancel}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        type={lvbWarning?.type || 'generic'}
        detectedContent={
          lvbWarning?.detections
            ? (lvbWarning.detections as { detections?: { value?: string }[] })?.detections?.[0]?.value
            : undefined
        }
      />
    </>
  )
}
