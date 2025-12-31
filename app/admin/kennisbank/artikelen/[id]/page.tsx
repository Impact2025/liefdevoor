'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Image as ImageIcon,
  FileText,
  Settings,
  Search as SearchIcon,
  X,
  Plus,
  BookOpen,
  Target,
  Sparkles,
  Trash2,
  ExternalLink,
  Clock,
  BarChart3
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Article {
  id: string
  titleNl: string
  slug: string
  excerptNl: string
  contentNl: string
  contentEasyRead: string | null
  categoryId: string
  articleType: string
  targetAudience: string[]
  readingLevel: string
  keywords: string[]
  metaTitle: string | null
  metaDescription: string | null
  featuredImage: string | null
  isPillarPage: boolean
  isFeatured: boolean
  isPublished: boolean
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  publishedAt: string | null
  updatedAt: string
  category: {
    nameNl: string
    slug: string
  }
}

const articleTypes = [
  { value: 'STANDARD', label: 'Standaard', description: 'Gewoon artikel' },
  { value: 'PILLAR', label: 'Pillar Page', description: 'Uitgebreide hoofdpagina' },
  { value: 'GUIDE', label: 'Gids', description: 'Stap-voor-stap gids' },
  { value: 'CHECKLIST', label: 'Checklist', description: 'Actie checklist' },
  { value: 'GLOSSARY', label: 'Begrip', description: 'Begripsverklaring' },
  { value: 'SUCCESS_STORY', label: 'Succesverhaal', description: 'Gebruikersverhaal' },
  { value: 'FAQ', label: 'FAQ', description: 'Veelgestelde vraag' },
  { value: 'PROFESSIONAL', label: 'Professional', description: 'B2B content' },
]

const targetAudiences = [
  { value: 'GENERAL', label: 'Algemeen' },
  { value: 'LVB', label: 'LVB (Makkelijk Lezen)' },
  { value: 'AUTISM', label: 'Autisme' },
  { value: 'VISUAL_IMPAIRED', label: 'Visueel Beperkt' },
  { value: 'SENIOR', label: 'Senioren' },
  { value: 'PROFESSIONAL', label: 'Professionals' },
  { value: 'LGBTQ', label: 'LGBTQ+' },
]

const readingLevels = [
  { value: 'EASY', label: 'Makkelijk (B1)' },
  { value: 'STANDARD', label: 'Standaard (B2)' },
  { value: 'ADVANCED', label: 'Gevorderd (C1)' },
]

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'content' | 'easyread' | 'seo' | 'settings'>('content')
  const [article, setArticle] = useState<Article | null>(null)

  // Form state
  const [form, setForm] = useState({
    titleNl: '',
    slug: '',
    excerptNl: '',
    contentNl: '',
    contentEasyRead: '',
    categoryId: '',
    articleType: 'STANDARD',
    targetAudience: ['GENERAL'] as string[],
    readingLevel: 'STANDARD',
    keywords: [] as string[],
    metaTitle: '',
    metaDescription: '',
    featuredImage: '',
    isPillarPage: false,
    isFeatured: false,
    isPublished: false,
  })

  const [keywordInput, setKeywordInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (articleId) {
      fetchArticle()
    }
  }, [articleId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/kennisbank/categories?includeChildren=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/admin/kennisbank/articles/${articleId}`)
      if (response.ok) {
        const data = await response.json()
        const article = data.data.article
        setArticle(article)
        setForm({
          titleNl: article.titleNl || '',
          slug: article.slug || '',
          excerptNl: article.excerptNl || '',
          contentNl: article.contentNl || '',
          contentEasyRead: article.contentEasyRead || '',
          categoryId: article.categoryId || '',
          articleType: article.articleType || 'STANDARD',
          targetAudience: article.targetAudience || ['GENERAL'],
          readingLevel: article.readingLevel || 'STANDARD',
          keywords: article.keywords || [],
          metaTitle: article.metaTitle || '',
          metaDescription: article.metaDescription || '',
          featuredImage: article.featuredImage || '',
          isPillarPage: article.isPillarPage || false,
          isFeatured: article.isFeatured || false,
          isPublished: article.isPublished || false,
        })
      } else {
        router.push('/admin/kennisbank/artikelen')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      router.push('/admin/kennisbank/artikelen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase()
    if (keyword && !form.keywords.includes(keyword)) {
      setForm(prev => ({ ...prev, keywords: [...prev.keywords, keyword] }))
      setKeywordInput('')
      setHasChanges(true)
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
    setHasChanges(true)
  }

  const handleAudienceToggle = (audience: string) => {
    setForm(prev => {
      const current = prev.targetAudience
      if (current.includes(audience)) {
        return { ...prev, targetAudience: current.filter(a => a !== audience) }
      } else {
        return { ...prev, targetAudience: [...current, audience] }
      }
    })
    setHasChanges(true)
  }

  const handleFormChange = (updates: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.titleNl) newErrors.titleNl = 'Titel is verplicht'
    if (!form.slug) newErrors.slug = 'Slug is verplicht'
    if (!form.contentNl) newErrors.contentNl = 'Content is verplicht'
    if (!form.categoryId) newErrors.categoryId = 'Categorie is verplicht'

    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug = 'Slug mag alleen kleine letters, cijfers en streepjes bevatten'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (publish?: boolean) => {
    if (!validate()) return

    setIsSaving(true)
    try {
      const updateData = {
        ...form,
        hasEasyRead: !!form.contentEasyRead,
      }

      if (typeof publish === 'boolean') {
        updateData.isPublished = publish
      }

      const response = await fetch(`/api/kennisbank/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setHasChanges(false)
        fetchArticle() // Refresh data
      } else {
        const error = await response.json()
        alert(error.error || 'Er ging iets mis')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Er ging iets mis bij het opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kennisbank/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/kennisbank/artikelen')
      } else {
        alert('Er ging iets mis bij het verwijderen')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Er ging iets mis bij het verwijderen')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/kennisbank/artikelen"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900 truncate max-w-md">
                  {form.titleNl || 'Artikel Bewerken'}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {article?.isPublished ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Gepubliceerd
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      Concept
                    </span>
                  )}
                  {hasChanges && (
                    <span className="text-rose-600">• Niet opgeslagen wijzigingen</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {article?.isPublished && (
                <Link
                  href={`/kennisbank/${article.category.slug}/${article.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Bekijken
                </Link>
              )}
              <button
                onClick={() => handleSave()}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Opslaan
              </button>
              {form.isPublished ? (
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Depubliceren
                </button>
              ) : (
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  Publiceren
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={form.titleNl}
                    onChange={(e) => handleFormChange({ titleNl: e.target.value })}
                    placeholder="Bijv. Romance Scams Herkennen: De Complete Gids"
                    className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      errors.titleNl ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.titleNl && (
                    <p className="text-red-500 text-sm mt-1">{errors.titleNl}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">/kennisbank/.../</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => handleFormChange({ slug: e.target.value })}
                      placeholder="romance-scams-herkennen"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                        errors.slug ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Samenvatting
                  </label>
                  <textarea
                    value={form.excerptNl}
                    onChange={(e) => handleFormChange({ excerptNl: e.target.value })}
                    placeholder="Korte beschrijving die in overzichten wordt getoond..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b">
                {[
                  { id: 'content', label: 'Content', icon: FileText },
                  { id: 'easyread', label: 'Makkelijk Lezen', icon: BookOpen },
                  { id: 'seo', label: 'SEO', icon: SearchIcon },
                  { id: 'settings', label: 'Instellingen', icon: Settings },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === id
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'content' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artikel Content *
                    </label>
                    <textarea
                      value={form.contentNl}
                      onChange={(e) => handleFormChange({ contentNl: e.target.value })}
                      placeholder="Schrijf je artikel hier... (Markdown ondersteund)"
                      rows={20}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm ${
                        errors.contentNl ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.contentNl && (
                      <p className="text-red-500 text-sm mt-1">{errors.contentNl}</p>
                    )}
                  </div>
                )}

                {activeTab === 'easyread' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Makkelijk Lezen (LVB)</h4>
                          <p className="text-sm text-blue-600 mt-1">
                            Schrijf een vereenvoudigde versie met korte zinnen,
                            eenvoudige woorden, en duidelijke structuur.
                          </p>
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={form.contentEasyRead}
                      onChange={(e) => handleFormChange({ contentEasyRead: e.target.value })}
                      placeholder="Schrijf hier de makkelijk lezen versie..."
                      rows={20}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Titel
                        <span className="text-gray-400 font-normal ml-2">
                          ({form.metaTitle.length}/60)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={form.metaTitle}
                        onChange={(e) => handleFormChange({ metaTitle: e.target.value })}
                        placeholder="SEO titel (max 60 karakters)"
                        maxLength={60}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Beschrijving
                        <span className="text-gray-400 font-normal ml-2">
                          ({form.metaDescription.length}/160)
                        </span>
                      </label>
                      <textarea
                        value={form.metaDescription}
                        onChange={(e) => handleFormChange({ metaDescription: e.target.value })}
                        placeholder="SEO beschrijving (max 160 karakters)"
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keywords
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                          placeholder="Voeg keyword toe"
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <button
                          onClick={handleAddKeyword}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {form.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {keyword}
                              <button onClick={() => handleRemoveKeyword(keyword)}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Artikel Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {articleTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => handleFormChange({
                              articleType: type.value,
                              isPillarPage: type.value === 'PILLAR'
                            })}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              form.articleType === type.value
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doelgroep
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {targetAudiences.map((audience) => (
                          <button
                            key={audience.value}
                            onClick={() => handleAudienceToggle(audience.value)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                              form.targetAudience.includes(audience.value)
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {audience.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leesniveau
                      </label>
                      <select
                        value={form.readingLevel}
                        onChange={(e) => handleFormChange({ readingLevel: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {readingLevels.map((level) => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.isFeatured}
                          onChange={(e) => handleFormChange({ isFeatured: e.target.checked })}
                          className="w-4 h-4 text-rose-600 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Uitgelicht artikel</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {article && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Statistieken
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weergaven</span>
                    <span className="font-medium">{article.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nuttig</span>
                    <span className="font-medium text-emerald-600">
                      {article.helpfulCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Niet nuttig</span>
                    <span className="font-medium text-red-600">
                      {article.notHelpfulCount}
                    </span>
                  </div>
                  {article.publishedAt && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-gray-600">Gepubliceerd</span>
                      <span className="text-sm">
                        {new Date(article.publishedAt).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bijgewerkt</span>
                    <span className="text-sm">
                      {new Date(article.updatedAt).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Categorie *</h3>
              <select
                value={form.categoryId}
                onChange={(e) => handleFormChange({ categoryId: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  errors.categoryId ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Selecteer categorie...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Uitgelichte Afbeelding</h3>
              {form.featuredImage ? (
                <div className="relative">
                  <img
                    src={form.featuredImage}
                    alt="Featured"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleFormChange({ featuredImage: '' })}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={form.featuredImage}
                    onChange={(e) => handleFormChange({ featuredImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-medium text-red-800 mb-4">Gevaarlijke Zone</h3>
              <p className="text-sm text-red-600 mb-4">
                Dit artikel permanent verwijderen. Dit kan niet ongedaan worden gemaakt.
              </p>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 w-full justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Artikel Verwijderen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
