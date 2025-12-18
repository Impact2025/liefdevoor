import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { auditLog, getClientInfo } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          safetyScore: true,
          createdAt: true,
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

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
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

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let updateData: any = {}

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

    // Audit log the admin action
    const clientInfo = getClientInfo(request)
    const auditAction = action === 'ban' ? 'USER_BANNED' :
                        action === 'unban' ? 'USER_UNBANNED' :
                        action === 'promote' ? 'USER_PROMOTED' : 'USER_DEMOTED'

    auditLog(auditAction, {
      userId: session.user.id,
      targetUserId: userId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action,
        targetEmail: user.email,
        newRole: user.role
      },
      success: true
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}