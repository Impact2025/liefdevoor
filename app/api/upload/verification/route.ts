import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UTApi } from 'uploadthing/server';
import { analyzePhoto, calculatePriority, getInitialStatus } from '@/lib/photo-verification';

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
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      url = `data:${file.type};base64,${base64}`;
    }

    // Run AI analysis on the photo (async, don't block response)
    let aiAnalysis = null;
    let priority = 0;
    let status = 'pending';

    try {
      aiAnalysis = await analyzePhoto(url);
      priority = calculatePriority(aiAnalysis);
      status = getInitialStatus(aiAnalysis);

      console.log('[PhotoVerification] AI Analysis:', {
        userId: session.user.id,
        isAiGenerated: aiAnalysis.isAiGenerated,
        aiConfidence: aiAnalysis.aiConfidence,
        hasFace: aiAnalysis.hasFace,
        recommendation: aiAnalysis.analysis.recommendation,
        priority,
        status,
      });
    } catch (analysisError) {
      console.error('AI analysis error:', analysisError);
      // Continue without AI analysis - will be manually reviewed
    }

    // Create verification record (NOT auto-approved, goes to review queue)
    const verification = await prisma.photoVerification.create({
      data: {
        userId: session.user.id,
        photoUrl: url,
        pose: type === 'liveness_verification' ? 'liveness_check' : 'selfie',
        status,
        priority,
        // AI analysis results
        isAiGenerated: aiAnalysis?.isAiGenerated ?? null,
        aiConfidence: aiAnalysis?.aiConfidence ?? null,
        aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis.analysis) : null,
        aiCheckedAt: aiAnalysis ? new Date() : null,
        hasFace: aiAnalysis?.hasFace ?? null,
        faceCount: aiAnalysis?.faceCount ?? null,
        qualityScore: aiAnalysis?.qualityScore ?? null,
      },
    });

    // Mark liveness check as completed (but NOT verified - that requires manual approval)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isLivenessVerified: true, // Liveness check completed
        // Note: isPhotoVerified stays false until manual approval
      },
    });

    return NextResponse.json({
      success: true,
      url,
      verificationId: verification.id,
      status: verification.status,
      message: status === 'flagged'
        ? 'Je foto wordt handmatig beoordeeld'
        : 'Je foto wordt zo snel mogelijk beoordeeld',
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    return NextResponse.json(
      { error: 'Upload mislukt' },
      { status: 500 }
    );
  }
}
