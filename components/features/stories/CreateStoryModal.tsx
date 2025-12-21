/**
 * Create Story Modal - Upload photo/video story
 */

'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X,
  Camera,
  Video,
  Upload,
  Check,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { useUploadThing } from '@/utils/uploadthing'

interface CreateStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateStoryModal({ isOpen, onClose, onSuccess }: CreateStoryModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'PHOTO' | 'VIDEO'>('PHOTO')
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { startUpload } = useUploadThing('storyUploader', {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        await createStory(res[0].url)
      }
    },
    onUploadError: (error) => {
      setError(error.message)
      setIsUploading(false)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError('Alleen foto\'s en video\'s zijn toegestaan')
      return
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`Bestand is te groot. Maximum: ${isVideo ? '50MB' : '10MB'}`)
      return
    }

    setSelectedFile(file)
    setMediaType(isVideo ? 'VIDEO' : 'PHOTO')
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const createStory = async (mediaUrl: string) => {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          mediaType,
          caption: caption.trim() || null,
        }),
      })

      if (res.ok) {
        onSuccess()
        handleReset()
        onClose()
      } else {
        const data = await res.json()
        setError(data.error || 'Er ging iets mis')
      }
    } catch (error) {
      setError('Er ging iets mis bij het aanmaken van de story')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      await startUpload([selectedFile])
    } catch (error) {
      setError('Upload mislukt')
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setCaption('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Nieuwe Story</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {!preview ? (
              // Upload area
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-colors"
              >
                <div className="flex justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-1">
                  Klik om een foto of video te uploaden
                </p>
                <p className="text-sm text-gray-400">
                  Foto's: max 10MB • Video's: max 50MB
                </p>
              </div>
            ) : (
              // Preview
              <div className="space-y-4">
                <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-black mx-auto">
                  {mediaType === 'VIDEO' ? (
                    <video
                      src={preview}
                      className="w-full h-full object-contain"
                      controls
                      muted
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  )}
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Caption input */}
                <div>
                  <input
                    type="text"
                    placeholder="Voeg een caption toe..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-400 mt-1 text-right">
                    {caption.length}/200
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Uploaden...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Story Plaatsen
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-400 mt-2">
              Je story is 24 uur zichtbaar
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CreateStoryModal
