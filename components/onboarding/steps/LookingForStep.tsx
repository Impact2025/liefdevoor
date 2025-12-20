'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useOnboardingStore, UserData } from '@/store/useOnboardingStore';

type LookingForOption = {
  value: Exclude<UserData['lookingFor'], ''>;
  label: string;
  description: string;
};

const lookingForOptions: LookingForOption[] = [
  {
    value: 'MALE',
    label: 'Mannen',
    description: 'Ik zoek naar mannen',
  },
  {
    value: 'FEMALE',
    label: 'Vrouwen',
    description: 'Ik zoek naar vrouwen',
  },
  {
    value: 'BOTH',
    label: 'Iedereen',
    description: 'Ik sta open voor iedereen',
  },
];

export default function LookingForStep() {
  const { userData, updateUserData, nextStep, saveStepToServer } = useOnboardingStore();
  const [selected, setSelected] = useState<UserData['lookingFor']>(userData.lookingFor);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (lookingFor: Exclude<UserData['lookingFor'], ''>) => {
    setSelected(lookingFor);

    setIsSaving(true);
    try {
      const success = await saveStepToServer(7, { lookingFor });
      if (success) {
        updateUserData({ lookingFor });
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
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-50 flex items-center justify-center">
          <Heart className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Wie zoek je?
        </h2>
        <p className="text-slate-600 mt-2">
          Je kunt dit later altijd aanpassen
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {lookingForOptions.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(option.value)}
            disabled={isSaving}
            className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 text-left disabled:opacity-70 ${
              selected === option.value
                ? 'border-rose-500 bg-stone-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{option.label}</h3>
              <p className="text-sm text-slate-500">{option.description}</p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected === option.value
                  ? 'border-rose-500 bg-stone-500'
                  : 'border-slate-300'
              }`}
            >
              {selected === option.value && (
                isSaving ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
