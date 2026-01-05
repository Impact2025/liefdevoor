'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Wand2, ArrowRight, Sparkles } from 'lucide-react';
import BioStep from './BioStep';
import ProfileGeneratorStep from './ProfileGeneratorStep';

interface BioWithAIOptionProps {
  onComplete: (bio: string) => void;
  onSkip?: () => void;
  initialBio?: string;
  userData?: {
    name?: string;
    gender?: string;
    lookingFor?: string;
    relationshipGoal?: string;
    interests?: string[];
    lifestyle?: {
      smoking?: string;
      drinking?: string;
      children?: string;
    };
    loveLanguages?: Record<string, number>;
  };
}

export default function BioWithAIOption({
  onComplete,
  onSkip,
  initialBio = '',
  userData = {}
}: BioWithAIOptionProps) {
  const [choice, setChoice] = useState<'manual' | 'ai' | null>(null);

  // Als gebruiker al een bio heeft, ga direct naar manual mode
  if (initialBio && !choice) {
    setChoice('manual');
  }

  // Choice screen
  if (!choice) {
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
            Kies hoe je je profiel wilt invullen
          </p>
        </div>

        {/* Option 1: Write yourself (RECOMMENDED) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setChoice('manual')}
          className="w-full p-6 bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 rounded-2xl text-left transition-all hover:border-rose-300 hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
              <PenLine className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900">Zelf schrijven</h3>
                <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                  Aanbevolen
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schrijf je eigen unieke bio. Authentieke profielteksten krijgen 3x meer matches!
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
          </div>
        </motion.button>

        {/* Option 2: AI Generator (Alternative) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setChoice('ai')}
          className="w-full p-6 bg-white border-2 border-slate-200 rounded-2xl text-left transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">AI Generator gebruiken</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Laat AI een profiel schrijven op basis van jouw voorkeuren. Je kunt het daarna altijd aanpassen.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
          </div>
        </motion.button>

        {/* Tips */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">Tips voor een goede bio:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Wees eerlijk en authentiek</li>
                <li>Gebruik humor (als dat bij je past)</li>
                <li>Eindig met een vraag om gesprek te starten</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors text-sm"
          >
            Overslaan
          </button>
        )}
      </motion.div>
    );
  }

  // Show selected component
  return (
    <AnimatePresence mode="wait">
      {choice === 'manual' && (
        <motion.div
          key="manual"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <BioStep
            onComplete={onComplete}
            onSkip={() => setChoice('ai')}
            initialBio={initialBio}
          />
        </motion.div>
      )}
      {choice === 'ai' && (
        <motion.div
          key="ai"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <ProfileGeneratorStep
            onComplete={onComplete}
            onSkip={() => setChoice('manual')}
            userData={userData}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
