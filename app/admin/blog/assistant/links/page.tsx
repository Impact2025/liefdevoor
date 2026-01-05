'use client'

import { useState } from 'react'
import { Link as LinkIcon, Loader2, ArrowLeft, ExternalLink, Copy, AlertTriangle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface LinkSuggestion {
  targetPost: {
    id: string
    title: string
    slug: string | null
    url: string
    excerpt: string | null
  }
  relevanceScore: number
  anchorTextSuggestions: string[]
  reason: string
  placement: 'intro' | 'body' | 'conclusion'
}

interface OrphanedPost {
  id: string
  title: string
  slug: string | null
}

interface LinkAnalysisResult {
  currentLinks: number
  suggestedLinks: LinkSuggestion[]
  orphanedPosts: OrphanedPost[]
  topLinkingOpportunities: LinkSuggestion[]
}

interface DistributionResult {
  totalPosts: number
  averageInternalLinks: number
  postsWithNoLinks: number
  postsWithTooManyLinks: number
  topLinkedPosts: Array<{ title: string; slug: string | null; linkCount: number }>
  recommendations: string[]
}

export default function InternalLinksPage() {
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LinkAnalysisResult | null>(null)
  const [distribution, setDistribution] = useState<DistributionResult | null>(null)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'distribution'>('suggestions')

  const handleFindLinks = async () => {
    if (!content.trim()) {
      alert('Voer eerst content in')
      return
    }

    setLoading(true)
    setActiveTab('suggestions')
    try {
      const res = await fetch('/api/blog/assistant/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResults(data.data)
      } else {
        alert('Er ging iets mis: ' + (data.error || 'Onbekende fout'))
      }
    } catch (error) {
      console.error('Link analysis failed:', error)
      alert('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeDistribution = async () => {
    setLoading(true)
    setActiveTab('distribution')
    try {
      const res = await fetch('/api/blog/assistant/links')
      const data = await res.json()
      if (data.success) {
        setDistribution(data.data)
      } else {
        alert('Er ging iets mis: ' + (data.error || 'Onbekende fout'))
      }
    } catch (error) {
      console.error('Distribution analysis failed:', error)
      alert('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200'
    if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getPlacementColor = (placement: string) => {
    if (placement === 'intro') return 'bg-purple-100 text-purple-700'
    if (placement === 'body') return 'bg-pink-100 text-pink-700'
    return 'bg-rose-100 text-rose-700'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(`Gekopieerd: ${text}`)
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog/assistant"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Assistant
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Internal Link Suggester
          </h1>
          <p className="text-gray-600">
            Vind automatisch de beste interne links voor je blog post
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-rose-100 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Keywords (optioneel - verbetert suggesties)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="dating tips, eerste date, tinder"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">Gescheiden door komma's</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Blog Content (HTML/Markdown)
              </label>
              <span className="text-sm text-gray-500">
                {wordCount} woorden
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Plak hier je blog content..."
              rows={12}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Hoe meer content, hoe betere suggesties!
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleFindLinks}
              disabled={loading || !content.trim()}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && activeTab === 'suggestions' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Zoeken...
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  Vind Links
                </>
              )}
            </button>

            <button
              onClick={handleAnalyzeDistribution}
              disabled={loading}
              className="px-8 py-4 bg-white border-2 border-rose-600 text-rose-600 rounded-xl font-semibold hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && activeTab === 'distribution' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Laden...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Analyse Blog
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results - Link Suggestions */}
        {results && activeTab === 'suggestions' && (
          <div className="space-y-8">
            {/* Current Links Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Huidige Interne Links</p>
                  <p className="text-3xl font-bold text-gray-900">{results.currentLinks}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Ideaal: 3-5 links</p>
                  <p className={`text-lg font-semibold ${
                    results.currentLinks >= 3 && results.currentLinks <= 5
                      ? 'text-green-600'
                      : results.currentLinks < 3
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                  }`}>
                    {results.currentLinks < 3 ? '⚠️ Te weinig' : results.currentLinks > 5 ? 'ℹ️ Veel' : '✅ Perfect'}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Link Suggestions */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-rose-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Link Suggesties</h2>
                  <p className="text-sm text-gray-600">Top {results.suggestedLinks.length} meest relevante links</p>
                </div>
              </div>

              {results.suggestedLinks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Geen relevante links gevonden. Probeer meer keywords toe te voegen.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.suggestedLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border-2 border-rose-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {link.targetPost.title}
                            </h3>
                            <a
                              href={link.targetPost.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{link.targetPost.excerpt}</p>
                          <p className="text-xs text-gray-500 italic">{link.reason}</p>
                        </div>
                        <div className="ml-4">
                          <span className={`text-lg font-bold px-3 py-1 rounded-lg border-2 ${getRelevanceColor(link.relevanceScore)}`}>
                            {link.relevanceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Placement Badge */}
                      <div className="mb-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${getPlacementColor(link.placement)}`}>
                          Plaats in: {link.placement === 'intro' ? 'Intro' : link.placement === 'body' ? 'Body' : 'Conclusie'}
                        </span>
                      </div>

                      {/* Anchor Text Suggestions */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Anchor Text Suggesties:</p>
                        <div className="flex flex-wrap gap-2">
                          {link.anchorTextSuggestions.map((anchor, i) => (
                            <button
                              key={i}
                              onClick={() => copyToClipboard(`<a href="${link.targetPost.url}">${anchor}</a>`)}
                              className="text-sm bg-white border-2 border-rose-200 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                              {anchor}
                              <Copy className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orphaned Posts */}
            {results.orphanedPosts && results.orphanedPosts.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Orphaned Posts</h2>
                    <p className="text-sm text-gray-600">Posts zonder incoming links - overweeg deze te linken!</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.orphanedPosts.map((post, idx) => (
                    <div
                      key={idx}
                      className="bg-orange-50 border-2 border-orange-100 rounded-xl p-4 hover:bg-orange-100 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">{post.title}</p>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Bekijk post <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results - Distribution Analysis */}
        {distribution && activeTab === 'distribution' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-100">
                <p className="text-sm text-gray-500 mb-1">Totaal Posts</p>
                <p className="text-3xl font-bold text-gray-900">{distribution.totalPosts}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100">
                <p className="text-sm text-gray-500 mb-1">Gemiddelde Links</p>
                <p className="text-3xl font-bold text-gray-900">{distribution.averageInternalLinks.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">Ideaal: 3-5</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
                <p className="text-sm text-gray-500 mb-1">Zonder Links</p>
                <p className="text-3xl font-bold text-orange-600">{distribution.postsWithNoLinks}</p>
                <p className="text-xs text-gray-500 mt-1">Update deze!</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-100">
                <p className="text-sm text-gray-500 mb-1">Teveel Links (&gt;10)</p>
                <p className="text-3xl font-bold text-yellow-600">{distribution.postsWithTooManyLinks}</p>
                <p className="text-xs text-gray-500 mt-1">Mogelijk te veel</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-rose-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Aanbevelingen</h2>
              <div className="space-y-3">
                {distribution.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      rec.startsWith('✅')
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : rec.startsWith('⚠️')
                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <p className="font-semibold">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Linked Posts */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meest Gelinkte Posts</h2>
              <div className="space-y-3">
                {distribution.topLinkedPosts.map((post, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-50 border-2 border-purple-100 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{post.title}</p>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Bekijk post <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{post.linkCount}</p>
                      <p className="text-xs text-gray-500">links</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-rose-600 to-red-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Pro Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Voeg 3-5 interne links toe per blog post</li>
            <li>✅ Kies links met relevance score &gt; 50%</li>
            <li>✅ Gebruik variatie in anchor text (niet altijd exact title)</li>
            <li>✅ Plaats hoog-relevante links in de intro</li>
            <li>✅ Link ook naar Kennisbank artikelen voor extra autoriteit</li>
            <li>✅ Update oude posts maandelijks met nieuwe links</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
