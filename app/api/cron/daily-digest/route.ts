/**
 * Daily Digest Cron Job
 *
 * Vercel Cron endpoint - runs daily at 19:00 (7 PM)
 * Sends email summaries of profile visits and likes
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-digest",
 *     "schedule": "0 19 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendDailyDigests } from '@/lib/cron/retention'

export const maxDuration = 300 // 5 minutes for long-running cron

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized daily-digest attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Cron] Starting daily-digest job...')

  try {
    const result = await sendDailyDigests()

    console.log('[Cron] Daily digest completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Daily digest emails sent',
      ...result
    })
  } catch (error) {
    console.error('[Cron] Daily digest failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
