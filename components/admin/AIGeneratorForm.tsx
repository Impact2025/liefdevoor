'use client'

import { useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import type { AIGeneratorParams } from '@/lib/types/blog'
import type { BlogCategory } from '@/lib/types/api'

interface AIGeneratorFormProps {
  categories: BlogCategory[]
  onGenerate: (params: AIGeneratorParams) => Promise<void>
  isGenerating: boolean
}

export default function AIGeneratorForm({ categories, onGenerate, isGenerating }: AIGeneratorFormProps) {
  const [formData, setFormData] = useState<AIGeneratorParams>({
    primaryKeyword: '',
    category: '',
    year: new Date().getFullYear().toString(),
    targetAudience: '',
    toneOfVoice: 'vriendelijk en motiverend',
    articleLength: 1200,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const toneOptions = [
    'vriendelijk en motiverend',
    'professioneel',
    'informeel en toegankelijk',
    'inspirerend',
    'humoristisch',
  ]

  const lengthOptions = [
    { value: 800, label: 'Kort (800 woorden)' },
    { value: 1200, label: 'Gemiddeld (1200 woorden)' },
    { value: 1600, label: 'Lang (1600 woorden)' },
    { value: 2000, label: 'Uitgebreid (2000 woorden)' },
  ]

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.primaryKeyword.trim()) {
      newErrors.primaryKeyword = 'Primary keyword is verplicht'
    } else if (formData.primaryKeyword.length < 3) {
      newErrors.primaryKeyword = 'Minimaal 3 karakters'
    } else if (formData.primaryKeyword.length > 100) {
      newErrors.primaryKeyword = 'Maximaal 100 karakters'
    }

    if (!formData.category) {
      newErrors.category = 'Selecteer een categorie'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    await onGenerate(formData)
  }

  const handleReset = () => {
    setFormData({
      primaryKeyword: '',
      category: '',
      year: new Date().getFullYear().toString(),
      targetAudience: '',
      toneOfVoice: 'vriendelijk en motiverend',
      articleLength: 1200,
    })
    setErrors({})
  }

  const handleChange = (field: keyof AIGeneratorParams, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="bg-gradient-to-br from-rose-50 to-teal-50 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Sparkles className="w-6 h-6 text-rose-500 mr-2" />
        <h3 className="text-xl font-bold text-gray-900">AI Blog Generator</h3>
      </div>

      <p className="text-gray-600 mb-6">
        Genereer een complete SEO-geoptimaliseerde blog post met AI, inclusief social media content en Midjourney prompts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Keyword */}
          <div>
            <label htmlFor="primaryKeyword" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Keyword <span className="text-red-500">*</span>
            </label>
            <input
              id="primaryKeyword"
              type="text"
              value={formData.primaryKeyword}
              onChange={(e) => handleChange('primaryKeyword', e.target.value)}
              placeholder="bijv. online dating tips 2025"
              disabled={isGenerating}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                errors.primaryKeyword ? 'border-red-500' : 'border-gray-300'
              } ${isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.primaryKeyword && (
              <p className="text-red-500 text-xs mt-1">{errors.primaryKeyword}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={isGenerating}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } ${isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Selecteer categorie...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              Doelgroep (optioneel)
            </label>
            <input
              id="targetAudience"
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              placeholder="bijv. 25-35 jaar, stedelingen"
              disabled={isGenerating}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Tone of Voice */}
          <div>
            <label htmlFor="toneOfVoice" className="block text-sm font-medium text-gray-700 mb-1">
              Tone of Voice
            </label>
            <select
              id="toneOfVoice"
              value={formData.toneOfVoice}
              onChange={(e) => handleChange('toneOfVoice', e.target.value)}
              disabled={isGenerating}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Jaartal
            </label>
            <input
              id="year"
              type="text"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              placeholder="2025"
              disabled={isGenerating}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Article Length */}
          <div>
            <label htmlFor="articleLength" className="block text-sm font-medium text-gray-700 mb-1">
              Artikel Lengte
            </label>
            <select
              id="articleLength"
              value={formData.articleLength}
              onChange={(e) => handleChange('articleLength', Number(e.target.value))}
              disabled={isGenerating}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              {lengthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Genereren...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Genereer met AI
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isGenerating}
            className={`px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
