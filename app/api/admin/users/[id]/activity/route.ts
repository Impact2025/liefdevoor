/**
 * User Activity Timeline API
 *
 * GET - Fetch complete activity history for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ActivityEvent {
  id: string
  type: 'swipe' | 'match' | 'message' | 'report' | 'login' | 'subscription'
  timestamp: Date
  icon: string
  title: string
  description: string
  metadata?: Record<string, any>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activities: ActivityEvent[] = []

    // 1. Fetch recent swipes (last 50)
    const swipes = await prisma.swipe.findMany({
      where: { swiperId: userId },
      include: {
        swiped: { select: { name: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    swipes.forEach(swipe => {
      activities.push({
        id: swipe.id,
        type: 'swipe',
        timestamp: swipe.createdAt,
        icon: swipe.isLike ? '👍' : '👎',
        title: swipe.isLike ? 'Liked profile' : 'Passed on profile',
        description: `${swipe.isLike ? 'Liked' : 'Passed on'} ${swipe.swiped.name || 'Unknown'}`,
        metadata: {
          swipedUserId: swipe.swipedId,
          isLike: swipe.isLike,
          isSuperLike: swipe.isSuperLike || false
        }
      })
    })

    // 2. Fetch matches (last 20)
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: { select: { name: true, profileImage: true } },
        user2: { select: { name: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    matches.forEach(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1
      activities.push({
        id: match.id,
        type: 'match',
        timestamp: match.createdAt,
        icon: '💚',
        title: 'New Match',
        description: `Matched with ${otherUser.name || 'Unknown'}`,
        metadata: {
          matchId: match.id,
          otherUserId: match.user1Id === userId ? match.user2Id : match.user1Id
        }
      })
    })

    // 3. Fetch messages (last 100)
    const messages = await prisma.message.findMany({
      where: { senderId: userId },
      include: {
        match: {
          include: {
            user1: { select: { name: true } },
            user2: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    messages.forEach(message => {
      const otherUser = message.match.user1Id === userId
        ? message.match.user2
        : message.match.user1

      activities.push({
        id: message.id,
        type: 'message',
        timestamp: message.createdAt,
        icon: '💬',
        title: 'Sent message',
        description: `Sent message to ${otherUser.name || 'Unknown'}`,
        metadata: {
          matchId: message.matchId,
          preview: message.content ? message.content.substring(0, 50) : message.audioUrl ? '[Voice message]' : '[GIF]'
        }
      })
    })

    // 4. Fetch reports (all)
    const reportsSent = await prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        reported: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    reportsSent.forEach(report => {
      activities.push({
        id: report.id,
        type: 'report',
        timestamp: report.createdAt,
        icon: '🚨',
        title: 'Reported user',
        description: `Reported ${report.reported.name || 'Unknown'} for ${report.reason}`,
        metadata: {
          reportedUserId: report.reportedId,
          reason: report.reason,
          status: report.status
        }
      })
    })

    const reportsReceived = await prisma.report.findMany({
      where: { reportedId: userId },
      include: {
        reporter: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    reportsReceived.forEach(report => {
      activities.push({
        id: report.id,
        type: 'report',
        timestamp: report.createdAt,
        icon: '⚠️',
        title: 'Was reported',
        description: `Reported by ${report.reporter.name || 'Unknown'} for ${report.reason}`,
        metadata: {
          reporterId: report.reporterId,
          reason: report.reason,
          status: report.status
        }
      })
    })

    // 5. Fetch login history from audit logs (last 50)
    const loginLogs = await prisma.auditLog.findMany({
      where: {
        userId: userId,
        action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    loginLogs.forEach(log => {
      activities.push({
        id: log.id,
        type: 'login',
        timestamp: log.createdAt,
        icon: log.action === 'LOGIN_SUCCESS' ? '🔐' : log.action === 'LOGOUT' ? '🔓' : '❌',
        title: log.action === 'LOGIN_SUCCESS' ? 'Logged in' : log.action === 'LOGOUT' ? 'Logged out' : 'Failed login',
        description: `${log.action.replace('_', ' ').toLowerCase()} from ${log.ipAddress || 'unknown IP'}`,
        metadata: {
          action: log.action,
          ip: log.ipAddress,
          success: log.success
        }
      })
    })

    // 6. Fetch subscriptions (all)
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })

    subscriptions.forEach(sub => {
      activities.push({
        id: sub.id,
        type: 'subscription',
        timestamp: sub.createdAt,
        icon: '💳',
        title: `${sub.plan} subscription`,
        description: `Subscription ${sub.status} - ${sub.plan}`,
        metadata: {
          plan: sub.plan,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          cancelledAt: sub.cancelledAt
        }
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      activities,
      stats: {
        totalSwipes: swipes.length,
        totalMatches: matches.length,
        totalMessages: messages.length,
        totalReportsSent: reportsSent.length,
        totalReportsReceived: reportsReceived.length,
        totalLogins: loginLogs.filter(l => l.action === 'LOGIN_SUCCESS').length,
        totalSubscriptions: subscriptions.length
      }
    })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json({
      error: 'Failed to fetch activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
