import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier } from '@prisma/client'
import {
  createSubscriptionSetupIntent,
  createLifetimePaymentIntent,
  getOrCreateStripeCustomer,
  getPriceIdForPlan,
  isLifetimePlan,
} from '@/lib/services/payment/stripe'
import {
  getPlanById,
  getPlanDurationDays,
  SUBSCRIPTION_PLANS,
  LEGACY_PLAN_MAP,
} from '@/lib/pricing'

/**
 * Berekent het definitieve bedrag server-side door de coupon te valideren.
 * Retourneert altijd de originele prijs als de coupon ongeldig is (fail-safe).
 */
async function computeDiscountedPrice(
  originalPrice: number,
  couponCode: string,
  userId: string,
): Promise<number> {
  try {
    const now = new Date()
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
      include: { usages: { where: { userId }, select: { id: true } } },
    })

    if (!coupon || !coupon.isActive) return originalPrice
    if (coupon.validFrom && coupon.validFrom > now) return originalPrice
    if (coupon.validUntil && coupon.validUntil < now) return originalPrice
    if (coupon.applicableTo === 'CREDITS') return originalPrice
    if (coupon.minPurchaseAmount && originalPrice < coupon.minPurchaseAmount) return originalPrice
    if (coupon.maxTotalUses && coupon.currentTotalUses >= coupon.maxTotalUses) return originalPrice
    if (coupon.usages.length >= coupon.maxUsesPerUser) return originalPrice

    let discount = 0
    if (coupon.type === 'PERCENTAGE') {
      discount = (originalPrice * coupon.value) / 100
      if (coupon.maxDiscountCap && discount > coupon.maxDiscountCap) {
        discount = coupon.maxDiscountCap
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = Math.min(coupon.value, originalPrice)
    }

    return Math.max(originalPrice - discount, 0)
  } catch {
    return originalPrice
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Je moet ingelogd zijn' }, { status: 401 })
    }

    const body = await request.json()
    const { planId: rawPlanId, couponCode } = body

    // Map legacy plan IDs naar nieuw formaat
    const planId = LEGACY_PLAN_MAP[rawPlanId] || rawPlanId

    const plan = getPlanById(planId)
    if (!plan) {
      const availablePlans = SUBSCRIPTION_PLANS.map(p => p.id).join(', ')
      return NextResponse.json({
        error: 'Ongeldig abonnement',
        details: `Plan ID '${planId}' is niet geldig. Beschikbare plans: ${availablePlans}`,
      }, { status: 400 })
    }

    const tier: SubscriptionTier = plan.tier

    // --------------------------------------------------------
    // Server-side prijsberekening (nooit de client vertrouwen)
    // --------------------------------------------------------
    const finalAmount = plan.price > 0 && couponCode
      ? await computeDiscountedPrice(plan.price, couponCode.toUpperCase(), session.user.id)
      : plan.price

    // --------------------------------------------------------
    // Gratis plan of 100% coupon korting → direct activeren
    // --------------------------------------------------------
    if (plan.price === 0 || finalAmount === 0) {
      await prisma.subscription.updateMany({
        where: { userId: session.user.id, status: 'active' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      })

      await prisma.user.update({
        where: { id: session.user.id },
        data: { subscriptionTier: tier },
      })

      let endDate: Date | undefined
      if (tier !== 'FREE') {
        const durationDays = getPlanDurationDays(planId)
        endDate = new Date()
        endDate.setDate(endDate.getDate() + durationDays)
      }

      const subscription = await prisma.subscription.create({
        data: { userId: session.user.id, plan: planId, status: 'active', endDate },
      })

      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
        if (coupon) {
          await prisma.$transaction(async (tx) => {
            await tx.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: session.user.id,
                orderType: 'subscription',
                orderId: subscription.id,
                originalAmount: plan.price,
                discountAmount: plan.price,
                finalAmount: 0,
              },
            })
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { currentTotalUses: { increment: 1 } },
            })
          })
        }
      }

      const message = finalAmount === 0 && couponCode
        ? `${plan.name} gratis geactiveerd met couponcode!`
        : 'Basis abonnement geactiveerd'
      return NextResponse.json({ success: true, message })
    }

    // --------------------------------------------------------
    // Betaald plan — valideer bestaand abonnement
    // --------------------------------------------------------
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: 'active' },
    })

    if (existingSubscription) {
      const existingPlan = getPlanById(existingSubscription.plan)

      if (existingSubscription.plan === planId) {
        return NextResponse.json({ error: 'Je hebt dit abonnement al' }, { status: 400 })
      }

      if (existingPlan?.tier === 'GOLD' && tier === 'PREMIUM') {
        return NextResponse.json(
          { error: 'Downgrade naar Premium is niet mogelijk. Annuleer eerst je Gold abonnement.' },
          { status: 400 },
        )
      }
    }

    // Maak pending subscription record aan
    const subscription = await prisma.subscription.create({
      data: { userId: session.user.id, plan: planId, status: 'pending' },
    })

    // Stripe customer ophalen of aanmaken
    const stripeCustomerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      session.user.name ?? null,
    )

    const metadata: Record<string, string> = {
      userId: session.user.id,
      planId,
      subscriptionId: subscription.id,
      ...(couponCode ? { couponCode: couponCode.toUpperCase() } : {}),
    }

    let clientSecret: string
    let stripeSubscriptionId: string | undefined
    const priceId = getPriceIdForPlan(planId)

    if (isLifetimePlan(planId)) {
      // Eenmalige betaling voor lifetime
      const result = await createLifetimePaymentIntent(
        stripeCustomerId,
        priceId,
        { ...metadata, credits: '0', purchaseId: subscription.id },
        subscription.id,
      )
      clientSecret = result.clientSecret
    } else {
      // Recurring subscription — SetupIntent flow:
      // 1. Collect payment method via SetupIntent (supports iDEAL → SEPA mandate)
      // 2. After confirmation: /api/subscription/activate creates the subscription
      const result = await createSubscriptionSetupIntent(
        stripeCustomerId,
        metadata,
        `setup_${subscription.id}`,
      )
      clientSecret = result.clientSecret
      // stripeSubscriptionId is set in /api/subscription/activate after payment
    }

    // Sla Stripe IDs op in subscription record
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripePriceId: priceId,
        ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      clientSecret,
      subscriptionId: subscription.id,
    })
  } catch (error) {
    console.error('[Subscription] Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het opnieuw.' },
      { status: 500 },
    )
  }
}

/**
 * GET /api/subscription/create — beschikbare abonnementsplannen
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
    isLifetime: plan.isLifetime,
  }))

  return NextResponse.json({ plans })
}
