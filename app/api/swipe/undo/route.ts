import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'

/**
 * POST /api/swipe/undo
 *
 * Undo the last swipe (premium feature)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has rewind feature
    const canRewind = await hasFeature(user.id, 'canRewind')
    if (!canRewind) {
      return NextResponse.json({
        error: 'Premium feature',
        message: 'Upgrade naar Premium om swipes ongedaan te maken',
        upgradeUrl: '/subscription',
      }, { status: 403 })
    }

    // Get the last swipe from the user (within the last 5 minutes for safety)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const lastSwipe = await prisma.swipe.findFirst({
      where: {
        swiperId: user.id,
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        swiped: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            city: true,
            birthDate: true,
          },
        },
      },
    })

    if (!lastSwipe) {
      return NextResponse.json({
        error: 'No recent swipe',
        message: 'Geen recente swipe gevonden om ongedaan te maken',
      }, { status: 404 })
    }

    // Check if this resulted in a match - if so, we need to remove the match too
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: lastSwipe.swipedId },
          { user1Id: lastSwipe.swipedId, user2Id: user.id },
        ],
      },
    })

    // Use transaction to undo everything atomically
    await prisma.$transaction(async (tx) => {
      // Delete the swipe
      await tx.swipe.delete({
        where: { id: lastSwipe.id },
      })

      // If there was a match, delete it and related data
      if (existingMatch) {
        // Delete messages in the match
        await tx.message.deleteMany({
          where: { matchId: existingMatch.id },
        })

        // Delete notifications related to this match
        await tx.notification.deleteMany({
          where: {
            relatedId: existingMatch.id,
            type: 'new_match',
          },
        })

        // Delete the match
        await tx.match.delete({
          where: { id: existingMatch.id },
        })
      }

      // Store in swipe history for potential audit
      await tx.swipeHistory.create({
        data: {
          swipeId: lastSwipe.id,
          swiperId: lastSwipe.swiperId,
          swipedId: lastSwipe.swipedId,
          isLike: lastSwipe.isLike,
          swipedAt: lastSwipe.createdAt,
          undoneAt: new Date(),
        },
      })
    })

    // Format the undone profile for the response
    const undoneProfile = {
      id: lastSwipe.swiped.id,
      name: lastSwipe.swiped.name,
      profileImage: lastSwipe.swiped.profileImage,
      city: lastSwipe.swiped.city,
      age: lastSwipe.swiped.birthDate
        ? Math.floor((Date.now() - new Date(lastSwipe.swiped.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
    }

    return NextResponse.json({
      success: true,
      undoneSwipe: {
        wasLike: lastSwipe.isLike,
        wasSuperLike: lastSwipe.isSuperLike,
        hadMatch: !!existingMatch,
        profile: undoneProfile,
      },
      message: existingMatch
        ? 'Swipe en match ongedaan gemaakt'
        : 'Swipe ongedaan gemaakt',
    })
  } catch (error) {
    console.error('[Undo Swipe] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/swipe/undo
 *
 * Check if undo is available
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has rewind feature
    const canRewind = await hasFeature(user.id, 'canRewind')

    // Get the last swipe
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const lastSwipe = await prisma.swipe.findFirst({
      where: {
        swiperId: user.id,
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        isLike: true,
        createdAt: true,
        swiped: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({
      canUndo: canRewind && !!lastSwipe,
      isPremium: canRewind,
      lastSwipe: lastSwipe ? {
        wasLike: lastSwipe.isLike,
        swipedAt: lastSwipe.createdAt,
        previewName: lastSwipe.swiped.name,
        previewImage: lastSwipe.swiped.profileImage,
      } : null,
    })
  } catch (error) {
    console.error('[Undo Swipe] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
