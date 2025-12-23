import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError, parsePaginationParams } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import type { DiscoverUser, DiscoverFilters, UserPreferences } from '@/lib/types'
import type { Prisma } from '@prisma/client'

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Convert age to birth date range for filtering
 */
function ageToBirthDateRange(minAge?: number, maxAge?: number) {
  if (!minAge && !maxAge) return null

  const now = new Date()
  const minBirthDate = maxAge ? new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate()) : undefined
  const maxBirthDate = minAge ? new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate()) : undefined

  if (minBirthDate && maxBirthDate) {
    return { gte: minBirthDate, lte: maxBirthDate }
  } else if (minBirthDate) {
    return { gte: minBirthDate }
  } else if (maxBirthDate) {
    return { lte: maxBirthDate }
  }
  return null
}

/**
 * Build Prisma where clause from filters and preferences
 */
function buildDiscoverWhere(
  excludeIds: string[],
  filters: DiscoverFilters,
  prefs: UserPreferences,
  currentUserCity?: string | null
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    id: { notIn: excludeIds },
    profileImage: { not: null },
  }

  // Name search
  if (filters.name) {
    where.name = { contains: filters.name, mode: 'insensitive' }
  }

  // Age filtering (query params override preferences)
  const birthDateRange = ageToBirthDateRange(filters.minAge, filters.maxAge)
    || ageToBirthDateRange(prefs.minAge, prefs.maxAge)

  if (birthDateRange) {
    where.birthDate = birthDateRange
  }

  // Gender filtering (query params override preferences)
  if (filters.gender) {
    where.gender = filters.gender
  } else if (prefs.genderPreference) {
    where.gender = prefs.genderPreference
  }

  // City filtering
  if (filters.city) {
    where.city = { contains: filters.city, mode: 'insensitive' }
  } else if (currentUserCity && prefs.maxDistance && prefs.maxDistance < 50) {
    where.city = currentUserCity
  }

  return where
}

/**
 * GET /api/discover
 *
 * Fetch potential matches based on user preferences and filters
 * Optimized with single UNION query for excluded users
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get current user's profile and preferences (including passport mode)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        preferences: true,
        latitude: true,
        longitude: true,
        city: true,
        // Passport mode fields
        passportCity: true,
        passportLatitude: true,
        passportLongitude: true,
        passportExpiresAt: true,
      },
    })

    if (!currentUser) {
      throw new Error('User profile not found')
    }

    const prefs: UserPreferences = currentUser.preferences ? JSON.parse(currentUser.preferences) : {}

    // Check if passport mode is active
    const now = new Date()
    const isPassportActive = currentUser.passportCity &&
      currentUser.passportLatitude &&
      currentUser.passportLongitude &&
      currentUser.passportExpiresAt &&
      new Date(currentUser.passportExpiresAt) > now

    // Use passport location if active, otherwise use real location
    const effectiveLatitude = isPassportActive ? currentUser.passportLatitude : currentUser.latitude
    const effectiveLongitude = isPassportActive ? currentUser.passportLongitude : currentUser.longitude
    const effectiveCity = isPassportActive ? currentUser.passportCity : currentUser.city

    // Parse filters and pagination
    const { searchParams } = new URL(request.url)
    const filters: DiscoverFilters = {
      name: searchParams.get('name') || undefined,
      minAge: searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!) : undefined,
      maxAge: searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!) : undefined,
      city: searchParams.get('city') || undefined,
      gender: searchParams.get('gender') as any,
    }

    const { page, limit, offset } = parsePaginationParams(searchParams)

    // Get excluded users with optimized UNION query
    const excludedUsers = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "swipedId" as id FROM "Swipe" WHERE "swiperId" = ${currentUser.id}
      UNION
      SELECT "user1Id" as id FROM "Match" WHERE "user2Id" = ${currentUser.id}
      UNION
      SELECT "user2Id" as id FROM "Match" WHERE "user1Id" = ${currentUser.id}
      UNION
      SELECT "blockedId" as id FROM "Block" WHERE "blockerId" = ${currentUser.id}
      UNION
      SELECT "blockerId" as id FROM "Block" WHERE "blockedId" = ${currentUser.id}
    `

    const excludeIds = [currentUser.id, ...excludedUsers.map(u => u.id)]

    // Build where clause using helper (use effective city from passport if active)
    const where = buildDiscoverWhere(excludeIds, filters, prefs, effectiveCity)

    // Filter out incognito users (they don't appear in discover)
    where.incognitoMode = false

    // Fetch potential matches (3x limit for distance filtering)
    const potentialMatches = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        bio: true,
        birthDate: true,
        gender: true,
        city: true,
        postcode: true,
        latitude: true,
        longitude: true,
        profileImage: true,
        voiceIntro: true,
        role: true,
        isVerified: true,
        safetyScore: true,
        createdAt: true,
        updatedAt: true,
        // Lifestyle fields
        occupation: true,
        education: true,
        height: true,
        drinking: true,
        smoking: true,
        children: true,
        photos: {
          select: { id: true, url: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
      take: limit * 3,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    // Apply distance filtering if needed (use effective location from passport if active)
    let filteredMatches = potentialMatches
    if (effectiveLatitude && effectiveLongitude && prefs.maxDistance) {
      filteredMatches = potentialMatches.filter(user => {
        if (!user.latitude || !user.longitude) return false
        const distance = calculateDistance(
          effectiveLatitude,
          effectiveLongitude,
          user.latitude,
          user.longitude
        )
        return distance <= prefs.maxDistance!
      })
    }

    // Get boosted user IDs (reuse 'now' from passport check)
    const boostedUsers = await prisma.profileBoost.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now },
        userId: { in: filteredMatches.map(u => u.id) },
      },
      select: { userId: true },
    })
    const boostedUserIds = new Set(boostedUsers.map(b => b.userId))

    // Sort: boosted users first, then by createdAt
    const sortedMatches = [...filteredMatches].sort((a, b) => {
      const aIsBoosted = boostedUserIds.has(a.id)
      const bIsBoosted = boostedUserIds.has(b.id)
      if (aIsBoosted && !bIsBoosted) return -1
      if (!aIsBoosted && bIsBoosted) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Paginate and format
    const users: DiscoverUser[] = sortedMatches.slice(0, limit).map(user => ({
      ...user,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
      isBoosted: boostedUserIds.has(user.id),
    }))

    const totalCount = await prisma.user.count({ where })

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      // Include passport info if active
      passport: isPassportActive ? {
        city: currentUser.passportCity,
        expiresAt: currentUser.passportExpiresAt,
      } : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}