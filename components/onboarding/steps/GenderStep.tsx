'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY';

interface GenderStepProps {
  onComplete: (gender: Gender) => void;
  initialGender?: Gender;
}

type GenderOption = {
  value: Gender;
  label: string;
  description: string;
};

const genderOptions: GenderOption[] = [
  {
    value: 'MALE',
    label: 'Man',
    description: 'Ik identificeer me als man',
  },
  {
    value: 'FEMALE',
    label: 'Vrouw',
    description: 'Ik identificeer me als vrouw',
  },
  {
    value: 'NON_BINARY',
    label: 'Non-binair',
    description: 'Ik identificeer me als non-binair',
  },
];

export default function GenderStep({ onComplete, initialGender }: GenderStepProps) {
  const [selected, setSelected] = useState<Gender | undefined>(initialGender);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (gender: Gender) => {
    setSelected(gender);
    setIsSaving(true);
    try {
      onComplete(gender);
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
          <User className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Ik ben een...
        </h2>
        <p className="text-slate-600 mt-2">
          Kies hoe je jezelf identificeert
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {genderOptions.map((option, index) => (
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
                  ? 'border-rose-500 bg-rose-500'
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
