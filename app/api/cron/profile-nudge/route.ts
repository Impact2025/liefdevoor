/**
 * Profile Nudge Cron Job
 *
 * Vercel Cron endpoint - runs daily at 10:00 AM
 * Encourages users to complete their profiles
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/profile-nudge",
 *     "schedule": "0 10 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkIncompleteProfiles } from '@/lib/cron/retention'

export const maxDuration = 300 // 5 minutes for long-running cron

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] Unauthorized profile-nudge attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Cron] Starting profile-nudge job...')

  try {
    const result = await checkIncompleteProfiles()

    console.log('[Cron] Profile nudge completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Profile nudge emails sent',
      ...result
    })
  } catch (error) {
    console.error('[Cron] Profile nudge failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
