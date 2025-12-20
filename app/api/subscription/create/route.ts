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

    const { planId } = await request.json()

    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json({ error: 'Ongeldig abonnement' }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS[planId as PlanId]

    // Handle free plan
    if (plan.price === 0) {
      // Cancel any existing subscription first
      await prisma.subscription.updateMany({
        where: { userId: session.user.id, status: 'active' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      })

      // Update user's subscription tier
      await prisma.user.update({
        where: { id: session.user.id },
        data: { subscriptionTier: 'FREE' as SubscriptionTier },
      })

      // Create free subscription record
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: planId,
          status: 'active',
        },
      })

      return NextResponse.json({ success: true, message: 'Basis abonnement geactiveerd' })
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
