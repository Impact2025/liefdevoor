/**
 * Re-Engagement Cron Job
 *
 * Vercel Cron endpoint - runs daily at 11:00 AM
 * Wins back dormant users with personalized campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendReEngagementEmails } from '@/lib/cron/re-engagement'

export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized re-engagement attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron] Starting re-engagement job...')

  try {
    const result = await sendReEngagementEmails()

    console.log('[Cron] Re-engagement completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Re-engagement emails sent',
      ...result,
    })
  } catch (error) {
    console.error('[Cron] Re-engagement failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
