import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError, parsePaginationParams } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import type { DiscoverUser, DiscoverFilters, UserPreferences } from '@/lib/types'
import type { Prisma } from '@prisma/client'
import { calculateCompatibility } from '@/lib/services/matching/compatibility-engine'

/**
 * 🎭 INTELLIGENT FALLBACK SYSTEEM
 *
 * Wanneer een nieuwe gebruiker registreert en er zijn geen echte matches,
 * tonen we showcase profielen zodat de app niet leeg aanvoelt.
 *
 * Strategie:
 * 1. Eerst echte profielen ophalen (isShowcase: false)
 * 2. Als < MIN_PROFILES: showcase profielen toevoegen
 * 3. Showcase profielen worden gemarkeerd zodat swipes niet worden opgeslagen
 */
const MIN_PROFILES_BEFORE_SHOWCASE = 5 // Minimaal aantal echte profielen voordat we showcase tonen
const MAX_SHOWCASE_PROFILES = 20 // Maximum aantal showcase profielen om te tonen

/**
 * Geocode a Dutch/Belgian postcode to coordinates
 */
async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()

    // Determine country based on postcode format
    const dutchRegex = /^[1-9][0-9]{3}[A-Z]{2}$/
    const belgianRegex = /^[1-9][0-9]{3}$/

    let country = 'nl'
    if (belgianRegex.test(cleanedPostcode) && !dutchRegex.test(cleanedPostcode)) {
      country = 'be'
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `postalcode=${cleanedPostcode}&` +
      `country=${country}&` +
      `format=json&` +
      `limit=1`,
      {
        headers: {
          'User-Agent': 'LiefdeVoorIedereen/1.0',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (!data || data.length === 0) return null

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch (error) {
    console.error('[Geocode] Error:', error)
    return null
  }
}

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
 * @param useDistanceFiltering - If true, skip postcode startsWith filter (distance filtering handles location)
 */
function buildDiscoverWhere(
  excludeIds: string[],
  filters: DiscoverFilters,
  prefs: UserPreferences,
  currentUserCity?: string | null,
  useDistanceFiltering: boolean = false
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

  // Location filtering
  // If useDistanceFiltering is true (postcode geocoded successfully), skip postcode/city filter
  // Distance filtering in the main function will handle location
  if (!useDistanceFiltering) {
    if (filters.postcode) {
      // Fallback: exact postcode match if geocoding failed
      where.postcode = { startsWith: filters.postcode.replace(/\s/g, '').toUpperCase() }
    } else if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' }
    } else if (currentUserCity && prefs.maxDistance && prefs.maxDistance < 50) {
      where.city = currentUserCity
    }
  }

  // ============================================
  // ADVANCED FILTERS - Wereldklasse filtering
  // ============================================

  // Smoking filter
  if (filters.smoking && filters.smoking.length > 0) {
    where.smoking = { in: filters.smoking }
  }

  // Drinking filter
  if (filters.drinking && filters.drinking.length > 0) {
    where.drinking = { in: filters.drinking }
  }

  // Children filter
  if (filters.children && filters.children.length > 0) {
    where.children = { in: filters.children }
  }

  // Height filters
  if (filters.minHeight || filters.maxHeight) {
    where.height = {}
    if (filters.minHeight) {
      where.height.gte = filters.minHeight
    }
    if (filters.maxHeight) {
      where.height.lte = filters.maxHeight
    }
  }

  // Education filter (Premium)
  if (filters.education && filters.education.length > 0) {
    where.education = { in: filters.education }
  }

  // Religion filter (Premium)
  if (filters.religion && filters.religion.length > 0) {
    where.religion = { in: filters.religion }
  }

  // Ethnicity filter (Premium)
  if (filters.ethnicity && filters.ethnicity.length > 0) {
    where.ethnicity = { in: filters.ethnicity }
  }

  // Languages filter (Premium) - User must speak at least one of the selected languages
  if (filters.languages && filters.languages.length > 0) {
    where.languages = { hasSome: filters.languages }
  }

  // Sports filter - User must have at least one of the selected sports
  if (filters.sports && filters.sports.length > 0) {
    where.sports = { hasSome: filters.sports }
  }

  // Interests filter - Search in comma-separated interests string
  if (filters.interests && filters.interests.length > 0) {
    // For comma-separated string interests, use OR with contains
    where.OR = where.OR || []
    filters.interests.forEach(interest => {
      (where.OR as Prisma.UserWhereInput[]).push({
        interests: { contains: interest, mode: 'insensitive' }
      })
    })
  }

  // Verified only filter
  if (filters.verifiedOnly) {
    where.isVerified = true
  }

  // Online recently filter (last 24 hours)
  if (filters.onlineRecently) {
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    where.lastSeen = { gte: oneDayAgo }
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
        // Lifestyle fields for matching
        smoking: true,
        drinking: true,
        children: true,
        height: true,
        // PsychProfile for personality matching
        psychProfile: true,
        // Dealbreakers for filtering
        dealbreakers: true,
      },
    })

    if (!currentUser) {
      throw new Error('User profile not found')
    }

    const prefs: UserPreferences = (currentUser.preferences as UserPreferences) || {}

    // Check if passport mode is active
    const now = new Date()
    const isPassportActive = currentUser.passportCity &&
      currentUser.passportLatitude &&
      currentUser.passportLongitude &&
      currentUser.passportExpiresAt &&
      new Date(currentUser.passportExpiresAt) > now

    // Use passport location if active, otherwise use real location
    let effectiveLatitude = isPassportActive ? currentUser.passportLatitude : currentUser.latitude
    let effectiveLongitude = isPassportActive ? currentUser.passportLongitude : currentUser.longitude
    const effectiveCity = isPassportActive ? currentUser.passportCity : currentUser.city

    // Parse filters and pagination
    const { searchParams } = new URL(request.url)

    // Helper to parse array params (comma-separated or multiple params)
    const parseArrayParam = (key: string): string[] | undefined => {
      const value = searchParams.get(key)
      if (!value) return undefined
      return value.split(',').map(v => v.trim()).filter(Boolean)
    }

    const filters: DiscoverFilters = {
      name: searchParams.get('name') || undefined,
      minAge: searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!) : undefined,
      maxAge: searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!) : undefined,
      city: searchParams.get('city') || undefined,
      postcode: searchParams.get('postcode') || undefined,
      gender: searchParams.get('gender') as any,
      maxDistance: searchParams.get('maxDistance') ? parseInt(searchParams.get('maxDistance')!) : undefined,

      // Advanced filters
      smoking: parseArrayParam('smoking'),
      drinking: parseArrayParam('drinking'),
      children: parseArrayParam('children'),
      minHeight: searchParams.get('minHeight') ? parseInt(searchParams.get('minHeight')!) : undefined,
      maxHeight: searchParams.get('maxHeight') ? parseInt(searchParams.get('maxHeight')!) : undefined,
      education: parseArrayParam('education'),
      religion: parseArrayParam('religion'),
      languages: parseArrayParam('languages'),
      ethnicity: parseArrayParam('ethnicity'),
      interests: parseArrayParam('interests'),
      sports: parseArrayParam('sports'),
      relationshipGoal: parseArrayParam('relationshipGoal'),
      verifiedOnly: searchParams.get('verifiedOnly') === 'true',
      onlineRecently: searchParams.get('onlineRecently') === 'true',
    }

    const { page, limit, offset } = parsePaginationParams(searchParams)

    // 🔍 POSTCODE SEARCH: When searching by postcode, geocode it for distance-based filtering
    let searchPostcodeCoords: { lat: number; lng: number } | null = null
    if (filters.postcode) {
      console.log(`[Discover] Geocoding search postcode: ${filters.postcode}`)
      searchPostcodeCoords = await geocodePostcode(filters.postcode)
      if (searchPostcodeCoords) {
        console.log(`[Discover] Postcode ${filters.postcode} → lat: ${searchPostcodeCoords.lat}, lng: ${searchPostcodeCoords.lng}`)
        // Override effective location with search postcode coordinates
        effectiveLatitude = searchPostcodeCoords.lat
        effectiveLongitude = searchPostcodeCoords.lng
        // Set a default maxDistance if not provided (50km radius from postcode)
        if (!filters.maxDistance) {
          filters.maxDistance = 50
        }
      }
    }

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
    // Use distance filtering if postcode was successfully geocoded
    const useDistanceFiltering = searchPostcodeCoords !== null
    const where = buildDiscoverWhere(excludeIds, filters, prefs, effectiveCity, useDistanceFiltering)

    // Filter out incognito users (they don't appear in discover)
    where.incognitoMode = false

    // 🎭 STAP 1: Filter out showcase profielen in eerste query (alleen echte users)
    // Check if isShowcase column exists by checking environment/feature flag
    const showcaseFeatureEnabled = process.env.SHOWCASE_ENABLED === 'true'
    if (showcaseFeatureEnabled) {
      where.isShowcase = false
    }

    // 🛑 DEALBREAKER FILTERING - Apply user's dealbreakers
    const dealbreakers = currentUser.dealbreakers
    if (dealbreakers) {
      // Filter out smokers if user doesn't want them
      if (dealbreakers.mustNotSmoke) {
        where.OR = [
          { smoking: { not: 'regularly' } },
          { smoking: null },
        ]
      }

      // Filter out drinkers if user doesn't want them
      if (dealbreakers.mustNotDrink) {
        where.AND = where.AND || []
        ;(where.AND as Prisma.UserWhereInput[]).push({
          OR: [
            { drinking: { not: 'regularly' } },
            { drinking: null },
          ],
        })
      }

      // Filter for people who want children
      if (dealbreakers.mustWantChildren) {
        where.AND = where.AND || []
        ;(where.AND as Prisma.UserWhereInput[]).push({
          children: { in: ['want_someday', 'want', 'have'] },
        })
      }

      // Filter for people who DON'T want children
      if (dealbreakers.mustNotHaveChildren) {
        where.AND = where.AND || []
        ;(where.AND as Prisma.UserWhereInput[]).push({
          children: { in: ['dont_want', 'dont_have'] },
        })
      }

      // Filter for verified users only
      if (dealbreakers.mustBeVerified) {
        where.AND = where.AND || []
        ;(where.AND as Prisma.UserWhereInput[]).push({
          isVerified: true,
        })
      }

      // Height filters (if set)
      if (dealbreakers.minHeight) {
        where.AND = where.AND || []
        ;(where.AND as Prisma.UserWhereInput[]).push({
          height: { gte: dealbreakers.minHeight },
        })
      }
      if (dealbreakers.maxHeight) {
        where.AND = where.AND || []
        ;(where.AND as Prisma.UserWhereInput[]).push({
          height: { lte: dealbreakers.maxHeight },
        })
      }
    }

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
        lastSeen: true, // For AI activity matching
        interests: true, // For AI interest matching
        // Lifestyle fields
        occupation: true,
        education: true,
        height: true,
        drinking: true,
        smoking: true,
        children: true,
        // Advanced profile fields
        religion: true,
        languages: true,
        ethnicity: true,
        sports: true,
        // PsychProfile for personality & love language matching
        psychProfile: true,
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
    // Priority: filter maxDistance > dealbreaker maxDistance > preferences maxDistance
    const effectiveMaxDistance = filters.maxDistance ?? dealbreakers?.maxDistance ?? prefs.maxDistance
    let filteredMatches = potentialMatches
    if (effectiveLatitude && effectiveLongitude && effectiveMaxDistance) {
      filteredMatches = potentialMatches.filter(user => {
        if (!user.latitude || !user.longitude) return false
        const distance = calculateDistance(
          effectiveLatitude,
          effectiveLongitude,
          user.latitude,
          user.longitude
        )
        return distance <= effectiveMaxDistance
      })
    }

    // 🎭 STAP 2: INTELLIGENT FALLBACK - Als te weinig echte profielen, voeg showcase toe
    let showcaseProfiles: typeof potentialMatches = []
    let needsShowcase = false

    if (showcaseFeatureEnabled && filteredMatches.length < MIN_PROFILES_BEFORE_SHOWCASE) {
      needsShowcase = true
      console.log(`[Discover] 🎭 Fallback activated: Only ${filteredMatches.length} real profiles, fetching showcase profiles...`)

      // Build showcase query - less strict filters
      const showcaseWhere: Prisma.UserWhereInput = {
        id: { notIn: [...excludeIds, ...filteredMatches.map(u => u.id)] },
        profileImage: { not: null },
        isShowcase: true, // Only showcase profiles
        incognitoMode: false,
      }

      // Apply basic gender preference to showcase profiles
      if (filters.gender) {
        showcaseWhere.gender = filters.gender
      } else if (prefs.genderPreference) {
        showcaseWhere.gender = prefs.genderPreference
      }

      // Apply age range to showcase profiles (but more relaxed)
      const showcaseMinAge = (filters.minAge ?? prefs.minAge ?? 18) - 5
      const showcaseMaxAge = (filters.maxAge ?? prefs.maxAge ?? 99) + 5
      const showcaseBirthDateRange = ageToBirthDateRange(
        Math.max(18, showcaseMinAge),
        showcaseMaxAge
      )
      if (showcaseBirthDateRange) {
        showcaseWhere.birthDate = showcaseBirthDateRange
      }

      // Fetch showcase profiles
      showcaseProfiles = await prisma.user.findMany({
        where: showcaseWhere,
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
          lastSeen: true,
          interests: true,
          occupation: true,
          education: true,
          height: true,
          drinking: true,
          smoking: true,
          children: true,
          religion: true,
          languages: true,
          ethnicity: true,
          sports: true,
          psychProfile: true,
          photos: {
            select: { id: true, url: true, order: true },
            orderBy: { order: 'asc' },
          },
        },
        take: MAX_SHOWCASE_PROFILES,
        orderBy: { createdAt: 'desc' },
      })

      console.log(`[Discover] 🎭 Found ${showcaseProfiles.length} showcase profiles to fill the gap`)
    }

    // Combine real profiles with showcase profiles
    const allProfiles = [...filteredMatches, ...showcaseProfiles]
    const showcaseIds = new Set(showcaseProfiles.map(p => p.id))

    // Get boosted user IDs (reuse 'now' from passport check)
    const boostedUsers = await prisma.profileBoost.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now },
        userId: { in: allProfiles.map(u => u.id) },
      },
      select: { userId: true },
    })
    const boostedUserIds = new Set(boostedUsers.map(b => b.userId))

    // 🤖 AI MATCHING: Fetch current user's full profile for compatibility calculation
    const currentUserFull = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        interests: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
      },
    })

    const userProfile = {
      id: currentUser.id,
      interests: currentUserFull?.interests || null,
      bio: currentUserFull?.bio || null,
      city: effectiveCity,
      latitude: effectiveLatitude,
      longitude: effectiveLongitude,
      lastSeen: currentUserFull?.lastSeen || null,
      createdAt: currentUserFull?.createdAt || new Date(),
      // NEW: Lifestyle fields
      smoking: currentUser.smoking,
      drinking: currentUser.drinking,
      children: currentUser.children,
      height: currentUser.height,
      // NEW: PsychProfile for personality & love language matching
      psychProfile: currentUser.psychProfile,
    }

    // 🤖 AI MATCHING ACTIVE - Calculate compatibility scores for all matches (7 factors!)
    console.log(`[AI Matching] Calculating compatibility for ${allProfiles.length} profiles (${filteredMatches.length} real + ${showcaseProfiles.length} showcase)`)
    const matchesWithScores = allProfiles.map(match => {
      const targetProfile = {
        id: match.id,
        interests: match.interests,
        bio: match.bio,
        city: match.city,
        latitude: match.latitude,
        longitude: match.longitude,
        lastSeen: match.lastSeen,
        createdAt: match.createdAt,
        // NEW: Lifestyle fields
        smoking: match.smoking,
        drinking: match.drinking,
        children: match.children,
        height: match.height,
        // NEW: PsychProfile for personality & love language matching
        psychProfile: match.psychProfile,
      }

      const compatibility = calculateCompatibility(userProfile, targetProfile)

      return {
        ...match,
        compatibilityScore: compatibility.overallScore,
        compatibilityDetails: {
          interestScore: compatibility.interestScore,
          bioScore: compatibility.bioScore,
          locationScore: compatibility.locationScore,
          activityScore: compatibility.activityScore,
          // NEW: Additional scores
          personalityScore: compatibility.personalityScore,
          loveLanguageScore: compatibility.loveLanguageScore,
          lifestyleScore: compatibility.lifestyleScore,
        },
        // NEW: Match explanations (Dutch)
        matchExplanations: compatibility.explanations,
      }
    })

    // Sort: boosted users first → then by AI compatibility score → then by createdAt
    const sortedMatches = matchesWithScores.sort((a, b) => {
      const aIsBoosted = boostedUserIds.has(a.id)
      const bIsBoosted = boostedUserIds.has(b.id)

      // Boosted users always come first
      if (aIsBoosted && !bIsBoosted) return -1
      if (!aIsBoosted && bIsBoosted) return 1

      // If both boosted or both not boosted, sort by AI compatibility score
      if (a.compatibilityScore !== b.compatibilityScore) {
        return b.compatibilityScore - a.compatibilityScore
      }

      // If scores are equal, sort by recency
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Paginate and format
    const users: any[] = sortedMatches.slice(0, limit).map(user => ({
      ...user,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
      // FIX: Convert interests from string to array for frontend compatibility
      interests: Array.isArray(user.interests)
        ? user.interests
        : typeof user.interests === 'string' && user.interests
          ? user.interests.split(',').map((i: string) => i.trim())
          : [],
      isBoosted: boostedUserIds.has(user.id),
      // 🎭 SHOWCASE FLAG - Swipes op showcase profielen worden niet opgeslagen
      isShowcase: showcaseIds.has(user.id),
      // Include AI compatibility score (0-100)
      matchScore: user.compatibilityScore,
      matchQuality: user.compatibilityScore >= 75 ? 'excellent' :
                    user.compatibilityScore >= 60 ? 'good' : 'fair',
      // Detailed breakdown (7 factors - WERELDKLASSE!)
      compatibility: user.compatibilityScore,
      compatibilityBreakdown: {
        overall: user.compatibilityScore,
        interests: user.compatibilityDetails.interestScore,
        bio: user.compatibilityDetails.bioScore,
        location: user.compatibilityDetails.locationScore,
        activity: user.compatibilityDetails.activityScore,
        personality: user.compatibilityDetails.personalityScore,
        loveLanguage: user.compatibilityDetails.loveLanguageScore,
        lifestyle: user.compatibilityDetails.lifestyleScore,
      },
      // Match explanations (Dutch) - "Waarom jullie matchen"
      matchReasons: user.matchExplanations,
      // Remove psychProfile from response (internal use only)
      psychProfile: undefined,
    }))

    // Count real profiles only for pagination
    const realProfileCount = filteredMatches.length
    const totalCount = await prisma.user.count({ where })

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total: totalCount + showcaseProfiles.length,
        totalPages: Math.ceil((totalCount + showcaseProfiles.length) / limit),
      },
      // Include passport info if active
      passport: isPassportActive ? {
        city: currentUser.passportCity,
        expiresAt: currentUser.passportExpiresAt,
      } : null,
      // 🎭 SHOWCASE METADATA - Voor frontend UX
      showcase: {
        enabled: needsShowcase,
        count: showcaseProfiles.length,
        realProfileCount: realProfileCount,
        message: needsShowcase
          ? 'We hebben voorbeeldprofielen toegevoegd zodat je de app kunt uitproberen!'
          : null,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}