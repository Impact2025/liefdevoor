'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  TrendingUp,
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

// Kennisbank categorieën
const categories = [
  {
    id: 'veiligheid',
    name: 'Veiligheid & Bescherming',
    slug: 'veiligheid',
    icon: Shield,
    color: '#DC2626',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Scam herkenning, catfishing, fysieke veiligheid en privacy',
    articleCount: 120,
    featured: true,
  },
  {
    id: 'inclusief',
    name: 'Inclusief Daten',
    slug: 'inclusief-daten',
    icon: Heart,
    color: '#7C3AED',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Daten met autisme, LVB, angst of beperking',
    articleCount: 100,
    featured: true,
  },
  {
    id: 'communicatie',
    name: 'Communicatie & Contact',
    slug: 'communicatie',
    icon: MessageCircle,
    color: '#2563EB',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Eerste berichten, gesprekstechnieken, omgaan met afwijzing',
    articleCount: 80,
  },
  {
    id: 'relaties',
    name: 'Relaties',
    slug: 'relaties',
    icon: Users,
    color: '#DB2777',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Van date naar relatie, communicatie in relaties',
    articleCount: 100,
  },
  {
    id: 'begrippen',
    name: 'Begrippenlijst',
    slug: 'begrippen',
    icon: BookOpen,
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'A-Z encyclopedie van dating termen',
    articleCount: 200,
  },
  {
    id: 'professionals',
    name: 'Voor Professionals',
    slug: 'professionals',
    icon: Briefcase,
    color: '#D97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Handleidingen en tools voor begeleiders',
    articleCount: 80,
  },
  {
    id: 'tools',
    name: 'Tools & Hulpmiddelen',
    slug: 'tools',
    icon: Wrench,
    color: '#4F46E5',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Interactieve tools: scam checker, quizzen, generators',
    articleCount: 40,
  },
  {
    id: 'succesverhalen',
    name: 'Succesverhalen',
    slug: 'succesverhalen',
    icon: Star,
    color: '#EA580C',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Echte verhalen van onze gebruikers',
    articleCount: 80,
  },
]

// Featured tools voor de homepage
const featuredTools = [
  {
    name: 'Scam Checker',
    description: 'Check of een bericht verdacht is',
    href: '/kennisbank/tools/scam-checker',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    external: false,
    badge: 'Populair',
  },
  {
    name: 'Love Language Quiz',
    description: 'Ontdek jouw taal van de liefde',
    href: '/kennisbank/tools/love-language-quiz',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    external: false,
  },
  {
    name: 'Profiel Review',
    description: 'Krijg feedback op je profiel',
    href: 'https://datingassistent.nl/profiel-review?ref=lvi',
    icon: ExternalLink,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    external: true,
    badge: 'DatingAssistent.nl',
  },
]

// Populaire artikelen (mock data - later uit API)
const popularArticles = [
  {
    title: 'Romance Scams Herkennen: De Complete Gids',
    slug: 'veiligheid/romance-scams-herkennen',
    category: 'Veiligheid',
    readTime: 12,
    views: 15420,
  },
  {
    title: 'Daten met Autisme: Praktische Tips',
    slug: 'inclusief-daten/daten-met-autisme',
    category: 'Inclusief Daten',
    readTime: 8,
    views: 12380,
  },
  {
    title: 'Wat is Ghosting en Hoe Ga Je Ermee Om?',
    slug: 'begrippen/ghosting',
    category: 'Begrippenlijst',
    readTime: 5,
    views: 9850,
  },
  {
    title: '50 Originele Openingszinnen die Werken',
    slug: 'communicatie/openingszinnen',
    category: 'Communicatie',
    readTime: 7,
    views: 8920,
  },
]

export default function KennisbankPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/kennisbank/zoeken?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              De Complete Dating Encyclopedie
            </h1>
            <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
              800+ artikelen over veilig daten, inclusiviteit, communicatie en relaties.
              Dé referentie waar Nederland naar linkt.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className={`relative flex items-center transition-all duration-200 ${
                isSearchFocused ? 'scale-105' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Zoek in de kennisbank... bijv. 'scam herkennen' of 'eerste date'"
                  className="w-full pl-12 pr-32 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-full transition-colors font-medium"
                >
                  Zoeken
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>800+ artikelen</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>10+ interactieve tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Voor iedereen toegankelijk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        {/* Categories Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Categorieën
            </h2>
            <span className="text-sm text-gray-500">
              8 hoofdcategorieën
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.id}
                  href={category.slug === 'begrippen' || category.slug === 'tools' || category.slug === 'professionals'
                    ? `/kennisbank/${category.slug}`
                    : `/kennisbank/${category.slug}`
                  }
                  className={`group relative p-6 rounded-2xl border-2 ${category.borderColor} ${category.bgColor} hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
                >
                  {category.featured && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Populair
                    </span>
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span style={{ color: category.color }}><Icon className="w-6 h-6" /></span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {category.articleCount}+ artikelen
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Two Column Layout: Popular Articles + Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* Popular Articles */}
          <section className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-bold text-gray-900">Populaire Artikelen</h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href={`/kennisbank/${article.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-2xl font-bold text-gray-200 w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors truncate">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="text-rose-600">{article.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>

            <Link
              href="/kennisbank/zoeken"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium mt-4"
            >
              Bekijk alle artikelen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Interactive Tools */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Wrench className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Interactieve Tools</h2>
            </div>

            <div className="space-y-4">
              {featuredTools.map((tool, index) => {
                const Icon = tool.icon
                const isExternal = tool.external

                return isExternal ? (
                  <a
                    key={index}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${tool.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                            {tool.name}
                          </h3>
                          {tool.badge && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                    </div>
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={tool.href}
                    className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${tool.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                            {tool.name}
                          </h3>
                          {tool.badge && (
                            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>

            <Link
              href="/kennisbank/tools"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mt-4"
            >
              Alle tools bekijken
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>

        {/* Easy Read Banner */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Makkelijk Lezen Beschikbaar
              </h2>
              <p className="text-gray-600">
                Veel artikelen hebben een &apos;Makkelijk Lezen&apos; versie met korte zinnen en eenvoudige woorden.
                Speciaal voor mensen die liever eenvoudige teksten lezen.
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap">
              Meer informatie
            </button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Kun je niet vinden wat je zoekt?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Onze kennisbank groeit elke dag. Stel je vraag en wij helpen je verder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Stel een vraag
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/kennisbank/begrippen"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Bekijk begrippenlijst
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
