import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  processRecurringPayment,
  SUBSCRIPTION_PLANS,
  type PlanId,
} from '@/lib/services/payment/multisafepay'
import {
  sendSubscriptionRenewedEmail,
  sendPaymentFailedEmail,
  sendSubscriptionExpiredEmail,
  sendSubscriptionExpiringEmail
} from '@/lib/email/notification-service'

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
          // Calculate new end date
          const newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

          // Update subscription with new end date
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              endDate: newEndDate,
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

          // Send renewal confirmation email
          try {
            await sendSubscriptionRenewedEmail({
              userId: subscription.userId,
              planName: plan.name,
              amount: plan.price,
              nextRenewalDate: newEndDate
            })
          } catch (emailError) {
            console.error(`[Cron] Failed to send renewal email for ${subscription.id}:`, emailError)
          }

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

    // Find subscriptions expiring in 7 days (for reminder emails)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const eightDaysFromNow = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)

    const expiringSoonSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        plan: { in: ['premium', 'gold'] },
        recurringId: null, // Only for non-recurring (they'll manually need to renew)
        endDate: {
          gte: sevenDaysFromNow,
          lt: eightDaysFromNow
        }
      },
      include: {
        user: { select: { id: true } }
      }
    })

    // Send expiring soon emails
    for (const subscription of expiringSoonSubscriptions) {
      try {
        const plan = SUBSCRIPTION_PLANS[subscription.plan.toLowerCase() as PlanId]
        if (plan && subscription.endDate) {
          await sendSubscriptionExpiringEmail({
            userId: subscription.userId,
            planName: plan.name,
            expiryDate: subscription.endDate,
            daysRemaining: 7
          })
          console.log(`[Cron] Sent expiring email for subscription ${subscription.id}`)
        }
      } catch (error) {
        console.error(`[Cron] Failed to send expiring email for ${subscription.id}:`, error)
      }
    }

    console.log('[Cron] Subscription renewal complete:', results)

    return NextResponse.json({
      success: true,
      results,
      expiringSoonReminders: expiringSoonSubscriptions.length,
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

  // Send payment failed email
  try {
    const plan = SUBSCRIPTION_PLANS[planName.toLowerCase() as PlanId]
    if (plan) {
      await sendPaymentFailedEmail({
        userId,
        planName: plan.name,
        amount: plan.price,
        reason: 'Automatische verlenging mislukt'
      })
    }
  } catch (emailError) {
    console.error(`[Cron] Failed to send payment failed email for ${subscriptionId}:`, emailError)
  }
}

/**
 * Handle expired subscription (no recurring setup)
 */
async function handleExpiredSubscription(subscriptionId: string, userId: string) {
  // Get subscription details before updating
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { plan: true, endDate: true }
  })

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

  // Send expired email
  if (subscription) {
    try {
      const plan = SUBSCRIPTION_PLANS[subscription.plan.toLowerCase() as PlanId]
      if (plan) {
        await sendSubscriptionExpiredEmail({
          userId,
          planName: plan.name,
          expiredDate: subscription.endDate || new Date()
        })
      }
    } catch (emailError) {
      console.error(`[Cron] Failed to send expired email for ${subscriptionId}:`, emailError)
    }
  }
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
