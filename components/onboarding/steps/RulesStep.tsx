'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Ban, AlertTriangle, Check } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const RULES = [
  {
    icon: Heart,
    title: 'Wees respectvol',
    description: 'Behandel anderen zoals je zelf behandeld wilt worden.',
  },
  {
    icon: Shield,
    title: 'Wees eerlijk',
    description: 'Gebruik recente foto\'s en geef eerlijke informatie over jezelf.',
  },
  {
    icon: Ban,
    title: 'Geen ongepast gedrag',
    description: 'Beledigende, seksueel expliciete of haatdragende content is niet toegestaan.',
  },
  {
    icon: AlertTriangle,
    title: 'Meld verdacht gedrag',
    description: 'Zie je iets verdachts? Meld het zodat we de community veilig houden.',
  },
];

export default function RulesStep() {
  const { nextStep, updateUserData, saveStepToServer } = useOnboardingStore();
  const [accepted, setAccepted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!accepted) return;

    setIsSaving(true);
    try {
      const success = await saveStepToServer(3, { rulesAccepted: true });
      if (success) {
        updateUserData({ rulesAccepted: true });
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
        <h2 className="text-2xl font-bold text-slate-900">
          Onze spelregels
        </h2>
        <p className="text-slate-600 mt-2">
          Om een fijne community te houden, vragen we je om deze regels te volgen.
        </p>
      </div>

      <div className="space-y-4">
        {RULES.map((rule, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
              <rule.icon className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{rule.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{rule.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
              accepted
                ? 'bg-pink-500 border-pink-500'
                : 'bg-white border-slate-300'
            }`}
          >
            {accepted && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        <span className="text-sm text-slate-700">
          Ik ga akkoord met de spelregels en beloof me respectvol te gedragen tegenover andere gebruikers.
        </span>
      </label>

      <button
        onClick={handleContinue}
        disabled={!accepted || isSaving}
        className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : (
          'Ik ga akkoord'
        )}
      </button>
    </motion.div>
  );
}
