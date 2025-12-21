/**
 * Top Picks API - Daily curated matches
 *
 * Algorithm factors:
 * - Profile completeness score
 * - Photo quality (has multiple photos)
 * - Verification status
 * - Activity level (recently active)
 * - Compatibility based on preferences
 * - Distance
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Gender } from '@prisma/client'

// Calculate profile completeness score (0-100)
function calculateProfileScore(user: any): number {
  let score = 0

  // Basic info (40 points)
  if (user.name) score += 10
  if (user.bio && user.bio.length > 50) score += 15
  if (user.birthDate) score += 5
  if (user.city) score += 10

  // Photos (30 points)
  const photoCount = user.photos?.length || 0
  if (photoCount >= 1) score += 10
  if (photoCount >= 3) score += 10
  if (photoCount >= 5) score += 10

  // Verification (15 points)
  if (user.isVerified) score += 15

  // Extra details (15 points)
  if (user.interests) score += 8
  if (user.voiceIntro) score += 7

  return Math.min(score, 100)
}

// Calculate activity score based on last active
function calculateActivityScore(updatedAt: Date): number {
  const now = new Date()
  const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)

  if (hoursDiff < 1) return 100 // Online now
  if (hoursDiff < 6) return 90
  if (hoursDiff < 24) return 70
  if (hoursDiff < 48) return 50
  if (hoursDiff < 168) return 30 // Within a week
  return 10
}

// Calculate distance score (closer = higher)
function calculateDistanceScore(distance: number): number {
  if (distance <= 5) return 100
  if (distance <= 10) return 90
  if (distance <= 25) return 70
  if (distance <= 50) return 50
  if (distance <= 100) return 30
  return 10
}

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current user with preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        gender: true,
        lookingFor: true,
        latitude: true,
        longitude: true,
        birthDate: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Get users already swiped
    const swipedUsers = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    })
    const swipedUserIds = swipedUsers.map((s) => s.swipedId)

    // Build gender filter based on lookingFor preference
    let genderFilter: Gender[] = []
    if (currentUser.lookingFor === 'MALE') {
      genderFilter = [Gender.MALE]
    } else if (currentUser.lookingFor === 'FEMALE') {
      genderFilter = [Gender.FEMALE]
    } else {
      // BOTH or not set - show all genders
      genderFilter = [Gender.MALE, Gender.FEMALE, Gender.NON_BINARY]
    }

    // Get potential matches with good profiles
    const potentialPicks = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...swipedUserIds, userId],
        },
        gender: { in: genderFilter },
        // Must have at least one photo
        OR: [
          { profileImage: { not: null } },
          { photos: { some: {} } },
        ],
      },
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
        photos: {
          orderBy: { order: 'asc' },
          take: 3,
        },
        birthDate: true,
        city: true,
        isVerified: true,
        updatedAt: true,
        latitude: true,
        longitude: true,
        interests: true,
        voiceIntro: true,
      },
      take: 100, // Get more candidates for scoring
    })

    // Calculate scores and pick top 10
    const scoredPicks = potentialPicks.map((user) => {
      // Calculate distance
      let distance = 0
      if (currentUser.latitude && currentUser.longitude && user.latitude && user.longitude) {
        distance = calculateDistance(
          currentUser.latitude,
          currentUser.longitude,
          user.latitude,
          user.longitude
        )
      }

      // Calculate composite score
      const profileScore = calculateProfileScore(user)
      const activityScore = calculateActivityScore(user.updatedAt)
      const distanceScore = calculateDistanceScore(distance)

      // Weighted total (profile 40%, activity 35%, distance 25%)
      const totalScore =
        profileScore * 0.4 + activityScore * 0.35 + distanceScore * 0.25

      // Bonus for verified users
      const verifiedBonus = user.isVerified ? 10 : 0

      return {
        ...user,
        distance,
        score: totalScore + verifiedBonus,
        profileScore,
        activityScore,
        age: user.birthDate
          ? Math.floor(
              (Date.now() - new Date(user.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : null,
      }
    })

    // Sort by score and take top 10
    const topPicks = scoredPicks
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((pick) => ({
        id: pick.id,
        name: pick.name,
        age: pick.age,
        bio: pick.bio,
        photo: pick.photos[0]?.url || pick.profileImage,
        photos: pick.photos,
        city: pick.city,
        distance: pick.distance,
        isVerified: pick.isVerified,
        lastActive: pick.updatedAt,
        matchScore: Math.round(pick.score),
      }))

    // Get today's date for "picks refresh" timer
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const hoursUntilRefresh = Math.floor(
      (tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60)
    )

    return NextResponse.json({
      picks: topPicks,
      total: topPicks.length,
      refreshIn: hoursUntilRefresh,
      refreshAt: tomorrow.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching top picks:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van top picks' },
      { status: 500 }
    )
  }
}
