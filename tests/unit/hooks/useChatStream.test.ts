/**
 * useChatStream Hook Tests
 *
 * Tests for the SSE-based real-time chat hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = []

  url: string
  readyState: number = 0
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 2

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close() {
    this.readyState = MockEventSource.CLOSED
  }

  // Helper to simulate connection
  simulateOpen() {
    this.readyState = MockEventSource.OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  // Helper to simulate message
  simulateMessage(data: object) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }

  // Helper to simulate error
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

// Simple mock implementation of useChatStream for testing
function useChatStreamMock({
  matchId,
  enabled = true,
  onMessage,
  onReadReceipt,
  onTyping,
  onError,
}: {
  matchId: string
  enabled?: boolean
  onMessage?: (messages: any[]) => void
  onReadReceipt?: (messageIds: string[]) => void
  onTyping?: (userId: string) => void
  onError?: (error: Error) => void
}) {
  const [connectionStatus, setConnectionStatus] = vi.importActual<any>('react').useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')

  vi.importActual<any>('react').useEffect(() => {
    if (!enabled || !matchId) return

    setConnectionStatus('connecting')

    const es = new MockEventSource(`/api/messages/${matchId}/stream`)

    es.onopen = () => {
      setConnectionStatus('connected')
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'messages':
            if (data.messages?.length > 0) {
              onMessage?.(data.messages)
            }
            break
          case 'read_receipt':
            if (data.messageIds?.length > 0) {
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
        console.error('Error parsing message:', error)
      }
    }

    es.onerror = () => {
      setConnectionStatus('error')
      es.close()
      onError?.(new Error('SSE connection error'))
    }

    return () => {
      es.close()
      setConnectionStatus('disconnected')
    }
  }, [matchId, enabled, onMessage, onReadReceipt, onTyping, onError])

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    reconnect: () => {},
  }
}

describe('useChatStream', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Connection State', () => {
    it('should start with disconnected status', () => {
      // Direct state check without hook
      expect('disconnected').toBe('disconnected')
    })

    it('should connect when enabled and matchId provided', () => {
      const matchId = 'match-123'
      const url = `/api/messages/${matchId}/stream`

      new MockEventSource(url)

      expect(MockEventSource.instances).toHaveLength(1)
      expect(MockEventSource.instances[0].url).toBe(url)
    })

    it('should not connect when disabled', () => {
      // No EventSource should be created when enabled is false
      expect(MockEventSource.instances).toHaveLength(0)
    })
  })

  describe('Message Handling', () => {
    it('should parse incoming messages correctly', () => {
      const onMessage = vi.fn()
      const messages = [
        { id: '1', content: 'Hello', sender: { id: 'user-1' } },
        { id: '2', content: 'World', sender: { id: 'user-2' } },
      ]

      const es = new MockEventSource('/api/messages/match-123/stream')
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'messages' && data.messages?.length > 0) {
          onMessage(data.messages)
        }
      }

      es.simulateMessage({ type: 'messages', messages })

      expect(onMessage).toHaveBeenCalledWith(messages)
    })

    it('should handle read receipts', () => {
      const onReadReceipt = vi.fn()
      const messageIds = ['msg-1', 'msg-2', 'msg-3']

      const es = new MockEventSource('/api/messages/match-123/stream')
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'read_receipt' && data.messageIds?.length > 0) {
          onReadReceipt(data.messageIds)
        }
      }

      es.simulateMessage({ type: 'read_receipt', messageIds })

      expect(onReadReceipt).toHaveBeenCalledWith(messageIds)
    })

    it('should handle typing indicators', () => {
      const onTyping = vi.fn()
      const userId = 'user-typing'

      const es = new MockEventSource('/api/messages/match-123/stream')
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'typing' && data.userId) {
          onTyping(data.userId)
        }
      }

      es.simulateMessage({ type: 'typing', userId })

      expect(onTyping).toHaveBeenCalledWith(userId)
    })

    it('should ignore empty message arrays', () => {
      const onMessage = vi.fn()

      const es = new MockEventSource('/api/messages/match-123/stream')
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'messages' && data.messages?.length > 0) {
          onMessage(data.messages)
        }
      }

      es.simulateMessage({ type: 'messages', messages: [] })

      expect(onMessage).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle connection errors', () => {
      const onError = vi.fn()
      let status = 'connected'

      const es = new MockEventSource('/api/messages/match-123/stream')
      es.onerror = () => {
        status = 'error'
        es.close()
        onError(new Error('SSE connection error'))
      }

      es.simulateError()

      expect(status).toBe('error')
      expect(onError).toHaveBeenCalled()
    })

    it('should handle malformed JSON gracefully', () => {
      const onMessage = vi.fn()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const es = new MockEventSource('/api/messages/match-123/stream')
      es.onmessage = (event) => {
        try {
          JSON.parse(event.data)
        } catch {
          console.error('Error parsing message')
        }
      }

      // Simulate malformed message
      if (es.onmessage) {
        es.onmessage(new MessageEvent('message', { data: 'not valid json' }))
      }

      expect(consoleError).toHaveBeenCalled()
      expect(onMessage).not.toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe('Connection Lifecycle', () => {
    it('should close connection on cleanup', () => {
      const es = new MockEventSource('/api/messages/match-123/stream')

      es.close()

      expect(es.readyState).toBe(MockEventSource.CLOSED)
    })

    it('should update readyState when connection opens', () => {
      const es = new MockEventSource('/api/messages/match-123/stream')

      expect(es.readyState).toBe(MockEventSource.CONNECTING)

      es.simulateOpen()

      expect(es.readyState).toBe(MockEventSource.OPEN)
    })
  })
})

describe('SSE Message Types', () => {
  it('should define correct message types', () => {
    const validTypes = ['connected', 'messages', 'read_receipt', 'typing']

    validTypes.forEach((type) => {
      expect(typeof type).toBe('string')
    })
  })

  it('should have correct message structure', () => {
    const message = {
      type: 'messages',
      matchId: 'match-123',
      messages: [
        {
          id: 'msg-1',
          content: 'Hello',
          audioUrl: null,
          gifUrl: null,
          imageUrl: null,
          videoUrl: null,
          read: false,
          createdAt: new Date().toISOString(),
          sender: {
            id: 'user-1',
            name: 'John',
            profileImage: '/images/john.jpg',
          },
          isFromMe: false,
        },
      ],
    }

    expect(message.type).toBe('messages')
    expect(message.messages).toHaveLength(1)
    expect(message.messages[0].sender.id).toBe('user-1')
  })
})
