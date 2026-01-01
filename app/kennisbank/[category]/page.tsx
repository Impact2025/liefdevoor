'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  Shield,
  Heart,
  MessageCircle,
  Users,
  BookOpen,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileText,
  LucideIcon,
  SlidersHorizontal
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Shield,
  Heart,
  MessageCircle,
  Users,
  BookOpen,
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
  children?: Category[]
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  articleType: string
  hasEasyRead: boolean
  viewCount: number
  category?: {
    name: string
    slug: string
  }
}

type ArticleType = 'all' | 'PILLAR' | 'GUIDE' | 'CHECKLIST' | 'STANDARD'

export default function CategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const categorySlug = params?.category as string
  const selectedSub = searchParams?.get('sub') || null

  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ArticleType>('all')
  const [showEasyReadOnly, setShowEasyReadOnly] = useState(false)
  const [totalArticles, setTotalArticles] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const articlesPerPage = 12

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/kennisbank/categories?includeChildren=true&includeCount=true`)
        if (response.ok) {
          const data = await response.json()
          const categories = data.data?.categories || []
          const found = categories.find((c: Category) => c.slug === categorySlug)
          if (found) {
            setCategory(found)
            setSubcategories(found.children || [])
          }
        }
      } catch (error) {
        console.error('Error fetching category:', error)
      }
    }

    fetchCategory()
  }, [categorySlug])

  const fetchArticles = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        category: categorySlug,
        page: currentPage.toString(),
        limit: articlesPerPage.toString(),
      })

      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }
      if (showEasyReadOnly) {
        params.append('easyRead', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/kennisbank/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.data?.articles || [])
        setTotalArticles(data.data?.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [categorySlug, selectedType, showEasyReadOnly, searchQuery, currentPage])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const selectedSubName = selectedSub
    ? subcategories.find(s => s.slug.endsWith(selectedSub))?.name
    : null

  const Icon = iconMap[category?.icon || 'FileText'] || FileText
  const totalPages = Math.ceil(totalArticles / articlesPerPage)

  if (!category && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium text-gray-900 mb-4">
            Categorie niet gevonden
          </h1>
          <Link href="/kennisbank" className="text-primary hover:text-primary-hover">
            ← Terug naar kennisbank
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/kennisbank" className="hover:text-gray-900 transition-colors">
              Kennisbank
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900">{category?.name || 'Laden...'}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                {selectedSubName || category?.name}
              </h1>
              {selectedSubName && (
                <Link
                  href={`/kennisbank/${categorySlug}`}
                  className="inline-block mt-2 text-sm text-primary hover:text-primary-hover"
                >
                  ← Alle {category?.name}
                </Link>
              )}
              {category?.description && !selectedSubName && (
                <p className="mt-3 text-gray-600 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Onderwerpen
                </h2>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      href={`/kennisbank/${categorySlug}`}
                      className={`block py-2 px-3 rounded text-sm transition-colors ${
                        !selectedSub
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      Alle artikelen
                    </Link>
                  </li>
                  {subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/kennisbank/${categorySlug}?sub=${sub.slug.split('-').pop()}`}
                        className={`block py-2 px-3 rounded text-sm transition-colors ${
                          selectedSub === sub.slug.split('-').pop()
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Filters - Collapsible on mobile */}
            <div className="hidden lg:block">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Filters
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value as ArticleType)
                      setCurrentPage(1)
                    }}
                    className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="all">Alle types</option>
                    <option value="PILLAR">Uitgebreide gids</option>
                    <option value="GUIDE">How-to</option>
                    <option value="CHECKLIST">Checklist</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEasyReadOnly}
                    onChange={(e) => {
                      setShowEasyReadOnly(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Alleen Makkelijk Lezen
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search & Filter Bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Zoeken..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value as ArticleType)
                      setCurrentPage(1)
                    }}
                    className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="all">Alle types</option>
                    <option value="PILLAR">Uitgebreide gids</option>
                    <option value="GUIDE">How-to</option>
                    <option value="CHECKLIST">Checklist</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEasyReadOnly}
                    onChange={(e) => {
                      setShowEasyReadOnly(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Alleen Makkelijk Lezen
                </label>
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              {totalArticles} artikel{totalArticles !== 1 ? 'en' : ''}
            </p>

            {/* Articles */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Geen artikelen gevonden</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedType('all')
                    setShowEasyReadOnly(false)
                    setCurrentPage(1)
                  }}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Filters wissen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/kennisbank/${categorySlug}/${article.slug}`}
                    className="group block p-5 bg-white border border-gray-200 rounded-lg hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {article.articleType === 'PILLAR' && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                              Uitgebreide gids
                            </span>
                          )}
                          {article.articleType === 'CHECKLIST' && (
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                              Checklist
                            </span>
                          )}
                          {article.hasEasyRead && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Easy Read
                            </span>
                          )}
                        </div>
                        <h2 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded text-sm ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
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
