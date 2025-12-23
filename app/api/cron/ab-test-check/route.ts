/**
 * A/B Test Auto-End Cron Job
 *
 * Runs hourly to check if A/B tests have reached statistical significance
 * Automatically ends tests when confidence >= 95%
 */

import { NextRequest, NextResponse } from 'next/server'
import { autoEndABTests } from '@/lib/email/ab-testing'

export const maxDuration = 60 // 1 minute

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized A/B test check attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron] Checking A/B tests for auto-end...')

  try {
    await autoEndABTests()

    return NextResponse.json({
      success: true,
      message: 'A/B tests checked and auto-ended where applicable',
    })
  } catch (error) {
    console.error('[Cron] A/B test check failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
