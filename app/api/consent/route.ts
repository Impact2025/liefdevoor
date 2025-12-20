/**
 * Cookie Consent API
 * Handles storage and retrieval of user consent preferences
 *
 * GET /api/consent?userId=xxx - Get consent for user
 * POST /api/consent - Save consent
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET - Retrieve consent for user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Optional: Verify user has access to this data
    const session = await getServerSession(authOptions)
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find most recent consent for user
    const consent = await prisma.cookieConsent.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!consent) {
      return NextResponse.json(
        { error: 'No consent found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      necessary: consent.necessary,
      analytics: consent.analytics,
      marketing: consent.marketing,
      version: consent.consentVersion,
      timestamp: consent.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('[Consent API] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Save consent preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      necessary = true,
      analytics = false,
      marketing = false,
      consentVersion = '2.0',
    } = body

    // Get IP and user agent for audit trail
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create consent record
    const consent = await prisma.cookieConsent.create({
      data: {
        userId: userId || null, // Null for anonymous users
        necessary,
        analytics,
        marketing,
        consentVersion,
        ipAddress,
        userAgent,
      },
    })

    // Create consent history entry for audit trail
    await prisma.consentHistory.create({
      data: {
        userId: userId || null,
        consentId: consent.id,
        action: 'granted',
        categories: {
          necessary,
          analytics,
          marketing,
        },
        ipAddress,
        userAgent,
      },
    })

    console.log('[Consent API] Consent saved:', {
      userId: userId || 'anonymous',
      analytics,
      marketing,
    })

    return NextResponse.json({
      success: true,
      consentId: consent.id,
    })
  } catch (error) {
    console.error('[Consent API] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update existing consent
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      necessary = true,
      analytics = false,
      marketing = false,
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for updates' },
        { status: 400 }
      )
    }

    // Verify authorization
    const session = await getServerSession(authOptions)
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get IP and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Find existing consent
    const existingConsent = await prisma.cookieConsent.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Create new consent record (we keep history, not update)
    const newConsent = await prisma.cookieConsent.create({
      data: {
        userId,
        necessary,
        analytics,
        marketing,
        consentVersion: '2.0',
        ipAddress,
        userAgent,
      },
    })

    // Log consent change in history
    await prisma.consentHistory.create({
      data: {
        userId,
        consentId: newConsent.id,
        action: 'updated',
        categories: {
          necessary,
          analytics,
          marketing,
        },
        ipAddress,
        userAgent,
      },
    })

    console.log('[Consent API] Consent updated:', {
      userId,
      analytics,
      marketing,
    })

    return NextResponse.json({
      success: true,
      consentId: newConsent.id,
    })
  } catch (error) {
    console.error('[Consent API] PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Revoke consent (set everything to false except necessary)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify authorization
    const session = await getServerSession(authOptions)
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get IP and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create revoked consent (only necessary=true)
    const consent = await prisma.cookieConsent.create({
      data: {
        userId,
        necessary: true,
        analytics: false,
        marketing: false,
        consentVersion: '2.0',
        ipAddress,
        userAgent,
      },
    })

    // Log revocation in history
    await prisma.consentHistory.create({
      data: {
        userId,
        consentId: consent.id,
        action: 'revoked',
        categories: {
          necessary: true,
          analytics: false,
          marketing: false,
        },
        ipAddress,
        userAgent,
      },
    })

    console.log('[Consent API] Consent revoked for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Consent revoked',
    })
  } catch (error) {
    console.error('[Consent API] DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
