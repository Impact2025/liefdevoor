import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/ambassadeur error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
