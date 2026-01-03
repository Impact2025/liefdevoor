/**
 * LocationStep - Wereldklasse Edition
 *
 * Features:
 * - NL postcode input with auto-formatting & validation
 * - City autocomplete with province display
 * - Live mini-map with privacy circle
 * - Auto-geocoding (postcode → GPS coordinates)
 * - Privacy-first messaging
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { PostcodeInput } from '@/components/features/location/PostcodeInput';
import { CityAutocomplete } from '@/components/features/location/CityAutocomplete';
import { LocationMap } from '@/components/features/location/LocationMap';
import { LocationPrivacy } from '@/components/features/location/LocationPrivacy';
import type { GeocodingResult, CityOption } from '@/lib/services/geocoding';

export interface LocationData {
  postcode?: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface LocationStepProps {
  onComplete: (data: LocationData) => void;
  initialData?: Partial<LocationData>;
}

export default function LocationStep({ onComplete, initialData }: LocationStepProps) {
  const [postcode, setPostcode] = useState(initialData?.postcode || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);
  const [isSaving, setIsSaving] = useState(false);
  const [inputMethod, setInputMethod] = useState<'postcode' | 'city'>('postcode');

  // Handle postcode geocoding result
  const handlePostcodeGeocode = (result: GeocodingResult) => {
    setCity(result.city);
    setLatitude(result.latitude);
    setLongitude(result.longitude);
  };

  // Handle city selection from autocomplete
  const handleCitySelect = (selectedCity: CityOption) => {
    setCity(selectedCity.name);
    setLatitude(selectedCity.latitude);
    setLongitude(selectedCity.longitude);
  };

  const handleContinue = async () => {
    // Validate: need city with coordinates
    if (!city || !latitude || !longitude) return;

    setIsSaving(true);
    try {
      onComplete({
        postcode: postcode || undefined,
        city,
        latitude,
        longitude,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = (postcode && latitude && longitude) || (city && latitude && longitude);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Waar woon je?
        </h2>
        <p className="text-slate-600 mt-2">
          Vind matches in jouw buurt
        </p>
      </div>

      {/* Input method toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => setInputMethod('postcode')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            inputMethod === 'postcode'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Postcode
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('city')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            inputMethod === 'city'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stad
        </button>
      </div>

      {/* Input fields */}
      <div className="space-y-4">
        {inputMethod === 'postcode' ? (
          <PostcodeInput
            value={postcode}
            onChange={setPostcode}
            onGeocode={handlePostcodeGeocode}
            autoGeocode={true}
          />
        ) : (
          <CityAutocomplete
            value={city}
            onChange={setCity}
            onSelect={handleCitySelect}
          />
        )}

        {/* Location result card */}
        {city && latitude && longitude && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-green-500 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{city}</p>
                {postcode && (
                  <p className="text-sm text-gray-500">{postcode}</p>
                )}
              </div>
            </div>

            {/* Mini map */}
            <LocationMap
              latitude={latitude}
              longitude={longitude}
              city={city}
              height="150px"
              showPrivacyCircle={true}
              circleRadius={2000}
              interactive={false}
            />
          </motion.div>
        )}
      </div>

      {/* Privacy notice */}
      <LocationPrivacy variant="compact" />

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!isValid || isSaving}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Even geduld...
          </>
        ) : (
          'Verder'
        )}
      </button>
    </motion.div>
  );
}
