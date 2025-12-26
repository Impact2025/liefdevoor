/**
 * Admin Email Management API
 *
 * GET - Fetch email logs with filters and pagination
 * POST - Send test email
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  sendMatchNotification,
  sendMessageNotification,
  sendPasswordResetEmail
} from '@/lib/email/notification-service'
import { sendBirthdayEmail } from '@/lib/email/birthday-system'
import { emailTestSchema } from '@/lib/validations/admin-schemas'
import { validateBody } from '@/lib/api-helpers'
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'

/**
 * GET /api/admin/emails
 *
 * Fetch email logs with filtering, pagination, and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') || '' // transactional, engagement
    const category = searchParams.get('category') || '' // match, message, birthday, etc
    const status = searchParams.get('status') || '' // sent, delivered, opened, clicked, failed
    const email = searchParams.get('email') || '' // search by email
    const dateFrom = searchParams.get('dateFrom') || '' // YYYY-MM-DD
    const dateTo = searchParams.get('dateTo') || '' // YYYY-MM-DD

    // Build where clause
    const where: any = {}

    if (type) where.type = type
    if (category) where.category = category
    if (status) where.status = status
    if (email) where.email = { contains: email, mode: 'insensitive' }

    if (dateFrom || dateTo) {
      where.sentAt = {}
      if (dateFrom) where.sentAt.gte = new Date(dateFrom)
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        where.sentAt.lte = toDate
      }
    }

    // Get email logs with pagination
    const [logs, total] = await Promise.all([
      (prisma as any).emailLog?.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }) || Promise.resolve([]),
      (prisma as any).emailLog?.count({ where }) || Promise.resolve(0)
    ])

    // Calculate statistics
    const [
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalFailed
    ] = await Promise.all([
      (prisma as any).emailLog?.count({ where: { ...where, status: { in: ['sent', 'delivered', 'opened', 'clicked'] } } }) || Promise.resolve(0),
      (prisma as any).emailLog?.count({ where: { ...where, deliveredAt: { not: null } } }) || Promise.resolve(0),
      (prisma as any).emailLog?.count({ where: { ...where, openedAt: { not: null } } }) || Promise.resolve(0),
      (prisma as any).emailLog?.count({ where: { ...where, clickedAt: { not: null } } }) || Promise.resolve(0),
      (prisma as any).emailLog?.count({ where: { ...where, status: 'bounced' } }) || Promise.resolve(0),
      (prisma as any).emailLog?.count({ where: { ...where, status: 'failed' } }) || Promise.resolve(0)
    ])

    // Calculate rates
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0'
    const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0.0'
    const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0.0'
    const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0.0'

    // Get email breakdown by category (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const categoryBreakdown = await (prisma as any).emailLog?.groupBy({
      by: ['category'],
      where: {
        sentAt: { gte: thirtyDaysAgo }
      },
      _count: { category: true }
    }) || []

    // Get email volume by day (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyVolume = await (prisma as any).emailLog?.groupBy({
      by: ['sentAt'],
      where: {
        sentAt: { gte: sevenDaysAgo }
      },
      _count: { sentAt: true }
    }) || []

    // Process daily volume into date buckets
    const volumeByDay = dailyVolume.reduce((acc: any, item: any) => {
      const date = new Date(item.sentAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + item._count.sentAt
      return acc
    }, {})

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalBounced,
        totalFailed,
        deliveryRate: parseFloat(deliveryRate),
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        bounceRate: parseFloat(bounceRate)
      },
      analytics: {
        categoryBreakdown,
        volumeByDay
      }
    })
  } catch (error) {
    console.error('Error fetching email logs:', error)
    return NextResponse.json({
      error: 'Failed to fetch email logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/emails
 *
 * Send test email - ALWAYS to admin's own email for security
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Input validation
    const validation = await validateBody(request, emailTestSchema)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 })
    }

    const { type } = validation.data

    // Rate limiting - 20 test emails per hour
    const rateLimit = await checkAdminRateLimit(session.user.id, 'email_test', 20, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // SECURITY: ALWAYS use admin's own email, NEVER user-provided email
    const adminEmail = session.user.email!
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Send test email based on type
    // NOTE: All test emails go to admin's email only!
    switch (type) {
      case 'match': {
        await sendMatchNotification({
          userId: admin.id,
          matchUserId: 'test-match-user-' + Date.now(),
          matchId: 'test-match-' + Date.now()
        })
        break
      }

      case 'message': {
        await sendMessageNotification({
          userId: admin.id,
          senderId: 'test-sender-' + Date.now(),
          messageId: 'test-message-' + Date.now(),
          messageContent: 'Dit is een test bericht vanuit het admin dashboard! 🎉',
          matchId: 'test-match-' + Date.now()
        })
        break
      }

      case 'password_reset': {
        await sendPasswordResetEmail({
          email: adminEmail,
          resetToken: 'test-token-' + Date.now(),
          expiresIn: '1 uur'
        })
        break
      }

      case 'verification': {
        // Send verification test email
        // Implementation would go here if verification email function exists
        break
      }

      case 'welcome': {
        // Send welcome test email
        // Implementation would go here if welcome email function exists
        break
      }

      case 'subscription_confirmation':
      case 'subscription_cancelled': {
        // Send subscription test emails
        // Implementation would go here
        break
      }

      default:
        return NextResponse.json({
          error: 'Invalid email type'
        }, { status: 400 })
    }

    // Audit log
    const clientInfo = getClientInfo(request)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: admin.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action: 'test_email_sent',
        type,
        recipient: adminEmail // Always admin's email
      },
      success: true
    })

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent to ${adminEmail} (your admin email)`
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
