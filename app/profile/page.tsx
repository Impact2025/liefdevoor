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
import { useCurrentUser } from '@/hooks'
import { PageLoading, Alert, Avatar } from '@/components/ui'
import { UploadButton } from '@/utils/uploadthing'

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

  const deletePhoto = useCallback(async (photoId: string) => {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      } else {
        alert('Failed to delete photo')
      }
    } catch (error) {
      alert('Failed to delete photo')
    }
  }, [])

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50 flex items-center justify-center p-6">
        <Alert variant="error">
          Fout bij het laden van profiel. Probeer de pagina te verversen.
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary-600">
            ⚙️ Mijn Profiel
          </h1>
          <p className="text-gray-600 mt-1">
            Beheer je profiel en voorkeuren
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
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

              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square group">
                      <img
                        src={photo.url}
                        alt="Profile photo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                      alert(`Upload error: ${error.message}`)
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload tot {6 - photos.length} meer foto's
                  </p>
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
