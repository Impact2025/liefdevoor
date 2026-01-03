import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas per step
// Based on frontend STEPS configuration (app/onboarding/page.tsx)
const stepSchemas = {
  // Step 1: Leeftijd (Birthdate)
  1: z.object({
    birthDate: z.string().transform((val) => new Date(val)),
  }),
  // Step 2: Gender
  2: z.object({
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']),
  }),
  // Step 3: Zoekt (Looking for)
  3: z.object({
    lookingFor: z.enum(['MALE', 'FEMALE', 'BOTH']),
  }),
  // Step 4: Locatie (Location) ✅ FIXED
  4: z.object({
    postcode: z.string().optional(),
    city: z.string().min(1),
    latitude: z.number(),
    longitude: z.number(),
  }),
  // Step 5: Foto's - handled by separate upload endpoint
  // Step 6: Stem (Voice) - handled by separate upload endpoint
  // Step 7: Doel (Relationship Goal)
  7: z.object({
    relationshipGoal: z.string().optional(),
  }),
  // Step 8: Vibe - stored as JSON
  // Step 9: Lifestyle - stored as JSON
  // Step 10: Liefde (Love Languages) - stored as JSON
  // Step 11: Voorkeur (Age Preference)
  11: z.object({
    minAgePreference: z.number().min(18).max(99),
    maxAgePreference: z.number().min(18).max(99),
  }),
  // Step 12: Filters (Dealbreakers) - stored as JSON
  // Step 13: AI Bio (Profile Generator)
  13: z.object({
    bio: z.string().min(10).max(500),
  }),
  // Step 14: Klaar (Finish) - no data to validate
};

// Check if profile is complete
function checkProfileComplete(user: {
  gender: string | null;
  birthDate: Date | null;
  lookingFor: string | null;
  bio: string | null;
  rulesAccepted: boolean;
  photos?: { id: string }[];
}): boolean {
  const hasGender = !!user.gender;
  const hasBirthDate = !!user.birthDate;
  const hasLookingFor = !!user.lookingFor;
  const hasBio = user.bio && user.bio.length >= 10;
  const hasRulesAccepted = user.rulesAccepted;
  const hasPhoto = user.photos && user.photos.length > 0;

  return hasGender && hasBirthDate && hasLookingFor && !!hasBio && hasRulesAccepted && !!hasPhoto;
}

// GET: Fetch current onboarding status
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
        id: true,
        name: true,
        email: true,
        gender: true,
        birthDate: true,
        bio: true,
        city: true,
        postcode: true,
        latitude: true,
        longitude: true,
        interests: true,
        lookingFor: true,
        minAgePreference: true,
        maxAgePreference: true,
        onboardingStep: true,
        onboardingMode: true,
        profileComplete: true,
        rulesAccepted: true,
        photos: {
          select: { id: true, url: true, order: true },
          orderBy: { order: 'asc' },
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
      step: user.onboardingStep,
      mode: user.onboardingMode,
      profileComplete: user.profileComplete,
      userData: {
        name: user.name,
        email: user.email,
        gender: user.gender,
        birthDate: user.birthDate,
        bio: user.bio,
        city: user.city,
        postcode: user.postcode,
        latitude: user.latitude,
        longitude: user.longitude,
        interests: user.interests,
        lookingFor: user.lookingFor,
        minAgePreference: user.minAgePreference,
        maxAgePreference: user.maxAgePreference,
        rulesAccepted: user.rulesAccepted,
        photos: user.photos,
      },
    });
  } catch (error) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    );
  }
}

// PUT: Update onboarding step
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
    const { step, data } = body;

    if (typeof step !== 'number' || step < 1 || step > 13) {
      return NextResponse.json(
        { error: 'Ongeldige stap' },
        { status: 400 }
      );
    }

    // Validate step data if schema exists
    const schema = stepSchemas[step as keyof typeof stepSchemas];
    let validatedData = data;

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Ongeldige gegevens', details: result.error.flatten() },
          { status: 400 }
        );
      }
      validatedData = result.data;
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      onboardingStep: step,
      ...validatedData,
    };

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        gender: true,
        birthDate: true,
        bio: true,
        lookingFor: true,
        rulesAccepted: true,
        onboardingStep: true,
        onboardingMode: true,
        profileComplete: true,
        photos: {
          select: { id: true },
        },
      },
    });

    // Check and update profile completion status
    const isComplete = checkProfileComplete(updatedUser);

    if (isComplete !== updatedUser.profileComplete) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { profileComplete: isComplete },
      });
    }

    return NextResponse.json({
      success: true,
      step: updatedUser.onboardingStep,
      profileComplete: isComplete,
    });
  } catch (error) {
    console.error('Onboarding PUT error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    );
  }
}
