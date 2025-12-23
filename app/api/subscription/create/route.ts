import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier } from '@prisma/client'
import {
  createSubscriptionPayment,
  SUBSCRIPTION_PLANS,
  type PlanId,
} from '@/lib/services/payment/multisafepay'

// Duur van abonnementen in dagen
const PLAN_DURATION: Record<string, number> = {
  FREE: 0, // Geen einddatum
  PLUS: 30, // 1 maand
  COMPLETE: 90, // 3 maanden
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Je moet ingelogd zijn' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount, couponCode } = body

    console.log('[Subscription Create] Request body:', { planId, amount, couponCode })

    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      console.error('[Subscription Create] Invalid planId:', planId, 'Available plans:', Object.keys(SUBSCRIPTION_PLANS))
      return NextResponse.json({
        error: 'Ongeldig abonnement',
        details: `Plan ID '${planId}' is niet geldig. Beschikbare plans: ${Object.keys(SUBSCRIPTION_PLANS).join(', ')}`
      }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS[planId as PlanId]

    // Handle free plan OR 100% discount with coupon
    if (plan.price === 0 || amount === 0) {
      // Determine subscription tier based on plan
      let tier: SubscriptionTier = 'FREE'
      if (planId === 'PLUS') tier = 'PLUS'
      if (planId === 'COMPLETE') tier = 'COMPLETE'

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
      if (planId !== 'FREE') {
        endDate = new Date()
        endDate.setDate(endDate.getDate() + PLAN_DURATION[planId])
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
                originalAmount: plan.price / 100,
                discountAmount: plan.price / 100,
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
        plan: { in: ['PLUS', 'COMPLETE'] },
      },
    })

    if (existingSubscription) {
      console.log('[Subscription Create] Existing subscription found:', {
        existingPlan: existingSubscription.plan,
        requestedPlan: planId
      })

      // Check if same plan
      if (existingSubscription.plan === planId) {
        return NextResponse.json(
          { error: 'Je hebt dit abonnement al' },
          { status: 400 }
        )
      }

      // Allow upgrade from PLUS to COMPLETE
      if (existingSubscription.plan === 'COMPLETE' && planId === 'PLUS') {
        return NextResponse.json(
          { error: 'Downgrade naar Liefde Plus is niet mogelijk. Annuleer eerst je Liefde Compleet abonnement.' },
          { status: 400 }
        )
      }
    }

    // Calculate end date
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + PLAN_DURATION[planId])

    // Create pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: planId,
        status: 'pending',
        endDate,
      },
    })

    // Create payment with MultiSafepay
    const { paymentUrl, orderId } = await createSubscriptionPayment(
      session.user.id,
      session.user.email,
      session.user.name || null,
      planId as PlanId,
      subscription.id
    )

    // Update subscription with MultiSafepay order ID
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { multisafepayId: orderId },
    })

    return NextResponse.json({ paymentUrl })
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
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
    id,
    name: plan.name,
    price: plan.price / 100, // Convert to euros
    period: plan.period,
    pricePerMonth: plan.period === '3months' ? (plan.price / 100) / 3 : plan.price / 100,
    features: plan.features,
  }))

  return NextResponse.json({ plans })
}
