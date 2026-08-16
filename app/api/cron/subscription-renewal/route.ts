import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlanById } from '@/lib/pricing'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'
import {
  sendSubscriptionExpiredEmail,
  sendSubscriptionExpiringEmail,
} from '@/lib/email/notification-service'

/**
 * POST /api/cron/subscription-renewal
 *
 * Dagelijkse cron job (06:00 UTC) voor abonnementsonderhoud.
 * Stripe regelt verlengingen automatisch via invoice.paid webhook.
 * Deze cron handelt alleen:
 *  1. Verlopen actieve subscriptions zonder Stripe ID (legacy / lifetime)
 *  2. 7-daagse expiratiewaarschuwingen voor lifetime abonnementen
 */
export async function POST(request: NextRequest) {
  try {

    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = { expired: 0, expiringReminders: 0 }

    // --------------------------------------------------------
    // 1. Verlopen subscriptions zonder actieve Stripe subscription
    //    (lifetime of legacy data) → downgrade naar FREE
    // --------------------------------------------------------
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        endDate: { lt: now },
        // Alleen als Stripe niet actief beheert (geen Stripe ID of lifetime)
        stripeSubscriptionId: null,
      },
    })

    for (const subscription of expiredSubscriptions) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'cancelled', cancelledAt: now },
      })

      await prisma.user.update({
        where: { id: subscription.userId },
        data: { subscriptionTier: 'FREE' },
      })

      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          type: 'subscription',
          title: 'Abonnement Verlopen',
          message: 'Je abonnement is verlopen. Verleng je abonnement om alle functies te blijven gebruiken.',
        },
      })

      const plan = getPlanById(subscription.plan)
      if (plan) {
        sendSubscriptionExpiredEmail({
          userId: subscription.userId,
          planName: plan.name,
          expiredDate: subscription.endDate ?? now,
        }).catch(console.error)
      }

      results.expired++
    }

    // --------------------------------------------------------
    // 2. 7-daagse waarschuwing voor lifetime abonnementen
    //    die verlopen (geen recurring Stripe subscription)
    // --------------------------------------------------------
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const eightDaysFromNow = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'active',
        stripeSubscriptionId: null, // Lifetime of legacy
        endDate: { gte: sevenDaysFromNow, lt: eightDaysFromNow },
      },
    })

    for (const subscription of expiringSoon) {
      const plan = getPlanById(subscription.plan)
      if (plan && subscription.endDate) {
        sendSubscriptionExpiringEmail({
          userId: subscription.userId,
          planName: plan.name,
          expiryDate: subscription.endDate,
          daysRemaining: 7,
        }).catch(console.error)
        results.expiringReminders++
      }
    }

    console.log('[Cron] Subscription maintenance complete:', results)
    return NextResponse.json({ success: true, results, timestamp: now.toISOString() })
  } catch (error) {
    console.error('[Cron] Error in subscription maintenance:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'subscription-renewal' })
}
