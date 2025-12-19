import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscriptionInfo } from '@/lib/subscription'

// Boost duration in minutes
const BOOST_DURATION_MINUTES = 30

/**
 * GET /api/profile/boost
 *
 * Get current boost status and remaining boosts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription info
    const subscription = await getSubscriptionInfo(user.id)

    // Check active boost
    const activeBoost = await prisma.profileBoost.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'desc' },
    })

    // Count boosts used this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const boostsUsedThisMonth = await prisma.profileBoost.count({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonth },
      },
    })

    const boostsPerMonth = subscription.features.boostsPerMonth || 0
    const boostsRemaining = Math.max(0, boostsPerMonth - boostsUsedThisMonth)

    return NextResponse.json({
      activeBoost: activeBoost ? {
        startedAt: activeBoost.startedAt,
        expiresAt: activeBoost.expiresAt,
        minutesRemaining: Math.max(0, Math.floor((activeBoost.expiresAt.getTime() - Date.now()) / 60000)),
      } : null,
      boostsRemaining,
      boostsPerMonth,
      boostsUsedThisMonth,
      canBoost: subscription.features.canBoost && boostsRemaining > 0 && !activeBoost,
      isPremiumFeature: !subscription.features.canBoost,
    })
  } catch (error) {
    console.error('[Profile Boost] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * POST /api/profile/boost
 *
 * Activate a profile boost
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription info
    const subscription = await getSubscriptionInfo(user.id)

    if (!subscription.features.canBoost) {
      return NextResponse.json({
        error: 'Premium feature',
        message: 'Upgrade naar Gold om je profiel te boosten',
        upgradeUrl: '/subscription',
      }, { status: 403 })
    }

    // Check for active boost
    const activeBoost = await prisma.profileBoost.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    })

    if (activeBoost) {
      return NextResponse.json({
        error: 'Boost already active',
        message: 'Je hebt al een actieve boost',
        expiresAt: activeBoost.expiresAt,
      }, { status: 400 })
    }

    // Check remaining boosts this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const boostsUsedThisMonth = await prisma.profileBoost.count({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonth },
      },
    })

    const boostsPerMonth = subscription.features.boostsPerMonth || 0

    if (boostsUsedThisMonth >= boostsPerMonth) {
      return NextResponse.json({
        error: 'No boosts remaining',
        message: 'Je hebt alle boosts voor deze maand gebruikt',
        resetsAt: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1),
      }, { status: 403 })
    }

    // Create new boost
    const now = new Date()
    const expiresAt = new Date(now.getTime() + BOOST_DURATION_MINUTES * 60 * 1000)

    const boost = await prisma.profileBoost.create({
      data: {
        userId: user.id,
        startedAt: now,
        expiresAt,
        isActive: true,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'boost',
        title: '🚀 Boost Actief!',
        message: `Je profiel wordt nu ${BOOST_DURATION_MINUTES} minuten gepromoot aan meer mensen.`,
      },
    })

    return NextResponse.json({
      success: true,
      boost: {
        id: boost.id,
        startedAt: boost.startedAt,
        expiresAt: boost.expiresAt,
        durationMinutes: BOOST_DURATION_MINUTES,
      },
      boostsRemaining: boostsPerMonth - boostsUsedThisMonth - 1,
      message: `Je profiel wordt nu ${BOOST_DURATION_MINUTES} minuten geboost!`,
    })
  } catch (error) {
    console.error('[Profile Boost] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * DELETE /api/profile/boost
 *
 * Deactivate expired boosts (called by cron or cleanup)
 */
export async function DELETE() {
  try {
    // Deactivate all expired boosts
    const result = await prisma.profileBoost.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: new Date() },
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      deactivated: result.count,
    })
  } catch (error) {
    console.error('[Profile Boost] Cleanup error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
