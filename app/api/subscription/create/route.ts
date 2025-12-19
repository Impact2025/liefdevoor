import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createSubscriptionPayment,
  SUBSCRIPTION_PLANS,
  type PlanId,
} from '@/lib/services/payment/multisafepay'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS[planId as PlanId]

    // Handle free plan
    if (plan.price === 0) {
      // Cancel any existing subscription first
      await prisma.subscription.updateMany({
        where: { userId: session.user.id, status: 'active' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      })

      // Create free subscription
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: planId,
          status: 'active',
        },
      })

      return NextResponse.json({ success: true, message: 'Basic plan activated' })
    }

    // Check for existing active paid subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        plan: { in: ['premium', 'gold'] },
      },
    })

    if (existingSubscription) {
      // Check if upgrading or same plan
      if (existingSubscription.plan === planId) {
        return NextResponse.json(
          { error: 'Je hebt dit abonnement al' },
          { status: 400 }
        )
      }

      // Allow upgrade from premium to gold
      if (existingSubscription.plan === 'gold' && planId === 'premium') {
        return NextResponse.json(
          { error: 'Downgrade naar premium is niet mogelijk. Annuleer eerst je Gold abonnement.' },
          { status: 400 }
        )
      }
    }

    // Create pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: planId,
        status: 'pending',
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
    features: plan.features,
  }))

  return NextResponse.json({ plans })
}
