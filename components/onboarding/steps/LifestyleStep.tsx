'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Cigarette, Wine, Baby } from 'lucide-react';

interface LifestyleStepProps {
  onComplete: (data: LifestyleData) => void;
  onSkip?: () => void;
  initialData?: Partial<LifestyleData>;
}

export interface LifestyleData {
  height: number | null;
  smoking: string;
  drinking: string;
  children: string;
}

interface OptionItem {
  value: string;
  label: string;
  emoji: string;
}

const smokingOptions: OptionItem[] = [
  { value: 'never', label: 'Nooit', emoji: '🚭' },
  { value: 'sometimes', label: 'Soms sociaal', emoji: '🌬️' },
  { value: 'regularly', label: 'Regelmatig', emoji: '🚬' },
];

const drinkingOptions: OptionItem[] = [
  { value: 'never', label: 'Nooit', emoji: '🚫' },
  { value: 'socially', label: 'Sociaal', emoji: '🥂' },
  { value: 'regularly', label: 'Regelmatig', emoji: '🍷' },
];

const childrenOptions: OptionItem[] = [
  { value: 'no', label: 'Geen kinderen', emoji: '👤' },
  { value: 'want_someday', label: 'Wil ooit kinderen', emoji: '👶' },
  { value: 'have', label: 'Heb al kinderen', emoji: '👨‍👧' },
  { value: 'dont_want', label: 'Wil geen kinderen', emoji: '✋' },
];

export default function LifestyleStep({ onComplete, onSkip, initialData }: LifestyleStepProps) {
  const [height, setHeight] = useState<number>(initialData?.height || 175);
  const [smoking, setSmoking] = useState<string>(initialData?.smoking || '');
  const [drinking, setDrinking] = useState<string>(initialData?.drinking || '');
  const [children, setChildren] = useState<string>(initialData?.children || '');
  const [isSaving, setIsSaving] = useState(false);

  const canContinue = smoking && drinking && children;

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    onComplete({
      height,
      smoking,
      drinking,
      children,
    });

    setIsSaving(false);
  };

  const OptionButton = ({
    option,
    isSelected,
    onSelect,
  }: {
    option: OptionItem;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${
        isSelected
          ? 'border-rose-500 bg-rose-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className="text-xl block mb-1">{option.emoji}</span>
      <span className={`text-xs font-medium ${isSelected ? 'text-rose-600' : 'text-slate-600'}`}>
        {option.label}
      </span>
    </button>
  );

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
          className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <span className="text-2xl">🌿</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">Jouw levensstijl</h2>
        <p className="text-slate-600 mt-1 text-sm">
          Helpt ons bij het vinden van compatibele matches
        </p>
      </div>

      {/* Form sections */}
      <div className="flex-1 space-y-5 pb-4">
        {/* Height */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Lengte</span>
            <span className="ml-auto text-lg font-bold text-rose-500">{height} cm</span>
          </div>
          <input
            type="range"
            min="140"
            max="220"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>140 cm</span>
            <span>220 cm</span>
          </div>
        </motion.div>

        {/* Smoking */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Cigarette className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Roken</span>
          </div>
          <div className="flex gap-2">
            {smokingOptions.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                isSelected={smoking === option.value}
                onSelect={() => setSmoking(option.value)}
              />
            ))}
          </div>
        </motion.div>

        {/* Drinking */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wine className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Alcohol</span>
          </div>
          <div className="flex gap-2">
            {drinkingOptions.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                isSelected={drinking === option.value}
                onSelect={() => setDrinking(option.value)}
              />
            ))}
          </div>
        </motion.div>

        {/* Children */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Baby className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Kinderen</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {childrenOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setChildren(option.value)}
                className={`py-3 px-3 rounded-xl border-2 transition-all text-center ${
                  children === option.value
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xl block mb-1">{option.emoji}</span>
                <span className={`text-xs font-medium ${children === option.value ? 'text-rose-600' : 'text-slate-600'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

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
