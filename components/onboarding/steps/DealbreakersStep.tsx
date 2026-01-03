'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cigarette, Wine, Baby, BadgeCheck, MapPin } from 'lucide-react';

interface DealbreakersStepProps {
  onComplete: (data: DealbreakersData) => void;
  onSkip?: () => void;
}

export interface DealbreakersData {
  mustNotSmoke: boolean;
  mustNotDrink: boolean;
  mustWantChildren: boolean;
  mustBeVerified: boolean;
  maxDistance: number | null;
}

interface DealbreakOption {
  id: keyof Omit<DealbreakersData, 'maxDistance'>;
  label: string;
  description: string;
  icon: typeof Cigarette;
  emoji: string;
}

const dealbreakOptions: DealbreakOption[] = [
  {
    id: 'mustNotSmoke',
    label: 'Niet roken',
    description: 'Geen regelmatige rokers',
    icon: Cigarette,
    emoji: '🚭',
  },
  {
    id: 'mustNotDrink',
    label: 'Niet drinken',
    description: 'Geen regelmatige drinkers',
    icon: Wine,
    emoji: '🚫',
  },
  {
    id: 'mustWantChildren',
    label: 'Wil kinderen',
    description: 'Moet (ooit) kinderen willen',
    icon: Baby,
    emoji: '👶',
  },
  {
    id: 'mustBeVerified',
    label: 'Geverifieerd',
    description: 'Alleen geverifieerde profielen',
    icon: BadgeCheck,
    emoji: '✓',
  },
];

const distanceOptions = [
  { value: null, label: 'Geen limiet' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 200, label: '200 km' },
];

export default function DealbreakersStep({ onComplete, onSkip }: DealbreakersStepProps) {
  const [dealbreakers, setDealbreakers] = useState<Omit<DealbreakersData, 'maxDistance'>>({
    mustNotSmoke: false,
    mustNotDrink: false,
    mustWantChildren: false,
    mustBeVerified: false,
  });
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDealbreaker = (id: keyof Omit<DealbreakersData, 'maxDistance'>) => {
    setDealbreakers(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const activeCount = Object.values(dealbreakers).filter(Boolean).length + (maxDistance !== null ? 1 : 0);

  const handleContinue = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    onComplete({
      ...dealbreakers,
      maxDistance,
    });

    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-full px-4"
    >
      {/* Header */}
      <div className="text-center pt-4 pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center"
        >
          <ShieldCheck className="w-7 h-7 text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">Jouw dealbreakers</h2>
        <p className="text-slate-600 mt-1 text-sm">
          Wat is voor jou absoluut een no-go?
        </p>
        {activeCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-rose-500 mt-2 font-medium"
          >
            {activeCount} filter{activeCount !== 1 ? 's' : ''} actief - Je ziet minder profielen
          </motion.p>
        )}
      </div>

      {/* Dealbreaker toggles */}
      <div className="flex-1 space-y-3 pb-4">
        {dealbreakOptions.map((option, index) => {
          const isActive = dealbreakers[option.id];
          const Icon = option.icon;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleDealbreaker(option.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                isActive
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isActive ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                <span className="text-2xl">{option.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isActive ? 'text-red-600' : 'text-slate-900'}`}>
                  {option.label}
                </h3>
                <p className="text-sm text-slate-500">{option.description}</p>
              </div>

              {/* Toggle */}
              <div className={`w-12 h-7 rounded-full transition-colors relative ${
                isActive ? 'bg-red-500' : 'bg-slate-300'
              }`}>
                <motion.div
                  animate={{ x: isActive ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                />
              </div>
            </motion.button>
          );
        })}

        {/* Distance selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-teal-600" />
            <span className="font-medium text-slate-700">Maximum afstand</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {distanceOptions.map((option) => (
              <button
                key={option.value ?? 'none'}
                onClick={() => setMaxDistance(option.value)}
                className={`py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                  maxDistance === option.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4"
        >
          <p className="text-xs text-amber-800">
            <span className="font-semibold">💡 Tip:</span> Hoe minder dealbreakers, hoe meer matches.
            Je kunt dit later altijd aanpassen in je instellingen.
          </p>
        </motion.div>
      </div>

      {/* Continue button */}
      <div className="pb-6 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleContinue}
          disabled={isSaving}
          className="w-full py-4 rounded-2xl font-semibold text-lg transition-all bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98] disabled:opacity-70"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opslaan...
            </span>
          ) : activeCount === 0 ? (
            'Geen dealbreakers, doorgaan'
          ) : (
            `Doorgaan met ${activeCount} filter${activeCount !== 1 ? 's' : ''}`
          )}
        </motion.button>

        {onSkip && (
          <button
            onClick={onSkip}
            disabled={isSaving}
            className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            Later instellen
          </button>
        )}
      </div>
    </motion.div>
  );
}
