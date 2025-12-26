import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getJourneyProgress, recordMilestone, MilestoneKey } from '@/lib/services/matching/growing-score'

interface RouteParams {
  params: Promise<{ matchId: string }>
}

/**
 * GET /api/matches/[matchId]/journey
 * Get the journey progress for a match
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { matchId } = await params
    const userId = session.user.id

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match niet gevonden' }, { status: 404 })
    }

    // Get journey progress
    const progress = await getJourneyProgress(matchId)

    if (!progress) {
      return NextResponse.json({ error: 'Kon progress niet ophalen' }, { status: 500 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error getting journey progress:', error)
    return NextResponse.json({ error: 'Kon journey niet ophalen' }, { status: 500 })
  }
}

/**
 * POST /api/matches/[matchId]/journey
 * Record a milestone for the match
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { matchId } = await params
    const userId = session.user.id
    const body = await request.json()
    const { milestone, metadata } = body as { milestone: MilestoneKey; metadata?: Record<string, unknown> }

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone is verplicht' }, { status: 400 })
    }

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match niet gevonden' }, { status: 404 })
    }

    // Record the milestone
    const result = await recordMilestone(matchId, milestone, metadata)

    if (!result.success) {
      return NextResponse.json({ error: 'Kon milestone niet opslaan' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newScore: result.newScore,
      milestone: result.milestone,
    })
  } catch (error) {
    console.error('Error recording milestone:', error)
    return NextResponse.json({ error: 'Kon milestone niet opslaan' }, { status: 500 })
  }
}
