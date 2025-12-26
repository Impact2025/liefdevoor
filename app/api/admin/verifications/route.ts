import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';

/**
 * GET /api/admin/verifications
 * Get all pending verifications for review
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
    const status = searchParams.get('status') || 'pending,flagged';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'priority';

    const statusFilter = status.split(',');
    const skip = (page - 1) * limit;

    // Check Redis cache first (2 min TTL for verifications - shorter because they change frequently)
    const cacheKey = `admin:verifications:${status}:${page}:${limit}:${sortBy}`
    const redis = getRedis()

    if (redis) {
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          console.log('[Verifications] Cache HIT - returning cached verifications')
          return NextResponse.json(JSON.parse(cached))
        }
      } catch (error) {
        console.warn('[Cache] Redis get failed:', error)
      }
    }

    console.log('[Verifications] Cache MISS - fetching from database')

    // Build sort order
    const orderBy: Record<string, 'asc' | 'desc'>[] = [];
    if (sortBy === 'priority') {
      orderBy.push({ priority: 'desc' }, { submittedAt: 'asc' });
    } else if (sortBy === 'oldest') {
      orderBy.push({ submittedAt: 'asc' });
    } else if (sortBy === 'newest') {
      orderBy.push({ submittedAt: 'desc' });
    } else if (sortBy === 'ai-flagged') {
      orderBy.push({ isAiGenerated: 'desc' }, { aiConfidence: 'desc' });
    }

    // Get verifications with user info
    const [verifications, total] = await Promise.all([
      prisma.photoVerification.findMany({
        where: {
          status: { in: statusFilter },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              createdAt: true,
              isPhotoVerified: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.photoVerification.count({
        where: {
          status: { in: statusFilter },
        },
      }),
    ]);

    // Get stats
    const stats = await prisma.photoVerification.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusCounts = stats.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      verifications: verifications.map(v => ({
        ...v,
        aiAnalysis: v.aiAnalysis ? JSON.parse(v.aiAnalysis) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending: statusCounts['pending'] || 0,
        flagged: statusCounts['flagged'] || 0,
        approved: statusCounts['approved'] || 0,
        rejected: statusCounts['rejected'] || 0,
      },
    }

    // Cache response for 2 minutes (shorter TTL because verifications change frequently)
    if (redis) {
      try {
        await redis.setex(cacheKey, 120, JSON.stringify(response))
        console.log('[Verifications] Cached verifications for 2 minutes')
      } catch (error) {
        console.warn('[Cache] Redis set failed:', error)
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin verifications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
