/**
 * WebSocket Client Manager
 * Handles real-time connection for chat, typing indicators, and presence
 */

type MessageHandler = (data: any) => void
type ConnectionHandler = () => void

interface WebSocketMessage {
  type: string
  payload: any
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private onConnectHandlers: Set<ConnectionHandler> = new Set()
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set()
  private isIntentionallyClosed = false
  private pendingMessages: WebSocketMessage[] = []

  constructor(url: string) {
    this.url = url
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.isIntentionallyClosed = false

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('[WS] Connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.onConnectHandlers.forEach((handler) => handler())

        // Send pending messages
        this.pendingMessages.forEach((msg) => this.send(msg.type, msg.payload))
        this.pendingMessages = []
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[WS] Failed to parse message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error)
      }

      this.ws.onclose = () => {
        console.log('[WS] Disconnected')
        this.stopHeartbeat()
        this.onDisconnectHandlers.forEach((handler) => handler())

        if (!this.isIntentionallyClosed) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('[WS] Connection failed:', error)
      this.attemptReconnect()
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true
    this.stopHeartbeat()
    this.ws?.close()
    this.ws = null
  }

  send(type: string, payload: any): void {
    const message: WebSocketMessage = { type, payload }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for when connection is restored
      this.pendingMessages.push(message)
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    this.messageHandlers.get(type)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler)
    }
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler)
    return () => this.onConnectHandlers.delete(handler)
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler)
    return () => this.onDisconnectHandlers.delete(handler)
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload))
    }

    // Also notify 'all' handlers
    const allHandlers = this.messageHandlers.get('*')
    if (allHandlers) {
      allHandlers.forEach((handler) => handler(message))
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect()
      }
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() })
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
    wsManager = new WebSocketManager(`${protocol}//${host}/api/ws`)
  }
  return wsManager
}

// Message types
export const WS_EVENTS = {
  // Chat
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Matches
  MATCH_NEW: 'match:new',
  SUPER_LIKE: 'superlike:received',

  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // System
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
} as const
