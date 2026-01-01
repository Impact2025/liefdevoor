'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield,
  Heart,
  MessageCircle,
  Users,
  BookOpen,
  Wrench,
  Search,
  ArrowRight,
  ChevronRight,
  Loader2,
  LucideIcon,
  FileText,
  Sparkles
} from 'lucide-react'

// Icon mapping for database icons
const iconMap: Record<string, LucideIcon> = {
  Shield,
  Heart,
  MessageCircle,
  Users,
  BookOpen,
  Wrench,
  FileText,
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  articleCount: number
}

interface Article {
  id: string
  title: string
  slug: string
  category: {
    name: string
    slug: string
  }
  excerpt?: string
  articleType?: string
  hasEasyRead?: boolean
}

export default function KennisbankPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, articlesRes] = await Promise.all([
          fetch('/api/kennisbank/categories?includeCount=true'),
          fetch('/api/kennisbank/articles?featured=true&limit=5')
        ])

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json()
          setCategories(catData.data?.categories || [])
        }

        if (articlesRes.ok) {
          const artData = await articlesRes.json()
          setFeaturedArticles(artData.data?.articles || [])
        }
      } catch (error) {
        console.error('Error fetching kennisbank data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/kennisbank/zoeken?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const totalArticles = categories.reduce((sum, cat) => sum + (cat.articleCount || 0), 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean & Minimal */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
              Kennisbank
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Betrouwbare informatie over veilig daten, inclusiviteit en gezonde relaties.
              {totalArticles > 0 && ` ${totalArticles} artikelen beschikbaar.`}
            </p>

            {/* Search Bar - Minimal */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek artikelen..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Categories - Left Column */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
              Categorieën
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon || 'FileText'] || FileText

                  return (
                    <Link
                      key={category.id}
                      href={`/kennisbank/${category.slug}`}
                      className="group flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                        <Icon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {category.description || 'Bekijk alle artikelen'}
                        </p>
                        <span className="mt-2 inline-block text-xs text-gray-400">
                          {category.articleCount || 0} artikelen
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  )
                })}

                {/* Tools Card */}
                <Link
                  href="/kennisbank/tools"
                  className="group flex items-start gap-4 p-5 bg-gradient-to-br from-primary/5 to-teal-500/5 border border-primary/20 rounded-lg hover:border-primary/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      Interactieve Tools
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      Quizzen, checkers en hulpmiddelen
                    </p>
                    <span className="mt-2 inline-block text-xs text-primary/70">
                      7 tools beschikbaar
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              </div>
            )}
          </div>

          {/* Featured Articles - Right Column */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
              Uitgelicht
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : featuredArticles.length > 0 ? (
              <div className="space-y-1">
                {featuredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/kennisbank/${article.category?.slug || 'artikel'}/${article.slug}`}
                    className="group block py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 -mx-3 px-3 rounded transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                      <span>{article.category?.name}</span>
                      {article.hasEasyRead && (
                        <>
                          <span>•</span>
                          <span className="text-teal-600">Easy Read</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nieuwe artikelen komen binnenkort.
              </p>
            )}

            <Link
              href="/kennisbank/zoeken"
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Alle artikelen bekijken
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Easy Read Section - Subtle */}
        <section className="mt-16 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                Makkelijk Lezen
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Veel artikelen hebben een vereenvoudigde versie met korte zinnen en eenvoudige woorden.
              </p>
            </div>
            <Link
              href="/kennisbank/zoeken?easyRead=true"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 whitespace-nowrap"
            >
              Bekijk artikelen →
            </Link>
          </div>
        </section>

        {/* Quick Links Footer */}
        <section className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link href="/kennisbank/veiligheid" className="text-gray-600 hover:text-primary transition-colors">
              Veiligheid
            </Link>
            <Link href="/kennisbank/inclusief-daten" className="text-gray-600 hover:text-primary transition-colors">
              Inclusief Daten
            </Link>
            <Link href="/kennisbank/communicatie" className="text-gray-600 hover:text-primary transition-colors">
              Communicatie
            </Link>
            <Link href="/kennisbank/relaties" className="text-gray-600 hover:text-primary transition-colors">
              Relaties
            </Link>
            <Link href="/kennisbank/tools" className="text-gray-600 hover:text-primary transition-colors">
              Tools
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-primary transition-colors">
              Hulp nodig?
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
