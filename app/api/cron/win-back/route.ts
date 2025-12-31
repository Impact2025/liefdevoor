/**
 * Cron Job: Win-Back Campaign
 *
 * Runs daily at 11:00 to send win-back emails to users
 * who have been inactive for 90+ days
 *
 * Schedule: 0 11 * * * (11 AM daily)
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendWinBackEmails } from '@/lib/cron/engagement-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

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

    console.log('[Cron] Starting win-back campaign (90+ days)...')

    const results = await sendWinBackEmails()

    console.log(`[Cron] Win-back complete: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('[Cron] Win-back job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
