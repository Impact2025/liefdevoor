'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, MessageCircle, Sparkles, Zap, Crown } from 'lucide-react';
import { useOnboardingStore, OnboardingMode } from '@/store/useOnboardingStore';

const MODES = [
  {
    id: 'SIMPLE' as OnboardingMode,
    name: 'Snel',
    description: 'Alleen het belangrijkste',
    icon: Zap,
    steps: '~5 minuten',
    color: 'blue',
  },
  {
    id: 'STANDARD' as OnboardingMode,
    name: 'Standaard',
    description: 'Aanbevolen voor de beste matches',
    icon: Heart,
    steps: '~8 minuten',
    color: 'pink',
    recommended: true,
  },
  {
    id: 'ADVANCED' as OnboardingMode,
    name: 'Uitgebreid',
    description: 'Alle opties + verificatie',
    icon: Crown,
    steps: '~12 minuten',
    color: 'purple',
  },
];

export default function WelcomeStep() {
  const { nextStep, setMode, saveStepToServer } = useOnboardingStore();
  const [selectedMode, setSelectedMode] = useState<OnboardingMode | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStart = async () => {
    if (!selectedMode) return;

    setIsSaving(true);
    try {
      const success = await saveStepToServer(1, { onboardingMode: selectedMode });
      if (success) {
        setMode(selectedMode);
        nextStep();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Hero Section */}
      <div className="text-center">
        <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Welkom
        </h1>
        <p className="text-slate-600 text-lg">
          Laten we samen jouw profiel maken
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
          <Sparkles className="w-5 h-5 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-slate-600">AI hulp</p>
        </div>
        <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
          <Shield className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-slate-600">Veilig</p>
        </div>
        <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
          <MessageCircle className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <p className="text-xs text-slate-600">Echt contact</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700 text-center">
          Kies hoe je wilt beginnen:
        </p>

        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const colorMap = {
            blue: 'bg-blue-50 border-blue-500 text-blue-500',
            pink: 'bg-stone-50 border-rose-500 text-rose-500',
            purple: 'bg-purple-50 border-purple-500 text-purple-500',
          };

          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                isSelected
                  ? colorMap[mode.color as keyof typeof colorMap]
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected
                    ? mode.color === 'pink'
                      ? 'bg-rose-500'
                      : mode.color === 'blue'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                    : 'bg-slate-100'
                }`}
              >
                <mode.icon
                  className={`w-6 h-6 ${
                    isSelected ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{mode.name}</h3>
                  {mode.recommended && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-medium rounded-full">
                      Aanbevolen
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{mode.description}</p>
                <p className="text-xs text-slate-400 mt-1">{mode.steps}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? mode.color === 'pink'
                      ? 'border-rose-500 bg-rose-500'
                      : mode.color === 'blue'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-purple-500 bg-purple-500'
                    : 'border-slate-300'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleStart}
        disabled={!selectedMode || isSaving}
        className="w-full py-4 px-6 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : !selectedMode ? (
          'Kies een optie'
        ) : (
          'Laten we beginnen'
        )}
      </button>
    </motion.div>
  );
}
