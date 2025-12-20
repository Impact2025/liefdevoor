'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Shield, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function VerificationStep() {
  const { nextStep } = useOnboardingStore();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSkip = () => {
    nextStep();
  };

  const handleVerify = async () => {
    setIsCapturing(true);
    // TODO: Implement selfie verification with camera capture
    // For now, just skip after a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCapturing(false);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
          <Shield className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Verificatie
        </h2>
        <p className="text-slate-600 mt-2">
          Optioneel: Verifieer je profiel voor extra vertrouwen
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-slate-700">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>Geverifieerde badge op je profiel</span>
        </div>
        <div className="flex items-center gap-3 text-slate-700">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>Meer vertrouwen bij potentiele matches</span>
        </div>
        <div className="flex items-center gap-3 text-slate-700">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>Hogere zichtbaarheid in zoekresultaten</span>
        </div>
      </div>

      {/* Verification preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-900">Zo ziet het eruit</p>
              <p className="text-sm text-slate-500">Na verificatie</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-rose-500">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Geverifieerd</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700">Hoe werkt het?</h3>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-rose-500">1</span>
          </div>
          <p className="text-sm text-slate-600">Neem een selfie met je camera</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-rose-500">2</span>
          </div>
          <p className="text-sm text-slate-600">We vergelijken met je profielfoto</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-rose-500">3</span>
          </div>
          <p className="text-sm text-slate-600">Klaar! Je badge wordt direct zichtbaar</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={isCapturing}
          className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isCapturing ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verificatie starten...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Verifieer nu
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          disabled={isCapturing}
          className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Later doen
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Je selfie wordt alleen gebruikt voor verificatie en wordt daarna verwijderd.
      </p>
    </motion.div>
  );
}
