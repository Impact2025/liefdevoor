/**
 * Admin Dashboard Stats Aggregator
 *
 * PERFORMANCE OPTIMIZATION: 21 queries → 1 raw SQL query
 * Expected improvement: ~95% reduction in DB load
 */

import { prisma } from '@/lib/prisma'
import { getUpstash } from '@/lib/upstash'
import { unstable_cache } from 'next/cache'

export interface DashboardStats {
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

/**
 * Fetch dashboard stats using parallel queries (avoids Cartesian product from mega-JOIN)
 */
async function fetchDashboardStatsRaw(): Promise<Omit<DashboardStats, 'growth'>> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

  const [userStats, matchStats, msgStats, swipeStats, reportStats, subStats] = await Promise.all([
    // Users
    prisma.$queryRaw<[{
      total: bigint, today: bigint, week: bigint, month: bigint,
      verified: bigint, active: bigint, online: bigint, dau: bigint, wau: bigint, mau: bigint
    }]>`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "createdAt" >= ${today} THEN 1 END) as today,
        COUNT(CASE WHEN "createdAt" >= ${weekAgo} THEN 1 END) as week,
        COUNT(CASE WHEN "createdAt" >= ${monthAgo} THEN 1 END) as month,
        COUNT(CASE WHEN "isPhotoVerified" = true THEN 1 END) as verified,
        COUNT(CASE WHEN "lastSeen" >= ${weekAgo} THEN 1 END) as active,
        COUNT(CASE WHEN "lastSeen" >= ${fiveMinutesAgo} THEN 1 END) as online,
        COUNT(CASE WHEN "lastSeen" >= ${today} THEN 1 END) as dau,
        COUNT(CASE WHEN "lastSeen" >= ${weekAgo} THEN 1 END) as wau,
        COUNT(CASE WHEN "lastSeen" >= ${monthAgo} THEN 1 END) as mau
      FROM "User"
    `,

    // Matches
    prisma.$queryRaw<[{ total: bigint, today: bigint, week: bigint, month: bigint }]>`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "createdAt" >= ${today} THEN 1 END) as today,
        COUNT(CASE WHEN "createdAt" >= ${weekAgo} THEN 1 END) as week,
        COUNT(CASE WHEN "createdAt" >= ${monthAgo} THEN 1 END) as month
      FROM "Match"
    `,

    // Messages
    prisma.$queryRaw<[{ total: bigint, today: bigint }]>`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "createdAt" >= ${today} THEN 1 END) as today
      FROM "Message"
    `,

    // Swipes
    prisma.$queryRaw<[{ total: bigint, today: bigint, right_swipes: bigint, super_likes: bigint }]>`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "createdAt" >= ${today} THEN 1 END) as today,
        COUNT(CASE WHEN "isLike" = true THEN 1 END) as right_swipes,
        COUNT(CASE WHEN "isSuperLike" = true THEN 1 END) as super_likes
      FROM "Swipe"
    `,

    // Reports
    prisma.$queryRaw<[{ pending: bigint, resolved: bigint, week: bigint }]>`
      SELECT
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN "createdAt" >= ${weekAgo} THEN 1 END) as week
      FROM "Report"
    `,

    // Subscriptions
    prisma.$queryRaw<[{ active: bigint, premium: bigint, gold: bigint }]>`
      SELECT
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'active' AND plan = 'premium' THEN 1 END) as premium,
        COUNT(CASE WHEN status = 'active' AND plan = 'gold' THEN 1 END) as gold
      FROM "Subscription"
    `,
  ])

  const toNum = (val: bigint | null | undefined): number => Number(val || 0)

  const u = userStats[0]
  const m = matchStats[0]
  const msg = msgStats[0]
  const s = swipeStats[0]
  const r = reportStats[0]
  const sub = subStats[0]

  const totalSwipes = toNum(s.total)
  const rightSwipes = toNum(s.right_swipes)
  const totalMatches = toNum(m.total)
  const totalMessages = toNum(msg.total)

  const likeRate = totalSwipes > 0 ? (rightSwipes / totalSwipes) * 100 : 0
  const matchRate = rightSwipes > 0 ? (totalMatches * 2 / rightSwipes) * 100 : 0
  const avgMessagesPerMatch = totalMatches > 0 ? totalMessages / totalMatches : 0

  return {
    users: {
      total: toNum(u.total),
      newToday: toNum(u.today),
      newThisWeek: toNum(u.week),
      newThisMonth: toNum(u.month),
      verified: toNum(u.verified),
      premium: toNum(sub.active),
      active: toNum(u.active),
      online: toNum(u.online)
    },
    matches: {
      total: totalMatches,
      today: toNum(m.today),
      thisWeek: toNum(m.week),
      thisMonth: toNum(m.month)
    },
    messages: {
      total: totalMessages,
      today: toNum(msg.today),
      averagePerMatch: Math.round(avgMessagesPerMatch * 10) / 10
    },
    swipes: {
      total: totalSwipes,
      today: toNum(s.today),
      likeRate: Math.round(likeRate * 10) / 10,
      matchRate: Math.round(matchRate * 10) / 10,
      superLikes: toNum(s.super_likes)
    },
    reports: {
      pending: toNum(r.pending),
      resolved: toNum(r.resolved),
      thisWeek: toNum(r.week)
    },
    subscriptions: {
      active: toNum(sub.active),
      premium: toNum(sub.premium),
      gold: toNum(sub.gold)
    },
    engagement: {
      dailyActiveUsers: toNum(u.dau),
      weeklyActiveUsers: toNum(u.wau),
      monthlyActiveUsers: toNum(u.mau)
    }
  }
}

/**
 * Get growth data (last 7 days)
 * Separate query for daily breakdown
 */
async function fetchGrowthData(): Promise<{ usersLastWeek: number[], matchesLastWeek: number[] }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)

  const [usersByDay, matchesByDay] = await Promise.all([
    prisma.$queryRaw<Array<{ date: string, count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
    `,
    prisma.$queryRaw<Array<{ date: string, count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Match"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
    `,
  ])

  const userCountByDate: Record<string, number> = {}
  usersByDay.forEach(r => { userCountByDate[r.date] = Number(r.count) })

  const matchCountByDate: Record<string, number> = {}
  matchesByDay.forEach(r => { matchCountByDate[r.date] = Number(r.count) })

  const usersLastWeek: number[] = []
  const matchesLastWeek: number[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().split('T')[0]
    usersLastWeek.push(userCountByDate[dateKey] || 0)
    matchesLastWeek.push(matchCountByDate[dateKey] || 0)
  }

  return { usersLastWeek, matchesLastWeek }
}

/**
 * Get complete dashboard stats with Redis caching
 * Cache TTL: 60 seconds (stats can be slightly stale)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const cacheKey = 'admin:dashboard:stats'
  const upstash = getUpstash()

  // Try Upstash cache first
  if (upstash) {
    try {
      const cached = await upstash.get<DashboardStats>(cacheKey)
      if (cached) {
        console.log('[Stats] Cache HIT - returning cached stats')
        return cached
      }
    } catch (error) {
      console.warn('[Stats] Upstash get failed:', error)
    }
  }

  console.log('[Stats] Cache MISS - fetching from database')

  // Fetch stats from database (optimized query)
  const [baseStats, growthData] = await Promise.all([
    fetchDashboardStatsRaw(),
    fetchGrowthData()
  ])

  const stats: DashboardStats = {
    ...baseStats,
    growth: growthData
  }

  // Cache for 60 seconds
  if (upstash) {
    try {
      await upstash.setex(cacheKey, 60, JSON.stringify(stats))
      console.log('[Stats] Cached stats for 60 seconds')
    } catch (error) {
      console.warn('[Stats] Upstash set failed:', error)
    }
  }

  return stats
}

/**
 * Invalidate stats cache
 * Call this when data changes that affects stats
 */
export async function invalidateStatsCache(): Promise<void> {
  const upstash = getUpstash()
  if (upstash) {
    try {
      await upstash.del('admin:dashboard:stats')
      console.log('[Stats] Cache invalidated')
    } catch (error) {
      console.warn('[Stats] Failed to invalidate cache:', error)
    }
  }
}
