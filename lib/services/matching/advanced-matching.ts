/**
 * Advanced Matching Algorithm
 *
 * ML-inspired matching that considers:
 * - Preference compatibility
 * - Interest overlap
 * - Location/distance
 * - Activity patterns
 * - Engagement signals
 * - Historical success patterns
 */

import { prisma } from '@/lib/prisma'

// Types
interface UserProfile {
  id: string
  name: string
  age: number
  gender: string | null
  bio: string | null
  interests: string[]
  latitude: number | null
  longitude: number | null
  city: string | null
  isPhotoVerified: boolean
  lastSeen: Date | null
  profileImage: string | null
}

interface MatchScore {
  userId: string
  score: number
  factors: {
    preferenceMatch: number
    interestOverlap: number
    distance: number
    activity: number
    engagement: number
    verification: number
  }
  explanations: string[]
}

interface UserPreferences {
  minAge: number
  maxAge: number
  maxDistance: number
  genderPreference: string | null
}

// Scoring weights (tunable parameters)
const WEIGHTS = {
  preferenceMatch: 0.25,    // How well they match user's preferences
  interestOverlap: 0.20,    // Shared interests
  distance: 0.15,           // Geographic proximity
  activity: 0.15,           // Recent activity level
  engagement: 0.15,         // Historical engagement rate
  verification: 0.10,       // Verified profile boost
} as const

// Score thresholds
const THRESHOLDS = {
  minimum: 0.3,             // Minimum score to show
  good: 0.6,                // Good match
  excellent: 0.8,           // Excellent match
} as const

/**
 * Parse preferences from JSON string
 */
function parsePreferences(prefsString: string | null): UserPreferences {
  if (!prefsString) {
    return { minAge: 18, maxAge: 99, maxDistance: 100, genderPreference: null }
  }
  try {
    const parsed = JSON.parse(prefsString)
    return {
      minAge: parsed.minAge ?? 18,
      maxAge: parsed.maxAge ?? 99,
      maxDistance: parsed.maxDistance ?? 100,
      genderPreference: parsed.genderPreference ?? null,
    }
  } catch {
    return { minAge: 18, maxAge: 99, maxDistance: 100, genderPreference: null }
  }
}

/**
 * Parse interests from JSON string or comma-separated string
 */
function parseInterests(interestsString: string | null): string[] {
  if (!interestsString) return []
  try {
    const parsed = JSON.parse(interestsString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Try comma-separated
    return interestsString.split(',').map((i) => i.trim()).filter(Boolean)
  }
}

/**
 * Calculate match score between two users
 */
export async function calculateMatchScore(
  currentUser: UserProfile,
  targetUser: UserProfile,
  currentUserPrefs: UserPreferences
): Promise<MatchScore> {
  const factors = {
    preferenceMatch: 0,
    interestOverlap: 0,
    distance: 0,
    activity: 0,
    engagement: 0,
    verification: 0,
  }
  const explanations: string[] = []

  // 1. Preference Match Score
  factors.preferenceMatch = calculatePreferenceMatch(
    currentUserPrefs,
    targetUser,
    explanations
  )

  // 2. Interest Overlap Score
  factors.interestOverlap = calculateInterestOverlap(
    currentUser.interests,
    targetUser.interests,
    explanations
  )

  // 3. Distance Score
  factors.distance = calculateDistanceScore(
    currentUser.latitude,
    currentUser.longitude,
    targetUser.latitude,
    targetUser.longitude,
    currentUserPrefs.maxDistance,
    explanations
  )

  // 4. Activity Score
  factors.activity = calculateActivityScore(targetUser.lastSeen, explanations)

  // 5. Engagement Score (fetch from DB)
  factors.engagement = await calculateEngagementScore(targetUser.id, explanations)

  // 6. Verification Bonus
  factors.verification = targetUser.isPhotoVerified ? 1.0 : 0.5
  if (targetUser.isPhotoVerified) {
    explanations.push('Geverifieerd profiel')
  }

  // Calculate weighted score
  const score = Object.entries(WEIGHTS).reduce((total, [key, weight]) => {
    return total + factors[key as keyof typeof factors] * weight
  }, 0)

  return {
    userId: targetUser.id,
    score: Math.round(score * 100) / 100, // Round to 2 decimals
    factors,
    explanations,
  }
}

/**
 * Calculate preference match score
 */
function calculatePreferenceMatch(
  prefs: UserPreferences,
  target: UserProfile,
  explanations: string[]
): number {
  let score = 0
  let maxScore = 0

  // Age preference (50% of preference score)
  maxScore += 50
  if (target.age >= prefs.minAge && target.age <= prefs.maxAge) {
    score += 50
    explanations.push('Past bij leeftijdsvoorkeur')
  }

  // Gender preference (50% of preference score)
  maxScore += 50
  if (!prefs.genderPreference || prefs.genderPreference === target.gender) {
    score += 50
    if (target.gender) {
      explanations.push('Geslacht komt overeen')
    }
  }

  return maxScore > 0 ? score / maxScore : 0.5
}

/**
 * Calculate interest overlap using Jaccard similarity
 */
function calculateInterestOverlap(
  interests1: string[],
  interests2: string[],
  explanations: string[]
): number {
  if (interests1.length === 0 || interests2.length === 0) {
    return 0.5 // Neutral score if no interests
  }

  const set1 = new Set(interests1.map((i) => i.toLowerCase()))
  const set2 = new Set(interests2.map((i) => i.toLowerCase()))

  const intersection = Array.from(set1).filter((x) => set2.has(x))
  const unionArray = [...Array.from(set1), ...Array.from(set2)]
  const union = new Set(unionArray)

  const overlap = intersection.length / union.size

  if (intersection.length > 0) {
    explanations.push(`${intersection.length} gedeelde interesse${intersection.length > 1 ? 's' : ''}`)
  }

  // Apply sigmoid transformation for smoother scoring
  return sigmoid(overlap * 4 - 1)
}

/**
 * Calculate distance score using Haversine formula
 */
function calculateDistanceScore(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
  maxDistance: number,
  explanations: string[]
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return 0.5 // Neutral if no location
  }

  const distance = haversineDistance(lat1, lon1, lat2, lon2)

  if (distance <= maxDistance) {
    const score = 1 - (distance / maxDistance) * 0.5 // Higher score for closer
    if (distance < 10) {
      explanations.push('In de buurt')
    } else if (distance < 30) {
      explanations.push(`${Math.round(distance)} km afstand`)
    }
    return score
  }

  return 0 // Too far
}

/**
 * Calculate activity score based on last seen
 */
function calculateActivityScore(lastSeen: Date | null, explanations: string[]): number {
  if (!lastSeen) return 0.3

  const now = Date.now()
  const lastSeenTime = new Date(lastSeen).getTime()
  const hoursSince = (now - lastSeenTime) / (1000 * 60 * 60)

  if (hoursSince < 1) {
    explanations.push('Nu actief')
    return 1.0
  } else if (hoursSince < 24) {
    explanations.push('Recent actief')
    return 0.9
  } else if (hoursSince < 72) {
    return 0.7
  } else if (hoursSince < 168) { // 1 week
    return 0.5
  }

  return 0.3
}

/**
 * Calculate engagement score from historical data
 */
async function calculateEngagementScore(
  userId: string,
  explanations: string[]
): Promise<number> {
  try {
    // Get user's engagement metrics
    const [receivedLikes, receivedMatches, sentMessages] = await Promise.all([
      prisma.swipe.count({
        where: { swipedId: userId, isLike: true },
      }),
      prisma.match.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      }),
      prisma.message.count({
        where: { senderId: userId },
      }),
    ])

    // Calculate engagement rate
    const matchRate = receivedLikes > 0 ? receivedMatches / receivedLikes : 0
    const responseRate = sentMessages > 0 ? Math.min(sentMessages / (receivedMatches || 1), 1) : 0

    const score = (matchRate * 0.5 + responseRate * 0.5)

    if (score > 0.5) {
      explanations.push('Hoge response rate')
    }

    return Math.min(score * 2, 1) // Scale up, cap at 1
  } catch {
    return 0.5 // Default on error
  }
}

/**
 * Get ranked matches for a user
 */
export async function getRankedMatches(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{
  profiles: (UserProfile & { matchScore: MatchScore })[]
  total: number
}> {
  // Get current user profile and preferences
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      birthDate: true,
      gender: true,
      bio: true,
      interests: true,
      preferences: true,
      latitude: true,
      longitude: true,
      city: true,
      isPhotoVerified: true,
      lastSeen: true,
      profileImage: true,
    },
  })

  if (!currentUser) {
    throw new Error('User not found')
  }

  const preferences = parsePreferences(currentUser.preferences)

  // Calculate age from birthDate
  const userAge = currentUser.birthDate
    ? Math.floor((Date.now() - new Date(currentUser.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 25

  const userProfile: UserProfile = {
    id: currentUser.id,
    name: currentUser.name || '',
    age: userAge,
    gender: currentUser.gender,
    bio: currentUser.bio,
    interests: parseInterests(currentUser.interests),
    latitude: currentUser.latitude,
    longitude: currentUser.longitude,
    city: currentUser.city,
    isPhotoVerified: currentUser.isPhotoVerified,
    lastSeen: currentUser.lastSeen,
    profileImage: currentUser.profileImage,
  }

  // Get already swiped users
  const swipedUserIds = await prisma.swipe.findMany({
    where: { swiperId: userId },
    select: { swipedId: true },
  })
  const swipedIdsArray = swipedUserIds.map((s) => s.swipedId)
  swipedIdsArray.push(userId) // Exclude self

  // Get potential matches
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: swipedIdsArray },
      profileImage: { not: null },
    },
    select: {
      id: true,
      name: true,
      birthDate: true,
      gender: true,
      bio: true,
      interests: true,
      latitude: true,
      longitude: true,
      city: true,
      isPhotoVerified: true,
      lastSeen: true,
      profileImage: true,
    },
    take: 100, // Get more than needed for better scoring
  })

  // Calculate scores for all candidates
  const scoredCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      const candidateAge = candidate.birthDate
        ? Math.floor((Date.now() - new Date(candidate.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 25

      const candidateProfile: UserProfile = {
        id: candidate.id,
        name: candidate.name || '',
        age: candidateAge,
        gender: candidate.gender,
        bio: candidate.bio,
        interests: parseInterests(candidate.interests),
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        city: candidate.city,
        isPhotoVerified: candidate.isPhotoVerified,
        lastSeen: candidate.lastSeen,
        profileImage: candidate.profileImage,
      }

      const matchScore = await calculateMatchScore(userProfile, candidateProfile, preferences)

      return {
        ...candidateProfile,
        matchScore,
      }
    })
  )

  // Filter and sort by score
  const validCandidates = scoredCandidates
    .filter((c) => c.matchScore.score >= THRESHOLDS.minimum)
    .sort((a, b) => b.matchScore.score - a.matchScore.score)

  // Apply pagination
  const paginatedCandidates = validCandidates.slice(offset, offset + limit)

  return {
    profiles: paginatedCandidates,
    total: validCandidates.length,
  }
}

/**
 * Get compatibility percentage between two users
 */
export async function getCompatibility(
  userId1: string,
  userId2: string
): Promise<{ percentage: number; factors: string[] }> {
  const [user1, user2] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId1 },
      select: {
        id: true, name: true, birthDate: true, gender: true,
        bio: true, interests: true, preferences: true,
        latitude: true, longitude: true, city: true,
        isPhotoVerified: true, lastSeen: true, profileImage: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId2 },
      select: {
        id: true, name: true, birthDate: true, gender: true,
        bio: true, interests: true, preferences: true,
        latitude: true, longitude: true, city: true,
        isPhotoVerified: true, lastSeen: true, profileImage: true,
      },
    }),
  ])

  if (!user1 || !user2) {
    return { percentage: 0, factors: [] }
  }

  // Calculate mutual compatibility
  const calcAge = (bday: Date | null) => bday
    ? Math.floor((Date.now() - new Date(bday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 25

  const profile1: UserProfile = {
    id: user1.id,
    name: user1.name || '',
    age: calcAge(user1.birthDate),
    gender: user1.gender,
    bio: user1.bio,
    interests: parseInterests(user1.interests),
    latitude: user1.latitude,
    longitude: user1.longitude,
    city: user1.city,
    isPhotoVerified: user1.isPhotoVerified,
    lastSeen: user1.lastSeen,
    profileImage: user1.profileImage,
  }

  const profile2: UserProfile = {
    id: user2.id,
    name: user2.name || '',
    age: calcAge(user2.birthDate),
    gender: user2.gender,
    bio: user2.bio,
    interests: parseInterests(user2.interests),
    latitude: user2.latitude,
    longitude: user2.longitude,
    city: user2.city,
    isPhotoVerified: user2.isPhotoVerified,
    lastSeen: user2.lastSeen,
    profileImage: user2.profileImage,
  }

  const prefs1 = parsePreferences(user1.preferences)
  const prefs2 = parsePreferences(user2.preferences)

  const score1 = await calculateMatchScore(profile1, profile2, prefs1)
  const score2 = await calculateMatchScore(profile2, profile1, prefs2)

  const avgScore = (score1.score + score2.score) / 2

  const uniqueFactors = Array.from(new Set([...score1.explanations, ...score2.explanations]))

  return {
    percentage: Math.round(avgScore * 100),
    factors: uniqueFactors,
  }
}

// Helper functions

/**
 * Haversine formula to calculate distance between two coordinates
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Sigmoid function for smooth scoring
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}
