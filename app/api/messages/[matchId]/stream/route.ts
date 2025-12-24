/**
 * Server-Sent Events (SSE) endpoint for real-time chat messages
 *
 * This replaces polling with a persistent connection that pushes
 * new messages to the client immediately.
 *
 * Benefits over polling:
 * - Real-time delivery (no 3-second delay)
 * - Lower server load (no repeated requests)
 * - Better battery life on mobile devices
 * - Reduced bandwidth usage
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Keep track of last message ID sent to each client
const clientLastMessageId = new Map<string, string>()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { matchId } = params

  // Verify user access to this match
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { user1Id: true, user2Id: true },
  })

  if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) {
    return new Response('Match not found', { status: 404 })
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  const clientId = `${user.id}:${matchId}:${Date.now()}`

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', matchId })}\n\n`)
      )

      // Poll for new messages every 500ms (much more efficient than client polling)
      // In production, you'd use Redis Pub/Sub or a proper message queue
      const interval = setInterval(async () => {
        try {
          const lastId = clientLastMessageId.get(clientId)

          // Build query for new messages
          const whereClause: any = { matchId }
          if (lastId) {
            // Get messages created after the last one we sent
            const lastMessage = await prisma.message.findUnique({
              where: { id: lastId },
              select: { createdAt: true },
            })
            if (lastMessage) {
              whereClause.createdAt = { gt: lastMessage.createdAt }
            }
          }

          const newMessages = await prisma.message.findMany({
            where: whereClause,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 10, // Batch limit
          })

          if (newMessages.length > 0) {
            // Update last message ID
            clientLastMessageId.set(clientId, newMessages[newMessages.length - 1].id)

            // Format and send messages
            const formattedMessages = newMessages.map((msg) => ({
              id: msg.id,
              content: msg.content,
              audioUrl: msg.audioUrl,
              gifUrl: msg.gifUrl,
              imageUrl: msg.imageUrl,
              videoUrl: msg.videoUrl,
              read: msg.read,
              createdAt: msg.createdAt,
              sender: msg.sender,
              isFromMe: msg.senderId === user.id,
            }))

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'messages', messages: formattedMessages })}\n\n`
              )
            )

            // Mark messages from other user as read
            const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id
            await prisma.message.updateMany({
              where: {
                matchId,
                senderId: otherUserId,
                read: false,
                id: { in: newMessages.map((m) => m.id) },
              },
              data: { read: true },
            })

            // Send read receipt notification
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'read_receipt',
                  messageIds: newMessages.filter((m) => m.senderId === otherUserId).map((m) => m.id),
                })}\n\n`
              )
            )
          }

          // Send heartbeat every 30 seconds to keep connection alive
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch (error) {
          console.error('[SSE] Error fetching messages:', error)
          // Don't close the stream on error, just log it
        }
      }, 500) // Check every 500ms

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        clientLastMessageId.delete(clientId)
      })
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
