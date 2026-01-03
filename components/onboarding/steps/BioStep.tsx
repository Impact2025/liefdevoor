'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, ArrowRight } from 'lucide-react';

const MAX_BIO_LENGTH = 500;
const MIN_BIO_LENGTH = 10;

interface BioStepProps {
  onComplete: (bio: string) => void;
  onSkip?: () => void;
  initialBio?: string;
}

export default function BioStep({ onComplete, onSkip, initialBio = '' }: BioStepProps) {
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      onComplete(bio.trim());
    } finally {
      setIsSaving(false);
    }
  };

  const canContinue = bio.trim().length >= MIN_BIO_LENGTH;
  const charsRemaining = MAX_BIO_LENGTH - bio.length;

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
          <PenLine className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Vertel iets over jezelf
        </h2>
        <p className="text-slate-600 mt-2">
          Dit helpt anderen om je beter te leren kennen
        </p>
      </div>

      {/* Bio Input */}
      <div className="relative">
        <textarea
          value={bio}
          onChange={handleBioChange}
          placeholder="Schrijf hier iets leuks over jezelf..."
          className="w-full min-h-[160px] px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
        />

        {/* Character count */}
        <div
          className={`absolute bottom-3 right-3 text-xs ${
            charsRemaining < 50 ? 'text-orange-500' : 'text-slate-400'
          }`}
        >
          {charsRemaining} karakters over
        </div>
      </div>

      {/* Tip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          Een goede bio eindigt vaak met een vraag - dit nodigt uit tot conversatie.
        </p>
      </div>

      {/* Skip Button */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors text-sm"
        >
          Overslaan - ik gebruik de AI Profile Generator
        </button>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue || isSaving}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : !canContinue ? (
          `Schrijf minimaal ${MIN_BIO_LENGTH} karakters`
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
