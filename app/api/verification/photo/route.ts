/**
 * Photo Verification API
 *
 * Tinder/Bumble-style photo verification:
 * - User takes selfie in specific pose
 * - AI/manual verification against profile photos
 * - Verified badge on profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { auditLog } from '@/lib/audit'

/**
 * POST /api/verification/photo
 *
 * Submit selfie for verification
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { photoUrl, pose } = await request.json()

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Photo URL is required' },
        { status: 400 }
      )
    }

    // Check if user already has pending verification
    const existingVerification = await prisma.photoVerification.findFirst({
      where: {
        userId: user.id,
        status: 'pending',
      },
    })

    if (existingVerification) {
      return NextResponse.json(
        { error: 'You already have a pending verification request' },
        { status: 400 }
      )
    }

    // Create verification request
    const verification = await prisma.photoVerification.create({
      data: {
        userId: user.id,
        photoUrl,
        pose: pose || 'neutral',
        status: 'pending',
        submittedAt: new Date(),
      },
    })

    // Audit log
    auditLog('PROFILE_UPDATE', {
      userId: user.id,
      details: {
        action: 'photo_verification_submitted',
        verificationId: verification.id,
        pose,
      },
    })

    // In production, trigger AI verification or notify moderators
    // For now, we'll auto-approve for demo purposes
    // TODO: Integrate with AI service (AWS Rekognition, Face++)

    return successResponse({
      verification: {
        id: verification.id,
        status: verification.status,
        submittedAt: verification.submittedAt,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/verification/photo
 *
 * Get verification status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isPhotoVerified: true },
    })

    const verification = await prisma.photoVerification.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
    })

    return successResponse({
      isVerified: currentUser?.isPhotoVerified || false,
      verification: verification
        ? {
            id: verification.id,
            status: verification.status,
            submittedAt: verification.submittedAt,
            reviewedAt: verification.reviewedAt,
          }
        : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/verification/photo/:id
 *
 * Approve/reject verification (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get('id')
    const { status, reason } = await request.json()

    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update verification
    const verification = await prisma.photoVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: user.id,
        rejectionReason: status === 'rejected' ? reason : null,
      },
    })

    // If approved, update user's isPhotoVerified flag
    if (status === 'approved') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          isPhotoVerified: true,
          verifiedAt: new Date(),
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'verification',
          title: 'Profiel Geverifieerd! ✓',
          message: 'Je profiel is geverifieerd. Anderen kunnen nu je verificatie badge zien!',
        },
      })
    } else if (status === 'rejected') {
      // Create rejection notification
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'verification',
          title: 'Verificatie Afgewezen',
          message: `Je verificatie is afgewezen. ${reason || 'Probeer het opnieuw met een duidelijkere foto.'}`,
        },
      })
    }

    // Audit log
    auditLog('ADMIN_ACTION', {
      userId: user.id,
      targetUserId: verification.userId,
      details: {
        action: 'photo_verification_reviewed',
        verificationId,
        status,
      },
    })

    return successResponse({ verification })
  } catch (error) {
    return handleApiError(error)
  }
}
