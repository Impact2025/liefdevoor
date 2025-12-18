/**
 * Daily Birthday Email Cron Job
 *
 * Runs every day at 9:00 AM to send birthday emails
 *
 * Security: Protected by CRON_SECRET environment variable
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendAllBirthdayEmails } from '@/lib/email/birthday-system'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max (for many birthdays)

export async function GET(request: NextRequest) {
  try {
    console.log('[Cron] Birthday email job started')

    // Security: Check authorization header (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'dev-secret-change-in-production'}`

    if (authHeader !== expectedAuth) {
      console.warn('[Cron] Unauthorized attempt to run birthday job')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Run birthday email job
    const result = await sendAllBirthdayEmails()

    console.log('[Cron] Birthday job completed:', result)

    // Return success response
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    })
  } catch (error) {
    console.error('[Cron] Birthday job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}
