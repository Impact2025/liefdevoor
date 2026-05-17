import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'
import { requirePermission, AdminPermission } from '@/lib/permissions'
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin'
import { getUpstash } from '@/lib/upstash'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user, migrationUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          gender: true,
          birthDate: true,
          city: true,
          postcode: true,
          bio: true,
          profileImage: true,
          isVerified: true,
          isPhotoVerified: true,
          isOnboarded: true,
          profileComplete: true,
          subscriptionTier: true,
          credits: true,
          safetyScore: true,
          createdAt: true,
          lastSeen: true,
          isOnline: true,
          registrationSource: true,
          occupation: true,
          education: true,
          _count: {
            select: {
              matches1: true,
              matches2: true,
              photos: true,
            }
          },
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              plan: true,
              status: true,
              startDate: true,
              endDate: true,
              createdAt: true,
            }
          },
        }
      }),
      prisma.migrationUser.findUnique({
        where: { newUserId: params.id },
        select: {
          segment: true,
          status: true,
          claimedAt: true,
          couponCode: true,
          oldEmail: true,
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: { ...user, migrationUser } })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason } = body

    const validActions = ['ban', 'unban', 'promote', 'demote', 'verify', 'unverify'] as const
    type ValidAction = typeof validActions[number]

    if (!validActions.includes(action as ValidAction)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (['ban', 'delete'].includes(action) && !reason) {
      return NextResponse.json({ error: 'Reason is required for this action' }, { status: 400 })
    }

    // Check granular permissions
    const permissionMap: Record<ValidAction, AdminPermission> = {
      ban: AdminPermission.BAN_USERS,
      unban: AdminPermission.UNBAN_USERS,
      promote: AdminPermission.MANAGE_ADMINS,
      demote: AdminPermission.MANAGE_ADMINS,
      verify: AdminPermission.APPROVE_VERIFICATIONS,
      unverify: AdminPermission.APPROVE_VERIFICATIONS,
    }

    try {
      await requirePermission(session.user.id, permissionMap[action as ValidAction])
    } catch {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Rate limiting: 100 user actions per hour
    const rateLimit = await checkAdminRateLimit(session.user.id, 'user_action')
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent self-modification
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot perform this action on your own account' }, { status: 403 })
    }

    // Prevent actions on other admins (except demote)
    if (targetUser.role === 'ADMIN' && action !== 'demote') {
      return NextResponse.json({ error: 'Cannot perform this action on an admin user' }, { status: 403 })
    }

    const updateMap: Record<ValidAction, object> = {
      ban: { role: 'BANNED' },
      unban: { role: 'USER' },
      promote: { role: 'ADMIN' },
      demote: { role: 'USER' },
      verify: { isVerified: true },
      unverify: { isVerified: false },
    }

    const auditActionMap: Record<ValidAction, string> = {
      ban: 'USER_BANNED',
      unban: 'USER_UNBANNED',
      promote: 'USER_PROMOTED',
      demote: 'USER_DEMOTED',
      verify: 'ADMIN_ACTION',
      unverify: 'ADMIN_ACTION',
    }

    await prisma.user.update({
      where: { id: params.id },
      data: updateMap[action as ValidAction]
    })

    const clientInfo = getClientInfo(request)
    await auditLogImmediate(auditActionMap[action as ValidAction] as any, {
      userId: session.user.id,
      targetUserId: params.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action,
        targetEmail: targetUser.email,
        previousRole: targetUser.role,
        changes: updateMap[action as ValidAction],
        reason: reason || 'No reason provided'
      }
    })

    // Invalidate dashboard stats cache
    const upstash = getUpstash()
    if (upstash) {
      try {
        await upstash.del('admin:dashboard:stats')
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}ned successfully`,
      userId: params.id
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
