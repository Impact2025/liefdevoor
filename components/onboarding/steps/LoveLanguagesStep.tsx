'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check } from 'lucide-react';

interface LoveLanguagesStepProps {
  onComplete: (data: LoveLanguageData) => void;
  onSkip?: () => void;
}

export interface LoveLanguageData {
  loveLangWords: number;  // 1-5 ranking (5 = highest)
  loveLangTime: number;
  loveLangGifts: number;
  loveLangActs: number;
  loveLangTouch: number;
}

interface LoveLanguage {
  id: keyof LoveLanguageData;
  label: string;
  description: string;
  emoji: string;
  color: string;
}

const loveLanguages: LoveLanguage[] = [
  {
    id: 'loveLangWords',
    label: 'Complimenten',
    description: 'Woorden van waardering en liefde',
    emoji: '💬',
    color: 'blue',
  },
  {
    id: 'loveLangTime',
    label: 'Quality Time',
    description: 'Onverdeelde aandacht samen',
    emoji: '⏰',
    color: 'purple',
  },
  {
    id: 'loveLangGifts',
    label: 'Cadeaus',
    description: 'Attente geschenken en verrassingen',
    emoji: '🎁',
    color: 'rose',
  },
  {
    id: 'loveLangActs',
    label: 'Hulpvaardigheid',
    description: 'Daden van liefde en zorg',
    emoji: '🤝',
    color: 'emerald',
  },
  {
    id: 'loveLangTouch',
    label: 'Aanraking',
    description: 'Fysieke affectie en nabijheid',
    emoji: '🤗',
    color: 'amber',
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-600' },
};

export default function LoveLanguagesStep({ onComplete, onSkip }: LoveLanguagesStepProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      // Remove from selection
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 3) {
      // Add to selection (max 3)
      setSelected([...selected, id]);
    }
  };

  const getSelectionOrder = (id: string): number | null => {
    const index = selected.indexOf(id);
    return index >= 0 ? index + 1 : null;
  };

  const canContinue = selected.length === 3;

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Convert selection to scores (5 = first, 4 = second, 3 = third, 1 = not selected)
    const data: LoveLanguageData = {
      loveLangWords: 1,
      loveLangTime: 1,
      loveLangGifts: 1,
      loveLangActs: 1,
      loveLangTouch: 1,
    };

    selected.forEach((id, index) => {
      data[id as keyof LoveLanguageData] = 5 - index; // 5, 4, 3
    });

    onComplete(data);
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
          className="w-14 h-14 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center"
        >
          <Heart className="w-7 h-7 text-pink-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">Love Languages</h2>
        <p className="text-slate-600 mt-1 text-sm">
          Kies je top 3 manieren om liefde te ontvangen
        </p>
        <div className="flex justify-center gap-2 mt-3">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                selected.length >= num
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-3 pb-4">
        {loveLanguages.map((lang, index) => {
          const order = getSelectionOrder(lang.id);
          const isSelected = order !== null;
          const colors = colorClasses[lang.color];

          return (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(lang.id)}
              disabled={isSaving}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left disabled:opacity-70 ${
                isSelected
                  ? `${colors.border} ${colors.bg}`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Emoji */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? colors.bg : 'bg-slate-100'}`}>
                <span className="text-2xl">{lang.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isSelected ? colors.text : 'text-slate-900'}`}>
                  {lang.label}
                </h3>
                <p className="text-sm text-slate-500">{lang.description}</p>
              </div>

              {/* Selection indicator */}
              <AnimatePresence mode="wait">
                {isSelected ? (
                  <motion.div
                    key="selected"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      order === 1 ? 'bg-rose-500' : order === 2 ? 'bg-rose-400' : 'bg-rose-300'
                    }`}
                  >
                    {order}
                  </motion.div>
                ) : (
                  <motion.div
                    key="unselected"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-8 h-8 rounded-full border-2 border-slate-200"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Insight preview */}
      {selected.length === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-rose-50 to-purple-50 p-4 rounded-xl border border-rose-100 mb-4"
        >
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-rose-600">💡 Insight:</span> Je voelt je het meest geliefd door{' '}
            <span className="font-medium">
              {loveLanguages.find(l => l.id === selected[0])?.label.toLowerCase()}
            </span>
            . We matchen je met mensen die dit begrijpen!
          </p>
        </motion.div>
      )}

      {/* Continue button */}
      <div className="pb-6 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          disabled={!canContinue || isSaving}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            canContinue
              ? 'bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opslaan...
            </span>
          ) : selected.length < 3 ? (
            `Kies nog ${3 - selected.length} ${3 - selected.length === 1 ? 'taal' : 'talen'}`
          ) : (
            'Doorgaan'
          )}
        </motion.button>

        {onSkip && (
          <button
            onClick={onSkip}
            disabled={isSaving}
            className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            Later invullen
          </button>
        )}
      </div>
    </motion.div>
  );
}
