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
 * Send test email
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, email } = body

    if (!type || !email) {
      return NextResponse.json({
        error: 'Missing required fields: type and email'
      }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        birthDate: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({
        error: 'User email is not verified'
      }, { status: 400 })
    }

    // Send test email based on type
    switch (type) {
      case 'match': {
        // Find another user for fake match
        const otherUser = await prisma.user.findFirst({
          where: {
            id: { not: user.id },
            emailVerified: { not: null }
          }
        })

        if (!otherUser) {
          return NextResponse.json({
            error: 'No other users available for test match'
          }, { status: 404 })
        }

        await sendMatchNotification({
          userId: user.id,
          matchUserId: otherUser.id,
          matchId: 'test-match-' + Date.now()
        })
        break
      }

      case 'message': {
        // Find another user for fake sender
        const sender = await prisma.user.findFirst({
          where: {
            id: { not: user.id },
            emailVerified: { not: null }
          }
        })

        if (!sender) {
          return NextResponse.json({
            error: 'No other users available for test sender'
          }, { status: 404 })
        }

        await sendMessageNotification({
          userId: user.id,
          senderId: sender.id,
          messageId: 'test-message-' + Date.now(),
          messageContent: 'Dit is een test bericht vanuit het admin dashboard! 🎉',
          matchId: 'test-match-' + Date.now()
        })
        break
      }

      case 'password-reset': {
        if (!user.email) {
          return NextResponse.json({ error: 'User has no email' }, { status: 400 })
        }
        await sendPasswordResetEmail({
          email: user.email,
          resetToken: 'test-token-' + Date.now(),
          expiresIn: '1 uur'
        })
        break
      }

      case 'birthday': {
        if (!user.birthDate) {
          return NextResponse.json({
            error: 'User has no birth date set'
          }, { status: 400 })
        }
        if (!user.email) {
          return NextResponse.json({ error: 'User has no email' }, { status: 400 })
        }

        const today = new Date()
        const age = today.getFullYear() - new Date(user.birthDate).getFullYear()

        await sendBirthdayEmail({
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          birthDate: user.birthDate,
          age
        })
        break
      }

      default:
        return NextResponse.json({
          error: 'Invalid email type. Valid types: match, message, password-reset, birthday'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent to ${email}`
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
