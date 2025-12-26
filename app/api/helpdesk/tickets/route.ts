import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { auditLog, getClientInfo } from '@/lib/audit'
import { sendNewTicketAdminAlert } from '@/lib/email/admin-notification-service'

// Validation schema
const createTicketSchema = z.object({
  subject: z.string().min(5, 'Onderwerp moet minimaal 5 karakters zijn').max(200),
  category: z.enum(['ACCOUNT', 'MATCHING', 'MESSAGES', 'PAYMENTS', 'VERIFICATION', 'SAFETY', 'TECHNICAL', 'FEATURE', 'OTHER']),
  description: z.string().min(20, 'Beschrijving moet minimaal 20 karakters zijn').max(5000),
  chatbotConversationId: z.string().optional()
})

// GET /api/helpdesk/tickets - List user's tickets
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const where: any = { userId: user.id }
    if (status) where.status = status

    const offset = (page - 1) * limit

    const [tickets, total] = await Promise.all([
      prisma.helpDeskTicket.findMany({
        where,
        include: {
          _count: {
            select: { messages: true, attachments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.helpDeskTicket.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: { tickets },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching tickets:', error)

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// POST /api/helpdesk/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = createTicketSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      )
    }

    const { subject, category, description, chatbotConversationId } = validation.data

    // Create ticket
    const ticket = await prisma.helpDeskTicket.create({
      data: {
        userId: user.id,
        subject,
        category,
        description,
        status: 'OPEN',
        priority: 'MEDIUM',
        isEscalated: !!chatbotConversationId,
        chatbotConversationId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Audit log
    const clientInfo = getClientInfo(request)
    auditLog('TICKET_CREATED', {
      userId: user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        ticketId: ticket.id,
        subject,
        category
      }
    })

    // Send admin notification (non-blocking)
    sendNewTicketAdminAlert({
      ticketId: ticket.id,
      subject,
      category,
      userName: ticket.user.name || 'Unknown User'
    }).catch(err => console.error('[Ticket] Admin alert failed:', err))

    return NextResponse.json({
      success: true,
      data: { ticket },
      message: 'Ticket succesvol aangemaakt'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating ticket:', error)

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het aanmaken van het ticket' },
      { status: 500 }
    )
  }
}
