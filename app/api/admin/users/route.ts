import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'
import { userActionSchema, userSearchSchema } from '@/lib/validations/admin-schemas'
import { validateBody, validateQuery } from '@/lib/api-helpers'
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin'
import { getUpstash } from '@/lib/upstash'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate query parameters
    const validation = validateQuery(request.nextUrl.searchParams, userSearchSchema)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 })
    }

    const { page, limit, search, role, isVerified } = validation.data
    const skip = (page - 1) * limit

    // Check Upstash cache first (5 min TTL)
    const cacheKey = `admin:users:${page}:${limit}:${search}:${role}:${isVerified}`
    const upstash = getUpstash()

    if (upstash) {
      try {
        const cached = await upstash.get(cacheKey)
        if (cached) {
          return NextResponse.json(cached)
        }
      } catch (error) {
        console.warn('[Cache] Upstash get failed:', error)
      }
    }

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = role
    }

    if (isVerified !== undefined && isVerified !== '') {
      where.isVerified = isVerified === 'true'
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          isPhotoVerified: true,
          safetyScore: true,
          createdAt: true,
          lastSeen: true,
          subscriptionTier: true,
          _count: {
            select: {
              matches1: true,
              matches2: true,
              photos: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const response = {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    // Cache response for 5 minutes
    if (upstash) {
      try {
        await upstash.setex(cacheKey, 300, JSON.stringify(response))
      } catch (error) {
        console.warn('[Cache] Upstash set failed:', error)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Zod validation
    const validation = await validateBody(request, userActionSchema)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 })
    }

    const { userId, action, reason } = validation.data

    // Rate limiting - 100 user actions per hour
    const rateLimit = await checkAdminRateLimit(session.user.id, 'user_action', 100, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Get user before update for audit trail
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: any = {}

    switch (action) {
      case 'ban':
        updateData.role = 'BANNED'
        break
      case 'unban':
        updateData.role = 'USER'
        break
      case 'promote':
        updateData.role = 'ADMIN'
        break
      case 'demote':
        updateData.role = 'USER'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Immediate audit log for critical action
    const clientInfo = getClientInfo(request)
    const userActionType = action === 'ban' ? 'USER_BANNED' :
                        action === 'unban' ? 'USER_UNBANNED' :
                        action === 'promote' ? 'USER_PROMOTED' : 'USER_DEMOTED'

    await auditLogImmediate('ADMIN_ACTION', {
      userId: session.user.id,
      targetUserId: userId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action,
        userAction: userActionType,
        reason: reason || 'No reason provided',
        targetEmail: user.email,
        previousRole: existingUser.role,
        newRole: user.role
      },
      success: true
    })

    // Note: Upstash REST API doesn't support KEYS command (inefficient)
    // Cache will auto-expire after 5 minutes TTL

    return NextResponse.json({
      success: true,
      user,
      message: `User ${action} successful`
    })
  } catch (error) {
    console.error('Error updating user:', error)

    // Log failed action
    const clientInfo = getClientInfo(request)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: (await getServerSession(authOptions))?.user?.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        endpoint: '/api/admin/users',
        method: 'PATCH',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      success: false
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}