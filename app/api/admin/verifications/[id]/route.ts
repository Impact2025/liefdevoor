import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/verifications/[id]
 * Get a single verification with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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

    const verification = await prisma.photoVerification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            createdAt: true,
            isPhotoVerified: true,
            photos: {
              orderBy: { order: 'asc' },
              take: 6,
            },
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verificatie niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      ...verification,
      aiAnalysis: verification.aiAnalysis ? JSON.parse(verification.aiAnalysis) : null,
    });
  } catch (error) {
    console.error('Get verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/verifications/[id]
 * Approve or reject a verification
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    const body = await request.json();
    const { action, reason, notes } = body as {
      action: 'approve' | 'reject';
      reason?: string;
      notes?: string;
    };

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 });
    }

    // Get the verification
    const verification = await prisma.photoVerification.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verificatie niet gevonden' }, { status: 404 });
    }

    // Update verification status
    const updatedVerification = await prisma.photoVerification.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionReason: action === 'reject' ? reason : null,
        moderatorNotes: notes || null,
      },
    });

    // If approved, update user's verification status
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          isPhotoVerified: true,
          verifiedAt: new Date(),
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'verification_approved',
          title: 'Verificatie goedgekeurd!',
          message: 'Je profiel is nu geverifieerd. Je krijgt een verificatie badge.',
        },
      });
    } else {
      // Create notification for rejection
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'verification_rejected',
          title: 'Verificatie niet goedgekeurd',
          message: reason || 'Je verificatiefoto voldoet niet aan onze richtlijnen. Probeer het opnieuw.',
        },
      });
    }

    // Log admin action
    console.log(`[ADMIN] Verification ${action}:`, {
      verificationId: id,
      userId: verification.userId,
      adminId: session.user.id,
      adminName: adminUser.name,
      reason: reason || null,
    });

    return NextResponse.json({
      success: true,
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('Update verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/verifications/[id]
 * Delete a verification record
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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

    await prisma.photoVerification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
