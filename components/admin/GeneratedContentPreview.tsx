'use client'

import { useState } from 'react'
import { FileText, Search, Share2, Image, Save, CheckCircle, Trash2, Copy } from 'lucide-react'
import type { GeneratedBlogContent, SavePostData, BlogCategory } from '@/lib/types'

interface GeneratedContentPreviewProps {
  content: GeneratedBlogContent | null
  onSave: (data: SavePostData) => Promise<void>
  onDiscard: () => void
  categories: BlogCategory[]
}

export default function GeneratedContentPreview({
  content,
  onSave,
  onDiscard,
  categories,
}: GeneratedContentPreviewProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'content' | 'seo' | 'social' | 'image'>('content')
  const [editedContent, setEditedContent] = useState<GeneratedBlogContent | null>(content)
  const [saveOptions, setSaveOptions] = useState({
    title: '',
    categoryId: '',
    featuredImage: '',
    published: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Update edited content when prop changes
  if (content && editedContent !== content) {
    setEditedContent(content)
    // Auto-fill title from seoTitle
    if (!saveOptions.title && content.seoTitle) {
      setSaveOptions(prev => ({ ...prev, title: content.seoTitle }))
    }
  }

  if (!editedContent) {
    return null
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSave = async (publish: boolean) => {
    if (!saveOptions.title || !saveOptions.categoryId) {
      alert('Vul alle verplichte velden in (Titel en Categorie)')
      return
    }

    setIsSaving(true)
    try {
      const saveData: SavePostData = {
        title: saveOptions.title,
        content: editedContent.content,
        excerpt: editedContent.excerpt,
        featuredImage: saveOptions.featuredImage || undefined,
        categoryId: saveOptions.categoryId,
        published: publish,
      }

      await onSave(saveData)
    } finally {
      setIsSaving(false)
    }
  }

  const previewTabs = [
    { id: 'content' as const, label: 'Content', icon: FileText },
    { id: 'seo' as const, label: 'SEO', icon: Search },
    { id: 'social' as const, label: 'Social Media', icon: Share2 },
    { id: 'image' as const, label: 'Afbeelding', icon: Image },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-rose-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Gegenereerde Content</h3>
        <button
          onClick={onDiscard}
          className="text-gray-500 hover:text-red-600 transition-colors"
          disabled={isSaving}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {previewTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActivePreviewTab(tab.id)}
              className={`flex items-center px-4 py-3 font-medium transition-colors ${
                activePreviewTab === tab.id
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activePreviewTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content
              </label>
              <textarea
                value={editedContent.content}
                onChange={(e) =>
                  setEditedContent((prev) => prev && { ...prev, content: e.target.value })
                }
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Preview
              </label>
              <div
                className="border border-gray-200 rounded-lg p-6 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: editedContent.content }}
              />
            </div>
          </div>
        )}

        {activePreviewTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title <span className="text-gray-500">({editedContent.seoTitle.length}/60)</span>
              </label>
              <input
                type="text"
                value={editedContent.seoTitle}
                onChange={(e) =>
                  setEditedContent((prev) => prev && { ...prev, seoTitle: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                  editedContent.seoTitle.length > 60 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {editedContent.seoTitle.length > 60 && (
                <p className="text-red-500 text-xs mt-1">Title is te lang (max 60 karakters)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description{' '}
                <span className="text-gray-500">({editedContent.seoDescription.length}/155)</span>
              </label>
              <textarea
                value={editedContent.seoDescription}
                onChange={(e) =>
                  setEditedContent((prev) => prev && { ...prev, seoDescription: e.target.value })
                }
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                  editedContent.seoDescription.length > 155 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {editedContent.seoDescription.length > 155 && (
                <p className="text-red-500 text-xs mt-1">Description is te lang (max 155 karakters)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (5 long-tail keywords)
              </label>
              <div className="flex flex-wrap gap-2">
                {editedContent.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePreviewTab === 'social' && (
          <div className="space-y-4">
            {/* Instagram */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Instagram</h4>
                <button
                  onClick={() => handleCopy(editedContent.socialMedia.instagram, 'instagram')}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                >
                  {copiedField === 'instagram' ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopieer
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={editedContent.socialMedia.instagram}
                onChange={(e) =>
                  setEditedContent(
                    (prev) =>
                      prev && {
                        ...prev,
                        socialMedia: { ...prev.socialMedia, instagram: e.target.value },
                      }
                  )
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedContent.socialMedia.instagram.length} karakters
              </p>
            </div>

            {/* Facebook */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Facebook</h4>
                <button
                  onClick={() => handleCopy(editedContent.socialMedia.facebook, 'facebook')}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                >
                  {copiedField === 'facebook' ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopieer
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={editedContent.socialMedia.facebook}
                onChange={(e) =>
                  setEditedContent(
                    (prev) =>
                      prev && {
                        ...prev,
                        socialMedia: { ...prev.socialMedia, facebook: e.target.value },
                      }
                  )
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedContent.socialMedia.facebook.length} karakters
              </p>
            </div>

            {/* LinkedIn */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">LinkedIn</h4>
                <button
                  onClick={() => handleCopy(editedContent.socialMedia.linkedin, 'linkedin')}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                >
                  {copiedField === 'linkedin' ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopieer
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={editedContent.socialMedia.linkedin}
                onChange={(e) =>
                  setEditedContent(
                    (prev) =>
                      prev && {
                        ...prev,
                        socialMedia: { ...prev.socialMedia, linkedin: e.target.value },
                      }
                  )
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedContent.socialMedia.linkedin.length} karakters
              </p>
            </div>

            {/* Twitter */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Twitter/X</h4>
                <button
                  onClick={() => handleCopy(editedContent.socialMedia.twitter, 'twitter')}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                >
                  {copiedField === 'twitter' ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopieer
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={editedContent.socialMedia.twitter}
                onChange={(e) =>
                  setEditedContent(
                    (prev) =>
                      prev && {
                        ...prev,
                        socialMedia: { ...prev.socialMedia, twitter: e.target.value },
                      }
                  )
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedContent.socialMedia.twitter.length}/280 karakters
              </p>
            </div>
          </div>
        )}

        {activePreviewTab === 'image' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Midjourney Prompt (Engels)
              </label>
              <div className="flex gap-2">
                <textarea
                  value={editedContent.midjourneyPrompt}
                  onChange={(e) =>
                    setEditedContent((prev) => prev && { ...prev, midjourneyPrompt: e.target.value })
                  }
                  rows={4}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleCopy(editedContent.midjourneyPrompt, 'midjourney')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  {copiedField === 'midjourney' ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Gekopieerd
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopieer
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gebruik deze prompt in Midjourney of DALL-E om een featured image te genereren
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL (optioneel)
              </label>
              <input
                type="text"
                value={saveOptions.featuredImage}
                onChange={(e) => setSaveOptions(prev => ({ ...prev, featuredImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload een afbeelding naar een hosting service en plak de URL hier
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save Options */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h4 className="font-medium text-gray-900">Opslaan als Blog Post</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={saveOptions.title}
              onChange={(e) => setSaveOptions(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Blog post titel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorie <span className="text-red-500">*</span>
            </label>
            <select
              value={saveOptions.categoryId}
              onChange={(e) => setSaveOptions(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Selecteer categorie...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-5 h-5 mr-2" />
            Opslaan als Concept
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Publiceren
          </button>
        </div>
      </div>
    </div>
  )
}
