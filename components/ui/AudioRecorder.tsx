/**
 * AudioRecorder Component
 *
 * Reusable audio recording UI component.
 * Supports recording, playback, and upload.
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Pause, Trash2, Upload, Loader2 } from 'lucide-react'
import { useAudioRecorder, formatDuration } from '@/hooks'
import { Button } from './Button'

export interface AudioRecorderProps {
  onAudioReady?: (blob: Blob, url: string) => void
  onUploadComplete?: (url: string) => void
  maxDuration?: number
  uploadEndpoint?: 'voiceIntro' | 'voiceMessage'
  showUploadButton?: boolean
  compact?: boolean
  className?: string
}

export function AudioRecorder({
  onAudioReady,
  onUploadComplete,
  maxDuration = 60,
  uploadEndpoint,
  showUploadButton = false,
  compact = false,
  className = '',
}: AudioRecorderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const {
    isRecording,
    isPaused,
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
    maxDuration,
    onRecordingComplete: (blob, url) => {
      onAudioReady?.(blob, url)
    },
  })

  const handleUpload = async () => {
    if (!audioBlob || !uploadEndpoint) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Create form data
      const formData = new FormData()
      const extension = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : 'ogg'
      formData.append('file', audioBlob, `recording.${extension}`)

      // Upload using uploadthing
      const response = await fetch(`/api/uploadthing?actionType=upload&slug=${uploadEndpoint}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onUploadComplete?.(data.url || data[0]?.url)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Upload mislukt. Probeer opnieuw.')
    } finally {
      setIsUploading(false)
    }
  }

  // Compact mode for chat input
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!audioUrl ? (
          // Recording controls
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </motion.button>
        ) : (
          // Playback controls
          <>
            <motion.button
              onClick={isPlaying ? stopAudio : playAudio}
              className="p-3 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200"
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
            <span className="text-sm text-gray-500 min-w-[40px]">
              {formatDuration(duration)}
            </span>
            <motion.button
              onClick={resetRecording}
              className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={16} />
            </motion.button>
          </>
        )}

        {isRecording && (
          <span className="text-sm text-red-500 font-medium">
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </span>
        )}

        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    )
  }

  // Full mode for profile voice intro
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      {/* Error display */}
      <AnimatePresence>
        {(error || uploadError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          >
            {error || uploadError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording visualization */}
      <div className="flex flex-col items-center py-6">
        {!audioUrl ? (
          // Recording state
          <>
            <motion.div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-100' : 'bg-gray-100'
              }`}
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-200"
                  animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
              <Mic
                size={40}
                className={isRecording ? 'text-red-500' : 'text-gray-400'}
              />
            </motion.div>

            <div className="mt-4 text-center">
              {isRecording ? (
                <>
                  <p className="text-2xl font-bold text-red-500">
                    {formatDuration(duration)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Max {formatDuration(maxDuration)}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">
                  Klik om op te nemen (max {maxDuration} sec)
                </p>
              )}
            </div>

            <div className="mt-6">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'secondary' : 'primary'}
                size="lg"
              >
                {isRecording ? (
                  <>
                    <Square size={20} className="mr-2" />
                    Stop opname
                  </>
                ) : (
                  <>
                    <Mic size={20} className="mr-2" />
                    Start opname
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          // Playback state
          <>
            <motion.div
              className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Pause size={40} className="text-primary-600" />
                </motion.div>
              ) : (
                <Play size={40} className="text-primary-600 ml-1" />
              )}
            </motion.div>

            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(duration)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Opname voltooid
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={isPlaying ? stopAudio : playAudio}
                variant="primary"
              >
                {isPlaying ? (
                  <>
                    <Pause size={18} className="mr-2" />
                    Pauzeer
                  </>
                ) : (
                  <>
                    <Play size={18} className="mr-2" />
                    Afspelen
                  </>
                )}
              </Button>

              <Button
                onClick={resetRecording}
                variant="secondary"
              >
                <Trash2 size={18} className="mr-2" />
                Opnieuw
              </Button>

              {showUploadButton && uploadEndpoint && (
                <Button
                  onClick={handleUpload}
                  variant="primary"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Uploaden...
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Opslaan
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Audio waveform placeholder */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-8 mt-2">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-red-400 rounded-full"
              animate={{
                height: [8, Math.random() * 24 + 8, 8],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
