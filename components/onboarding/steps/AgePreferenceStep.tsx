'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function AgePreferenceStep() {
  const { userData, updateUserData, nextStep, saveStepToServer } = useOnboardingStore();
  const [minAge, setMinAge] = useState(userData.minAgePreference || 18);
  const [maxAge, setMaxAge] = useState(userData.maxAgePreference || 99);
  const [isSaving, setIsSaving] = useState(false);

  const handleMinChange = useCallback((value: number) => {
    const newMin = Math.min(value, maxAge - 1);
    setMinAge(newMin);
    updateUserData({ minAgePreference: newMin });
  }, [maxAge, updateUserData]);

  const handleMaxChange = useCallback((value: number) => {
    const newMax = Math.max(value, minAge + 1);
    setMaxAge(newMax);
    updateUserData({ maxAgePreference: newMax });
  }, [minAge, updateUserData]);

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const success = await saveStepToServer(8, {
        minAgePreference: minAge,
        maxAgePreference: maxAge,
      });
      if (success) {
        nextStep();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate the position for the range highlight
  const minPercent = ((minAge - 18) / (99 - 18)) * 100;
  const maxPercent = ((maxAge - 18) / (99 - 18)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-50 flex items-center justify-center">
          <Users className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welke leeftijd?
        </h2>
        <p className="text-slate-600 mt-2">
          Stel je voorkeur in voor de leeftijd van matches
        </p>
      </div>

      {/* Age Display */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-rose-500">{minAge}</span>
          <span className="text-2xl text-slate-400 mx-3">-</span>
          <span className="text-4xl font-bold text-rose-500">
            {maxAge === 99 ? '99+' : maxAge}
          </span>
          <p className="text-sm text-slate-500 mt-2">jaar oud</p>
        </div>

        {/* Dual Range Slider */}
        <div className="relative h-2 mb-8">
          {/* Track background */}
          <div className="absolute inset-0 bg-slate-200 rounded-full" />

          {/* Selected range highlight */}
          <div
            className="absolute h-full bg-stone-500 rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          {/* Min slider */}
          <input
            type="range"
            min={18}
            max={99}
            value={minAge}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          />

          {/* Max slider */}
          <input
            type="range"
            min={18}
            max={99}
            value={maxAge}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: '18-25', min: 18, max: 25 },
            { label: '25-35', min: 25, max: 35 },
            { label: '35-45', min: 35, max: 45 },
            { label: '45-55', min: 45, max: 55 },
            { label: '55+', min: 55, max: 99 },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                setMinAge(range.min);
                setMaxAge(range.max);
                updateUserData({
                  minAgePreference: range.min,
                  maxAgePreference: range.max,
                });
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                minAge === range.min && maxAge === range.max
                  ? 'bg-stone-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600 text-center">
          Je kunt dit later altijd nog aanpassen in je instellingen.
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={isSaving}
        className="w-full py-4 bg-stone-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : (
          'Verder'
        )}
      </button>
    </motion.div>
  );
}
