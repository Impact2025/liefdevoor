import { NextRequest } from 'next/server'
import { requireAuth, requireCSRF, successResponse, handleApiError, validationError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendMessageNotification } from '@/lib/email/notification-service'
import type { Message } from '@/lib/types'

interface SendMessageRequest {
  matchId: string
  content?: string | null
  audioUrl?: string | null
}

/**
 * Send a message in a match
 */
async function sendMessage(userId: string, data: SendMessageRequest): Promise<Message> {
  const { matchId, content, audioUrl } = data

  // Verify the user is part of this match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { user1Id: true, user2Id: true },
  })

  if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
    throw new Error('Match not found')
  }

  // Check if either user has blocked the other
  const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id
  const blockExists = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId }
      ]
    }
  })

  if (blockExists) {
    throw new Error('Cannot send messages to this user')
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      matchId,
      senderId: userId,
      content: content || null,
      audioUrl: audioUrl || null,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
  })

  // Send email notification to the recipient (non-blocking)
  if (content) {
    sendMessageNotification({
      userId: otherUserId,
      senderId: userId,
      messageId: message.id,
      messageContent: content,
      matchId
    }).catch(error => {
      console.error('[Message Email] Failed to send notification:', error)
    })
  }

  // Create notification for the other user (Dutch)
  await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: 'new_message',
      title: '💬 Nieuw Bericht',
      message: `Je hebt een nieuw bericht van ${message.sender.name}`,
      relatedId: message.id,
    },
  })

  return {
    id: message.id,
    content: message.content,
    audioUrl: message.audioUrl,
    read: message.read,
    createdAt: message.createdAt,
    senderId: message.senderId,
    sender: {
      id: message.sender.id,
      name: message.sender.name,
      profileImage: message.sender.profileImage,
    },
    isFromMe: true,
  }
}

/**
 * POST /api/messages
 *
 * Send a new message in a match
 */
export async function POST(request: NextRequest) {
  try {
    await requireCSRF(request)
    const user = await requireAuth()

    const body: SendMessageRequest = await request.json()
    const { matchId, content, audioUrl } = body

    if (!matchId || (!content && !audioUrl)) {
      return validationError('content', 'Message must have content or audio')
    }

    const message = await sendMessage(user.id, body)

    return successResponse({ message })
  } catch (error) {
    return handleApiError(error)
  }
}