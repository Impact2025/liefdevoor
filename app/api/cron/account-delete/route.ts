/**
 * Cron Job: Verwerk geplande account-verwijderingen
 *
 * BUG-FIX: de privacy-pagina plant een account-verwijdering (30 dagen bedenktijd)
 * via POST /api/privacy/account-delete, maar de daadwerkelijke verwijdering gebeurde
 * pas via de PATCH-handler van diezelfde route — waarvoor NOOIT een cron in vercel.json
 * stond. Gevolg: accounts verdwenen nooit -> "de verwijder-knop werkt niet".
 *
 * Deze cron roept de verwerk-logica elke dag aan.
 *
 * Schedule: Elke dag om 03:30 (Europe/Amsterdam)
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Permanently delete a user account and all associated data (AVG Artikel 17).
 * Gedeeld met de account-delete route; hier gecentreerd om duplicatie te voorkomen.
 */
async function deleteUserAccount(userId: string) {
  // Volgorde respecteert foreign keys
  await prisma.message.deleteMany({ where: { senderId: userId } })
  await prisma.match.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } })
  await prisma.swipe.deleteMany({ where: { OR: [{ swiperId: userId }, { swipedId: userId }] } })
  await prisma.photo.deleteMany({ where: { userId } })
  await prisma.profileView.deleteMany({ where: { OR: [{ viewerId: userId }, { viewedId: userId }] } })
  await prisma.superMessage.deleteMany({ where: { OR: [{ senderId: userId }, { targetId: userId }] } })
  await prisma.subscription.deleteMany({ where: { userId } })
  await prisma.notification.deleteMany({ where: { userId } })
  await prisma.report.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedId: userId }] } })
  await prisma.block.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } })
  await prisma.pushSubscription.deleteMany({ where: { userId } })
  await prisma.profileBoost.deleteMany({ where: { userId } })
  await prisma.creditPurchase.deleteMany({ where: { userId } })
  await prisma.spendingLimit.deleteMany({ where: { userId } })
  await prisma.matchScore.deleteMany({ where: { OR: [{ userId }, { targetUserId: userId }] } })
  await prisma.userEmbedding.deleteMany({ where: { userId } })
  await prisma.account.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.dataExportRequest.deleteMany({ where: { userId } })
  await prisma.user.delete({ where: { id: userId } })
  console.log(`[Account Deletion Cron] All data deleted for user ${userId}`)
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    console.log('[Account Deletion Cron] Unauthorized request - invalid CRON_SECRET')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Account Deletion Cron] Starting scheduled deletions...')

  try {
    const now = new Date()
    const dueRequests = await prisma.accountDeletionRequest.findMany({
      where: {
        scheduledFor: { lte: now },
        cancelled: false,
        processedAt: null,
      },
    })

    console.log(`[Account Deletion Cron] Processing ${dueRequests.length} due deletions`)

    const results: Array<{ userId: string; status: string; error?: string }> = []

    for (const req of dueRequests) {
      try {
        await deleteUserAccount(req.userId)
        await prisma.accountDeletionRequest.update({
          where: { id: req.id },
          data: { processedAt: new Date() },
        })
        results.push({ userId: req.userId, status: 'deleted' })
        console.log(`[Account Deletion Cron] Deleted user ${req.userId}`)
      } catch (error) {
        console.error(`[Account Deletion Cron] Failed to delete user ${req.userId}:`, error)
        results.push({ userId: req.userId, status: 'failed', error: String(error) })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Account Deletion Cron] Job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process deletions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
