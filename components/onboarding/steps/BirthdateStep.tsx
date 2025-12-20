'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function BirthdateStep() {
  const { userData, updateUserData, nextStep, saveStepToServer } = useOnboardingStore();

  const existingDate = userData.birthDate ? new Date(userData.birthDate) : null;
  const [day, setDay] = useState(existingDate ? String(existingDate.getDate()) : '');
  const [month, setMonth] = useState(existingDate ? String(existingDate.getMonth() + 1) : '');
  const [year, setYear] = useState(existingDate ? String(existingDate.getFullYear()) : '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleContinue = async () => {
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (!day || !month || !year) {
      setError('Vul je volledige geboortedatum in');
      return;
    }

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      setError('Vul geldige nummers in');
      return;
    }

    if (dayNum < 1 || dayNum > 31) {
      setError('Dag moet tussen 1 en 31 zijn');
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      setError('Maand moet tussen 1 en 12 zijn');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (yearNum < 1920 || yearNum > currentYear) {
      setError('Vul een geldig jaar in');
      return;
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);

    if (birthDate.getDate() !== dayNum) {
      setError('Deze datum bestaat niet');
      return;
    }

    const age = calculateAge(birthDate);

    if (age < 18) {
      setError('Je moet minimaal 18 jaar oud zijn');
      return;
    }

    if (age > 120) {
      setError('Vul een geldige geboortedatum in');
      return;
    }

    const dateString = birthDate.toISOString().split('T')[0];

    setIsSaving(true);
    try {
      const success = await saveStepToServer(5, { birthDate: dateString });
      if (success) {
        updateUserData({ birthDate: dateString });
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
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Wanneer ben je geboren?
        </h2>
        <p className="text-slate-600 mt-2">
          We tonen alleen je leeftijd, niet je geboortedatum
        </p>
      </div>

      {/* Date Inputs */}
      <div className="space-y-4">
        <div className="flex gap-3">
          {/* Day */}
          <div className="flex-1">
            <label className="block text-slate-500 text-sm mb-2 text-center">Dag</label>
            <input
              type="text"
              inputMode="numeric"
              value={day}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setDay(val);
                setError('');
              }}
              placeholder="01"
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-xl font-medium placeholder-slate-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all text-center"
              maxLength={2}
            />
          </div>

          {/* Month */}
          <div className="flex-1">
            <label className="block text-slate-500 text-sm mb-2 text-center">Maand</label>
            <input
              type="text"
              inputMode="numeric"
              value={month}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setMonth(val);
                setError('');
              }}
              placeholder="06"
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-xl font-medium placeholder-slate-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all text-center"
              maxLength={2}
            />
          </div>

          {/* Year */}
          <div className="flex-[1.5]">
            <label className="block text-slate-500 text-sm mb-2 text-center">Jaar</label>
            <input
              type="text"
              inputMode="numeric"
              value={year}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setYear(val);
                setError('');
              }}
              placeholder="1990"
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-xl font-medium placeholder-slate-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all text-center"
              maxLength={4}
            />
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.p>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600 text-center">
          Je moet minimaal 18 jaar oud zijn om een account te maken
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!day || !month || !year || year.length < 4 || isSaving}
        className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : (
          <>
            Verder
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </motion.div>
  );
}
