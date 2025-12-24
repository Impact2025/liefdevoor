import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { auditLog, getClientInfo } from '@/lib/audit'

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().nullable().optional()
})

// PATCH /api/admin/helpdesk/tickets/[id] - Update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    const ticketId = params.id
    const body = await request.json()

    // Validate input
    const validation = updateTicketSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    const auditDetails: any = { ticketId }

    if (validation.data.status) {
      updates.status = validation.data.status
      auditDetails.newStatus = validation.data.status

      if (validation.data.status === 'RESOLVED') {
        updates.resolvedAt = new Date()
      } else if (validation.data.status === 'CLOSED') {
        updates.closedAt = new Date()
      }
    }

    if (validation.data.priority) {
      updates.priority = validation.data.priority
      auditDetails.newPriority = validation.data.priority
    }

    if ('assignedToId' in validation.data) {
      updates.assignedToId = validation.data.assignedToId
      auditDetails.assignedToId = validation.data.assignedToId
    }

    // Update ticket
    const ticket = await prisma.helpDeskTicket.update({
      where: { id: ticketId },
      data: updates,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true }
        }
      }
    })

    // Audit log
    const clientInfo = getClientInfo(request)
    const auditAction = validation.data.assignedToId !== undefined
      ? 'TICKET_ASSIGNED'
      : validation.data.status === 'RESOLVED'
      ? 'TICKET_RESOLVED'
      : validation.data.status === 'CLOSED'
      ? 'TICKET_CLOSED'
      : 'TICKET_UPDATED'

    auditLog(auditAction, {
      userId: admin.id,
      targetUserId: ticket.userId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: auditDetails
    })

    // TODO: Send email notification to user about status change
    // if (validation.data.status && ticket.user.email) {
    //   await sendTicketStatusChangedEmail({ ... })
    // }

    return NextResponse.json({
      success: true,
      data: { ticket },
      message: 'Ticket succesvol bijgewerkt'
    })
  } catch (error: any) {
    console.error('Error updating ticket:', error)

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

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Ticket niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het bijwerken van het ticket' },
      { status: 500 }
    )
  }
}
