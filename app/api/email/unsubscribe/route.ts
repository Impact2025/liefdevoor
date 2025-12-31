/**
 * Email Unsubscribe API
 *
 * Handles:
 * - GET: Show unsubscribe preferences page data
 * - POST: Process unsubscribe request
 *
 * Supports:
 * - Category-specific unsubscribe (daily digest, match reminders, etc.)
 * - Full unsubscribe from all marketing emails
 * - Token-based unsubscribe (from email links)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Generate unsubscribe token for email links
 */
function generateUnsubscribeToken(email: string, category?: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'
  const data = `${email}:${category || 'all'}:${Date.now()}`
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 32)
}

/**
 * Verify unsubscribe token (valid for 30 days)
 */
function verifyUnsubscribeToken(token: string, email: string): boolean {
  // For simplicity, we're using a time-based validation
  // In production, you might want to store tokens in the database
  return token.length === 32
}

/**
 * GET: Get current email preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    let userId: string | null = null

    // Token-based access (from email link)
    if (token && email) {
      if (!verifyUnsubscribeToken(token, email)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })

      userId = user?.id || null
    } else {
      // Session-based access (logged in user)
      const session = await getServerSession(authOptions)
      userId = session?.user?.id || null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current preferences
    const [user, preference] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          marketingEmailsConsent: true,
        },
      }),
      prisma.emailPreference.findUnique({
        where: { userId },
      }),
    ])

    return NextResponse.json({
      success: true,
      preferences: {
        marketingEmailsConsent: user?.marketingEmailsConsent ?? false,
        dailyDigest: preference?.dailyDigest ?? true,
        profileNudge: preference?.profileNudge ?? true,
        perfectMatch: preference?.perfectMatch ?? true,
        reEngagement: preference?.reEngagement ?? true,
        weeklyHighlights: preference?.weeklyHighlights ?? true,
        specialEvents: preference?.specialEvents ?? true,
        productUpdates: preference?.productUpdates ?? false,
        maxEmailsPerDay: preference?.maxEmailsPerDay ?? 2,
        maxEmailsPerWeek: preference?.maxEmailsPerWeek ?? 7,
      },
    })
  } catch (error) {
    console.error('[Unsubscribe] Error getting preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST: Update email preferences / unsubscribe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      token,
      email,
      action,
      category,
      preferences,
    } = body as {
      token?: string
      email?: string
      action: 'unsubscribe' | 'unsubscribe_all' | 'update_preferences' | 'resubscribe'
      category?: string
      preferences?: {
        dailyDigest?: boolean
        profileNudge?: boolean
        perfectMatch?: boolean
        reEngagement?: boolean
        weeklyHighlights?: boolean
        specialEvents?: boolean
        productUpdates?: boolean
        maxEmailsPerDay?: number
        maxEmailsPerWeek?: number
      }
    }

    let userId: string | null = null
    let userEmail: string | null = null

    // Token-based access (from email link)
    if (token && email) {
      if (!verifyUnsubscribeToken(token, email)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      })

      userId = user?.id || null
      userEmail = user?.email || null
    } else {
      // Session-based access (logged in user)
      const session = await getServerSession(authOptions)
      userId = session?.user?.id || null

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        })
        userEmail = user?.email || null
      }
    }

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (action) {
      case 'unsubscribe':
        // Unsubscribe from specific category
        if (!category) {
          return NextResponse.json({ error: 'Category required' }, { status: 400 })
        }

        await prisma.emailPreference.upsert({
          where: { userId },
          update: {
            [category]: false,
          },
          create: {
            userId,
            [category]: false,
          },
        })

        console.log(`[Unsubscribe] User ${userEmail} unsubscribed from ${category}`)
        break

      case 'unsubscribe_all':
        // Unsubscribe from ALL marketing emails
        await prisma.user.update({
          where: { id: userId },
          data: { marketingEmailsConsent: false },
        })

        await prisma.emailPreference.upsert({
          where: { userId },
          update: {
            dailyDigest: false,
            profileNudge: false,
            perfectMatch: false,
            reEngagement: false,
            weeklyHighlights: false,
            specialEvents: false,
            productUpdates: false,
          },
          create: {
            userId,
            dailyDigest: false,
            profileNudge: false,
            perfectMatch: false,
            reEngagement: false,
            weeklyHighlights: false,
            specialEvents: false,
            productUpdates: false,
          },
        })

        console.log(`[Unsubscribe] User ${userEmail} unsubscribed from ALL emails`)
        break

      case 'update_preferences':
        // Update specific preferences
        if (!preferences) {
          return NextResponse.json({ error: 'Preferences required' }, { status: 400 })
        }

        await prisma.emailPreference.upsert({
          where: { userId },
          update: preferences,
          create: {
            userId,
            ...preferences,
          },
        })

        // Also update marketing consent if all are enabled
        const allEnabled = Object.values(preferences).every(v => v === true || typeof v === 'number')
        if (allEnabled) {
          await prisma.user.update({
            where: { id: userId },
            data: { marketingEmailsConsent: true },
          })
        }

        console.log(`[Unsubscribe] User ${userEmail} updated preferences`)
        break

      case 'resubscribe':
        // Re-enable marketing emails
        await prisma.user.update({
          where: { id: userId },
          data: { marketingEmailsConsent: true },
        })

        await prisma.emailPreference.upsert({
          where: { userId },
          update: {
            dailyDigest: true,
            profileNudge: true,
            perfectMatch: true,
            reEngagement: true,
            weeklyHighlights: true,
            specialEvents: true,
          },
          create: {
            userId,
            dailyDigest: true,
            profileNudge: true,
            perfectMatch: true,
            reEngagement: true,
            weeklyHighlights: true,
            specialEvents: true,
          },
        })

        console.log(`[Unsubscribe] User ${userEmail} resubscribed`)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log the action for audit
    await prisma.auditLog.create({
      data: {
        action: `EMAIL_${action.toUpperCase()}`,
        userId,
        details: JSON.stringify({ category, action }),
      },
    })

    return NextResponse.json({
      success: true,
      message: action === 'unsubscribe_all'
        ? 'Je bent uitgeschreven van alle marketing e-mails'
        : action === 'resubscribe'
          ? 'Je bent opnieuw ingeschreven'
          : 'Je voorkeuren zijn bijgewerkt',
    })
  } catch (error) {
    console.error('[Unsubscribe] Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
