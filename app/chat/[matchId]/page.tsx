'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Flag, Mic, Square, Send, X, Play, Pause, Smile, Sparkles, ImageIcon, Camera, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioRecorder, formatDuration, useTypingIndicator } from '@/hooks'
import { useChatStream, type ChatMessage } from '@/hooks/useChatStream'
import { TypingBubble } from '@/components/ui'
import { useUploadThing } from '@/utils/uploadthing'

// Lazy load heavy chat components (only needed when user interacts)
const IcebreakersPanel = dynamic(() => import('@/components/chat/IcebreakersPanel').then(mod => ({ default: mod.IcebreakersPanel })), {
  ssr: false,
  loading: () => null
})

const GifPicker = dynamic(() => import('@/components/chat/GifPicker').then(mod => ({ default: mod.GifPicker })), {
  ssr: false,
  loading: () => null
})

// Message type is now imported from useChatStream as ChatMessage

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reporting, setReporting] = useState(false)
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; profileImage?: string; isOnline?: boolean } | null>(null)
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [showIcebreakers, setShowIcebreakers] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Common emojis for quick access
  const commonEmojis = ['😊', '❤️', '😂', '👍', '🔥', '😍', '🎉', '💯', '😘', '🥰', '😎', '🙌']

  // File upload handlers
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    await uploadChatImage(fileArray)

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    await uploadChatVideo(fileArray)

    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  // Audio recorder hook
  const {
    isRecording,
    duration,
    audioUrl: recordedAudioUrl,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    resetRecording,
    isPlaying: isPlayingRecorded,
  } = useAudioRecorder({ maxDuration: 60 })

  // Typing indicator
  const { isTyping: otherUserTyping, handleTyping, handleStopTyping } = useTypingIndicator(matchId)

  // UploadThing hook for audio uploads
  const { startUpload: uploadVoiceMessage, isUploading: isUploadingVoice } = useUploadThing('voiceMessage', {
    onClientUploadComplete: (res) => {
      console.log('Audio upload success:', res)
    },
    onUploadError: (error: Error) => {
      console.error('Audio upload error:', error)
      alert('Kon spraakbericht niet uploaden: ' + error.message)
    },
  })

  // UploadThing hook for image uploads
  const { startUpload: uploadChatImage, isUploading: isUploadingImage } = useUploadThing('chatImage', {
    onClientUploadComplete: async (res) => {
      console.log('Image upload success:', res)
      // Send message for each uploaded image
      for (const file of res) {
        await sendImageMessage(file.url)
      }
    },
    onUploadError: (error: Error) => {
      console.error('Image upload error:', error)
      alert('Kon foto niet uploaden: ' + error.message)
    },
  })

  // UploadThing hook for video uploads
  const { startUpload: uploadChatVideo, isUploading: isUploadingVideo } = useUploadThing('chatVideo', {
    onClientUploadComplete: async (res) => {
      console.log('Video upload success:', res)
      if (res[0]) {
        await sendVideoMessage(res[0].url)
      }
    },
    onUploadError: (error: Error) => {
      console.error('Video upload error:', error)
      alert('Kon video niet uploaden: ' + error.message)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchMessages()
  }, [session, status, router, matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time messages via Server-Sent Events (replaces polling)
  const handleNewMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(prev => {
      // Merge new messages, avoiding duplicates
      const existingIds = new Set(prev.map(m => m.id))
      const uniqueNew = newMessages.filter(m => !existingIds.has(m.id))
      if (uniqueNew.length === 0) return prev
      return [...prev, ...uniqueNew]
    })
  }, [])

  const handleReadReceipts = useCallback((messageIds: string[]) => {
    setMessages(prev =>
      prev.map(msg =>
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      )
    )
  }, [])

  const { isConnected, connectionStatus, reconnect } = useChatStream({
    matchId,
    enabled: !!session && !loading,
    onMessage: handleNewMessages,
    onReadReceipt: handleReadReceipts,
    onError: (error) => console.error('[Chat] SSE error:', error),
  })

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`)
      if (res.ok) {
        const data = await res.json()
        // Filter out any undefined/null messages
        const validMessages = (data.messages || []).filter((msg: ChatMessage) => msg && msg.id)
        setMessages(validMessages)

        // Get the other user from API response
        if (data.otherUser) {
          setOtherUser({
            id: data.otherUser.id,
            name: data.otherUser.name,
            profileImage: data.otherUser.profileImage,
            isOnline: data.otherUser.isOnline,
          })
        }
      } else if (res.status === 404) {
        router.push('/matches')
      } else {
        console.error('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, content: newMessage.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        // Fetch again to get updated list (though polling will handle it)
        fetchMessages()
      } else {
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const sendAudioMessage = useCallback(async () => {
    if (!audioBlob || uploadingAudio || isUploadingVoice) return

    setUploadingAudio(true)
    try {
      // Create a File from the Blob
      const extension = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : 'ogg'
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.${extension}`, {
        type: audioBlob.type,
      })

      // Upload using uploadthing hook
      const uploadResult = await uploadVoiceMessage([audioFile])

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Upload failed - no result')
      }

      const audioUrl = uploadResult[0].url

      if (!audioUrl) {
        throw new Error('No URL returned from upload')
      }

      // Then send the message with the audio URL
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, audioUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        resetRecording()
        setIsRecordingMode(false)
        fetchMessages()
      } else {
        console.error('Failed to send audio message')
        alert('Kon spraakbericht niet versturen')
      }
    } catch (error) {
      console.error('Failed to send audio message:', error)
      alert('Kon spraakbericht niet versturen: ' + (error instanceof Error ? error.message : 'Onbekende fout'))
    } finally {
      setUploadingAudio(false)
    }
  }, [audioBlob, uploadingAudio, isUploadingVoice, matchId, resetRecording, uploadVoiceMessage])

  const cancelRecording = useCallback(() => {
    resetRecording()
    setIsRecordingMode(false)
  }, [resetRecording])

  const sendGifMessage = async (gifUrl: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, gifUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to send GIF:', error)
    }
  }

  const sendImageMessage = async (imageUrl: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, imageUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to send image message:', error)
    }
  }

  const sendVideoMessage = async (videoUrl: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, videoUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to send video message:', error)
    }
  }

  const handleIcebreakerSelect = (message: string) => {
    setNewMessage(message)
    setShowIcebreakers(false)
  }

  const handleReport = () => {
    setShowReportModal(true)
  }

  const submitReport = async () => {
    if (!otherUser || !reportReason) return

    setReporting(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: otherUser.id,
          reason: reportReason,
          description: reportDescription,
        }),
      })

      if (res.ok) {
        alert('Report submitted successfully')
        setShowReportModal(false)
        setReportReason('')
        setReportDescription('')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit report')
      }
    } catch (error) {
      alert('Failed to submit report')
    } finally {
      setReporting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.div
            className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.p
            className="mt-4 text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Chat laden...
          </motion.p>
        </div>
      </motion.div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col lg:ml-64"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header - Wereldklasse Design */}
      <motion.div
        className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Back button + User info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href="/matches"
                className="text-gray-600 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                aria-label="Terug naar matches"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </motion.div>

            {otherUser && (
              <motion.div
                className="flex items-center gap-3 flex-1 min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Profile Image with Online Indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 ring-2 ring-white shadow-md">
                    {otherUser.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-pink-600">
                        {otherUser.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Online Status Indicator */}
                  {otherUser.isOnline && (
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    />
                  )}
                </div>

                {/* User Name + Status */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {otherUser.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {otherUser.isOnline ? (
                      <span className="text-green-600 font-medium">● Online</span>
                    ) : (
                      <span>Offline</span>
                    )}
                    {/* Real-time connection status */}
                    {connectionStatus === 'connected' ? (
                      <span className="flex items-center gap-1 text-green-600" title="Real-time verbinding actief">
                        <Wifi size={12} />
                      </span>
                    ) : connectionStatus === 'connecting' ? (
                      <span className="flex items-center gap-1 text-yellow-600 animate-pulse" title="Verbinden...">
                        <Wifi size={12} />
                      </span>
                    ) : (
                      <button
                        onClick={reconnect}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                        title="Verbinding verbroken - klik om opnieuw te verbinden"
                      >
                        <WifiOff size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Report button */}
          {otherUser && (
            <motion.button
              onClick={handleReport}
              className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors ml-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Rapporteer gebruiker"
            >
              <Flag size={20} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Messages - Wereldklasse Design */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-24 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">Nog geen berichten</p>
            <p className="text-sm text-gray-500">Begin het gesprek met {otherUser?.name}!</p>
          </motion.div>
        ) : (
          messages.filter(msg => msg && msg.id).map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex items-end gap-2 ${message.isFromMe ? 'flex-row-reverse' : 'flex-row'}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              {/* Avatar - alleen voor andere gebruiker */}
              {!message.isFromMe && (
                <div className="flex-shrink-0 w-8 h-8 mb-1">
                  {otherUser?.profileImage ? (
                    <img
                      src={otherUser.profileImage}
                      alt={otherUser.name}
                      className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-sm font-bold text-pink-600 ring-2 ring-white shadow-sm">
                      {otherUser?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <motion.div
                className={`max-w-[75%] sm:max-w-md ${message.isFromMe ? 'items-end' : 'items-start'} flex flex-col`}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div
                  className={`rounded-2xl shadow-sm ${
                    message.isFromMe
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                  } ${message.audioUrl ? 'p-0' : 'px-4 py-2.5'}`}
                >
                  {message.content && (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words px-4 py-2.5">
                      {message.content}
                    </p>
                  )}
                  {message.gifUrl && (
                    <div className="rounded-xl overflow-hidden">
                      <img
                        src={message.gifUrl}
                        alt="GIF"
                        className="max-w-full h-auto rounded-xl"
                        style={{ maxHeight: '240px' }}
                      />
                    </div>
                  )}
                  {message.imageUrl && (
                    <div className="rounded-xl overflow-hidden cursor-pointer group relative">
                      <img
                        src={message.imageUrl}
                        alt="Foto"
                        className="max-w-full h-auto rounded-xl transition-transform group-hover:scale-105"
                        style={{ maxHeight: '320px', minWidth: '200px' }}
                        onClick={() => setSelectedImage(message.imageUrl || null)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                        <motion.div
                          className="opacity-0 group-hover:opacity-100"
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1 }}
                        >
                          <div className="bg-white/90 rounded-full p-2">
                            <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}
                  {message.videoUrl && (
                    <div className="rounded-xl overflow-hidden">
                      <video
                        src={message.videoUrl}
                        controls
                        className="max-w-full h-auto rounded-xl"
                        style={{ maxHeight: '320px', minWidth: '200px' }}
                        preload="metadata"
                      />
                    </div>
                  )}
                  {message.audioUrl && (
                    <div className={`flex items-center gap-3 p-3 ${message.isFromMe ? '' : 'bg-gray-50'} rounded-2xl`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        message.isFromMe ? 'bg-white/20' : 'bg-pink-100'
                      }`}>
                        <svg
                          className={`w-5 h-5 ${message.isFromMe ? 'text-white' : 'text-pink-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4zm6 0a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2V4h2z"/>
                          <path d="M3 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <audio
                          controls
                          src={message.audioUrl}
                          className="w-full"
                          controlsList="nodownload"
                          preload="metadata"
                          style={{
                            height: '40px',
                            maxWidth: '280px'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp + Read status */}
                <div
                  className={`flex items-center gap-1.5 mt-1 px-2 ${
                    message.isFromMe ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(message.createdAt).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.isFromMe && (
                    <span
                      className={`flex items-center transition-colors ${
                        message.read ? 'text-blue-500' : 'text-gray-400'
                      }`}
                      title={message.read ? 'Gelezen' : 'Verzonden'}
                    >
                      {message.read ? (
                        // Double checkmark for read (blue)
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                        </svg>
                      ) : (
                        // Single checkmark for sent (gray)
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Spacer voor eigen berichten (zodat ze niet tegen de rand aan zitten) */}
              {message.isFromMe && <div className="w-8" />}
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {otherUserTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypingBubble />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed to bottom, above mobile nav - WERELDKLASSE */}
      <motion.div
        className="bg-white border-t border-gray-200 mb-16 sm:mb-0 sticky bottom-0 z-20 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Emoji Picker Panel */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              className="border-b border-gray-200 bg-gray-50 px-4 py-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Kies een emoji</span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    onClick={() => {
                      setNewMessage(prev => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="text-2xl hover:bg-white rounded-lg p-2 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-3">
          <AnimatePresence mode="wait">
            {isRecordingMode ? (
            // Audio recording mode - WERELDKLASSE
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {!recordedAudioUrl ? (
                // Recording in progress
                <>
                  <motion.button
                    onClick={cancelRecording}
                    className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={22} />
                  </motion.button>

                  <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl px-4 py-3.5 border border-red-200 min-w-0">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                    <span className="text-red-600 font-bold text-sm whitespace-nowrap">
                      {formatDuration(duration)} / 1:00
                    </span>
                    <div className="flex-1 flex items-center justify-center gap-1 min-w-0 px-2">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-red-400 rounded-full flex-shrink-0"
                          animate={{ height: [6, Math.random() * 20 + 6, 6] }}
                          transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.03 }}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={stopRecording}
                    className="p-3.5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-200 flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square size={20} fill="white" />
                  </motion.button>
                </>
              ) : (
                // Recording complete - preview
                <>
                  <motion.button
                    onClick={cancelRecording}
                    className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={22} />
                  </motion.button>

                  <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl px-4 py-3 border border-pink-200">
                    <motion.button
                      onClick={isPlayingRecorded ? stopAudio : playAudio}
                      className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlayingRecorded ? <Pause size={18} /> : <Play size={18} />}
                    </motion.button>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Spraakbericht</p>
                      <p className="text-sm text-pink-600 font-bold">{formatDuration(duration)}</p>
                    </div>
                  </div>

                  <motion.button
                    onClick={sendAudioMessage}
                    disabled={uploadingAudio || isUploadingVoice}
                    className="p-3.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-200 flex-shrink-0"
                    whileHover={!uploadingAudio && !isUploadingVoice ? { scale: 1.05 } : {}}
                    whileTap={!uploadingAudio && !isUploadingVoice ? { scale: 0.95 } : {}}
                  >
                    {uploadingAudio || isUploadingVoice ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </>
              )}
            </motion.div>
          ) : (
              // Normal text input mode - WERELDKLASSE
              <motion.form
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={sendMessage}
                className="flex items-end gap-2"
              >
                {/* Left buttons group */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Icebreakers button - show when no messages */}
                  {messages.length === 0 && (
                    <motion.button
                      type="button"
                      onClick={() => setShowIcebreakers(true)}
                      className="p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Gespreksstart"
                    >
                      <Sparkles size={20} />
                    </motion.button>
                  )}

                  {/* Emoji button */}
                  <motion.button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2.5 rounded-xl transition-all ${
                      showEmojiPicker
                        ? 'text-yellow-600 bg-yellow-50'
                        : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Emoji toevoegen"
                  >
                    <Smile size={20} />
                  </motion.button>

                  {/* Camera/Image button */}
                  <motion.button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Foto versturen"
                  >
                    {isUploadingImage ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    ) : (
                      <Camera size={20} />
                    )}
                  </motion.button>

                  {/* GIF button */}
                  <motion.button
                    type="button"
                    onClick={() => setShowGifPicker(true)}
                    className="p-2.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="GIF versturen"
                  >
                    <ImageIcon size={20} />
                  </motion.button>

                  {/* Mic button */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsRecordingMode(true)
                      startRecording()
                    }}
                    className="p-2.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Spraakbericht opnemen"
                  >
                    <Mic size={20} />
                  </motion.button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />

                {/* Text input */}
                <div className="flex-1 relative">
                  <motion.input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      if (e.target.value) {
                        handleTyping()
                      } else {
                        handleStopTyping()
                      }
                    }}
                    onBlur={handleStopTyping}
                    placeholder="Typ een bericht..."
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-base resize-none bg-gray-50 hover:bg-white"
                    disabled={sending}
                    whileFocus={{ scale: 1.005 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                {/* Send button */}
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`p-3.5 rounded-2xl transition-all shadow-md flex-shrink-0 ${
                    newMessage.trim() && !sending
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-pink-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
                  whileTap={newMessage.trim() && !sending ? { scale: 0.95 } : {}}
                >
                  {sending ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {recordingError && (
            <motion.p
              className="mt-2 text-sm text-red-500 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <X size={16} />
              {recordingError}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Icebreakers Panel */}
      <AnimatePresence>
        {showIcebreakers && otherUser && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIcebreakers(false)}
          >
            <motion.div
              className="w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <IcebreakersPanel
                otherUserName={otherUser.name}
                onSelect={handleIcebreakerSelect}
                onClose={() => setShowIcebreakers(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GIF Picker Panel */}
      <AnimatePresence>
        {showGifPicker && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGifPicker(false)}
          >
            <motion.div
              className="w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <GifPicker
                onSelect={sendGifMessage}
                onClose={() => setShowGifPicker(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full screen"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && otherUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
            <h3 className="text-lg font-bold mb-4">Rapporteer {otherUser.name}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reden voor melding *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Selecteer een reden</option>
                  <option value="harassment">Intimidatie</option>
                  <option value="inappropriate_content">Ongepaste inhoud</option>
                  <option value="spam">Spam</option>
                  <option value="fake_profile">Nepprofiel</option>
                  <option value="other">Anders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschrijving (optioneel)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Voeg extra details toe..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason('')
                  setReportDescription('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason || reporting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reporting ? 'Verzenden...' : 'Rapporteer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  )
}