import React, { useState } from 'react';
import { useAdaptiveUI, Adaptive } from './AdaptiveUI';
import { Heart, X, Star, MapPin, Info, Settings, MessageCircle } from 'lucide-react';

/**
 * Profile Card - Adaptief Voorbeeld
 * 
 * Dit toont hoe DEZELFDE component er anders uitziet
 * voor verschillende users, maar allemaal van hoge kwaliteit.
 */

interface ProfileCardProps {
  profile: {
    name: string;
    age: number;
    photo: string;
    distance: number;
    city: string;
    bio: string;
    interests: string[];
    verified: boolean;
  };
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
}

export const AdaptiveProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onPass,
  onSuperLike,
}) => {
  const { mode, isSimpleMode, isStandardMode, isAdvancedMode } = useAdaptiveUI();
  const [showBio, setShowBio] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Mode Indicator (alleen voor demo - remove in production) */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-center text-sm">
        <span className="font-semibold">Huidige modus:</span> {
          isSimpleMode ? '🎯 Eenvoudig' :
          isAdvancedMode ? '🚀 Geavanceerd' :
          '⚡ Standaard'
        }
      </div>

      {/* ============ SIMPLE MODE ============ */}
      {isSimpleMode && (
        <div className="bg-white rounded-accessible shadow-lg overflow-hidden">
          {/* Large Photo */}
          <div className="relative aspect-[3/4]">
            <img
              src={profile.photo}
              alt={`Foto van ${profile.name}`}
              className="w-full h-full object-cover"
            />
            
            {/* Verified Badge - Extra Prominent */}
            {profile.verified && (
              <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                ✓ Echt Profiel
              </div>
            )}

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Info overlay - Extra Large */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex items-center gap-2 text-xl">
                <MapPin size={24} />
                <span>{profile.distance} km weg • {profile.city}</span>
              </div>
            </div>
          </div>

          {/* Content - Extra Clear */}
          <div className="p-6 space-y-6">
            {/* Bio - Always visible in simple mode */}
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Info size={20} />
                Over {profile.name}
              </h3>
              <p className="text-lg leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Interests - Large chips */}
            {profile.interests.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3">Interesses</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-base font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-accessible p-4">
              <p className="text-base text-blue-900 flex items-start gap-2">
                <span className="text-2xl">💡</span>
                <span>
                  <strong>Vind je {profile.name} leuk?</strong><br />
                  Druk op het groene hart hieronder. Als {profile.name} jou ook leuk vindt, krijg je een match!
                </span>
              </p>
            </div>

            {/* Actions - Extra Large Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pass Button */}
              <button
                onClick={onPass}
                className="flex flex-col items-center gap-3 p-6 rounded-accessible border-4 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                aria-label={`Niet geïnteresseerd in ${profile.name}`}
              >
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <X size={32} className="text-gray-700" />
                </div>
                <span className="text-xl font-bold text-gray-700">Niet Nu</span>
              </button>

              {/* Like Button */}
              <button
                onClick={onLike}
                className="flex flex-col items-center gap-3 p-6 rounded-accessible border-4 border-green-600 bg-green-50 hover:bg-green-100 hover:border-green-700 transition-all"
                aria-label={`Ik vind ${profile.name} leuk`}
              >
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Heart size={32} className="text-white" fill="white" />
                </div>
                <span className="text-xl font-bold text-green-700">Leuk!</span>
              </button>
            </div>

            {/* Super Like - Separate, explained */}
            <div className="border-t-2 border-gray-200 pt-4">
              <button
                onClick={onSuperLike}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-accessible bg-blue-50 border-2 border-blue-400 hover:bg-blue-100 transition-all"
              >
                <Star size={24} className="text-blue-600" fill="#3b82f6" />
                <span className="text-lg font-bold text-blue-700">
                  Super Like (toon extra interesse!)
                </span>
              </button>
              <p className="text-sm text-gray-600 text-center mt-2">
                {profile.name} ziet direct dat je héél geïnteresseerd bent
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============ STANDARD MODE ============ */}
      {isStandardMode && (
        <div className="bg-white rounded-accessible shadow-lg overflow-hidden">
          {/* Photo */}
          <div className="relative aspect-[3/4]">
            <img
              src={profile.photo}
              alt={`${profile.name}, ${profile.age}`}
              className="w-full h-full object-cover"
            />
            
            {/* Verified Badge */}
            {profile.verified && (
              <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow">
                ✓ Verified
              </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex items-center gap-1 text-sm">
                <MapPin size={16} />
                <span>{profile.distance} km • {profile.city}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Interests */}
            {profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 4).map((interest, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 4 && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    +{profile.interests.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Bio - Collapsible */}
            <div>
              {showBio ? (
                <div className="space-y-2">
                  <p className="text-base text-gray-700 leading-relaxed">
                    {profile.bio}
                  </p>
                  <button
                    onClick={() => setShowBio(false)}
                    className="text-primary-600 text-sm font-semibold hover:underline"
                  >
                    Verberg bio
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBio(true)}
                  className="text-primary-600 text-sm font-semibold hover:underline"
                >
                  Lees bio →
                </button>
              )}
            </div>

            {/* Actions - Compact */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {/* Pass */}
              <button
                onClick={onPass}
                className="w-14 h-14 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                aria-label="Pass"
              >
                <X size={28} />
              </button>

              {/* Super Like */}
              <button
                onClick={onSuperLike}
                className="w-12 h-12 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                aria-label="Super Like"
              >
                <Star size={24} />
              </button>

              {/* Like */}
              <button
                onClick={onLike}
                className="w-14 h-14 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center shadow-lg"
                aria-label="Like"
              >
                <Heart size={28} fill="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADVANCED MODE ============ */}
      {isAdvancedMode && (
        <div className="bg-white rounded-accessible shadow-lg overflow-hidden">
          {/* Compact Photo */}
          <div className="relative aspect-[4/3]">
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay badges */}
            <div className="absolute top-2 right-2 flex gap-2">
              {profile.verified && (
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                  ✓
                </span>
              )}
              {/* Quick actions */}
              <button
                className="bg-black/50 text-white p-1.5 rounded hover:bg-black/70"
                aria-label="More info"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Quick info overlay */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-semibold">
              {profile.name}, {profile.age} • {profile.distance}km
            </div>
          </div>

          {/* Dense Info Layout */}
          <div className="p-4 space-y-3">
            {/* Interests - Compact tags */}
            {profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            {/* Bio - Truncated */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {profile.bio}
            </p>

            {/* Action Bar - Compact with keyboard shortcuts */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              {/* Left actions */}
              <div className="flex gap-2">
                <button
                  onClick={onPass}
                  className="w-10 h-10 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition flex items-center justify-center relative group"
                  aria-label="Pass (X)"
                >
                  <X size={20} />
                  <span className="absolute -top-6 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    X
                  </span>
                </button>
                
                <button
                  onClick={onSuperLike}
                  className="w-10 h-10 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 transition flex items-center justify-center relative group"
                  aria-label="Super Like (S)"
                >
                  <Star size={18} />
                  <span className="absolute -top-6 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    S
                  </span>
                </button>
              </div>

              {/* Right actions */}
              <div className="flex gap-2">
                <button
                  className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center"
                  aria-label="Send message"
                >
                  <MessageCircle size={18} />
                </button>
                
                <button
                  onClick={onLike}
                  className="w-10 h-10 rounded-full bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center relative group"
                  aria-label="Like (L)"
                >
                  <Heart size={20} fill="white" />
                  <span className="absolute -top-6 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    L
                  </span>
                </button>
              </div>
            </div>

            {/* Stats bar (advanced only) */}
            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>Online 2u geleden</span>
              <span>92% match</span>
              <span>3 gemeenschappelijk</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher (Demo purposes) */}
      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
        <p className="text-xs text-gray-600 mb-2 font-semibold">
          🎨 Demo: Probeer verschillende modes
        </p>
        <ModeSwitcher />
      </div>
    </div>
  );
};

// Demo mode switcher
const ModeSwitcher: React.FC = () => {
  const { mode, setMode } = useAdaptiveUI();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode('simple')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          mode === 'simple'
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        🎯 Eenvoudig
      </button>
      <button
        onClick={() => setMode('standard')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          mode === 'standard'
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        ⚡ Standaard
      </button>
      <button
        onClick={() => setMode('advanced')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          mode === 'advanced'
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        🚀 Geavanceerd
      </button>
    </div>
  );
};

export default AdaptiveProfileCard;
