/**
 * Stories API - 24-hour content like Instagram
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const now = new Date()

    // Get user's own stories
    const myStories = await prisma.story.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { views: true } },
      },
    })

    // Get stories from potential matches (users not yet swiped on)
    const swipedUserIds = await prisma.swipe.findMany({
      where: { swiperId: user.id },
      select: { swipedId: true },
    })
    const swipedIds = swipedUserIds.map(s => s.swipedId)

    // Get matches to show their stories
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id },
        ],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    })
    const matchedUserIds = matches.map(m =>
      m.user1Id === user.id ? m.user2Id : m.user1Id
    )

    // Get stories from matched users and discover feed users
    const otherStories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
        userId: {
          notIn: [user.id, ...swipedIds],
        },
        user: {
          incognitoMode: false, // Don't show stories from incognito users
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
          },
        },
        views: {
          where: { viewerId: user.id },
          select: { id: true },
        },
      },
      take: 50,
    })

    // Group stories by user
    const groupedStories = otherStories.reduce((acc, story) => {
      const userId = story.userId
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false,
        }
      }
      const isViewed = story.views.length > 0
      acc[userId].stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        isViewed,
      })
      if (!isViewed) {
        acc[userId].hasUnviewed = true
      }
      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort (unviewed first, then by most recent story)
    const storiesFeed = Object.values(groupedStories)
      .sort((a: any, b: any) => {
        if (a.hasUnviewed && !b.hasUnviewed) return -1
        if (!a.hasUnviewed && b.hasUnviewed) return 1
        const aLatest = new Date(a.stories[0].createdAt).getTime()
        const bLatest = new Date(b.stories[0].createdAt).getTime()
        return bLatest - aLatest
      })

    return NextResponse.json({
      myStories: myStories.map(s => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        viewCount: s._count.views,
      })),
      feed: storiesFeed,
    })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const body = await request.json()
    const { mediaUrl, mediaType = 'PHOTO', caption } = body

    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL is verplicht' },
        { status: 400 }
      )
    }

    // Validate media type
    if (!['PHOTO', 'VIDEO'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'Ongeldig mediatype' },
        { status: 400 }
      )
    }

    // Check story limit (max 10 active stories)
    const activeStoriesCount = await prisma.story.count({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
    })

    if (activeStoriesCount >= 10) {
      return NextResponse.json(
        { error: 'Je hebt het maximum aantal actieve stories bereikt (10)' },
        { status: 400 }
      )
    }

    // Create story with 24-hour expiration
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        mediaUrl,
        mediaType,
        caption: caption || null,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      },
    })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('id')

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is verplicht' },
        { status: 400 }
      )
    }

    // Verify ownership
    const story = await prisma.story.findFirst({
      where: { id: storyId, userId: user.id },
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story niet gevonden' },
        { status: 404 }
      )
    }

    await prisma.story.delete({
      where: { id: storyId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting story:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
