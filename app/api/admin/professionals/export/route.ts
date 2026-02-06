import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/professionals/export
 * Export professionals to CSV
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
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'all';
    const tier = searchParams.get('tier') || 'all';
    const verified = searchParams.get('verified') || 'all';

    // Build where clause
    const where: Record<string, unknown> = {};
    if (type !== 'all') where.organizationType = type;
    if (tier !== 'all') where.professionalTier = tier;
    if (verified === 'verified') where.isVerified = true;
    if (verified === 'pending') where.isVerified = false;

    const professionals = await prisma.professionalAccount.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            city: true,
            createdAt: true,
          },
        },
        teamMembers: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'json') {
      return NextResponse.json({
        count: professionals.length,
        exportedAt: new Date().toISOString(),
        professionals,
      });
    }

    // CSV export
    const headers = [
      'ID',
      'Organisatie',
      'Type',
      'Tier',
      'Status',
      'KVK',
      'BTW',
      'Website',
      'Telefoon',
      'Adres',
      'Contactpersoon',
      'Email',
      'Stad',
      'Content Views',
      'Tools Gebruikt',
      'Teamleden',
      'Aangemaakt',
      'Geverifieerd',
      'Laatst Actief',
    ];

    const rows = professionals.map(p => [
      p.id,
      `"${(p.organizationName || '').replace(/"/g, '""')}"`,
      p.organizationType,
      p.professionalTier,
      p.isVerified ? 'Geverifieerd' : 'Wachtend',
      p.kvkNumber || '',
      p.btwNumber || '',
      p.websiteUrl || '',
      p.phoneNumber || '',
      `"${(p.address || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(p.user.name || '').replace(/"/g, '""')}"`,
      p.user.email || '',
      p.user.city || '',
      p.contentViews,
      p.toolsUsed,
      p.teamMembers.length,
      p.createdAt.toISOString().split('T')[0],
      p.verifiedAt ? p.verifiedAt.toISOString().split('T')[0] : '',
      p.lastActiveAt ? p.lastActiveAt.toISOString().split('T')[0] : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Add BOM for Excel compatibility with UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="professionals-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Admin professionals export error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
