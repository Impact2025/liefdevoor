'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Sparkles, ArrowRight, Loader2, Wand2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const MAX_BIO_LENGTH = 500;
const MIN_BIO_LENGTH = 10;

const TOPIC_SUGGESTIONS = [
  'Wandelen',
  'Koken',
  'Reizen',
  'Muziek',
  'Sport',
  'Films',
  'Lezen',
  'Natuur',
  'Fotografie',
  'Kunst',
];

export default function BioStep() {
  const { userData, updateUserData, nextStep, saveStepToServer } = useOnboardingStore();
  const [bio, setBio] = useState(userData.bio);
  const [isAiHelping, setIsAiHelping] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
      setAiError(null);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : prev.length < 5
        ? [...prev, topic]
        : prev
    );
  };

  const handleGenerateBio = async () => {
    if (selectedTopics.length === 0) return;

    setIsAiHelping(true);
    setShowTopicSelector(false);
    setAiError(null);

    try {
      const response = await fetch('/api/onboarding/bio-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topics: selectedTopics,
          name: userData.name || undefined,
          gender: userData.gender || undefined,
          lookingFor: userData.lookingFor || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Kon geen bio genereren');
      }

      const data = await response.json();
      if (data.bio) {
        setBio(data.bio);
      } else {
        throw new Error('Geen bio ontvangen');
      }
    } catch (error) {
      console.error('AI bio error:', error);
      setAiError('Kon geen bio genereren. Probeer het opnieuw of schrijf zelf.');
    } finally {
      setIsAiHelping(false);
      setSelectedTopics([]);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const success = await saveStepToServer(10, { bio: bio.trim() });
      if (success) {
        updateUserData({ bio: bio.trim() });
        nextStep();
      }
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
          disabled={isAiHelping}
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

      {/* AI Error */}
      {aiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {aiError}
        </div>
      )}

      {/* AI Help Button */}
      <button
        onClick={() => setShowTopicSelector(!showTopicSelector)}
        disabled={isAiHelping}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-rose-500 hover:border-rose-500 transition-colors disabled:opacity-50"
      >
        {isAiHelping ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI is aan het schrijven...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 text-rose-500" />
            <span>Laat AI me helpen schrijven</span>
          </>
        )}
      </button>

      {/* Topic Selector */}
      <AnimatePresence>
        {showTopicSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Kies onderwerpen die bij je passen (max 5):
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_SUGGESTIONS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-500'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerateBio}
                disabled={selectedTopics.length === 0}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Genereer bio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          Een goede bio eindigt vaak met een vraag - dit nodigt uit tot conversatie.
        </p>
      </div>

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
