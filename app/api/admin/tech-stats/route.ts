import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/tech-stats
 *
 * Fetches technical dashboard statistics:
 * - Safety monitoring (scam detections, reports, blocks, verifications)
 * - Conversion funnel (visitors → registrations → profile → swipe → match → message)
 * - Error logs from audit trail
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all stats in parallel for performance
    const [
      // Safety stats
      scamReportsToday,
      reportsToday,
      blocksToday,
      verificationsToday,

      // Funnel stats (last 7 days)
      totalVisitors,
      registrations,
      profilesComplete,
      usersWithSwipes,
      usersWithMatches,
      usersWithMessages,

      // Error logs (from audit log where success = false)
      errorLogs,
      activeErrorCount
    ] = await Promise.all([
      // Scam detections (reports with reason containing 'scam' or 'fake')
      prisma.report.count({
        where: {
          createdAt: { gte: today },
          OR: [
            { reason: { contains: 'scam', mode: 'insensitive' } },
            { reason: { contains: 'fake', mode: 'insensitive' } },
            { reason: { contains: 'nep', mode: 'insensitive' } },
            { reason: { contains: 'oplichting', mode: 'insensitive' } }
          ]
        }
      }),

      // All reports today
      prisma.report.count({
        where: { createdAt: { gte: today } }
      }),

      // Blocks today (users who blocked other users)
      prisma.block.count({
        where: { createdAt: { gte: today } }
      }),

      // Photo verifications completed today
      prisma.user.count({
        where: {
          isPhotoVerified: true,
          updatedAt: { gte: today }
        }
      }),

      // Visitors estimation (unique page views or sessions - using active users as proxy)
      // In production, this would come from analytics (Vercel Analytics, Google Analytics, etc.)
      prisma.user.count({
        where: { lastSeen: { gte: weekAgo } }
      }).then(count => Math.round(count * 2.5)), // Estimate: ~2.5x visitors vs active users

      // Registrations last 7 days
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } }
      }),

      // Profiles with completed onboarding (has bio, photos, preferences)
      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          bio: { not: null },
          photos: { some: {} }
        }
      }),

      // Users who made at least one swipe
      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          outgoingSwipes: { some: {} }
        }
      }),

      // Users who got at least one match
      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          OR: [
            { matches1: { some: {} } },
            { matches2: { some: {} } }
          ]
        }
      }),

      // Users who sent at least one message
      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          messages: { some: {} }
        }
      }),

      // Recent errors from audit log
      prisma.auditLog.findMany({
        where: {
          success: false,
          createdAt: { gte: weekAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Count of unresolved errors (recent failures)
      prisma.auditLog.count({
        where: {
          success: false,
          createdAt: { gte: today }
        }
      })
    ])

    // Categorize error logs
    const categorizedErrors = errorLogs.map(log => {
      let type: 'API' | 'Database' | 'Upload' | 'Auth' = 'API'
      let status: 'open' | 'monitoring' | 'resolved' = 'open'

      // Determine error type based on action
      if (log.action.includes('LOGIN') || log.action.includes('AUTH') || log.action.includes('PASSWORD')) {
        type = 'Auth'
      } else if (log.action.includes('UPLOAD') || log.action.includes('PHOTO')) {
        type = 'Upload'
      } else if (log.action.includes('DB') || log.action.includes('DATABASE')) {
        type = 'Database'
      }

      // Check if error is older than 1 hour (likely being monitored/resolved)
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      if (log.createdAt < hourAgo) {
        status = 'resolved'
      } else if (log.createdAt < new Date(now.getTime() - 15 * 60 * 1000)) {
        status = 'monitoring'
      }

      // Extract message from details
      let message = log.action.replace(/_/g, ' ').toLowerCase()
      if (log.details) {
        try {
          const details = JSON.parse(log.details)
          message = details.error || details.message || message
        } catch {
          // Keep original message
        }
      }

      return {
        id: log.id,
        type,
        message: message.slice(0, 50), // Truncate long messages
        status,
        timestamp: log.createdAt,
        count: 1
      }
    })

    // Group similar errors
    const groupedErrors = Object.values(
      categorizedErrors.reduce((acc, error) => {
        const key = `${error.type}-${error.message}`
        if (acc[key]) {
          acc[key].count++
          // Keep most recent timestamp
          if (error.timestamp > acc[key].timestamp) {
            acc[key].timestamp = error.timestamp
            acc[key].status = error.status
          }
        } else {
          acc[key] = { ...error }
        }
        return acc
      }, {} as Record<string, typeof categorizedErrors[0]>)
    ).slice(0, 4) // Keep top 4

    // Determine system status
    let systemStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK'
    if (activeErrorCount > 10 || scamReportsToday > 20) {
      systemStatus = 'CRITICAL'
    } else if (activeErrorCount > 3 || scamReportsToday > 5 || reportsToday > 10) {
      systemStatus = 'WARNING'
    }

    const response = {
      safety: {
        scamDetections: scamReportsToday,
        reports: reportsToday,
        blocks: blocksToday,
        verifications: verificationsToday,
        systemStatus
      },
      funnel: {
        visitors: totalVisitors,
        registrations,
        profileComplete: profilesComplete,
        firstSwipe: usersWithSwipes,
        firstMatch: usersWithMatches,
        firstMessage: usersWithMessages,
        period: 'Laatste 7 dagen'
      },
      errors: groupedErrors,
      activeErrorCount
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch tech stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tech stats' },
      { status: 500 }
    )
  }
}
