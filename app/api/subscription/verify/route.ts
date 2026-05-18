import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { getStripeClient, getSubscriptionTierForPlan } from '@/lib/services/payment/stripe'

/**
 * GET /api/subscription/verify
 *
 * Controleer status van een subscription na Stripe redirect.
 * Stripe stuurt de gebruiker terug naar /subscription/success met session_id of payment_intent,
 * maar de webhook is de primaire activeringsmethode.
 * Deze route geeft de huidige DB-status terug als fallback.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    // Accepteer zowel subscription_id als order_id (success page stuurt order_id)
    const subscriptionId = searchParams.get('subscription_id') ?? searchParams.get('order_id')
    const paymentIntentId = searchParams.get('payment_intent')

    // Zoek de subscription op
    let subscription = subscriptionId
      ? await prisma.subscription.findFirst({
          where: { id: subscriptionId, userId: user.id },
        })
      : await prisma.subscription.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        })

    if (!subscription) {
      throw new Error('Subscription niet gevonden')
    }

    if (subscription.userId !== user.id) {
      throw new Error('Niet geautoriseerd')
    }

    // Controleer via Stripe als subscription nog pending is
    if (subscription.status === 'pending' && subscription.stripeSubscriptionId) {
      try {
        const stripe = getStripeClient()
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

        if (stripeSub.status === 'active') {
          const tier = getSubscriptionTierForPlan(subscription.plan)
          const itemPeriodEnd = stripeSub.items.data[0]?.current_period_end
          const [updatedSub] = await prisma.$transaction([
            prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'active',
                ...(itemPeriodEnd ? {
                  stripeCurrentPeriodEnd: new Date(itemPeriodEnd * 1000),
                  endDate: new Date(itemPeriodEnd * 1000),
                } : {}),
              },
            }),
            prisma.user.update({
              where: { id: user.id },
              data: { subscriptionTier: tier },
            }),
          ])
          subscription = updatedSub
        }
      } catch (err) {
        console.error('[Subscription Verify] Stripe check mislukt:', err)
      }
    }

    // Controleer via PaymentIntent (voor lifetime aankopen en fallback)
    if (subscription.status === 'pending' && paymentIntentId) {
      try {
        const stripe = getStripeClient()
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

        if (pi.status === 'succeeded') {
          const tier = getSubscriptionTierForPlan(subscription.plan)
          const [updatedSub] = await prisma.$transaction([
            prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: 'active' },
            }),
            prisma.user.update({
              where: { id: user.id },
              data: { subscriptionTier: tier },
            }),
          ])
          subscription = updatedSub
        }
      } catch (err) {
        console.error('[Subscription Verify] PaymentIntent check mislukt:', err)
      }
    }

    return successResponse({ subscription, message: 'Status opgehaald' })
  } catch (error) {
    return handleApiError(error)
  }
}
