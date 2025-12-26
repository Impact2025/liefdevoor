/**
 * AI Smart Matching - Compatibility Engine (WERELDKLASSE)
 *
 * Calculates compatibility scores between users based on:
 * - Interest overlap (20%)
 * - Bio/About similarity (15%)
 * - Location proximity (15%)
 * - Activity level match (10%)
 * - Personality match (20%) - NEW: PsychProfile compatibility
 * - Love Language match (10%) - NEW: Chapman's 5 Love Languages
 * - Lifestyle match (10%) - NEW: Smoking, drinking, children preferences
 */

import { prisma } from '@/lib/prisma'
import { PsychProfile } from '@prisma/client'

interface UserProfile {
  id: string
  interests: string | null
  bio: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  lastSeen: Date | null
  createdAt: Date
  // Lifestyle fields
  smoking?: string | null
  drinking?: string | null
  children?: string | null
  height?: number | null
  // PsychProfile (optional, for enhanced matching)
  psychProfile?: PsychProfile | null
}

interface CompatibilityResult {
  targetUserId: string
  overallScore: number
  interestScore: number
  bioScore: number
  locationScore: number
  activityScore: number
  // New scores
  personalityScore: number
  loveLanguageScore: number
  lifestyleScore: number
  // Match explanations (Dutch)
  explanations: string[]
}

// New weighted scoring (total = 100%)
const WEIGHTS = {
  interests: 0.20,      // Was 0.40
  bio: 0.15,            // Was 0.30
  location: 0.15,       // Was 0.15
  activity: 0.10,       // Was 0.15
  personality: 0.20,    // NEW
  loveLanguage: 0.10,   // NEW
  lifestyle: 0.10,      // NEW
}

// Interest categories for semantic grouping
const INTEREST_CATEGORIES: Record<string, string[]> = {
  sports: ['voetbal', 'fitness', 'hardlopen', 'zwemmen', 'tennis', 'yoga', 'wandelen', 'fietsen', 'gym'],
  music: ['muziek', 'concert', 'gitaar', 'piano', 'zingen', 'dj', 'festivals'],
  culture: ['kunst', 'musea', 'theater', 'film', 'fotografie', 'lezen', 'boeken'],
  food: ['koken', 'eten', 'restaurants', 'wijn', 'bier', 'bakken', 'foodie'],
  travel: ['reizen', 'backpacken', 'vakantie', 'avontuur', 'natuur', 'kamperen'],
  social: ['uitgaan', 'vrienden', 'feesten', 'borrel', 'gezelligheid'],
  tech: ['gaming', 'technologie', 'computers', 'programmeren', 'gadgets'],
  animals: ['dieren', 'honden', 'katten', 'huisdieren', 'natuur'],
  creative: ['kunst', 'schrijven', 'tekenen', 'schilderen', 'diy', 'creatief'],
}

/**
 * Calculate interest overlap score (0-100)
 */
function calculateInterestScore(userInterests: string | null, targetInterests: string | null): number {
  if (!userInterests || !targetInterests) return 50 // Neutral score if no interests

  const parseInterests = (str: string): string[] => {
    return str.toLowerCase()
      .split(/[,;|]/)
      .map(i => i.trim())
      .filter(i => i.length > 0)
  }

  const user = parseInterests(userInterests)
  const target = parseInterests(targetInterests)

  if (user.length === 0 || target.length === 0) return 50

  // Direct matches
  const directMatches = user.filter(i => target.includes(i)).length

  // Category matches (interests in same category)
  const userCategories = new Set<string>()
  const targetCategories = new Set<string>()

  for (const [category, keywords] of Object.entries(INTEREST_CATEGORIES)) {
    if (user.some(i => keywords.some(k => i.includes(k)))) {
      userCategories.add(category)
    }
    if (target.some(i => keywords.some(k => i.includes(k)))) {
      targetCategories.add(category)
    }
  }

  const categoryMatches = Array.from(userCategories).filter(c => targetCategories.has(c)).length

  // Calculate score
  const maxPossibleDirect = Math.min(user.length, target.length)
  const maxPossibleCategory = Math.min(userCategories.size, targetCategories.size) || 1

  const directScore = maxPossibleDirect > 0 ? (directMatches / maxPossibleDirect) * 70 : 0
  const categoryScore = (categoryMatches / maxPossibleCategory) * 30

  return Math.min(100, Math.round(directScore + categoryScore))
}

/**
 * Calculate bio similarity score (0-100)
 * Uses simple keyword overlap for now
 */
function calculateBioScore(userBio: string | null, targetBio: string | null): number {
  if (!userBio || !targetBio) return 50 // Neutral score

  const extractKeywords = (text: string): Set<string> => {
    // Common Dutch stopwords
    const stopwords = new Set([
      'ik', 'je', 'de', 'het', 'een', 'en', 'van', 'in', 'op', 'met', 'voor',
      'is', 'dat', 'ben', 'heb', 'aan', 'die', 'naar', 'om', 'te', 'zijn',
      'ook', 'maar', 'als', 'bij', 'door', 'wel', 'niet', 'nog', 'dan', 'zo',
      'mijn', 'graag', 'veel', 'hou', 'houd', 'leuk', 'lekker'
    ])

    return new Set(
      text.toLowerCase()
        .replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûüñç\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopwords.has(word))
    )
  }

  const userKeywords = extractKeywords(userBio)
  const targetKeywords = extractKeywords(targetBio)

  if (userKeywords.size === 0 || targetKeywords.size === 0) return 50

  const matches = Array.from(userKeywords).filter(k => targetKeywords.has(k)).length
  const totalUnique = new Set(Array.from(userKeywords).concat(Array.from(targetKeywords))).size

  return Math.round((matches / totalUnique) * 100)
}

/**
 * Calculate location proximity score (0-100)
 */
function calculateLocationScore(
  userLat: number | null, userLon: number | null,
  targetLat: number | null, targetLon: number | null,
  userCity: string | null, targetCity: string | null
): number {
  // If same city, give high score
  if (userCity && targetCity && userCity.toLowerCase() === targetCity.toLowerCase()) {
    return 90
  }

  // If coordinates available, calculate distance
  if (userLat && userLon && targetLat && targetLon) {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon)

    // Score based on distance (0-50km = 100, 50-100km = 80, etc.)
    if (distance <= 10) return 100
    if (distance <= 25) return 90
    if (distance <= 50) return 75
    if (distance <= 100) return 60
    if (distance <= 200) return 40
    return 20
  }

  return 50 // Neutral if no location data
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Calculate activity level match score (0-100)
 */
function calculateActivityScore(
  userLastSeen: Date | null, userCreatedAt: Date,
  targetLastSeen: Date | null, targetCreatedAt: Date
): number {
  const now = new Date()

  // Calculate activity level for each user
  const getActivityLevel = (lastSeen: Date | null, createdAt: Date): number => {
    const reference = lastSeen || createdAt
    const daysSince = (now.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince < 1) return 5 // Very active
    if (daysSince < 3) return 4 // Active
    if (daysSince < 7) return 3 // Regular
    if (daysSince < 30) return 2 // Occasional
    return 1 // Inactive
  }

  const userActivity = getActivityLevel(userLastSeen, userCreatedAt)
  const targetActivity = getActivityLevel(targetLastSeen, targetCreatedAt)

  // Score based on how close their activity levels are
  const diff = Math.abs(userActivity - targetActivity)

  if (diff === 0) return 100
  if (diff === 1) return 75
  if (diff === 2) return 50
  if (diff === 3) return 25
  return 10
}

/**
 * Calculate personality compatibility score (0-100) - NEW
 * Based on PsychProfile scales
 */
function calculatePersonalityScore(
  userPsych: PsychProfile | null | undefined,
  targetPsych: PsychProfile | null | undefined
): { score: number; explanations: string[] } {
  const explanations: string[] = []

  if (!userPsych || !targetPsych) {
    return { score: 50, explanations } // Neutral score if no profile
  }

  let totalScore = 0
  let factors = 0

  // Personality scales comparison (similar = better)
  const scales = [
    { key: 'introvertScale', label: 'sociaal' },
    { key: 'spontaneityScale', label: 'spontaan' },
    { key: 'emotionalScale', label: 'emotioneel' },
    { key: 'adventureScale', label: 'avontuurlijk' },
  ] as const

  for (const scale of scales) {
    const userVal = userPsych[scale.key]
    const targetVal = targetPsych[scale.key]

    if (userVal !== null && targetVal !== null) {
      const diff = Math.abs(userVal - targetVal)
      // Score: 0 diff = 100, 1 diff = 90, etc.
      const scaleScore = Math.max(0, 100 - diff * 12)
      totalScore += scaleScore
      factors++

      // Add explanation for high matches
      if (diff <= 2) {
        if (scale.key === 'introvertScale' && userVal >= 6) {
          explanations.push('Jullie zijn allebei sociaal')
        } else if (scale.key === 'adventureScale' && userVal >= 6) {
          explanations.push('Jullie zijn allebei avontuurlijk')
        } else if (scale.key === 'spontaneityScale' && userVal >= 6) {
          explanations.push('Jullie zijn allebei spontaan')
        }
      }
    }
  }

  // Conflict style compatibility
  if (userPsych.conflictStyle && targetPsych.conflictStyle) {
    factors++
    // Collaborating is the ideal match for any style
    if (userPsych.conflictStyle === 'COLLABORATING' || targetPsych.conflictStyle === 'COLLABORATING') {
      totalScore += 90
      explanations.push('Goede communicatie over conflicten')
    } else if (userPsych.conflictStyle === targetPsych.conflictStyle) {
      totalScore += 80
    } else {
      // Avoiding + Competing is challenging
      if (
        (userPsych.conflictStyle === 'AVOIDING' && targetPsych.conflictStyle === 'COMPETING') ||
        (userPsych.conflictStyle === 'COMPETING' && targetPsych.conflictStyle === 'AVOIDING')
      ) {
        totalScore += 40
      } else {
        totalScore += 60
      }
    }
  }

  // Communication style
  if (userPsych.communicationStyle && targetPsych.communicationStyle) {
    factors++
    if (userPsych.communicationStyle === targetPsych.communicationStyle) {
      totalScore += 90
      explanations.push('Dezelfde communicatiestijl')
    } else {
      // Compatible styles: direct+analytical, diplomatic+expressive
      const compatiblePairs = [
        ['direct', 'analytical'],
        ['diplomatic', 'expressive'],
      ]
      const isCompatible = compatiblePairs.some(
        pair =>
          pair.includes(userPsych.communicationStyle!) &&
          pair.includes(targetPsych.communicationStyle!)
      )
      totalScore += isCompatible ? 70 : 50
    }
  }

  // Relationship goal match
  if (userPsych.relationshipGoal && targetPsych.relationshipGoal) {
    factors++
    if (userPsych.relationshipGoal === targetPsych.relationshipGoal) {
      totalScore += 100
      if (userPsych.relationshipGoal === 'serious') {
        explanations.push('Jullie zoeken allebei iets serieus')
      } else if (userPsych.relationshipGoal === 'marriage') {
        explanations.push('Jullie willen allebei trouwen')
      }
    } else if (
      (userPsych.relationshipGoal === 'open' || targetPsych.relationshipGoal === 'open')
    ) {
      totalScore += 70 // Open is flexible
    } else {
      totalScore += 30 // Mismatched goals
    }
  }

  return {
    score: factors > 0 ? Math.round(totalScore / factors) : 50,
    explanations,
  }
}

/**
 * Calculate love language compatibility score (0-100) - NEW
 */
function calculateLoveLanguageScore(
  userPsych: PsychProfile | null | undefined,
  targetPsych: PsychProfile | null | undefined
): { score: number; explanations: string[] } {
  const explanations: string[] = []

  if (!userPsych || !targetPsych) {
    return { score: 50, explanations }
  }

  const languages = [
    { key: 'loveLangWords', label: 'Complimenten' },
    { key: 'loveLangTime', label: 'Quality Time' },
    { key: 'loveLangGifts', label: 'Cadeaus' },
    { key: 'loveLangActs', label: 'Behulpzaamheid' },
    { key: 'loveLangTouch', label: 'Aanraking' },
  ] as const

  // Get primary love languages (highest scores)
  const getUserPrimary = (psych: PsychProfile): string | null => {
    let max = 0
    let primary: string | null = null
    for (const lang of languages) {
      const val = psych[lang.key]
      if (val !== null && val > max) {
        max = val
        primary = lang.label
      }
    }
    return primary
  }

  const userPrimary = getUserPrimary(userPsych)
  const targetPrimary = getUserPrimary(targetPsych)

  // Calculate overlap score
  let overlapScore = 0
  let count = 0

  for (const lang of languages) {
    const userVal = userPsych[lang.key]
    const targetVal = targetPsych[lang.key]

    if (userVal !== null && targetVal !== null) {
      // Both value this language similarly = good
      const diff = Math.abs(userVal - targetVal)
      overlapScore += Math.max(0, 100 - diff * 20)
      count++
    }
  }

  const score = count > 0 ? Math.round(overlapScore / count) : 50

  // Add explanation if primary love languages match
  if (userPrimary && targetPrimary && userPrimary === targetPrimary) {
    explanations.push(`${userPrimary} is voor jullie beiden belangrijk`)
  }

  return { score, explanations }
}

/**
 * Calculate lifestyle compatibility score (0-100) - NEW
 */
function calculateLifestyleScore(
  user: UserProfile,
  target: UserProfile
): { score: number; explanations: string[] } {
  const explanations: string[] = []
  let totalScore = 0
  let factors = 0

  // Smoking compatibility
  if (user.smoking && target.smoking) {
    factors++
    if (user.smoking === target.smoking) {
      totalScore += 100
      if (user.smoking === 'never') {
        explanations.push('Jullie roken allebei niet')
      }
    } else if (user.smoking === 'never' && target.smoking === 'regularly') {
      totalScore += 30 // Non-smoker + regular smoker = low compatibility
    } else {
      totalScore += 60 // Partial match
    }
  }

  // Drinking compatibility
  if (user.drinking && target.drinking) {
    factors++
    if (user.drinking === target.drinking) {
      totalScore += 100
    } else {
      totalScore += 60 // Drinking is less of a dealbreaker typically
    }
  }

  // Children compatibility (most important lifestyle factor)
  if (user.children && target.children) {
    factors += 2 // Double weight
    if (user.children === target.children) {
      totalScore += 200
      if (user.children === 'want_someday') {
        explanations.push('Jullie willen allebei ooit kinderen')
      } else if (user.children === 'have') {
        explanations.push('Jullie hebben allebei kinderen')
      }
    } else if (
      (user.children === 'want_someday' && target.children === 'dont_want') ||
      (user.children === 'dont_want' && target.children === 'want_someday')
    ) {
      totalScore += 40 // Major mismatch
    } else {
      totalScore += 120 // Partial match
    }
  }

  return {
    score: factors > 0 ? Math.round(totalScore / factors) : 50,
    explanations,
  }
}

/**
 * Generate shared interest explanations
 */
function generateInterestExplanations(userInterests: string | null, targetInterests: string | null): string[] {
  const explanations: string[] = []

  if (!userInterests || !targetInterests) return explanations

  const parseInterests = (str: string): string[] => {
    return str.toLowerCase()
      .split(/[,;|]/)
      .map(i => i.trim())
      .filter(i => i.length > 0)
  }

  const user = parseInterests(userInterests)
  const target = parseInterests(targetInterests)
  const shared = user.filter(i => target.includes(i))

  if (shared.length > 0) {
    // Pick first 2 shared interests for explanation
    const topShared = shared.slice(0, 2)
    if (topShared.length === 1) {
      explanations.push(`Jullie houden allebei van ${topShared[0]}`)
    } else if (topShared.length >= 2) {
      explanations.push(`Gedeelde interesses: ${topShared.join(' en ')}`)
    }
  }

  return explanations
}

/**
 * Calculate overall compatibility score for a target user
 */
export function calculateCompatibility(user: UserProfile, target: UserProfile): CompatibilityResult {
  const interestScore = calculateInterestScore(user.interests, target.interests)
  const bioScore = calculateBioScore(user.bio, target.bio)
  const locationScore = calculateLocationScore(
    user.latitude, user.longitude,
    target.latitude, target.longitude,
    user.city, target.city
  )
  const activityScore = calculateActivityScore(
    user.lastSeen, user.createdAt,
    target.lastSeen, target.createdAt
  )

  // NEW: Calculate personality, love language, and lifestyle scores
  const personalityResult = calculatePersonalityScore(user.psychProfile, target.psychProfile)
  const loveLanguageResult = calculateLoveLanguageScore(user.psychProfile, target.psychProfile)
  const lifestyleResult = calculateLifestyleScore(user, target)

  // NEW: Weighted average with all 7 factors
  const overallScore = Math.round(
    interestScore * WEIGHTS.interests +
    bioScore * WEIGHTS.bio +
    locationScore * WEIGHTS.location +
    activityScore * WEIGHTS.activity +
    personalityResult.score * WEIGHTS.personality +
    loveLanguageResult.score * WEIGHTS.loveLanguage +
    lifestyleResult.score * WEIGHTS.lifestyle
  )

  // NEW: Collect all explanations
  const explanations: string[] = [
    ...generateInterestExplanations(user.interests, target.interests),
    ...personalityResult.explanations,
    ...loveLanguageResult.explanations,
    ...lifestyleResult.explanations,
  ]

  // Add location explanation
  if (locationScore >= 90) {
    if (user.city && target.city && user.city.toLowerCase() === target.city.toLowerCase()) {
      explanations.push(`Woont ook in ${user.city}`)
    } else {
      explanations.push('Woont in de buurt')
    }
  }

  // Limit to top 5 explanations
  const topExplanations = explanations.slice(0, 5)

  return {
    targetUserId: target.id,
    overallScore,
    interestScore,
    bioScore,
    locationScore,
    activityScore,
    personalityScore: personalityResult.score,
    loveLanguageScore: loveLanguageResult.score,
    lifestyleScore: lifestyleResult.score,
    explanations: topExplanations,
  }
}

/**
 * Calculate and store compatibility scores for a user
 */
export async function calculateAndStoreScores(userId: string, limit = 100): Promise<CompatibilityResult[]> {
  // Get the user with PsychProfile and lifestyle data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      interests: true,
      bio: true,
      city: true,
      latitude: true,
      longitude: true,
      lastSeen: true,
      createdAt: true,
      gender: true,
      preferences: true,
      // NEW: Lifestyle fields
      smoking: true,
      drinking: true,
      children: true,
      height: true,
      // NEW: PsychProfile
      psychProfile: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get preferences for gender filter
  let genderPreference: string[] | undefined
  try {
    const prefs = (user.preferences as any) || {}
    genderPreference = prefs.interestedIn
  } catch {
    // Ignore errors
  }

  // Get potential matches (excluding blocked users and already swiped)
  const blockedIds = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: userId },
        { blockedId: userId },
      ],
    },
    select: {
      blockerId: true,
      blockedId: true,
    },
  })

  const excludeIds = new Set([
    userId,
    ...blockedIds.map(b => b.blockerId),
    ...blockedIds.map(b => b.blockedId),
  ])

  // Get already swiped users
  const swipedIds = await prisma.swipe.findMany({
    where: { swiperId: userId },
    select: { swipedId: true },
  })
  swipedIds.forEach(s => excludeIds.add(s.swipedId))

  // Build where clause
  const whereClause: Record<string, unknown> = {
    id: { notIn: Array.from(excludeIds) },
    profileImage: { not: null },
    role: 'USER',
  }

  if (genderPreference && genderPreference.length > 0) {
    whereClause.gender = { in: genderPreference }
  }

  // Get potential matches with PsychProfile and lifestyle data
  const potentialMatches = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      interests: true,
      bio: true,
      city: true,
      latitude: true,
      longitude: true,
      lastSeen: true,
      createdAt: true,
      // NEW: Lifestyle fields
      smoking: true,
      drinking: true,
      children: true,
      height: true,
      // NEW: PsychProfile
      psychProfile: true,
    },
    take: limit * 2, // Get more to filter/sort
  })

  // Calculate scores
  const results: CompatibilityResult[] = potentialMatches.map(target =>
    calculateCompatibility(user, target)
  )

  // Sort by overall score and take top results
  results.sort((a, b) => b.overallScore - a.overallScore)
  const topResults = results.slice(0, limit)

  // Store scores in database
  const upsertPromises = topResults.map(result =>
    prisma.matchScore.upsert({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId: result.targetUserId,
        },
      },
      create: {
        userId,
        targetUserId: result.targetUserId,
        overallScore: result.overallScore,
        interestScore: result.interestScore,
        bioScore: result.bioScore,
        locationScore: result.locationScore,
        activityScore: result.activityScore,
      },
      update: {
        overallScore: result.overallScore,
        interestScore: result.interestScore,
        bioScore: result.bioScore,
        locationScore: result.locationScore,
        activityScore: result.activityScore,
      },
    })
  )

  await Promise.all(upsertPromises)

  return topResults
}

/**
 * Get cached compatibility scores for a user
 */
export async function getCachedScores(userId: string, limit = 50): Promise<CompatibilityResult[]> {
  const scores = await prisma.matchScore.findMany({
    where: { userId },
    orderBy: { overallScore: 'desc' },
    take: limit,
  })

  return scores.map(s => ({
    targetUserId: s.targetUserId,
    overallScore: s.overallScore,
    interestScore: s.interestScore,
    bioScore: s.bioScore,
    locationScore: s.locationScore,
    activityScore: s.activityScore,
    // New fields (not cached, use defaults)
    personalityScore: 50,
    loveLanguageScore: 50,
    lifestyleScore: 50,
    explanations: [],
  }))
}

/**
 * Get smart matches with user data
 */
export async function getSmartMatches(userId: string, limit = 20) {
  // First check if we have cached scores
  let scores = await getCachedScores(userId, limit)

  // If no scores or scores are stale, recalculate
  if (scores.length === 0) {
    scores = await calculateAndStoreScores(userId, limit)
  }

  // Get user data for the matches
  const targetIds = scores.map(s => s.targetUserId)

  const users = await prisma.user.findMany({
    where: { id: { in: targetIds } },
    select: {
      id: true,
      name: true,
      bio: true,
      birthDate: true,
      city: true,
      profileImage: true,
      interests: true,
      isOnline: true,
      lastSeen: true,
      isPhotoVerified: true,
      photos: {
        orderBy: { order: 'asc' },
        take: 5,
      },
    },
  })

  // Map users to scores
  const userMap = new Map(users.map(u => [u.id, u]))

  return scores
    .map(score => ({
      user: userMap.get(score.targetUserId),
      compatibility: score,
    }))
    .filter(m => m.user !== undefined)
}
