/**
 * Report User API - Wereldklasse Safety
 *
 * Report inappropriate behavior, fake profiles, harassment, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { auditLog } from '@/lib/audit'
import { isValidReportReason } from '@/lib/report-reasons'
import { sendSafetyAlertToAdmins } from '@/lib/email/admin-notification-service'

/**
 * POST /api/safety/report
 * Report a user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { reportedId, reason, description } = await request.json()

    if (!reportedId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!reason || !isValidReportReason(reason)) {
      return NextResponse.json({ error: 'Valid reason is required' }, { status: 400 })
    }

    // Check if user already reported this person
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        reportedId,
        status: 'pending',
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'Je hebt deze gebruiker al gerapporteerd' },
        { status: 400 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedId,
        reason,
        description,
        status: 'pending',
      },
    })

    // Audit log
    auditLog('USER_REPORTED', {
      userId: user.id,
      details: {
        reportId: report.id,
        reportedId,
        reason,
      },
    })

    // If user gets 3+ reports, auto-flag for review
    const reportCount = await prisma.report.count({
      where: {
        reportedId,
        status: 'pending',
      },
    })

    if (reportCount >= 3) {
      // Create admin notification
      await prisma.notification.create({
        data: {
          userId: reportedId,
          type: 'safety',
          title: 'Account onder Review',
          message: 'Je account is door meerdere gebruikers gerapporteerd en wordt gecontroleerd.',
        },
      })

      // Send URGENT admin email alert (non-blocking)
      sendSafetyAlertToAdmins({
        reportedUserId: reportedId,
        reportCount
      }).catch(err => console.error('[Safety] Admin alert failed:', err))
    }

    return successResponse({
      message: 'Rapportage ontvangen. We nemen dit serieus en zullen het onderzoeken.',
      report: {
        id: report.id,
        status: report.status,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/safety/report
 * Get user's reports (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check if admin
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const reports = await prisma.report.findMany({
      where: { status },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        reported: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return successResponse({ reports })
  } catch (error) {
    return handleApiError(error)
  }
}
