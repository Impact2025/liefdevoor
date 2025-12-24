/**
 * useChatStream - Real-time chat messages via Server-Sent Events
 *
 * This hook replaces polling with SSE for instant message delivery.
 * Falls back to polling if SSE is not supported.
 */

import { useEffect, useRef, useCallback, useState } from 'react'

export interface ChatMessage {
  id: string
  content: string
  audioUrl?: string | null
  gifUrl?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  read: boolean
  createdAt: Date | string
  sender: {
    id: string
    name: string | null
    profileImage: string | null
  }
  isFromMe: boolean
}

interface SSEMessage {
  type: 'connected' | 'messages' | 'read_receipt' | 'typing'
  matchId?: string
  messages?: ChatMessage[]
  messageIds?: string[]
  userId?: string
}

interface UseChatStreamOptions {
  matchId: string
  enabled?: boolean
  onMessage?: (messages: ChatMessage[]) => void
  onReadReceipt?: (messageIds: string[]) => void
  onTyping?: (userId: string) => void
  onError?: (error: Error) => void
}

interface UseChatStreamResult {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  reconnect: () => void
}

export function useChatStream({
  matchId,
  enabled = true,
  onMessage,
  onReadReceipt,
  onTyping,
  onError,
}: UseChatStreamOptions): UseChatStreamResult {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)

  const connect = useCallback(() => {
    if (!enabled || !matchId) return

    // Check SSE support
    if (typeof EventSource === 'undefined') {
      console.warn('[SSE] EventSource not supported, falling back to polling')
      setConnectionStatus('error')
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionStatus('connecting')

    try {
      const es = new EventSource(`/api/messages/${matchId}/stream`)
      eventSourceRef.current = es

      es.onopen = () => {
        console.log('[SSE] Connected to chat stream')
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
      }

      es.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data)

          switch (data.type) {
            case 'connected':
              console.log('[SSE] Chat stream ready for match:', data.matchId)
              break

            case 'messages':
              if (data.messages && data.messages.length > 0) {
                onMessage?.(data.messages)
              }
              break

            case 'read_receipt':
              if (data.messageIds && data.messageIds.length > 0) {
                onReadReceipt?.(data.messageIds)
              }
              break

            case 'typing':
              if (data.userId) {
                onTyping?.(data.userId)
              }
              break
          }
        } catch (error) {
          console.error('[SSE] Error parsing message:', error)
        }
      }

      es.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
        setConnectionStatus('error')

        // Close the errored connection
        es.close()

        // Exponential backoff for reconnection
        const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        reconnectAttempts.current++

        console.log(`[SSE] Reconnecting in ${backoffTime}ms (attempt ${reconnectAttempts.current})`)

        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, backoffTime)

        onError?.(new Error('SSE connection error'))
      }
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error)
      setConnectionStatus('error')
      onError?.(error as Error)
    }
  }, [matchId, enabled, onMessage, onReadReceipt, onTyping, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setConnectionStatus('disconnected')
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttempts.current = 0
    connect()
  }, [disconnect, connect])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled && matchId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [matchId, enabled, connect, disconnect])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, close connection to save resources
        disconnect()
      } else {
        // Page is visible again, reconnect
        if (enabled && matchId) {
          connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, matchId, connect, disconnect])

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    reconnect,
  }
}

export default useChatStream
