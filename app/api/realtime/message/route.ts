import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { publish, channels, cacheDel, cacheKeys } from '@/lib/redis'

/**
 * POST /api/realtime/message
 *
 * Send a real-time message notification via Redis Pub/Sub
 * This is called after a message is saved to trigger instant delivery
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, profileImage: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { matchId, messageId, content, audioUrl } = body

    if (!matchId || !messageId) {
      return NextResponse.json({ error: 'Match ID and Message ID required' }, { status: 400 })
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

    const messagePayload = {
      type: 'new_message',
      matchId,
      message: {
        id: messageId,
        content,
        audioUrl,
        senderId: user.id,
        sender: {
          id: user.id,
          name: user.name,
          profileImage: user.profileImage,
        },
        createdAt: new Date().toISOString(),
        read: false,
      },
      timestamp: Date.now(),
    }

    // Publish to the recipient's notification channel
    await publish(channels.userNotification(otherUserId), messagePayload)

    // Publish to the chat room for real-time updates
    await publish(channels.chatRoom(matchId), messagePayload)

    // Invalidate message cache
    await cacheDel(cacheKeys.messages(matchId, 1))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Message] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
