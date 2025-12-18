'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Flag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
            Loading chat...
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
              ← Back
            </Link>
          </motion.div>
          <motion.h1
            className="text-xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Chat {otherUser ? `with ${otherUser.name}` : ''}
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
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
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
                <p className={`text-xs mt-1 ${message.isFromMe ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                  {message.isFromMe && message.read && ' ✓'}
                </p>
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
        <form onSubmit={sendMessage} className="flex space-x-2">
          <motion.input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {sending ? 'Sending...' : 'Send'}
          </motion.button>
        </form>
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
            <h3 className="text-lg font-bold mb-4">Report {otherUser.name}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for report *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Provide additional details..."
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
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason || reporting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reporting ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  )
}