/**
 * Passport Mode API - Swipe in other cities (Premium feature)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'

// Popular Dutch cities with coordinates
const DUTCH_CITIES = [
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
]

// International cities
const INTERNATIONAL_CITIES = [
  { name: 'Parijs', lat: 48.8566, lng: 2.3522 },
  { name: 'Londen', lat: 51.5074, lng: -0.1278 },
  { name: 'Berlijn', lat: 52.5200, lng: 13.4050 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
]

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
    const hasPassport = await hasFeature(user.id, 'canUsePassport')

    return NextResponse.json({
      hasFeature: hasPassport,
      currentCity: user.city,
      passport: isExpired ? null : {
        city: user.passportCity,
        latitude: user.passportLatitude,
        longitude: user.passportLongitude,
        expiresAt: user.passportExpiresAt,
      },
      availableCities: {
        dutch: DUTCH_CITIES,
        international: INTERNATIONAL_CITIES,
      },
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
    const hasPassport = await hasFeature(user.id, 'canUsePassport')
    if (!hasPassport) {
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passportCity: city,
        passportLatitude: latitude,
        passportLongitude: longitude,
        passportExpiresAt: expiresAt,
      },
    })

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
