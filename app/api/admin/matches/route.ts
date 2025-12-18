import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const [matches, total] = await Promise.all([
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
      prisma.match.count()
    ])

    // Get match statistics
    const totalMatches = await prisma.match.count()
    const matchesLast30Days = await prisma.match.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Calculate average messages per match
    const matchesWithMessageCount = await prisma.match.findMany({
      select: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    })
    const totalMessages = matchesWithMessageCount.reduce((sum, match) => sum + match._count.messages, 0)
    const avgMessagesPerMatch = totalMatches > 0 ? totalMessages / totalMatches : 0

    return NextResponse.json({
      matches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        totalMatches,
        matchesLast30Days,
        avgMessagesPerMatch: Math.round(avgMessagesPerMatch * 100) / 100 // Round to 2 decimal places
      }
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}