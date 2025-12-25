/**
 * FAQ Browse Page
 * Browse all FAQ articles with search and category filtering
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface FAQCategory {
  id: string
  nameNl: string
  icon?: string
  slug: string
  _count: {
    articles: number
  }
}

interface FAQArticle {
  id: string
  titleNl: string
  slug: string
  excerpt?: string
  viewCount: number
  helpfulCount: number
  category: {
    nameNl: string
    icon?: string
  }
}

function FAQContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams?.get('category')
  const searchParam = searchParams?.get('q')

  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [articles, setArticles] = useState<FAQArticle[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<FAQArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParam || '')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')

  useEffect(() => {
    fetchCategories()
    fetchFeaturedArticles()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, searchQuery])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/faq/categories')
      const data = await response.json()
      if (data.success && data.data?.categories) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchFeaturedArticles = async () => {
    try {
      const response = await fetch('/api/faq/articles?featured=true&limit=3')
      const data = await response.json()
      if (data.success && data.data?.articles) {
        setFeaturedArticles(data.data.articles)
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error)
    }
  }

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/faq/articles?${params.toString()}`)
      const data = await response.json()
      if (data.success && data.data?.articles) {
        setArticles(data.data.articles)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCategory !== 'all') params.append('category', selectedCategory)
    router.push(`/support/faq?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const params = new URLSearchParams()
    if (category !== 'all') params.append('category', category)
    if (searchQuery) params.append('q', searchQuery)
    router.push(`/support/faq?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/support"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar Support
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Veelgestelde Vragen</h1>
          <p className="text-lg text-gray-600">
            Vind antwoorden op veelgestelde vragen over Liefde Voor Iedereen
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek in FAQ artikelen..."
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Alle categorieën
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === category.slug
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                {category.nameNl}
                <span className={`text-xs ${selectedCategory === category.slug ? 'text-white/80' : 'text-gray-500'}`}>
                  ({category._count.articles})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {!searchQuery && selectedCategory === 'all' && featuredArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meest gelezen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/support/faq/${article.slug}`}
                  className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
                >
                  {article.category.icon && (
                    <div className="text-3xl mb-3">{article.category.icon}</div>
                  )}
                  <h3 className="text-lg font-semibold mb-2">{article.titleNl}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-white/80 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {article.helpfulCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `Zoekresultaten voor "${searchQuery}"`
                : selectedCategory === 'all'
                ? 'Alle artikelen'
                : `Artikelen in ${categories.find(c => c.slug === selectedCategory)?.nameNl}`}
            </h2>
            <span className="text-sm text-gray-500">
              {articles.length} artikel{articles.length !== 1 ? 'en' : ''}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen artikelen gevonden</h3>
              <p className="text-gray-600 mb-4">
                Probeer een andere zoekopdracht of categorie
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  router.push('/support/faq')
                }}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Wis filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/support/faq/${article.slug}`}
                  className="block bg-white rounded-lg p-6 border border-gray-200 hover:border-rose-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    {article.category.icon && (
                      <div className="text-2xl flex-shrink-0">{article.category.icon}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{article.titleNl}</h3>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      {article.excerpt && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {article.category.nameNl}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {article.viewCount} weergaven
                        </span>
                        {article.helpfulCount > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {article.helpfulCount} nuttig
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help Card */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Antwoord niet gevonden?</h2>
          <p className="mb-6 text-blue-100">
            Chat met onze AI assistent of maak een support ticket aan
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/support/tickets/new"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Maak ticket aan
            </Link>
            <Link
              href="/support"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Terug naar Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <FAQContent />
    </Suspense>
  )
}
