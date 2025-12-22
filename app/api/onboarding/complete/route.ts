import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    // Update user to set isOnboarded = true
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isOnboarded: true,
        profileComplete: true,
      },
      select: {
        id: true,
        isOnboarded: true,
        profileComplete: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Kon onboarding niet voltooien' },
      { status: 500 }
    );
  }
}
