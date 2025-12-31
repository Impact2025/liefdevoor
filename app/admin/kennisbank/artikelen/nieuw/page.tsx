'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  ChevronDown,
  Info
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
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

export default function NewArticlePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'content' | 'easyread' | 'seo' | 'settings'>('content')

  // Form state
  const [form, setForm] = useState({
    titleNl: '',
    slug: '',
    excerptNl: '',
    contentNl: '',
    contentEasyRead: '',
    categoryId: '',
    articleType: 'STANDARD',
    targetAudience: ['GENERAL'],
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

  useEffect(() => {
    fetchCategories()
  }, [])

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

  // Auto-generate slug from title
  useEffect(() => {
    if (form.titleNl && !form.slug) {
      const slug = form.titleNl
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setForm(prev => ({ ...prev, slug }))
    }
  }, [form.titleNl])

  // Auto-generate meta title from title
  useEffect(() => {
    if (form.titleNl && !form.metaTitle) {
      setForm(prev => ({ ...prev, metaTitle: form.titleNl }))
    }
  }, [form.titleNl])

  // Auto-generate meta description from excerpt
  useEffect(() => {
    if (form.excerptNl && !form.metaDescription) {
      setForm(prev => ({ ...prev, metaDescription: form.excerptNl.substring(0, 155) }))
    }
  }, [form.excerptNl])

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase()
    if (keyword && !form.keywords.includes(keyword)) {
      setForm(prev => ({ ...prev, keywords: [...prev.keywords, keyword] }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
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

  const handleSave = async (publish = false) => {
    if (!validate()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/kennisbank/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isPublished: publish,
          hasEasyRead: !!form.contentEasyRead,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/kennisbank/artikelen/${data.data.article.id}`)
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
                <h1 className="font-semibold text-gray-900">Nieuw Artikel</h1>
                <p className="text-xs text-gray-500">Maak een nieuw kennisbank artikel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Opslaan als concept
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Publiceren
              </button>
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
                    onChange={(e) => setForm(prev => ({ ...prev, titleNl: e.target.value }))}
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
                      onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, excerptNl: e.target.value }))}
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
                      onChange={(e) => setForm(prev => ({ ...prev, contentNl: e.target.value }))}
                      placeholder="Schrijf je artikel hier... (Markdown ondersteund)"
                      rows={20}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm ${
                        errors.contentNl ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.contentNl && (
                      <p className="text-red-500 text-sm mt-1">{errors.contentNl}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Tip: Gebruik ## voor koppen, **tekst** voor vet, en - voor lijsten
                    </p>
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
                      onChange={(e) => setForm(prev => ({ ...prev, contentEasyRead: e.target.value }))}
                      placeholder="Schrijf hier de makkelijk lezen versie...

Tips:
- Gebruik korte zinnen (max 10 woorden)
- Vermijd moeilijke woorden
- Leg begrippen uit
- Gebruik opsommingen
- Schrijf actief (niet lijdend)"
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
                        onChange={(e) => setForm(prev => ({ ...prev, metaTitle: e.target.value }))}
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
                        onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
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

                    {/* SEO Preview */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Google Preview</p>
                      <div className="text-blue-700 text-lg hover:underline cursor-pointer">
                        {form.metaTitle || form.titleNl || 'Titel'}
                      </div>
                      <div className="text-green-700 text-sm">
                        liefdevooridereen.nl/kennisbank/.../{form.slug || 'slug'}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {form.metaDescription || form.excerptNl || 'Beschrijving van het artikel...'}
                      </div>
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
                            onClick={() => setForm(prev => ({
                              ...prev,
                              articleType: type.value,
                              isPillarPage: type.value === 'PILLAR'
                            }))}
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
                        onChange={(e) => setForm(prev => ({ ...prev, readingLevel: e.target.value }))}
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
                          onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
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
            {/* Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Categorie *</h3>
              <select
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
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
                    onClick={() => setForm(prev => ({ ...prev, featuredImage: '' }))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Voer een afbeeldings-URL in
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-rose-800 mb-2">Tips</h3>
                  <ul className="text-sm text-rose-700 space-y-1">
                    <li>• Gebruik een pakkende titel</li>
                    <li>• Schrijf een duidelijke samenvatting</li>
                    <li>• Voeg relevante keywords toe</li>
                    <li>• Overweeg een Easy Read versie</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
