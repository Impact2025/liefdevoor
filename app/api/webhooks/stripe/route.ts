import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import React from 'react'
import { render } from '@react-email/render'
import { constructWebhookEvent, getSubscriptionTierForPlan, stripeAmountToEuros } from '@/lib/services/payment/stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import PaymentConfirmationEmail from '@/lib/email/templates/transactional/payment-confirmation'
import PaymentFailedEmail from '@/lib/email/templates/transactional/payment-failed'
import SubscriptionRenewedEmail from '@/lib/email/templates/transactional/subscription-renewed'

export const runtime = 'nodejs'

// Stripe vereist de raw request body voor signature verificatie
export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Geen stripe-signature header' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET niet geconfigureerd')
      return NextResponse.json({ error: 'Webhook niet geconfigureerd' }, { status: 500 })
    }

    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    console.error('[Stripe Webhook] Signature verificatie mislukt:', message)
    return NextResponse.json({ error: `Webhook fout: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        // Onbekende events stilletjes negeren
        break
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Fout bij verwerken van ${event.type}:`, err)
    // Geef 200 terug zodat Stripe niet blijft retrien voor verwerkingsfouten
    return NextResponse.json({ received: true, warning: 'Verwerkingsfout gelogd' })
  }

  return NextResponse.json({ received: true })
}

// ============================================
// HANDLER: payment_intent.succeeded (credits)
// ============================================

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { purchaseId, userId, credits } = paymentIntent.metadata ?? {}
  if (!purchaseId || !userId || !credits) return // Subscription PI — wordt via invoice.paid afgehandeld

  const creditsCount = parseInt(credits, 10)

  // Idempotentie: al verwerkt?
  const existing = await prisma.creditPurchase.findUnique({
    where: { id: purchaseId },
    select: { status: true },
  })
  if (!existing || existing.status === 'completed') return

  const { couponCode, packId } = paymentIntent.metadata ?? {}

  await prisma.$transaction(async (tx) => {
    await tx.creditPurchase.update({
      where: { id: purchaseId },
      data: {
        status: 'completed',
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: paymentIntent.payment_method_types?.[0] ?? null,
        completedAt: new Date(),
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: creditsCount } },
    })

    // Verwerk coupon gebruik als aanwezig
    if (couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: couponCode } })
      if (coupon) {
        const originalAmount = paymentIntent.amount / 100
        const finalAmount = originalAmount // discount al verwerkt voor PI aanmaken
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId,
            orderType: 'credits',
            orderId: purchaseId,
            originalAmount,
            discountAmount: 0,
            finalAmount,
          },
        })
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { currentTotalUses: { increment: 1 } },
        })
      }
    }
  })

  // Bevestigingsmail (non-blocking)
  sendConfirmationEmailForCredits(userId, creditsCount, paymentIntent).catch(console.error)
}

// ============================================
// HANDLER: payment_intent.payment_failed (credits)
// ============================================

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { purchaseId, userId } = paymentIntent.metadata ?? {}
  if (!purchaseId || !userId) return

  await prisma.creditPurchase.updateMany({
    where: { id: purchaseId, status: 'pending' },
    data: { status: 'failed' },
  })

  sendFailureEmail(userId, paymentIntent).catch(console.error)
}

// ============================================
// HANDLER: customer.subscription.created/updated
// ============================================

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  const { userId, planId } = stripeSubscription.metadata ?? {}
  if (!userId || !planId) return

  const status = mapStripeStatus(stripeSubscription.status)
  const tier = getSubscriptionTierForPlan(planId)
  const rawPeriodEnd = stripeSubscription.items.data[0]?.current_period_end
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null

  // Idempotentie: check op stripeSubscriptionId
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  })

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status,
        ...(periodEnd ? { stripeCurrentPeriodEnd: periodEnd, endDate: periodEnd } : {}),
        updatedAt: new Date(),
      },
    })
  } else {
    // Koppel aan bestaand pending record van dezelfde user
    const pendingSub = await prisma.subscription.findFirst({
      where: { userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    })

    if (pendingSub) {
      await prisma.subscription.update({
        where: { id: pendingSub.id },
        data: {
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: stripeSubscription.items.data[0]?.price?.id ?? null,
          status,
          ...(periodEnd ? { stripeCurrentPeriodEnd: periodEnd, endDate: periodEnd } : {}),
          updatedAt: new Date(),
        },
      })
    }
  }

  // Tier bijwerken bij activatie
  if (status === 'active') {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    })
  }
}

// ============================================
// HANDLER: customer.subscription.deleted
// ============================================

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const { userId } = stripeSubscription.metadata ?? {}
  if (!userId) return

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubscription.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Terug naar FREE
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: 'FREE' },
  })
}

// ============================================
// HANDLER: invoice.paid (verlenging)
// ============================================

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subRef = invoice.parent?.subscription_details?.subscription
  const stripeSubscriptionId = typeof subRef === 'string' ? subRef : subRef?.id

  if (!stripeSubscriptionId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!subscription) return

  const periodEnd = invoice.lines.data[0]?.period?.end
  if (periodEnd) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
        endDate: new Date(periodEnd * 1000),
        updatedAt: new Date(),
      },
    })
  }

  // Vernieuwingsmail (non-blocking)
  if (subscription.user?.email) {
    const userWithEmail = subscription.user as { id: string; name: string | null; email: string }
    const nextPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null
    sendRenewalEmail(userWithEmail, subscription.plan, invoice, nextPeriodEnd).catch(console.error)
  }
}

// ============================================
// HANDLER: invoice.payment_failed
// ============================================

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subRef = invoice.parent?.subscription_details?.subscription
  const stripeSubscriptionId = typeof subRef === 'string' ? subRef : subRef?.id

  if (!stripeSubscriptionId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!subscription?.user?.email) return

  const userWithEmail = subscription.user as { id: string; name: string | null; email: string }
  sendFailureEmailForSubscription(userWithEmail, subscription.plan, invoice).catch(console.error)
}

// ============================================
// STATUS MAPPING
// ============================================

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
      return 'cancelled'
    case 'incomplete':
    case 'incomplete_expired':
      return 'pending'
    default:
      return 'pending'
  }
}

// ============================================
// EMAIL HELPERS
// ============================================

async function sendConfirmationEmailForCredits(
  userId: string,
  credits: number,
  paymentIntent: Stripe.PaymentIntent,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })
  if (!user?.email) return

  const html = await render(
    React.createElement(PaymentConfirmationEmail, {
      userName: user.name ?? 'daar',
      planName: `${credits} Super Likes`,
      amount: `€${stripeAmountToEuros(paymentIntent.amount).toFixed(2).replace('.', ',')}`,
      transactionId: paymentIntent.id,
    }),
  )

  await sendEmail({
    to: user.email,
    subject: `✓ Je ${credits} Super Likes zijn bijgeschreven!`,
    html,
    category: 'PAYMENT_CREDITS',
    userId,
  })
}

async function sendFailureEmail(userId: string, paymentIntent: Stripe.PaymentIntent) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })
  if (!user?.email) return

  const html = await render(
    React.createElement(PaymentFailedEmail, {
      userName: user.name ?? 'daar',
      planName: 'Super Likes',
      amount: `€${stripeAmountToEuros(paymentIntent.amount).toFixed(2).replace('.', ',')}`,
    } as Parameters<typeof PaymentFailedEmail>[0]),
  )

  await sendEmail({
    to: user.email,
    subject: 'Betaling mislukt — probeer het opnieuw',
    html,
    category: 'PAYMENT_FAILED',
    userId,
  })
}

async function sendRenewalEmail(
  user: { id: string; name: string | null; email: string },
  planId: string,
  invoice: Stripe.Invoice,
  nextPeriodEnd: Date | null,
) {
  const nextRenewalDate = nextPeriodEnd
    ? nextPeriodEnd.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const html = await render(
    React.createElement(SubscriptionRenewedEmail, {
      userName: user.name ?? 'daar',
      planName: planId,
      amount: `€${stripeAmountToEuros(invoice.amount_paid).toFixed(2).replace('.', ',')}`,
      nextRenewalDate,
    }),
  )

  await sendEmail({
    to: user.email,
    subject: 'Je abonnement is verlengd',
    html,
    category: 'SUBSCRIPTION_RENEWED',
    userId: user.id,
  })
}

async function sendFailureEmailForSubscription(
  user: { id: string; name: string | null; email: string },
  planId: string,
  invoice: Stripe.Invoice,
) {
  const html = await render(
    React.createElement(PaymentFailedEmail, {
      userName: user.name ?? 'daar',
      planName: planId,
      amount: `€${stripeAmountToEuros(invoice.amount_due).toFixed(2).replace('.', ',')}`,
    } as Parameters<typeof PaymentFailedEmail>[0]),
  )

  await sendEmail({
    to: user.email,
    subject: 'Betaling mislukt — je abonnement loopt af',
    html,
    category: 'SUBSCRIPTION_PAYMENT_FAILED',
    userId: user.id,
  })
}
