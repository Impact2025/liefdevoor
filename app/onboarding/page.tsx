'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart } from 'lucide-react';
import Image from 'next/image';

// Step Components - Essentiële stappen
import BirthdateStep from '@/components/onboarding/steps/BirthdateStep';
import GenderStep from '@/components/onboarding/steps/GenderStep';
import LookingForStep from '@/components/onboarding/steps/LookingForStep';
import LocationStep, { LocationData } from '@/components/onboarding/steps/LocationStep';
import PhotosStep, { PhotoData } from '@/components/onboarding/steps/PhotosStep';
import AgePreferenceStep, { AgePreferenceData } from '@/components/onboarding/steps/AgePreferenceStep';

// Step Components - Unieke features
import VoiceIntroRecorder from '@/components/onboarding/steps/VoiceIntroRecorder';
import RelationshipGoalStep from '@/components/onboarding/steps/RelationshipGoalStep';
import VibeCard, { VibeAnswers } from '@/components/onboarding/steps/VibeCard';
import LifestyleStep, { LifestyleData } from '@/components/onboarding/steps/LifestyleStep';
import LoveLanguagesStep, { LoveLanguageData } from '@/components/onboarding/steps/LoveLanguagesStep';
import DealbreakersStep, { DealbreakersData } from '@/components/onboarding/steps/DealbreakersStep';
import BioWithAIOption from '@/components/onboarding/steps/BioWithAIOption';
import FinishStep from '@/components/onboarding/steps/FinishStep';

// Accessibility Welcome Screen
import AccessibilityWelcome from '@/components/accessibility/AccessibilityWelcome';

// Error Boundary & Analytics
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { trackOnboardingStep, trackOnboardingDropoff, trackOnboardingComplete } from '@/lib/analytics-events';
import { useExperiment } from '@/lib/ab-testing';

// Step configuration - Wereldklasse onboarding flow met ALLE essentiële stappen
const STEPS = [
  { id: 1, name: 'Leeftijd', description: 'Wanneer ben je geboren?' },
  { id: 2, name: 'Gender', description: 'Hoe identificeer je?' },
  { id: 3, name: 'Zoekt', description: 'Wie zoek je?' },
  { id: 4, name: 'Locatie', description: 'Waar woon je?' },
  { id: 5, name: "Foto's", description: 'Laat jezelf zien' },
  { id: 6, name: 'Stem', description: 'Voice intro' },
  { id: 7, name: 'Doel', description: 'Wat zoek je?' },
  { id: 8, name: 'Vibe', description: 'Persoonlijkheid' },
  { id: 9, name: 'Lifestyle', description: 'Jouw levensstijl' },
  { id: 10, name: 'Liefde', description: 'Love Languages' },
  { id: 11, name: 'Voorkeur', description: 'Leeftijdsvoorkeur' },
  { id: 12, name: 'Filters', description: 'Dealbreakers' },
  { id: 13, name: 'Bio', description: 'Over jezelf' },
  { id: 14, name: 'Klaar', description: 'Profiel compleet' },
];

const TOTAL_STEPS = STEPS.length;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessibilityWelcome, setShowAccessibilityWelcome] = useState(false);
  const [registrationSource, setRegistrationSource] = useState<string | null>(null);

  // A/B Testing
  const { variant: flowVariant, trackConversion } = useExperiment('onboarding_flow');

  // Fetch current onboarding step from server
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/onboarding/status');
        if (response.ok) {
          const data = await response.json();
          // If already onboarded, redirect to discover
          if (data.isOnboarded) {
            router.push('/discover');
            return;
          }

          // Set step from server or default to 1
          setCurrentStep(data.onboardingStep || 1);

          // Check if user has accessibility source and is on step 1 (first time)
          if (data.registrationSource && (data.onboardingStep === 1 || !data.onboardingStep)) {
            setRegistrationSource(data.registrationSource);
            // Show welcome screen for visueel and lvb sources
            if (data.registrationSource === 'visueel' || data.registrationSource === 'lvb') {
              setShowAccessibilityWelcome(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [status, router]);

  // Update step on server
  const updateStepOnServer = useCallback(async (step: number, data?: Record<string, unknown>) => {
    try {
      await fetch('/api/onboarding/step', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data }),
      });
    } catch (error) {
      console.error('Error updating step:', error);
    }
  }, []);

  // Navigate to next step
  const goToNextStep = useCallback(async (data?: Record<string, unknown>) => {
    const nextStep = currentStep + 1;
    if (nextStep <= TOTAL_STEPS) {
      await updateStepOnServer(nextStep, data);
      setDirection(1);
      setCurrentStep(nextStep);

      // Track step completion
      const stepName = STEPS[currentStep - 1]?.name || `step_${currentStep}`;
      trackOnboardingStep(stepName, currentStep);
      trackConversion(`step_${currentStep}_complete`);
    }
  }, [currentStep, updateStepOnServer, trackConversion]);

  // === ESSENTIËLE STAPPEN HANDLERS ===

  // Handle birthdate completion
  const handleBirthdateComplete = useCallback(async (birthDate: string) => {
    await goToNextStep({ birthDate });
  }, [goToNextStep]);

  // Handle gender completion
  const handleGenderComplete = useCallback(async (gender: string) => {
    await goToNextStep({ gender });
  }, [goToNextStep]);

  // Handle looking for completion
  const handleLookingForComplete = useCallback(async (lookingFor: string) => {
    await goToNextStep({ lookingFor });
  }, [goToNextStep]);

  // Handle location completion
  const handleLocationComplete = useCallback(async (data: LocationData) => {
    await goToNextStep({
      city: data.city,
      postcode: data.postcode,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  }, [goToNextStep]);

  // Handle photos completion
  const handlePhotosComplete = useCallback(async (photos: PhotoData[]) => {
    await goToNextStep({ photos });
  }, [goToNextStep]);

  // Handle profile generator completion (AI-generated bio)
  const handleProfileGeneratorComplete = useCallback(async (bio: string) => {
    await goToNextStep({ bio });
  }, [goToNextStep]);

  // Handle profile generator skip
  const handleSkipProfileGenerator = useCallback(() => {
    trackOnboardingDropoff('profile_generator', 'skipped');
    goToNextStep();
  }, [goToNextStep]);

  // === UNIEKE FEATURES HANDLERS ===

  // Handle voice intro completion
  const handleVoiceComplete = useCallback(async (audioUrl: string | null) => {
    await goToNextStep({ voiceIntroUrl: audioUrl });
  }, [goToNextStep]);

  // Handle relationship goal completion
  const handleRelationshipGoalComplete = useCallback(async (goal: string) => {
    await goToNextStep({ relationshipGoal: goal });
  }, [goToNextStep]);

  // Handle vibe card completion
  const handleVibeComplete = useCallback(async (answers: VibeAnswers) => {
    await goToNextStep({ psychProfile: answers });
  }, [goToNextStep]);

  // Handle lifestyle completion
  const handleLifestyleComplete = useCallback(async (data: LifestyleData) => {
    await goToNextStep({ lifestyle: data });
  }, [goToNextStep]);

  // Handle love languages completion
  const handleLoveLanguagesComplete = useCallback(async (data: LoveLanguageData) => {
    await goToNextStep({ loveLanguages: data });
  }, [goToNextStep]);

  // Handle age preference completion
  const handleAgePreferenceComplete = useCallback(async (data: AgePreferenceData) => {
    await goToNextStep({
      minAgePreference: data.minAge,
      maxAgePreference: data.maxAge,
    });
  }, [goToNextStep]);

  // Handle dealbreakers completion
  const handleDealbreakersComplete = useCallback(async (data: DealbreakersData) => {
    await goToNextStep({ dealbreakers: data });
  }, [goToNextStep]);

  // Handle finish
  const handleFinishComplete = useCallback(() => {
    // Track onboarding completion
    if (session?.user?.id) {
      trackOnboardingComplete(session.user.id, TOTAL_STEPS);
      trackConversion('onboarding_complete', 1);
    }
  }, [session?.user?.id, trackConversion]);

  // Skip handlers (optional steps)
  const handleSkipVoice = useCallback(() => {
    trackOnboardingDropoff('voice_intro', 'skipped');
    goToNextStep();
  }, [goToNextStep]);

  const handleSkipRelationshipGoal = useCallback(() => {
    trackOnboardingDropoff('relationship_goal', 'skipped');
    goToNextStep();
  }, [goToNextStep]);

  // Calculate progress percentage
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
          </motion.div>
          <Loader2 className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Even geduld...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col safe-area-inset">
      {/* Header with Logo and Progress */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 safe-top">
        <div className="max-w-lg mx-auto px-4 pt-safe pb-4">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={120}
              height={34}
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* Progress Bar */}
          <div className="relative">
            {/* Background track */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rose-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Current step info */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">
                Stap {currentStep} van {STEPS.length}
              </span>
              <span className="text-xs font-medium text-rose-600">
                {STEPS[currentStep - 1]?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Step Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="h-full"
            >
              {/* Step 1: Birthdate - Leeftijdsverificatie (18+) */}
              {currentStep === 1 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('birthdate', error.message)}
                >
                  <BirthdateStep onComplete={handleBirthdateComplete} />
                </ErrorBoundary>
              )}

              {/* Step 2: Gender */}
              {currentStep === 2 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('gender', error.message)}
                >
                  <GenderStep onComplete={handleGenderComplete} />
                </ErrorBoundary>
              )}

              {/* Step 3: Looking For */}
              {currentStep === 3 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('looking_for', error.message)}
                >
                  <LookingForStep onComplete={handleLookingForComplete} />
                </ErrorBoundary>
              )}

              {/* Step 4: Location */}
              {currentStep === 4 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('location', error.message)}
                >
                  <LocationStep onComplete={handleLocationComplete} />
                </ErrorBoundary>
              )}

              {/* Step 5: Photos */}
              {currentStep === 5 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('photos', error.message)}
                >
                  <PhotosStep onComplete={handlePhotosComplete} />
                </ErrorBoundary>
              )}

              {/* Step 6: Voice Intro */}
              {currentStep === 6 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('voice_intro', error.message)}
                >
                  <VoiceIntroRecorder
                    onComplete={handleVoiceComplete}
                    onSkip={handleSkipVoice}
                  />
                </ErrorBoundary>
              )}

              {/* Step 7: Relationship Goal */}
              {currentStep === 7 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('relationship_goal', error.message)}
                >
                  <RelationshipGoalStep
                    onComplete={handleRelationshipGoalComplete}
                    onSkip={handleSkipRelationshipGoal}
                  />
                </ErrorBoundary>
              )}

              {/* Step 8: Vibe Card */}
              {currentStep === 8 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('vibe_card', error.message)}
                >
                  <VibeCard onComplete={handleVibeComplete} />
                </ErrorBoundary>
              )}

              {/* Step 9: Lifestyle */}
              {currentStep === 9 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('lifestyle', error.message)}
                >
                  <LifestyleStep onComplete={handleLifestyleComplete} />
                </ErrorBoundary>
              )}

              {/* Step 10: Love Languages */}
              {currentStep === 10 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('love_languages', error.message)}
                >
                  <LoveLanguagesStep onComplete={handleLoveLanguagesComplete} />
                </ErrorBoundary>
              )}

              {/* Step 11: Age Preference */}
              {currentStep === 11 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('age_preference', error.message)}
                >
                  <AgePreferenceStep onComplete={handleAgePreferenceComplete} />
                </ErrorBoundary>
              )}

              {/* Step 12: Dealbreakers */}
              {currentStep === 12 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('dealbreakers', error.message)}
                >
                  <DealbreakersStep onComplete={handleDealbreakersComplete} />
                </ErrorBoundary>
              )}

              {/* Step 13: Bio (with optional AI Generator) */}
              {currentStep === 13 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('bio', error.message)}
                >
                  <BioWithAIOption
                    onComplete={handleProfileGeneratorComplete}
                    onSkip={handleSkipProfileGenerator}
                    userData={{
                      name: session?.user?.name || undefined,
                      gender: undefined, // Collected in step 2
                      lookingFor: undefined, // Collected in step 3
                      relationshipGoal: undefined, // Collected in step 7
                    }}
                  />
                </ErrorBoundary>
              )}

              {/* Step 14: Finish */}
              {currentStep === 14 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('finish', error.message)}
                >
                  <FinishStep onComplete={handleFinishComplete} />
                </ErrorBoundary>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Accessibility Welcome Screen - Show for visueel/lvb users on first visit */}
      {showAccessibilityWelcome && (
        <AccessibilityWelcome
          source={registrationSource}
          onDismiss={() => setShowAccessibilityWelcome(false)}
        />
      )}
    </div>
  );
}
