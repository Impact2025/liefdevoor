import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRankedMatches, getCompatibility } from '@/lib/services/matching/advanced-matching'

/**
 * GET /api/discover/ranked
 *
 * Get ML-ranked potential matches with compatibility scores
 * Premium feature - provides better match quality
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Get ranked matches
    const { profiles, total } = await getRankedMatches(user.id, limit, offset)

    // Format response
    const users = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      city: profile.city,
      bio: profile.bio,
      profileImage: profile.profileImage,
      isVerified: profile.isPhotoVerified,
      matchScore: {
        score: Math.round(profile.matchScore.score * 100),
        factors: profile.matchScore.explanations,
        quality: profile.matchScore.score >= 0.8
          ? 'excellent'
          : profile.matchScore.score >= 0.6
            ? 'good'
            : 'fair',
      },
    }))

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Discover Ranked] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * POST /api/discover/ranked
 *
 * Get compatibility score between current user and a specific user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 })
    }

    // Get compatibility
    const compatibility = await getCompatibility(user.id, targetUserId)

    return NextResponse.json({
      compatibility: compatibility.percentage,
      factors: compatibility.factors,
    })
  } catch (error) {
    console.error('[Compatibility] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
