import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/professionals/[id]
 * Get a single professional account with full details
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

    const professional = await prisma.professionalAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            createdAt: true,
            isVerified: true,
            isPhotoVerified: true,
            lastSeen: true,
            city: true,
          },
        },
        teamMembers: {
          orderBy: { invitedAt: 'desc' },
        },
      },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional niet gevonden' }, { status: 404 });
    }

    // Get activity stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      professional,
      activity: {
        lastActiveAt: professional.lastActiveAt,
        contentViews: professional.contentViews,
        toolsUsed: professional.toolsUsed,
      },
    });
  } catch (error) {
    console.error('Admin professional detail error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/professionals/[id]
 * Update a professional account (verify, change tier, etc.)
 */
export async function PATCH(
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

    const body = await request.json();
    const {
      action,
      professionalTier,
      isVerified,
      clientLimit,
      canAccessContent,
      canDownloadPdf,
      canWhiteLabel,
      rejectionReason,
    } = body;

    // Get current professional
    const professional = await prisma.professionalAccount.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional niet gevonden' }, { status: 404 });
    }

    // Handle verification action
    if (action === 'verify') {
      const updated = await prisma.professionalAccount.update({
        where: { id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedById: session.user.id,
        },
      });

      // TODO: Send verification email
      console.log(`[Professionals] Verified: ${professional.organizationName} by ${session.user.id}`);

      return NextResponse.json({ success: true, professional: updated });
    }

    // Handle rejection action
    if (action === 'reject') {
      const updated = await prisma.professionalAccount.update({
        where: { id },
        data: {
          isVerified: false,
          verifiedAt: null,
          verifiedById: null,
        },
      });

      // TODO: Send rejection email with reason
      console.log(`[Professionals] Rejected: ${professional.organizationName}, reason: ${rejectionReason}`);

      return NextResponse.json({ success: true, professional: updated });
    }

    // Handle tier change
    if (professionalTier) {
      // Set features based on tier
      let tierFeatures = {};
      if (professionalTier === 'BASIC') {
        tierFeatures = {
          canAccessContent: true,
          canDownloadPdf: false,
          canWhiteLabel: false,
          clientLimit: 0,
        };
      } else if (professionalTier === 'STANDARD') {
        tierFeatures = {
          canAccessContent: true,
          canDownloadPdf: true,
          canWhiteLabel: false,
          clientLimit: 10,
        };
      } else if (professionalTier === 'PREMIUM') {
        tierFeatures = {
          canAccessContent: true,
          canDownloadPdf: true,
          canWhiteLabel: true,
          clientLimit: 0, // Unlimited
        };
      }

      const updated = await prisma.professionalAccount.update({
        where: { id },
        data: {
          professionalTier,
          ...tierFeatures,
        },
      });

      console.log(`[Professionals] Tier changed: ${professional.organizationName} to ${professionalTier}`);

      return NextResponse.json({ success: true, professional: updated });
    }

    // General update
    const updateData: Record<string, unknown> = {};
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    if (typeof clientLimit === 'number') updateData.clientLimit = clientLimit;
    if (typeof canAccessContent === 'boolean') updateData.canAccessContent = canAccessContent;
    if (typeof canDownloadPdf === 'boolean') updateData.canDownloadPdf = canDownloadPdf;
    if (typeof canWhiteLabel === 'boolean') updateData.canWhiteLabel = canWhiteLabel;

    if (Object.keys(updateData).length > 0) {
      const updated = await prisma.professionalAccount.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, professional: updated });
    }

    return NextResponse.json({ error: 'Geen wijzigingen opgegeven' }, { status: 400 });
  } catch (error) {
    console.error('Admin professional update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/professionals/[id]
 * Delete a professional account
 */
export async function DELETE(
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

    // Get professional first for logging
    const professional = await prisma.professionalAccount.findUnique({
      where: { id },
      select: { organizationName: true, user: { select: { email: true } } },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional niet gevonden' }, { status: 404 });
    }

    // Delete professional account (cascade deletes team members)
    await prisma.professionalAccount.delete({
      where: { id },
    });

    console.log(`[Professionals] Deleted: ${professional.organizationName} by admin ${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin professional delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
