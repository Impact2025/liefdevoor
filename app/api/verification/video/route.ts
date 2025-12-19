import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateChallenges,
  runLivenessVerification,
  type LivenessChallenge,
} from '@/lib/services/verification/liveness-detection'

/**
 * GET /api/verification/video
 *
 * Get verification challenges for the user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPhotoVerified: true,
        verifiedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already verified
    if (user.isPhotoVerified) {
      return NextResponse.json({
        alreadyVerified: true,
        verifiedAt: user.verifiedAt,
      })
    }

    // Generate challenges
    const challenges = generateChallenges(2)

    return NextResponse.json({
      challenges,
      instructions: [
        'Zorg voor goede verlichting',
        'Houd je gezicht in het midden van het scherm',
        'Volg de instructies op het scherm',
        'De verificatie duurt ongeveer 30 seconden',
      ],
    })
  } catch (error) {
    console.error('[Video Verification] Error getting challenges:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

interface VerificationRequest {
  challenges: LivenessChallenge[]
  frames: string[] // Base64 encoded frames
}

/**
 * POST /api/verification/video
 *
 * Submit video verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPhotoVerified: true,
        photos: {
          select: { url: true },
          take: 3,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isPhotoVerified) {
      return NextResponse.json({
        success: true,
        message: 'Al geverifieerd',
        alreadyVerified: true,
      })
    }

    const body: VerificationRequest = await request.json()
    const { challenges, frames } = body

    if (!challenges || !frames || frames.length < 10) {
      return NextResponse.json(
        { error: 'Onvoldoende video frames. Probeer opnieuw.' },
        { status: 400 }
      )
    }

    // Run liveness verification
    const result = await runLivenessVerification(
      frames,
      challenges,
      user.photos.map((p) => p.url)
    )

    if (result.passed) {
      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPhotoVerified: true,
          verifiedAt: new Date(),
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'verification_success',
          title: '✅ Profiel Geverifieerd!',
          message: 'Je profiel is succesvol geverifieerd. Je krijgt nu een verificatiebadge.',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Verificatie geslaagd!',
        result: {
          confidence: result.confidence,
          faceMatch: result.faceMatch,
        },
      })
    } else {
      // Verification failed
      const failureReasons: string[] = []

      if (!result.antiSpoofing.isRealPerson) {
        failureReasons.push('We konden niet bevestigen dat je een echte persoon bent')
      }

      result.challenges.forEach((c) => {
        if (!c.passed) {
          switch (c.type) {
            case 'blink':
              failureReasons.push('Knipperen niet gedetecteerd')
              break
            case 'smile':
              failureReasons.push('Glimlach niet gedetecteerd')
              break
            case 'turn_left':
            case 'turn_right':
              failureReasons.push('Hoofdbeweging niet gedetecteerd')
              break
          }
        }
      })

      if (result.faceMatch && !result.faceMatch.matched) {
        failureReasons.push('Gezicht komt niet overeen met profielfoto\'s')
      }

      return NextResponse.json({
        success: false,
        message: 'Verificatie niet geslaagd',
        reasons: failureReasons,
        canRetry: true,
      })
    }
  } catch (error) {
    console.error('[Video Verification] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
