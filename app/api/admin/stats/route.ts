import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface DashboardStats {
  users: {
    total: number
    newToday: number
    newThisWeek: number
    newThisMonth: number
    verified: number
    premium: number
    active: number
    online: number
  }
  matches: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  messages: {
    total: number
    today: number
    averagePerMatch: number
  }
  swipes: {
    total: number
    today: number
    likeRate: number
    matchRate: number
    superLikes: number
  }
  reports: {
    pending: number
    resolved: number
    thisWeek: number
  }
  subscriptions: {
    active: number
    premium: number
    gold: number
  }
  engagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
  growth: {
    usersLastWeek: number[]
    matchesLastWeek: number[]
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Fetch all stats in parallel for performance
    const [
      // Users
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      verifiedUsers,
      activeUsers,
      onlineUsers,

      // Matches
      totalMatches,
      matchesToday,
      matchesWeek,
      matchesMonth,

      // Messages
      totalMessages,
      messagesToday,

      // Swipes
      totalSwipes,
      swipesToday,
      rightSwipes,
      superLikes,

      // Reports
      pendingReports,
      resolvedReports,
      reportsWeek,

      // Subscriptions
      activeSubscriptions,
      premiumSubscriptions,
      goldSubscriptions,

      // Engagement
      dau,
      wau,
      mau,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.user.count({ where: { isPhotoVerified: true } }),
      prisma.user.count({ where: { lastSeen: { gte: weekAgo } } }),
      prisma.user.count({ where: { lastSeen: { gte: fiveMinutesAgo } } }),

      // Matches
      prisma.match.count(),
      prisma.match.count({ where: { createdAt: { gte: today } } }),
      prisma.match.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.match.count({ where: { createdAt: { gte: monthAgo } } }),

      // Messages
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: today } } }),

      // Swipes
      prisma.swipe.count(),
      prisma.swipe.count({ where: { createdAt: { gte: today } } }),
      prisma.swipe.count({ where: { isLike: true } }),
      prisma.swipe.count({ where: { isSuperLike: true } }),

      // Reports
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.report.count({ where: { status: 'resolved' } }),
      prisma.report.count({ where: { createdAt: { gte: weekAgo } } }),

      // Subscriptions
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'active', plan: 'premium' } }),
      prisma.subscription.count({ where: { status: 'active', plan: 'gold' } }),

      // Engagement
      prisma.user.count({ where: { lastSeen: { gte: today } } }),
      prisma.user.count({ where: { lastSeen: { gte: weekAgo } } }),
      prisma.user.count({ where: { lastSeen: { gte: monthAgo } } }),
    ])

    // Calculate derived stats
    const likeRate = totalSwipes > 0 ? (rightSwipes / totalSwipes) * 100 : 0
    const matchRate = rightSwipes > 0 ? (totalMatches * 2 / rightSwipes) * 100 : 0
    const avgMessagesPerMatch = totalMatches > 0 ? totalMessages / totalMatches : 0

    // Get daily data for the last 7 days - OPTIMIZED: Single query with groupBy
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)

    // Parallel fetch of daily grouped data
    const [usersByDay, matchesByDay] = await Promise.all([
      prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: true,
      }).then(results => {
        // Group by date string
        const countByDate: Record<string, number> = {}
        results.forEach(r => {
          const dateKey = r.createdAt.toISOString().split('T')[0]
          countByDate[dateKey] = (countByDate[dateKey] || 0) + r._count
        })
        return countByDate
      }),
      prisma.match.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: true,
      }).then(results => {
        const countByDate: Record<string, number> = {}
        results.forEach(r => {
          const dateKey = r.createdAt.toISOString().split('T')[0]
          countByDate[dateKey] = (countByDate[dateKey] || 0) + r._count
        })
        return countByDate
      }),
    ])

    // Build arrays for each of the last 7 days
    const usersLastWeek: number[] = []
    const matchesLastWeek: number[] = []

    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = dayDate.toISOString().split('T')[0]
      usersLastWeek.push(usersByDay[dateKey] || 0)
      matchesLastWeek.push(matchesByDay[dateKey] || 0)
    }

    const stats: DashboardStats = {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
        verified: verifiedUsers,
        premium: premiumSubscriptions + goldSubscriptions,
        active: activeUsers,
        online: onlineUsers,
      },
      matches: {
        total: totalMatches,
        today: matchesToday,
        thisWeek: matchesWeek,
        thisMonth: matchesMonth,
      },
      messages: {
        total: totalMessages,
        today: messagesToday,
        averagePerMatch: Math.round(avgMessagesPerMatch * 10) / 10,
      },
      swipes: {
        total: totalSwipes,
        today: swipesToday,
        likeRate: Math.round(likeRate * 10) / 10,
        matchRate: Math.round(matchRate * 10) / 10,
        superLikes: superLikes,
      },
      reports: {
        pending: pendingReports,
        resolved: resolvedReports,
        thisWeek: reportsWeek,
      },
      subscriptions: {
        active: activeSubscriptions,
        premium: premiumSubscriptions,
        gold: goldSubscriptions,
      },
      engagement: {
        dailyActiveUsers: dau,
        weeklyActiveUsers: wau,
        monthlyActiveUsers: mau,
      },
      growth: {
        usersLastWeek,
        matchesLastWeek,
      },
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[Admin Stats] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
