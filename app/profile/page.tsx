/**
 * Profile Page - Wereldklasse Edition
 *
 * Uses ProfileForm component with photo management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/forms'
import { AppHeader } from '@/components/layout'
import { useCurrentUser } from '@/hooks'
import { PageLoading, Alert, Avatar, AudioRecorder } from '@/components/ui'
import { UploadButton } from '@/utils/uploadthing'
import { Mic, Play, Pause, Trash2 } from 'lucide-react'

interface Photo {
  id: string
  url: string
  order: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { user, isLoading, error, refetch } = useCurrentUser()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [voiceAudioRef, setVoiceAudioRef] = useState<HTMLAudioElement | null>(null)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [isUploadingVoice, setIsUploadingVoice] = useState(false)

  // Define functions with useCallback before any conditional returns
  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/photos')
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error)
    } finally {
      setLoadingPhotos(false)
    }
  }, [])

  const setMainPhoto = useCallback(async (photoUrl: string) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setMain', photoId: photoUrl }),
      })
      if (res.ok) {
        refetch() // Refresh user data to update profile image
        alert('Profielfoto bijgewerkt!')
      } else {
        alert('Kon profielfoto niet instellen')
      }
    } catch (error) {
      alert('Kon profielfoto niet instellen')
    }
  }, [refetch])

  const deletePhoto = useCallback(async (photoId: string) => {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        refetch() // Refresh user data in case this was profile image
      } else {
        alert('Failed to delete photo')
      }
    } catch (error) {
      alert('Failed to delete photo')
    }
  }, [refetch])

  const playVoiceIntro = useCallback(() => {
    if (user?.voiceIntro) {
      const audio = new Audio(user.voiceIntro)
      audio.onended = () => setIsPlayingVoice(false)
      audio.play()
      setVoiceAudioRef(audio)
      setIsPlayingVoice(true)
    }
  }, [user?.voiceIntro])

  const stopVoiceIntro = useCallback(() => {
    if (voiceAudioRef) {
      voiceAudioRef.pause()
      voiceAudioRef.currentTime = 0
      setIsPlayingVoice(false)
    }
  }, [voiceAudioRef])

  const deleteVoiceIntro = useCallback(async () => {
    if (!confirm('Weet je zeker dat je je voice intro wilt verwijderen?')) return

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceIntro: null }),
      })
      if (res.ok) {
        refetch()
      } else {
        alert('Kon voice intro niet verwijderen')
      }
    } catch (error) {
      alert('Kon voice intro niet verwijderen')
    }
  }, [refetch])

  const handleVoiceUploadComplete = useCallback(async (blob: Blob) => {
    setIsUploadingVoice(true)
    try {
      // Create form data
      const formData = new FormData()
      const extension = blob.type.includes('webm') ? 'webm' : blob.type.includes('mp4') ? 'mp4' : 'ogg'
      formData.append('files', blob, `voice-intro.${extension}`)

      // Upload using uploadthing
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        refetch()
        setShowVoiceRecorder(false)
      }
    } catch (err) {
      console.error('Voice upload error:', err)
    } finally {
      setIsUploadingVoice(false)
    }
  }, [refetch])

  // All hooks must be called before any conditional returns!
  useEffect(() => {
    if (user) {
      fetchPhotos()
    }
  }, [user, fetchPhotos])

  // Now we can do conditional rendering
  if (status === 'loading' || isLoading) {
    return <PageLoading />
  }

  if (!session) {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <Alert variant="error">
          Fout bij het laden van profiel. Probeer de pagina te verversen.
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 lg:ml-64 lg:pt-16">
      <AppHeader
        title="Mijn Profiel"
        subtitle="Beheer je profiel en voorkeuren"
        className="lg:hidden"
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Picture & Photos */}
          <div className="lg:col-span-1">
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profielfoto
              </h2>
              <div className="flex flex-col items-center">
                <Avatar
                  src={user?.profileImage}
                  alt={user?.name || 'User'}
                  size="2xl"
                  className="mb-4"
                />
                <p className="text-sm text-gray-600 text-center mb-4">
                  {user?.name || 'Geen naam ingesteld'}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500">{user.email}</p>
                )}
              </div>
            </div>

            {/* Photos Gallery */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Foto's ({photos.length}/6)
              </h2>

              {/* Onboarding prompt when no photos */}
              {photos.length === 0 && !loadingPhotos && (
                <div className="mb-6 p-4 bg-gradient-to-br from-rose-50 to-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Voeg je eerste foto toe!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Profielen met foto's krijgen <span className="font-semibold text-rose-600">10x meer matches</span>. Upload een duidelijke foto van jezelf.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square group">
                      <img
                        src={photo.url}
                        alt="Profile photo"
                        className={`w-full h-full object-cover rounded-lg ${
                          user?.profileImage === photo.url ? 'ring-4 ring-purple-500' : ''
                        }`}
                      />

                      {/* Profile photo indicator */}
                      {user?.profileImage === photo.url && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                          Profielfoto
                        </div>
                      )}

                      {/* Set as main photo button - always visible on mobile, hover on desktop */}
                      {user?.profileImage !== photo.url && (
                        <button
                          onClick={() => setMainPhoto(photo.url)}
                          className="absolute bottom-2 left-2 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg font-medium hover:bg-purple-700 shadow-lg lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                        >
                          Stel in als profielfoto
                        </button>
                      )}

                      {/* Delete button - always visible on mobile, hover on desktop */}
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 6 && (
                <div>
                  <UploadButton
                    endpoint="profilePhotos"
                    onClientUploadComplete={(res) => {
                      if (res) {
                        fetchPhotos()
                        refetch()
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error('Upload error:', error)
                      alert(
                        `❌ Upload mislukt!\n\n` +
                        `Fout: ${error.message}\n\n` +
                        `Dit kan komen doordat:\n` +
                        `• De UploadThing configuratie ontbreekt op Vercel\n` +
                        `• Je internetconnectie problemen heeft\n` +
                        `• Het bestand te groot is (max 4MB)\n\n` +
                        `Probeer:\n` +
                        `1. Je internetconnectie te checken\n` +
                        `2. Een kleiner bestand te uploaden\n` +
                        `3. Contact op te nemen met support`
                      )
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {photos.length === 0
                      ? "Klik hierboven om je eerste foto te uploaden"
                      : `Upload tot ${6 - photos.length} meer foto's`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Voice Intro Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-500" />
                Voice Intro
              </h2>

              {user?.voiceIntro ? (
                // Has voice intro - show playback controls
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-rose-50 rounded-xl">
                    <button
                      onClick={isPlayingVoice ? stopVoiceIntro : playVoiceIntro}
                      className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      {isPlayingVoice ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Je voice intro</p>
                      <p className="text-sm text-gray-500">Klik om af te spelen</p>
                    </div>
                    <button
                      onClick={deleteVoiceIntro}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowVoiceRecorder(true)}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Nieuwe opname maken
                  </button>
                </div>
              ) : showVoiceRecorder ? (
                // Recording mode
                <div>
                  <AudioRecorder
                    maxDuration={60}
                    uploadEndpoint="voiceIntro"
                    showUploadButton={false}
                    onAudioReady={(blob, url) => {
                      // Will auto-upload via uploadthing
                    }}
                  />
                  <div className="mt-4 flex justify-center">
                    <UploadButton
                      endpoint="voiceIntro"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          refetch()
                          setShowVoiceRecorder(false)
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`Upload error: ${error.message}`)
                      }}
                      content={{
                        button: 'Audio uploaden',
                        allowedContent: 'Max 60 seconden',
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowVoiceRecorder(false)}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Annuleren
                  </button>
                </div>
              ) : (
                // No voice intro - show prompt
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-100 to-rose-100 rounded-full flex items-center justify-center">
                    <Mic className="w-8 h-8 text-rose-500" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Voeg een korte voice intro toe om je profiel persoonlijker te maken!
                  </p>
                  <button
                    onClick={() => setShowVoiceRecorder(true)}
                    className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Voice intro opnemen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Profiel Informatie
              </h2>

              {user && (
                <ProfileForm
                  initialData={user}
                  onSuccess={(updatedProfile) => {
                    refetch()
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
