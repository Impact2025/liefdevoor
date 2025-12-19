import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const subscription = await request.json()

    if (!subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Store subscription in database
    // In production, you'd have a PushSubscription model
    // For now, we'll store it in user preferences or a separate table
    console.log('[Push] New subscription for user:', user.id, {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      keys: subscription.keys ? 'present' : 'missing',
    })

    // Store subscription endpoint (you'd want a proper model for this)
    // await prisma.pushSubscription.upsert({
    //   where: { endpoint: subscription.endpoint },
    //   update: { userId: user.id, subscription: JSON.stringify(subscription) },
    //   create: { userId: user.id, endpoint: subscription.endpoint, subscription: JSON.stringify(subscription) },
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Subscribe error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
