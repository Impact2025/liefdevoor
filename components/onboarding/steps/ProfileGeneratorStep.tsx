'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Copy, Check, ChevronRight, ArrowRight, RefreshCw } from 'lucide-react';

// Stijl opties
const STYLE_OPTIONS = [
  {
    id: 'humorous',
    name: 'Vlot & Humoristisch',
    description: 'Luchtige toon met geestige zinnen die een glimlach opwekken',
    emoji: '😄',
  },
  {
    id: 'authentic',
    name: 'Diepgaand & Authentiek',
    description: 'Echte verhalen en oprechte connectie',
    emoji: '💫',
  },
  {
    id: 'minimalist',
    name: 'Minimalistisch & Intrigerend',
    description: 'Korte, mysterieuze zinnen die nieuwsgierig maken',
    emoji: '✨',
  },
];

// Persoonlijke details opties
const PERSONAL_DETAILS = [
  'Ik ben een echte koffieliefhebber',
  'Ik hou van spontane roadtrips',
  'Ik ben dol op koken voor anderen',
  'Ik heb een passie voor muziek',
  'Ik ben een boekenwurm',
  'Ik sport graag (fitness/hardlopen)',
  'Ik ben creatief bezig (kunst/fotografie)',
  'Ik hou van de natuur en wandelen',
  'Ik ben een filmfanaat',
  'Ik reis graag naar nieuwe plekken',
  'Ik ben een foodie die graag nieuwe restaurants probeert',
  'Ik hou van gezellige avonden met vrienden',
  'Ik heb een huisdier waar ik gek op ben',
  'Ik ben ambitieus in mijn carrière',
  'Ik geniet van festivals en concerten',
];

// Partner voorkeuren opties
const PARTNER_PREFERENCES = [
  'Iemand die me aan het lachen kan maken',
  'Iemand met wie ik diepgaande gesprekken kan voeren',
  'Iemand die van avontuur houdt',
  'Iemand die zelfstandig is',
  'Iemand met dezelfde waarden',
  'Iemand die van gezelligheid houdt',
  'Iemand die sportief is',
  'Iemand die creatief is',
  'Iemand die ambitieus is',
  'Iemand die van dieren houdt',
];

interface ProfileGeneratorStepProps {
  onComplete: (bio: string) => void;
  onSkip: () => void;
  userData: {
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

export default function ProfileGeneratorStep({ onComplete, onSkip, userData }: ProfileGeneratorStepProps) {
  const [step, setStep] = useState<'details' | 'style' | 'generating' | 'results'>('details');
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [customDetail, setCustomDetail] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [generatedProfiles, setGeneratedProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDetail = (detail: string) => {
    if (selectedDetails.includes(detail)) {
      setSelectedDetails(prev => prev.filter(d => d !== detail));
    } else if (selectedDetails.length < 8) {
      setSelectedDetails(prev => [...prev, detail]);
    }
  };

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(prev => prev.filter(p => p !== pref));
    } else if (selectedPreferences.length < 6) {
      setSelectedPreferences(prev => [...prev, pref]);
    }
  };

  const addCustomDetail = () => {
    if (customDetail.trim() && selectedDetails.length < 8) {
      setSelectedDetails(prev => [...prev, customDetail.trim()]);
      setCustomDetail('');
    }
  };

  const canProceedToStyle = selectedDetails.length >= 3 && selectedPreferences.length >= 1;

  const generateProfiles = async () => {
    setStep('generating');
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData,
          personalDetails: selectedDetails,
          partnerPreferences: selectedPreferences,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        throw new Error('Generatie mislukt');
      }

      const data = await response.json();
      setGeneratedProfiles(data.profiles);
      setStep('results');
    } catch (err) {
      console.error('Profile generation error:', err);
      setError('Er ging iets mis. Probeer het opnieuw.');
      setStep('style');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyProfile = async (index: number) => {
    try {
      await navigator.clipboard.writeText(generatedProfiles[index]);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const selectAndContinue = () => {
    if (selectedProfile !== null) {
      onComplete(generatedProfiles[selectedProfile]);
    }
  };

  const regenerate = () => {
    setStep('style');
    setGeneratedProfiles([]);
    setSelectedProfile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-full px-4"
    >
      {/* Header */}
      <div className="text-center pt-4 pb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center"
        >
          <Wand2 className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">AI Profiel Generator</h2>
        <p className="text-slate-600 mt-2">
          {step === 'details' && 'Vertel ons meer over jezelf'}
          {step === 'style' && 'Kies je profiel stijl'}
          {step === 'generating' && 'Even geduld...'}
          {step === 'results' && 'Kies je favoriete profiel'}
        </p>
      </div>

      {/* Step: Personal Details */}
      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-6"
          >
            {/* Personal Details Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Over jou <span className="text-slate-400">(min 3, max 8)</span>
                </h3>
                <span className="text-xs text-rose-500 font-medium">{selectedDetails.length}/8</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERSONAL_DETAILS.map((detail) => (
                  <button
                    key={detail}
                    onClick={() => toggleDetail(detail)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedDetails.includes(detail)
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {detail}
                  </button>
                ))}
              </div>
              {/* Custom detail input */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  placeholder="Of typ je eigen..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-rose-500 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomDetail()}
                />
                <button
                  onClick={addCustomDetail}
                  disabled={!customDetail.trim() || selectedDetails.length >= 8}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                >
                  Toevoegen
                </button>
              </div>
            </div>

            {/* Partner Preferences Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Wat zoek je? <span className="text-slate-400">(min 1, max 6)</span>
                </h3>
                <span className="text-xs text-rose-500 font-medium">{selectedPreferences.length}/6</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PARTNER_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => togglePreference(pref)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedPreferences.includes(pref)
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <button
                onClick={() => setStep('style')}
                disabled={!canProceedToStyle}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Kies stijl
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onSkip}
                className="w-full mt-3 py-3 text-slate-500 hover:text-slate-700 text-sm"
              >
                Overslaan en zelf schrijven
              </button>
            </div>
          </motion.div>
        )}

        {/* Step: Style Selection */}
        {step === 'style' && (
          <motion.div
            key="style"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-4"
          >
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {STYLE_OPTIONS.map((style, index) => (
              <motion.button
                key={style.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedStyle(style.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedStyle === style.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{style.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{style.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{style.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedStyle === style.id
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedStyle === style.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}

            <div className="pt-4 space-y-3">
              <button
                onClick={generateProfiles}
                disabled={!selectedStyle}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Genereer 3 profielen
              </button>
              <button
                onClick={() => setStep('details')}
                className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm"
              >
                Terug naar details
              </button>
            </div>
          </motion.div>
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-12"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-rose-500 animate-pulse" />
              <Sparkles className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
            <p className="mt-6 text-slate-600 font-medium">AI schrijft je profiel...</p>
            <p className="text-sm text-slate-400 mt-2">Dit duurt ongeveer 10 seconden</p>
          </motion.div>
        )}

        {/* Step: Results */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-4"
          >
            {generatedProfiles.map((profile, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                onClick={() => setSelectedProfile(index)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProfile === index
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400">Optie {index + 1}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyProfile(index);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {profile}
                </p>
                {selectedProfile === index && (
                  <div className="mt-3 flex items-center gap-2 text-rose-500 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Geselecteerd
                  </div>
                )}
              </motion.div>
            ))}

            <div className="pt-4 space-y-3">
              <button
                onClick={selectAndContinue}
                disabled={selectedProfile === null}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Gebruik dit profiel
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={regenerate}
                className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Opnieuw genereren
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
