import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/subscription/webhook
 *
 * Webhook to receive payment status updates from MultiSafepay
 * This is called asynchronously by the payment provider
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[Webhook] Received MultiSafepay webhook:', {
      transactionId: body.transactionid,
      orderId: body.order_id,
      status: body.status,
    })

    const { transactionid, status } = body

    if (!transactionid) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      )
    }

    // Find subscription by MultiSafepay transaction ID
    const subscription = await prisma.subscription.findFirst({
      where: { multisafepayId: transactionid },
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
      },
    })

    if (!subscription) {
      console.error('[Webhook] Subscription not found for transaction:', transactionid)
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Map MultiSafepay status to our subscription status
    let newStatus: 'active' | 'cancelled' | 'pending' | null = null

    switch (status?.toLowerCase()) {
      case 'completed':
        newStatus = 'active'
        break
      case 'cancelled':
      case 'expired':
      case 'declined':
      case 'void':
        newStatus = 'cancelled'
        break
      case 'initialized':
      case 'uncleared':
        newStatus = 'pending'
        break
      default:
        console.warn('[Webhook] Unknown payment status:', status)
        break
    }

    // Update subscription if status changed
    if (newStatus && newStatus !== subscription.status) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: newStatus },
      })

      console.log('[Webhook] Updated subscription:', {
        subscriptionId: subscription.id,
        oldStatus: subscription.status,
        newStatus,
      })

      // If subscription activated, create notification
      if (newStatus === 'active') {
        await prisma.notification.create({
          data: {
            userId: subscription.userId,
            type: 'subscription',
            title: 'Premium Geactiveerd!',
            message: `Je ${subscription.plan} abonnement is nu actief. Geniet van alle premium functies!`,
          },
        })

        console.log('[Webhook] Created activation notification for user:', subscription.userId)
      }
    }

    // Return OK to acknowledge webhook
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)

    // Still return 200 to prevent retries for unrecoverable errors
    return NextResponse.json(
      { error: 'Internal error', ok: false },
      { status: 200 }
    )
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
  })
}
