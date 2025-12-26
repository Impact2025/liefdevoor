'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Sparkles,
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Search,
  Wand2,
  FileText,
  Share2,
  Settings,
  X
} from 'lucide-react'
import type { GeneratedBlogContent } from '@/lib/types/blog'

// Dynamic import for rich text editor (client-only)
const RichTextEditor = dynamic(() => import('@/components/blog/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
})

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

type TabType = 'editor' | 'seo' | 'social' | 'settings'

export default function NewBlogPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [published, setPublished] = useState(false)

  // SEO state
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])

  // Social media state
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  })
  const [midjourneyPrompt, setMidjourneyPrompt] = useState('')

  // AI Generator state
  const [primaryKeyword, setPrimaryKeyword] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [toneOfVoice, setToneOfVoice] = useState('vriendelijk en motiverend')
  const [articleLength, setArticleLength] = useState(1200)

  // UI state
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('editor')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
        if (data.categories.length > 0) {
          setCategoryId(data.categories[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateWithAI = async () => {
    if (!primaryKeyword.trim()) {
      setError('Voer een primair keyword in')
      return
    }
    if (!categoryId) {
      setError('Selecteer een categorie')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword,
          category: categoryId,
          year: new Date().getFullYear().toString(),
          targetAudience: targetAudience || undefined,
          toneOfVoice,
          articleLength
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generatie mislukt')
      }

      const generated: GeneratedBlogContent = await res.json()

      // Update all fields with generated content
      setContent(generated.content)
      setSeoTitle(generated.seoTitle)
      setSeoDescription(generated.seoDescription)
      setKeywords(generated.keywords || [])
      setExcerpt(generated.excerpt)
      setMidjourneyPrompt(generated.midjourneyPrompt)
      setSocialMedia(generated.socialMedia)

      // Extract title from content H1
      const h1Match = generated.content.match(/<h1[^>]*>(.*?)<\/h1>/i)
      if (h1Match) {
        setTitle(h1Match[1].replace(/<[^>]*>/g, ''))
      }

      setSuccess('Content succesvol gegenereerd!')
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setGenerating(false)
    }
  }

  const savePost = async (asDraft = false) => {
    if (!title.trim()) {
      setError('Voer een titel in')
      return
    }
    if (!content.trim()) {
      setError('Voer content in')
      return
    }
    if (!categoryId) {
      setError('Selecteer een categorie')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          categoryId,
          featuredImage: featuredImage || undefined,
          published: asDraft ? false : published
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Opslaan mislukt')
      }

      const data = await res.json()
      setSuccess(asDraft ? 'Concept opgeslagen!' : 'Artikel gepubliceerd!')

      // Redirect to blog management after short delay
      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, use a placeholder or URL input
    // In production, you'd upload to a storage service
    const url = URL.createObjectURL(file)
    setFeaturedImage(url)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/blog')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nieuw Artikel</h1>
                <p className="text-sm text-gray-500">Wereldklasse Blog Editor</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  showAiPanel
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wand2 size={18} />
                AI Generator
              </button>

              <button
                onClick={() => window.open(`/blog/preview?content=${encodeURIComponent(content)}`, '_blank')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                disabled={!content}
              >
                <Eye size={18} />
                Preview
              </button>

              <button
                onClick={() => savePost(true)}
                disabled={saving || !title || !content}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FileText size={18} />
                Concept
              </button>

              <button
                onClick={() => {
                  setPublished(true)
                  savePost(false)
                }}
                disabled={saving || !title || !content}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-rose-hover transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Publiceren
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)}><X size={18} /></button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className={`${showAiPanel ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {/* Tabs */}
            <div className="bg-white rounded-t-lg border border-b-0 border-gray-200">
              <div className="flex">
                {[
                  { id: 'editor', label: 'Editor', icon: FileText },
                  { id: 'seo', label: 'SEO', icon: Search },
                  { id: 'social', label: 'Social Media', icon: Share2 },
                  { id: 'settings', label: 'Instellingen', icon: Settings }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-rose-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg border border-gray-200 p-6">
              {/* Editor Tab */}
              {activeTab === 'editor' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="De perfecte titel voor je artikel..."
                      className="w-full px-4 py-3 text-xl font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Category & Featured Image */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categorie *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={featuredImage}
                          onChange={(e) => setFeaturedImage(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2">
                          <Upload size={18} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Featured Image Preview */}
                  {featuredImage && (
                    <div className="relative">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setFeaturedImage('')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Rich Text Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Begin met schrijven of gebruik de AI Generator..."
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt (samenvatting)
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Korte samenvatting van het artikel..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{excerpt.length}/200 karakters</p>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Google Preview</h3>
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {seoTitle || title || 'Je artikel titel'}
                      </div>
                      <div className="text-green-700 text-sm">
                        liefdevooriedereen.nl/blog/{title ? title.toLowerCase().replace(/\s+/g, '-').substring(0, 30) : 'artikel-slug'}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {seoDescription || excerpt || 'Je meta beschrijving verschijnt hier...'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Titel
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Optimale titel voor zoekmachines..."
                      maxLength={60}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{seoTitle.length}/60 karakters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Beschrijving
                    </label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Beschrijving voor zoekmachines..."
                      maxLength={155}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{seoDescription.length}/155 karakters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                        >
                          {keyword}
                          <button
                            onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))}
                            className="hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Voeg keyword toe (Enter)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          e.preventDefault()
                          setKeywords([...keywords, e.currentTarget.value])
                          e.currentTarget.value = ''
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  {/* Instagram */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <Instagram size={20} />
                        <span className="font-medium">Instagram</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(socialMedia.instagram, 'instagram')}
                        className="text-white/80 hover:text-white"
                      >
                        {copiedField === 'instagram' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <textarea
                      value={socialMedia.instagram}
                      onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                      placeholder="Instagram caption met hashtags..."
                      rows={3}
                      maxLength={150}
                      className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-white/60 border-0 focus:ring-2 focus:ring-white/50"
                    />
                    <p className="text-white/70 text-xs mt-1">{socialMedia.instagram.length}/150</p>
                  </div>

                  {/* Facebook */}
                  <div className="bg-blue-600 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <Facebook size={20} />
                        <span className="font-medium">Facebook</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(socialMedia.facebook, 'facebook')}
                        className="text-white/80 hover:text-white"
                      >
                        {copiedField === 'facebook' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <textarea
                      value={socialMedia.facebook}
                      onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                      placeholder="Facebook post..."
                      rows={3}
                      maxLength={250}
                      className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-white/60 border-0 focus:ring-2 focus:ring-white/50"
                    />
                    <p className="text-white/70 text-xs mt-1">{socialMedia.facebook.length}/250</p>
                  </div>

                  {/* LinkedIn */}
                  <div className="bg-blue-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <Linkedin size={20} />
                        <span className="font-medium">LinkedIn</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(socialMedia.linkedin, 'linkedin')}
                        className="text-white/80 hover:text-white"
                      >
                        {copiedField === 'linkedin' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <textarea
                      value={socialMedia.linkedin}
                      onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                      placeholder="LinkedIn post..."
                      rows={3}
                      maxLength={200}
                      className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-white/60 border-0 focus:ring-2 focus:ring-white/50"
                    />
                    <p className="text-white/70 text-xs mt-1">{socialMedia.linkedin.length}/200</p>
                  </div>

                  {/* Twitter/X */}
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <Twitter size={20} />
                        <span className="font-medium">X (Twitter)</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(socialMedia.twitter, 'twitter')}
                        className="text-white/80 hover:text-white"
                      >
                        {copiedField === 'twitter' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <textarea
                      value={socialMedia.twitter}
                      onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                      placeholder="Tweet..."
                      rows={3}
                      maxLength={280}
                      className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-white/60 border-0 focus:ring-2 focus:ring-white/50"
                    />
                    <p className="text-white/70 text-xs mt-1">{socialMedia.twitter.length}/280</p>
                  </div>

                  {/* Midjourney Prompt */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <ImageIcon size={20} />
                        <span className="font-medium">Midjourney/DALL-E Prompt</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(midjourneyPrompt, 'midjourney')}
                        className="text-white/80 hover:text-white"
                      >
                        {copiedField === 'midjourney' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <textarea
                      value={midjourneyPrompt}
                      onChange={(e) => setMidjourneyPrompt(e.target.value)}
                      placeholder="Prompt voor AI afbeelding generatie..."
                      rows={3}
                      className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-white/60 border-0 focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Direct publiceren</span>
                        <p className="text-sm text-gray-500">Artikel is meteen zichtbaar op de blog</p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Artikel Statistieken</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {content.split(/\s+/).filter(Boolean).length}
                        </div>
                        <div className="text-sm text-gray-600">Woorden</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min
                        </div>
                        <div className="text-sm text-gray-600">Leestijd</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Generator Panel */}
          {showAiPanel && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles size={20} />
                    <h2 className="font-semibold">AI Blog Generator</h2>
                  </div>
                  <p className="text-white/80 text-sm mt-1">
                    Genereer SEO-geoptimaliseerde content
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primair Keyword *
                    </label>
                    <input
                      type="text"
                      value={primaryKeyword}
                      onChange={(e) => setPrimaryKeyword(e.target.value)}
                      placeholder="bijv. Online dating tips"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorie *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doelgroep
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="bijv. 25-35 jaar, stedelingen"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone of Voice
                    </label>
                    <select
                      value={toneOfVoice}
                      onChange={(e) => setToneOfVoice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="vriendelijk en motiverend">Vriendelijk en motiverend</option>
                      <option value="professioneel en informatief">Professioneel en informatief</option>
                      <option value="casual en humoristisch">Casual en humoristisch</option>
                      <option value="empathisch en begripvol">Empathisch en begripvol</option>
                      <option value="inspirerend en positief">Inspirerend en positief</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artikel Lengte
                    </label>
                    <select
                      value={articleLength}
                      onChange={(e) => setArticleLength(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={800}>Kort (800 woorden)</option>
                      <option value={1200}>Gemiddeld (1200 woorden)</option>
                      <option value={1800}>Lang (1800 woorden)</option>
                      <option value={2500}>Uitgebreid (2500 woorden)</option>
                    </select>
                  </div>

                  <button
                    onClick={generateWithAI}
                    disabled={generating || !primaryKeyword || !categoryId}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Genereren...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Genereer met AI
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Genereert: artikel, SEO metadata, social media posts & image prompt
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
