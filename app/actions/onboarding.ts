'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ConflictStyle } from '@prisma/client';

// Types for PsychProfile fields
type PsychProfileField =
  | 'introvertScale'
  | 'emotionalScale'
  | 'spontaneityScale'
  | 'adventureScale'
  | 'conflictStyle'
  | 'communicationStyle'
  | 'familyImportance'
  | 'careerImportance'
  | 'socialImportance'
  | 'loveLangWords'
  | 'loveLangTime'
  | 'loveLangGifts'
  | 'loveLangActs'
  | 'loveLangTouch'
  | 'attachmentStyle'
  | 'wantsChildren'
  | 'relationshipGoal';

// Required fields for psych profile to be considered complete
const REQUIRED_PSYCH_FIELDS: PsychProfileField[] = [
  'introvertScale',
  'spontaneityScale',
  'emotionalScale',
  'adventureScale',
  'conflictStyle',
  'communicationStyle',
];

/**
 * Helper to get and validate the current user
 */
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Niet ingelogd');
  }
  return session.user;
}

/**
 * Step 1: Complete liveness verification
 * Sets isLivenessVerified=true and increments onboardingStep
 */
export async function completeLivenessStep(userId?: string) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    // Verify user is updating their own record (unless admin)
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Niet geautoriseerd');
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isLivenessVerified: true,
        onboardingStep: 2, // Move to voice intro step
      },
    });

    revalidatePath('/onboarding');

    return { success: true, nextStep: 2 };
  } catch (error) {
    console.error('Error completing liveness step:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verificatie mislukt'
    };
  }
}

/**
 * Step 2: Save voice intro URL
 * Saves the voice intro URL and increments onboardingStep
 */
export async function saveVoiceIntro(userId?: string, url?: string | null) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    // Verify user is updating their own record
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Niet geautoriseerd');
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        voiceIntroUrl: url || null,
        onboardingStep: 3, // Move to psych profile step
      },
    });

    revalidatePath('/onboarding');

    return { success: true, nextStep: 3 };
  } catch (error) {
    console.error('Error saving voice intro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Opslaan mislukt'
    };
  }
}

/**
 * Step 3: Save a single psych preference
 * Updates PsychProfile and checks if all required fields are filled
 */
export async function savePsychPreference(
  userId: string | undefined,
  field: PsychProfileField,
  value: string | number
) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    // Verify user is updating their own record
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Niet geautoriseerd');
    }

    // Prepare the update data
    const updateData: Record<string, unknown> = {};

    // Handle conflictStyle enum conversion
    if (field === 'conflictStyle') {
      const validStyles: ConflictStyle[] = [
        'AVOIDING',
        'ACCOMMODATING',
        'COMPETING',
        'COMPROMISING',
        'COLLABORATING',
      ];
      if (validStyles.includes(value as ConflictStyle)) {
        updateData[field] = value as ConflictStyle;
      }
    } else {
      updateData[field] = value;
    }

    // Upsert the psych profile
    const psychProfile = await prisma.psychProfile.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        ...updateData,
      },
      update: updateData,
    });

    // Check if all required fields are now filled
    const isComplete = REQUIRED_PSYCH_FIELDS.every((requiredField) => {
      const fieldValue = psychProfile[requiredField as keyof typeof psychProfile];
      return fieldValue !== null && fieldValue !== undefined;
    });

    // If psych profile is complete, move to finish step
    if (isComplete) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { onboardingStep: 4 },
      });
    }

    revalidatePath('/onboarding');

    return {
      success: true,
      isComplete,
      nextStep: isComplete ? 4 : 3,
    };
  } catch (error) {
    console.error('Error saving psych preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Opslaan mislukt'
    };
  }
}

/**
 * Save all psych preferences at once (batch update)
 * Used when submitting the entire VibeCard questionnaire
 */
export async function savePsychProfile(
  userId: string | undefined,
  profile: {
    introvertScale?: number;
    emotionalScale?: number;
    spontaneityScale?: number;
    adventureScale?: number;
    conflictStyle?: string;
    communicationStyle?: string;
    familyImportance?: number;
    careerImportance?: number;
    socialImportance?: number;
    loveLangWords?: number;
    loveLangTime?: number;
    loveLangGifts?: number;
    loveLangActs?: number;
    loveLangTouch?: number;
    attachmentStyle?: string;
    wantsChildren?: string;
    relationshipGoal?: string;
  }
) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    // Verify user is updating their own record
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Niet geautoriseerd');
    }

    // Handle conflictStyle enum conversion
    let conflictStyleEnum: ConflictStyle | undefined;
    if (profile.conflictStyle) {
      const validStyles: ConflictStyle[] = [
        'AVOIDING',
        'ACCOMMODATING',
        'COMPETING',
        'COMPROMISING',
        'COLLABORATING',
      ];
      if (validStyles.includes(profile.conflictStyle as ConflictStyle)) {
        conflictStyleEnum = profile.conflictStyle as ConflictStyle;
      }
    }

    // Upsert the psych profile
    await prisma.psychProfile.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        introvertScale: profile.introvertScale,
        emotionalScale: profile.emotionalScale,
        spontaneityScale: profile.spontaneityScale,
        adventureScale: profile.adventureScale,
        conflictStyle: conflictStyleEnum,
        communicationStyle: profile.communicationStyle,
        familyImportance: profile.familyImportance,
        careerImportance: profile.careerImportance,
        socialImportance: profile.socialImportance,
        loveLangWords: profile.loveLangWords,
        loveLangTime: profile.loveLangTime,
        loveLangGifts: profile.loveLangGifts,
        loveLangActs: profile.loveLangActs,
        loveLangTouch: profile.loveLangTouch,
        attachmentStyle: profile.attachmentStyle,
        wantsChildren: profile.wantsChildren,
        relationshipGoal: profile.relationshipGoal,
      },
      update: {
        introvertScale: profile.introvertScale,
        emotionalScale: profile.emotionalScale,
        spontaneityScale: profile.spontaneityScale,
        adventureScale: profile.adventureScale,
        conflictStyle: conflictStyleEnum,
        communicationStyle: profile.communicationStyle,
        familyImportance: profile.familyImportance,
        careerImportance: profile.careerImportance,
        socialImportance: profile.socialImportance,
        loveLangWords: profile.loveLangWords,
        loveLangTime: profile.loveLangTime,
        loveLangGifts: profile.loveLangGifts,
        loveLangActs: profile.loveLangActs,
        loveLangTouch: profile.loveLangTouch,
        attachmentStyle: profile.attachmentStyle,
        wantsChildren: profile.wantsChildren,
        relationshipGoal: profile.relationshipGoal,
      },
    });

    // Move to finish step
    await prisma.user.update({
      where: { id: targetUserId },
      data: { onboardingStep: 4 },
    });

    revalidatePath('/onboarding');

    return { success: true, nextStep: 4 };
  } catch (error) {
    console.error('Error saving psych profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Opslaan mislukt'
    };
  }
}

/**
 * Step 4: Complete onboarding
 * Sets isOnboarded=true and redirects to dashboard
 */
export async function completeOnboarding(userId?: string) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    // Verify user is updating their own record
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Niet geautoriseerd');
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isOnboarded: true,
        profileComplete: true,
        onboardingStep: 4,
      },
    });

    revalidatePath('/onboarding');
    revalidatePath('/discover');
    revalidatePath('/dashboard');

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onboarding afronden mislukt'
    };
  }

  // Redirect outside of try-catch (Next.js requirement)
  redirect('/discover');
}

/**
 * Skip a step without completing it
 * Useful for optional steps like liveness or voice intro
 */
export async function skipOnboardingStep(userId: string | undefined, currentStep: number) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    // Verify user is updating their own record
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Niet geautoriseerd');
    }

    const nextStep = Math.min(currentStep + 1, 4);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { onboardingStep: nextStep },
    });

    revalidatePath('/onboarding');

    return { success: true, nextStep };
  } catch (error) {
    console.error('Error skipping step:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Overslaan mislukt'
    };
  }
}

/**
 * Get current onboarding status
 */
export async function getOnboardingStatus(userId?: string) {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId || user.id;

    const userData = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        onboardingStep: true,
        isOnboarded: true,
        isLivenessVerified: true,
        voiceIntroUrl: true,
        psychProfile: {
          select: {
            introvertScale: true,
            emotionalScale: true,
            spontaneityScale: true,
            adventureScale: true,
            conflictStyle: true,
            communicationStyle: true,
          },
        },
      },
    });

    if (!userData) {
      throw new Error('Gebruiker niet gevonden');
    }

    // Check psych profile completion
    const psychComplete = userData.psychProfile
      ? REQUIRED_PSYCH_FIELDS.every((field) => {
          const value = userData.psychProfile?.[field as keyof typeof userData.psychProfile];
          return value !== null && value !== undefined;
        })
      : false;

    return {
      success: true,
      data: {
        currentStep: userData.onboardingStep,
        isOnboarded: userData.isOnboarded,
        isLivenessVerified: userData.isLivenessVerified,
        hasVoiceIntro: !!userData.voiceIntroUrl,
        hasPsychProfile: psychComplete,
      },
    };
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Status ophalen mislukt'
    };
  }
}
