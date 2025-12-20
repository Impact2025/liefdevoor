'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function NameStep() {
  const { userData, updateUserData, nextStep } = useOnboardingStore();
  const [name, setName] = useState(userData.name);
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError('Vul je voornaam in (minimaal 2 letters)');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Je naam is te lang (maximaal 20 letters)');
      return;
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
      setError('Gebruik alleen letters');
      return;
    }

    updateUserData({ name: trimmedName });
    nextStep();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-8 max-w-lg mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
          <User className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Hoe mogen we je noemen?
        </h1>
        <p className="text-slate-500">
          Dit is hoe anderen je zullen zien
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1"
      >
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Je voornaam"
            autoFocus
            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xl font-medium placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-center"
            maxLength={20}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-3 text-center"
          >
            {error}
          </motion.p>
        )}

        <p className="text-slate-400 text-sm mt-4 text-center">
          Je kunt dit later niet meer aanpassen
        </p>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-auto"
      >
        <button
          onClick={handleContinue}
          disabled={name.trim().length < 2}
          className="w-full py-4 px-6 bg-stone-500 hover:bg-rose-600 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-500 flex items-center justify-center gap-2"
        >
          Doorgaan
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
