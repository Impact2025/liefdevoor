'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import confetti from 'canvas-confetti';
import Image from 'next/image';

export default function CompleteStep() {
  const router = useRouter();
  const { userData, reset, saveStepToServer } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C34C60', '#ed7693', '#fda4af'],
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Save final step to mark profile as complete
      const success = await saveStepToServer(13, {});

      if (success) {
        setIsComplete(true);

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#C34C60', '#ed7693', '#22c55e'],
        });

        setTimeout(() => {
          reset();
          router.push('/discover');
        }, 2000);
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-slate-900 text-center mb-2"
        >
          Profiel aangemaakt!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-center"
        >
          Je wordt doorgestuurd naar Discover...
        </motion.p>
      </motion.div>
    );
  }

  const primaryPhoto = userData.photos[0]?.url || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">
          Je profiel is bijna klaar!
        </h2>
        <p className="text-slate-600 mt-2">
          Bekijk je profiel en maak het definitief
        </p>
      </div>

      {/* Profile Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Photo */}
        {primaryPhoto && (
          <div className="relative aspect-[4/3]">
            <Image
              src={primaryPhoto}
              alt="Je profielfoto"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl font-bold text-white">
                {userData.name || 'Jij'}{userData.birthDate ? `, ${calculateAge(userData.birthDate)}` : ''}
              </h3>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Gender & Looking for */}
          <div className="flex flex-wrap gap-2">
            {userData.gender && (
              <span className="px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-600">
                {genderLabel(userData.gender)}
              </span>
            )}
            {userData.lookingFor && (
              <span className="px-3 py-1.5 bg-stone-50 rounded-full text-sm text-rose-600 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Zoekt {lookingForLabel(userData.lookingFor)}
              </span>
            )}
            {userData.city && (
              <span className="px-3 py-1.5 bg-blue-50 rounded-full text-sm text-blue-600">
                {userData.city}
              </span>
            )}
          </div>

          {/* Bio */}
          {userData.bio && (
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {userData.bio}
            </p>
          )}

          {/* Photo thumbnails */}
          {userData.photos.length > 1 && (
            <div className="flex gap-2">
              {userData.photos.slice(0, 4).map((photo, index) => (
                <div
                  key={photo.id || index}
                  className="w-12 h-12 rounded-lg overflow-hidden relative border border-slate-200"
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
              {userData.photos.length > 4 && (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-500 border border-slate-200">
                  +{userData.photos.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={isSubmitting}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Profiel opslaan...
          </>
        ) : (
          <>
            Start met zoeken
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-center text-slate-400 text-sm">
        Je kunt je profiel later altijd aanpassen
      </p>
    </motion.div>
  );
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function genderLabel(gender: string): string {
  const labels: Record<string, string> = {
    MALE: 'Man',
    FEMALE: 'Vrouw',
    NON_BINARY: 'Non-binair',
  };
  return labels[gender] || gender;
}

function lookingForLabel(lookingFor: string): string {
  const labels: Record<string, string> = {
    MALE: 'mannen',
    FEMALE: 'vrouwen',
    BOTH: 'iedereen',
  };
  return labels[lookingFor] || lookingFor;
}
