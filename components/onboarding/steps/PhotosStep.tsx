'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, X, ArrowRight, Lightbulb } from 'lucide-react';
import PhotoCropper from '@/components/onboarding/ui/PhotoCropper';
import Image from 'next/image';
import { useUploadThing } from '@/utils/uploadthing';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 1;

export interface PhotoData {
  url: string;
  order: number;
}

interface PhotosStepProps {
  onComplete: (photos: PhotoData[]) => void;
  initialPhotos?: PhotoData[];
}

export default function PhotosStep({ onComplete, initialPhotos = [] }: PhotosStepProps) {
  const [photos, setPhotos] = useState<PhotoData[]>(initialPhotos);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('profilePhotos', {
    onClientUploadComplete: (res) => {
      console.log('Upload complete:', res);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      alert('Upload mislukt: ' + error.message);
      setIsUploading(false);
    },
  });

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
      const file = new File([croppedBlob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadResult = await startUpload([file]);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Upload failed - no result received');
      }

      const photoUrl = uploadResult[0].url;
      setPhotos(prev => [...prev, { url: photoUrl, order: prev.length }]);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(error instanceof Error ? error.message : 'Er ging iets mis bij het uploaden');
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

  const handleRemovePhoto = async (index: number) => {
    const photo = photos[index];
    if (photo?.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url);
    }
    setPhotos(prev => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i })));
  };

  const handleContinue = async () => {
    if (photos.length < MIN_PHOTOS) return;
    setIsSaving(true);
    try {
      onComplete(photos);
    } finally {
      setIsSaving(false);
    }
  };

  const canContinue = photos.length >= MIN_PHOTOS;

  return (
    <div className="flex flex-col min-h-full">
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
        className="flex flex-col min-h-full px-4"
      >
        {/* Header */}
        <div className="text-center pt-4 pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-50 flex items-center justify-center">
            <Camera className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Laat jezelf zien</h2>
          <p className="text-slate-600 mt-2">Voeg minimaal 1 foto toe (max 6)</p>
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-4">
          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={`photo-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-[2/3] rounded-xl overflow-hidden group border border-slate-200"
              >
                <Image
                  src={photo.url}
                  alt={`Foto ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="object-cover"
                  unoptimized
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-rose-500 rounded-lg text-xs font-bold text-white">
                    Hoofdfoto
                  </div>
                )}
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                >
                  <X className="w-4 h-4 text-slate-600 hover:text-red-500" />
                </button>
              </motion.div>
            ))}

            {photos.length < MAX_PHOTOS && (
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
                    <span className="text-xs text-slate-400 group-hover:text-rose-500">Toevoegen</span>
                  </>
                )}
              </motion.button>
            )}

            {photos.length < MAX_PHOTOS - 1 &&
              Array.from({ length: Math.min(2, MAX_PHOTOS - photos.length - 1) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-[2/3] rounded-xl border border-dashed border-slate-200 bg-slate-50"
                />
              ))}
          </div>

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
        </div>

        {/* Continue Button */}
        <div className="py-6 mt-auto">
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
              `Voeg minimaal ${MIN_PHOTOS} foto toe`
            ) : (
              <>
                Verder
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
