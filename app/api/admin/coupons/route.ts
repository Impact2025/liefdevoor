import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { couponCreateSchema } from '@/lib/validations/admin-schemas'
import { validateBody } from '@/lib/api-helpers'
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

    // Zod validation
    const validation = await validateBody(req, couponCreateSchema)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 })
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      maxUsesPerUser,
      expiresAt,
      isActive,
      applicablePlans
    } = validation.data

    // Rate limiting - 30 coupon creations per hour
    const rateLimit = await checkAdminRateLimit(session.user.id, 'coupon_create', 30, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
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
        code,
        description,
        type: discountType,
        value: discountValue,
        applicableTo: 'SUBSCRIPTION', // Default
        applicablePlans: applicablePlans || [],
        maxTotalUses: maxUses,
        maxUsesPerUser,
        validFrom: new Date(),
        validUntil: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
        createdBy: session.user.id
      }
    })

    // Audit log
    const clientInfo = getClientInfo(req)
    await auditLogImmediate('ADMIN_ACTION', {
      userId: session.user.id,
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        action: 'coupon_created',
        couponCode: code,
        discountType,
        discountValue
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
