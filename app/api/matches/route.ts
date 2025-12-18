import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { getCachedMatches } from '@/lib/cache'
import type { Match } from '@/lib/types'

/**
 * GET /api/matches
 *
 * Fetch user's matches with caching
 * Returns matches sorted by creation date (newest first)
 */
export async function GET() {
  try {
    // Authentication (throws 401 if not authenticated)
    const user = await requireAuth()

    // Get cached matches (revalidates every 60 seconds)
    const matches: Match[] = await getCachedMatches(user.id)

    return successResponse({ matches })
  } catch (error) {
    return handleApiError(error)
  }
}