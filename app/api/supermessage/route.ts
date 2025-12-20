/**
 * Superbericht API
 *
 * POST /api/supermessage - Stuur een superbericht naar iemand
 * GET /api/supermessage - Haal ontvangen superberichten op
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Stuur een superbericht
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetId, message } = body

    if (!targetId) {
      return NextResponse.json(
        { error: 'Ontvanger is verplicht' },
        { status: 400 }
      )
    }

    // Haal afzender op
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        credits: true,
        subscriptionTier: true,
        monthlySupermessages: true,
        monthlySupermessagesReset: true,
      },
    })

    if (!sender) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Check dat je niet naar jezelf stuurt
    if (sender.id === targetId) {
      return NextResponse.json(
        { error: 'Je kunt geen Superbericht naar jezelf sturen' },
        { status: 400 }
      )
    }

    // Check of ontvanger bestaat
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true },
    })

    if (!target) {
      return NextResponse.json(
        { error: 'Deze gebruiker bestaat niet' },
        { status: 404 }
      )
    }

    // Check of gebruiker geblokkeerd is
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: sender.id, blockedId: targetId },
          { blockerId: targetId, blockedId: sender.id },
        ],
      },
    })

    if (blocked) {
      return NextResponse.json(
        { error: 'Je kunt deze gebruiker geen bericht sturen' },
        { status: 403 }
      )
    }

    // Check of er al een superbericht naar deze persoon is gestuurd (vandaag)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingToday = await prisma.superMessage.findFirst({
      where: {
        senderId: sender.id,
        targetId: targetId,
        createdAt: { gte: today },
      },
    })

    if (existingToday) {
      return NextResponse.json(
        { error: 'Je hebt vandaag al een Superbericht naar deze persoon gestuurd' },
        { status: 429 }
      )
    }

    // Bepaal of we maandelijkse credits of gekochte credits gebruiken
    let useMonthlyCredit = false
    let usePurchasedCredit = false

    // Check maandelijkse credits (voor COMPLETE abonnees)
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Reset maandelijkse credits indien nodig
    if (
      sender.subscriptionTier === 'COMPLETE' &&
      (!sender.monthlySupermessagesReset || new Date(sender.monthlySupermessagesReset) < firstOfMonth)
    ) {
      await prisma.user.update({
        where: { id: sender.id },
        data: {
          monthlySupermessages: 3, // 3 gratis superberichten per maand
          monthlySupermessagesReset: firstOfMonth,
        },
      })
      sender.monthlySupermessages = 3
    }

    if (sender.monthlySupermessages > 0) {
      useMonthlyCredit = true
    } else if (sender.credits > 0) {
      usePurchasedCredit = true
    } else {
      return NextResponse.json(
        {
          error: 'Geen Superberichten beschikbaar',
          message: 'Je hebt geen Superberichten meer. Koop er meer in de winkel.',
          redirectTo: '/prijzen',
        },
        { status: 402 }
      )
    }

    // Stuur het superbericht
    const superMessage = await prisma.$transaction(async (tx) => {
      // Maak het superbericht aan
      const msg = await tx.superMessage.create({
        data: {
          senderId: sender.id,
          targetId: targetId,
          message: message || null,
        },
      })

      // Verlaag credits
      if (useMonthlyCredit) {
        await tx.user.update({
          where: { id: sender.id },
          data: { monthlySupermessages: { decrement: 1 } },
        })
      } else if (usePurchasedCredit) {
        await tx.user.update({
          where: { id: sender.id },
          data: { credits: { decrement: 1 } },
        })
      }

      // Stuur notificatie naar ontvanger
      await tx.notification.create({
        data: {
          userId: targetId,
          type: 'SUPER_MESSAGE',
          title: 'Nieuw Superbericht!',
          message: `Iemand vindt je zo leuk dat ze je een Superbericht hebben gestuurd!`,
          relatedId: msg.id,
        },
      })

      return msg
    })

    // Haal bijgewerkte credits op
    const updatedSender = await prisma.user.findUnique({
      where: { id: sender.id },
      select: { credits: true, monthlySupermessages: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Je Superbericht is verstuurd!',
      superMessage: {
        id: superMessage.id,
        targetId: superMessage.targetId,
        createdAt: superMessage.createdAt,
      },
      remainingCredits: updatedSender?.credits || 0,
      remainingMonthly: updatedSender?.monthlySupermessages || 0,
    })
  } catch (error) {
    console.error('[SuperMessage POST] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

// GET: Haal ontvangen superberichten op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Haal ontvangen superberichten op
    const superMessages = await prisma.superMessage.findMany({
      where: { targetId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            city: true,
            birthDate: true,
          },
        },
      },
    })

    // Markeer als gelezen
    const unreadIds = superMessages
      .filter((msg) => !msg.isRead)
      .map((msg) => msg.id)

    if (unreadIds.length > 0) {
      await prisma.superMessage.updateMany({
        where: { id: { in: unreadIds } },
        data: { isRead: true },
      })
    }

    // Bereken leeftijd voor elke afzender
    const messagesWithAge = superMessages.map((msg) => {
      let age = null
      if (msg.sender.birthDate) {
        const today = new Date()
        const birth = new Date(msg.sender.birthDate)
        age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--
        }
      }

      return {
        id: msg.id,
        message: msg.message,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          profileImage: msg.sender.profileImage,
          city: msg.sender.city,
          age,
        },
      }
    })

    return NextResponse.json({
      superMessages: messagesWithAge,
      unreadCount: unreadIds.length,
    })
  } catch (error) {
    console.error('[SuperMessage GET] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
