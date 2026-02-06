/**
 * Migration Claim API
 *
 * GET: Get migration user data by claim token
 * POST: Process account claim
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find migration user by claim token
    const migrationUsers = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        "firstName",
        "lastName",
        "oldEmail",
        "oldProfilePhoto",
        "memberSince",
        "photoCount",
        "messageCount",
        "matchCount",
        segment,
        status,
        "couponCode",
        "couponExpiresAt",
        "claimTokenExpiresAt"
      FROM "MigrationUser"
      WHERE "claimToken" = ${token}
      LIMIT 1
    `

    if (migrationUsers.length === 0) {
      return NextResponse.json(
        { error: 'Token niet gevonden' },
        { status: 404 }
      )
    }

    const user = migrationUsers[0]

    // Check if already claimed
    if (user.status === 'CLAIMED' || user.status === 'ACTIVATED') {
      return NextResponse.json(
        { error: 'Account is al geactiveerd', alreadyClaimed: true },
        { status: 410 }
      )
    }

    // Check if token expired
    if (user.claimTokenExpiresAt && new Date(user.claimTokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Deze link is verlopen', expired: true },
        { status: 410 }
      )
    }

    // Track landing page visit
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        status = CASE
          WHEN status NOT IN ('LANDING_VISITED', 'CLAIM_STARTED', 'CLAIMED', 'ACTIVATED')
          THEN 'LANDING_VISITED'
          ELSE status
        END,
        "landingVisitedAt" = COALESCE("landingVisitedAt", NOW()),
        "updatedAt" = NOW()
      WHERE "claimToken" = ${token}
    `

    // Get stats for social proof
    let activatedCount = 0
    let recentCount = 0
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT
          COUNT(CASE WHEN status IN ('CLAIMED', 'ACTIVATED') THEN 1 END) as "activatedCount",
          COUNT(CASE WHEN status IN ('CLAIMED', 'ACTIVATED') AND "claimedAt" > NOW() - INTERVAL '7 days' THEN 1 END) as "recentCount"
        FROM "MigrationUser"
      `
      activatedCount = Number(stats[0]?.activatedCount) || 0
      recentCount = Number(stats[0]?.recentCount) || 0
    } catch (e) {
      // Ignore stats error, use defaults
    }

    // Calculate days remaining for coupon
    const daysRemaining = user.couponExpiresAt
      ? Math.max(0, Math.ceil((new Date(user.couponExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30

    // Get incentive based on segment
    const incentives: Record<string, { premiumMonths: number; superMessages: number }> = {
      VIP: { premiumMonths: 3, superMessages: 10 },
      GOLD: { premiumMonths: 2, superMessages: 5 },
      ACTIVE: { premiumMonths: 1, superMessages: 3 },
      DORMANT: { premiumMonths: 1, superMessages: 5 },
      INACTIVE: { premiumMonths: 0, superMessages: 3 }
    }

    return NextResponse.json({
      success: true,
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.oldEmail,
        profilePhoto: user.oldProfilePhoto,
        memberSince: user.memberSince,
        photoCount: user.photoCount || 0,
        messageCount: user.messageCount || 0,
        matchCount: user.matchCount || 0,
        segment: user.segment,
        couponCode: user.couponCode,
        couponExpiresAt: user.couponExpiresAt,
        daysRemaining,
        incentive: incentives[user.segment] || incentives.INACTIVE,
        socialProof: {
          // Add 300 legacy members who migrated before tracking
          activatedCount: Number(activatedCount) + 300,
          recentCount: Number(recentCount)
        }
      }
    })
  } catch (error) {
    console.error('[Migration API] Error fetching user:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 8 tekens zijn' },
        { status: 400 }
      )
    }

    // Import and call the migration engine
    const { processAccountClaim } = await import('@/lib/migration/migration-engine')
    const result = await processAccountClaim(token, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: result.userId,
      message: 'Account succesvol geactiveerd!'
    })
  } catch (error) {
    console.error('[Migration API] Error claiming account:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het activeren' },
      { status: 500 }
    )
  }
}
