import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { publish, channels } from '@/lib/redis'

/**
 * POST /api/realtime/typing
 *
 * Send typing indicator to match partner via Redis Pub/Sub
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { matchId, isTyping } = body

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID required' }, { status: 400 })
    }

    // Verify user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { user1Id: true, user2Id: true },
    })

    if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Get the other user's ID
    const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id

    // Publish typing event to the other user's notification channel
    await publish(channels.userNotification(otherUserId), {
      type: isTyping ? 'typing_start' : 'typing_stop',
      matchId,
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    })

    // Also publish to the chat room channel
    await publish(channels.chatRoom(matchId), {
      type: isTyping ? 'typing_start' : 'typing_stop',
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Typing] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
