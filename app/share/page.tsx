/**
 * Share Target Handler
 * Receives shared content from other apps (PWA only)
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Share2, Image as ImageIcon, Link, FileText } from 'lucide-react'

export default function SharePage() {
  const router = useRouter()
  const [sharedData, setSharedData] = useState<{
    title?: string
    text?: string
    url?: string
    files?: File[]
  } | null>(null)

  useEffect(() => {
    // Check if content was shared via Share Target API
    const handleSharedContent = async () => {
      // This will be populated by the service worker
      const formData = new FormData(document.forms[0] as HTMLFormElement)

      const title = formData.get('title') as string
      const text = formData.get('text') as string
      const url = formData.get('url') as string
      const photos = formData.getAll('photos') as File[]

      setSharedData({
        title: title || undefined,
        text: text || undefined,
        url: url || undefined,
        files: photos.length > 0 ? photos : undefined
      })
    }

    if (document.forms.length > 0) {
      handleSharedContent()
    }
  }, [])

  const handleContinue = () => {
    // If photos were shared, redirect to profile to upload
    if (sharedData?.files && sharedData.files.length > 0) {
      // Store files in sessionStorage for upload
      router.push('/settings')
    } else if (sharedData?.url) {
      // If URL was shared, could be used for referrals
      router.push('/discover')
    } else {
      router.push('/discover')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-trust-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center">
          <Share2 size={32} className="text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Content Gedeeld!
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Je hebt content gedeeld naar Liefde Voor Iedereen
        </p>

        {/* Shared content preview */}
        {sharedData && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            {sharedData.title && (
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Titel</div>
                  <div className="text-sm text-gray-900">{sharedData.title}</div>
                </div>
              </div>
            )}

            {sharedData.text && (
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Tekst</div>
                  <div className="text-sm text-gray-900">{sharedData.text}</div>
                </div>
              </div>
            )}

            {sharedData.url && (
              <div className="flex items-start gap-3">
                <Link size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Link</div>
                  <div className="text-sm text-gray-900 truncate">{sharedData.url}</div>
                </div>
              </div>
            )}

            {sharedData.files && sharedData.files.length > 0 && (
              <div className="flex items-start gap-3">
                <ImageIcon size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Foto's</div>
                  <div className="text-sm text-gray-900">
                    {sharedData.files.length} {sharedData.files.length === 1 ? 'foto' : "foto's"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Doorgaan naar App
        </button>
      </motion.div>

      {/* Hidden form for Share Target API */}
      <form method="POST" style={{ display: 'none' }}>
        <input name="title" />
        <input name="text" />
        <input name="url" />
        <input name="photos" type="file" multiple />
      </form>
    </div>
  )
}
