import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/coupons/apply
 * Apply coupon to order and record usage
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code, orderType, orderId, originalAmount, discountAmount, finalAmount } = body

    // Validate input
    if (!code || !orderType || originalAmount === undefined || discountAmount === undefined || finalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // Double-check coupon is still valid (in case status changed between validate and apply)
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Coupon is no longer active' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json(
        { error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    // Check max total uses again
    if (coupon.maxTotalUses && coupon.currentTotalUses >= coupon.maxTotalUses) {
      return NextResponse.json(
        { error: 'Coupon usage limit reached' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Record usage
      const usage = await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId: session.user!.id,
          orderType,
          orderId,
          originalAmount: parseFloat(originalAmount.toString()),
          discountAmount: parseFloat(discountAmount.toString()),
          finalAmount: parseFloat(finalAmount.toString()),
        }
      })

      // Increment usage counter
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          currentTotalUses: {
            increment: 1
          }
        }
      })

      return usage
    })

    return NextResponse.json({
      success: true,
      usage: result,
      message: `Coupon ${coupon.code} toegepast! Je bespaart €${discountAmount.toFixed(2)}`
    })
  } catch (error) {
    console.error('[Coupons Apply] Error applying coupon:', error)
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    )
  }
}
