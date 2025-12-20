/**
 * Credit Purchase API - Met Spending Limit Bescherming
 *
 * POST /api/credits/purchase
 * Body: { packId: string }
 *
 * Beveiligingsmaatregelen:
 * - Dagelijkse bestedingslimiet (standaard €20)
 * - Cooldown tussen aankopen (5 minuten)
 * - Maximale bundle grootte (€10)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CREDIT_PACKS, SAFETY_LIMITS, getCreditPackById } from '@/lib/pricing'

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
    const { packId } = body

    // Valideer credit pack
    const pack = getCreditPackById(packId)
    if (!pack) {
      return NextResponse.json(
        { error: 'Ongeldig pakket geselecteerd' },
        { status: 400 }
      )
    }

    // Check maximale bundle grootte
    if (pack.price > SAFETY_LIMITS.MAX_CREDIT_PURCHASE) {
      return NextResponse.json(
        { error: 'Dit pakket overschrijdt het maximum aankoopbedrag' },
        { status: 400 }
      )
    }

    // Haal gebruiker op
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { spendingLimit: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Check of reset spending limit nodig (nieuwe dag)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let spendingLimit = user.spendingLimit

    if (!spendingLimit) {
      // Maak spending limit aan voor nieuwe gebruiker
      spendingLimit = await prisma.spendingLimit.create({
        data: {
          userId: user.id,
          dailyLimit: SAFETY_LIMITS.DEFAULT_DAILY_SPENDING_LIMIT,
          currentSpent: 0,
          lastReset: today,
        },
      })
    } else if (new Date(spendingLimit.lastReset) < today) {
      // Reset dagelijkse spending als het een nieuwe dag is
      spendingLimit = await prisma.spendingLimit.update({
        where: { id: spendingLimit.id },
        data: {
          currentSpent: 0,
          lastReset: today,
        },
      })
    }

    // Check dagelijkse bestedingslimiet
    const newTotal = spendingLimit.currentSpent + pack.price

    if (newTotal > spendingLimit.dailyLimit) {
      const remaining = Math.max(0, spendingLimit.dailyLimit - spendingLimit.currentSpent)
      return NextResponse.json(
        {
          error: 'Dagelijkse limiet bereikt',
          message: `Om jou te beschermen kun je vandaag nog maximaal ${remaining.toFixed(2)} euro uitgeven. Kom morgen terug!`,
          dailyLimit: spendingLimit.dailyLimit,
          currentSpent: spendingLimit.currentSpent,
          remaining,
        },
        { status: 429 }
      )
    }

    // Check cooldown tussen aankopen
    const recentPurchase = await prisma.creditPurchase.findFirst({
      where: {
        userId: user.id,
        status: 'completed',
        createdAt: {
          gte: new Date(now.getTime() - SAFETY_LIMITS.PURCHASE_COOLDOWN_MINUTES * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentPurchase) {
      const cooldownEnd = new Date(recentPurchase.createdAt.getTime() + SAFETY_LIMITS.PURCHASE_COOLDOWN_MINUTES * 60 * 1000)
      const minutesLeft = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 60000)

      return NextResponse.json(
        {
          error: 'Even wachten',
          message: `Je kunt over ${minutesLeft} ${minutesLeft === 1 ? 'minuut' : 'minuten'} weer iets kopen.`,
          cooldownMinutes: minutesLeft,
        },
        { status: 429 }
      )
    }

    // Maak aankoop record aan (pending)
    const purchase = await prisma.creditPurchase.create({
      data: {
        userId: user.id,
        credits: pack.credits,
        amount: pack.price,
        status: 'pending',
      },
    })

    // TODO: Integreer met payment provider (MultiSafePay/Stripe)
    // Voor nu simuleren we een succesvolle betaling
    // In productie zou je hier een payment redirect URL teruggeven

    // Simuleer succesvolle betaling (vervang dit met echte payment integratie)
    const completedPurchase = await prisma.$transaction(async (tx) => {
      // Update aankoop status
      const updated = await tx.creditPurchase.update({
        where: { id: purchase.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      })

      // Voeg credits toe aan gebruiker
      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: { increment: pack.credits },
        },
      })

      // Update spending limit
      await tx.spendingLimit.update({
        where: { userId: user.id },
        data: {
          currentSpent: { increment: pack.price },
        },
      })

      return updated
    })

    // Haal bijgewerkte gebruiker op
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    })

    return NextResponse.json({
      success: true,
      message: `Je hebt ${pack.credits} ${pack.credits === 1 ? 'Superbericht' : 'Superberichten'} gekocht!`,
      purchase: {
        id: completedPurchase.id,
        credits: pack.credits,
        amount: pack.price,
      },
      currentCredits: updatedUser?.credits || 0,
    })
  } catch (error) {
    console.error('[Credits Purchase] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

// GET: Haal huidige credits en spending status op
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
      include: { spendingLimit: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Check of reset spending limit nodig
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let spendingLimit = user.spendingLimit

    if (spendingLimit && new Date(spendingLimit.lastReset) < today) {
      spendingLimit = await prisma.spendingLimit.update({
        where: { id: spendingLimit.id },
        data: {
          currentSpent: 0,
          lastReset: today,
        },
      })
    }

    const dailyLimit = spendingLimit?.dailyLimit || SAFETY_LIMITS.DEFAULT_DAILY_SPENDING_LIMIT
    const currentSpent = spendingLimit?.currentSpent || 0

    return NextResponse.json({
      credits: user.credits,
      spending: {
        dailyLimit,
        currentSpent,
        remaining: Math.max(0, dailyLimit - currentSpent),
      },
      availablePacks: CREDIT_PACKS,
    })
  } catch (error) {
    console.error('[Credits GET] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
