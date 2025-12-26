/**
 * Conversation Moderation API
 *
 * GET - Fetch flagged conversations for moderation
 * POST - Take moderation action on a conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'

interface FlaggedConversation {
  matchId: string
  user1: {
    id: string
    name: string | null
    email: string | null
    safetyScore: number
  }
  user2: {
    id: string
    name: string | null
    email: string | null
    safetyScore: number
  }
  messageCount: number
  lastMessageAt: Date
  recentMessages: Array<{
    id: string
    content: string | null
    audioUrl: string | null
    gifUrl: string | null
    senderId: string
    createdAt: Date
  }>
  flags: Array<{
    type: 'report' | 'low_safety_score' | 'suspicious_activity'
    severity: 'low' | 'medium' | 'high' | 'critical'
    reason: string
    createdAt: Date
  }>
  riskScore: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const flaggedConversations: FlaggedConversation[] = []

    // 1. Get conversations with reports
    const reportedMatches = await prisma.report.findMany({
      where: {
        status: { in: ['pending', 'under_review'] }
      },
      include: {
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
            safetyScore: true,
            matches1: {
              include: {
                user2: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    safetyScore: true
                  }
                },
                messages: {
                  orderBy: { createdAt: 'desc' },
                  take: 10
                }
              }
            },
            matches2: {
              include: {
                user1: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    safetyScore: true
                  }
                },
                messages: {
                  orderBy: { createdAt: 'desc' },
                  take: 10
                }
              }
            }
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            safetyScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Process reported matches
    const processedMatchIds = new Set<string>()

    for (const report of reportedMatches) {
      const allMatches = [
        ...report.reported.matches1,
        ...report.reported.matches2
      ]

      for (const match of allMatches) {
        if (processedMatchIds.has(match.id)) continue
        processedMatchIds.add(match.id)

        const user1 = 'user1' in match ? match.user1 : report.reported
        const user2 = 'user2' in match ? match.user2 : report.reported
        const messages = match.messages || []

        const lastMessage = messages[0]
        const riskScore = calculateRiskScore(
          user1.safetyScore,
          user2.safetyScore,
          messages.length,
          [report]
        )

        flaggedConversations.push({
          matchId: match.id,
          user1: {
            id: user1.id,
            name: user1.name,
            email: user1.email,
            safetyScore: user1.safetyScore
          },
          user2: {
            id: user2.id,
            name: user2.name,
            email: user2.email,
            safetyScore: user2.safetyScore
          },
          messageCount: messages.length,
          lastMessageAt: lastMessage?.createdAt || new Date(),
          recentMessages: messages.slice(0, 5),
          flags: [
            {
              type: 'report',
              severity: getSeverityFromReason(report.reason),
              reason: `Reported by ${report.reporter.name || 'User'}: ${report.reason}`,
              createdAt: report.createdAt
            }
          ],
          riskScore
        })
      }
    }

    // 2. Get conversations with low safety scores (if not already flagged)
    if (filter === 'all' || filter === 'low_safety') {
      const lowSafetyMatches = await prisma.match.findMany({
        where: {
          OR: [
            {
              user1: {
                safetyScore: { lt: 50 }
              }
            },
            {
              user2: {
                safetyScore: { lt: 50 }
              }
            }
          ],
          messages: {
            some: {}
          }
        },
        include: {
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
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        },
        take: 20
      })

      for (const match of lowSafetyMatches) {
        if (processedMatchIds.has(match.id)) continue
        processedMatchIds.add(match.id)

        const minSafetyScore = Math.min(
          match.user1.safetyScore,
          match.user2.safetyScore
        )

        const riskScore = calculateRiskScore(
          match.user1.safetyScore,
          match.user2.safetyScore,
          match.messages.length,
          []
        )

        flaggedConversations.push({
          matchId: match.id,
          user1: match.user1,
          user2: match.user2,
          messageCount: match.messages.length,
          lastMessageAt: match.messages[0]?.createdAt || new Date(),
          recentMessages: match.messages.slice(0, 5),
          flags: [
            {
              type: 'low_safety_score',
              severity: minSafetyScore < 30 ? 'critical' : minSafetyScore < 50 ? 'high' : 'medium',
              reason: `User safety score: ${minSafetyScore}/100`,
              createdAt: new Date()
            }
          ],
          riskScore
        })
      }
    }

    // Sort by risk score (highest first)
    flaggedConversations.sort((a, b) => b.riskScore - a.riskScore)

    return NextResponse.json({
      conversations: flaggedConversations.slice(0, limit),
      total: flaggedConversations.length,
      filters: {
        current: filter,
        available: ['all', 'reports_only', 'low_safety', 'high_risk']
      }
    })

  } catch (error) {
    console.error('Error fetching moderation queue:', error)
    return NextResponse.json({
      error: 'Failed to fetch moderation queue',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, matchId, messageIds, userId, reason } = body

    const clientInfo = getClientInfo(request)

    switch (action) {
      case 'delete_messages':
        if (!messageIds || !Array.isArray(messageIds)) {
          return NextResponse.json({ error: 'messageIds required' }, { status: 400 })
        }

        await prisma.message.deleteMany({
          where: {
            id: { in: messageIds },
            matchId
          }
        })

        await auditLogImmediate('ADMIN_ACTION', {
          userId: session.user.id,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          details: {
            action: 'DELETE_MESSAGES',
            matchId,
            messageIds,
            count: messageIds.length,
            reason
          },
          success: true
        })

        return NextResponse.json({
          success: true,
          message: `Deleted ${messageIds.length} messages`
        })

      case 'warn_user':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        // Update safety score
        await prisma.user.update({
          where: { id: userId },
          data: {
            safetyScore: {
              decrement: 10
            }
          }
        })

        await auditLogImmediate('ADMIN_ACTION', {
          userId: session.user.id,
          targetUserId: userId,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          details: {
            action: 'WARN_USER',
            matchId,
            reason,
            safetyScorePenalty: -10
          },
          success: true
        })

        return NextResponse.json({
          success: true,
          message: 'User warned, safety score decreased'
        })

      case 'ban_user':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            role: 'BANNED'
          }
        })

        await auditLogImmediate('ADMIN_ACTION', {
          userId: session.user.id,
          targetUserId: userId,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          details: {
            action: 'BAN_USER',
            matchId,
            reason
          },
          success: true
        })

        return NextResponse.json({
          success: true,
          message: 'User banned successfully'
        })

      case 'dismiss':
        // Resolve related reports
        await prisma.report.updateMany({
          where: {
            OR: [
              { reportedId: userId },
              { reporterId: userId }
            ],
            status: 'pending'
          },
          data: {
            status: 'dismissed',
            resolvedAt: new Date(),
            resolvedBy: session.user.id
          }
        })

        await auditLogImmediate('ADMIN_ACTION', {
          userId: session.user.id,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          details: {
            action: 'DISMISS_REPORTS',
            matchId,
            reason
          },
          success: true
        })

        return NextResponse.json({
          success: true,
          message: 'Reports dismissed'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error performing moderation action:', error)
    return NextResponse.json({
      error: 'Moderation action failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Calculate risk score based on multiple factors
 */
function calculateRiskScore(
  safety1: number,
  safety2: number,
  messageCount: number,
  reports: any[]
): number {
  let score = 0

  // Safety score contribution (0-40 points)
  const avgSafety = (safety1 + safety2) / 2
  score += (100 - avgSafety) * 0.4

  // Report contribution (0-40 points)
  score += Math.min(reports.length * 20, 40)

  // Message volume (0-20 points) - more messages = higher engagement = lower risk usually
  score += Math.max(20 - messageCount * 0.5, 0)

  return Math.min(Math.round(score), 100)
}

/**
 * Determine severity from report reason
 */
function getSeverityFromReason(reason: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerReason = reason.toLowerCase()

  if (lowerReason.includes('harassment') || lowerReason.includes('threat')) {
    return 'critical'
  }
  if (lowerReason.includes('inappropriate') || lowerReason.includes('spam')) {
    return 'high'
  }
  if (lowerReason.includes('fake') || lowerReason.includes('underage')) {
    return 'critical'
  }

  return 'medium'
}
