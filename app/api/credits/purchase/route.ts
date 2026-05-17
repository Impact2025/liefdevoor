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
import { createPaymentIntent, getOrCreateStripeCustomer } from '@/lib/services/payment/stripe'

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
    const { packId, couponCode } = body // 'amount' van client wordt genegeerd — altijd server-side berekend

    // Valideer credit pack
    const pack = getCreditPackById(packId)
    if (!pack) {
      return NextResponse.json(
        { error: 'Ongeldig pakket geselecteerd' },
        { status: 400 }
      )
    }

    // Check maximale bundle grootte (original price, not discounted)
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

    // Server-side prijsberekening — nooit de client-amount vertrouwen
    let finalAmount = pack.price
    if (couponCode) {
      const now = new Date()
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
        include: { usages: { where: { userId: user.id }, select: { id: true } } },
      })
      if (
        coupon &&
        coupon.isActive &&
        coupon.applicableTo !== 'SUBSCRIPTION' &&
        (!coupon.validFrom || new Date(coupon.validFrom) <= now) &&
        (!coupon.validUntil || new Date(coupon.validUntil) >= now) &&
        (!coupon.maxTotalUses || coupon.currentTotalUses < coupon.maxTotalUses) &&
        coupon.usages.length < coupon.maxUsesPerUser &&
        (!coupon.minPurchaseAmount || pack.price >= coupon.minPurchaseAmount)
      ) {
        let discount = 0
        if (coupon.type === 'PERCENTAGE') {
          discount = (pack.price * coupon.value) / 100
          if (coupon.maxDiscountCap && discount > coupon.maxDiscountCap) discount = coupon.maxDiscountCap
        } else if (coupon.type === 'FIXED_AMOUNT') {
          discount = Math.min(coupon.value, pack.price)
        }
        finalAmount = Math.max(pack.price - discount, 0)
      }
    }

    // If free with coupon, skip payment and grant credits directly
    if (finalAmount === 0) {
      const purchase = await prisma.$transaction(async (tx) => {
        // Create completed purchase
        const newPurchase = await tx.creditPurchase.create({
          data: {
            userId: user.id,
            credits: pack.credits,
            amount: 0,
            status: 'completed',
            completedAt: new Date(),
          },
        })

        // Grant credits to user
        await tx.user.update({
          where: { id: user.id },
          data: {
            credits: { increment: pack.credits },
          },
        })

        // Record coupon usage if provided
        if (couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: couponCode.toUpperCase() }
          })

          if (coupon) {
            await tx.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: user.id,
                orderType: 'credits',
                orderId: newPurchase.id,
                originalAmount: pack.price,
                discountAmount: pack.price,
                finalAmount: 0,
              }
            })

            await tx.coupon.update({
              where: { id: coupon.id },
              data: { currentTotalUses: { increment: 1 } }
            })
          }
        }

        return newPurchase
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { credits: true },
      })

      return NextResponse.json({
        success: true,
        message: `Je hebt ${pack.credits} ${pack.credits === 1 ? 'Superbericht' : 'Superberichten'} gratis ontvangen!`,
        purchase: {
          id: purchase.id,
          credits: pack.credits,
          amount: 0,
        },
        currentCredits: updatedUser?.credits || 0,
      })
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

    // Check dagelijkse bestedingslimiet (use final amount after discount)
    const newTotal = spendingLimit.currentSpent + finalAmount

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

    // Maak pending aankoop record aan — credits worden bijgeschreven via webhook
    const purchase = await prisma.creditPurchase.create({
      data: {
        userId: user.id,
        credits: pack.credits,
        amount: finalAmount,
        status: 'pending',
      },
    })

    // Spending limit optimistisch bijwerken (voorkomt dubbele aankopen tijdens checkout)
    await prisma.spendingLimit.update({
      where: { userId: user.id },
      data: { currentSpent: { increment: finalAmount } },
    })

    // Stripe: haal of maak customer aan, maak Payment Intent
    // Bij Stripe-fout: rollback spending limit zodat gebruiker niet geblokkeerd raakt
    let stripeCustomerId: string
    let paymentIntent: Awaited<ReturnType<typeof createPaymentIntent>>

    try {
      stripeCustomerId = await getOrCreateStripeCustomer(
        user.id,
        user.email!,
        user.name,
      )
      paymentIntent = await createPaymentIntent(
        stripeCustomerId,
        finalAmount,
        {
          purchaseId: purchase.id,
          userId: user.id,
          credits: String(pack.credits),
          packId: pack.id,
          ...(couponCode ? { couponCode: couponCode.toUpperCase() } : {}),
        },
        purchase.id,
      )
    } catch (stripeError) {
      // Rollback spending limit en pending purchase
      await Promise.allSettled([
        prisma.spendingLimit.update({
          where: { userId: user.id },
          data: { currentSpent: { increment: -finalAmount } },
        }),
        prisma.creditPurchase.delete({ where: { id: purchase.id } }),
      ])
      throw stripeError
    }

    // Sla Stripe Payment Intent ID op
    await prisma.creditPurchase.update({
      where: { id: purchase.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    })

    // clientSecret → frontend gebruikt dit om Payment Element af te ronden
    return NextResponse.json({
      success: true,
      requiresPayment: true,
      clientSecret: paymentIntent.client_secret,
      purchase: {
        id: purchase.id,
        credits: pack.credits,
        amount: finalAmount,
      },
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
