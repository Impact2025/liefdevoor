'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, Coffee } from 'lucide-react';

interface RelationshipGoalStepProps {
  onComplete: (goal: string) => void;
  onSkip?: () => void;
}

type RelationshipGoal = 'serious' | 'casual' | 'marriage' | 'open';

interface GoalOption {
  value: RelationshipGoal;
  label: string;
  description: string;
  emoji: string;
  icon: typeof Heart;
  color: string;
}

const goalOptions: GoalOption[] = [
  {
    value: 'serious',
    label: 'Serieuze relatie',
    description: 'Op zoek naar een langdurige partner',
    emoji: '💕',
    icon: Heart,
    color: 'rose',
  },
  {
    value: 'marriage',
    label: 'Trouwen & gezin',
    description: 'Klaar voor de volgende stap',
    emoji: '💍',
    icon: Sparkles,
    color: 'teal',
  },
  {
    value: 'casual',
    label: 'Casual daten',
    description: 'Lekker kennismaken, kijken wat het wordt',
    emoji: '☕',
    icon: Coffee,
    color: 'amber',
  },
  {
    value: 'open',
    label: 'Open voor alles',
    description: 'Laat het op me afkomen',
    emoji: '🌟',
    icon: Users,
    color: 'blue',
  },
];

const colorClasses = {
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-500',
    text: 'text-rose-600',
    icon: 'text-rose-500',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-500',
    text: 'text-teal-600',
    icon: 'text-teal-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-600',
    icon: 'text-amber-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    icon: 'text-blue-500',
  },
};

export default function RelationshipGoalStep({ onComplete, onSkip }: RelationshipGoalStepProps) {
  const [selected, setSelected] = useState<RelationshipGoal | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (goal: RelationshipGoal) => {
    setSelected(goal);
    setIsSaving(true);

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    onComplete(goal);
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-full px-4"
    >
      {/* Header */}
      <div className="text-center pt-4 pb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center"
        >
          <Heart className="w-8 h-8 text-rose-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">
          Wat zoek je?
        </h2>
        <p className="text-slate-600 mt-2">
          Dit helpt ons om betere matches te vinden
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-3 pb-4">
        {goalOptions.map((option, index) => {
          const colors = colorClasses[option.color as keyof typeof colorClasses];
          const isSelected = selected === option.value;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(option.value)}
              disabled={isSaving}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left disabled:opacity-70 ${
                isSelected
                  ? `${colors.border} ${colors.bg}`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? colors.bg : 'bg-slate-100'}`}>
                <span className="text-2xl">{option.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isSelected ? colors.text : 'text-slate-900'}`}>
                  {option.label}
                </h3>
                <p className="text-sm text-slate-500">{option.description}</p>
              </div>

              {/* Indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? `${colors.border} ${colors.bg}`
                    : 'border-slate-300'
                }`}
              >
                {isSelected && (
                  isSaving ? (
                    <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-3 h-3 rounded-full ${colors.text.replace('text-', 'bg-')}`}
                    />
                  )
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Skip option */}
      {onSkip && (
        <div className="text-center pb-6">
          <button
            onClick={onSkip}
            disabled={isSaving}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            Later beslissen
          </button>
        </div>
      )}
    </motion.div>
  );
}
