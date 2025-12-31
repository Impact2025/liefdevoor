'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Shield,
  Heart,
  MessageCircle,
  Users,
  BookOpen,
  Briefcase,
  Wrench,
  Star,
  Search,
  ArrowRight,
  Clock,
  ChevronRight,
  ChevronLeft,
  Filter,
  Eye,
  ThumbsUp,
  BookOpenCheck,
  Loader2
} from 'lucide-react'

// Category configurations
const categoryConfig: Record<string, {
  name: string
  nameNl: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  description: string
}> = {
  'veiligheid': {
    name: 'Safety & Protection',
    nameNl: 'Veiligheid & Bescherming',
    icon: Shield,
    color: '#DC2626',
    bgColor: 'bg-red-50',
    description: 'Alles over romance scams, catfishing, fysieke veiligheid en online privacy bij daten.',
  },
  'inclusief-daten': {
    name: 'Inclusive Dating',
    nameNl: 'Inclusief Daten',
    icon: Heart,
    color: '#7C3AED',
    bgColor: 'bg-purple-50',
    description: 'Praktische gidsen voor daten met autisme, LVB, angst of fysieke beperking.',
  },
  'communicatie': {
    name: 'Communication',
    nameNl: 'Communicatie & Contact',
    icon: MessageCircle,
    color: '#2563EB',
    bgColor: 'bg-blue-50',
    description: 'Van het eerste bericht tot het plannen van een date - alle communicatietips.',
  },
  'relaties': {
    name: 'Relationships',
    nameNl: 'Relaties',
    icon: Users,
    color: '#DB2777',
    bgColor: 'bg-pink-50',
    description: 'Van date naar relatie, communicatie met je partner, en relatie-onderhoud.',
  },
  'succesverhalen': {
    name: 'Success Stories',
    nameNl: 'Succesverhalen',
    icon: Star,
    color: '#EA580C',
    bgColor: 'bg-orange-50',
    description: 'Inspirerende verhalen van koppels die elkaar via Liefde Voor Iedereen vonden.',
  },
}

// Mock subcategories per category
const subcategories: Record<string, { name: string; slug: string; count: number }[]> = {
  'veiligheid': [
    { name: 'Romance Scams', slug: 'romance-scams', count: 25 },
    { name: 'Catfishing', slug: 'catfishing', count: 15 },
    { name: 'Fysieke Veiligheid', slug: 'fysieke-veiligheid', count: 18 },
    { name: 'Privacy & Data', slug: 'privacy', count: 20 },
    { name: 'Sextortion', slug: 'sextortion', count: 12 },
  ],
  'inclusief-daten': [
    { name: 'Autisme & Dating', slug: 'autisme', count: 22 },
    { name: 'LVB & Dating', slug: 'lvb', count: 20 },
    { name: 'Angst & Dating', slug: 'angst', count: 15 },
    { name: 'Fysieke Beperking', slug: 'fysieke-beperking', count: 12 },
    { name: 'LGBTQ+ Dating', slug: 'lgbtq', count: 18 },
  ],
  'communicatie': [
    { name: 'Eerste Berichten', slug: 'eerste-berichten', count: 20 },
    { name: 'Gesprekstechnieken', slug: 'gesprekken', count: 18 },
    { name: 'Flirten', slug: 'flirten', count: 15 },
    { name: 'Moeilijke Situaties', slug: 'moeilijk', count: 12 },
  ],
  'relaties': [
    { name: 'Eerste Dates', slug: 'eerste-dates', count: 25 },
    { name: 'Relatie Opbouwen', slug: 'relatie-opbouwen', count: 20 },
    { name: 'Communicatie', slug: 'communicatie', count: 18 },
    { name: 'Problemen Oplossen', slug: 'problemen', count: 15 },
  ],
}

// Mock articles (will be replaced by API)
const mockArticles = [
  {
    id: '1',
    title: 'Romance Scams Herkennen: De Complete Gids',
    titleNl: 'Romance Scams Herkennen: De Complete Gids',
    slug: 'romance-scams-herkennen',
    excerpt: 'Leer de belangrijkste signalen herkennen om jezelf te beschermen tegen dating fraude.',
    featuredImage: null,
    articleType: 'PILLAR',
    hasEasyRead: true,
    readingLevel: 'STANDARD',
    viewCount: 15420,
    helpfulCount: 892,
    publishedAt: '2025-01-15',
    readTime: 12,
  },
  {
    id: '2',
    title: '20 Rode Vlaggen in Chatberichten',
    titleNl: '20 Rode Vlaggen in Chatberichten',
    slug: '20-rode-vlaggen-chatberichten',
    excerpt: 'Deze waarschuwingssignalen moet je kennen voordat je iemand ontmoet.',
    featuredImage: null,
    articleType: 'CHECKLIST',
    hasEasyRead: true,
    readingLevel: 'EASY',
    viewCount: 12380,
    helpfulCount: 756,
    publishedAt: '2025-01-10',
    readTime: 8,
  },
  {
    id: '3',
    title: 'Love Bombing: Wanneer is Aandacht Te Veel?',
    titleNl: 'Love Bombing: Wanneer is Aandacht Te Veel?',
    slug: 'love-bombing-herkennen',
    excerpt: 'Overweldigende aandacht kan een manipulatietechniek zijn. Leer het verschil.',
    featuredImage: null,
    articleType: 'STANDARD',
    hasEasyRead: false,
    readingLevel: 'STANDARD',
    viewCount: 8920,
    helpfulCount: 534,
    publishedAt: '2025-01-08',
    readTime: 6,
  },
  {
    id: '4',
    title: 'Veilig Afspreken: De Complete Checklist',
    titleNl: 'Veilig Afspreken: De Complete Checklist',
    slug: 'veilig-afspreken-checklist',
    excerpt: 'Praktische checklist voor een veilige eerste date met iemand die je online ontmoette.',
    featuredImage: null,
    articleType: 'CHECKLIST',
    hasEasyRead: true,
    readingLevel: 'EASY',
    viewCount: 7650,
    helpfulCount: 489,
    publishedAt: '2025-01-05',
    readTime: 5,
  },
]

type ArticleType = 'all' | 'PILLAR' | 'GUIDE' | 'CHECKLIST' | 'STANDARD'

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params?.category as string

  const [articles, setArticles] = useState(mockArticles)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ArticleType>('all')
  const [showEasyReadOnly, setShowEasyReadOnly] = useState(false)

  const category = categoryConfig[categorySlug]
  const subs = subcategories[categorySlug] || []

  // Filter articles based on search and filters
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.titleNl.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || article.articleType === selectedType
    const matchesEasyRead = !showEasyReadOnly || article.hasEasyRead

    return matchesSearch && matchesType && matchesEasyRead
  })

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Categorie niet gevonden
          </h1>
          <Link
            href="/kennisbank"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Terug naar kennisbank
          </Link>
        </div>
      </div>
    )
  }

  const Icon = category.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/kennisbank" className="text-gray-500 hover:text-gray-700">
              Kennisbank
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{category.nameNl}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <header className={`${category.bgColor} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span style={{ color: category.color }}><Icon className="w-8 h-8" /></span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.nameNl}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                {category.description}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>{articles.length} artikelen</span>
                <span>•</span>
                <span>{subs.length} subcategorieën</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Subcategories */}
            {subs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <h2 className="font-semibold text-gray-900 mb-3">Subcategorieën</h2>
                <ul className="space-y-1">
                  {subs.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/kennisbank/${categorySlug}?sub=${sub.slug}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <span>{sub.name}</span>
                        <span className="text-xs text-gray-400">{sub.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h2>

              {/* Article Type */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Type artikel</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ArticleType)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">Alle types</option>
                  <option value="PILLAR">Uitgebreide gids</option>
                  <option value="GUIDE">How-to</option>
                  <option value="CHECKLIST">Checklist</option>
                  <option value="STANDARD">Artikel</option>
                </select>
              </div>

              {/* Easy Read Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="easyRead"
                  checked={showEasyReadOnly}
                  onChange={(e) => setShowEasyReadOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="easyRead" className="text-sm text-gray-700 flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-blue-600" />
                  Alleen Makkelijk Lezen
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Zoeken in ${category.nameNl}...`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {filteredArticles.length} artikel{filteredArticles.length !== 1 ? 'en' : ''} gevonden
              </p>
            </div>

            {/* Articles List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 mb-4">Geen artikelen gevonden</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedType('all')
                    setShowEasyReadOnly(false)
                  }}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Filters wissen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/kennisbank/${categorySlug}/${article.slug}`}
                    className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {article.featuredImage && (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.featuredImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {article.articleType === 'PILLAR' && (
                            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                              Uitgebreide gids
                            </span>
                          )}
                          {article.articleType === 'CHECKLIST' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Checklist
                            </span>
                          )}
                          {article.hasEasyRead && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <BookOpenCheck className="w-3 h-3" />
                              Easy Read
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-rose-600 transition-colors mb-2">
                          {article.titleNl}
                        </h2>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min lezen
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.viewCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {article.helpfulCount}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination placeholder */}
            {filteredArticles.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button className="p-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 rounded-lg bg-rose-600 text-white font-medium">1</span>
                <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
                <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
                <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
