/**
 * Likes API - Get users who liked you
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const userId = session.user.id

    // First get users you already swiped on
    const mySwipes = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    })
    const swipedUserIds = mySwipes.map((s) => s.swipedId)

    // Get all users who liked you (excluding users you already swiped on)
    const likesReceived = await prisma.swipe.findMany({
      where: {
        swipedId: userId,
        isLike: true,
        // Exclude users you already swiped on
        swiperId: {
          notIn: swipedUserIds,
        },
      },
      include: {
        swiper: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            birthDate: true,
            city: true,
            bio: true,
            isVerified: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform data for frontend
    const likes = likesReceived.map((swipe) => ({
      id: swipe.id,
      likedAt: swipe.createdAt,
      isSuperLike: swipe.isSuperLike,
      user: {
        id: swipe.swiper.id,
        name: swipe.swiper.name,
        photo: swipe.swiper.photos[0]?.url || swipe.swiper.profileImage,
        age: swipe.swiper.birthDate
          ? Math.floor(
              (Date.now() - new Date(swipe.swiper.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : null,
        city: swipe.swiper.city,
        bio: swipe.swiper.bio,
        isVerified: swipe.swiper.isVerified,
        lastActive: swipe.swiper.updatedAt,
      },
    }))

    return NextResponse.json({
      likes,
      total: likes.length,
    })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van likes' },
      { status: 500 }
    )
  }
}
