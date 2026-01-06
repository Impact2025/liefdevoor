import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier } from '@prisma/client'
import {
  createSubscriptionPayment,
  createDirectDebitMandate,
  type PlanId,
  type PaymentMethod,
} from '@/lib/services/payment/multisafepay'
import {
  getPlanById,
  getPlanDurationDays,
  SUBSCRIPTION_PLANS,
  LEGACY_PLAN_MAP,
} from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Je moet ingelogd zijn' }, { status: 401 })
    }

    const body = await request.json()
    const { planId: rawPlanId, amount, couponCode, paymentMethod = 'ideal' } = body

    // Map legacy plan IDs to new format
    const planId = LEGACY_PLAN_MAP[rawPlanId] || rawPlanId

    console.log('[Subscription Create] Request body:', { rawPlanId, planId, amount, couponCode, paymentMethod })

    // Get plan from central pricing
    const plan = getPlanById(planId)

    if (!plan) {
      console.error('[Subscription Create] Invalid planId:', planId)
      const availablePlans = SUBSCRIPTION_PLANS.map(p => p.id).join(', ')
      return NextResponse.json({
        error: 'Ongeldig abonnement',
        details: `Plan ID '${planId}' is niet geldig. Beschikbare plans: ${availablePlans}`
      }, { status: 400 })
    }

    // Get the subscription tier from the plan
    const tier: SubscriptionTier = plan.tier

    // Handle free plan OR 100% discount with coupon
    if (plan.price === 0 || amount === 0) {
      // Cancel any existing subscription first
      await prisma.subscription.updateMany({
        where: { userId: session.user.id, status: 'active' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      })

      // Update user's subscription tier
      await prisma.user.update({
        where: { id: session.user.id },
        data: { subscriptionTier: tier },
      })

      // Calculate end date for paid plans
      let endDate: Date | undefined
      if (tier !== 'FREE') {
        const durationDays = getPlanDurationDays(planId)
        endDate = new Date()
        endDate.setDate(endDate.getDate() + durationDays)
      }

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: planId,
          status: 'active',
          endDate,
        },
      })

      // If coupon was used, record the usage
      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() }
        })

        if (coupon) {
          await prisma.$transaction(async (tx) => {
            // Record usage
            await tx.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: session.user.id,
                orderType: 'subscription',
                orderId: subscription.id,
                originalAmount: plan.price,
                discountAmount: plan.price,
                finalAmount: 0,
              }
            })

            // Increment usage counter
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { currentTotalUses: { increment: 1 } }
            })
          })
        }
      }

      const message = amount === 0 && couponCode
        ? `${plan.name} gratis geactiveerd met couponcode!`
        : 'Basis abonnement geactiveerd'

      return NextResponse.json({ success: true, message })
    }

    // Check for existing active paid subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    })

    if (existingSubscription) {
      const existingPlan = getPlanById(existingSubscription.plan)

      console.log('[Subscription Create] Existing subscription found:', {
        existingPlan: existingSubscription.plan,
        existingTier: existingPlan?.tier,
        requestedPlan: planId,
        requestedTier: tier
      })

      // Check if same tier and period
      if (existingSubscription.plan === planId) {
        return NextResponse.json(
          { error: 'Je hebt dit abonnement al' },
          { status: 400 }
        )
      }

      // Prevent downgrade from GOLD to PREMIUM
      if (existingPlan?.tier === 'GOLD' && tier === 'PREMIUM') {
        return NextResponse.json(
          { error: 'Downgrade naar Premium is niet mogelijk. Annuleer eerst je Gold abonnement.' },
          { status: 400 }
        )
      }
    }

    // Calculate end date based on billing period
    const durationDays = getPlanDurationDays(planId)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    // Create pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: planId,
        status: 'pending',
        endDate,
      },
    })

    // Create payment based on method
    let paymentResult: { paymentUrl: string; orderId: string; isDirectDebit?: boolean }

    if (paymentMethod === 'directdebit') {
      // SEPA Direct Debit - automatische incasso
      paymentResult = await createDirectDebitMandate(
        session.user.id,
        session.user.email,
        session.user.name || null,
        planId,
        subscription.id
      )
    } else {
      // Regular payment (iDEAL, creditcard, Bancontact)
      paymentResult = await createSubscriptionPayment(
        session.user.id,
        session.user.email,
        session.user.name || null,
        planId as PlanId,
        subscription.id,
        paymentMethod as PaymentMethod
      )
    }

    // Update subscription with MultiSafepay order ID and payment method
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        multisafepayId: paymentResult.orderId,
        // Store if it's a direct debit subscription for recurring handling
      },
    })

    return NextResponse.json({
      paymentUrl: paymentResult.paymentUrl,
      isDirectDebit: paymentResult.isDirectDebit,
    })
  } catch (error) {
    console.error('[Subscription] Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het opnieuw.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subscription/create
 *
 * Get available subscription plans
 */
export async function GET() {
  const plans = SUBSCRIPTION_PLANS.map(plan => ({
    id: plan.id,
    tier: plan.tier,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    period: plan.period,
    periodLabel: plan.periodLabel,
    pricePerMonth: plan.pricePerMonth,
    savings: plan.savings,
    savingsPercent: plan.savingsPercent,
    features: plan.features,
    highlighted: plan.highlighted,
    badge: plan.badge,
    supportsDirectDebit: plan.supportsDirectDebit,
    isLifetime: plan.isLifetime,
  }))

  return NextResponse.json({ plans })
}
