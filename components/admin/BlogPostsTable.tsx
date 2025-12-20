'use client'

import { useState } from 'react'
import { Search, Edit, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import type { BlogPost, BlogCategory, BlogPagination } from '@/lib/types'

interface BlogPostsTableProps {
  posts: BlogPost[]
  categories: BlogCategory[]
  onTogglePublish: (id: string, published: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (post: BlogPost) => void
  pagination: BlogPagination
  onPageChange: (page: number) => void
  onFilterChange?: (filters: { category: string; status: string; search: string }) => void
}

export default function BlogPostsTable({
  posts,
  categories,
  onTogglePublish,
  onDelete,
  onEdit,
  pagination,
  onPageChange,
  onFilterChange,
}: BlogPostsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onFilterChange?.({ category: categoryFilter, status: statusFilter, search: value })
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    onFilterChange?.({ category: value, status: statusFilter, search: searchTerm })
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    onFilterChange?.({ category: categoryFilter, status: value, search: searchTerm })
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    if (togglingId) return

    setTogglingId(id)
    try {
      await onTogglePublish(id, !currentStatus)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (deletingId) return

    if (!confirm(`Weet je zeker dat je "${title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
      return
    }

    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Blog Posts</h3>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op titel..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="">Alle categorieën</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="">Alle statussen</option>
          <option value="published">Gepubliceerd</option>
          <option value="draft">Concept</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Auteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Geen blog posts gevonden
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-xs text-gray-500">/{post.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.category && (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${post.category.color}20`,
                          color: post.category.color,
                        }}
                      >
                        {post.category.icon} {post.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {post.author && (
                      <div className="flex items-center">
                        {post.author.profileImage ? (
                          <img
                            src={post.author.profileImage}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {post.author.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-900">{post.author.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.published ? 'Gepubliceerd' : 'Concept'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Toggle Publish */}
                      <button
                        onClick={() => handleTogglePublish(post.id, post.published)}
                        disabled={togglingId === post.id}
                        className={`p-2 rounded-lg transition-colors ${
                          post.published
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        } ${togglingId === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={post.published ? 'Unpublish' : 'Publiceren'}
                      >
                        {togglingId === post.id ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        ) : post.published ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bewerken"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                          deletingId === post.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Verwijderen"
                      >
                        {deletingId === post.id ? (
                          <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {posts.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Pagina {pagination.page} van {pagination.totalPages} ({pagination.total} totaal)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
              className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                pagination.hasPreviousPage
                  ? 'text-gray-700 hover:bg-gray-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Vorige
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                pagination.hasNextPage
                  ? 'text-gray-700 hover:bg-gray-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Volgende
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
