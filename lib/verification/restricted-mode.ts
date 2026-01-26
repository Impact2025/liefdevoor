/**
 * Restricted Mode Verification for INACTIVE Migration Users
 *
 * INACTIVE users (8000+) kunnen hun account claimen en inloggen,
 * maar kunnen GEEN berichten sturen of likes geven totdat ze
 * photo + liveness verificatie hebben voltooid.
 */

import { prisma } from '@/lib/prisma'

export interface VerificationStatus {
  allowed: boolean
  isRestricted: boolean
  isPhotoVerified: boolean
  isLivenessVerified: boolean
  error?: {
    code: 'VERIFICATION_REQUIRED'
    message: string
    verificationUrl: string
    missingVerifications: ('photo' | 'liveness')[]
  }
}

/**
 * Check if a user is in restricted mode and can perform social actions
 * (sending messages, swiping/liking)
 *
 * Users from INACTIVE migration segment need both photo and liveness verification
 * before they can interact with others.
 */
export async function checkVerificationStatus(userId: string): Promise<VerificationStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      registrationSource: true,
      isPhotoVerified: true,
      isLivenessVerified: true,
    }
  })

  if (!user) {
    return {
      allowed: false,
      isRestricted: false,
      isPhotoVerified: false,
      isLivenessVerified: false,
      error: {
        code: 'VERIFICATION_REQUIRED',
        message: 'Gebruiker niet gevonden',
        verificationUrl: '/verificatie',
        missingVerifications: ['photo', 'liveness'],
      }
    }
  }

  // Only INACTIVE migration users are restricted
  const isInactiveMigrationUser = user.registrationSource === 'oogvoorliefde_migration_inactive'

  // If not an INACTIVE migration user, allow all actions
  if (!isInactiveMigrationUser) {
    return {
      allowed: true,
      isRestricted: false,
      isPhotoVerified: user.isPhotoVerified ?? false,
      isLivenessVerified: user.isLivenessVerified ?? false,
    }
  }

  // INACTIVE migration users need both verifications
  const isPhotoVerified = user.isPhotoVerified ?? false
  const isLivenessVerified = user.isLivenessVerified ?? false
  const isFullyVerified = isPhotoVerified && isLivenessVerified

  if (isFullyVerified) {
    return {
      allowed: true,
      isRestricted: false, // No longer restricted after verification
      isPhotoVerified,
      isLivenessVerified,
    }
  }

  // Build list of missing verifications
  const missingVerifications: ('photo' | 'liveness')[] = []
  if (!isPhotoVerified) missingVerifications.push('photo')
  if (!isLivenessVerified) missingVerifications.push('liveness')

  return {
    allowed: false,
    isRestricted: true,
    isPhotoVerified,
    isLivenessVerified,
    error: {
      code: 'VERIFICATION_REQUIRED',
      message: 'Verificatie vereist om berichten te sturen en te liken. Voltooi je foto- en liveness verificatie.',
      verificationUrl: '/verificatie',
      missingVerifications,
    }
  }
}

/**
 * Check if user is from INACTIVE migration segment
 * Utility function for quick checks without full verification status
 */
export async function isInactiveMigrationUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { registrationSource: true }
  })

  return user?.registrationSource === 'oogvoorliefde_migration_inactive'
}
