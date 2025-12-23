/**
 * Email Analytics Tracking API
 *
 * Tracks opens, clicks, and conversions
 * Powers send time optimization and A/B testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateSendTimeOptimization } from '@/lib/email/personalization'
import { trackABTestOpen, trackABTestClick } from '@/lib/email/ab-testing'

/**
 * GET /api/email/track/open?id=xxx
 * Track email opens (1x1 pixel)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const emailLogId = searchParams.get('id')

    if (!emailLogId) {
      return new Response('Invalid tracking ID', { status: 400 })
    }

    // Find email log
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    })

    if (!emailLog) {
      return new Response('Email not found', { status: 404 })
    }

    const now = new Date()

    // Update email log
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        openedAt: emailLog.openedAt || now, // Only set first open
        status: 'opened',
      },
    })

    // Update analytics
    await prisma.emailAnalytics.upsert({
      where: { emailLogId },
      update: {
        openCount: { increment: 1 },
        lastOpenedAt: now,
        firstOpenedAt: emailLog.openedAt || now,
      },
      create: {
        emailLogId,
        openCount: 1,
        firstOpenedAt: now,
        lastOpenedAt: now,
      },
    })

    // Update send time optimization
    if (emailLog.userId) {
      await updateSendTimeOptimization(emailLog.userId, emailLogId, now)
    }

    // Track A/B test open
    if (emailLog.abTestId && emailLog.abTestVariant) {
      await trackABTestOpen(
        emailLog.abTestId,
        emailLog.abTestVariant as 'A' | 'B'
      )
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[Email Tracking] Error tracking open:', error)
    // Still return pixel to avoid broken images
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new Response(pixel, {
      headers: { 'Content-Type': 'image/gif' },
    })
  }
}

/**
 * POST /api/email/track/click
 * Track email link clicks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailLogId, url, cta } = body

    if (!emailLogId) {
      return NextResponse.json(
        { error: 'Invalid tracking ID' },
        { status: 400 }
      )
    }

    // Find email log
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    })

    if (!emailLog) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    const now = new Date()

    // Update email log
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        clickedAt: emailLog.clickedAt || now,
        status: 'clicked',
      },
    })

    // Update analytics
    const analytics = await prisma.emailAnalytics.upsert({
      where: { emailLogId },
      update: {
        clickCount: { increment: 1 },
        clickedLinks: {
          push: url,
        },
        ctaClicked: cta || undefined,
      },
      create: {
        emailLogId,
        clickCount: 1,
        clickedLinks: [url],
        ctaClicked: cta,
      },
    })

    // Track A/B test click
    if (emailLog.abTestId && emailLog.abTestVariant) {
      await trackABTestClick(
        emailLog.abTestId,
        emailLog.abTestVariant as 'A' | 'B'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked',
    })
  } catch (error) {
    console.error('[Email Tracking] Error tracking click:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}

// Note: Conversion tracking moved to /api/email/track/conversion/route.ts
