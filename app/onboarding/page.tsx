'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useOnboardingStore, getSkippedSteps } from '@/store/useOnboardingStore';
import { Heart, Loader2, ChevronLeft } from 'lucide-react';

// Step Components
import WelcomeStep from '@/components/onboarding/steps/WelcomeStep';
import PricingStep from '@/components/onboarding/steps/PricingStep';
import RulesStep from '@/components/onboarding/steps/RulesStep';
import GenderStep from '@/components/onboarding/steps/GenderStep';
import BirthdateStep from '@/components/onboarding/steps/BirthdateStep';
import LocationStep from '@/components/onboarding/steps/LocationStep';
import LookingForStep from '@/components/onboarding/steps/LookingForStep';
import AgePreferenceStep from '@/components/onboarding/steps/AgePreferenceStep';
import PhotosStep from '@/components/onboarding/steps/PhotosStep';
import BioStep from '@/components/onboarding/steps/BioStep';
import InterestsStep from '@/components/onboarding/steps/InterestsStep';
import VerificationStep from '@/components/onboarding/steps/VerificationStep';
import CompleteStep from '@/components/onboarding/steps/CompleteStep';

// Step mapping (1-13)
const stepComponents: Record<number, React.ComponentType> = {
  1: WelcomeStep,
  2: PricingStep,
  3: RulesStep,
  4: GenderStep,
  5: BirthdateStep,
  6: LocationStep,
  7: LookingForStep,
  8: AgePreferenceStep,
  9: PhotosStep,
  10: BioStep,
  11: InterestsStep,
  12: VerificationStep,
  13: CompleteStep,
};

// Haptic feedback helper
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(patterns[type]);
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const {
    step,
    mode,
    prevStep,
    syncWithServer,
    isSyncing,
    hasSynced,
    profileComplete,
  } = useOnboardingStore();

  const [direction, setDirection] = useState(1);
  const [prevStepValue, setPrevStepValue] = useState(step);
  const [isDragging, setIsDragging] = useState(false);

  // Motion values for swipe gesture
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);

  // Sync with server on mount
  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  // Track direction for animation
  useEffect(() => {
    if (step > prevStepValue) {
      setDirection(1);
    } else if (step < prevStepValue) {
      setDirection(-1);
    }
    setPrevStepValue(step);
  }, [step, prevStepValue]);

  // Redirect if already complete
  useEffect(() => {
    if (hasSynced && profileComplete) {
      router.push('/discover');
    }
  }, [hasSynced, profileComplete, router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (step > 1) {
      triggerHaptic('light');
      setDirection(-1);
      prevStep();
    }
  }, [step, prevStep]);

  // Handle swipe gestures
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const swipeThreshold = 100;
      const velocityThreshold = 500;

      // Only allow swipe back (not forward - user must complete step)
      if (
        (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) &&
        step > 1 &&
        step < 13
      ) {
        handleBack();
      }
    },
    [step, handleBack]
  );

  // Get current step component
  const CurrentStep = stepComponents[step] || WelcomeStep;

  // Calculate actual progress (excluding skipped steps)
  const skippedSteps = getSkippedSteps(mode);
  const totalVisibleSteps = 13 - skippedSteps.length;
  const currentVisibleStep = Array.from({ length: step }, (_, i) => i + 1)
    .filter((s) => !skippedSteps.includes(s)).length;
  const progress = totalVisibleSteps > 1
    ? ((currentVisibleStep - 1) / (totalVisibleSteps - 1)) * 100
    : 0;

  // Loading state while syncing
  if (!hasSynced || isSyncing) {
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
        <div className="max-w-lg mx-auto px-4 pt-safe pb-3">
          {/* Back Button + Logo Row */}
          <div className="flex items-center justify-between mb-3">
            {/* Back Button */}
            <div className="w-12">
              {step > 1 && step < 13 ? (
                <motion.button
                  onClick={handleBack}
                  className="w-12 h-12 -ml-2 flex items-center justify-center rounded-full active:bg-slate-100 transition-colors touch-manipulation"
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6 text-slate-600" />
                </motion.button>
              ) : (
                <div className="w-12 h-12" />
              )}
            </div>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="text-lg font-bold text-slate-900">LVI</span>
            </div>

            {/* Placeholder for symmetry */}
            <div className="w-12" />
          </div>

          {/* Progress Bar */}
          {step > 1 && step < 13 && (
            <div className="relative">
              {/* Progress dots */}
              <div className="flex gap-1.5 justify-center">
                {Array.from({ length: totalVisibleSteps }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < currentVisibleStep
                        ? 'bg-rose-500 w-6'
                        : i === currentVisibleStep
                        ? 'bg-rose-300 w-4'
                        : 'bg-slate-200 w-1.5'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  />
                ))}
              </div>
              {/* Step Counter */}
              <p className="text-xs text-slate-400 text-center mt-2">
                {currentVisibleStep} / {totalVisibleSteps}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Step Content with Swipe Gesture */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          className="flex-1 max-w-lg mx-auto w-full px-4 py-6 touch-pan-y"
          style={{ opacity: dragOpacity }}
          drag={step > 1 && step < 13 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          dragSnapToOrigin
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
              className="h-full"
            >
              <CurrentStep />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Swipe hint (shown on first few steps) */}
      {step > 1 && step < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-8 left-0 right-0 text-center pointer-events-none safe-bottom"
        >
          <p className="text-xs text-slate-400">
            Swipe naar rechts om terug te gaan
          </p>
        </motion.div>
      )}
    </div>
  );
}
