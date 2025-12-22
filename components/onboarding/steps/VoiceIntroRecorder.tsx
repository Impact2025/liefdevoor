'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Check, Loader2, Volume2 } from 'lucide-react';
import { useAudioRecorder, formatDuration } from '@/hooks/useAudioRecorder';
import { useUploadThing } from '@/utils/uploadthing';

interface VoiceIntroRecorderProps {
  onComplete: (audioUrl: string | null) => void;
  onSkip?: () => void;
}

const PROMPTS = [
  'Vertel iets leuks over jezelf',
  'Wat zoek je in een relatie?',
  'Waar word je blij van?',
  'Wat is je perfecte date?',
];

export default function VoiceIntroRecorder({ onComplete, onSkip }: VoiceIntroRecorderProps) {
  const [step, setStep] = useState<'intro' | 'recording' | 'preview' | 'uploading'>('intro');
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing('voiceIntro', {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onComplete(res[0].url);
      } else {
        onComplete(null);
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setUploadError('Upload mislukt. Probeer opnieuw.');
      setStep('preview');
    },
  });

  const {
    isRecording,
    isPlaying,
    duration,
    audioUrl,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    resetRecording,
  } = useAudioRecorder({
    maxDuration: 30,
    onRecordingComplete: () => {
      setStep('preview');
    },
  });

  const handleStartRecording = useCallback(async () => {
    setStep('recording');
    await startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleRetry = useCallback(() => {
    resetRecording();
    setStep('intro');
    setUploadError(null);
  }, [resetRecording]);

  const handleUpload = useCallback(async () => {
    if (!audioBlob) {
      onComplete(null);
      return;
    }

    setStep('uploading');
    setUploadError(null);

    try {
      const extension = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : 'ogg';
      const file = new File([audioBlob], `voice-intro.${extension}`, { type: audioBlob.type });
      await startUpload([file]);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Upload mislukt. Probeer opnieuw.');
      setStep('preview');
    }
  }, [audioBlob, onComplete, startUpload]);

  const handleSkip = useCallback(() => {
    onComplete(null);
    onSkip?.();
  }, [onComplete, onSkip]);

  return (
    <div className="flex flex-col min-h-full">
      <AnimatePresence mode="wait">
        {/* Intro Screen */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col px-4"
          >
            {/* Header */}
            <div className="text-center mb-8 pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Volume2 className="w-10 h-10 text-purple-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Laat je stem horen
              </h2>
              <p className="text-slate-600">
                Een voice intro maakt je profiel persoonlijker en verhoogt je matches met 40%!
              </p>
            </div>

            {/* Prompt Selection */}
            <div className="space-y-3 mb-8">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Kies een vraag om te beantwoorden:
              </p>
              {PROMPTS.map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedPrompt(index)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                    selectedPrompt === index
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`font-medium ${
                    selectedPrompt === index ? 'text-purple-900' : 'text-slate-700'
                  }`}>
                    {prompt}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-3 pb-6">
              <motion.button
                onClick={handleStartRecording}
                className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-3 text-lg touch-manipulation"
                whileTap={{ scale: 0.98 }}
              >
                <Mic className="w-7 h-7" />
                Start opname
              </motion.button>

              <button
                onClick={handleSkip}
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                Later doen
              </button>
            </div>
          </motion.div>
        )}

        {/* Recording Screen */}
        {step === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            {/* Prompt Display */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 px-4"
            >
              <p className="text-xl font-semibold text-slate-900">
                &ldquo;{PROMPTS[selectedPrompt]}&rdquo;
              </p>
            </motion.div>

            {/* Recording Visualization */}
            <div className="relative mb-8">
              {/* Pulsing rings */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-200"
                    animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    style={{ width: 160, height: 160, left: -20, top: -20 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-300"
                    animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.3 }}
                    style={{ width: 160, height: 160, left: -20, top: -20 }}
                  />
                </>
              )}

              {/* Main circle */}
              <motion.div
                className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 ${
                  isRecording ? 'bg-red-500' : 'bg-purple-600'
                }`}
                animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Mic className="w-14 h-14 text-white" />
              </motion.div>
            </div>

            {/* Duration Display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-8"
            >
              <p className="text-4xl font-bold text-slate-900 tabular-nums">
                {formatDuration(duration)}
              </p>
              <p className="text-slate-500 mt-1">
                Max 30 seconden
              </p>
            </motion.div>

            {/* Audio Waveform */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-12 mb-8">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-red-400 rounded-full"
                    animate={{
                      height: [12, Math.random() * 40 + 12, 12],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.4,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Stop Button */}
            <motion.button
              onClick={handleStopRecording}
              className="w-full max-w-xs py-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-3 text-lg touch-manipulation"
              whileTap={{ scale: 0.98 }}
            >
              <Square className="w-6 h-6" fill="white" />
              Stop opname
            </motion.button>

            {error && (
              <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
            )}
          </motion.div>
        )}

        {/* Preview Screen */}
        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-28 h-28 bg-purple-100 rounded-full flex items-center justify-center mb-6"
            >
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Pause className="w-12 h-12 text-purple-600" />
                </motion.div>
              ) : (
                <Play className="w-12 h-12 text-purple-600 ml-1" />
              )}
            </motion.div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Opname klaar!
            </h3>
            <p className="text-3xl font-bold text-purple-600 tabular-nums mb-2">
              {formatDuration(duration)}
            </p>
            <p className="text-slate-500 mb-8">
              Luister terug of neem opnieuw op
            </p>

            {uploadError && (
              <p className="text-red-500 text-sm mb-4">{uploadError}</p>
            )}

            {/* Playback Controls */}
            <div className="flex gap-4 mb-8">
              <motion.button
                onClick={isPlaying ? stopAudio : playAudio}
                className="w-16 h-16 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </motion.button>

              <motion.button
                onClick={handleRetry}
                className="w-16 h-16 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-7 h-7" />
              </motion.button>
            </div>

            {/* Confirm Button */}
            <motion.button
              onClick={handleUpload}
              className="w-full max-w-xs py-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-3 text-lg touch-manipulation"
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-6 h-6" />
              Opslaan en doorgaan
            </motion.button>

            <button
              onClick={handleSkip}
              className="mt-4 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Overslaan
            </button>
          </motion.div>
        )}

        {/* Uploading Screen */}
        {step === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-20 h-20 mb-6"
            >
              <Loader2 className="w-20 h-20 text-purple-600" />
            </motion.div>
            <p className="text-lg font-medium text-slate-900">
              Voice intro opslaan...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
