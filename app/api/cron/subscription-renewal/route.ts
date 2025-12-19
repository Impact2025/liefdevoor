import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  processRecurringPayment,
  SUBSCRIPTION_PLANS,
  type PlanId,
} from '@/lib/services/payment/multisafepay'

/**
 * POST /api/cron/subscription-renewal
 *
 * Cron job to process subscription renewals
 * Should be called daily by an external cron service
 *
 * For Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/subscription-renewal",
 *     "schedule": "0 6 * * *"  // Daily at 6 AM UTC
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = {
      processed: 0,
      renewed: 0,
      failed: 0,
      expired: 0,
    }

    // Find subscriptions that are expiring today or have expired
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        plan: { in: ['premium', 'gold'] },
        endDate: { lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) }, // Expiring within 24h
        recurringId: { not: null },
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    console.log(`[Cron] Processing ${expiringSubscriptions.length} subscriptions for renewal`)

    for (const subscription of expiringSubscriptions) {
      results.processed++

      const plan = SUBSCRIPTION_PLANS[subscription.plan as PlanId]
      if (!plan || plan.price === 0) {
        console.warn(`[Cron] Invalid plan for subscription ${subscription.id}`)
        continue
      }

      try {
        // Process recurring payment
        const result = await processRecurringPayment(
          subscription.recurringId!,
          plan.price,
          `renewal_${subscription.id}_${Date.now()}`,
          `${plan.name} Abonnement Verlenging - Liefde Voor Iedereen`
        )

        if (result.success) {
          // Update subscription with new end date
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
              updatedAt: now,
            },
          })

          // Create success notification
          await prisma.notification.create({
            data: {
              userId: subscription.userId,
              type: 'subscription',
              title: 'Abonnement Verlengd',
              message: `Je ${plan.name} abonnement is automatisch verlengd voor een nieuwe maand.`,
            },
          })

          results.renewed++
          console.log(`[Cron] Renewed subscription ${subscription.id}`)
        } else {
          // Payment failed - mark as expired
          await handleRenewalFailure(subscription.id, subscription.userId, plan.name)
          results.failed++
          console.log(`[Cron] Failed to renew subscription ${subscription.id}`)
        }
      } catch (error) {
        console.error(`[Cron] Error processing subscription ${subscription.id}:`, error)
        results.failed++
      }
    }

    // Handle subscriptions without recurringId that have expired
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        plan: { in: ['premium', 'gold'] },
        endDate: { lt: now },
        recurringId: null,
      },
    })

    for (const subscription of expiredSubscriptions) {
      await handleExpiredSubscription(subscription.id, subscription.userId)
      results.expired++
    }

    console.log('[Cron] Subscription renewal complete:', results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Error in subscription renewal:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * Handle failed renewal payment
 */
async function handleRenewalFailure(
  subscriptionId: string,
  userId: string,
  planName: string
) {
  // Mark subscription as pending
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'pending' },
  })

  // Notify user
  await prisma.notification.create({
    data: {
      userId,
      type: 'subscription',
      title: 'Betaling Mislukt',
      message: `De automatische verlenging van je ${planName} abonnement is mislukt. Werk je betaalmethode bij om toegang te behouden.`,
    },
  })
}

/**
 * Handle expired subscription (no recurring setup)
 */
async function handleExpiredSubscription(subscriptionId: string, userId: string) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'cancelled' },
  })

  await prisma.notification.create({
    data: {
      userId,
      type: 'subscription',
      title: 'Abonnement Verlopen',
      message: 'Je premium abonnement is verlopen. Verleng je abonnement om toegang te behouden tot alle functies.',
    },
  })
}

/**
 * GET /api/cron/subscription-renewal
 *
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'subscription-renewal',
    description: 'Processes subscription renewals daily',
  })
}
