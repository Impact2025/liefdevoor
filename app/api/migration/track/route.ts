/**
 * Migration Email Tracking API
 *
 * Tracks email opens and link clicks for migration campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET - Email open tracking pixel
 * Returns a 1x1 transparent GIF
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('t')
  const emailId = searchParams.get('e')

  if (token && emailId) {
    try {
      // Update migration email as opened
      await prisma.$executeRaw`
        UPDATE "MigrationEmail"
        SET
          "openedAt" = COALESCE("openedAt", NOW()),
          "openCount" = "openCount" + 1,
          "updatedAt" = NOW()
        WHERE id = ${emailId}
      `

      // Update migration user status
      await prisma.$executeRaw`
        UPDATE "MigrationUser"
        SET
          status = CASE
            WHEN status NOT IN ('LINK_CLICKED', 'LANDING_VISITED', 'CLAIM_STARTED', 'CLAIMED', 'ACTIVATED')
            THEN 'EMAIL_OPENED'
            ELSE status
          END,
          "lastEmailOpenedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE "claimToken" = ${token}
      `
    } catch (error) {
      console.error('[Migration Track] Open tracking failed:', error)
    }
  }

  // Return 1x1 transparent GIF
  const transparentGif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  )

  return new NextResponse(transparentGif, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

/**
 * POST - Click tracking
 */
export async function POST(request: NextRequest) {
  try {
    const { token, emailId, linkType } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Track click
    if (emailId) {
      await prisma.$executeRaw`
        UPDATE "MigrationEmail"
        SET
          "clickedAt" = COALESCE("clickedAt", NOW()),
          "clickCount" = "clickCount" + 1,
          "updatedAt" = NOW()
        WHERE id = ${emailId}
      `
    }

    // Update migration user status
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        status = CASE
          WHEN status NOT IN ('LANDING_VISITED', 'CLAIM_STARTED', 'CLAIMED', 'ACTIVATED')
          THEN 'LINK_CLICKED'
          ELSE status
        END,
        "lastEmailClickedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE "claimToken" = ${token}
    `

    // Log click for analytics
    await prisma.$executeRaw`
      INSERT INTO "MigrationClick" (id, "migrationUserId", "emailId", "linkType", "clickedAt")
      SELECT
        gen_random_uuid(),
        mu.id,
        ${emailId || null}::uuid,
        ${linkType || 'cta'},
        NOW()
      FROM "MigrationUser" mu
      WHERE mu."claimToken" = ${token}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Migration Track] Click tracking failed:', error)
    return NextResponse.json({ success: true }) // Don't fail silently
  }
}
