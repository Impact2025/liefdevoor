import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ConflictStyle } from '@prisma/client';

interface StepData {
  isLivenessVerified?: boolean;
  voiceIntroUrl?: string | null;
  relationshipGoal?: string;
  psychProfile?: {
    introvertScale: number;
    spontaneityScale: number;
    emotionalScale: number;
    adventureScale: number;
    conflictStyle: string;
    communicationStyle: string;
  };
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, data } = body as { step: number; data?: StepData };

    if (!step || step < 1 || step > 5) {
      return NextResponse.json(
        { error: 'Ongeldige stap' },
        { status: 400 }
      );
    }

    // Build update data for User model
    const updateData: Record<string, unknown> = {
      onboardingStep: step,
    };

    // Handle specific step data
    if (data?.isLivenessVerified !== undefined) {
      updateData.isLivenessVerified = data.isLivenessVerified;
    }

    if (data?.voiceIntroUrl !== undefined) {
      updateData.voiceIntroUrl = data.voiceIntroUrl;
    }

    // Handle relationship goal - save to PsychProfile
    if (data?.relationshipGoal) {
      const validGoals = ['casual', 'serious', 'marriage', 'open'];
      if (validGoals.includes(data.relationshipGoal)) {
        await prisma.psychProfile.upsert({
          where: { userId: session.user.id },
          create: {
            userId: session.user.id,
            relationshipGoal: data.relationshipGoal,
          },
          update: {
            relationshipGoal: data.relationshipGoal,
          },
        });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        onboardingStep: true,
      },
    });

    // Handle psych profile data separately
    if (data?.psychProfile) {
      const { psychProfile } = data;

      // Map string conflict style to enum
      let conflictStyleEnum: ConflictStyle | null = null;
      if (psychProfile.conflictStyle) {
        const validStyles: ConflictStyle[] = ['AVOIDING', 'ACCOMMODATING', 'COMPETING', 'COMPROMISING', 'COLLABORATING'];
        if (validStyles.includes(psychProfile.conflictStyle as ConflictStyle)) {
          conflictStyleEnum = psychProfile.conflictStyle as ConflictStyle;
        }
      }

      await prisma.psychProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          introvertScale: psychProfile.introvertScale,
          spontaneityScale: psychProfile.spontaneityScale,
          emotionalScale: psychProfile.emotionalScale,
          adventureScale: psychProfile.adventureScale,
          conflictStyle: conflictStyleEnum,
          communicationStyle: psychProfile.communicationStyle,
        },
        update: {
          introvertScale: psychProfile.introvertScale,
          spontaneityScale: psychProfile.spontaneityScale,
          emotionalScale: psychProfile.emotionalScale,
          adventureScale: psychProfile.adventureScale,
          conflictStyle: conflictStyleEnum,
          communicationStyle: psychProfile.communicationStyle,
        },
      });
    }

    return NextResponse.json({
      success: true,
      step: user.onboardingStep,
    });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return NextResponse.json(
      { error: 'Kon stap niet opslaan' },
      { status: 500 }
    );
  }
}
