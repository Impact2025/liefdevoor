import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { hasPermission, AdminPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// POST /api/admin/ambassadors/[id]/bericht - Stuur bericht naar ambassadeur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang' }, { status: 403 })
    }

    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Bericht is leeg' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ success: false, error: 'Bericht is te lang' }, { status: 400 })
    }

    const ambassador = await prisma.ambassador.findUnique({
      where: { id: params.id },
      select: { ticketId: true, userId: true },
    })

    if (!ambassador) {
      return NextResponse.json({ success: false, error: 'Ambassadeur niet gevonden' }, { status: 404 })
    }

    let ticketId = ambassador.ticketId

    if (!ticketId) {
      const ticket = await prisma.helpDeskTicket.create({
        data: {
          userId: ambassador.userId,
          subject: 'Ambassadeursprogramma - Liefde Voor Iedereen',
          description: 'Communicatie kanaal voor ambassadeursprogramma.',
          category: 'AMBASSADOR',
          status: 'OPEN',
          priority: 'MEDIUM',
        },
      })
      ticketId = ticket.id
      await prisma.ambassador.update({
        where: { id: params.id },
        data: { ticketId },
      })
    }

    const helpDeskMessage = await prisma.helpDeskMessage.create({
      data: {
        ticketId,
        authorId: admin.id,
        message: message.trim(),
        isStaffReply: true,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    })

    await prisma.helpDeskTicket.update({
      where: { id: ticketId },
      data: { status: 'IN_PROGRESS', updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: helpDeskMessage }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/ambassadors/[id]/bericht error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
