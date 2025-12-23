/**
 * Email Conversion Tracking API
 *
 * Track email-driven conversions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/email/track/conversion
 * Track email-driven conversions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailLogId, conversionType, revenue } = body

    if (!emailLogId) {
      return NextResponse.json(
        { error: 'Invalid tracking ID' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Update analytics
    await prisma.emailAnalytics.update({
      where: { emailLogId },
      data: {
        convertedToAction: true,
        conversionType,
        convertedAt: now,
        revenueGenerated: revenue || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Conversion tracked',
    })
  } catch (error) {
    console.error('[Email Tracking] Error tracking conversion:', error)
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    )
  }
}
