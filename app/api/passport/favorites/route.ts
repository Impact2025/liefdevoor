/**
 * Passport Favorites API - Save/remove favorite cities
 *
 * Features:
 * - Add city to favorites
 * - Remove city from favorites
 * - Max 10 favorites per user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'

const MAX_FAVORITES = 10

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

    // Check if user has passport feature
    const hasPassportFeature = await hasFeature(user.id, 'canUsePassport')
    if (!hasPassportFeature) {
      return NextResponse.json({
        error: 'Premium vereist',
        message: 'Favoriete steden is een Liefde Compleet functie.',
      }, { status: 403 })
    }

    const body = await request.json()
    const { city, latitude, longitude } = body

    if (!city || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Stad en coördinaten zijn verplicht' },
        { status: 400 }
      )
    }

    // Check current favorite count
    const currentCount = await prisma.favoriteCity.count({
      where: { userId: user.id },
    })

    if (currentCount >= MAX_FAVORITES) {
      return NextResponse.json({
        error: 'Maximum bereikt',
        message: `Je kunt maximaal ${MAX_FAVORITES} favoriete steden opslaan.`,
      }, { status: 400 })
    }

    // Create or update favorite (upsert)
    const favorite = await prisma.favoriteCity.upsert({
      where: {
        userId_city: {
          userId: user.id,
          city,
        },
      },
      update: {
        latitude,
        longitude,
      },
      create: {
        userId: user.id,
        city,
        latitude,
        longitude,
      },
    })

    return NextResponse.json({
      success: true,
      favorite,
      message: `${city} toegevoegd aan favorieten`,
    })
  } catch (error) {
    console.error('Error adding favorite city:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json(
        { error: 'Stad is verplicht' },
        { status: 400 }
      )
    }

    await prisma.favoriteCity.deleteMany({
      where: {
        userId: user.id,
        city,
      },
    })

    return NextResponse.json({
      success: true,
      message: `${city} verwijderd uit favorieten`,
    })
  } catch (error) {
    console.error('Error removing favorite city:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
