import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { hasPermission, AdminPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'

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
      select: { ticketId: true, userId: true, user: { select: { name: true, email: true } } },
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

    const portalUrl = `${process.env.NEXTAUTH_URL}/ambassadeur`
    const ambassadorName = ambassador.user?.name || ambassador.user?.email || 'Ambassadeur'
    if (ambassador.user?.email) {
      await sendEmail({
        to: ambassador.user.email,
        subject: '💬 Nieuw bericht van Vincent - Liefde Voor Iedereen',
        html: `<p>Hoi ${ambassadorName}!</p><p>Vincent heeft je een bericht gestuurd:</p><blockquote style="border-left:3px solid #e11d48;padding:8px 16px;color:#374151">${message.trim()}</blockquote><p><a href="${portalUrl}" style="background:#e11d48;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Bekijk en beantwoord →</a></p>`,
        text: `Hoi ${ambassadorName}!\n\nVincent heeft je een bericht gestuurd:\n\n"${message.trim()}"\n\nBeantwoord het op: ${portalUrl}`,
        category: 'AMBASSADOR_REPLY_NOTIFY',
      }).catch(err => console.error('[Ambassador] Reply notificatie mislukt:', err))
    }

    return NextResponse.json({ success: true, data: helpDeskMessage }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/ambassadors/[id]/bericht error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
