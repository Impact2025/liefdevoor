import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'

// GET /api/ambassadeur - Haal eigen ambassadeursdata op
export async function GET() {
  try {
    const user = await requireAuth()

    const ambassador = await prisma.ambassador.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        freeUntil: true,
        invitedAt: true,
        activatedAt: true,
        ticketId: true,
      },
    })

    if (!ambassador) {
      return NextResponse.json({ success: false, error: 'Niet gevonden' }, { status: 404 })
    }

    let messages: any[] = []
    if (ambassador.ticketId) {
      const ticket = await prisma.helpDeskTicket.findUnique({
        where: { id: ambassador.ticketId },
        include: {
          messages: {
            where: { isInternal: false },
            include: {
              author: { select: { id: true, name: true, role: true, profileImage: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 100,
          },
        },
      })
      messages = ticket?.messages ?? []
    }

    return NextResponse.json({ success: true, data: { ...ambassador, messages } })
  } catch (error) {
    console.error('GET /api/ambassadeur error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/ambassadeur - Accepteer ambassadeurschap
export async function PATCH() {
  try {
    const user = await requireAuth()

    const ambassador = await prisma.ambassador.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!ambassador) {
      return NextResponse.json({ success: false, error: 'Niet gevonden' }, { status: 404 })
    }

    if (ambassador.status !== 'INVITED') {
      return NextResponse.json({ success: false, error: 'Al verwerkt' }, { status: 409 })
    }

    // Activeer ambassadeur en upgrade subscription in één transactie
    const [updated] = await prisma.$transaction([
      prisma.ambassador.update({
        where: { userId: user.id },
        data: { status: 'ACTIVE', activatedAt: new Date() },
      }),
      // Alleen upgraden als nog op FREE (nooit GOLD downgraden)
      prisma.user.updateMany({
        where: { id: user.id, subscriptionTier: 'FREE' },
        data: { subscriptionTier: 'PREMIUM' },
      }),
    ])

    const portalUrl = `${process.env.NEXTAUTH_URL}/ambassadeur`
    const name = ambassador.user?.name || 'Ambassadeur'

    // Welkomstmail naar ambassadeur
    if (ambassador.user?.email) {
      await sendEmail({
        to: ambassador.user.email,
        subject: 'Welkom als ambassadeur! 🌟',
        html: `<p>Hoi ${name}!</p><p>Geweldig dat je ambassadeur wilt worden van <strong>Liefde Voor Iedereen</strong>!</p><p>Jouw gratis lidmaatschap is nu actief. Je kunt nu:</p><ul><li>Alles op de site gebruiken met een gratis lidmaatschap (1 jaar)</li><li>Ons berichten sturen via jouw ambassadeurspagina</li><li>Als eerste nieuwe functies uitproberen</li></ul><p><a href="${portalUrl}" style="background:#e11d48;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Naar jouw ambassadeurspagina →</a></p><p>Hartelijk dank!<br><strong>Vincent</strong><br>Liefde Voor Iedereen</p>`,
        text: `Hoi ${name}!\n\nGeweldig dat je ambassadeur wilt worden!\n\nJe gratis lidmaatschap is nu actief (1 jaar).\n\nGa naar jouw pagina: ${portalUrl}\n\nHartelijk dank!\nVincent`,
        category: 'AMBASSADOR_WELCOME',
      }).catch(err => console.error('[Ambassador] Welkomstmail mislukt:', err))
    }

    // Admin notificatie
    await sendEmail({
      to: 'info@liefdevooriedereen.nl',
      subject: `🌟 Nieuwe ambassadeur: ${name}`,
      html: `<p><strong>${name}</strong> heeft de ambassadeursuitnodiging geaccepteerd!</p><p><a href="${process.env.NEXTAUTH_URL}/admin/ambassadors">Bekijk in admin dashboard →</a></p>`,
      text: `${name} heeft de ambassadeursuitnodiging geaccepteerd!\n\nBekijk: ${process.env.NEXTAUTH_URL}/admin/ambassadors`,
      category: 'AMBASSADOR_ACCEPTED_NOTIFY',
    }).catch(err => console.error('[Ambassador] Admin notificatie mislukt:', err))

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/ambassadeur error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
