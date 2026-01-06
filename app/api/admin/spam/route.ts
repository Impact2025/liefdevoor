/**
 * Admin Spam Dashboard API
 *
 * Provides spam statistics and management for administrators.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUpstash } from '@/lib/upstash'
import { IPReputationTracker } from '@/lib/spam-guard/ip-reputation'

export async function GET(request: NextRequest) {
  // Auth check
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const redis = getUpstash()

    // Get blocked IPs
    const blockedIPs = await IPReputationTracker.getBlocked()

    // Get recent audit logs related to spam
    const spamLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: 'SPAM' } },
          { action: { contains: 'HONEYPOT' } },
          { action: { contains: 'BOT' } },
          { action: { contains: 'BLOCKED' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Get registration stats
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      registrations24h,
      registrations7d,
      registrations30d,
      blockedLast24h,
      blockedLast7d,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      prisma.user.count({ where: { createdAt: { gte: last7d } } }),
      prisma.user.count({ where: { createdAt: { gte: last30d } } }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'BLOCKED' },
          createdAt: { gte: last24h },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'BLOCKED' },
          createdAt: { gte: last7d },
        },
      }),
    ])

    // Count spam events by type
    const spamEventCounts = {
      honeypot: spamLogs.filter(l => l.action.includes('HONEYPOT')).length,
      disposableEmail: spamLogs.filter(l => l.details?.includes('disposable') || l.details?.includes('Wegwerp')).length,
      botTiming: spamLogs.filter(l => l.action.includes('BOT_TIMING')).length,
      ipBlocked: spamLogs.filter(l => l.action.includes('IP_BLOCKED')).length,
      turnstileFailed: spamLogs.filter(l => l.details?.includes('Turnstile')).length,
      suspiciousName: spamLogs.filter(l => l.details?.includes('name') || l.details?.includes('Naam')).length,
    }

    // Calculate block rate
    const totalAttempts = registrations24h + blockedLast24h
    const blockRate24h = totalAttempts > 0 ? (blockedLast24h / totalAttempts * 100).toFixed(1) : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        registrations: {
          last24h: registrations24h,
          last7d: registrations7d,
          last30d: registrations30d,
        },
        blocked: {
          last24h: blockedLast24h,
          last7d: blockedLast7d,
        },
        blockRate24h,
        spamEventCounts,
      },
      blockedIPs: blockedIPs.slice(0, 50), // Limit to 50
      recentLogs: spamLogs.slice(0, 50).map(log => ({
        id: log.id,
        action: log.action,
        details: log.details,
        ip: log.ipAddress,
        createdAt: log.createdAt,
      })),
    })
  } catch (error) {
    console.error('[Admin Spam API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch spam data' },
      { status: 500 }
    )
  }
}

// POST - Block/unblock IP
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, ip } = await request.json()

    if (!ip || !action) {
      return NextResponse.json(
        { success: false, error: 'IP and action required' },
        { status: 400 }
      )
    }

    if (action === 'block') {
      await IPReputationTracker.update(ip, {
        spamAccountCreated: true,
        flag: 'admin_blocked',
      })

      return NextResponse.json({
        success: true,
        message: `IP ${ip} is nu geblokkeerd`,
      })
    }

    if (action === 'unblock') {
      const redis = getUpstash()
      if (redis) {
        await redis.del(`spam:ip:${ip}`)
      }

      return NextResponse.json({
        success: true,
        message: `IP ${ip} is gedeblokkeerd`,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Admin Spam API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update IP' },
      { status: 500 }
    )
  }
}
