import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

// GET /api/admin/helpdesk/tickets - List all tickets (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (priority) where.priority = priority

    if (assignedTo === 'me') {
      where.assignedToId = admin.id
    } else if (assignedTo === 'unassigned') {
      where.assignedToId = null
    } else if (assignedTo) {
      where.assignedToId = assignedTo
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const offset = (page - 1) * limit

    const [tickets, total, stats] = await Promise.all([
      prisma.helpDeskTicket.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, profileImage: true }
          },
          assignedTo: {
            select: { id: true, name: true }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.helpDeskTicket.count({ where }),
      // Get stats
      prisma.helpDeskTicket.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    const statsMap = {
      open: stats.find(s => s.status === 'OPEN')?._count || 0,
      inProgress: stats.find(s => s.status === 'IN_PROGRESS')?._count || 0,
      waiting: stats.find(s => s.status === 'WAITING')?._count || 0,
      resolved: stats.find(s => s.status === 'RESOLVED')?._count || 0,
      closed: stats.find(s => s.status === 'CLOSED')?._count || 0,
      total
    }

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        stats: statsMap
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching admin tickets:', error)

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin toegang vereist' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
