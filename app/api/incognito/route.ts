/**
 * Incognito Mode API - Browse without being seen (Premium feature)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'

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
        incognitoMode: true,
        subscriptionTier: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const hasIncognito = await hasFeature(user.id, 'canUseIncognito')

    return NextResponse.json({
      hasFeature: hasIncognito,
      isEnabled: user.incognitoMode,
      benefits: [
        'Je profiel verschijnt niet in Discover voor anderen',
        'Alleen mensen die jij liket kunnen je zien',
        'Browse volledig anoniem',
        'Je kunt nog steeds matchen met mensen die jij liket',
      ],
    })
  } catch (error) {
    console.error('Error fetching incognito status:', error)
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
      select: { id: true, incognitoMode: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Check if user has incognito feature
    const hasIncognito = await hasFeature(user.id, 'canUseIncognito')
    if (!hasIncognito) {
      return NextResponse.json({
        error: 'Premium vereist',
        message: 'Incognito Mode is een Liefde Compleet functie. Upgrade om anoniem te browsen!',
        upgradeUrl: '/prijzen',
      }, { status: 403 })
    }

    const body = await request.json()
    const { enabled } = body

    // Toggle or set specific value
    const newValue = enabled !== undefined ? enabled : !user.incognitoMode

    await prisma.user.update({
      where: { id: user.id },
      data: { incognitoMode: newValue },
    })

    return NextResponse.json({
      success: true,
      isEnabled: newValue,
      message: newValue
        ? 'Incognito mode ingeschakeld. Je bent nu onzichtbaar voor anderen.'
        : 'Incognito mode uitgeschakeld. Je profiel is weer zichtbaar.',
    })
  } catch (error) {
    console.error('Error toggling incognito:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
