'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';

interface FinishStepProps {
  onComplete?: () => void;
}

export default function FinishStep({ onComplete }: FinishStepProps) {
  const router = useRouter();
  const { update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    if (!hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);

      // Initial burst
      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#a855f7', '#c084fc', '#ec4899', '#f472b6'],
        });
      }, 300);

      // Second burst
      const timer2 = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#9333ea', '#a855f7', '#c084fc'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#ec4899', '#f472b6', '#fda4af'],
        });
      }, 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [hasTriggeredConfetti]);

  const handleGoToApp = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Call API to set isOnboarded = true
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Update the session to reflect the new isOnboarded status
      await update();

      // Trigger final celebration
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#22c55e', '#9333ea', '#ec4899'],
      });

      onComplete?.();

      // Navigate to discover
      setTimeout(() => {
        router.push('/discover');
      }, 1000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
    }
  }, [router, update, onComplete]);

  return (
    <div className="flex flex-col min-h-full items-center justify-center px-6 text-center">
      {/* Animated Icons */}
      <div className="relative mb-8">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 bg-purple-400/30 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ width: 200, height: 200, left: -60, top: -60 }}
        />

        {/* Main heart icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
            <Heart className="w-14 h-14 text-white fill-white" />
          </div>
        </motion.div>

        {/* Floating sparkles */}
        <motion.div
          className="absolute -top-4 -right-4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 -left-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Sparkles className="w-6 h-6 text-purple-400" />
        </motion.div>

        {/* Success checkmark */}
        <motion.div
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
        >
          <CheckCircle2 className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-slate-900 mb-3"
      >
        Profiel compleet!
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-slate-600 mb-2"
      >
        Je bent klaar om te ontdekken
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-6 my-8"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">100%</div>
          <div className="text-sm text-slate-500">Profiel</div>
        </div>
        <div className="w-px h-10 bg-slate-200" />
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">Geverifieerd</div>
          <div className="text-sm text-slate-500">Status</div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={handleGoToApp}
        disabled={isSubmitting}
        className="w-full max-w-sm py-5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-3 text-lg shadow-lg shadow-purple-500/25 touch-manipulation"
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Even geduld...
          </>
        ) : (
          <>
            Start met ontdekken
            <ArrowRight className="w-6 h-6" />
          </>
        )}
      </motion.button>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 bg-purple-50 rounded-2xl max-w-sm"
      >
        <p className="text-sm text-purple-800">
          <span className="font-semibold">Tip:</span> Swipe naar rechts als je iemand leuk vindt, naar links om door te gaan.
        </p>
      </motion.div>
    </div>
  );
}
