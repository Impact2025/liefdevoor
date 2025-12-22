import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UTApi } from 'uploadthing/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand gevonden' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingen zijn toegestaan' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Bestand is te groot (max 5MB)' },
        { status: 400 }
      );
    }

    // Upload using UploadThing
    let url: string;

    try {
      const utapi = new UTApi();
      const uploadResponse = await utapi.uploadFiles(file);

      if (uploadResponse.error) {
        throw new Error(uploadResponse.error.message);
      }

      url = uploadResponse.data.url;
    } catch (uploadError) {
      console.error('UploadThing error:', uploadError);

      // Fallback: Convert to base64 and store in database
      // This is not ideal for production, but works as fallback
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      url = `data:${file.type};base64,${base64}`;
    }

    // Update user with verification photo
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isLivenessVerified: true,
        isPhotoVerified: type === 'liveness_verification',
        verifiedAt: new Date(),
      },
    });

    // Create verification record
    await prisma.photoVerification.create({
      data: {
        userId: session.user.id,
        photoUrl: url,
        pose: 'liveness_check',
        status: 'approved', // Auto-approve liveness checks
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    return NextResponse.json(
      { error: 'Upload mislukt' },
      { status: 500 }
    );
  }
}
