'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  Shield,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Share2,
  RotateCcw,
  Loader2,
  User,
  Calendar,
  Twitter,
  Facebook,
  Link2,
  Check,
  ArrowLeft,
  TrendingUp,
  Clock,
  Gift,
  Hand
} from 'lucide-react'
import { KennisbankBreadcrumb } from '@/components/kennisbank'

interface SharedResult {
  id: string
  toolSlug: string
  toolTitle: string | null
  toolDescription: string | null
  toolType: string | null
  output: any
  score: number | null
  completedAt: string
  user: {
    name: string
    image: string | null
  } | null
}

const toolIcons: Record<string, typeof Heart> = {
  'liefdetaal-quiz': Heart,
  'hechtingsstijl-quiz': Shield,
  'compatibility-quiz': MessageCircle,
  'dating-readiness': Sparkles,
  'scam-checker': AlertTriangle,
}

const toolColors: Record<string, { bg: string; text: string; border: string }> = {
  'liefdetaal-quiz': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  'hechtingsstijl-quiz': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  'compatibility-quiz': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  'dating-readiness': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  'scam-checker': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
}

const loveLanguageIcons: Record<string, typeof Heart> = {
  words: MessageCircle,
  acts: Hand,
  gifts: Gift,
  time: Clock,
  touch: Heart,
}

const loveLanguageColors: Record<string, string> = {
  words: 'text-rose-600 bg-rose-50',
  acts: 'text-emerald-600 bg-emerald-50',
  gifts: 'text-amber-600 bg-amber-50',
  time: 'text-indigo-600 bg-indigo-50',
  touch: 'text-purple-600 bg-purple-50',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Love Language Result Component
function LoveLanguageResult({ output }: { output: any }) {
  const primary = output?.primary
  const scores = output?.scores || {}
  const totalScore = Object.values(scores).reduce((a: number, b: any) => a + (b as number), 0) as number

  if (!primary) return null

  const PrimaryIcon = loveLanguageIcons[primary.language] || Heart
  const colorClass = loveLanguageColors[primary.language] || 'text-rose-600 bg-rose-50'

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${colorClass.split(' ')[1]} rounded-2xl p-6 border-2 ${colorClass.includes('rose') ? 'border-rose-200' : colorClass.includes('emerald') ? 'border-emerald-200' : colorClass.includes('amber') ? 'border-amber-200' : colorClass.includes('indigo') ? 'border-indigo-200' : 'border-purple-200'}`}
      >
        <div className="text-center">
          <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <PrimaryIcon className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Primaire Liefdetaal</p>
          <h2 className={`text-2xl font-bold ${colorClass.split(' ')[0]}`}>
            {primary.name}
          </h2>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Volledige Profiel</h3>
        </div>
        <div className="space-y-3">
          {output.ranking?.map(([lang, score]: [string, number], index: number) => {
            const Icon = loveLanguageIcons[lang] || Heart
            const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
            const langNames: Record<string, string> = {
              words: 'Bevestigende Woorden',
              acts: 'Hulpvaardigheid',
              gifts: 'Cadeaus Ontvangen',
              time: 'Quality Time',
              touch: 'Fysieke Aanraking'
            }

            return (
              <div key={lang} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${loveLanguageColors[lang]?.split(' ')[0] || 'text-gray-600'}`} />
                    <span className="text-gray-700">{langNames[lang] || lang}</span>
                  </div>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      lang === 'words' ? 'bg-rose-500' :
                      lang === 'acts' ? 'bg-emerald-500' :
                      lang === 'gifts' ? 'bg-amber-500' :
                      lang === 'time' ? 'bg-indigo-500' :
                      'bg-purple-500'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Attachment Style Result Component
function AttachmentStyleResult({ output }: { output: any }) {
  const primary = output?.primary
  const scores = output?.scores || {}
  const totalScore = Object.values(scores).reduce((a: number, b: any) => a + (b as number), 0) as number

  if (!primary) return null

  const styleColors: Record<string, { bg: string; text: string; border: string }> = {
    secure: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    anxious: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    avoidant: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    fearful: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  }

  const styleNames: Record<string, string> = {
    secure: 'Veilig Gehecht',
    anxious: 'Angstig Gehecht',
    avoidant: 'Vermijdend Gehecht',
    fearful: 'Angstig-Vermijdend',
  }

  const color = styleColors[primary.style] || styleColors.secure

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${color.bg} rounded-2xl p-6 border-2 ${color.border}`}
      >
        <div className="text-center">
          <div className={`w-16 h-16 ${color.bg} ${color.text} rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-lg`}>
            <Shield className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Hechtingsstijl</p>
          <h2 className={`text-2xl font-bold ${color.text}`}>
            {primary.name || styleNames[primary.style]}
          </h2>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Score Verdeling</h3>
        </div>
        <div className="space-y-3">
          {output.ranking?.map(([style, score]: [string, number], index: number) => {
            const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
            const styleColor = styleColors[style] || styleColors.secure

            return (
              <div key={style} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{styleNames[style] || style}</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      style === 'secure' ? 'bg-emerald-500' :
                      style === 'anxious' ? 'bg-rose-500' :
                      style === 'avoidant' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SharedResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [result, setResult] = useState<SharedResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchResult()
  }, [token])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/kennisbank/tools/results/${token}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Resultaat niet gevonden')
        } else {
          throw new Error('Failed to fetch result')
        }
        return
      }
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError('Kon resultaat niet laden')
    } finally {
      setIsLoading(false)
    }
  }

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Resultaat laden...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Resultaat niet gevonden'}
          </h1>
          <p className="text-gray-600 mb-6">
            Dit resultaat bestaat niet of is verwijderd.
          </p>
          <a
            href="/kennisbank/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Naar Tools
          </a>
        </div>
      </div>
    )
  }

  const Icon = toolIcons[result.toolSlug] || Sparkles
  const colors = toolColors[result.toolSlug] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const toolTitle = result.toolTitle || result.toolSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Quiz'
  const shareText = `Bekijk mijn ${toolTitle} resultaat!`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <KennisbankBreadcrumb
            items={[
              { label: 'Kennisbank', href: '/kennisbank' },
              { label: 'Tools', href: '/kennisbank/tools' },
              { label: 'Gedeeld Resultaat' }
            ]}
          />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Icon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {toolTitle} Resultaat
          </h1>
          {result.user && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>{result.user.name}</span>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            {formatDate(result.completedAt)}
          </p>
        </div>

        {/* Result Content */}
        <div className="mb-8">
          {result.toolSlug === 'liefdetaal-quiz' && (
            <LoveLanguageResult output={result.output} />
          )}
          {result.toolSlug === 'hechtingsstijl-quiz' && (
            <AttachmentStyleResult output={result.output} />
          )}
          {!['liefdetaal-quiz', 'hechtingsstijl-quiz'].includes(result.toolSlug) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5" />
            <h3 className="font-semibold">Deel dit Resultaat</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm">Twitter</span>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span className="text-sm">Facebook</span>
            </a>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Gekopieerd!' : 'Kopieer Link'}</span>
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-rose-50 rounded-xl p-6 border border-rose-200 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">
            Wil jij ook weten wat jouw resultaat is?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Doe de quiz en ontdek meer over jezelf!
          </p>
          <a
            href={`/kennisbank/tools/${result.toolSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Doe de Quiz
          </a>
        </div>
      </main>
    </div>
  )
}
