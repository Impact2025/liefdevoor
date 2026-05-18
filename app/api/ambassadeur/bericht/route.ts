import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'

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
      select: { id: true, ticketId: true, status: true, user: { select: { name: true, email: true } } },
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

    const senderName = ambassador.user?.name || ambassador.user?.email || 'Onbekend'
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/ambassadors`
    await sendEmail({
      to: 'info@liefdevooriedereen.nl',
      subject: `💬 Nieuw bericht van ambassadeur ${senderName}`,
      html: `<p>Ambassadeur <strong>${senderName}</strong> heeft een bericht gestuurd:</p><blockquote style="border-left:3px solid #e11d48;padding:8px 16px;color:#374151">${message.trim()}</blockquote><p><a href="${adminUrl}">Bekijk in admin dashboard →</a></p>`,
      text: `Ambassadeur ${senderName} heeft een bericht gestuurd:\n\n"${message.trim()}"\n\nBekijk het op: ${adminUrl}`,
      category: 'AMBASSADOR_MESSAGE_NOTIFY',
    }).catch(err => console.error('[Ambassador] Notificatie email mislukt:', err))

    return NextResponse.json({ success: true, data: helpDeskMessage }, { status: 201 })
  } catch (error) {
    console.error('POST /api/ambassadeur/bericht error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
