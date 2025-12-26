import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { verificationActionSchema } from '@/lib/validations/admin-schemas';
import { validateBody } from '@/lib/api-helpers';
import { checkAdminRateLimit, rateLimitErrorResponse } from '@/lib/rate-limit-admin';
import { auditLogImmediate, getClientInfo } from '@/lib/audit';

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

    // Zod validation
    const validation = await validateBody(request, verificationActionSchema.extend({ verificationId: z.string().cuid().optional() }));
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        field: validation.field,
        message: validation.message
      }, { status: 400 });
    }

    const { action, reason } = validation.data;

    // Rate limiting - 150 verification actions per hour
    const rateLimit = await checkAdminRateLimit(session.user.id, 'verification_action', 150, 3600);
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 });
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
        moderatorNotes: reason || null,
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

    // Immediate audit log for critical action
    const clientInfo = getClientInfo(request);
    await auditLogImmediate(action === 'approve' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED', {
      userId: session.user.id,
      targetUserId: verification.userId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        verificationId: id,
        action,
        reason: reason || 'No reason provided',
        adminName: adminUser.name
      },
      success: true
    });

    return NextResponse.json({
      success: true,
      verification: updatedVerification,
      message: `Verificatie ${action === 'approve' ? 'goedgekeurd' : 'afgewezen'}`
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
