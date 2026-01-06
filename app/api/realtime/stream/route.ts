import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subscribe, channels, setUserOnline, setUserOffline } from '@/lib/redis'

/**
 * GET /api/realtime/stream
 *
 * Server-Sent Events endpoint for real-time notifications.
 * Uses Redis Pub/Sub for cross-instance communication.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const userId = user.id

  // Set up SSE stream
  const encoder = new TextEncoder()
  const unsubscribes: Array<() => void> = []
  let isConnected = true

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`)
      )

      // Mark user as online
      await setUserOnline(userId)

      // Subscribe to user's notification channel
      const unsubNotify = await subscribe(channels.userNotification(userId), (message) => {
        if (!isConnected) return
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          )
        } catch (error) {
          console.error('[SSE] Failed to send notification:', error)
        }
      })
      unsubscribes.push(unsubNotify)

      // Subscribe to presence updates
      const unsubPresence = await subscribe(channels.presence(), (message) => {
        if (!isConnected) return
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'presence', ...message })}\n\n`)
          )
        } catch (error) {
          console.error('[SSE] Failed to send presence:', error)
        }
      })
      unsubscribes.push(unsubPresence)

      // Subscribe to new matches
      const unsubMatches = await subscribe(channels.matches(), (message) => {
        if (!isConnected) return
        // Only send if this match involves the current user
        if (message.user1Id === userId || message.user2Id === userId) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'match', ...message })}\n\n`)
            )
          } catch (error) {
            console.error('[SSE] Failed to send match:', error)
          }
        }
      })
      unsubscribes.push(unsubMatches)

      // Keep-alive ping every 30 seconds
      const pingInterval = setInterval(() => {
        if (!isConnected) {
          clearInterval(pingInterval)
          return
        }
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`)
          )
        } catch (error) {
          clearInterval(pingInterval)
          isConnected = false
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', async () => {
        isConnected = false
        clearInterval(pingInterval)
        unsubscribes.forEach((unsub) => unsub())
        await setUserOffline(userId)
        controller.close()
      })
    },

    cancel() {
      isConnected = false
      unsubscribes.forEach((unsub) => unsub())
      setUserOffline(userId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
