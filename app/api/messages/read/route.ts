import { NextRequest } from 'next/server'
import { requireAuth, requireCSRF, successResponse, handleApiError, validationError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { canUseFeature } from '@/lib/subscription'

interface MarkReadRequest {
  matchId: string
  messageIds?: string[] // Optional: specific messages, otherwise all unread
}

/**
 * PATCH /api/messages/read
 *
 * Mark messages as read. Returns read status for premium users (read receipts feature).
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireCSRF(request)
    const user = await requireAuth()

    const body: MarkReadRequest = await request.json()
    const { matchId, messageIds } = body

    if (!matchId) {
      return validationError('matchId', 'Match ID is required')
    }

    // Verify the user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { user1Id: true, user2Id: true },
    })

    if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) {
      return validationError('matchId', 'Match not found')
    }

    // Get the other user ID
    const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id

    // Build the where clause
    const whereClause: any = {
      matchId,
      senderId: otherUserId, // Only mark messages FROM the other user
      read: false,
    }

    if (messageIds && messageIds.length > 0) {
      whereClause.id = { in: messageIds }
    }

    // Mark messages as read
    const result = await prisma.message.updateMany({
      where: whereClause,
      data: { read: true },
    })

    // Check if the sender has read receipts feature
    const senderHasReadReceipts = await canUseFeature(otherUserId, 'readReceipts')

    return successResponse({
      markedAsRead: result.count,
      readReceiptsEnabled: senderHasReadReceipts,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/messages/read
 *
 * Get read status for messages in a match (for read receipts feature).
 * Only available for premium users.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check if user has read receipts feature
    const hasReadReceipts = await canUseFeature(user.id, 'readReceipts')
    if (!hasReadReceipts) {
      return successResponse({
        readReceipts: [],
        message: 'Upgrade naar Premium om te zien wanneer je berichten gelezen zijn.',
        upgradeUrl: '/subscription',
      })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return validationError('matchId', 'Match ID is required')
    }

    // Verify the user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { user1Id: true, user2Id: true },
    })

    if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) {
      return validationError('matchId', 'Match not found')
    }

    // Get the read status of messages sent by this user
    const sentMessages = await prisma.message.findMany({
      where: {
        matchId,
        senderId: user.id,
      },
      select: {
        id: true,
        read: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 messages
    })

    // Find the last read message
    const lastReadMessage = sentMessages.find(m => m.read)

    return successResponse({
      readReceipts: sentMessages.map(m => ({
        messageId: m.id,
        read: m.read,
      })),
      lastReadMessageId: lastReadMessage?.id || null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
