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

  // Geen payment_method_types instellen → Stripe gebruikt automatische betaalmethode-detectie.
  // Voor NL-klanten met EUR toont PaymentElement dan automatisch iDEAL, kaart en SEPA-incasso.
  // iDEAL-betaling maakt een SEPA-mandaat aan → Stripe charget toekomstige termijnen via SEPA.
  const subscription = await stripe.subscriptions.create(
    {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent', 'latest_invoice.payments'],
      metadata,
    },
    { idempotencyKey },
  )

  const invoice = subscription.latest_invoice as Stripe.Invoice
  let clientSecret: string | null = null

  // Pad 1: confirmation_secret (nieuwste Stripe API — dahlia)
  if (invoice.confirmation_secret?.client_secret) {
    clientSecret = invoice.confirmation_secret.client_secret
  }

  // Pad 2: direct expanded payment_intent
  if (!clientSecret) {
    const invoiceAny = invoice as unknown as Record<string, unknown>
    const pi = invoiceAny['payment_intent'] as Stripe.PaymentIntent | string | null | undefined
    if (pi && typeof pi === 'object' && (pi as Stripe.PaymentIntent).client_secret) {
      clientSecret = (pi as Stripe.PaymentIntent).client_secret
    } else if (pi && typeof pi === 'string') {
      const retrieved = await stripe.paymentIntents.retrieve(pi)
      clientSecret = retrieved.client_secret
    }
  }

  // Pad 3: invoice.payments list (legacy fallback)
  if (!clientSecret) {
    const payments = invoice.payments as Stripe.ApiList<Stripe.InvoicePayment> | undefined
    const defaultPayment = payments?.data?.find(p => p.is_default) ?? payments?.data?.[0]
    const piField = defaultPayment?.payment?.payment_intent
    if (piField) {
      const piId = typeof piField === 'string' ? piField : piField.id
      const retrieved = await stripe.paymentIntents.retrieve(piId)
      clientSecret = retrieved.client_secret
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

// ============================================
// SETUP INTENT (mandaat voor abonnement)
// ============================================

// Step 1: Collect payment method via SetupIntent (supports iDEAL → SEPA mandate)
export async function createSubscriptionSetupIntent(
  customerId: string,
  metadata: Record<string, string>,
  idempotencyKey: string,
): Promise<{ setupIntentId: string; clientSecret: string }> {
  const stripe = getStripeClient()

  const si = await stripe.setupIntents.create(
    {
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      usage: 'off_session',
      metadata,
    },
    { idempotencyKey },
  )

  if (!si.client_secret) throw new Error('Geen SetupIntent client_secret ontvangen')
  return { setupIntentId: si.id, clientSecret: si.client_secret }
}

// Step 2: Create subscription using the collected payment method
export async function createSubscriptionFromPaymentMethod(
  customerId: string,
  priceId: string,
  paymentMethodId: string,
  metadata: Record<string, string>,
  idempotencyKey: string,
): Promise<{ subscriptionId: string; status: string }> {
  const stripe = getStripeClient()

  const subscription = await stripe.subscriptions.create(
    {
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      metadata,
    },
    { idempotencyKey },
  )

  return { subscriptionId: subscription.id, status: subscription.status }
}
