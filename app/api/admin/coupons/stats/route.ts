import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/coupons/stats
 * Get coupon statistics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total coupons
    const totalCoupons = await prisma.coupon.count()

    // Get active coupons
    const activeCoupons = await prisma.coupon.count({
      where: { isActive: true }
    })

    // Get total uses
    const totalUses = await prisma.couponUsage.count()

    // Get total discount given
    const discountSum = await prisma.couponUsage.aggregate({
      _sum: {
        discountAmount: true
      }
    })

    // Get recent usages
    const recentUsages = await prisma.couponUsage.findMany({
      take: 10,
      orderBy: { usedAt: 'desc' },
      include: {
        coupon: {
          select: {
            code: true,
            type: true
          }
        }
      }
    })

    // Get top performing coupons
    const topCoupons = await prisma.coupon.findMany({
      take: 5,
      orderBy: {
        currentTotalUses: 'desc'
      },
      select: {
        code: true,
        type: true,
        value: true,
        currentTotalUses: true,
        _count: {
          select: { usages: true }
        }
      }
    })

    return NextResponse.json({
      totalCoupons,
      activeCoupons,
      totalUses,
      totalDiscountGiven: discountSum._sum.discountAmount || 0,
      recentUsages,
      topCoupons,
    })
  } catch (error) {
    console.error('[Admin Coupons Stats] Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
