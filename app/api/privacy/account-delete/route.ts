/**
 * Account Deletion API
 * AVG Artikel 17 - Recht om vergeten te worden
 *
 * Handles account deletion requests with 30-day grace period
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST - Request account deletion
 * Creates a deletion request scheduled for 30 days from now
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Parse optional reason from request body
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || null

    // Check if there's already a pending deletion request
    const existingRequest = await prisma.accountDeletionRequest.findUnique({
      where: { userId },
    })

    if (existingRequest && !existingRequest.cancelled) {
      return NextResponse.json(
        {
          error: 'Er is al een account verwijdering gepland',
          scheduledFor: existingRequest.scheduledFor,
          requestId: existingRequest.id,
        },
        { status: 400 }
      )
    }

    // Calculate deletion date (30 days from now)
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + 30)

    // Create or update deletion request
    const deletionRequest = await prisma.accountDeletionRequest.upsert({
      where: { userId },
      create: {
        userId,
        reason,
        scheduledFor,
        cancelled: false,
      },
      update: {
        reason,
        scheduledFor,
        cancelled: false,
        cancelledAt: null,
        createdAt: new Date(), // Reset creation date for new request
      },
    })

    // In production: Send confirmation email
    console.log(`[Account Deletion] Scheduled for user ${userId} on ${scheduledFor}`)

    // TODO: Send email notification
    // await sendAccountDeletionEmail(session.user.email, scheduledFor)

    return NextResponse.json({
      success: true,
      requestId: deletionRequest.id,
      scheduledFor: deletionRequest.scheduledFor,
      message: `Uw account wordt verwijderd op ${scheduledFor.toLocaleDateString('nl-NL')}. U heeft tot dan de tijd om dit te annuleren.`,
    })
  } catch (error) {
    console.error('[Account Deletion API] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET - Check deletion status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { userId: session.user.id },
    })

    if (!deletionRequest) {
      return NextResponse.json({
        hasPendingDeletion: false,
      })
    }

    return NextResponse.json({
      hasPendingDeletion: !deletionRequest.cancelled,
      scheduledFor: deletionRequest.scheduledFor,
      createdAt: deletionRequest.createdAt,
      cancelled: deletionRequest.cancelled,
      cancelledAt: deletionRequest.cancelledAt,
      reason: deletionRequest.reason,
    })
  } catch (error) {
    console.error('[Account Deletion API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE - Cancel account deletion request
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { userId: session.user.id },
    })

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'Geen actieve verwijderingsaanvraag gevonden' },
        { status: 404 }
      )
    }

    if (deletionRequest.cancelled) {
      return NextResponse.json(
        { error: 'Deze verwijderingsaanvraag is al geannuleerd' },
        { status: 400 }
      )
    }

    // Cancel the deletion request
    await prisma.accountDeletionRequest.update({
      where: { userId: session.user.id },
      data: {
        cancelled: true,
        cancelledAt: new Date(),
      },
    })

    console.log(`[Account Deletion] Cancelled for user ${session.user.id}`)

    // TODO: Send cancellation confirmation email
    // await sendDeletionCancelledEmail(session.user.email)

    return NextResponse.json({
      success: true,
      message: 'Account verwijdering geannuleerd. Uw account blijft actief.',
    })
  } catch (error) {
    console.error('[Account Deletion API] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH - Process scheduled deletions (cron job endpoint)
 * Should be called by a scheduled task (e.g., daily cron job)
 *
 * In production:
 * - Add authentication for cron jobs (API key, Vercel Cron Secret, etc.)
 * - Run as scheduled task (e.g., Vercel Cron, AWS Lambda)
 */
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Verify cron job authentication
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Find all deletion requests that are due
    const now = new Date()
    const dueRequests = await prisma.accountDeletionRequest.findMany({
      where: {
        scheduledFor: { lte: now },
        cancelled: false,
        processedAt: null,
      },
    })

    console.log(`[Account Deletion] Processing ${dueRequests.length} due deletions`)

    const results = []

    for (const request of dueRequests) {
      try {
        // Perform actual account deletion
        await deleteUserAccount(request.userId)

        // Mark as processed
        await prisma.accountDeletionRequest.update({
          where: { id: request.id },
          data: { processedAt: new Date() },
        })

        results.push({
          userId: request.userId,
          status: 'deleted',
        })

        console.log(`[Account Deletion] Deleted user ${request.userId}`)
      } catch (error) {
        console.error(`[Account Deletion] Failed to delete user ${request.userId}:`, error)
        results.push({
          userId: request.userId,
          status: 'failed',
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[Account Deletion API] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Permanently delete user account and all associated data
 * AVG Artikel 17 - Right to erasure
 */
async function deleteUserAccount(userId: string) {
  // Delete all user-related data in correct order (respecting foreign keys)

  // 1. Delete messages (has foreign key to matches)
  await prisma.message.deleteMany({ where: { senderId: userId } })

  // 2. Delete matches (both directions)
  await prisma.match.deleteMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  })

  // 3. Delete swipes
  await prisma.swipe.deleteMany({
    where: {
      OR: [{ swiperId: userId }, { swipedId: userId }],
    },
  })

  // 4. Delete photos
  await prisma.photo.deleteMany({ where: { userId } })

  // 5. Delete profile views
  await prisma.profileView.deleteMany({
    where: {
      OR: [{ viewerId: userId }, { viewedId: userId }],
    },
  })

  // 6. Delete super messages
  await prisma.superMessage.deleteMany({
    where: {
      OR: [{ senderId: userId }, { targetId: userId }],
    },
  })

  // 7. Delete subscriptions
  await prisma.subscription.deleteMany({ where: { userId } })

  // 8. Delete notifications
  await prisma.notification.deleteMany({ where: { userId } })

  // 9. Delete reports
  await prisma.report.deleteMany({
    where: {
      OR: [{ reporterId: userId }, { reportedId: userId }],
    },
  })

  // 10. Delete blocks
  await prisma.block.deleteMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
  })

  // 11. Delete push subscriptions
  await prisma.pushSubscription.deleteMany({ where: { userId } })

  // 12. Delete profile boosts
  await prisma.profileBoost.deleteMany({ where: { userId } })

  // 13. Delete credit purchases
  await prisma.creditPurchase.deleteMany({ where: { userId } })

  // 14. Delete spending limit
  await prisma.spendingLimit.deleteMany({ where: { userId } })

  // 15. Delete match scores
  await prisma.matchScore.deleteMany({
    where: {
      OR: [{ userId }, { targetUserId: userId }],
    },
  })

  // 16. Delete user embedding
  await prisma.userEmbedding.deleteMany({ where: { userId } })

  // 17. Delete accounts (OAuth)
  await prisma.account.deleteMany({ where: { userId } })

  // 18. Delete sessions
  await prisma.session.deleteMany({ where: { userId } })

  // 19. Delete data export requests
  await prisma.dataExportRequest.deleteMany({ where: { userId } })

  // 20. Finally, delete the user
  await prisma.user.delete({ where: { id: userId } })

  console.log(`[Account Deletion] All data deleted for user ${userId}`)
}
