import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/coupons
 * Fetch all coupons with usage stats
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: {
          select: { usages: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('[Admin Coupons] Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/coupons
 * Create a new coupon
 */
export async function POST(req: NextRequest) {
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

    // Validate required fields
    if (!code || !type || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Code, type, and value are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    // Validate percentage
    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value: parseFloat(value),
        applicableTo,
        applicablePlans,
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : null,
        maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : null,
        maxTotalUses: maxTotalUses ? parseInt(maxTotalUses) : null,
        maxUsesPerUser: parseInt(maxUsesPerUser) || 1,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
        createdBy: session.user.id,
        notes,
      }
    })

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    console.error('[Admin Coupons] Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
