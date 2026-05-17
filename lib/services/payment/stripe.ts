import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getPlanById } from '@/lib/pricing'

// ============================================
// CLIENT SINGLETON
// ============================================

let stripeInstance: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    })
  }
  return stripeInstance
}

// ============================================
// PRICE ID MAPPING
// ============================================

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  PREMIUM_MONTH:    'STRIPE_PRICE_PREMIUM_MONTH',
  PREMIUM_QUARTER:  'STRIPE_PRICE_PREMIUM_QUARTERLY',
  PREMIUM_HALF:     'STRIPE_PRICE_PREMIUM_HALF',
  PREMIUM_YEAR:     'STRIPE_PRICE_PREMIUM_YEAR',
  GOLD_QUARTER:     'STRIPE_PRICE_GOLD_QUARTERLY',
  GOLD_HALF:        'STRIPE_PRICE_GOLD_BIANNUAL',
  GOLD_LIFETIME:    'STRIPE_PRICE_GOLD_LIFETIME',
}

export function getPriceIdForPlan(planId: string): string {
  const envKey = PLAN_TO_PRICE_ENV[planId]
  if (!envKey) throw new Error(`No Stripe Price mapping for plan: ${planId}`)
  const priceId = process.env[envKey]
  if (!priceId) throw new Error(`Env var ${envKey} is not set`)
  return priceId
}

export function isLifetimePlan(planId: string): boolean {
  return planId === 'GOLD_LIFETIME'
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string | null,
): Promise<string> {
  const stripe = getStripeClient()

  // Check if customer already exists in DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  })

  // Persist to DB
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

// ============================================
// PAYMENT INTENT (eenmalige aankoop — credits)
// ============================================

export async function createPaymentIntent(
  customerId: string,
  amountEuros: number,
  metadata: Record<string, string>,
  idempotencyKey: string,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient()

  return stripe.paymentIntents.create(
    {
      amount: Math.round(amountEuros * 100), // cents
      currency: 'eur',
      customer: customerId,
      // Save payment method for future use (returning customers)
      setup_future_usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      metadata,
    },
    { idempotencyKey },
  )
}

// ============================================
// SUBSCRIPTION (recurring)
// ============================================

export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string>,
  idempotencyKey: string,
): Promise<{ subscriptionId: string; clientSecret: string }> {
  const stripe = getStripeClient()

  const subscription = await stripe.subscriptions.create(
    {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        // No payment_method_types specified: Stripe automatically handles iDEAL
        // via the mandate flow (iDEAL first payment → SEPA Direct Debit mandate
        // for recurring charges). Explicit listing of 'ideal' would cause a
        // Stripe error because redirect-based methods need the mandate approach.
      },
      // Expand payments so we can fall back to the payment_intent if
      // confirmation_secret is not yet populated for this account
      expand: ['latest_invoice.payments'],
      metadata,
    },
    { idempotencyKey },
  )

  const invoice = subscription.latest_invoice as Stripe.Invoice
  let clientSecret: string | null = invoice.confirmation_secret?.client_secret ?? null

  if (!clientSecret) {
    // Fall back to the default InvoicePayment's PaymentIntent (v22 payments list)
    const payments = invoice.payments as Stripe.ApiList<Stripe.InvoicePayment> | undefined
    const defaultPayment = payments?.data?.find(p => p.is_default) ?? payments?.data?.[0]
    const piField = defaultPayment?.payment?.payment_intent

    if (piField) {
      const piId = typeof piField === 'string' ? piField : piField.id

      // Add iDEAL to the PaymentIntent so it appears in the Payment Element.
      // iDEAL with setup_future_usage:'off_session' → Stripe auto-creates a
      // SEPA Direct Debit mandate, which handles all future recurring charges.
      // (We can't put iDEAL in subscription payment_method_types because that
      //  path uses charge_automatically, which blocks redirect methods.)
      await stripe.paymentIntents.update(piId, {
        payment_method_types: ['card', 'ideal', 'sepa_debit'],
        payment_method_options: {
          ideal: { setup_future_usage: 'off_session' },
          sepa_debit: { setup_future_usage: 'off_session' },
        },
      })

      const pi = await stripe.paymentIntents.retrieve(piId)
      clientSecret = pi.client_secret
    }
  }

  if (!clientSecret) {
    throw new Error('Stripe subscription heeft geen client_secret teruggegeven')
  }

  return {
    subscriptionId: subscription.id,
    clientSecret,
  }
}

// Lifetime = één-malige PaymentIntent, niet recurring
export async function createLifetimePaymentIntent(
  customerId: string,
  priceId: string,
  metadata: Record<string, string>,
  idempotencyKey: string,
): Promise<{ clientSecret: string }> {
  const stripe = getStripeClient()

  // Haal price op voor het bedrag
  const price = await stripe.prices.retrieve(priceId)
  if (!price.unit_amount) throw new Error('Lifetime price heeft geen unit_amount')

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: price.unit_amount,
      currency: 'eur',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata,
    },
    { idempotencyKey },
  )

  if (!paymentIntent.client_secret) throw new Error('Geen client_secret ontvangen')
  return { clientSecret: paymentIntent.client_secret }
}

// ============================================
// SUBSCRIPTION ANNULEREN
// ============================================

export async function cancelStripeSubscription(
  stripeSubscriptionId: string,
): Promise<void> {
  const stripe = getStripeClient()
  // cancel_at_period_end = gebruiker houdt toegang tot einde periode
  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  })
}

// ============================================
// BILLING PORTAL
// ============================================

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const stripe = getStripeClient()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}

// ============================================
// WEBHOOK SIGNATURE VERIFICATIE
// ============================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  return getStripeClient().webhooks.constructEvent(payload, signature, secret)
}

// ============================================
// HELPERS
// ============================================

export function stripeAmountToEuros(amount: number): number {
  return amount / 100
}

export function getSubscriptionTierForPlan(planId: string): 'FREE' | 'PREMIUM' | 'GOLD' {
  const plan = getPlanById(planId)
  if (!plan) return 'FREE'
  return plan.tier
}
