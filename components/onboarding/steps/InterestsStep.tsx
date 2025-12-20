'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const INTEREST_CATEGORIES = [
  {
    category: 'Sport & Beweging',
    interests: ['Fitness', 'Wandelen', 'Fietsen', 'Hardlopen', 'Yoga', 'Zwemmen', 'Voetbal', 'Tennis'],
  },
  {
    category: 'Entertainment',
    interests: ['Films', 'Series', 'Muziek', 'Gaming', 'Lezen', 'Theater', 'Concerten', 'Podcasts'],
  },
  {
    category: 'Eten & Drinken',
    interests: ['Koken', 'Wijn', 'Uit eten', 'Bakken', 'Koffie', 'Vegetarisch', 'Borrelen'],
  },
  {
    category: 'Ontspanning',
    interests: ['Reizen', 'Natuur', 'Fotografie', 'Tuinieren', 'Kunst', 'DIY', 'Mediteren'],
  },
  {
    category: 'Sociaal',
    interests: ['Uitgaan', 'Festivals', 'Vrienden', 'Familie', 'Dieren', 'Vrijwilligerswerk'],
  },
];

export default function InterestsStep() {
  const { userData, updateUserData, nextStep, saveStepToServer } = useOnboardingStore();

  // Parse existing interests from comma-separated string
  const initialInterests = userData.interests
    ? userData.interests.split(',').map((i) => i.trim()).filter(Boolean)
    : [];

  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);
  const [isSaving, setIsSaving] = useState(false);

  const MAX_INTERESTS = 5;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= MAX_INTERESTS) {
        return prev;
      }
      return [...prev, interest];
    });
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const interestsString = selectedInterests.join(', ');
      const success = await saveStepToServer(11, { interests: interestsString });
      if (success) {
        updateUserData({ interests: interestsString });
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
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Wat vind je leuk?
        </h2>
        <p className="text-slate-600 mt-2">
          Kies tot {MAX_INTERESTS} interesses om matches te vinden
        </p>
      </div>

      {/* Selected count */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: MAX_INTERESTS }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx < selectedInterests.length ? 'bg-rose-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-slate-500">
          {selectedInterests.length} / {MAX_INTERESTS} gekozen
        </span>
      </div>

      {/* Interest categories */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {INTEREST_CATEGORIES.map((category, catIdx) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
          >
            <h3 className="text-sm font-medium text-slate-500 mb-3">
              {category.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.interests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                const isDisabled = !isSelected && selectedInterests.length >= MAX_INTERESTS;

                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-500 text-white'
                        : isDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-rose-500 hover:text-rose-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={selectedInterests.length === 0 || isSaving}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : selectedInterests.length === 0 ? (
          'Kies minimaal 1 interesse'
        ) : (
          'Verder'
        )}
      </button>
    </motion.div>
  );
}
