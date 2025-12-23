'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Zap } from 'lucide-react';

interface BonusQuestion {
  id: string;
  question: string;
  emoji: string;
  options: Array<{
    value: string;
    label: string;
    emoji: string;
  }>;
}

interface BonusProfileBoosterProps {
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * BonusProfileBooster
 *
 * Shown when the swipe deck is empty.
 * Instead of "No more matches", we engage users with bonus questions
 * that improve their profile and expand their match pool.
 */
export default function BonusProfileBooster({ onComplete, onSkip }: BonusProfileBoosterProps) {
  const [questions, setQuestions] = useState<BonusQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const REQUIRED_ANSWERS = 3;

  // Fetch bonus questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/profiling/bonus-questions');
        const data = await response.json();

        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          // No questions available, complete immediately
          onComplete();
        }
      } catch (error) {
        console.error('Error fetching bonus questions:', error);
        onComplete();
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [onComplete]);

  const handleAnswer = async (optionValue: string, optionLabel: string) => {
    const question = questions[currentIndex];
    if (!question) return;

    try {
      await fetch('/api/profiling/daily-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: question.id,
          answer: optionValue,
          answerLabel: optionLabel,
        }),
      });

      const newAnsweredCount = answeredCount + 1;
      setAnsweredCount(newAnsweredCount);

      if (newAnsweredCount >= REQUIRED_ANSWERS) {
        // Show success animation
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Ran out of questions before reaching goal
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Sparkles className="w-12 h-12 text-purple-500" />
          </motion.div>
          <p className="text-slate-600">Bonus vragen laden...</p>
        </motion.div>
      </div>
    );
  }

  // Completion state
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Profiel verbeterd!
        </h2>
        <p className="text-slate-600 mb-4">
          We zoeken nieuwe matches voor je...
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2 }}
          className="h-2 bg-purple-500 rounded-full max-w-[200px]"
        />
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Boost je profiel!
        </h2>
        <p className="text-slate-600 text-sm">
          Beantwoord {REQUIRED_ANSWERS} vragen om meer mensen te zien
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: REQUIRED_ANSWERS }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < answeredCount
                ? 'bg-purple-500'
                : i === answeredCount
                ? 'bg-purple-300'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col"
        >
          {/* Question */}
          <div className="text-center mb-6">
            <span className="text-5xl mb-3 block">{currentQuestion.emoji}</span>
            <h3 className="text-lg font-bold text-slate-900">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(option.value, option.label)}
                className="w-full p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-lg font-semibold text-slate-800">
                    {option.label}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip option */}
      {onSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onSkip}
          className="mt-6 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Later beantwoorden
        </motion.button>
      )}
    </div>
  );
}
