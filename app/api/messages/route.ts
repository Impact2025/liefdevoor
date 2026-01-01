import { NextRequest } from 'next/server'
import { requireAuth, requireCSRF, successResponse, handleApiError, validationError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendMessageNotification } from '@/lib/email/notification-service'
import { sendMessageNotification as sendMessagePush } from '@/lib/services/push/push-notifications'
import { analyzeMessageSafety, isSpammingMessages } from '@/lib/ai/safetySentinel'
import { checkLVBMessageSafety, updateLastMessageSent } from '@/lib/safety/lvbSafetyMode'
import type { Message } from '@/lib/types'

interface SendMessageRequest {
  matchId: string
  content?: string | null
  audioUrl?: string | null
  gifUrl?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  lvbConfirmed?: boolean // User confirmed after LVB safety warning
}

/**
 * Send a message in a match
 */
async function sendMessage(userId: string, data: SendMessageRequest): Promise<Message> {
  const { matchId, content, audioUrl, gifUrl, imageUrl, videoUrl } = data

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

  // Safety Sentinel: Check for spam behavior
  const isSpamming = await isSpammingMessages(userId)
  if (isSpamming) {
    throw new Error('Je stuurt te veel berichten. Wacht even.')
  }

  // LVB Safety Mode: Extra bescherming voor LVB gebruikers
  if (content) {
    const lvbSafetyResult = await checkLVBMessageSafety(userId, content)

    // Blocked by cooldown or daily limit
    if (!lvbSafetyResult.allowed) {
      throw new Error(lvbSafetyResult.warningMessage || 'Bericht kan nu niet worden verstuurd')
    }

    // Requires confirmation but user hasn't confirmed
    if (lvbSafetyResult.requiresConfirmation && !data.lvbConfirmed) {
      // Return special response for frontend to show warning modal
      const error = new Error('LVB_CONFIRMATION_REQUIRED') as Error & {
        lvbWarning: typeof lvbSafetyResult
      }
      error.lvbWarning = lvbSafetyResult
      throw error
    }
  }

  // Safety Sentinel: Analyze message content for threats/scams
  if (content) {
    const safetyAnalysis = await analyzeMessageSafety(content, userId)

    if (safetyAnalysis.isBlocked) {
      throw new Error(safetyAnalysis.details || 'Bericht kan niet worden verzonden')
    }

    // Log if there are any flags (even if not blocked)
    if (safetyAnalysis.flags.length > 0) {
      console.log(`[SafetySentinel] Message flagged for user ${userId}:`, safetyAnalysis.category)
    }
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      matchId,
      senderId: userId,
      content: content || null,
      audioUrl: audioUrl || null,
      gifUrl: gifUrl || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
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

  // Update last message timestamp for LVB cooldown tracking (non-blocking)
  updateLastMessageSent(userId).catch(err => {
    console.error('[LVB Safety] Failed to update last message timestamp:', err)
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

  // Send push notification (non-blocking)
  const pushContent = content || (gifUrl ? '🎬 GIF' : '🎤 Spraakbericht')
  sendMessagePush(
    otherUserId,
    message.sender.name || 'Iemand',
    pushContent,
    matchId
  ).catch(err => console.error('[Push] Message notification failed:', err))

  return {
    id: message.id,
    content: message.content,
    audioUrl: message.audioUrl,
    gifUrl: message.gifUrl,
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
    const { matchId, content, audioUrl, gifUrl } = body

    if (!matchId || (!content && !audioUrl && !gifUrl)) {
      return validationError('content', 'Message must have content, audio, or GIF')
    }

    const message = await sendMessage(user.id, body)

    return successResponse({ message })
  } catch (error) {
    // Handle LVB confirmation required - return structured warning for frontend
    if (error instanceof Error && error.message === 'LVB_CONFIRMATION_REQUIRED') {
      const lvbError = error as Error & { lvbWarning?: { warningType?: string; warningMessage?: string; detectionResult?: unknown } }
      return Response.json(
        {
          success: false,
          lvbConfirmationRequired: true,
          warning: {
            type: lvbError.lvbWarning?.warningType || 'generic',
            message: lvbError.lvbWarning?.warningMessage || 'Let op! Dit bericht bevat gevoelige informatie.',
            detections: lvbError.lvbWarning?.detectionResult,
          },
        },
        { status: 428 } // Precondition Required - indicates confirmation needed
      )
    }
    return handleApiError(error)
  }
}