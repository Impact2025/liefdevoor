'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, X, ArrowRight, Lightbulb } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import PhotoCropper from '@/components/onboarding/ui/PhotoCropper';
import Image from 'next/image';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 1;

export default function PhotosStep() {
  const { userData, addPhoto, removePhoto, nextStep, saveStepToServer, updateUserData } = useOnboardingStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Kies een afbeelding');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Afbeelding is te groot (max 10MB)');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      // Create a temporary URL for preview
      const photoUrl = URL.createObjectURL(croppedBlob);

      // Add as PhotoData object
      addPhoto({
        url: photoUrl,
        order: userData.photos.length,
      });

      setSelectedImage(null);

      // TODO: Upload to UploadThing and get permanent URL
      // For now using blob URL for preview
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Er ging iets mis bij het uploaden');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
  };

  const handleRemovePhoto = (index: number) => {
    const photo = userData.photos[index];
    if (photo?.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url);
    }
    removePhoto(index);
  };

  const handleContinue = async () => {
    if (userData.photos.length < MIN_PHOTOS) return;

    setIsSaving(true);
    try {
      // For now just proceed - photos are already in local state
      // In production, photos would be uploaded to UploadThing first
      const success = await saveStepToServer(9, {});
      if (success) {
        nextStep();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canContinue = userData.photos.length >= MIN_PHOTOS;

  return (
    <>
      {/* Photo Cropper Modal */}
      <AnimatePresence>
        {selectedImage && (
          <PhotoCropper
            imageSrc={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-50 flex items-center justify-center">
            <Camera className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Laat jezelf zien
          </h2>
          <p className="text-slate-600 mt-2">
            Voeg minimaal 1 foto toe (max 6)
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Existing Photos */}
          {userData.photos.map((photo, index) => (
            <motion.div
              key={photo.id || `photo-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-[2/3] rounded-xl overflow-hidden group border border-slate-200"
            >
              <Image
                src={photo.url}
                alt={`Foto ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Main photo badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-stone-500 rounded-lg text-xs font-bold text-white">
                  Hoofdfoto
                </div>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
              >
                <X className="w-4 h-4 text-slate-600 hover:text-red-500" />
              </button>
            </motion.div>
          ))}

          {/* Add Photo Button */}
          {userData.photos.length < MAX_PHOTOS && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-[2/3] rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center gap-2 hover:border-rose-500 hover:bg-stone-50 transition-all group disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-8 h-8 border-2 border-slate-300 border-t-rose-500 rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-rose-500">
                    Toevoegen
                  </span>
                </>
              )}
            </motion.button>
          )}

          {/* Empty slots */}
          {userData.photos.length < MAX_PHOTOS - 1 &&
            Array.from({ length: Math.min(2, MAX_PHOTOS - userData.photos.length - 1) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-[2/3] rounded-xl border border-dashed border-slate-200 bg-slate-50"
              />
            ))}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Tips */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Tips voor de beste fotos</h4>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>Kies een foto waar je gezicht goed te zien is</li>
                <li>Laat je echte glimlach zien</li>
                <li>Gebruik recente fotos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue || isSaving}
          className="w-full py-4 bg-stone-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Even geduld...
            </>
          ) : !canContinue ? (
            `Voeg minimaal ${MIN_PHOTOS} foto toe`
          ) : (
            <>
              Verder
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </>
  );
}
