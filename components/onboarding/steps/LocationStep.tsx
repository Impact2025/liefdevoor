'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Check, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

// Dutch postcode regex: 1234 AB or 1234AB
const POSTCODE_REGEX = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

interface GeoResult {
  city: string;
  latitude: number;
  longitude: number;
}

export default function LocationStep() {
  const { userData, updateUserData, nextStep, saveStepToServer } = useOnboardingStore();
  const [postcode, setPostcode] = useState(userData.postcode || '');
  const [city, setCity] = useState(userData.city || '');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Format postcode as user types (1234 AB format)
  const handlePostcodeChange = (value: string) => {
    // Remove spaces and uppercase
    let formatted = value.replace(/\s/g, '').toUpperCase();

    // Add space after 4 digits
    if (formatted.length > 4) {
      formatted = formatted.slice(0, 4) + ' ' + formatted.slice(4, 6);
    }

    setPostcode(formatted);
    setLookupError(null);
    setIsValid(false);
    setCity('');
  };

  // Lookup postcode when valid
  useEffect(() => {
    const lookup = async () => {
      const cleanPostcode = postcode.replace(/\s/g, '');
      if (!POSTCODE_REGEX.test(postcode)) return;

      setIsLookingUp(true);
      setLookupError(null);

      try {
        // Using postcode.tech API (free for NL postcodes)
        const response = await fetch(
          `https://api.postcode.tech/v1/postcode?postcode=${cleanPostcode}`
        );

        if (response.ok) {
          const data = await response.json() as GeoResult;
          setCity(data.city || 'Onbekend');
          setIsValid(true);
          updateUserData({
            postcode: postcode,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
          });
        } else {
          // Fallback: just accept the postcode without city lookup
          setIsValid(true);
          updateUserData({ postcode: postcode });
        }
      } catch {
        // API might not be available, just accept postcode
        setIsValid(true);
        updateUserData({ postcode: postcode });
      } finally {
        setIsLookingUp(false);
      }
    };

    const timeoutId = setTimeout(lookup, 500);
    return () => clearTimeout(timeoutId);
  }, [postcode, updateUserData]);

  const handleContinue = async () => {
    if (!isValid) return;

    setIsSaving(true);
    try {
      const success = await saveStepToServer(6, {
        postcode: postcode,
        city: city || undefined,
        latitude: userData.latitude || undefined,
        longitude: userData.longitude || undefined,
      });
      if (success) {
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
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Waar woon je?
        </h2>
        <p className="text-slate-600 mt-2">
          Zo kunnen we mensen in jouw buurt tonen
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            {isLookingUp ? (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            value={postcode}
            onChange={(e) => handlePostcodeChange(e.target.value)}
            placeholder="1234 AB"
            maxLength={7}
            className={`w-full py-4 pl-12 pr-12 text-lg border-2 rounded-xl focus:outline-none transition-colors ${
              isValid
                ? 'border-green-500 bg-green-50'
                : lookupError
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 focus:border-rose-500'
            }`}
          />
          {isValid && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>

        {lookupError && (
          <p className="text-sm text-red-600">{lookupError}</p>
        )}

        {city && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3"
          >
            <MapPin className="w-5 h-5 text-rose-500" />
            <div>
              <p className="font-medium text-slate-900">{city}</p>
              <p className="text-sm text-slate-500">{postcode}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          We tonen alleen je stad aan andere gebruikers, nooit je exacte adres.
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValid || isSaving}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Even geduld...
          </>
        ) : (
          'Verder'
        )}
      </button>
    </motion.div>
  );
}
