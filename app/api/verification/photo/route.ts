/**
 * Photo Verification API
 *
 * GET /api/verification/photo - Get verification status
 * POST /api/verification/photo - Start verification process
 * PUT /api/verification/photo - Complete verification with selfie
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getVerificationStatus,
  startVerification,
  completeVerification,
  VERIFICATION_POSES,
} from '@/lib/services/verification/photo-verification'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const status = await getVerificationStatus(session.user.id)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    // Check if user can verify
    const status = await getVerificationStatus(session.user.id)

    if (status.isVerified) {
      return NextResponse.json(
        { error: 'Je profiel is al geverifieerd' },
        { status: 400 }
      )
    }

    if (!status.canRequestVerification) {
      return NextResponse.json(
        { error: 'Upload eerst een profielfoto voordat je kunt verifiëren' },
        { status: 400 }
      )
    }

    // Start verification
    const { pose, token } = startVerification(session.user.id)

    return NextResponse.json({
      token,
      pose: {
        id: pose.id,
        instruction: pose.instruction,
        emoji: pose.emoji,
      },
      expiresIn: 300, // 5 minutes
      availablePoses: VERIFICATION_POSES,
    })
  } catch (error) {
    console.error('Error starting verification:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het starten van verificatie' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const { token, selfieUrl } = body

    if (!token || !selfieUrl) {
      return NextResponse.json(
        { error: 'Token en selfie URL zijn vereist' },
        { status: 400 }
      )
    }

    const result = await completeVerification(token, selfieUrl)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error completing verification:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het voltooien van verificatie' },
      { status: 500 }
    )
  }
}
