import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

// POST /api/ambassadeur/bericht - Ambassadeur stuurt bericht naar admin
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Bericht is leeg' }, { status: 400 })
    }

    const ambassador = await prisma.ambassador.findUnique({
      where: { userId: user.id },
      select: { id: true, ticketId: true, status: true },
    })

    if (!ambassador || ambassador.status === 'INACTIVE') {
      return NextResponse.json({ success: false, error: 'Niet gevonden' }, { status: 404 })
    }

    let ticketId = ambassador.ticketId

    if (!ticketId) {
      const ticket = await prisma.helpDeskTicket.create({
        data: {
          userId: user.id,
          subject: 'Ambassadeursprogramma - Liefde Voor Iedereen',
          description: 'Communicatie kanaal voor ambassadeursprogramma.',
          category: 'AMBASSADOR',
          status: 'OPEN',
          priority: 'MEDIUM',
        },
      })
      ticketId = ticket.id
      await prisma.ambassador.update({
        where: { id: ambassador.id },
        data: { ticketId },
      })
    }

    const helpDeskMessage = await prisma.helpDeskMessage.create({
      data: {
        ticketId,
        authorId: user.id,
        message: message.trim(),
        isStaffReply: false,
      },
      include: {
        author: { select: { id: true, name: true, role: true, profileImage: true } },
      },
    })

    // Zet ticket op WAITING (wacht op admin reactie)
    await prisma.helpDeskTicket.update({
      where: { id: ticketId },
      data: { status: 'WAITING', updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: helpDeskMessage }, { status: 201 })
  } catch (error) {
    console.error('POST /api/ambassadeur/bericht error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
