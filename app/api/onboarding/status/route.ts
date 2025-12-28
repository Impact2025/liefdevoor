import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingStep: true,
        isOnboarded: true,
        isLivenessVerified: true,
        voiceIntroUrl: true,
        registrationSource: true, // For accessibility welcome screen
        psychProfile: {
          select: {
            introvertScale: true,
            spontaneityScale: true,
            emotionalScale: true,
            adventureScale: true,
            conflictStyle: true,
            communicationStyle: true,
            relationshipGoal: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      onboardingStep: user.onboardingStep,
      isOnboarded: user.isOnboarded,
      isLivenessVerified: user.isLivenessVerified,
      hasVoiceIntro: !!user.voiceIntroUrl,
      hasPsychProfile: !!user.psychProfile,
      registrationSource: user.registrationSource, // For accessibility welcome screen
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Kon status niet ophalen' },
      { status: 500 }
    );
  }
}
