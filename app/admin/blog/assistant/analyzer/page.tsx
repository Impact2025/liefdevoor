'use client'

import { useState } from 'react'
import { Zap, Loader2, ArrowLeft, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface SEOAnalysis {
  score: number
  grade: string
  issues: Array<{
    severity: string
    category: string
    message: string
    fix?: string
  }>
  recommendations: Array<{
    priority: string
    category: string
    action: string
    impact: string
  }>
  metrics: {
    wordCount: number
    readingTime: number
    internalLinks: number
    externalLinks: number
    images: number
    imagesWithAlt: number
    readabilityScore: number
    headingStructure: {
      h1: number
      h2: number
      h3: number
    }
  }
}

export default function SEOAnalyzerPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SEOAnalysis | null>(null)

  const handleAnalyze = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Title en content zijn verplicht!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/blog/assistant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          seoTitle: seoTitle || title,
          seoDescription,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('SEO analysis failed:', error)
      alert('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'from-green-500 to-emerald-500'
    if (grade === 'B') return 'from-blue-500 to-cyan-500'
    if (grade === 'C') return 'from-yellow-500 to-orange-500'
    if (grade === 'D') return 'from-orange-500 to-red-500'
    return 'from-red-500 to-rose-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    return <Info className="w-5 h-5 text-blue-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog/assistant"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Assistant
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SEO Analyzer
          </h1>
          <p className="text-gray-600">
            Krijg een score van 0-100 met concrete verbeterpunten
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-pink-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Blog Post Gegevens</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="10 Eerste Date Tips die Écht Werken"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SEO Title (optioneel)
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Laat leeg om title te gebruiken"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Aanbevolen: 50-60 karakters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description (optioneel)
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Korte beschrijving voor Google (150-160 chars)"
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Aanbevolen: 150-160 karakters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Keywords (komma gescheiden)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="eerste date, dating tips, date ideeën"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tip: 5-8 keywords is ideaal</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content (HTML of Markdown) *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Plak hier je blog content..."
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {content.split(/\s+/).filter(w => w).length} woorden (doel: 1500+)
                  </p>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !title.trim() || !content.trim()}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze SEO
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white sticky top-8">
              <h3 className="text-xl font-bold mb-4">📊 SEO Score Guide</h3>

              <div className="space-y-3 mb-6">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">A+ / A</span>
                    <span className="text-sm">95-100 / 85-94</span>
                  </div>
                  <p className="text-xs opacity-90">Perfect! Publish direct</p>
                </div>

                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">B</span>
                    <span className="text-sm">70-84</span>
                  </div>
                  <p className="text-xs opacity-90">Goed, fix warnings</p>
                </div>

                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">C / D</span>
                    <span className="text-sm">30-69</span>
                  </div>
                  <p className="text-xs opacity-90">Needs work, fix critical</p>
                </div>

                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">F</span>
                    <span className="text-sm">0-29</span>
                  </div>
                  <p className="text-xs opacity-90">Do NOT publish</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">💡 Pro Tips:</p>
                <ul className="text-xs space-y-2 opacity-90">
                  <li>• Minimum score: 70 (B)</li>
                  <li>• Target: 1500+ woorden</li>
                  <li>• Keywords: 1-2% density</li>
                  <li>• Links: 3-5 internal</li>
                  <li>• Headings: H1 → H2 → H3</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-8 space-y-6">
            {/* Score Card */}
            <div className={`bg-gradient-to-r ${getGradeColor(results.grade)} rounded-2xl p-8 text-white shadow-2xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-semibold mb-2">SEO Score</p>
                  <div className="flex items-end gap-4">
                    <span className="text-6xl font-bold">{results.score}</span>
                    <span className="text-4xl font-bold pb-2">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/90 text-sm font-semibold mb-2">Grade</p>
                  <span className="text-6xl font-bold">{results.grade}</span>
                </div>
              </div>
              <div className="mt-4 bg-white/20 rounded-lg p-4">
                <p className="text-sm">
                  {results.score >= 85 && '🎉 Excellent! Je post is SEO-geoptimaliseerd!'}
                  {results.score >= 70 && results.score < 85 && '✅ Goed! Fix de warnings en je bent klaar.'}
                  {results.score >= 50 && results.score < 70 && '⚠️ Needs work. Fix critical issues voor publicatie.'}
                  {results.score < 50 && '❌ Veel verbeteringen nodig. Check alle issues!'}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Content Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{results.metrics.wordCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Woorden</p>
                  <p className="text-xs text-gray-500">(doel: 1500+)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-600">{results.metrics.readingTime}</p>
                  <p className="text-sm text-gray-600 mt-1">Min lezen</p>
                  <p className="text-xs text-gray-500">(ideaal: 5-10)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{results.metrics.internalLinks}</p>
                  <p className="text-sm text-gray-600 mt-1">Interne Links</p>
                  <p className="text-xs text-gray-500">(doel: 3-5)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{results.metrics.readabilityScore.toFixed(0)}</p>
                  <p className="text-sm text-gray-600 mt-1">Leesbaarheid</p>
                  <p className="text-xs text-gray-500">(doel: 60-80)</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {results.metrics.headingStructure.h1} / {results.metrics.headingStructure.h2} / {results.metrics.headingStructure.h3}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">H1 / H2 / H3</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-gray-900">{results.metrics.images}</p>
                  <p className="text-xs text-gray-600 mt-1">Afbeeldingen</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-gray-900">{results.metrics.imagesWithAlt}</p>
                  <p className="text-xs text-gray-600 mt-1">Met Alt Text</p>
                </div>
              </div>
            </div>

            {/* Issues */}
            {results.issues.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-red-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">🔧 Issues ({results.issues.length})</h3>
                <div className="space-y-4">
                  {results.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`border-2 rounded-xl p-4 ${
                        issue.severity === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : issue.severity === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              issue.severity === 'critical'
                                ? 'bg-red-200 text-red-800'
                                : issue.severity === 'warning'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">{issue.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">{issue.message}</p>
                          {issue.fix && (
                            <p className="text-sm text-gray-600">✅ Fix: {issue.fix}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">💡 Recommendations ({results.recommendations.length})</h3>
                <div className="space-y-4">
                  {results.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`border-2 rounded-xl p-4 ${
                        rec.priority === 'high'
                          ? 'bg-orange-50 border-orange-200'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              rec.priority === 'high'
                                ? 'bg-orange-200 text-orange-800'
                                : rec.priority === 'medium'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">{rec.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">{rec.action}</p>
                          <p className="text-sm text-gray-600">📊 Impact: {rec.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Klaar om te verbeteren?</h3>
              <p className="mb-6">Fix de issues en run de analyzer opnieuw!</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-6 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Scroll naar Top
                </button>
                <button
                  onClick={() => setResults(null)}
                  className="px-6 py-3 bg-pink-800 text-white rounded-xl font-semibold hover:bg-pink-900 transition-colors"
                >
                  Nieuwe Analyse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
