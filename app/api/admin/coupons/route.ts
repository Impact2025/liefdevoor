import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin'
import { auditLogImmediate, getClientInfo } from '@/lib/audit'

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

    // Basic validation
    if (!code || !type || value === undefined) {
      return NextResponse.json({
        error: 'Missing required fields: code, type, and value are required'
      }, { status: 400 })
    }

    // Validate type
    if (!['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL'].includes(type)) {
      return NextResponse.json({
        error: 'Invalid type. Must be PERCENTAGE, FIXED_AMOUNT, or FREE_TRIAL'
      }, { status: 400 })
    }

    // Validate percentage value
    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json({
        error: 'Percentage must be between 0 and 100'
      }, { status: 400 })
    }

    // Rate limiting - 30 coupon creations per hour
    const rateLimit = await checkAdminRateLimit(session.user.id, 'coupon_create', 30, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
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

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        type,
        value: parseFloat(value),
        applicableTo: applicableTo || 'ALL',
        applicablePlans: applicablePlans || null,
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : null,
        maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : null,
        maxTotalUses: maxTotalUses ? parseInt(maxTotalUses) : null,
        maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : 1,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
        notes: notes || null,
        createdBy: session.user.id
      }
    })

    // Audit log
    const clientInfo = getClientInfo(req)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: session.user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action: 'coupon_created',
        couponCode: code,
        type,
        value
      },
      success: true
    })

    return NextResponse.json({
      success: true,
      coupon,
      message: 'Coupon created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('[Admin Coupons] Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
