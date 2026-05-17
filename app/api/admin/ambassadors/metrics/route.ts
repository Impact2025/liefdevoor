import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-helpers'
import { hasPermission, AdminPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// GET /api/admin/ambassadors/metrics
export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!await hasPermission(admin.id, AdminPermission.MANAGE_AMBASSADORS)) {
      return NextResponse.json({ success: false, error: 'Geen toegang' }, { status: 403 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalByStatus,
      acceptedThisMonth,
      invitedThisMonth,
      expiringIn30Days,
      expiredAndActive,
      allActive,
    ] = await Promise.all([
      prisma.ambassador.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.ambassador.count({
        where: { status: 'ACTIVE', activatedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.ambassador.count({
        where: { invitedAt: { gte: thirtyDaysAgo } },
      }),
      // Gratis lidmaatschap verloopt binnen 30 dagen
      prisma.ambassador.count({
        where: {
          status: 'ACTIVE',
          freeUntil: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Actieve ambassadeurs met verlopen gratis lidmaatschap (actie vereist)
      prisma.ambassador.count({
        where: {
          status: 'ACTIVE',
          freeUntil: { lt: now },
        },
      }),
      // Gemiddelde tijd van uitnodiging tot acceptatie
      prisma.ambassador.findMany({
        where: { status: 'ACTIVE', activatedAt: { not: null } },
        select: { invitedAt: true, activatedAt: true },
      }),
    ])

    const counts = {
      invited: totalByStatus.find(s => s.status === 'INVITED')?._count.status ?? 0,
      active: totalByStatus.find(s => s.status === 'ACTIVE')?._count.status ?? 0,
      inactive: totalByStatus.find(s => s.status === 'INACTIVE')?._count.status ?? 0,
    }
    const total = counts.invited + counts.active + counts.inactive
    const conversionRate = total > 0
      ? Math.round((counts.active / (total - counts.inactive)) * 100)
      : 0

    let avgDaysToAccept: number | null = null
    if (allActive.length > 0) {
      const totalDays = allActive.reduce((sum, a) => {
        if (!a.activatedAt) return sum
        return sum + (a.activatedAt.getTime() - a.invitedAt.getTime()) / (1000 * 60 * 60 * 24)
      }, 0)
      avgDaysToAccept = Math.round(totalDays / allActive.length)
    }

    return NextResponse.json({
      success: true,
      data: {
        counts,
        total,
        conversionRate,
        avgDaysToAccept,
        thisMonth: {
          invited: invitedThisMonth,
          accepted: acceptedThisMonth,
        },
        alerts: {
          expiringIn30Days,
          expiredAndStillActive: expiredAndActive,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/admin/ambassadors/metrics error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
