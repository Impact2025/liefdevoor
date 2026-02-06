import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyKvkNumber, formatKvkNumber } from '@/lib/professionals/kvk-verification';

/**
 * POST /api/admin/professionals/verify-kvk
 * Verify a KVK number and optionally update the professional record
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { kvkNumber, professionalId } = body;

    if (!kvkNumber) {
      return NextResponse.json({ error: 'KVK nummer is verplicht' }, { status: 400 });
    }

    // Verify KVK number
    const result = await verifyKvkNumber(kvkNumber);

    // If valid and professional ID provided, update the record
    if (result.isValid && professionalId) {
      // Optionally update professional with verified company info
      if (result.company) {
        await prisma.professionalAccount.update({
          where: { id: professionalId },
          data: {
            // Could store additional company info in metadata if needed
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      ...result,
      formattedNumber: formatKvkNumber(kvkNumber),
    });
  } catch (error) {
    console.error('KVK verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
