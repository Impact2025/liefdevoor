'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface VibeCardProps {
  onComplete: (answers: VibeAnswers) => void;
}

export interface VibeAnswers {
  introvertScale: number;
  spontaneityScale: number;
  emotionalScale: number;
  adventureScale: number;
  conflictStyle: string;
  communicationStyle: string;
}

interface Question {
  id: keyof VibeAnswers | 'conflict' | 'communication';
  optionA: { label: string; emoji: string; value: number | string };
  optionB: { label: string; emoji: string; value: number | string };
}

const questions: Question[] = [
  {
    id: 'introvertScale',
    optionA: { label: 'Thuisavond met Netflix', emoji: '🏠', value: 3 },
    optionB: { label: 'Uitgaan met vrienden', emoji: '🎉', value: 8 },
  },
  {
    id: 'spontaneityScale',
    optionA: { label: 'Alles plannen', emoji: '📋', value: 3 },
    optionB: { label: 'Spontaan beslissen', emoji: '🎲', value: 8 },
  },
  {
    id: 'emotionalScale',
    optionA: { label: 'Met mijn hoofd', emoji: '🧠', value: 3 },
    optionB: { label: 'Met mijn hart', emoji: '❤️', value: 8 },
  },
  {
    id: 'adventureScale',
    optionA: { label: 'Vaste routine', emoji: '🔄', value: 3 },
    optionB: { label: 'Nieuwe avonturen', emoji: '🌍', value: 8 },
  },
  {
    id: 'conflict',
    optionA: { label: 'Uitpraten tot het klaar is', emoji: '💬', value: 'COLLABORATING' },
    optionB: { label: 'Even afkoelen eerst', emoji: '🧘', value: 'AVOIDING' },
  },
  {
    id: 'communication',
    optionA: { label: 'Direct zeggen wat ik denk', emoji: '🎯', value: 'direct' },
    optionB: { label: 'Diplomatiek brengen', emoji: '🕊️', value: 'diplomatic' },
  },
];

export default function VibeCard({ onComplete }: VibeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<VibeAnswers>>({});
  const [isComplete, setIsComplete] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const leftOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleAnswer = useCallback((option: 'A' | 'B') => {
    const question = questions[currentIndex];
    const value = option === 'A' ? question.optionA.value : question.optionB.value;

    const newAnswers = { ...answers };

    if (question.id === 'conflict') {
      newAnswers.conflictStyle = value as string;
    } else if (question.id === 'communication') {
      newAnswers.communicationStyle = value as string;
    } else {
      newAnswers[question.id as keyof Omit<VibeAnswers, 'conflictStyle' | 'communicationStyle'>] = value as number;
    }

    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Complete with default values for any missing fields
      const finalAnswers: VibeAnswers = {
        introvertScale: newAnswers.introvertScale ?? 5,
        spontaneityScale: newAnswers.spontaneityScale ?? 5,
        emotionalScale: newAnswers.emotionalScale ?? 5,
        adventureScale: newAnswers.adventureScale ?? 5,
        conflictStyle: newAnswers.conflictStyle ?? 'COMPROMISING',
        communicationStyle: newAnswers.communicationStyle ?? 'diplomatic',
      };
      setIsComplete(true);
      setTimeout(() => {
        onComplete(finalAnswers);
      }, 1500);
    }
  }, [currentIndex, answers, onComplete]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleAnswer('B');
    } else if (info.offset.x < -threshold) {
      handleAnswer('A');
    }
  }, [handleAnswer]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Vibe check compleet!
        </h2>
        <p className="text-slate-600">
          We kennen je nu beter...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col min-h-full px-4">
      {/* Header */}
      <div className="text-center pt-4 pb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <Sparkles className="w-8 h-8 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          This or That?
        </h2>
        <p className="text-slate-500 text-sm">
          Swipe of tap om te kiezen
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="relative w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Swipe Card */}
            <motion.div
              className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 cursor-grab active:cursor-grabbing touch-manipulation"
              style={{ x, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 0.98 }}
            >
              {/* Left Swipe Indicator */}
              <motion.div
                className="absolute top-4 left-4 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl flex items-center gap-2"
                style={{ opacity: leftOpacity }}
              >
                <ArrowLeft className="w-5 h-5" />
                {currentQuestion.optionA.emoji}
              </motion.div>

              {/* Right Swipe Indicator */}
              <motion.div
                className="absolute top-4 right-4 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl flex items-center gap-2"
                style={{ opacity: rightOpacity }}
              >
                {currentQuestion.optionB.emoji}
                <ArrowRight className="w-5 h-5" />
              </motion.div>

              {/* Options */}
              <div className="flex flex-col gap-4 py-8">
                {/* Option A */}
                <motion.button
                  onClick={() => handleAnswer('A')}
                  className="w-full p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl border-2 border-purple-200 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-4xl mb-2 block">{currentQuestion.optionA.emoji}</span>
                  <span className="text-lg font-semibold text-slate-900 block">
                    {currentQuestion.optionA.label}
                  </span>
                </motion.button>

                {/* VS Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-slate-400 font-bold text-sm">OF</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Option B */}
                <motion.button
                  onClick={() => handleAnswer('B')}
                  className="w-full p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl border-2 border-purple-200 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-4xl mb-2 block">{currentQuestion.optionB.emoji}</span>
                  <span className="text-lg font-semibold text-slate-900 block">
                    {currentQuestion.optionB.label}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center py-6"
      >
        <div className="flex items-center justify-center gap-6 text-slate-400 text-sm">
          <span className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Swipe links
          </span>
          <span className="flex items-center gap-1">
            Swipe rechts
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
