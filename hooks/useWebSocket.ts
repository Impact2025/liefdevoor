/**
 * WebSocket Hook for Real-time Features
 * Provides typing indicators, presence, and instant messaging
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { getWebSocketManager, WS_EVENTS } from '@/lib/websocket'

interface UseWebSocketOptions {
  onMessage?: (message: any) => void
  onTyping?: (data: { matchId: string; userId: string; isTyping: boolean }) => void
  onPresence?: (data: { userId: string; isOnline: boolean }) => void
  onNewMatch?: (match: any) => void
  autoConnect?: boolean
}

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (matchId: string, content: string, audioUrl?: string) => void
  startTyping: (matchId: string) => void
  stopTyping: (matchId: string) => void
  markAsRead: (matchId: string, messageIds: string[]) => void
  joinChat: (matchId: string) => void
  leaveChat: (matchId: string) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { onMessage, onTyping, onPresence, onNewMatch, autoConnect = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentChatRef = useRef<string | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    const ws = getWebSocketManager()

    // Connect
    ws.connect()

    // Connection status
    const unsubConnect = ws.onConnect(() => setIsConnected(true))
    const unsubDisconnect = ws.onDisconnect(() => setIsConnected(false))

    // Message handlers
    const unsubMessage = ws.on(WS_EVENTS.MESSAGE_NEW, (data) => {
      onMessage?.(data)
    })

    const unsubTypingStart = ws.on(WS_EVENTS.TYPING_START, (data) => {
      onTyping?.({ ...data, isTyping: true })
    })

    const unsubTypingStop = ws.on(WS_EVENTS.TYPING_STOP, (data) => {
      onTyping?.({ ...data, isTyping: false })
    })

    const unsubPresence = ws.on(WS_EVENTS.USER_ONLINE, (data) => {
      onPresence?.({ ...data, isOnline: true })
    })

    const unsubOffline = ws.on(WS_EVENTS.USER_OFFLINE, (data) => {
      onPresence?.({ ...data, isOnline: false })
    })

    const unsubMatch = ws.on(WS_EVENTS.MATCH_NEW, (data) => {
      onNewMatch?.(data)
    })

    return () => {
      unsubConnect()
      unsubDisconnect()
      unsubMessage()
      unsubTypingStart()
      unsubTypingStop()
      unsubPresence()
      unsubOffline()
      unsubMatch()

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [autoConnect, onMessage, onTyping, onPresence, onNewMatch])

  const sendMessage = useCallback((matchId: string, content: string, audioUrl?: string) => {
    const ws = getWebSocketManager()
    ws.send(WS_EVENTS.MESSAGE_NEW, { matchId, content, audioUrl })
  }, [])

  const startTyping = useCallback((matchId: string) => {
    const ws = getWebSocketManager()
    ws.send(WS_EVENTS.TYPING_START, { matchId })

    // Auto-stop typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      ws.send(WS_EVENTS.TYPING_STOP, { matchId })
    }, 3000)
  }, [])

  const stopTyping = useCallback((matchId: string) => {
    const ws = getWebSocketManager()
    ws.send(WS_EVENTS.TYPING_STOP, { matchId })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [])

  const markAsRead = useCallback((matchId: string, messageIds: string[]) => {
    const ws = getWebSocketManager()
    ws.send(WS_EVENTS.MESSAGE_READ, { matchId, messageIds })
  }, [])

  const joinChat = useCallback((matchId: string) => {
    currentChatRef.current = matchId
    const ws = getWebSocketManager()
    ws.send('chat:join', { matchId })
  }, [])

  const leaveChat = useCallback((matchId: string) => {
    if (currentChatRef.current === matchId) {
      currentChatRef.current = null
    }
    const ws = getWebSocketManager()
    ws.send('chat:leave', { matchId })
  }, [])

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    joinChat,
    leaveChat,
  }
}

/**
 * Hook specifically for chat typing indicators
 */
export function useTypingIndicator(matchId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const { startTyping, stopTyping } = useWebSocket({
    onTyping: (data) => {
      if (data.matchId !== matchId) return

      if (data.isTyping) {
        setTypingUsers((prev) => new Set(prev).add(data.userId))

        // Auto-clear after 4 seconds
        const existingTimeout = timeoutsRef.current.get(data.userId)
        if (existingTimeout) clearTimeout(existingTimeout)

        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev)
            next.delete(data.userId)
            return next
          })
        }, 4000)

        timeoutsRef.current.set(data.userId, timeout)
      } else {
        setTypingUsers((prev) => {
          const next = new Set(prev)
          next.delete(data.userId)
          return next
        })
      }
    },
  })

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  const handleTyping = useCallback(() => {
    startTyping(matchId)
  }, [matchId, startTyping])

  const handleStopTyping = useCallback(() => {
    stopTyping(matchId)
  }, [matchId, stopTyping])

  return {
    typingUsers: Array.from(typingUsers),
    isTyping: typingUsers.size > 0,
    handleTyping,
    handleStopTyping,
  }
}
