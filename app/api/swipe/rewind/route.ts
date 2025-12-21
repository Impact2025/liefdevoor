/**
 * Rewind API - Undo last swipe (Premium feature)
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'

export async function POST() {
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

    // Check if user has rewind feature (premium)
    const canRewind = await hasFeature(user.id, 'canRewind')
    if (!canRewind) {
      return NextResponse.json({
        error: 'Premium vereist',
        message: 'Rewind is een Premium functie. Upgrade je abonnement om je laatste swipe ongedaan te maken.',
        upgradeUrl: '/prijzen',
      }, { status: 403 })
    }

    // Get the last swipe from today (only allow rewind within 24 hours)
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const lastSwipe = await prisma.swipe.findFirst({
      where: {
        swiperId: user.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        swiped: {
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
            interests: true,
          },
        },
      },
    })

    if (!lastSwipe) {
      return NextResponse.json({
        error: 'Geen swipe gevonden',
        message: 'Er is geen recente swipe om ongedaan te maken.',
      }, { status: 404 })
    }

    // Check if a match was created - if so, delete the match too
    if (lastSwipe.isLike) {
      await prisma.match.deleteMany({
        where: {
          OR: [
            { user1Id: user.id, user2Id: lastSwipe.swipedId },
            { user1Id: lastSwipe.swipedId, user2Id: user.id },
          ],
        },
      })
    }

    // Delete the swipe
    await prisma.swipe.delete({
      where: { id: lastSwipe.id },
    })

    // Calculate age
    let age = null
    if (lastSwipe.swiped.birthDate) {
      const birth = new Date(lastSwipe.swiped.birthDate)
      const today = new Date()
      age = today.getFullYear() - birth.getFullYear()
      if (today.getMonth() - birth.getMonth() < 0 ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--
      }
    }

    // Return the user profile so it can be added back to the stack
    return NextResponse.json({
      success: true,
      user: {
        id: lastSwipe.swiped.id,
        name: lastSwipe.swiped.name,
        profileImage: lastSwipe.swiped.profileImage,
        photos: lastSwipe.swiped.photos,
        birthDate: lastSwipe.swiped.birthDate,
        age,
        city: lastSwipe.swiped.city,
        bio: lastSwipe.swiped.bio,
        isVerified: lastSwipe.swiped.isVerified,
        interests: lastSwipe.swiped.interests,
      },
      wasLike: lastSwipe.isLike,
      wasSuperLike: lastSwipe.isSuperLike,
    })
  } catch (error) {
    console.error('Error rewinding swipe:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ongedaan maken van de swipe' },
      { status: 500 }
    )
  }
}
