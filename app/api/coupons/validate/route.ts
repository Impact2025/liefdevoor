import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/coupons/validate
 * Validate coupon code and calculate discount
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code, orderType, amount } = body

    // Validate input
    if (!code || !orderType || !amount) {
      return NextResponse.json(
        { error: 'Code, orderType, and amount are required' },
        { status: 400 }
      )
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usages: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon niet gevonden', valid: false },
        { status: 404 }
      )
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Coupon is niet actief', valid: false },
        { status: 400 }
      )
    }

    // Check validity period
    const now = new Date()
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json(
        { error: 'Coupon is nog niet geldig', valid: false },
        { status: 400 }
      )
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json(
        { error: 'Coupon is verlopen', valid: false },
        { status: 400 }
      )
    }

    // Check applicable to
    if (coupon.applicableTo === 'SUBSCRIPTION' && orderType !== 'subscription') {
      return NextResponse.json(
        { error: 'Coupon is alleen geldig voor abonnementen', valid: false },
        { status: 400 }
      )
    }

    if (coupon.applicableTo === 'CREDITS' && orderType !== 'credits') {
      return NextResponse.json(
        { error: 'Coupon is alleen geldig voor credits', valid: false },
        { status: 400 }
      )
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
      return NextResponse.json(
        {
          error: `Minimum aankoopbedrag is €${coupon.minPurchaseAmount.toFixed(2)}`,
          valid: false
        },
        { status: 400 }
      )
    }

    // Check max total uses
    if (coupon.maxTotalUses && coupon.currentTotalUses >= coupon.maxTotalUses) {
      return NextResponse.json(
        { error: 'Coupon limiet bereikt', valid: false },
        { status: 400 }
      )
    }

    // Check max uses per user
    const userUsageCount = coupon.usages.length
    if (userUsageCount >= coupon.maxUsesPerUser) {
      return NextResponse.json(
        { error: 'Je hebt deze coupon al maximaal gebruikt', valid: false },
        { status: 400 }
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (amount * coupon.value) / 100
      // Apply max discount cap if set
      if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
        discountAmount = coupon.maxDiscountCap
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(coupon.value, amount) // Can't discount more than the amount
    }

    const finalAmount = Math.max(amount - discountAmount, 0)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discount: {
        originalAmount: amount,
        discountAmount: Number(discountAmount.toFixed(2)),
        finalAmount: Number(finalAmount.toFixed(2)),
        discountPercentage: Number(((discountAmount / amount) * 100).toFixed(1))
      }
    })
  } catch (error) {
    console.error('[Coupons Validate] Error validating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon', valid: false },
      { status: 500 }
    )
  }
}
