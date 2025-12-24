import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  matchId: string
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { user1Id: true, user2Id: true },
    })

    if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Mark unread messages from the other user as read
    const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: otherUserId,
        read: false,
      },
      data: { read: true },
    })

    // Get other user info
    const otherUserInfo = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        profileImage: true,
        isOnline: true,
        lastSeen: true,
      },
    })

    // Get paginated messages
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { matchId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' }, // Most recent first for pagination
        take: limit,
        skip: offset,
      }),
      prisma.message.count({ where: { matchId } })
    ])

    // Reverse to show chronological order
    const formattedMessages = messages.reverse().map((message) => ({
      id: message.id,
      content: message.content,
      audioUrl: message.audioUrl,
      gifUrl: message.gifUrl,
      read: message.read,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        profileImage: message.sender.profileImage,
      },
      isFromMe: message.senderId === user.id,
    }))

    return NextResponse.json({
      messages: formattedMessages,
      otherUser: otherUserInfo,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount
      }
    })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}