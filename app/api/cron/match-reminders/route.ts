/**
 * Cron Job: Match Reminders
 *
 * Runs daily at 18:00 to send:
 * - New match reminders (no first message)
 * - Unanswered message reminders
 * - Inactive conversation reminders
 *
 * Schedule: 0 18 * * * (6 PM daily)
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'
import {
  sendNewMatchReminders,
  sendUnansweredMessageReminders,
  sendInactiveConversationReminders,
} from '@/lib/cron/engagement-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Starting match reminders job...')

    // Run all reminder types in parallel
    const [newMatchResults, unansweredResults, inactiveResults] = await Promise.all([
      sendNewMatchReminders(),
      sendUnansweredMessageReminders(),
      sendInactiveConversationReminders(),
    ])

    const totalSent =
      newMatchResults.sent + unansweredResults.sent + inactiveResults.sent
    const totalSkipped =
      newMatchResults.skipped + unansweredResults.skipped + inactiveResults.skipped
    const totalErrors =
      newMatchResults.errors + unansweredResults.errors + inactiveResults.errors

    console.log(`[Cron] Match reminders complete:`)
    console.log(`  New match: ${newMatchResults.sent} sent`)
    console.log(`  Unanswered: ${unansweredResults.sent} sent`)
    console.log(`  Inactive: ${inactiveResults.sent} sent`)
    console.log(`  Total: ${totalSent} sent, ${totalSkipped} skipped, ${totalErrors} errors`)

    return NextResponse.json({
      success: true,
      results: {
        newMatch: newMatchResults,
        unanswered: unansweredResults,
        inactive: inactiveResults,
        total: {
          sent: totalSent,
          skipped: totalSkipped,
          errors: totalErrors,
        },
      },
    })
  } catch (error) {
    console.error('[Cron] Match reminders job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
