/**
 * Passport Mode API - Swipe in other cities (Premium feature)
 *
 * Wereldklasse features:
 * - Recent passport history (laatste 5)
 * - Favorite cities
 * - Distance from home
 * - Flexible duration (24u, 48u, 72u, 1 week)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'
import { DUTCH_CITIES } from '@/lib/services/geocoding'

// Popular Dutch cities for quick selection
const POPULAR_DUTCH_CITIES = [
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
  { name: 'Den Haag', lat: 52.0705, lng: 4.3007 },
  { name: 'Utrecht', lat: 52.0907, lng: 5.1214 },
  { name: 'Eindhoven', lat: 51.4416, lng: 5.4697 },
  { name: 'Groningen', lat: 53.2194, lng: 6.5665 },
  { name: 'Tilburg', lat: 51.5555, lng: 5.0913 },
  { name: 'Almere', lat: 52.3508, lng: 5.2647 },
  { name: 'Breda', lat: 51.5719, lng: 4.7683 },
  { name: 'Nijmegen', lat: 51.8126, lng: 5.8372 },
  { name: 'Maastricht', lat: 50.8514, lng: 5.6910 },
  { name: 'Arnhem', lat: 51.9851, lng: 5.8987 },
  { name: 'Haarlem', lat: 52.3874, lng: 4.6462 },
  { name: 'Amersfoort', lat: 52.1561, lng: 5.3878 },
  { name: 'Leiden', lat: 52.1601, lng: 4.4970 },
]

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        city: true,
        latitude: true,
        longitude: true,
        passportCity: true,
        passportLatitude: true,
        passportLongitude: true,
        passportExpiresAt: true,
        subscriptionTier: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Check if passport has expired
    const isExpired = user.passportExpiresAt && new Date(user.passportExpiresAt) < new Date()

    // Check if user has passport feature
    const hasPassportFeature = await hasFeature(user.id, 'canUsePassport')

    // Get recent passport history (last 5 unique cities)
    const recentHistory = await prisma.passportHistory.findMany({
      where: { userId: user.id },
      orderBy: { usedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        city: true,
        latitude: true,
        longitude: true,
        usedAt: true,
        duration: true,
      },
    })

    // Deduplicate by city name, keep most recent
    const seenCities = new Set<string>()
    const uniqueRecent = recentHistory.filter(h => {
      if (seenCities.has(h.city)) return false
      seenCities.add(h.city)
      return true
    }).slice(0, 5)

    // Get favorite cities
    const favoriteCities = await prisma.favoriteCity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    })

    // Get trending cities (most visited in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const trendingCitiesRaw = await prisma.passportHistory.groupBy({
      by: ['city', 'latitude', 'longitude'],
      where: {
        usedAt: { gte: sevenDaysAgo },
      },
      _count: {
        city: true,
      },
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
      take: 5,
    })

    const trendingCities = trendingCitiesRaw.map(t => ({
      city: t.city,
      latitude: t.latitude,
      longitude: t.longitude,
      travelers: t._count.city,
      distanceFromHome: user.latitude && user.longitude
        ? calculateDistance(user.latitude, user.longitude, t.latitude, t.longitude)
        : null,
    }))

    // Add distance from home to popular cities
    const popularWithDistance = POPULAR_DUTCH_CITIES.map(city => ({
      ...city,
      distanceFromHome: user.latitude && user.longitude
        ? calculateDistance(user.latitude, user.longitude, city.lat, city.lng)
        : null,
    }))

    return NextResponse.json({
      hasFeature: hasPassportFeature,
      currentPassport: isExpired ? null : user.passportCity ? {
        city: user.passportCity,
        latitude: user.passportLatitude,
        longitude: user.passportLongitude,
        expiresAt: user.passportExpiresAt,
      } : null,
      homeLocation: {
        city: user.city,
        latitude: user.latitude,
        longitude: user.longitude,
      },
      recentCities: uniqueRecent.map(h => ({
        ...h,
        distanceFromHome: user.latitude && user.longitude
          ? calculateDistance(user.latitude, user.longitude, h.latitude, h.longitude)
          : null,
      })),
      favoriteCities: favoriteCities.map(f => ({
        ...f,
        distanceFromHome: user.latitude && user.longitude
          ? calculateDistance(user.latitude, user.longitude, f.latitude, f.longitude)
          : null,
      })),
      popularCities: popularWithDistance,
      trendingCities,
    })
  } catch (error) {
    console.error('Error fetching passport:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Check if user has passport feature (COMPLETE tier only)
    const hasPassportFeature = await hasFeature(user.id, 'canUsePassport')
    if (!hasPassportFeature) {
      return NextResponse.json({
        error: 'Premium vereist',
        message: 'Passport is een Liefde Compleet functie. Upgrade om in andere steden te swipen!',
        upgradeUrl: '/prijzen',
      }, { status: 403 })
    }

    const body = await request.json()
    const { city, latitude, longitude, duration = 24 } = body

    if (!city || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Stad en coördinaten zijn verplicht' },
        { status: 400 }
      )
    }

    // Set passport expiration (default 24 hours, max 168 hours / 1 week)
    const hours = Math.min(Math.max(duration, 1), 168)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + hours)

    // Update user passport and create history record
    await prisma.$transaction([
      // Update current passport
      prisma.user.update({
        where: { id: user.id },
        data: {
          passportCity: city,
          passportLatitude: latitude,
          passportLongitude: longitude,
          passportExpiresAt: expiresAt,
        },
      }),
      // Create history record
      prisma.passportHistory.create({
        data: {
          userId: user.id,
          city,
          latitude,
          longitude,
          duration: hours,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      passport: {
        city,
        latitude,
        longitude,
        expiresAt,
      },
      message: `Je bent nu in ${city}! Passport verloopt over ${hours} uur.`,
    })
  } catch (error) {
    console.error('Error setting passport:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, city: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passportCity: null,
        passportLatitude: null,
        passportLongitude: null,
        passportExpiresAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Je bent terug in ${user.city || 'je eigen stad'}!`,
    })
  } catch (error) {
    console.error('Error clearing passport:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
