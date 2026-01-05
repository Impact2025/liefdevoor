'use client'

import { useState } from 'react'
import { Search, Loader2, ArrowLeft, Lightbulb, TrendingUp, Target, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface KeywordSuggestion {
  keyword: string
  searchVolume: string
  competition: string
  difficulty: number
  opportunity: number
  reason: string
}

interface ContentIdea {
  title: string
  format: string
  targetKeywords: string[]
  estimatedWords: number
  priority: string
}

export default function KeywordResearchPage() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleResearch = async () => {
    if (!topic.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/blog/assistant/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      const data = await res.json()
      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('Keyword research failed:', error)
      alert('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-100 text-green-700 border-green-200'
    if (difficulty < 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const getOpportunityColor = (opportunity: number) => {
    if (opportunity >= 80) return 'bg-green-100 text-green-700'
    if (opportunity >= 50) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog/assistant"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Assistant
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Keyword Research
          </h1>
          <p className="text-gray-600">
            Vind de beste keywords voor je blog post in seconden
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Topic / Onderwerp
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              placeholder="Bijv: eerste date, ghosting, tinder tips, etc."
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              disabled={loading}
            />
            <button
              onClick={handleResearch}
              disabled={loading || !topic.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Research
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Populair:</span>
            {['eerste date', 'ghosting', 'tinder tips', 'red flags', 'online dating'].map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Primary Keywords */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Primary Keywords</h2>
                  <p className="text-sm text-gray-600">Hoog volume, competitief - gebruik in title & H1</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.primaryKeywords?.map((kw: KeywordSuggestion, idx: number) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{kw.keyword}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getOpportunityColor(kw.opportunity)}`}>
                        {kw.opportunity}% opportunity
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-sm font-semibold text-gray-900">{kw.searchVolume}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Competition</p>
                        <p className="text-sm font-semibold text-gray-900">{kw.competition}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Difficulty</p>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(kw.difficulty)}`}>
                          {kw.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 italic">{kw.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Keywords */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Secondary Keywords</h2>
                  <p className="text-sm text-gray-600">Specifiek, lagere competitie - gebruik in H2/H3</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {results.secondaryKeywords?.slice(0, 8).map((kw: KeywordSuggestion, idx: number) => (
                  <div
                    key={idx}
                    className="bg-pink-50 border-2 border-pink-100 rounded-xl px-4 py-3 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    <p className="font-semibold text-gray-900 mb-1">{kw.keyword}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Difficulty:</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(kw.difficulty)}`}>
                        {kw.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-tail Keywords */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-rose-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Long-tail Keywords</h2>
                  <p className="text-sm text-gray-600">Vraag-based - perfect voor featured snippets!</p>
                </div>
              </div>

              <div className="space-y-3">
                {results.longTailKeywords?.slice(0, 6).map((kw: KeywordSuggestion, idx: number) => (
                  <div
                    key={idx}
                    className="bg-rose-50 border-2 border-rose-100 rounded-xl p-4 hover:bg-rose-100 transition-colors"
                  >
                    <p className="font-semibold text-gray-900 mb-2">"{kw.keyword}"</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Easy to rank
                      </span>
                      <span className="text-xs text-gray-600 italic">{kw.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Ideas */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Content Ideas</h2>
                  <p className="text-sm text-gray-600">Ready-to-use blog post titels!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.contentIdeas?.map((idea: ContentIdea, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 pr-4">{idea.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        idea.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : idea.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {idea.priority}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Format:</span>
                        <span className="text-xs font-semibold text-gray-900">{idea.format}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Target:</span>
                        <span className="text-xs font-semibold text-gray-900">{idea.estimatedWords} woorden</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {idea.targetKeywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Klaar om te schrijven?</h3>
              <p className="mb-6">Gebruik deze keywords in je blog post voor maximale SEO impact!</p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/admin/blog/new"
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Nieuwe Blog Post
                </Link>
                <button
                  onClick={() => {
                    setResults(null)
                    setTopic('')
                  }}
                  className="px-6 py-3 bg-purple-800 text-white rounded-xl font-semibold hover:bg-purple-900 transition-colors"
                >
                  Nieuw Research
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
