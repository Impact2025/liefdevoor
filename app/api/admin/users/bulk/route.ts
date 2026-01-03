/**
 * Bulk User Actions API
 *
 * POST - Perform bulk actions on multiple users
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bulkUserActionSchema, validateBody } from '@/lib/validations/admin-schemas'
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'
import { getUpstash } from '@/lib/upstash'
import { requirePermission, AdminPermission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    const validation = await validateBody(request, bulkUserActionSchema)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 })
    }

    const { userIds, action, reason } = validation.data

    // Check granular permissions based on action
    try {
      switch (action) {
        case 'ban':
          await requirePermission(session.user.id, AdminPermission.BAN_USERS)
          break
        case 'unban':
          await requirePermission(session.user.id, AdminPermission.UNBAN_USERS)
          break
        case 'approve':
          await requirePermission(session.user.id, AdminPermission.APPROVE_VERIFICATIONS)
          break
        case 'reject':
          await requirePermission(session.user.id, AdminPermission.RESOLVE_REPORTS)
          break
      }
    } catch (permissionError) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        message: permissionError instanceof Error ? permissionError.message : 'Permission denied'
      }, { status: 403 })
    }

    // Rate limiting - stricter for bulk actions (10 per hour)
    const rateLimit = await checkAdminRateLimit(session.user.id, 'bulk_action', 10, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Validate users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (users.length !== userIds.length) {
      return NextResponse.json({
        error: 'Some users not found',
        found: users.length,
        requested: userIds.length
      }, { status: 404 })
    }

    // Prevent banning other admins
    if (action === 'ban') {
      const adminUsers = users.filter(u => u.role === 'ADMIN')
      if (adminUsers.length > 0) {
        return NextResponse.json({
          error: 'Cannot ban admin users',
          adminUsers: adminUsers.map(u => u.email)
        }, { status: 403 })
      }
    }

    // Perform bulk action
    let updateData: any = {}
    let actionDescription = ''

    switch (action) {
      case 'ban':
        updateData = { isBanned: true, role: 'BANNED' }
        actionDescription = 'BULK_BAN'
        break
      case 'unban':
        updateData = { isBanned: false, role: 'USER' }
        actionDescription = 'BULK_UNBAN'
        break
      case 'approve':
        updateData = { isVerified: true }
        actionDescription = 'BULK_APPROVE'
        break
      case 'reject':
        updateData = { isVerified: false }
        actionDescription = 'BULK_REJECT'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Execute bulk update
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData
    })

    // Audit log
    const clientInfo = getClientInfo(request)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: session.user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        bulkAction: actionDescription,
        userCount: result.count,
        userIds: userIds,
        reason: reason || 'No reason provided',
        affectedUsers: users.map(u => ({ id: u.id, email: u.email, name: u.name }))
      },
      success: true
    })

    // Invalidate cache (specific keys only - Upstash doesn't support KEYS pattern matching)
    const upstash = getUpstash()
    if (upstash) {
      try {
        await upstash.del('admin:dashboard:stats')
        // Note: admin:users cache will auto-expire after 5 minutes TTL
      } catch (error) {
        console.warn('[Cache] Invalidation failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed ${result.count} users`,
      count: result.count,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        previousState: { role: u.role }
      }))
    })

  } catch (error) {
    console.error('Error in bulk user action:', error)

    // Log failed action
    const clientInfo = getClientInfo(request)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: (await getServerSession(authOptions))?.user?.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        endpoint: '/api/admin/users/bulk',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      success: false
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
