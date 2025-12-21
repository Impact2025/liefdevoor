/**
 * Boost API - Boost your profile for 30 minutes
 *
 * Premium feature: COMPLETE users get 1 boost per month
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature, getSubscriptionInfo } from '@/lib/subscription'

const BOOST_DURATION_MINUTES = 30

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Get current active boost
    const now = new Date()
    const activeBoost = await prisma.profileBoost.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: now },
      },
    })

    // Get subscription info to check remaining boosts
    const subscription = await getSubscriptionInfo(user.id)
    const boostsPerMonth = subscription.features.boostsPerMonth

    // Count boosts used this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const boostsUsedThisMonth = await prisma.profileBoost.count({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonth },
      },
    })

    const remainingBoosts = Math.max(0, boostsPerMonth - boostsUsedThisMonth)

    return NextResponse.json({
      isActive: !!activeBoost,
      expiresAt: activeBoost?.expiresAt || null,
      remainingMinutes: activeBoost
        ? Math.ceil((activeBoost.expiresAt.getTime() - now.getTime()) / (1000 * 60))
        : 0,
      boostsRemaining: remainingBoosts,
      boostsPerMonth,
      canBoost: subscription.features.canBoost,
    })
  } catch (error) {
    console.error('Error fetching boost status:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Check if user can boost
    const canBoost = await hasFeature(user.id, 'canBoost')
    if (!canBoost) {
      return NextResponse.json({
        error: 'Premium vereist',
        message: 'Boost is alleen beschikbaar voor Liefde Compleet abonnees.',
        upgradeUrl: '/prijzen',
      }, { status: 403 })
    }

    const now = new Date()

    // Check for existing active boost
    const activeBoost = await prisma.profileBoost.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: now },
      },
    })

    if (activeBoost) {
      return NextResponse.json({
        error: 'Boost al actief',
        message: 'Je hebt al een actieve boost.',
        expiresAt: activeBoost.expiresAt,
        remainingMinutes: Math.ceil((activeBoost.expiresAt.getTime() - now.getTime()) / (1000 * 60)),
      }, { status: 400 })
    }

    // Check monthly limit
    const subscription = await getSubscriptionInfo(user.id)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const boostsUsedThisMonth = await prisma.profileBoost.count({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonth },
      },
    })

    if (boostsUsedThisMonth >= subscription.features.boostsPerMonth) {
      return NextResponse.json({
        error: 'Limiet bereikt',
        message: `Je hebt deze maand al ${subscription.features.boostsPerMonth} boost(s) gebruikt.`,
      }, { status: 403 })
    }

    // Create the boost
    const expiresAt = new Date(now.getTime() + BOOST_DURATION_MINUTES * 60 * 1000)
    const boost = await prisma.profileBoost.create({
      data: {
        userId: user.id,
        expiresAt,
        isActive: true,
      },
    })

    // Mark old expired boosts as inactive
    await prisma.profileBoost.updateMany({
      where: {
        userId: user.id,
        expiresAt: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      boost: {
        id: boost.id,
        expiresAt: boost.expiresAt,
        durationMinutes: BOOST_DURATION_MINUTES,
      },
      message: `Je profiel wordt nu 30 minuten lang geboost!`,
    })
  } catch (error) {
    console.error('Error activating boost:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het activeren van de boost' },
      { status: 500 }
    )
  }
}
