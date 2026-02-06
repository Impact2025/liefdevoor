import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/professionals
 * Get all professional accounts with filters, search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const tier = searchParams.get('tier') || 'all';
    const verified = searchParams.get('verified') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'newest';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { organizationName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { kvkNumber: { contains: search } },
      ];
    }

    if (type !== 'all') {
      where.organizationType = type;
    }

    if (tier !== 'all') {
      where.professionalTier = tier;
    }

    if (verified === 'verified') {
      where.isVerified = true;
    } else if (verified === 'pending') {
      where.isVerified = false;
    }

    // Build sort order
    let orderBy: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[] = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'name') {
      orderBy = { organizationName: 'asc' };
    } else if (sortBy === 'lastActive') {
      orderBy = { lastActiveAt: 'desc' };
    }

    // Get professionals with user info
    const [professionals, total] = await Promise.all([
      prisma.professionalAccount.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              createdAt: true,
            },
          },
          teamMembers: {
            select: {
              id: true,
              name: true,
              email: true,
              acceptedAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.professionalAccount.count({ where }),
    ]);

    // Get stats
    const [
      totalCount,
      verifiedCount,
      pendingVerificationCount,
      tierStats,
      typeStats,
      recentSignups,
    ] = await Promise.all([
      prisma.professionalAccount.count(),
      prisma.professionalAccount.count({ where: { isVerified: true } }),
      prisma.professionalAccount.count({ where: { isVerified: false } }),
      prisma.professionalAccount.groupBy({
        by: ['professionalTier'],
        _count: { professionalTier: true },
      }),
      prisma.professionalAccount.groupBy({
        by: ['organizationType'],
        _count: { organizationType: true },
      }),
      prisma.professionalAccount.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const tierPricing: Record<string, number> = {
      BASIC: 0,
      STANDARD: 29,
      PREMIUM: 99,
    };

    const mrr = tierStats.reduce((acc, t) => {
      return acc + (t._count.professionalTier * (tierPricing[t.professionalTier] || 0));
    }, 0);

    return NextResponse.json({
      professionals: professionals.map(p => ({
        ...p,
        teamMemberCount: p.teamMembers.length,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalCount,
        verified: verifiedCount,
        pendingVerification: pendingVerificationCount,
        recentSignups,
        mrr,
        byTier: tierStats.reduce((acc, t) => {
          acc[t.professionalTier] = t._count.professionalTier;
          return acc;
        }, {} as Record<string, number>),
        byType: typeStats.reduce((acc, t) => {
          acc[t.organizationType] = t._count.organizationType;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Admin professionals error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
