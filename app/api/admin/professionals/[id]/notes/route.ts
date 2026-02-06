import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/professionals/[id]/notes
 * Get all admin notes for a professional
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

    const notes = await prisma.professionalAdminNote.findMany({
      where: { professionalId: id },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get professional notes error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/professionals/[id]/notes
 * Add a new admin note to a professional
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true, email: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    const body = await request.json();
    const { content, noteType = 'GENERAL', isPinned = false } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Notitie is verplicht' }, { status: 400 });
    }

    // Verify professional exists
    const professional = await prisma.professionalAccount.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional niet gevonden' }, { status: 404 });
    }

    const note = await prisma.professionalAdminNote.create({
      data: {
        professionalId: id,
        content: content.trim(),
        noteType,
        isPinned,
        authorId: session.user.id,
        authorName: user.name || user.email || 'Admin',
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create professional note error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
