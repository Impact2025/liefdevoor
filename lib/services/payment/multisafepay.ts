/**
 * MultiSafepay Payment Service
 *
 * Handles all payment operations:
 * - Creating orders (iDEAL, creditcard, Bancontact)
 * - SEPA Direct Debit (automatische incasso)
 * - Webhook verification
 * - Transaction status checks
 * - Recurring subscriptions
 * - Refunds
 */

import crypto from 'crypto'
import { BILLING_PERIODS, type BillingPeriod } from '@/lib/pricing'

// Types
export type PaymentMethod = 'ideal' | 'creditcard' | 'bancontact' | 'directdebit'

export interface MultiSafepayOrder {
  type: 'redirect' | 'direct' | 'recurring'
  order_id: string
  currency: 'EUR'
  amount: number
  description: string
  gateway?: PaymentMethod // Specifieke betaalmethode
  payment_options: {
    notification_url: string
    redirect_url: string
    cancel_url: string
  }
  customer?: {
    email: string
    first_name?: string
    last_name?: string
    locale?: string
    address1?: string
    city?: string
    country?: string
    phone?: string
  }
  gateway_info?: {
    // Voor SEPA Direct Debit
    account_id?: string // IBAN
    account_holder_name?: string
    account_holder_iban?: string
    emandate?: string // E-mandate reference
  }
  recurring_model?: 'cardOnFile' | 'subscription' | 'unscheduled'
  recurring_id?: string
  // Voor recurring SEPA
  recurring_flow?: 'token'
  days_active?: number // Aantal dagen dat de betaallink actief is
}

export interface MultiSafepayResponse {
  success: boolean
  data?: {
    order_id: string
    payment_url?: string
    transaction_id?: string
    status?: string
    amount?: number
    currency?: string
    created?: string
    payment_details?: {
      recurring_id?: string
      type?: string
      account_holder_name?: string
      last4?: string
      card_expiry_date?: string
    }
  }
  error_code?: number
  error_info?: string
}

export interface MultiSafepayWebhookPayload {
  transactionid: string
  order_id: string
  status: string
  amount: number
  currency: string
  timestamp: number
  var1?: string
  var2?: string
  var3?: string
}

// Import plan configuration from central pricing file
import { getPlanById, type SubscriptionPlan, LEGACY_PLAN_MAP } from '@/lib/pricing'

// Re-export for backwards compatibility
export { getPlanById, type SubscriptionPlan }

// Legacy SUBSCRIPTION_PLANS export for backwards compatibility
// New code should use getPlanById() from @/lib/pricing
export const SUBSCRIPTION_PLANS = {
  FREE: { id: 'FREE', name: 'Gratis', price: 0, period: 'month' as const, features: [] },
  PREMIUM: { id: 'PREMIUM_QUARTER', name: 'Premium', price: 2999, period: '3months' as const, features: [] },
  GOLD: { id: 'GOLD_QUARTER', name: 'Gold', price: 4499, period: '3months' as const, features: [] },
} as const

export type PlanId = 'FREE' | 'PREMIUM' | 'GOLD' | string // Extended to support new plan IDs

/**
 * MultiSafepay API Client
 */
class MultiSafepayClient {
  private apiKey: string
  private baseUrl: string
  private webhookSecret: string

  constructor() {
    this.apiKey = process.env.MULTISAFEPAY_API_KEY || ''
    this.webhookSecret = process.env.MULTISAFEPAY_WEBHOOK_SECRET || ''
    this.baseUrl = process.env.MULTISAFEPAY_TEST_MODE === 'true'
      ? 'https://testapi.multisafepay.com/v1/json'
      : 'https://api.multisafepay.com/v1/json'
  }

  /**
   * Make API request
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok || data.success === false) {
      throw new Error(data.error_info || 'MultiSafepay API error')
    }

    return data
  }

  /**
   * Create a new payment order
   */
  async createOrder(order: MultiSafepayOrder): Promise<MultiSafepayResponse> {
    return this.request<MultiSafepayResponse>('POST', '/orders', order)
  }

  /**
   * Get order/transaction status
   */
  async getOrder(orderId: string): Promise<MultiSafepayResponse> {
    return this.request<MultiSafepayResponse>('GET', `/orders/${orderId}`)
  }

  /**
   * Create recurring payment (for subscription renewals)
   */
  async createRecurringPayment(
    recurringId: string,
    amount: number,
    orderId: string,
    description: string
  ): Promise<MultiSafepayResponse> {
    return this.request<MultiSafepayResponse>('POST', '/orders', {
      type: 'direct',
      order_id: orderId,
      currency: 'EUR',
      amount,
      description,
      recurring_model: 'subscription',
      recurring_id: recurringId,
      payment_options: {
        notification_url: `${(process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/subscription/webhook`,
        redirect_url: `${(process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/subscription/success`,
        cancel_url: `${(process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/subscription/cancel`,
      },
    })
  }

  /**
   * Cancel/refund an order
   */
  async refundOrder(
    orderId: string,
    amount: number,
    description: string
  ): Promise<MultiSafepayResponse> {
    return this.request<MultiSafepayResponse>('POST', `/orders/${orderId}/refunds`, {
      currency: 'EUR',
      amount,
      description,
    })
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    if (!this.webhookSecret) {
      console.warn('[MultiSafepay] Webhook secret not configured')
      return true // Skip verification if not configured
    }

    const expectedSignature = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(body: MultiSafepayWebhookPayload): {
    transactionId: string
    orderId: string
    status: PaymentStatus
    amount: number
    timestamp: Date
  } {
    return {
      transactionId: body.transactionid,
      orderId: body.order_id,
      status: this.mapStatus(body.status),
      amount: body.amount,
      timestamp: new Date(body.timestamp * 1000),
    }
  }

  /**
   * Map MultiSafepay status to internal status
   */
  private mapStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      completed: 'completed',
      initialized: 'pending',
      uncleared: 'pending',
      declined: 'failed',
      cancelled: 'cancelled',
      void: 'cancelled',
      expired: 'expired',
      refunded: 'refunded',
      partial_refunded: 'refunded',
      reserved: 'pending',
      chargedback: 'chargedback',
    }

    return statusMap[status.toLowerCase()] || 'unknown'
  }
}

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'chargedback'
  | 'unknown'

// Singleton instance
let client: MultiSafepayClient | null = null

export function getMultiSafepayClient(): MultiSafepayClient {
  if (!client) {
    client = new MultiSafepayClient()
  }
  return client
}

/**
 * Create subscription payment
 *
 * @param userId - User ID
 * @param userEmail - User email
 * @param userName - User name
 * @param planId - Plan ID (new format: PLUS_MONTH, COMPLETE_YEAR, etc. or legacy: PLUS, COMPLETE)
 * @param subscriptionId - Subscription ID
 * @param paymentMethod - Payment method (ideal, creditcard, bancontact, directdebit)
 */
export async function createSubscriptionPayment(
  userId: string,
  userEmail: string,
  userName: string | null,
  planId: PlanId,
  subscriptionId: string,
  paymentMethod: PaymentMethod = 'ideal'
): Promise<{ paymentUrl: string; orderId: string; isDirectDebit?: boolean }> {
  // Get plan from central pricing (supports legacy IDs)
  const plan = getPlanById(planId)

  if (!plan || plan.price === 0) {
    throw new Error('Invalid or free plan')
  }

  const client = getMultiSafepayClient()
  const nameParts = userName?.split(' ') || ['']
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')

  // Convert price from euros to cents
  const amountInCents = Math.round(plan.price * 100)

  // Base order configuration
  const order: MultiSafepayOrder = {
    type: paymentMethod === 'directdebit' ? 'redirect' : 'redirect',
    order_id: subscriptionId,
    currency: 'EUR',
    amount: amountInCents,
    description: `${plan.name} (${plan.periodLabel}) - Liefde Voor Iedereen`,
    gateway: paymentMethod === 'directdebit' ? 'directdebit' : undefined,
    payment_options: {
      notification_url: `${baseUrl}/api/subscription/webhook`,
      redirect_url: `${baseUrl}/subscription/success?order_id=${subscriptionId}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
    },
    customer: {
      email: userEmail,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || undefined,
      locale: 'nl_NL',
    },
    recurring_model: 'subscription',
    days_active: 7, // Link is 7 dagen geldig
  }

  // SEPA Direct Debit specifieke configuratie
  if (paymentMethod === 'directdebit') {
    // Voor SEPA moeten we een e-mandate aanmaken
    // De klant geeft toestemming voor automatische incasso
    order.gateway = 'directdebit'
    order.recurring_flow = 'token' // Gebruik tokenisatie voor recurring
  }

  const response = await client.createOrder(order)

  if (!response.data?.payment_url) {
    throw new Error('No payment URL received')
  }

  return {
    paymentUrl: response.data.payment_url,
    orderId: response.data.order_id,
    isDirectDebit: paymentMethod === 'directdebit',
  }
}

/**
 * Create a SEPA Direct Debit mandate
 * Dit is een eerste betaling waarbij de klant toestemming geeft voor automatische incasso
 */
export async function createDirectDebitMandate(
  userId: string,
  userEmail: string,
  userName: string | null,
  planId: string,
  subscriptionId: string,
  iban?: string,
  accountHolderName?: string
): Promise<{ paymentUrl: string; orderId: string; mandateId?: string }> {
  const plan = getPlanById(planId)

  if (!plan || plan.price === 0) {
    throw new Error('Invalid or free plan')
  }

  const client = getMultiSafepayClient()
  const nameParts = userName?.split(' ') || ['']
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
  const amountInCents = Math.round(plan.price * 100)

  const order: MultiSafepayOrder = {
    type: 'redirect',
    order_id: subscriptionId,
    currency: 'EUR',
    amount: amountInCents,
    description: `Automatische incasso machtiging - ${plan.name} (${plan.periodLabel})`,
    gateway: 'directdebit',
    payment_options: {
      notification_url: `${baseUrl}/api/subscription/webhook`,
      redirect_url: `${baseUrl}/subscription/success?order_id=${subscriptionId}&direct_debit=true`,
      cancel_url: `${baseUrl}/subscription/cancel`,
    },
    customer: {
      email: userEmail,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || undefined,
      locale: 'nl_NL',
    },
    recurring_model: 'subscription',
    recurring_flow: 'token',
  }

  // Als IBAN al bekend is, voeg toe aan gateway_info
  if (iban && accountHolderName) {
    order.gateway_info = {
      account_holder_name: accountHolderName,
      account_holder_iban: iban,
    }
  }

  const response = await client.createOrder(order)

  if (!response.data?.payment_url) {
    throw new Error('No payment URL received')
  }

  return {
    paymentUrl: response.data.payment_url,
    orderId: response.data.order_id,
    mandateId: response.data.payment_details?.recurring_id,
  }
}

/**
 * Process recurring subscription renewal
 */
export async function processRecurringPayment(
  recurringId: string,
  amount: number,
  newOrderId: string,
  description: string
): Promise<{ success: boolean; transactionId?: string }> {
  const client = getMultiSafepayClient()

  try {
    const response = await client.createRecurringPayment(
      recurringId,
      amount,
      newOrderId,
      description
    )

    return {
      success: response.success,
      transactionId: response.data?.transaction_id,
    }
  } catch (error) {
    console.error('[MultiSafepay] Recurring payment failed:', error)
    return { success: false }
  }
}

/**
 * Verify transaction status
 */
export async function verifyTransactionStatus(
  orderId: string
): Promise<{ status: PaymentStatus; recurringId?: string }> {
  const client = getMultiSafepayClient()

  try {
    const response = await client.getOrder(orderId)
    const status = response.data?.status || 'unknown'

    return {
      status: client['mapStatus'](status),
      recurringId: response.data?.payment_details?.recurring_id,
    }
  } catch (error) {
    console.error('[MultiSafepay] Status check failed:', error)
    return { status: 'unknown' }
  }
}

/**
 * Process refund
 */
export async function processRefund(
  orderId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean }> {
  const client = getMultiSafepayClient()

  try {
    await client.refundOrder(orderId, amount, reason)
    return { success: true }
  } catch (error) {
    console.error('[MultiSafepay] Refund failed:', error)
    return { success: false }
  }
}
