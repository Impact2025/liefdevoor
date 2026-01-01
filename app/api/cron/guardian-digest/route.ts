/**
 * Cron Job: Guardian Weekly Digest
 *
 * Stuurt wekelijkse samenvattingen naar alle begeleiders.
 * Bedoeld om te draaien via Vercel Cron of externe cron service.
 *
 * Schedule: Elke zondag om 18:00 (Europe/Amsterdam)
 *
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendAllWeeklyDigests } from '@/lib/guardian/weeklyDigest'

// Vercel Cron config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max for processing all digests

/**
 * GET /api/cron/guardian-digest
 *
 * Triggers the weekly digest for all guardians.
 * Protected by CRON_SECRET environment variable.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Guardian Cron] Unauthorized request - invalid CRON_SECRET')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Guardian Cron] Starting weekly digest job...')

  try {
    const result = await sendAllWeeklyDigests()

    console.log('[Guardian Cron] Job completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Weekly digest completed',
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Guardian Cron] Job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send weekly digests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cron/guardian-digest
 *
 * Alternative method for triggering via POST (some cron services prefer POST)
 */
export async function POST(request: NextRequest) {
  return GET(request)
}
