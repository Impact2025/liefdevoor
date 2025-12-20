import { NextRequest, NextResponse } from 'next/server'
import { requireCSRF } from '@/lib/csrf'
import { requireAuth, successResponse, handleApiError, validationError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendMatchNotification } from '@/lib/email/notification-service'
import {
  sendMatchNotification as sendMatchPush,
  sendSuperLikeNotification,
} from '@/lib/services/push/push-notifications'
import { canSwipe, canSuperLike, getSubscriptionInfo } from '@/lib/subscription'
import type { SwipeAction, SwipeResult } from '@/lib/types'
import { trackSwipeAction, trackMatchCreation } from '@/lib/analytics-events'

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
    const { swipedId, isLike, isSuperLike = false } = body

    if (!swipedId || typeof isLike !== 'boolean') {
      return validationError('swipedId', 'Invalid swipe data')
    }

    // Check swipe limits (premium gating)
    const swipeCheck = await canSwipe(user.id)
    if (!swipeCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'swipe_limit_reached',
        message: 'Je hebt je dagelijkse swipe limiet bereikt. Upgrade naar Premium voor onbeperkt swipen!',
        remaining: 0,
        upgradeUrl: '/subscription'
      }, { status: 403 })
    }

    // Check super like limits if this is a super like
    if (isSuperLike && isLike) {
      const superLikeCheck = await canSuperLike(user.id)
      if (!superLikeCheck.allowed) {
        return NextResponse.json({
          success: false,
          error: 'superlike_limit_reached',
          message: 'Je hebt je dagelijkse Super Like limiet bereikt. Upgrade naar Gold voor onbeperkte Super Likes!',
          remaining: 0,
          upgradeUrl: '/subscription'
        }, { status: 403 })
      }
    }

    // Perform swipe operation
    const result = await performSwipe(user.id, swipedId, isLike, isSuperLike)

    // Add remaining swipes/superlikes to response
    const updatedSwipeCheck = await canSwipe(user.id)
    const updatedSuperLikeCheck = await canSuperLike(user.id)

    return successResponse({
      ...result,
      limits: {
        swipesRemaining: updatedSwipeCheck.remaining,
        superLikesRemaining: updatedSuperLikeCheck.remaining,
      }
    })
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
  isLike: boolean,
  isSuperLike: boolean = false
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
      isSuperLike: isLike && isSuperLike, // Only store superlike if it's also a like
    },
  })

  // Track swipe action in analytics
  const swipeType = !isLike ? 'pass' : (isSuperLike ? 'super_like' : 'like')
  trackSwipeAction(swiperId, swipeType, swipedId)

  // If it's a super like, create a notification for the swiped user
  if (isLike && isSuperLike) {
    const swiper = await prisma.user.findUnique({
      where: { id: swiperId },
      select: { name: true }
    })

    await prisma.notification.create({
      data: {
        userId: swipedId,
        type: 'super_like',
        title: '⭐ Super Like!',
        message: `${swiper?.name || 'Iemand'} heeft je een Super Like gegeven! Bekijk hun profiel.`,
        relatedId: swiperId,
      },
    })

    // Send push notification for super like
    sendSuperLikeNotification(
      swipedId,
      swiper?.name || 'Iemand',
      swiperId
    ).catch(err => console.error('[Push] Super like notification failed:', err))
  }

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

    // Create notifications for both users (Dutch)
    await Promise.all([
      tx.notification.create({
        data: {
          userId: swiperId,
          type: 'new_match',
          title: '💕 Nieuwe Match!',
          message: 'Je hebt een nieuwe match. Begin met chatten!',
          relatedId: newMatch.id,
        },
      }),
      tx.notification.create({
        data: {
          userId: swipedId,
          type: 'new_match',
          title: '💕 Nieuwe Match!',
          message: 'Je hebt een nieuwe match. Begin met chatten!',
          relatedId: newMatch.id,
        },
      }),
    ])

    return newMatch
  })

  if (match) {
    // Track match creation in analytics
    trackMatchCreation(swiperId, swipedId)

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

    // Send push notifications to BOTH users
    sendMatchPush(
      match.user1Id,
      match.user2.name || 'Iemand',
      match.id
    ).catch(err => console.error('[Push] Match notification failed:', err))

    sendMatchPush(
      match.user2Id,
      match.user1.name || 'Iemand',
      match.id
    ).catch(err => console.error('[Push] Match notification failed:', err))

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