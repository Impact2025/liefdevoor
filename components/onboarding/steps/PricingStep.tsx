'use client';

import { motion } from 'framer-motion';
import { Check, Heart, Crown, Sparkles } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    description: 'Probeer de app uit',
    features: [
      '25 swipes per dag',
      '1 super like per dag',
      'Basis matching',
      'Beperkte chat functies',
    ],
    icon: Heart,
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    description: 'Meest gekozen',
    features: [
      'Onbeperkt swipen',
      '5 super likes per dag',
      'Zie wie jou leuk vindt',
      'Onbeperkt chatten',
      'Boost je profiel 1x per maand',
    ],
    icon: Crown,
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 19.99,
    description: 'Alles onbeperkt',
    features: [
      'Alles van Premium',
      'Onbeperkte super likes',
      'Lees bevestigingen',
      'Prioriteit support',
      'Wekelijkse boost',
      'Geen advertenties',
    ],
    icon: Sparkles,
    popular: false,
  },
];

export default function PricingStep() {
  const { nextStep } = useOnboardingStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Onze prijzen
        </h2>
        <p className="text-slate-600 mt-2">
          Je kunt altijd gratis beginnen. Upgrade wanneer je wilt.
        </p>
      </div>

      <div className="grid gap-4">
        {PRICING_TIERS.map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: PRICING_TIERS.indexOf(tier) * 0.1 }}
            className={`relative bg-white rounded-2xl border-2 p-5 ${
              tier.popular
                ? 'border-pink-500 shadow-lg'
                : 'border-slate-200'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Populair
                </span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <tier.icon
                    className={`w-5 h-5 ${
                      tier.popular ? 'text-pink-500' : 'text-slate-400'
                    }`}
                  />
                  <h3 className="font-bold text-slate-900">{tier.name}</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">{tier.description}</p>
              </div>
              <div className="text-right">
                {tier.price === 0 ? (
                  <span className="text-2xl font-bold text-slate-900">Gratis</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-slate-900">
                      {tier.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-slate-500">/maand</span>
                  </>
                )}
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600 text-center">
          Je kunt nu gratis beginnen. Upgraden kan altijd later in je instellingen.
        </p>
      </div>

      <button
        onClick={nextStep}
        className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors"
      >
        Begrepen, verder
      </button>
    </motion.div>
  );
}
