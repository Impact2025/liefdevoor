'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  ChevronRight,
  Clock,
  Eye,
  BookOpen,
  Wrench,
  ArrowRight,
  Filter,
  X,
  Loader2
} from 'lucide-react'

// Mock search results - will be replaced by API
const mockResults = [
  {
    id: '1',
    type: 'article',
    title: 'Romance Scams Herkennen: De Complete Gids',
    excerpt: 'Leer de belangrijkste signalen herkennen om jezelf te beschermen tegen dating fraude.',
    slug: 'veiligheid/romance-scams-herkennen',
    category: 'Veiligheid',
    readTime: 12,
    viewCount: 15420,
  },
  {
    id: '2',
    type: 'article',
    title: '20 Rode Vlaggen in Chatberichten',
    excerpt: 'Deze waarschuwingssignalen moet je kennen voordat je iemand ontmoet.',
    slug: 'veiligheid/20-rode-vlaggen-chatberichten',
    category: 'Veiligheid',
    readTime: 8,
    viewCount: 12380,
  },
  {
    id: '3',
    type: 'glossary',
    title: 'Ghosting',
    excerpt: 'Zonder uitleg alle contact verbreken.',
    slug: 'begrippen/ghosting',
    category: 'Begrippenlijst',
  },
  {
    id: '4',
    type: 'glossary',
    title: 'Love Bombing',
    excerpt: 'Overweldigende aandacht als manipulatietechniek.',
    slug: 'begrippen/love-bombing',
    category: 'Begrippenlijst',
  },
  {
    id: '5',
    type: 'tool',
    title: 'Scam Checker',
    excerpt: 'Analyseer berichten op verdachte patronen en rode vlaggen.',
    slug: 'tools/scam-checker',
    category: 'Tools',
  },
  {
    id: '6',
    type: 'article',
    title: 'Daten met Autisme: Praktische Tips',
    excerpt: 'Sociale signalen leren lezen en omgaan met sensorische overweldiging.',
    slug: 'inclusief-daten/daten-met-autisme',
    category: 'Inclusief Daten',
    readTime: 10,
    viewCount: 8920,
  },
  {
    id: '7',
    type: 'article',
    title: 'Veilig Afspreken: De Complete Checklist',
    excerpt: 'Praktische checklist voor een veilige eerste date.',
    slug: 'veiligheid/veilig-afspreken-checklist',
    category: 'Veiligheid',
    readTime: 5,
    viewCount: 7650,
  },
]

type ResultType = 'all' | 'article' | 'glossary' | 'tool'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedType, setSelectedType] = useState<ResultType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isSearching, setIsSearching] = useState(false)

  // Simulated search
  const results = useMemo(() => {
    if (!searchQuery.trim()) return []

    const lowerQuery = searchQuery.toLowerCase()
    let filtered = mockResults.filter(
      result =>
        result.title.toLowerCase().includes(lowerQuery) ||
        result.excerpt.toLowerCase().includes(lowerQuery)
    )

    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.type === selectedType)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => result.category === selectedCategory)
    }

    return filtered
  }, [searchQuery, selectedType, selectedCategory])

  // Get unique categories from results
  const categories = useMemo(() => {
    const cats = new Set(mockResults.map(r => r.category))
    return Array.from(cats)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setSearchQuery(query)
      setIsSearching(false)
    }, 500)
  }

  const clearFilters = () => {
    setSelectedType('all')
    setSelectedCategory('all')
  }

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
            <span className="text-gray-900 font-medium">Zoeken</span>
          </nav>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Zoeken in de Kennisbank
          </h1>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek artikelen, begrippen, of tools..."
                className="w-full pl-12 pr-32 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-300"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Zoeken'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h2>
                {(selectedType !== 'all' || selectedCategory !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Wissen
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">Type</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Alles' },
                    { value: 'article', label: 'Artikelen' },
                    { value: 'glossary', label: 'Begrippen' },
                    { value: 'tool', label: 'Tools' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={selectedType === option.value}
                        onChange={(e) => setSelectedType(e.target.value as ResultType)}
                        className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Categorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">Alle categorieën</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {searchQuery ? (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  {results.length} resultaten voor &quot;{searchQuery}&quot;
                  {(selectedType !== 'all' || selectedCategory !== 'all') && (
                    <span className="ml-2">
                      (gefilterd)
                    </span>
                  )}
                </p>

                {results.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Geen resultaten gevonden
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Probeer andere zoektermen of pas de filters aan.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Link
                        href="/kennisbank/veiligheid"
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                      >
                        Veiligheid
                      </Link>
                      <Link
                        href="/kennisbank/begrippen"
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                      >
                        Begrippenlijst
                      </Link>
                      <Link
                        href="/kennisbank/tools"
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                      >
                        Tools
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <Link
                        key={result.id}
                        href={`/kennisbank/${result.slug}`}
                        className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            result.type === 'article' ? 'bg-rose-100' :
                            result.type === 'glossary' ? 'bg-emerald-100' :
                            'bg-indigo-100'
                          }`}>
                            {result.type === 'article' ? (
                              <BookOpen className="w-5 h-5 text-rose-600" />
                            ) : result.type === 'glossary' ? (
                              <BookOpen className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Wrench className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                result.type === 'article' ? 'bg-rose-100 text-rose-700' :
                                result.type === 'glossary' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-indigo-100 text-indigo-700'
                              }`}>
                                {result.type === 'article' ? 'Artikel' :
                                 result.type === 'glossary' ? 'Begrip' :
                                 'Tool'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {result.category}
                              </span>
                            </div>
                            <h2 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors mb-1">
                              {result.title}
                            </h2>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {result.excerpt}
                            </p>
                            {result.type === 'article' && (
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                {result.readTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {result.readTime} min
                                  </span>
                                )}
                                {result.viewCount && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {result.viewCount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Waar ben je naar op zoek?
                </h3>
                <p className="text-gray-500 mb-6">
                  Typ een zoekterm om artikelen, begrippen en tools te vinden.
                </p>

                {/* Popular Searches */}
                <div>
                  <p className="text-sm text-gray-500 mb-3">Populaire zoekopdrachten:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['romance scam', 'ghosting', 'eerste bericht', 'veilig daten', 'autisme'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term)
                          setSearchQuery(term)
                        }}
                        className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-rose-100 hover:text-rose-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
