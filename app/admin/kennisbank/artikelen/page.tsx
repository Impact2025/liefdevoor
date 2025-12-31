'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Star,
  BookOpen,
  Loader2,
  ArrowUpDown,
  X
} from 'lucide-react'

interface Article {
  id: string
  titleNl: string
  slug: string
  articleType: string
  isPublished: boolean
  isFeatured: boolean
  isPillarPage: boolean
  viewCount: number
  helpfulCount: number
  category: {
    nameNl: string
    slug: string
  }
  updatedAt: string
  publishedAt: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function AdminArticlesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.get('filter') || '')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [page, selectedCategory, selectedStatus, selectedType])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/kennisbank/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '20')
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedType) params.set('type', selectedType)
      if (searchQuery) params.set('search', searchQuery)

      // Handle status filter
      if (selectedStatus === 'draft') {
        params.set('published', 'false')
      } else if (selectedStatus === 'published') {
        params.set('published', 'true')
      }

      const response = await fetch(`/api/admin/kennisbank/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.data.articles || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotal(data.data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchArticles()
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/kennisbank/articles/${articleId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchArticles()
      }
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedArticles.length === 0) return

    if (action === 'delete' && !confirm(`Weet je zeker dat je ${selectedArticles.length} artikelen wilt verwijderen?`)) return

    try {
      const response = await fetch('/api/admin/kennisbank/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedArticles, action }),
      })
      if (response.ok) {
        setSelectedArticles([])
        fetchArticles()
      }
    } catch (error) {
      console.error('Error bulk action:', error)
    }
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedStatus('')
    setSelectedType('')
    setSearchQuery('')
    setPage(1)
  }

  const hasFilters = selectedCategory || selectedStatus || selectedType || searchQuery

  const articleTypeLabels: Record<string, string> = {
    STANDARD: 'Standaard',
    PILLAR: 'Pillar',
    GUIDE: 'Gids',
    CHECKLIST: 'Checklist',
    GLOSSARY: 'Begrip',
    SUCCESS_STORY: 'Succesverhaal',
    FAQ: 'FAQ',
    TOOL: 'Tool',
    PROFESSIONAL: 'Professional',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artikelen</h1>
          <p className="text-gray-500 mt-1">
            {total} artikelen in de kennisbank
          </p>
        </div>
        <Link
          href="/admin/kennisbank/artikelen/nieuw"
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuw Artikel
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek op titel..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasFilters
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Alle categorieën</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Alle statussen</option>
              <option value="published">Gepubliceerd</option>
              <option value="draft">Concept</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Alle types</option>
              {Object.entries(articleTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
                Wissen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-rose-700">
            {selectedArticles.length} artikelen geselecteerd
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
            >
              Publiceren
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
            >
              Depubliceren
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Verwijderen
            </button>
            <button
              onClick={() => setSelectedArticles([])}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen artikelen gevonden
            </h3>
            <p className="text-gray-500 mb-4">
              {hasFilters ? 'Probeer andere filters' : 'Begin met het maken van je eerste artikel'}
            </p>
            {!hasFilters && (
              <Link
                href="/admin/kennisbank/artikelen/nieuw"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nieuw Artikel
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedArticles.length === articles.length && articles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedArticles(articles.map(a => a.id))
                      } else {
                        setSelectedArticles([])
                      }
                    }}
                    className="w-4 h-4 text-rose-600 rounded border-gray-300"
                  />
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                  Artikel
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                  Views
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                  Bijgewerkt
                </th>
                <th className="w-12 p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(article.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedArticles([...selectedArticles, article.id])
                        } else {
                          setSelectedArticles(selectedArticles.filter(id => id !== article.id))
                        }
                      }}
                      className="w-4 h-4 text-rose-600 rounded border-gray-300"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        article.isPillarPage ? 'bg-rose-100' : 'bg-gray-100'
                      }`}>
                        {article.isPillarPage ? (
                          <Star className="w-5 h-5 text-rose-600" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/kennisbank/artikelen/${article.id}`}
                          className="font-medium text-gray-900 hover:text-rose-600 block truncate max-w-md"
                        >
                          {article.titleNl}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {article.category.nameNl}
                        </span>
                      </div>
                      {article.isFeatured && (
                        <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      article.articleType === 'PILLAR' ? 'bg-rose-100 text-rose-700' :
                      article.articleType === 'GLOSSARY' ? 'bg-emerald-100 text-emerald-700' :
                      article.articleType === 'GUIDE' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {articleTypeLabels[article.articleType] || article.articleType}
                    </span>
                  </td>
                  <td className="p-4">
                    {article.isPublished ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm">
                        <Clock className="w-4 h-4" />
                        Concept
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {article.viewCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-500">
                      {new Date(article.updatedAt).toLocaleDateString('nl-NL')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/kennisbank/${article.category.slug}/${article.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                        title="Bekijken"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/kennisbank/artikelen/${article.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                        title="Bewerken"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Pagina {page} van {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
