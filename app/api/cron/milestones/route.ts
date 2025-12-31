/**
 * Cron Job: Activity Milestones
 *
 * Runs daily at 12:00 to check for:
 * - 1 week active milestones
 * - 1 month active milestones
 *
 * Schedule: 0 12 * * * (12 PM daily)
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkActivityMilestones } from '@/lib/email/milestone-triggers'

export const dynamic = 'force-dynamic'
export const maxDuration = 120 // 2 minutes

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      const vercelCron = request.headers.get('x-vercel-cron')
      if (!vercelCron && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[Cron] Starting activity milestones check...')

    const results = await checkActivityMilestones()

    console.log(`[Cron] Milestones complete: ${results.oneWeek} one-week, ${results.oneMonth} one-month`)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('[Cron] Milestones job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
