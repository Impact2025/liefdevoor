/**
 * Cron Job: Migration Email Campaign
 *
 * Runs daily at 10:00 to process migration emails
 * - Sends welcome emails to new migration users
 * - Sends reminder emails based on schedule
 * - Processes the 7-touch email sequence
 *
 * Schedule: 0 10 * * * (10 AM daily)
 */

import { NextRequest, NextResponse } from 'next/server'
import { processDailyMigrationEmails, getMigrationDashboardStats } from '@/lib/migration/migration-engine'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for processing all emails

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Starting migration email campaign processing...')

    // Process daily emails
    const results = await processDailyMigrationEmails()

    // Get current stats
    const stats = await getMigrationDashboardStats()

    console.log('[Cron] Migration email processing complete')
    console.log('[Cron] Results:', results)
    console.log('[Cron] Current stats:', {
      total: stats.total,
      claimRate: stats.conversionRates.claimRate + '%',
      activationRate: stats.conversionRates.activationRate + '%'
    })

    return NextResponse.json({
      success: true,
      results,
      stats: {
        total: stats.total,
        conversionRates: stats.conversionRates,
        recentActivations: stats.recentActivations.length
      }
    })
  } catch (error) {
    console.error('[Cron] Migration email job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for manual trigger with specific actions
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, segment, emailType } = body

    console.log('[Cron] Manual migration action:', action)

    switch (action) {
      case 'process_all':
        const results = await processDailyMigrationEmails()
        return NextResponse.json({ success: true, results })

      case 'get_stats':
        const stats = await getMigrationDashboardStats()
        return NextResponse.json({ success: true, stats })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Cron] Manual migration action failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
