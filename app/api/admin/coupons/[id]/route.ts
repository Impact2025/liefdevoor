import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/coupons/[id]
 * Fetch single coupon with usage details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        usages: {
          take: 50,
          orderBy: { usedAt: 'desc' },
          select: {
            id: true,
            userId: true,
            orderType: true,
            discountAmount: true,
            originalAmount: true,
            finalAmount: true,
            usedAt: true,
          }
        },
        _count: {
          select: { usages: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('[Admin Coupons] Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/coupons/[id]
 * Update coupon
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      code,
      description,
      type,
      value,
      applicableTo,
      applicablePlans,
      minPurchaseAmount,
      maxDiscountCap,
      maxTotalUses,
      maxUsesPerUser,
      validFrom,
      validUntil,
      isActive,
      notes,
    } = body

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // If changing code, check for duplicates
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Validate percentage if type is being changed or value updated
    const finalType = type || existingCoupon.type
    const finalValue = value !== undefined ? value : existingCoupon.value
    if (finalType === 'PERCENTAGE' && (finalValue < 0 || finalValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Build update data object (only include provided fields)
    const updateData: any = {}
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (value !== undefined) updateData.value = parseFloat(value)
    if (applicableTo !== undefined) updateData.applicableTo = applicableTo
    if (applicablePlans !== undefined) updateData.applicablePlans = applicablePlans
    if (minPurchaseAmount !== undefined) {
      updateData.minPurchaseAmount = minPurchaseAmount ? parseFloat(minPurchaseAmount) : null
    }
    if (maxDiscountCap !== undefined) {
      updateData.maxDiscountCap = maxDiscountCap ? parseFloat(maxDiscountCap) : null
    }
    if (maxTotalUses !== undefined) {
      updateData.maxTotalUses = maxTotalUses ? parseInt(maxTotalUses) : null
    }
    if (maxUsesPerUser !== undefined) updateData.maxUsesPerUser = parseInt(maxUsesPerUser)
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom)
    if (validUntil !== undefined) {
      updateData.validUntil = validUntil ? new Date(validUntil) : null
    }
    if (isActive !== undefined) updateData.isActive = isActive
    if (notes !== undefined) updateData.notes = notes

    // Update coupon
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('[Admin Coupons] Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/coupons/[id]
 * Delete coupon
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { usages: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Delete coupon (cascade will delete usages)
    await prisma.coupon.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Coupon deleted successfully',
      deletedUsages: coupon._count.usages
    })
  } catch (error) {
    console.error('[Admin Coupons] Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
