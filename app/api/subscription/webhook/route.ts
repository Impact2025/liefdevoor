import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getMultiSafepayClient,
  verifyTransactionStatus,
  type PaymentStatus,
} from '@/lib/services/payment/multisafepay'

/**
 * POST /api/subscription/webhook
 *
 * Webhook to receive payment status updates from MultiSafepay
 * This is called asynchronously by the payment provider
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-multisafepay-signature') || ''

    // Verify webhook signature
    const client = getMultiSafepayClient()
    if (signature && !client.verifyWebhookSignature(rawBody, signature)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse body
    const body = JSON.parse(rawBody)

    console.log('[Webhook] Received MultiSafepay webhook:', {
      transactionId: body.transactionid,
      orderId: body.order_id,
      status: body.status,
    })

    const { transactionid, order_id, status } = body

    if (!transactionid && !order_id) {
      return NextResponse.json({ error: 'Missing transaction/order ID' }, { status: 400 })
    }

    // Find subscription by order ID or transaction ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { id: order_id },
          { multisafepayId: transactionid },
        ],
      },
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        multisafepayId: true,
      },
    })

    if (!subscription) {
      console.error('[Webhook] Subscription not found:', { order_id, transactionid })
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Map MultiSafepay status to our subscription status
    const statusMapping: Record<string, 'active' | 'cancelled' | 'pending'> = {
      completed: 'active',
      cancelled: 'cancelled',
      expired: 'cancelled',
      declined: 'cancelled',
      void: 'cancelled',
      chargedback: 'cancelled',
      initialized: 'pending',
      uncleared: 'pending',
      reserved: 'pending',
    }

    const newStatus = statusMapping[status?.toLowerCase()]

    if (!newStatus) {
      console.warn('[Webhook] Unknown payment status:', status)
      return NextResponse.json({ ok: true, message: 'Unknown status, no action taken' })
    }

    // Update subscription if status changed
    if (newStatus !== subscription.status) {
      // Get additional payment details from API
      const { recurringId } = await verifyTransactionStatus(order_id || transactionid)

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: newStatus,
          multisafepayId: transactionid || subscription.multisafepayId,
          recurringId: recurringId || undefined,
          ...(newStatus === 'active' && {
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          }),
        },
      })

      console.log('[Webhook] Updated subscription:', {
        subscriptionId: subscription.id,
        oldStatus: subscription.status,
        newStatus,
        recurringId,
      })

      // Create appropriate notification
      await createStatusNotification(
        subscription.userId,
        subscription.plan,
        newStatus
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)

    // Return 200 to prevent retries for unrecoverable errors
    return NextResponse.json({ error: 'Internal error', ok: false }, { status: 200 })
  }
}

/**
 * Create notification based on subscription status change
 */
async function createStatusNotification(
  userId: string,
  plan: string,
  status: 'active' | 'cancelled' | 'pending'
) {
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1)

  const notifications: Record<string, { title: string; message: string }> = {
    active: {
      title: 'Premium Geactiveerd!',
      message: `Je ${planName} abonnement is nu actief. Geniet van alle premium functies!`,
    },
    cancelled: {
      title: 'Abonnement Geannuleerd',
      message: `Je ${planName} abonnement is geannuleerd. Je behoudt toegang tot de einddatum.`,
    },
    pending: {
      title: 'Betaling in Behandeling',
      message: 'Je betaling wordt verwerkt. Je ontvangt een bevestiging zodra deze is afgerond.',
    },
  }

  const notification = notifications[status]
  if (notification) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'subscription',
        title: notification.title,
        message: notification.message,
      },
    })
  }
}

/**
 * GET /api/subscription/webhook
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
