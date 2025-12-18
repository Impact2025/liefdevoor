import { NextRequest } from 'next/server'
import { requireCSRF } from '@/lib/csrf'
import { requireAuth, successResponse, handleApiError, validationError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendMatchNotification } from '@/lib/email/notification-service'
import type { SwipeAction, SwipeResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfCheck = await requireCSRF(request)
    if (!csrfCheck.isValid) {
      return validationError('csrf', 'CSRF validation failed')
    }

    // Authentication (throws 401 if not authenticated)
    const user = await requireAuth()

    // Parse and validate request body
    const body: SwipeAction = await request.json()
    const { swipedId, isLike } = body

    if (!swipedId || typeof isLike !== 'boolean') {
      return validationError('swipedId', 'Invalid swipe data')
    }

    // Perform swipe operation
    const result = await performSwipe(user.id, swipedId, isLike)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Perform swipe operation and check for matches
 * Extracted for better testability and reusability
 */
async function performSwipe(
  swiperId: string,
  swipedId: string,
  isLike: boolean
): Promise<SwipeResult> {
  // Check if swipe already exists
  const existingSwipe = await prisma.swipe.findUnique({
    where: {
      swiperId_swipedId: {
        swiperId,
        swipedId,
      },
    },
  })

  if (existingSwipe) {
    throw new Error('Already swiped on this user')
  }

  // Create the swipe
  await prisma.swipe.create({
    data: {
      swiperId,
      swipedId,
      isLike,
    },
  })

  // Check for mutual interest and create match if it's a like
  if (!isLike) {
    return { success: true, isMatch: false }
  }

  // Use transaction for atomicity
  const match = await prisma.$transaction(async (tx) => {
    const reciprocalSwipe = await tx.swipe.findUnique({
      where: {
        swiperId_swipedId: {
          swiperId: swipedId,
          swipedId: swiperId,
        },
      },
    })

    if (!reciprocalSwipe || !reciprocalSwipe.isLike) {
      return null // No match
    }

    // Check if match already exists
    const existingMatch = await tx.match.findFirst({
      where: {
        OR: [
          { user1Id: swiperId, user2Id: swipedId },
          { user1Id: swipedId, user2Id: swiperId },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, profileImage: true, city: true } },
        user2: { select: { id: true, name: true, profileImage: true, city: true } },
      },
    })

    if (existingMatch) {
      return existingMatch
    }

    // Create new match
    const newMatch = await tx.match.create({
      data: {
        user1Id: swiperId,
        user2Id: swipedId,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            city: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            city: true,
          },
        },
      },
    })

    // Create notifications for both users
    await Promise.all([
      tx.notification.create({
        data: {
          userId: swiperId,
          type: 'new_match',
          title: 'New Match!',
          message: 'You have a new match. Start chatting!',
          relatedId: newMatch.id,
        },
      }),
      tx.notification.create({
        data: {
          userId: swipedId,
          type: 'new_match',
          title: 'New Match!',
          message: 'You have a new match. Start chatting!',
          relatedId: newMatch.id,
        },
      }),
    ])

    return newMatch
  })

  if (match) {
    // Send match notification emails to BOTH users (non-blocking)
    // Don't await - let emails send in background
    sendMatchNotification({
      userId: match.user1Id,
      matchUserId: match.user2Id,
      matchId: match.id
    }).catch(error => {
      console.error('[Match Email] Failed to send to user1:', error)
    })

    sendMatchNotification({
      userId: match.user2Id,
      matchUserId: match.user1Id,
      matchId: match.id
    }).catch(error => {
      console.error('[Match Email] Failed to send to user2:', error)
    })

    // Format match data for response
    const otherUser = match.user1Id === swiperId ? match.user2 : match.user1
    return {
      success: true,
      isMatch: true,
      match: {
        id: match.id,
        createdAt: match.createdAt,
        otherUser,
        lastMessage: null,
      },
    }
  }

  return { success: true, isMatch: false }
}