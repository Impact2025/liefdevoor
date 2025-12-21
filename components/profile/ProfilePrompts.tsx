/**
 * Profile Prompts Component
 *
 * Hinge-style Q&A for profiles - allows users to add personality through prompts
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  MessageCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

interface Prompt {
  id: string
  question: string
  answer: string
  order: number
}

export function ProfilePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [availablePrompts, setAvailablePrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [maxPrompts, setMaxPrompts] = useState(3)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/profile-prompts')
      const data = await res.json()
      if (res.ok) {
        setPrompts(data.prompts || [])
        setAvailablePrompts(data.availablePrompts || [])
        setMaxPrompts(data.maxPrompts || 3)
      }
    } catch (err) {
      console.error('Error fetching prompts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPrompt = async () => {
    if (!selectedQuestion || !answer.trim()) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/profile-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: selectedQuestion, answer: answer.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setPrompts([...prompts, data.prompt])
        setShowAddModal(false)
        setSelectedQuestion(null)
        setAnswer('')
      }
    } catch (err) {
      console.error('Error adding prompt:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePrompt = async () => {
    if (!editingPrompt || !answer.trim()) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/profile-prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setPrompts(prompts.map((p) => (p.id === data.prompt.id ? data.prompt : p)))
        setEditingPrompt(null)
        setAnswer('')
      }
    } catch (err) {
      console.error('Error updating prompt:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze prompt wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/profile-prompts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPrompts(prompts.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error('Error deleting prompt:', err)
    }
  }

  const usedQuestions = prompts.map((p) => p.question)
  const unusedPrompts = availablePrompts.filter((q) => !usedQuestions.includes(q))

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900">Prompts</h3>
          <span className="text-sm text-gray-500">
            ({prompts.length}/{maxPrompts})
          </span>
        </div>
        {prompts.length < maxPrompts && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
          >
            <Plus size={16} />
            Toevoegen
          </button>
        )}
      </div>

      {/* Existing Prompts */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {prompts.map((prompt) => (
            <motion.div
              key={prompt.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-rose-600 mb-2">
                {prompt.question}
              </p>
              <p className="text-gray-800">{prompt.answer}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingPrompt(prompt)
                    setAnswer(prompt.answer)
                  }}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
                >
                  <Edit3 size={14} />
                  Bewerken
                </button>
                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm"
                >
                  <Trash2 size={14} />
                  Verwijderen
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {prompts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 bg-gray-50 rounded-xl"
          >
            <Sparkles className="w-12 h-12 mx-auto text-rose-300 mb-3" />
            <p className="text-gray-600 mb-4">
              Voeg prompts toe om je persoonlijkheid te laten zien!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
            >
              Eerste prompt toevoegen
            </button>
          </motion.div>
        )}
      </div>

      {/* Add Prompt Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden"
            >
              {!selectedQuestion ? (
                // Step 1: Choose prompt
                <>
                  <div className="sticky top-0 bg-white p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Kies een prompt</h3>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
                    {unusedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setSelectedQuestion(prompt)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-rose-50 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 group-hover:text-rose-600">
                            {prompt}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                // Step 2: Write answer
                <>
                  <div className="sticky top-0 bg-white p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setSelectedQuestion(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ← Terug
                      </button>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-lg font-medium text-rose-600">{selectedQuestion}</p>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Schrijf je antwoord..."
                      maxLength={500}
                      rows={4}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span>{answer.length}/500</span>
                    </div>
                    <button
                      onClick={handleAddPrompt}
                      disabled={!answer.trim() || isSaving}
                      className="w-full mt-4 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        'Opslaan...'
                      ) : (
                        <>
                          <Check size={18} />
                          Opslaan
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Prompt Modal */}
      <AnimatePresence>
        {editingPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setEditingPrompt(null)
              setAnswer('')
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bewerk antwoord</h3>
              <p className="text-rose-600 mb-4">{editingPrompt.question}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500 mb-4">
                <span>{answer.length}/500</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingPrompt(null)
                    setAnswer('')
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleUpdatePrompt}
                  disabled={!answer.trim() || isSaving}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50"
                >
                  {isSaving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfilePrompts
