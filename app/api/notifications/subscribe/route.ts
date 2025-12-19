import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  savePushSubscription,
  getVapidPublicKey,
} from '@/lib/services/push/push-notifications'

/**
 * GET /api/notifications/subscribe
 * Get VAPID public key for push subscription
 */
export async function GET() {
  const publicKey = getVapidPublicKey()

  if (!publicKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    )
  }

  return NextResponse.json({ publicKey })
}

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user agent for device identification
    const userAgent = request.headers.get('user-agent') || undefined

    // Save subscription to database
    await savePushSubscription(
      user.id,
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      userAgent
    )

    console.log('[Push] Subscription saved for user:', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Subscribe error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
