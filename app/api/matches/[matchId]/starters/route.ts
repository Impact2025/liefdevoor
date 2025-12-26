import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generatePersonalizedStarters,
  getGenericStarters,
} from '@/lib/services/matching/conversation-starters'

interface RouteParams {
  params: Promise<{ matchId: string }>
}

/**
 * GET /api/matches/[matchId]/starters
 * Get personalized conversation starters for a match
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { matchId } = await params
    const userId = session.user.id

    // Get the match with both users' data
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            interests: true,
            bio: true,
            city: true,
            occupation: true,
            psychProfile: {
              select: {
                introvertScale: true,
                spontaneityScale: true,
                adventureScale: true,
                relationshipGoal: true,
                loveLangWords: true,
                loveLangTime: true,
                loveLangGifts: true,
                loveLangActs: true,
                loveLangTouch: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            interests: true,
            bio: true,
            city: true,
            occupation: true,
            psychProfile: {
              select: {
                introvertScale: true,
                spontaneityScale: true,
                adventureScale: true,
                relationshipGoal: true,
                loveLangWords: true,
                loveLangTime: true,
                loveLangGifts: true,
                loveLangActs: true,
                loveLangTouch: true,
              },
            },
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match niet gevonden' }, { status: 404 })
    }

    // Determine current user and other user
    const isUser1 = match.user1Id === userId
    const currentUser = isUser1 ? match.user1 : match.user2
    const otherUser = isUser1 ? match.user2 : match.user1

    // Generate personalized starters
    const personalizedStarters = generatePersonalizedStarters(
      {
        name: currentUser.name || 'Jij',
        interests: currentUser.interests,
        bio: currentUser.bio,
        city: currentUser.city,
        occupation: currentUser.occupation,
        psychProfile: currentUser.psychProfile,
      },
      {
        name: otherUser.name || 'Match',
        interests: otherUser.interests,
        bio: otherUser.bio,
        city: otherUser.city,
        occupation: otherUser.occupation,
        psychProfile: otherUser.psychProfile,
      }
    )

    // Add generic starters as fallback
    const genericStarters = getGenericStarters()

    // Combine with personalized first
    const allStarters = [...personalizedStarters, ...genericStarters]

    // Remove duplicates and limit to 8
    const uniqueStarters = allStarters
      .filter((s, i, arr) => arr.findIndex((x) => x.text === s.text) === i)
      .slice(0, 8)

    return NextResponse.json({
      starters: uniqueStarters,
      otherUserName: otherUser.name,
      hasPersonalized: personalizedStarters.length > 0,
    })
  } catch (error) {
    console.error('Error getting starters:', error)
    return NextResponse.json(
      { error: 'Kon starters niet ophalen' },
      { status: 500 }
    )
  }
}
