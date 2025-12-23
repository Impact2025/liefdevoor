/**
 * Cancel Subscription API
 *
 * Allows users to cancel their premium subscription
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    // Haal gebruiker op
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionTier: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Check if user has a subscription to cancel
    if (user.subscriptionTier === 'FREE') {
      return NextResponse.json(
        { error: 'Je hebt geen actief abonnement om op te zeggen' },
        { status: 400 }
      )
    }

    // Haal actieve subscription op
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Geen actief abonnement gevonden' },
        { status: 404 }
      )
    }

    // Update subscription status to cancelled
    // User keeps access until endDate
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        // Keep endDate - user has access until then
      },
    })

    // Optionally: Send cancellation email
    // await sendCancellationEmail(user.email)

    // TODO: Add audit logging when AuditLog model is added to Prisma schema
    // await prisma.auditLog.create({
    //   data: {
    //     userId: user.id,
    //     action: 'SUBSCRIPTION_CANCELLED',
    //     details: {
    //       subscriptionId: subscription.id,
    //       tier: subscription.tier,
    //       cancelledAt: new Date().toISOString(),
    //       accessUntil: subscription.endDate?.toISOString(),
    //     },
    //   },
    // })

    // Log to console for now
    console.log('[Subscription] Cancelled:', {
      userId: user.id,
      subscriptionId: subscription.id,
      plan: subscription.plan,
      accessUntil: subscription.endDate,
    })

    return NextResponse.json({
      success: true,
      message: 'Abonnement opgezegd',
      accessUntil: subscription.endDate,
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het opzeggen van je abonnement' },
      { status: 500 }
    )
  }
}
