/**
 * Icebreakers Panel - Conversation starters (WERELDKLASSE - Personalized!)
 *
 * Shows personalized questions based on:
 * - Shared interests
 * - Personality compatibility
 * - Love languages
 * - Location
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  MessageCircle,
  Heart,
  Smile,
  Coffee,
  Music,
  Film,
  Plane,
  ChevronRight,
  RefreshCw,
  Loader2,
  Zap,
} from 'lucide-react'

interface PersonalizedStarter {
  emoji: string
  text: string
  reason: string
  category: 'shared_interest' | 'personality' | 'love_language' | 'location' | 'generic'
}

interface IcebreakersPanelProps {
  matchId?: string // NEW: For fetching personalized starters
  otherUserName: string
  onSelect: (message: string) => void
  onClose: () => void
}

const ICEBREAKER_CATEGORIES = [
  {
    id: 'fun',
    name: 'Leuke vragen',
    icon: Smile,
    color: 'from-yellow-400 to-orange-500',
    questions: [
      'Als je één superkracht kon hebben, welke zou dat zijn?',
      'Wat is het gekste dat je ooit hebt gedaan?',
      'Wat zou je doen als je 1 miljoen euro won?',
      'Als je een dier kon zijn voor een dag, welke zou je kiezen?',
      'Wat is je guilty pleasure?',
      'Heb je een verborgen talent?',
    ],
  },
  {
    id: 'deep',
    name: 'Dieper kennen',
    icon: Heart,
    color: 'from-rose-400 to-rose-600',
    questions: [
      'Wat maakt je het gelukkigst in het leven?',
      'Waar droom je van?',
      'Wat is de beste les die je ooit hebt geleerd?',
      'Welke eigenschap waardeer je het meest in andere mensen?',
      'Wat zou je veranderen aan de wereld als je kon?',
      'Wat is je favoriete herinnering?',
    ],
  },
  {
    id: 'travel',
    name: 'Reizen',
    icon: Plane,
    color: 'from-blue-400 to-indigo-600',
    questions: [
      'Wat is de mooiste plek waar je ooit bent geweest?',
      'Welk land staat nog op je bucket list?',
      'Ben je meer van de bergen of het strand?',
      'Wat is je favoriete vakantieherinnering?',
      'Reis je liever alleen of met gezelschap?',
      'Wat pak je altijd in voor op reis?',
    ],
  },
  {
    id: 'food',
    name: 'Eten & Drinken',
    icon: Coffee,
    color: 'from-amber-400 to-orange-600',
    questions: [
      'Wat is je favoriete gerecht om te maken?',
      'Koffie of thee?',
      'Wat is je go-to comfort food?',
      'Welk restaurant zou je me aanraden?',
      'Kook je graag of bestel je liever?',
      'Wat is het lekkerste dat je ooit hebt gegeten?',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Film,
    color: 'from-purple-400 to-purple-600',
    questions: [
      'Wat is je favoriete film aller tijden?',
      'Welke serie ben je nu aan het bingen?',
      'Wat voor muziek luister je het meest?',
      'Boek of Netflix?',
      'Wat is je favoriete podcast?',
      'Welk concert wil je nog zien?',
    ],
  },
]

const QUICK_STARTERS = [
  { emoji: '👋', text: 'Hey! Hoe gaat het met je?' },
  { emoji: '😊', text: 'Leuk je te matchen!' },
  { emoji: '🌟', text: 'Je profiel viel me meteen op!' },
  { emoji: '☕', text: 'Zin om een keer koffie te drinken?' },
  { emoji: '🎵', text: 'Ik zie dat je van muziek houdt, wat luister je nu?' },
]

export function IcebreakersPanel({ matchId, otherUserName, onSelect, onClose }: IcebreakersPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [personalizedStarters, setPersonalizedStarters] = useState<PersonalizedStarter[]>([])
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false)
  const [hasPersonalized, setHasPersonalized] = useState(false)

  // Fetch personalized starters when matchId is provided
  useEffect(() => {
    if (!matchId) return

    const fetchPersonalized = async () => {
      setIsLoadingPersonalized(true)
      try {
        const res = await fetch(`/api/matches/${matchId}/starters`)
        if (res.ok) {
          const data = await res.json()
          setPersonalizedStarters(data.starters || [])
          setHasPersonalized(data.hasPersonalized || false)
        }
      } catch (error) {
        console.error('Error fetching personalized starters:', error)
      } finally {
        setIsLoadingPersonalized(false)
      }
    }

    fetchPersonalized()
  }, [matchId])

  const handleSelectQuestion = (question: string) => {
    onSelect(question)
    onClose()
  }

  const handleQuickStart = (text: string) => {
    onSelect(text)
    onClose()
  }

  const shuffleQuestions = () => {
    setRefreshKey((k) => k + 1)
  }

  const getRandomQuestions = (questions: string[], count: number) => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Get category color for personalized starters
  const getCategoryColor = (category: PersonalizedStarter['category']) => {
    switch (category) {
      case 'shared_interest':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700'
      case 'personality':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'love_language':
        return 'bg-rose-50 border-rose-200 text-rose-700'
      case 'location':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-t-3xl shadow-xl p-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900">Gespreksstart</h3>
          {hasPersonalized && (
            <span className="flex items-center gap-1 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" />
              Gepersonaliseerd
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Sluiten
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Personalized Starters (NEW - shown first!) */}
            {matchId && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-500" />
                  Voor jou en {otherUserName}
                </p>
                {isLoadingPersonalized ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                  </div>
                ) : personalizedStarters.length > 0 ? (
                  <div className="space-y-2">
                    {personalizedStarters.slice(0, 4).map((starter, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleQuickStart(starter.text)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${getCategoryColor(
                          starter.category
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{starter.emoji}</span>
                          <div className="flex-1">
                            <span className="block text-gray-800">{starter.text}</span>
                            {starter.category !== 'generic' && (
                              <span className="text-xs opacity-70 mt-1 block">
                                {starter.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  // Fallback to quick starters
                  <div className="flex flex-wrap gap-2">
                    {QUICK_STARTERS.map((starter, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickStart(starter.text)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition-colors"
                      >
                        <span>{starter.emoji}</span>
                        <span className="truncate max-w-[150px]">{starter.text}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Starters (only show if no matchId) */}
            {!matchId && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">Snel starten</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_STARTERS.map((starter, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickStart(starter.text)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition-colors"
                    >
                      <span>{starter.emoji}</span>
                      <span className="truncate max-w-[150px]">{starter.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <p className="text-sm text-gray-500 mb-3">Of kies een categorie</p>
            <div className="grid grid-cols-2 gap-3">
              {ICEBREAKER_CATEGORIES.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left text-white bg-gradient-to-br ${category.color}`}
                >
                  <category.icon className="w-6 h-6 mb-2" />
                  <span className="font-semibold">{category.name}</span>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4 text-sm"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Terug naar categorieën
            </button>

            {/* Questions */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                Kies een vraag voor {otherUserName}
              </p>
              <button
                onClick={shuffleQuestions}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-sm"
              >
                <RefreshCw size={14} />
                Shuffle
              </button>
            </div>

            <div className="space-y-2" key={refreshKey}>
              {getRandomQuestions(
                ICEBREAKER_CATEGORIES.find((c) => c.id === selectedCategory)?.questions || [],
                4
              ).map((question, index) => (
                <motion.button
                  key={question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectQuestion(question)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-rose-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 group-hover:text-gray-900">
                      {question}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default IcebreakersPanel
