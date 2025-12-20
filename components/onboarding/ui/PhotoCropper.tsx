'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, Check, X, Lightbulb } from 'lucide-react';
import { Point, Area } from 'react-easy-crop';

interface PhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

export default function PhotoCropper({ imageSrc, onCropComplete, onCancel }: PhotoCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (location: Point) => setCrop(location);
  const onZoomChange = (newZoom: number) => setZoom(newZoom);

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 text-center z-10 bg-slate-900 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white">Pas je foto aan</h2>
        <p className="text-slate-400 text-sm">Sleep de foto naar de juiste positie</p>
      </div>

      {/* Crop Area */}
      <div className="relative flex-1 w-full bg-slate-800">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={2 / 3}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
          showGrid={true}
          classes={{
            containerClassName: 'bg-slate-800',
            cropAreaClassName: 'border-2 border-white rounded-xl'
          }}
        />
      </div>

      {/* Controls Footer */}
      <div className="p-6 space-y-6 bg-slate-900 w-full max-w-md mx-auto border-t border-slate-700">
        {/* Zoom Slider */}
        <div className="flex items-center gap-4">
          <ZoomOut className="w-5 h-5 text-slate-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <ZoomIn className="w-5 h-5 text-slate-400" />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Gebruiken
          </button>
        </div>

        {/* Tip */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lightbulb className="w-3 h-3" />
          <span>Zorg dat je gezicht goed zichtbaar is</span>
        </div>
      </div>
    </div>
  );
}
