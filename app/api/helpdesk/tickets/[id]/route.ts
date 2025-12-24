import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

// GET /api/helpdesk/tickets/[id] - Get single ticket with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const ticketId = params.id

    const ticket = await prisma.helpDeskTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { id: true, name: true, email: true, profileImage: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          where: {
            isInternal: false // Don't show internal admin notes to users
          },
          include: {
            author: {
              select: { id: true, name: true, profileImage: true, role: true }
            },
            attachments: true
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket niet gevonden' },
        { status: 404 }
      )
    }

    // Only ticket owner or admins can view
    if (ticket.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Je hebt geen toegang tot dit ticket' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { ticket }
    })
  } catch (error: any) {
    console.error('Error fetching ticket:', error)

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
