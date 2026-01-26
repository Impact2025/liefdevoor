import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { checkVerificationStatus } from '@/lib/verification/restricted-mode'

/**
 * GET /api/user/verification-status
 *
 * Returns the verification status for the current user.
 * Used by frontend to check if user is in restricted mode.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const status = await checkVerificationStatus(user.id)

    return successResponse({
      isRestricted: status.isRestricted,
      isPhotoVerified: status.isPhotoVerified,
      isLivenessVerified: status.isLivenessVerified,
      canSendMessages: status.allowed,
      canSwipe: status.allowed,
      verificationUrl: status.error?.verificationUrl || '/verificatie',
      missingVerifications: status.error?.missingVerifications || [],
    })
  } catch (error) {
    return handleApiError(error)
  }
}
