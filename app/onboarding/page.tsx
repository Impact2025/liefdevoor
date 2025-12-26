'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart } from 'lucide-react';
import Image from 'next/image';

// Step Components (LivenessCheck temporarily disabled)
import VoiceIntroRecorder from '@/components/onboarding/steps/VoiceIntroRecorder';
import RelationshipGoalStep from '@/components/onboarding/steps/RelationshipGoalStep';
import VibeCard, { VibeAnswers } from '@/components/onboarding/steps/VibeCard';
import LifestyleStep, { LifestyleData } from '@/components/onboarding/steps/LifestyleStep';
import LoveLanguagesStep, { LoveLanguageData } from '@/components/onboarding/steps/LoveLanguagesStep';
import DealbreakersStep, { DealbreakersData } from '@/components/onboarding/steps/DealbreakersStep';
import FinishStep from '@/components/onboarding/steps/FinishStep';

// Error Boundary & Analytics
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { trackOnboardingStep, trackOnboardingDropoff, trackOnboardingComplete } from '@/lib/analytics-events';
import { useExperiment } from '@/lib/ab-testing';

// Step configuration - Wereldklasse onboarding flow
const STEPS = [
  { id: 1, name: 'Stem', description: 'Voice intro' },
  { id: 2, name: 'Doel', description: 'Wat zoek je?' },
  { id: 3, name: 'Vibe', description: 'Persoonlijkheid' },
  { id: 4, name: 'Lifestyle', description: 'Jouw levensstijl' },
  { id: 5, name: 'Liefde', description: 'Love Languages' },
  { id: 6, name: 'Filters', description: 'Dealbreakers' },
  { id: 7, name: 'Klaar', description: 'Profiel compleet' },
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
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
          </motion.div>
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-3" />
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
                className="h-full bg-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between mt-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-xs font-medium transition-colors ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-slate-400'
                  }`}
                >
                  {step.name}
                </div>
              ))}
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
              {/* Step 1: Voice Intro (Liveness check temporarily disabled) */}
              {currentStep === 1 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('voice_intro', error.message)}
                >
                  <VoiceIntroRecorder
                    onComplete={handleVoiceComplete}
                    onSkip={handleSkipVoice}
                  />
                </ErrorBoundary>
              )}

              {/* Step 2: Relationship Goal */}
              {currentStep === 2 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('relationship_goal', error.message)}
                >
                  <RelationshipGoalStep
                    onComplete={handleRelationshipGoalComplete}
                    onSkip={handleSkipRelationshipGoal}
                  />
                </ErrorBoundary>
              )}

              {/* Step 3: Vibe Card */}
              {currentStep === 3 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('vibe_card', error.message)}
                >
                  <VibeCard onComplete={handleVibeComplete} />
                </ErrorBoundary>
              )}

              {/* Step 4: Lifestyle */}
              {currentStep === 4 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('lifestyle', error.message)}
                >
                  <LifestyleStep onComplete={handleLifestyleComplete} />
                </ErrorBoundary>
              )}

              {/* Step 5: Love Languages */}
              {currentStep === 5 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('love_languages', error.message)}
                >
                  <LoveLanguagesStep onComplete={handleLoveLanguagesComplete} />
                </ErrorBoundary>
              )}

              {/* Step 6: Dealbreakers */}
              {currentStep === 6 && (
                <ErrorBoundary
                  onError={(error) => trackOnboardingDropoff('dealbreakers', error.message)}
                >
                  <DealbreakersStep onComplete={handleDealbreakersComplete} />
                </ErrorBoundary>
              )}

              {/* Step 7: Finish */}
              {currentStep === 7 && (
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
    </div>
  );
}
