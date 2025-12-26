import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Check Redis cache first (5 min TTL)
    const cacheKey = `admin:matches:${page}:${limit}`
    const redis = getRedis()

    if (redis) {
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          console.log('[Matches] Cache HIT - returning cached matches')
          return NextResponse.json(JSON.parse(cached))
        }
      } catch (error) {
        console.warn('[Cache] Redis get failed:', error)
      }
    }

    console.log('[Matches] Cache MISS - fetching from database')

    // PERFORMANCE FIX: Run all queries in parallel
    const [matches, total, matchesLast30Days, totalMessagesResult] = await Promise.all([
      prisma.match.findMany({
        select: {
          id: true,
          createdAt: true,
          user1: {
            select: {
              id: true,
              name: true,
              email: true,
              safetyScore: true
            }
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true,
              safetyScore: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.match.count(), // Total matches (removed duplicate query)
      prisma.match.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // OPTIMIZATION: Use aggregate instead of fetching all matches
      prisma.message.groupBy({
        by: ['matchId'],
        _count: {
          id: true
        }
      })
    ])

    // Calculate average messages per match
    const totalMessages = totalMessagesResult.reduce((sum, group) => sum + group._count.id, 0)
    const avgMessagesPerMatch = total > 0 ? totalMessages / total : 0

    const response = {
      matches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        totalMatches: total, // Use total from parallel query
        matchesLast30Days,
        avgMessagesPerMatch: Math.round(avgMessagesPerMatch * 100) / 100
      }
    }

    // Cache response for 5 minutes
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(response))
        console.log('[Matches] Cached matches for 5 minutes')
      } catch (error) {
        console.warn('[Cache] Redis set failed:', error)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}