/**
 * Seasonal Campaigns Cron Job
 *
 * Runs daily to check for active seasonal campaigns
 * - Valentine's Day (Feb 10-14)
 * - Weekend Boost (Fridays at 18:00)
 * - New Year (Jan 1-7)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  sendValentinesCampaign,
  sendWeekendBoost,
  sendNewYearCampaign,
} from '@/lib/cron/seasonal-campaigns'

export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized seasonal campaign attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron] Starting seasonal campaigns job...')

  try {
    const results = {
      valentines: { sent: 0, skipped: 0, errors: 0 },
      weekend: { sent: 0, skipped: 0, errors: 0 },
      newYear: { sent: 0, skipped: 0, errors: 0 },
    }

    // Run all seasonal campaigns (they check dates internally)
    results.valentines = await sendValentinesCampaign()
    results.weekend = await sendWeekendBoost()
    results.newYear = await sendNewYearCampaign()

    const totalSent =
      results.valentines.sent + results.weekend.sent + results.newYear.sent

    console.log('[Cron] Seasonal campaigns completed:', results)

    return NextResponse.json({
      success: true,
      message: `Seasonal campaigns complete: ${totalSent} emails sent`,
      results,
    })
  } catch (error) {
    console.error('[Cron] Seasonal campaigns failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
