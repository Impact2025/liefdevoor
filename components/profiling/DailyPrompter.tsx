'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface DailyPrompt {
  id: string;
  question: string;
  questionNl: string;
  emoji: string | null;
  options: Array<{
    value: string;
    label: string;
    emoji: string;
  }>;
  vectorTag: string;
  category: string;
}

interface DailyPrompterProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function DailyPrompter({ onComplete, onSkip }: DailyPrompterProps) {
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [startTime] = useState(Date.now());

  // Motion values for swipe effect
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const leftOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1]);

  // Fetch today's prompt
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch('/api/profiling/daily-prompt');
        const data = await response.json();

        if (data.hasAnsweredToday) {
          setHasAnsweredToday(true);
          onComplete();
        } else if (data.prompt) {
          setPrompt(data.prompt);
        } else {
          // No more prompts available
          onComplete();
        }
      } catch (error) {
        console.error('Error fetching daily prompt:', error);
        onComplete(); // Don't block on errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [onComplete]);

  const handleAnswer = useCallback(async (optionIndex: 0 | 1) => {
    if (!prompt || isAnswering) return;

    setIsAnswering(true);
    const option = prompt.options[optionIndex];
    const responseTimeMs = Date.now() - startTime;

    try {
      await fetch('/api/profiling/daily-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: prompt.id,
          answer: option.value,
          answerLabel: option.label,
          responseTimeMs,
        }),
      });

      // Success animation before completing
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete();
    } catch (error) {
      console.error('Error saving answer:', error);
      setIsAnswering(false);
    }
  }, [prompt, isAnswering, startTime, onComplete]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleAnswer(1); // Right = option B
    } else if (info.offset.x < -threshold) {
      handleAnswer(0); // Left = option A
    }
  }, [handleAnswer]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Sparkles className="w-12 h-12 text-purple-500" />
          </motion.div>
          <p className="text-slate-600">Even geduld...</p>
        </motion.div>
      </div>
    );
  }

  // Already answered or no prompts
  if (hasAnsweredToday || !prompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-1">
              Dagelijkse vraag
            </h2>
            <p className="text-white/70 text-sm">
              Beantwoord om betere matches te krijgen
            </p>
          </div>

          {/* Swipeable Card */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.98 }}
          >
            {/* Swipe indicators */}
            <motion.div
              className="absolute top-4 left-4 px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-sm flex items-center gap-1 z-10"
              style={{ opacity: leftOpacity }}
            >
              <ArrowLeft className="w-4 h-4" />
              {prompt.options[0]?.emoji}
            </motion.div>
            <motion.div
              className="absolute top-4 right-4 px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-sm flex items-center gap-1 z-10"
              style={{ opacity: rightOpacity }}
            >
              {prompt.options[1]?.emoji}
              <ArrowRight className="w-4 h-4" />
            </motion.div>

            {/* Question */}
            <div className="p-6 pt-10">
              <div className="text-center mb-6">
                <span className="text-4xl mb-3 block">{prompt.emoji}</span>
                <h3 className="text-xl font-bold text-slate-900">
                  {prompt.questionNl || prompt.question}
                </h3>
              </div>

              {/* Options as buttons */}
              <div className="space-y-3">
                {prompt.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(index as 0 | 1)}
                    disabled={isAnswering}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                      isAnswering
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-purple-400 hover:bg-purple-50 active:scale-95'
                    } border-slate-200 bg-white`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-lg font-semibold text-slate-800">
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-6 pb-6 pt-2 text-center">
              <p className="text-xs text-slate-400">
                Swipe of tap om te kiezen
              </p>
            </div>
          </motion.div>

          {/* Skip button */}
          {onSkip && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onSkip}
              className="mt-4 w-full py-2 text-white/60 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Later beantwoorden
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
