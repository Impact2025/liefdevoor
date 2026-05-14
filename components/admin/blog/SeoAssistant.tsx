'use client'

import { useState } from 'react'
import {
  CheckCircle, XCircle, Zap, Link, ExternalLink,
  Loader2, Copy, Check, ChevronDown, ChevronUp
} from 'lucide-react'

interface SeoCheckItem {
  label: string
  passed: boolean
  points: number
  tip?: string
}

interface LinkSuggestion {
  title: string
  url: string
  anchor: string
  reason: string
}

interface ExternalLinkSuggestion {
  title: string
  url: string
  domain: string
  reason: string
}

interface SeoAnalysis {
  internalLinks: LinkSuggestion[]
  externalLinks: ExternalLinkSuggestion[]
  improvedKeywords: string[]
  improvedMetaDesc: string
}

interface SeoAssistantProps {
  content: string
  title: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  onUpdateSeo: (updates: { seoTitle?: string; seoDescription?: string; keywords?: string[] }) => void
  onInsertLink: (anchor: string, url: string) => void
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function wordCount(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length
}

function countTag(html: string, tag: string): number {
  return (html.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length
}

function hasInternalLinks(html: string): boolean {
  return /<a[^>]+href=["']\/[^"']+["'][^>]*>/i.test(html)
}

export default function SeoAssistant({
  content, title, seoTitle, seoDescription, keywords, onUpdateSeo, onInsertLink
}: SeoAssistantProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [showChecklist, setShowChecklist] = useState(true)

  const effectiveTitle = seoTitle || title
  const primaryKeyword = keywords[0] || ''
  const words = wordCount(content)

  const checks: SeoCheckItem[] = [
    {
      label: 'Exactement 1 H1 aanwezig',
      passed: countTag(content, 'h1') === 1,
      points: 15,
      tip: `Nu ${countTag(content, 'h1')} H1 tags — gebruik er precies 1`
    },
    {
      label: 'Minimaal 2 H2 koppen',
      passed: countTag(content, 'h2') >= 2,
      points: 10,
      tip: `Nu ${countTag(content, 'h2')} H2 tags — voeg meer secties toe`
    },
    {
      label: `800+ woorden (nu: ${words})`,
      passed: words >= 800,
      points: 10,
      tip: `Nog ${Math.max(0, 800 - words)} woorden nodig voor goede rankings`
    },
    {
      label: 'SEO titel 30-60 tekens',
      passed: effectiveTitle.length >= 30 && effectiveTitle.length <= 60,
      points: 10,
      tip: `Nu ${effectiveTitle.length} tekens — optimaal is 30-60`
    },
    {
      label: 'Meta beschrijving 120-155 tekens',
      passed: seoDescription.length >= 120 && seoDescription.length <= 155,
      points: 10,
      tip: `Nu ${seoDescription.length} tekens — optimaal is 120-155`
    },
    {
      label: primaryKeyword
        ? `Keyword "${primaryKeyword.slice(0, 20)}" in SEO titel`
        : 'Primary keyword ingesteld',
      passed: primaryKeyword
        ? effectiveTitle.toLowerCase().includes(primaryKeyword.toLowerCase())
        : false,
      points: 15,
      tip: primaryKeyword
        ? 'Verwerk het hoofdkeyword in de SEO titel'
        : 'Voeg een primary keyword toe in de keyword-lijst'
    },
    {
      label: primaryKeyword ? `Keyword in content` : 'Keyword in content',
      passed: primaryKeyword
        ? content.toLowerCase().includes(primaryKeyword.toLowerCase())
        : false,
      points: 10,
      tip: 'Gebruik het keyword minstens 3-5 keer in de tekst'
    },
    {
      label: 'Interne links aanwezig',
      passed: hasInternalLinks(content),
      points: 15,
      tip: 'Voeg interne links toe naar gerelateerde pagina\'s (gebruik de AI analyse)'
    },
    {
      label: 'Minimaal 3 keywords',
      passed: keywords.length >= 3,
      points: 5,
      tip: 'Stel minimaal 3 keywords in'
    },
  ]

  const score = checks.filter(c => c.passed).reduce((sum, c) => sum + c.points, 0)
  const maxScore = checks.reduce((sum, c) => sum + c.points, 0)
  const pct = Math.round((score / maxScore) * 100)

  const scoreColor = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500'
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const borderColor = pct >= 80 ? 'border-green-200 bg-green-50' : pct >= 60 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
  const label = pct >= 80 ? 'Uitstekend' : pct >= 60 ? 'Goed' : pct >= 40 ? 'Matig' : 'Slecht'

  const runAnalysis = async () => {
    if (!content || content === '<p></p>') {
      setError('Voeg eerst content toe in de editor')
      return
    }
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blog/seo-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, seoTitle, seoDescription, keywords })
      })
      if (!res.ok) throw new Error('Analyse mislukt')
      const data = await res.json()
      setAnalysis(data)
      setActiveTab('internal')
    } catch {
      setError('Analyse mislukt. Controleer of er content is en probeer opnieuw.')
    } finally {
      setAnalyzing(false)
    }
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const passedCount = checks.filter(c => c.passed).length

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className={`p-4 rounded-xl border-2 ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-5xl font-bold leading-none ${scoreColor}`}>{pct}</div>
            <div className="text-sm text-gray-500 mt-1">{label} · {score}/{maxScore} punten</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">{passedCount}/{checks.length} checks</div>
            <div className="w-28 h-3 bg-gray-200 rounded-full mt-2">
              <div className={`h-3 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist toggle */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-sm text-gray-700">SEO Checklist</span>
          {showChecklist ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showChecklist && (
          <div className="divide-y divide-gray-100">
            {checks.map((check, i) => (
              <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                {check.passed
                  ? <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                  : <XCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${check.passed ? 'text-gray-700' : 'text-gray-500'}`}>{check.label}</div>
                  {!check.passed && check.tip && (
                    <div className="text-xs text-gray-400 mt-0.5">{check.tip}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{check.points}pt</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analyse button */}
      <button
        onClick={runAnalysis}
        disabled={analyzing}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-semibold transition-all shadow-sm"
      >
        {analyzing
          ? <><Loader2 size={18} className="animate-spin" /> Analyseren met AI...</>
          : <><Zap size={18} /> AI SEO Analyse — interne & externe links</>
        }
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {([
              { id: 'internal' as const, label: 'Interne links', icon: Link },
              { id: 'external' as const, label: 'Externe links', icon: ExternalLink },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'internal' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 px-1">Klik "Invoegen" om de link in te voegen op de cursorpositie in de editor</p>
              {analysis.internalLinks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Geen interne link suggesties gevonden</p>
              )}
              {analysis.internalLinks.map((link, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{link.title}</div>
                      <div className="text-xs text-blue-600 truncate font-mono">{link.url}</div>
                      <div className="text-xs text-gray-400 mt-1 italic">Ankertekst: "{link.anchor}"</div>
                      <div className="text-xs text-gray-500 mt-0.5">{link.reason}</div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => onInsertLink(link.anchor, link.url)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Invoegen
                      </button>
                      <button
                        onClick={() => copyUrl(link.url)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs transition-colors flex items-center gap-1 justify-center"
                      >
                        {copiedUrl === link.url ? <Check size={12} /> : <Copy size={12} />}
                        {copiedUrl === link.url ? 'Gekopieerd' : 'Kopieer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {analysis.improvedKeywords.length > 0 && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="text-xs font-semibold text-rose-800 mb-2">Aanbevolen extra keywords</div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.improvedKeywords.map((kw, i) => (
                      <button
                        key={i}
                        onClick={() => onUpdateSeo({ keywords: [...keywords, kw] })}
                        className="px-2.5 py-1 bg-white border border-rose-200 text-rose-700 rounded-full text-xs hover:bg-rose-100 transition-colors"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 px-1">Externe autoritaire bronnen verhogen de geloofwaardigheid bij Google</p>
              {analysis.externalLinks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Geen externe link suggesties gevonden</p>
              )}
              {analysis.externalLinks.map((link, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{link.title}</div>
                      <div className="text-xs text-gray-500 font-medium">{link.domain}</div>
                      <div className="text-xs text-gray-500 mt-1">{link.reason}</div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => onInsertLink(link.title, link.url)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Invoegen
                      </button>
                      <button
                        onClick={() => copyUrl(link.url)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs transition-colors flex items-center gap-1 justify-center"
                      >
                        {copiedUrl === link.url ? <Check size={12} /> : <Copy size={12} />}
                        {copiedUrl === link.url ? 'Gekopieerd' : 'Kopieer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {analysis.improvedMetaDesc && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-xs font-semibold text-blue-800 mb-1.5">Verbeterde meta beschrijving ({analysis.improvedMetaDesc.length} tekens)</div>
                  <p className="text-xs text-blue-700 italic">"{analysis.improvedMetaDesc}"</p>
                  <button
                    onClick={() => onUpdateSeo({ seoDescription: analysis.improvedMetaDesc })}
                    className="mt-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    Overnemen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
