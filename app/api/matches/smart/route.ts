/**
 * Smart Matches API
 *
 * GET /api/matches/smart - Get AI-powered smart matches with compatibility scores
 * POST /api/matches/smart/refresh - Recalculate compatibility scores
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSmartMatches, calculateAndStoreScores } from '@/lib/services/matching/compatibility-engine'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const matches = await getSmartMatches(session.user.id, Math.min(limit, 50))

    // Calculate age from birthDate
    const enrichedMatches = matches.map(m => {
      const user = m.user
      let age: number | null = null

      if (user?.birthDate) {
        const today = new Date()
        const birth = new Date(user.birthDate)
        age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--
        }
      }

      return {
        id: user?.id,
        name: user?.name,
        age,
        city: user?.city,
        bio: user?.bio,
        profileImage: user?.profileImage,
        photos: user?.photos?.map(p => p.url) || [],
        interests: user?.interests ? user.interests.split(',').map(i => i.trim()) : [],
        isOnline: user?.isOnline || false,
        isPhotoVerified: user?.isPhotoVerified || false,
        compatibility: {
          overall: m.compatibility.overallScore,
          interests: m.compatibility.interestScore,
          bio: m.compatibility.bioScore,
          location: m.compatibility.locationScore,
          activity: m.compatibility.activityScore,
        },
      }
    })

    return NextResponse.json({
      matches: enrichedMatches,
      count: enrichedMatches.length,
    })
  } catch (error) {
    console.error('Error fetching smart matches:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van matches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const limit = Math.min(body.limit || 50, 100)

    // Recalculate scores
    const scores = await calculateAndStoreScores(session.user.id, limit)

    return NextResponse.json({
      message: 'Compatibiliteit scores bijgewerkt',
      count: scores.length,
    })
  } catch (error) {
    console.error('Error refreshing compatibility scores:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het berekenen van scores' },
      { status: 500 }
    )
  }
}
