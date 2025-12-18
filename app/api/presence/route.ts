/**
 * Presence API
 *
 * POST /api/presence - Update user presence (heartbeat)
 * GET /api/presence - Get presence status for users
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  updatePresence,
  getPresenceStatus,
  formatLastSeen,
  getOnlineCount,
} from '@/lib/services/presence/presence-service'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    await updatePresence(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating presence:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('userIds')?.split(',').filter(Boolean) || []

    if (userIds.length === 0) {
      // Return online count only
      const onlineCount = await getOnlineCount()
      return NextResponse.json({ onlineCount })
    }

    // Get presence for specific users
    const presenceMap = await getPresenceStatus(userIds)

    const result: Record<string, { isOnline: boolean; lastSeenText: string }> = {}
    presenceMap.forEach((status, id) => {
      result[id] = {
        isOnline: status.isOnline,
        lastSeenText: formatLastSeen(status.lastSeen, status.isOnline),
      }
    })

    return NextResponse.json({ presence: result })
  } catch (error) {
    console.error('Error fetching presence:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
