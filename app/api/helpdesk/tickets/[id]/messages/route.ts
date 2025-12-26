import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { auditLog, getClientInfo } from '@/lib/audit'
import { sendTicketReplyAdminAlert } from '@/lib/email/admin-notification-service'

const createMessageSchema = z.object({
  message: z.string().min(1, 'Bericht mag niet leeg zijn').max(5000),
  isInternal: z.boolean().optional().default(false)
})

// POST /api/helpdesk/tickets/[id]/messages - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const ticketId = params.id
    const body = await request.json()

    // Validate input
    const validation = createMessageSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      )
    }

    // Get ticket
    const ticket = await prisma.helpDeskTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket niet gevonden' },
        { status: 404 }
      )
    }

    // Check permissions
    const isAdmin = user.role === 'ADMIN'
    const isTicketOwner = ticket.userId === user.id

    if (!isAdmin && !isTicketOwner) {
      return NextResponse.json(
        { success: false, error: 'Je hebt geen toegang tot dit ticket' },
        { status: 403 }
      )
    }

    // Only admins can create internal messages
    const isInternal = isAdmin && validation.data.isInternal

    // Create message
    const message = await prisma.helpDeskMessage.create({
      data: {
        ticketId,
        authorId: user.id,
        message: validation.data.message,
        isStaffReply: isAdmin,
        isInternal
      },
      include: {
        author: {
          select: { id: true, name: true, profileImage: true, role: true }
        }
      }
    })

    // Update ticket status if user replied to waiting ticket
    if (isTicketOwner && ticket.status === 'WAITING') {
      await prisma.helpDeskTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' }
      })
    }

    // Audit log
    const clientInfo = getClientInfo(request)
    auditLog('TICKET_MESSAGE_SENT', {
      userId: user.id,
      targetUserId: isAdmin ? ticket.userId : undefined,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        ticketId,
        messageId: message.id,
        isStaffReply: isAdmin,
        isInternal
      }
    })

    // Send admin notification when user replies (non-blocking)
    if (!isInternal && !isAdmin) {
      sendTicketReplyAdminAlert({
        ticketId,
        subject: ticket.subject,
        replyMessage: validation.data.message,
        userName: ticket.user.name || 'Unknown User'
      }).catch(err => console.error('[Ticket] Admin reply alert failed:', err))
    }

    return NextResponse.json({
      success: true,
      data: { message },
      message: 'Bericht succesvol verzonden'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating message:', error)

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het verzenden van het bericht' },
      { status: 500 }
    )
  }
}
