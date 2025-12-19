import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
    }

    console.log('[Push] Unsubscribe:', endpoint.substring(0, 50) + '...')

    // Remove subscription from database
    // await prisma.pushSubscription.delete({
    //   where: { endpoint },
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
