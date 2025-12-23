/**
 * Email Preference Management API
 *
 * Allows users to control which emails they receive
 * GDPR compliant preference center
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/email/preferences
 * Get user's email preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create preferences
    let preferences = await prisma.emailPreference.findUnique({
      where: { userId: session.user.id },
    })

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.emailPreference.create({
        data: {
          userId: session.user.id,
          dailyDigest: true,
          profileNudge: true,
          perfectMatch: true,
          reEngagement: true,
          weeklyHighlights: true,
          specialEvents: true,
          productUpdates: false,
          maxEmailsPerDay: 2,
          maxEmailsPerWeek: 7,
        },
      })
    }

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error('[Email Preferences] Error fetching:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/email/preferences
 * Update user's email preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      dailyDigest,
      profileNudge,
      perfectMatch,
      reEngagement,
      weeklyHighlights,
      specialEvents,
      productUpdates,
      maxEmailsPerDay,
      maxEmailsPerWeek,
      quietHoursStart,
      quietHoursEnd,
      preferredSendTime,
      timezone,
    } = body

    // Update or create preferences
    const preferences = await prisma.emailPreference.upsert({
      where: { userId: session.user.id },
      update: {
        dailyDigest: dailyDigest ?? undefined,
        profileNudge: profileNudge ?? undefined,
        perfectMatch: perfectMatch ?? undefined,
        reEngagement: reEngagement ?? undefined,
        weeklyHighlights: weeklyHighlights ?? undefined,
        specialEvents: specialEvents ?? undefined,
        productUpdates: productUpdates ?? undefined,
        maxEmailsPerDay: maxEmailsPerDay ?? undefined,
        maxEmailsPerWeek: maxEmailsPerWeek ?? undefined,
        quietHoursStart: quietHoursStart ?? undefined,
        quietHoursEnd: quietHoursEnd ?? undefined,
        preferredSendTime: preferredSendTime ?? undefined,
        timezone: timezone ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        dailyDigest: dailyDigest ?? true,
        profileNudge: profileNudge ?? true,
        perfectMatch: perfectMatch ?? true,
        reEngagement: reEngagement ?? true,
        weeklyHighlights: weeklyHighlights ?? true,
        specialEvents: specialEvents ?? true,
        productUpdates: productUpdates ?? false,
        maxEmailsPerDay: maxEmailsPerDay ?? 2,
        maxEmailsPerWeek: maxEmailsPerWeek ?? 7,
        quietHoursStart,
        quietHoursEnd,
        preferredSendTime,
        timezone: timezone ?? 'Europe/Amsterdam',
      },
    })

    // Also update user's marketingEmailsConsent
    const allDisabled =
      !preferences.dailyDigest &&
      !preferences.profileNudge &&
      !preferences.perfectMatch &&
      !preferences.reEngagement &&
      !preferences.weeklyHighlights &&
      !preferences.specialEvents &&
      !preferences.productUpdates

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        marketingEmailsConsent: !allDisabled,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    })
  } catch (error) {
    console.error('[Email Preferences] Error updating:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/email/preferences/unsubscribe-all
 * Unsubscribe from all marketing emails
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Disable all email categories
    await prisma.emailPreference.upsert({
      where: { userId: session.user.id },
      update: {
        dailyDigest: false,
        profileNudge: false,
        perfectMatch: false,
        reEngagement: false,
        weeklyHighlights: false,
        specialEvents: false,
        productUpdates: false,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        dailyDigest: false,
        profileNudge: false,
        perfectMatch: false,
        reEngagement: false,
        weeklyHighlights: false,
        specialEvents: false,
        productUpdates: false,
      },
    })

    // Update user consent
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        marketingEmailsConsent: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from all emails',
    })
  } catch (error) {
    console.error('[Email Preferences] Error unsubscribing:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
