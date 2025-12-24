/**
 * Chatbot Component
 *
 * AI-powered support chatbot with FAQ suggestions and ticket escalation
 * Floating widget in bottom-right corner
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { TypingBubble } from '@/components/ui/TypingIndicator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  suggestedArticles?: FAQArticle[]
}

interface FAQArticle {
  id: string
  titleNl: string
  slug: string
  excerpt?: string
  category: {
    nameNl: string
    icon?: string
  }
}

interface ChatbotProps {
  /** Optional className for positioning */
  className?: string
}

export function Chatbot({ className = '' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canEscalate, setCanEscalate] = useState(false)
  const [showEscalateForm, setShowEscalateForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date()
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Er ging iets mis')
      }

      // Update conversation ID if new conversation
      if (data.data.conversationId && !conversationId) {
        setConversationId(data.data.conversationId)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: data.data.message.id,
        role: 'assistant',
        content: data.data.message.content,
        createdAt: new Date(data.data.message.createdAt),
        suggestedArticles: data.data.suggestedArticles || []
      }

      setMessages(prev => [...prev, assistantMessage])
      setCanEscalate(data.data.canEscalate || false)
    } catch (error: any) {
      console.error('Chatbot error:', error)

      // Show error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, er ging iets mis. Probeer het opnieuw of maak een support ticket aan.',
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscalate = () => {
    setShowEscalateForm(true)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-4 shadow-lg transition-colors ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open support chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Unread indicator badge */}
        {!isOpen && messages.length === 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Support Assistent</h3>
                  <p className="text-xs text-white/80">Altijd online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Sluiten"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Hoe kan ik je helpen?</h4>
                  <p className="text-sm text-gray-500 mb-4">Stel gerust je vraag, ik help je graag verder!</p>

                  {/* Quick action buttons */}
                  <div className="flex flex-col gap-2 mt-6">
                    <button
                      onClick={() => setInputValue('Hoe kan ik mijn profiel verifiëren?')}
                      className="text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm shadow-sm"
                    >
                      💡 Hoe kan ik mijn profiel verifiëren?
                    </button>
                    <button
                      onClick={() => setInputValue('Ik zie mijn berichten niet')}
                      className="text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm shadow-sm"
                    >
                      💬 Ik zie mijn berichten niet
                    </button>
                    <button
                      onClick={() => setInputValue('Hoe werkt het matching algoritme?')}
                      className="text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm shadow-sm"
                    >
                      ❤️ Hoe werkt het matching algoritme?
                    </button>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={message.id}>
                  {/* Message Bubble */}
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-rose-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* FAQ Article Suggestions */}
                  {message.role === 'assistant' && message.suggestedArticles && message.suggestedArticles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500 font-medium px-1">Gerelateerde artikelen:</p>
                      {message.suggestedArticles.map((article) => (
                        <a
                          key={article.id}
                          href={`/support/faq/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-start gap-2">
                            {article.category.icon && (
                              <span className="text-lg">{article.category.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 line-clamp-1">{article.titleNl}</p>
                              {article.excerpt && (
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{article.excerpt}</p>
                              )}
                              <span className="text-xs text-rose-500 mt-1 inline-flex items-center gap-1">
                                Lees meer
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <TypingBubble />
                </div>
              )}

              {/* Escalation Button */}
              {canEscalate && !showEscalateForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <p className="text-sm text-blue-900 mb-2">Kan ik je niet goed helpen? Stuur je vraag door naar ons support team.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleEscalate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Maak support ticket aan
                  </Button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Typ je vraag..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                  aria-label="Verstuur bericht"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Aangedreven door AI • Reactietijd binnen enkele seconden
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
