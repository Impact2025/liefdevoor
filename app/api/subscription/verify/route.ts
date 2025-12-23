import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/subscription/verify
 *
 * Verify payment status after redirect from payment provider
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      throw new Error('Order ID is required')
    }

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        multisafepayId: true,
      },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Verify this subscription belongs to the current user
    if (subscription.userId !== user.id) {
      throw new Error('Unauthorized')
    }

    // If already active, return success
    if (subscription.status === 'active') {
      return successResponse({
        subscription,
        message: 'Subscription is already active',
      })
    }

    // Query MultiSafepay API to get payment status
    if (subscription.multisafepayId) {
      try {
        // Use test API if in test mode
        const baseUrl = process.env.MULTISAFEPAY_TEST_MODE === 'true'
          ? 'https://testapi.multisafepay.com'
          : 'https://api.multisafepay.com'

        console.log('[Subscription Verify] Checking payment:', {
          baseUrl,
          orderId: subscription.multisafepayId,
          subscriptionId: subscription.id,
        })

        const res = await fetch(
          `${baseUrl}/v1/json/orders/${subscription.multisafepayId}`,
          {
            headers: {
              'api_key': process.env.MULTISAFEPAY_API_KEY!,
            },
          }
        )

        if (res.ok) {
          const paymentData = await res.json()
          const paymentStatus = paymentData.data?.status

          console.log('[Subscription Verify] Payment status:', {
            status: paymentStatus,
            subscriptionId: subscription.id,
            data: paymentData.data,
          })

          // Update subscription based on payment status
          if (paymentStatus === 'completed') {
            // Update subscription AND user tier
            const updatedSubscription = await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: 'active' },
            })

            // Also update user's subscriptionTier
            await prisma.user.update({
              where: { id: subscription.userId },
              data: { subscriptionTier: subscription.plan as any },
            })

            console.log('[Subscription Verify] Subscription activated:', {
              subscriptionId: subscription.id,
              userId: subscription.userId,
              plan: subscription.plan,
            })

            return successResponse({
              subscription: updatedSubscription,
              message: 'Payment verified and subscription activated',
            })
          } else if (paymentStatus === 'cancelled' || paymentStatus === 'expired') {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: 'cancelled' },
            })

            throw new Error('Payment was cancelled or expired')
          } else {
            console.log('[Subscription Verify] Payment not completed yet:', {
              status: paymentStatus,
              subscriptionId: subscription.id,
            })
          }
        } else {
          console.error('[Subscription Verify] API call failed:', {
            status: res.status,
            statusText: res.statusText,
          })
        }
      } catch (error) {
        console.error('[Subscription Verify] Error:', error)
        // Continue to return current status if API call fails
      }
    } else {
      console.log('[Subscription Verify] No multisafepayId found for subscription:', subscription.id)
    }

    // Return current status
    return successResponse({
      subscription,
      message: 'Payment is still being processed',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
