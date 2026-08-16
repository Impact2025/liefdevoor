/**
 * Cron Job: Weekly Summary
 *
 * Runs every Sunday at 10:00 to send weekly digest emails
 * Contains: profile views, likes, matches, messages stats
 *
 * Schedule: 0 10 * * 0 (Sunday 10 AM)
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklySummaries } from '@/lib/cron/engagement-engine'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Starting weekly summary job...')

    const results = await sendWeeklySummaries()

    console.log(`[Cron] Weekly summary complete: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('[Cron] Weekly summary job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
