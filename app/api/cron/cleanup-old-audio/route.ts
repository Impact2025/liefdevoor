/**
 * Audio Cleanup Cron Job
 *
 * Vercel Cron endpoint - runs daily at 3:00 AM
 * Deletes voice messages older than 30 days to save storage costs
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-old-audio",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 300 // 5 minutes for long-running cron

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized cleanup-old-audio attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Cron] Starting cleanup-old-audio job...')

  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find all voice messages older than 30 days
    const oldMessages = await prisma.message.findMany({
      where: {
        audioUrl: {
          not: null,
        },
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
        audioUrl: true,
        createdAt: true,
      },
    })

    console.log(`[Cron] Found ${oldMessages.length} old voice messages to delete`)

    // Delete the audio URLs from messages (sets audioUrl to null)
    // Note: The actual files on UploadThing will need manual cleanup
    // or you can implement UploadThing API deletion here
    const deleteResult = await prisma.message.updateMany({
      where: {
        id: {
          in: oldMessages.map(m => m.id),
        },
      },
      data: {
        audioUrl: null,
      },
    })

    // Log the audio URLs for manual cleanup if needed
    if (oldMessages.length > 0) {
      console.log('[Cron] Audio URLs to cleanup from UploadThing:')
      oldMessages.forEach(msg => {
        console.log(`  - ${msg.audioUrl} (Created: ${msg.createdAt})`)
      })
    }

    console.log(`[Cron] Cleanup completed. Cleared ${deleteResult.count} voice messages.`)

    return NextResponse.json({
      success: true,
      message: 'Old voice messages cleaned up',
      deletedCount: deleteResult.count,
      oldestDate: oldMessages.length > 0 ? oldMessages[0].createdAt : null,
    })
  } catch (error) {
    console.error('[Cron] Audio cleanup failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
