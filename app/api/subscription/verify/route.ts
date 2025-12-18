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
        const res = await fetch(
          `https://api.multisafepay.com/v1/json/orders/${subscription.multisafepayId}`,
          {
            headers: {
              'api_key': process.env.MULTISAFEPAY_API_KEY!,
            },
          }
        )

        if (res.ok) {
          const paymentData = await res.json()
          const paymentStatus = paymentData.data?.status

          // Update subscription based on payment status
          if (paymentStatus === 'completed') {
            const updatedSubscription = await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: 'active' },
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
          }
        }
      } catch (error) {
        console.error('MultiSafepay verification error:', error)
        // Continue to return current status if API call fails
      }
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
