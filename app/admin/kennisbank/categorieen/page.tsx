'use client'

import { useState, useEffect } from 'react'
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  X,
  Save
} from 'lucide-react'

interface Category {
  id: string
  name: string
  nameNl: string
  slug: string
  description: string | null
  descriptionNl: string | null
  icon: string | null
  color: string
  order: number
  isVisible: boolean
  isProfessionalOnly: boolean
  parentId: string | null
  articleCount: number
  children?: Category[]
}

const defaultIcons = [
  'Shield', 'Heart', 'Users', 'BookOpen', 'MessageCircle',
  'Star', 'Award', 'Target', 'Compass', 'Lightbulb',
  'Brain', 'Smile', 'CheckCircle', 'AlertTriangle', 'Info'
]

const defaultColors = [
  '#E11D48', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    nameNl: '',
    slug: '',
    descriptionNl: '',
    icon: 'BookOpen',
    color: '#E11D48',
    order: 0,
    parentId: '',
    isVisible: true,
    isProfessionalOnly: false,
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/kennisbank/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setForm({
      nameNl: category.nameNl,
      slug: category.slug,
      descriptionNl: category.descriptionNl || '',
      icon: category.icon || 'BookOpen',
      color: category.color,
      order: category.order,
      parentId: category.parentId || '',
      isVisible: category.isVisible,
      isProfessionalOnly: category.isProfessionalOnly,
      metaTitle: '',
      metaDescription: '',
    })
    setIsCreating(false)
  }

  const handleCreate = (parentId = '') => {
    setEditingCategory(null)
    setForm({
      nameNl: '',
      slug: '',
      descriptionNl: '',
      icon: 'BookOpen',
      color: '#E11D48',
      order: 0,
      parentId,
      isVisible: true,
      isProfessionalOnly: false,
      metaTitle: '',
      metaDescription: '',
    })
    setIsCreating(true)
  }

  const handleSave = async () => {
    if (!form.nameNl || !form.slug) {
      alert('Naam en slug zijn verplicht')
      return
    }

    setIsSaving(true)
    try {
      const url = editingCategory
        ? `/api/admin/kennisbank/categories/${editingCategory.id}`
        : '/api/kennisbank/categories'
      const method = editingCategory ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        fetchCategories()
        setEditingCategory(null)
        setIsCreating(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Er ging iets mis')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Er ging iets mis bij het opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/admin/kennisbank/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
      } else {
        alert('Er ging iets mis bij het verwijderen')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-3 p-4 border-b hover:bg-gray-50 ${
            level > 0 ? 'pl-' + (4 + level * 8) : ''
          }`}
          style={{ paddingLeft: `${16 + level * 32}px` }}
        >
          {/* Expand/Collapse */}
          <button
            onClick={() => hasChildren && toggleExpanded(category.id)}
            className={`w-6 h-6 flex items-center justify-center ${
              hasChildren ? 'text-gray-400 hover:text-gray-600' : 'invisible'
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Color indicator */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{category.nameNl}</span>
              {!category.isVisible && (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              {category.isProfessionalOnly && (
                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                  Professional
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">/kennisbank/{category.slug}</span>
          </div>

          {/* Article count */}
          <span className="text-sm text-gray-500 tabular-nums">
            {category.articleCount} artikelen
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCreate(category.id)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
              title="Subcategorie toevoegen"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
              title="Bewerken"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
              title="Verwijderen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorieën</h1>
          <p className="text-gray-500 mt-1">
            Beheer kennisbank categorieën en subcategorieën
          </p>
        </div>
        <button
          onClick={() => handleCreate()}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuwe Categorie
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nog geen categorieën
                </h3>
                <p className="text-gray-500 mb-4">
                  Maak je eerste categorie aan om te beginnen
                </p>
                <button
                  onClick={() => handleCreate()}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nieuwe Categorie
                </button>
              </div>
            ) : (
              <div>
                {categories.map(category => renderCategory(category))}
              </div>
            )}
          </div>
        </div>

        {/* Edit/Create Form */}
        {(editingCategory || isCreating) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">
                {editingCategory ? 'Categorie Bewerken' : 'Nieuwe Categorie'}
              </h2>
              <button
                onClick={() => { setEditingCategory(null); setIsCreating(false); }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam *
                </label>
                <input
                  type="text"
                  value={form.nameNl}
                  onChange={(e) => {
                    const nameNl = e.target.value
                    setForm(prev => ({
                      ...prev,
                      nameNl,
                      slug: prev.slug || generateSlug(nameNl)
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Bijv. Veiligheid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="bijv. veiligheid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <textarea
                  value={form.descriptionNl}
                  onChange={(e) => setForm(prev => ({ ...prev, descriptionNl: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Korte beschrijving..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setForm(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        form.color === color ? 'border-gray-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icoon
                </label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {defaultIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bovenliggende Categorie
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Geen (hoofdcategorie)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameNl}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(e) => setForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="w-4 h-4 text-rose-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Zichtbaar op website</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isProfessionalOnly}
                    onChange={(e) => setForm(prev => ({ ...prev, isProfessionalOnly: e.target.checked }))}
                    className="w-4 h-4 text-rose-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Alleen voor professionals</span>
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingCategory ? 'Opslaan' : 'Aanmaken'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
