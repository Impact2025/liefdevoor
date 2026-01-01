'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History,
  Heart,
  Shield,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  ChevronRight,
  RotateCcw,
  Share2,
  Loader2,
  Lock,
  TrendingUp,
  Award
} from 'lucide-react'
import { KennisbankBreadcrumb } from '@/components/kennisbank'

interface QuizResult {
  id: string
  toolSlug: string
  toolTitle: string | null
  toolType: string | null
  output: any
  score: number | null
  shareToken: string
  completedAt: string
}

const toolIcons: Record<string, typeof Heart> = {
  'liefdetaal-quiz': Heart,
  'hechtingsstijl-quiz': Shield,
  'compatibility-quiz': MessageCircle,
  'dating-readiness': Sparkles,
  'scam-checker': AlertTriangle,
}

const toolColors: Record<string, string> = {
  'liefdetaal-quiz': 'bg-rose-100 text-rose-600',
  'hechtingsstijl-quiz': 'bg-emerald-100 text-emerald-600',
  'compatibility-quiz': 'bg-indigo-100 text-indigo-600',
  'dating-readiness': 'bg-amber-100 text-amber-600',
  'scam-checker': 'bg-red-100 text-red-600',
}

const toolNames: Record<string, string> = {
  'liefdetaal-quiz': 'Liefdetaal Quiz',
  'hechtingsstijl-quiz': 'Hechtingsstijl Quiz',
  'compatibility-quiz': 'Compatibiliteit Quiz',
  'dating-readiness': 'Dating Readiness',
  'scam-checker': 'Scam Checker',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Vandaag'
  } else if (diffDays === 1) {
    return 'Gisteren'
  } else if (diffDays < 7) {
    return `${diffDays} dagen geleden`
  } else {
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
}

function getResultSummary(result: QuizResult): string {
  const output = result.output

  if (result.toolSlug === 'liefdetaal-quiz' && output?.primary) {
    return `Primair: ${output.primary.name}`
  }

  if (result.toolSlug === 'hechtingsstijl-quiz' && output?.primary) {
    return `${output.primary.name}`
  }

  if (result.toolSlug === 'scam-checker' && output?.riskLevel) {
    const levels: Record<string, string> = {
      low: 'Laag risico',
      medium: 'Gemiddeld risico',
      high: 'Hoog risico'
    }
    return levels[output.riskLevel] || 'Geanalyseerd'
  }

  if (result.score !== null) {
    return `Score: ${result.score}`
  }

  return 'Voltooid'
}

export default function MijnResultatenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/kennisbank/tools/mijn-resultaten')
      return
    }

    if (status === 'authenticated') {
      fetchResults()
    }
  }, [status, router])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/kennisbank/tools/results?limit=50')
      if (!response.ok) throw new Error('Failed to fetch results')
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError('Kon resultaten niet laden')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Log in om je resultaten te zien
          </h1>
          <p className="text-gray-600 mb-6">
            Je quiz resultaten worden opgeslagen in je account zodat je ze later kunt terugkijken.
          </p>
          <a
            href="/login?callbackUrl=/kennisbank/tools/mijn-resultaten"
            className="inline-block w-full py-3 px-6 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            Inloggen
          </a>
        </div>
      </div>
    )
  }

  // Group results by tool
  const resultsByTool = results.reduce((acc, result) => {
    const slug = result.toolSlug || 'unknown'
    if (!acc[slug]) acc[slug] = []
    acc[slug].push(result)
    return acc
  }, {} as Record<string, QuizResult[]>)

  const totalQuizzes = results.length
  const uniqueTools = Object.keys(resultsByTool).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <KennisbankBreadcrumb
            items={[
              { label: 'Kennisbank', href: '/kennisbank' },
              { label: 'Tools', href: '/kennisbank/tools' },
              { label: 'Mijn Resultaten' }
            ]}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mijn Resultaten
              </h1>
              <p className="text-gray-600">
                Bekijk al je quiz en tool resultaten
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
                <p className="text-xs text-gray-500">Totaal voltooid</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{uniqueTools}</p>
                <p className="text-xs text-gray-500">Verschillende tools</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {results.length > 0 ? formatDate(results[0].completedAt).split(' ')[0] : '-'}
                </p>
                <p className="text-xs text-gray-500">Laatste activiteit</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                <p className="text-xs text-gray-500">Deelbaar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {results.length === 0 && !error ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nog geen resultaten
            </h2>
            <p className="text-gray-600 mb-6">
              Maak een quiz om je resultaten hier te zien verschijnen.
            </p>
            <a
              href="/kennisbank/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
            >
              Bekijk alle Tools
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {results.map((result, index) => {
                const Icon = toolIcons[result.toolSlug] || Sparkles
                const colorClass = toolColors[result.toolSlug] || 'bg-gray-100 text-gray-600'
                const toolName = result.toolTitle || toolNames[result.toolSlug] || 'Tool'

                return (
                  <motion.a
                    key={result.id}
                    href={`/kennisbank/tools/result/${result.shareToken}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-rose-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                            {toolName}
                          </h3>
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                            {result.toolType || 'QUIZ'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getResultSummary(result)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(result.completedAt)}
                        </p>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-rose-500 transition-colors ml-auto" />
                      </div>
                    </div>
                  </motion.a>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-2">Nog meer ontdekken?</h3>
          <p className="text-rose-100 text-sm mb-4">
            Probeer andere tools om meer over jezelf en je relaties te leren.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/kennisbank/tools/liefdetaal-quiz"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Liefdetaal Quiz
            </a>
            <a
              href="/kennisbank/tools/hechtingsstijl-quiz"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Hechtingsstijl Quiz
            </a>
            <a
              href="/kennisbank/tools/scam-checker"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Scam Checker
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
