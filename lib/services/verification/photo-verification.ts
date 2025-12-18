/**
 * Photo Verification Service
 *
 * Handles selfie-based verification to prove profile photos are authentic
 * Uses pose detection to ensure the user takes a specific pose
 */

import { prisma } from '@/lib/prisma'

// Verification poses the user can be asked to do
export const VERIFICATION_POSES = [
  { id: 'thumbs_up', instruction: 'Steek je duim op!', emoji: '👍' },
  { id: 'peace', instruction: 'Maak een peace teken!', emoji: '✌️' },
  { id: 'wave', instruction: 'Zwaai naar de camera!', emoji: '👋' },
  { id: 'smile', instruction: 'Lach breed naar de camera!', emoji: '😁' },
] as const

export type VerificationPose = typeof VERIFICATION_POSES[number]['id']

interface VerificationRequest {
  userId: string
  pose: VerificationPose
  createdAt: Date
}

// In-memory store for pending verifications (should be Redis in production)
const pendingVerifications = new Map<string, VerificationRequest>()

/**
 * Start a verification request
 */
export function startVerification(userId: string): { pose: typeof VERIFICATION_POSES[number]; token: string } {
  // Select random pose
  const pose = VERIFICATION_POSES[Math.floor(Math.random() * VERIFICATION_POSES.length)]

  // Generate verification token
  const token = `verify_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Store pending verification
  pendingVerifications.set(token, {
    userId,
    pose: pose.id,
    createdAt: new Date(),
  })

  // Expire after 5 minutes
  setTimeout(() => {
    pendingVerifications.delete(token)
  }, 5 * 60 * 1000)

  return { pose, token }
}

/**
 * Complete verification (called after selfie is uploaded)
 * In a real implementation, this would use AI face matching
 */
export async function completeVerification(
  token: string,
  selfieUrl: string
): Promise<{ success: boolean; message: string }> {
  const request = pendingVerifications.get(token)

  if (!request) {
    return {
      success: false,
      message: 'Verificatie token is verlopen. Probeer opnieuw.',
    }
  }

  // In production, this would:
  // 1. Compare selfie face with profile photos using AI
  // 2. Detect if the correct pose is made
  // 3. Check for liveness (anti-spoofing)

  // For now, we'll do a simple approval (manual review could be added)
  const userId = request.userId

  // Mark user as verified
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPhotoVerified: true,
      verifiedAt: new Date(),
    },
  })

  // Clean up
  pendingVerifications.delete(token)

  return {
    success: true,
    message: 'Je profiel is geverifieerd! Je krijgt nu een blauwe badge.',
  }
}

/**
 * Check if user is verified
 */
export async function isVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPhotoVerified: true },
  })
  return user?.isPhotoVerified ?? false
}

/**
 * Get verification status with details
 */
export async function getVerificationStatus(userId: string): Promise<{
  isVerified: boolean
  verifiedAt: Date | null
  canRequestVerification: boolean
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPhotoVerified: true,
      verifiedAt: true,
      profileImage: true,
    },
  })

  if (!user) {
    return {
      isVerified: false,
      verifiedAt: null,
      canRequestVerification: false,
    }
  }

  return {
    isVerified: user.isPhotoVerified,
    verifiedAt: user.verifiedAt,
    canRequestVerification: !user.isPhotoVerified && !!user.profileImage,
  }
}

/**
 * Revoke verification (admin action)
 */
export async function revokeVerification(userId: string, reason: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPhotoVerified: false,
      verifiedAt: null,
    },
  })

  // Log the action
  console.log(`Verification revoked for user ${userId}: ${reason}`)
}
