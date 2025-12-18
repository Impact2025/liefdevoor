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

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get total matches
    const totalMatches = await prisma.match.count()

    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await prisma.session.count({
      where: {
        expires: {
          gt: thirtyDaysAgo
        }
      }
    })

    // Get reported users (users with safety score below 50)
    const reportedUsers = await prisma.user.count({
      where: {
        safetyScore: {
          lt: 50
        }
      }
    })

    return NextResponse.json({
      totalUsers,
      totalMatches,
      activeUsers,
      reportedUsers
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}