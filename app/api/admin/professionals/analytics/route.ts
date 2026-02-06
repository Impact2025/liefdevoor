import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/professionals/analytics
 * Get comprehensive analytics data for professionals
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);

    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get all time stats
    const [
      totalProfessionals,
      verifiedProfessionals,
      tierCounts,
      typeCounts,
    ] = await Promise.all([
      prisma.professionalAccount.count(),
      prisma.professionalAccount.count({ where: { isVerified: true } }),
      prisma.professionalAccount.groupBy({
        by: ['professionalTier'],
        _count: { professionalTier: true },
      }),
      prisma.professionalAccount.groupBy({
        by: ['organizationType'],
        _count: { organizationType: true },
      }),
    ]);

    // Calculate MRR
    const tierPricing: Record<string, number> = {
      BASIC: 0,
      STANDARD: 29,
      PREMIUM: 99,
    };

    const mrr = tierCounts.reduce((acc, t) => {
      return acc + (t._count.professionalTier * (tierPricing[t.professionalTier] || 0));
    }, 0);

    // Get growth data - signups per day for the period
    const signupsRaw = await prisma.professionalAccount.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        professionalTier: true,
        organizationType: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group signups by date
    const signupsByDate: Record<string, { total: number; byTier: Record<string, number> }> = {};
    signupsRaw.forEach(s => {
      const date = s.createdAt.toISOString().split('T')[0];
      if (!signupsByDate[date]) {
        signupsByDate[date] = { total: 0, byTier: {} };
      }
      signupsByDate[date].total++;
      signupsByDate[date].byTier[s.professionalTier] =
        (signupsByDate[date].byTier[s.professionalTier] || 0) + 1;
    });

    // Fill in missing dates
    const growthData: { date: string; signups: number; basic: number; standard: number; premium: number }[] = [];
    for (let i = periodDays; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayData = signupsByDate[date] || { total: 0, byTier: {} };
      growthData.push({
        date,
        signups: dayData.total,
        basic: dayData.byTier.BASIC || 0,
        standard: dayData.byTier.STANDARD || 0,
        premium: dayData.byTier.PREMIUM || 0,
      });
    }

    // Get verification stats
    const verificationsInPeriod = await prisma.professionalAccount.count({
      where: {
        verifiedAt: { gte: startDate },
      },
    });

    const pendingVerifications = await prisma.professionalAccount.count({
      where: { isVerified: false },
    });

    // Average verification time (for verified accounts in period)
    const recentlyVerified = await prisma.professionalAccount.findMany({
      where: {
        isVerified: true,
        verifiedAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        verifiedAt: true,
      },
    });

    const avgVerificationHours = recentlyVerified.length > 0
      ? recentlyVerified.reduce((acc, p) => {
          const hours = (new Date(p.verifiedAt!).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }, 0) / recentlyVerified.length
      : 0;

    // Engagement metrics
    const [
      totalContentViews,
      totalToolsUsed,
      activeInPeriod,
    ] = await Promise.all([
      prisma.professionalAccount.aggregate({
        _sum: { contentViews: true },
      }),
      prisma.professionalAccount.aggregate({
        _sum: { toolsUsed: true },
      }),
      prisma.professionalAccount.count({
        where: {
          lastActiveAt: { gte: startDate },
        },
      }),
    ]);

    // Top professionals by engagement
    const topByEngagement = await prisma.professionalAccount.findMany({
      where: {
        lastActiveAt: { gte: startDate },
      },
      select: {
        id: true,
        organizationName: true,
        organizationType: true,
        professionalTier: true,
        contentViews: true,
        toolsUsed: true,
        lastActiveAt: true,
      },
      orderBy: [
        { contentViews: 'desc' },
        { toolsUsed: 'desc' },
      ],
      take: 10,
    });

    // Revenue trend (cumulative MRR over time)
    // For simplicity, we'll calculate based on current tiers and signup dates
    const allProfessionals = await prisma.professionalAccount.findMany({
      select: {
        createdAt: true,
        professionalTier: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Build cumulative MRR data
    const mrrByMonth: Record<string, number> = {};
    allProfessionals.forEach(p => {
      const month = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const revenue = tierPricing[p.professionalTier] || 0;
      mrrByMonth[month] = (mrrByMonth[month] || 0) + revenue;
    });

    // Convert to cumulative
    const revenueData: { month: string; mrr: number }[] = [];
    let cumulativeMrr = 0;
    Object.entries(mrrByMonth).sort().forEach(([month, revenue]) => {
      cumulativeMrr += revenue;
      revenueData.push({ month, mrr: cumulativeMrr });
    });

    // Conversion funnel (simplified)
    const conversionData = {
      signups: totalProfessionals,
      verified: verifiedProfessionals,
      active: activeInPeriod,
      paid: (tierCounts.find(t => t.professionalTier === 'STANDARD')?._count.professionalTier || 0) +
            (tierCounts.find(t => t.professionalTier === 'PREMIUM')?._count.professionalTier || 0),
    };

    // Type distribution for pie chart
    const typeDistribution = typeCounts.map(t => ({
      type: t.organizationType,
      count: t._count.organizationType,
    }));

    // Tier distribution
    const tierDistribution = tierCounts.map(t => ({
      tier: t.professionalTier,
      count: t._count.professionalTier,
      revenue: t._count.professionalTier * (tierPricing[t.professionalTier] || 0),
    }));

    return NextResponse.json({
      overview: {
        total: totalProfessionals,
        verified: verifiedProfessionals,
        pending: pendingVerifications,
        active: activeInPeriod,
        mrr,
        arr: mrr * 12,
      },
      growth: {
        data: growthData,
        signupsInPeriod: signupsRaw.length,
        avgSignupsPerDay: signupsRaw.length / periodDays,
      },
      verification: {
        verifiedInPeriod: verificationsInPeriod,
        pending: pendingVerifications,
        avgHours: Math.round(avgVerificationHours * 10) / 10,
      },
      engagement: {
        totalContentViews: totalContentViews._sum.contentViews || 0,
        totalToolsUsed: totalToolsUsed._sum.toolsUsed || 0,
        activeInPeriod,
        activeRate: totalProfessionals > 0
          ? Math.round((activeInPeriod / totalProfessionals) * 100)
          : 0,
      },
      topProfessionals: topByEngagement,
      revenue: {
        mrr,
        arr: mrr * 12,
        trend: revenueData.slice(-12), // Last 12 months
      },
      conversion: conversionData,
      distribution: {
        byType: typeDistribution,
        byTier: tierDistribution,
      },
      period: periodDays,
    });
  } catch (error) {
    console.error('Admin professionals analytics error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
