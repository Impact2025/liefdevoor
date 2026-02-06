import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/professionals/[id]/notes/[noteId]
 * Update an admin note
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id, noteId } = await params;

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
    const { content, isPinned, noteType } = body;

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content.trim();
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (noteType !== undefined) updateData.noteType = noteType;

    const note = await prisma.professionalAdminNote.update({
      where: { id: noteId },
      data: updateData,
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Update professional note error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/professionals/[id]/notes/[noteId]
 * Delete an admin note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { noteId } = await params;

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

    await prisma.professionalAdminNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete professional note error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
