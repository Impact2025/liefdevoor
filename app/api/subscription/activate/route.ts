import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getStripeClient,
  getOrCreateStripeCustomer,
  getPriceIdForPlan,
  createSubscriptionFromPaymentMethod,
} from '@/lib/services/payment/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Je moet ingelogd zijn' }, { status: 401 })
    }

    const { setupIntentId, subscriptionDbId } = await request.json()
    if (!setupIntentId || !subscriptionDbId) {
      return NextResponse.json({ error: 'Ontbrekende parameters' }, { status: 400 })
    }

    const dbSubscription = await prisma.subscription.findFirst({
      where: { id: subscriptionDbId, userId: session.user.id },
    })
    if (!dbSubscription) {
      return NextResponse.json({ error: 'Abonnement niet gevonden' }, { status: 404 })
    }

    // Idempotent: already activated by a previous call or webhook
    if (dbSubscription.stripeSubscriptionId) {
      return NextResponse.json({ success: true })
    }

    const stripe = getStripeClient()
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)

    // Verify the SetupIntent belongs to this user's Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      session.user.name ?? null,
    )
    if (setupIntent.customer !== stripeCustomerId) {
      return NextResponse.json({ error: 'Ongeautoriseerde toegang' }, { status: 403 })
    }

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Betaling nog niet voltooid' }, { status: 400 })
    }

    const paymentMethodId = typeof setupIntent.payment_method === 'string'
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Geen betaalmethode gevonden' }, { status: 400 })
    }

    const planId = dbSubscription.plan
    const priceId = getPriceIdForPlan(planId)

    const metadata: Record<string, string> = {
      userId: session.user.id,
      planId,
      subscriptionId: subscriptionDbId,
    }
    // Preserve coupon code from SetupIntent metadata for webhook processing
    const siMeta = setupIntent.metadata as Record<string, string>
    if (siMeta?.couponCode) metadata.couponCode = siMeta.couponCode

    const { subscriptionId: stripeSubscriptionId } = await createSubscriptionFromPaymentMethod(
      stripeCustomerId,
      priceId,
      paymentMethodId,
      metadata,
      `activate_${subscriptionDbId}`,
    )

    // Store stripeSubscriptionId — webhook (customer.subscription.created) sets status to active
    await prisma.subscription.update({
      where: { id: subscriptionDbId },
      data: {
        stripeSubscriptionId,
        stripePriceId: priceId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Subscription] Error activating subscription:', error)
    return NextResponse.json(
      { error: 'Activatie mislukt. Probeer het opnieuw.' },
      { status: 500 },
    )
  }
}
