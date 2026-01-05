'use client'

import { useState } from 'react'
import { Search, TrendingUp, Target, Sparkles, Copy, Check, BarChart3, Hash } from 'lucide-react'

interface HashtagData {
  tag: string
  volume: 'low' | 'medium' | 'high' | 'very_high'
  competition: 'low' | 'medium' | 'high'
  relevance: number
  trending: boolean
  estimatedReach: string
  suggestion: string
}

interface HashtagResearchResult {
  primary: HashtagData[]
  supporting: HashtagData[]
  trending: HashtagData[]
  niche: HashtagData[]
  recommendations: string[]
}

interface HashtagResearchToolProps {
  topic: string
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter'
  onAddHashtag: (tag: string) => void
  currentHashtags: string[]
}

export default function HashtagResearchTool({
  topic,
  platform,
  onAddHashtag,
  currentHashtags
}: HashtagResearchToolProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HashtagResearchResult | null>(null)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const searchHashtags = async () => {
    if (!topic.trim()) {
      setError('Voer een onderwerp in')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/blog/social/hashtag-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, niche: 'dating' })
      })

      if (!res.ok) {
        throw new Error('Hashtag research failed')
      }

      const data: HashtagResearchResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  const copyHashtag = async (tag: string) => {
    await navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(null), 2000)
  }

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'very_high': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const renderHashtagCard = (hashtag: HashtagData, category: string) => {
    const isUsed = currentHashtags.includes(hashtag.tag)

    return (
      <div
        key={hashtag.tag}
        className={`p-4 rounded-lg border-2 transition-all ${
          isUsed
            ? 'bg-purple-50 border-purple-300'
            : 'bg-white border-gray-200 hover:border-purple-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-gray-900">{hashtag.tag}</span>
            {hashtag.trending && (
              <TrendingUp size={14} className="text-red-500" />
            )}
          </div>
          <div className="flex gap-2">
            {!isUsed && (
              <button
                onClick={() => onAddHashtag(hashtag.tag)}
                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Toevoegen
              </button>
            )}
            <button
              onClick={() => copyHashtag(hashtag.tag)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {copiedTag === hashtag.tag ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getVolumeColor(hashtag.volume)}`}>
            Volume: {hashtag.volume.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getCompetitionColor(hashtag.competition)}`}>
            Competitie: {hashtag.competition}
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            Relevantie: {hashtag.relevance}%
          </span>
        </div>

        <div className="text-xs text-gray-600 mb-2">
          📊 Geschat bereik: <span className="font-semibold">{hashtag.estimatedReach}</span>
        </div>

        <p className="text-xs text-gray-600 italic">{hashtag.suggestion}</p>

        {isUsed && (
          <div className="mt-2 text-xs text-purple-700 font-medium">
            ✓ Al toegevoegd
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-900">Hashtag Research Tool</h3>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={topic}
              readOnly
              placeholder="Artikel onderwerp..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>
          <button
            onClick={searchHashtags}
            disabled={loading || !topic.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Sparkles size={18} className="animate-spin" />
                Zoeken...
              </>
            ) : (
              <>
                <Search size={18} />
                Zoek Hashtags
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Recommendations */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="text-blue-600" size={18} />
              <h4 className="font-semibold text-gray-900">Platform Advies voor {platform}</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary Hashtags */}
          {result.primary.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-purple-600" size={18} />
                <h4 className="font-semibold text-gray-900">Primary Hashtags</h4>
                <span className="text-xs text-gray-500">(Beste balans bereik/competitie)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.primary.map(tag => renderHashtagCard(tag, 'primary'))}
              </div>
            </div>
          )}

          {/* Trending Hashtags */}
          {result.trending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-red-600" size={18} />
                <h4 className="font-semibold text-gray-900">Trending Hashtags</h4>
                <span className="text-xs text-gray-500">(Momenteel populair)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.trending.map(tag => renderHashtagCard(tag, 'trending'))}
              </div>
            </div>
          )}

          {/* Niche Hashtags */}
          {result.niche.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-green-600" size={18} />
                <h4 className="font-semibold text-gray-900">Niche Hashtags</h4>
                <span className="text-xs text-gray-500">(Lage competitie, targeted)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.niche.map(tag => renderHashtagCard(tag, 'niche'))}
              </div>
            </div>
          )}

          {/* Supporting Hashtags */}
          {result.supporting.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hash className="text-gray-600" size={18} />
                <h4 className="font-semibold text-gray-900">Supporting Hashtags</h4>
                <span className="text-xs text-gray-500">(Aanvullend bereik)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.supporting.map(tag => renderHashtagCard(tag, 'supporting'))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Hash size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Klik op "Zoek Hashtags" om te beginnen</p>
          <p className="text-xs mt-1">We analyseren {platform} hashtags voor je onderwerp</p>
        </div>
      )}
    </div>
  )
}
