import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ matchId: string }>
}

// Answer types for Vibe Check
type VibeCheckAnswer = 'wil_date' | 'meer_chatten' | 'twijfel'

/**
 * GET /api/matches/[matchId]/vibe-check
 * Get the current Vibe Check status for a match
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
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        vibeChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match niet gevonden' }, { status: 404 })
    }

    const vibeCheck = match.vibeChecks[0]

    if (!vibeCheck) {
      return NextResponse.json({
        status: 'none',
        canCreate: await canCreateVibeCheck(matchId, userId),
      })
    }

    // Determine if this user is user1 or user2
    const isUser1 = vibeCheck.user1Id === userId
    const myAnswer = isUser1 ? vibeCheck.user1Answer : vibeCheck.user2Answer
    const theirAnswer = isUser1 ? vibeCheck.user2Answer : vibeCheck.user1Answer

    // Check if both have answered
    const bothAnswered = vibeCheck.user1Answer && vibeCheck.user2Answer

    return NextResponse.json({
      id: vibeCheck.id,
      status: vibeCheck.status,
      myAnswer,
      theirAnswer: bothAnswered ? theirAnswer : null, // Only show their answer if both answered
      revealedAt: vibeCheck.revealedAt,
      expiresAt: vibeCheck.expiresAt,
      bothWantDate: bothAnswered &&
        vibeCheck.user1Answer === 'wil_date' &&
        vibeCheck.user2Answer === 'wil_date',
      canCreate: vibeCheck.status === 'completed' || vibeCheck.status === 'expired'
        ? await canCreateVibeCheck(matchId, userId)
        : false,
    })
  } catch (error) {
    console.error('Error getting vibe check:', error)
    return NextResponse.json({ error: 'Kon vibe check niet ophalen' }, { status: 500 })
  }
}

/**
 * POST /api/matches/[matchId]/vibe-check
 * Create a new Vibe Check or answer an existing one
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
    const { answer } = body as { answer?: VibeCheckAnswer }

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: { select: { id: true, name: true } },
        user2: { select: { id: true, name: true } },
        vibeChecks: {
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match niet gevonden' }, { status: 404 })
    }

    const isUser1 = match.user1Id === userId
    const partnerId = isUser1 ? match.user2Id : match.user1Id
    const partnerName = isUser1 ? match.user2.name : match.user1.name

    // Check for existing pending vibe check
    let vibeCheck = match.vibeChecks[0]

    if (!vibeCheck) {
      // Create new vibe check
      if (!await canCreateVibeCheck(matchId, userId)) {
        return NextResponse.json({
          error: 'Je moet eerst meer chatten voordat je een Vibe Check kunt starten'
        }, { status: 400 })
      }

      vibeCheck = await prisma.vibeCheck.create({
        data: {
          matchId,
          user1Id: isUser1 ? userId : partnerId,
          user2Id: isUser1 ? partnerId : userId,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })

      // Send notification to partner
      await prisma.notification.create({
        data: {
          userId: partnerId,
          type: 'vibe_check',
          title: 'Vibe Check!',
          message: `${session.user.name || 'Iemand'} wil weten hoe het tussen jullie gaat`,
          relatedId: vibeCheck.id,
        },
      })

      return NextResponse.json({
        id: vibeCheck.id,
        status: 'created',
        message: `Vibe Check gestart! ${partnerName} krijgt een notificatie.`,
        expiresAt: vibeCheck.expiresAt,
      })
    }

    // Answer existing vibe check
    if (!answer || !['wil_date', 'meer_chatten', 'twijfel'].includes(answer)) {
      return NextResponse.json({ error: 'Ongeldig antwoord' }, { status: 400 })
    }

    // Check if user already answered
    const alreadyAnswered = isUser1
      ? vibeCheck.user1Answer !== null
      : vibeCheck.user2Answer !== null

    if (alreadyAnswered) {
      return NextResponse.json({ error: 'Je hebt al geantwoord' }, { status: 400 })
    }

    // Update with answer
    const updateData = isUser1
      ? { user1Answer: answer, user1AnsweredAt: new Date() }
      : { user2Answer: answer, user2AnsweredAt: new Date() }

    const updatedVibeCheck = await prisma.vibeCheck.update({
      where: { id: vibeCheck.id },
      data: updateData,
    })

    // Check if both have now answered
    const otherAnswer = isUser1 ? updatedVibeCheck.user2Answer : updatedVibeCheck.user1Answer

    if (otherAnswer) {
      // Both answered - reveal results!
      const bothWantDate = answer === 'wil_date' && otherAnswer === 'wil_date'

      await prisma.vibeCheck.update({
        where: { id: vibeCheck.id },
        data: {
          status: 'completed',
          revealedAt: new Date(),
        },
      })

      // Update match milestones
      const currentMilestones = (match.milestones as Record<string, unknown>) || {}
      await prisma.match.update({
        where: { id: matchId },
        data: {
          milestones: {
            ...currentMilestones,
            vibeCheckCompleted: new Date().toISOString(),
            bothWantDate,
          },
          // Boost compatibility score if both want date
          currentCompatibility: bothWantDate
            ? Math.min(100, (match.currentCompatibility || match.initialCompatibility || 50) + 10)
            : match.currentCompatibility,
        },
      })

      // Send notifications
      await prisma.notification.create({
        data: {
          userId: partnerId,
          type: 'vibe_check_result',
          title: bothWantDate ? 'Jullie willen allebei een date!' : 'Vibe Check resultaat',
          message: bothWantDate
            ? 'Plan nu jullie eerste date!'
            : 'Bekijk wat jullie hebben geantwoord',
          relatedId: vibeCheck.id,
        },
      })

      return NextResponse.json({
        id: vibeCheck.id,
        status: 'completed',
        myAnswer: answer,
        theirAnswer: otherAnswer,
        bothWantDate,
        message: bothWantDate
          ? 'Jullie willen allebei een date! Plan nu iets leuks!'
          : 'Vibe Check compleet!',
      })
    }

    // Partner hasn't answered yet
    return NextResponse.json({
      id: vibeCheck.id,
      status: 'waiting',
      myAnswer: answer,
      message: `Wachten tot ${partnerName} antwoordt...`,
    })
  } catch (error) {
    console.error('Error with vibe check:', error)
    return NextResponse.json({ error: 'Kon vibe check niet verwerken' }, { status: 500 })
  }
}

/**
 * Check if a vibe check can be created (minimum 3 days of chatting or 10 messages)
 */
async function canCreateVibeCheck(matchId: string, userId: string): Promise<boolean> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      createdAt: true,
      messages: {
        select: { id: true },
        take: 10,
      },
    },
  })

  if (!match) return false

  // Either 3+ days since match OR 10+ messages exchanged
  const daysSinceMatch = (Date.now() - match.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const messageCount = match.messages.length

  return daysSinceMatch >= 3 || messageCount >= 10
}
