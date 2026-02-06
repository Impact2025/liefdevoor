import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/professionals/[id]/activity
 * Get activity timeline for a professional
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const action = searchParams.get('action'); // Filter by action type

    const where: Record<string, unknown> = { professionalId: id };
    if (action) {
      where.action = action;
    }

    const [activities, total] = await Promise.all([
      prisma.professionalActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.professionalActivityLog.count({ where }),
    ]);

    // Get activity stats
    const stats = await prisma.professionalActivityLog.groupBy({
      by: ['action'],
      where: { professionalId: id },
      _count: { action: true },
    });

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, s) => {
        acc[s.action] = s._count.action;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Get professional activity error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/professionals/[id]/activity
 * Log an activity for a professional (for internal use)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { action, description, metadata } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is verplicht' }, { status: 400 });
    }

    const activity = await prisma.professionalActivityLog.create({
      data: {
        professionalId: id,
        action,
        description,
        metadata,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Update lastActiveAt
    await prisma.professionalAccount.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Log professional activity error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
