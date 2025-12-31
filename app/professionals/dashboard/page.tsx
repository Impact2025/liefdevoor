'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  BookOpen,
  Download,
  Users,
  TrendingUp,
  Star,
  Clock,
  FileText,
  ArrowRight,
  ExternalLink,
  Shield,
  AlertTriangle,
  ChevronRight,
  Eye,
  Loader2
} from 'lucide-react'

interface DashboardStats {
  articlesRead: number
  pdfDownloads: number
  teamMembers: number
  savedArticles: number
}

interface RecentArticle {
  id: string
  title: string
  slug: string
  category: string
  readTime: number
  viewedAt: string
}

export default function ProfessionalDashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    articlesRead: 0,
    pdfDownloads: 0,
    teamMembers: 1,
    savedArticles: 0,
  })
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [professional, setProfessional] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login?callbackUrl=/professionals/dashboard')
    }
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/professionals/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data.stats || stats)
        setRecentArticles(data.data.recentArticles || [])
        setProfessional(data.data.professional)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const isVerified = professional?.isVerified
  const tier = professional?.professionalTier || 'BASIC'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welkom terug, {session?.user?.name}
              </h1>
              <p className="text-indigo-100 mt-1">
                {professional?.organizationName || 'Professional Portal'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tier === 'PREMIUM' ? 'bg-amber-400 text-amber-900' :
                tier === 'STANDARD' ? 'bg-indigo-100 text-indigo-700' :
                'bg-white/20 text-white'
              }`}>
                {tier === 'PREMIUM' ? 'Premium' : tier === 'STANDARD' ? 'Standard' : 'Basic'}
              </span>
              {isVerified && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  Geverifieerd
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Warning */}
        {!isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">
                Verificatie vereist
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                Verificeer je professionele status voor volledige toegang tot alle content.
              </p>
            </div>
            <Link
              href="/professionals/dashboard/verificatie"
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 flex-shrink-0"
            >
              Nu Verifiëren
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Artikelen Gelezen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.articlesRead}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">PDF Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pdfDownloads}</p>
                {tier === 'BASIC' && (
                  <p className="text-xs text-gray-400">Upgrade voor downloads</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teamleden</p>
                <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Opgeslagen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedArticles}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Articles */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Recent Gelezen</h2>
                <Link
                  href="/kennisbank"
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  Alle artikelen
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentArticles.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nog geen artikelen gelezen</p>
                  <Link
                    href="/kennisbank"
                    className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block"
                  >
                    Ontdek de kennisbank
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/kennisbank/${article.slug}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Aanbevolen Voor Professionals</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/kennisbank/veiligheid/romance-scams-professional-gids"
                  className="group p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-2">
                    <Shield className="w-4 h-4" />
                    Veiligheid
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 mb-1">
                    Romance Scams: Gids voor Professionals
                  </h3>
                  <p className="text-sm text-gray-500">
                    Hoe je cliënten kunt helpen die slachtoffer zijn van romance fraude
                  </p>
                </Link>

                <Link
                  href="/kennisbank/inclusief-daten/lvb-begeleiding"
                  className="group p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
                    <Users className="w-4 h-4" />
                    Inclusief Daten
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 mb-1">
                    Daten met LVB: Begeleidingsgids
                  </h3>
                  <p className="text-sm text-gray-500">
                    Praktische tips voor het begeleiden van cliënten met een LVB
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Card */}
            {tier === 'BASIC' && (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Upgrade naar Standard</h3>
                <p className="text-white/80 text-sm mb-4">
                  Onbeperkt artikelen, PDF downloads, en meer.
                </p>
                <Link
                  href="/professionals/upgrade"
                  className="block text-center bg-white text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-white/90"
                >
                  Upgraden - €29/maand
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Snelle Acties</h3>
              <div className="space-y-2">
                <Link
                  href="/kennisbank/tools/scam-checker"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5 text-rose-600" />
                  <span className="text-gray-700">Scam Checker Tool</span>
                </Link>
                <Link
                  href="/professionals/dashboard/opgeslagen"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Star className="w-5 h-5 text-amber-600" />
                  <span className="text-gray-700">Opgeslagen Artikelen</span>
                </Link>
                <Link
                  href="/professionals/dashboard/team"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Team Beheren</span>
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Hulp nodig?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ons team helpt je graag verder.
              </p>
              <a
                href="mailto:professionals@liefdevooridereen.nl"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                professionals@liefdevooridereen.nl
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
