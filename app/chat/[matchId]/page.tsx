'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Flag, Mic, Square, Send, X, Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioRecorder, formatDuration } from '@/hooks'

interface Message {
  id: string
  content?: string
  audioUrl?: string
  read: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    profileImage?: string
  }
  isFromMe: boolean
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reporting, setReporting] = useState(false)
  const [otherUser, setOtherUser] = useState<{ id: string; name: string } | null>(null)
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!session || !matchId) return

    const interval = setInterval(() => {
      fetchMessages()
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [session, matchId])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`)
      if (res.ok) {
        const data = await res.json()
        // Filter out any undefined/null messages
        const validMessages = (data.messages || []).filter((msg: Message) => msg && msg.id)
        setMessages(validMessages)

        // Get the other user from the first message
        if (validMessages.length > 0) {
          const otherUserFromMessage = validMessages.find((msg: Message) => !msg.isFromMe)?.sender
          if (otherUserFromMessage) {
            setOtherUser({ id: otherUserFromMessage.id, name: otherUserFromMessage.name })
          }
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
    if (!audioBlob || uploadingAudio) return

    setUploadingAudio(true)
    try {
      // First upload the audio file
      const formData = new FormData()
      const extension = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : 'ogg'
      formData.append('files', audioBlob, `voice-message.${extension}`)

      const uploadRes = await fetch('/api/uploadthing?slug=voiceMessage', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadRes.json()
      const audioUrl = uploadData[0]?.url || uploadData.url

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
      alert('Kon spraakbericht niet versturen')
    } finally {
      setUploadingAudio(false)
    }
  }, [audioBlob, uploadingAudio, matchId, resetRecording])

  const cancelRecording = useCallback(() => {
    resetRecording()
    setIsRecordingMode(false)
  }, [resetRecording])

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
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="bg-white shadow-sm p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link
              href="/matches"
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ← Terug
            </Link>
          </motion.div>
          <motion.h1
            className="text-xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Chat {otherUser ? `met ${otherUser.name}` : ''}
          </motion.h1>
        </div>

        {otherUser && (
          <button
            onClick={handleReport}
            className="text-red-500 hover:text-red-700 p-2"
            title="Report user"
          >
            <Flag size={20} />
          </button>
        )}
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nog geen berichten. Begin het gesprek!</p>
          </div>
        ) : (
          messages.filter(msg => msg && msg.id).map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <motion.div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isFromMe
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {message.content && <p>{message.content}</p>}
                {message.audioUrl && (
                  <div className="mt-2">
                    <audio controls src={message.audioUrl} className="w-full" />
                  </div>
                )}
                <div className={`flex items-center gap-1 text-xs mt-1 ${message.isFromMe ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                  <span>{new Date(message.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
                  {message.isFromMe && (
                    <span className={`flex items-center ${message.read ? 'text-blue-300' : ''}`} title={message.read ? 'Gelezen' : 'Verzonden'}>
                      {message.read ? (
                        // Double checkmark for read
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                        </svg>
                      ) : (
                        // Single checkmark for sent
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        className="bg-white border-t p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isRecordingMode ? (
            // Audio recording mode
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3"
            >
              {!recordedAudioUrl ? (
                // Recording in progress
                <>
                  <motion.button
                    onClick={cancelRecording}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <X size={24} />
                  </motion.button>

                  <div className="flex-1 flex items-center gap-3 bg-red-50 rounded-lg px-4 py-2">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-red-600 font-medium">
                      {formatDuration(duration)} / 1:00
                    </span>
                    <div className="flex-1 flex items-center justify-center gap-0.5">
                      {[...Array(15)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-red-400 rounded-full"
                          animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                          transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.02 }}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={stopRecording}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square size={20} />
                  </motion.button>
                </>
              ) : (
                // Recording complete - preview
                <>
                  <motion.button
                    onClick={cancelRecording}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <X size={24} />
                  </motion.button>

                  <div className="flex-1 flex items-center gap-3 bg-primary-50 rounded-lg px-4 py-2">
                    <motion.button
                      onClick={isPlayingRecorded ? stopAudio : playAudio}
                      className="p-2 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200"
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlayingRecorded ? <Pause size={16} /> : <Play size={16} />}
                    </motion.button>
                    <span className="text-primary-600 font-medium">
                      Spraakbericht ({formatDuration(duration)})
                    </span>
                  </div>

                  <motion.button
                    onClick={sendAudioMessage}
                    disabled={uploadingAudio}
                    className="p-3 bg-primary text-white rounded-full hover:bg-primary-600 disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {uploadingAudio ? (
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
            // Normal text input mode
            <motion.form
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={sendMessage}
              className="flex items-center gap-2"
            >
              <motion.button
                type="button"
                onClick={() => {
                  setIsRecordingMode(true)
                  startRecording()
                }}
                className="p-3 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-full transition-colors"
                whileTap={{ scale: 0.95 }}
                title="Spraakbericht opnemen"
              >
                <Mic size={22} />
              </motion.button>

              <motion.input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Typ een bericht..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={sending}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />

              <motion.button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {recordingError && (
          <p className="mt-2 text-sm text-red-500">{recordingError}</p>
        )}
      </motion.div>

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