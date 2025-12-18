'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  category: {
    name: string
    color: string
  }
  author: {
    name: string
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
  color: string
  postCount: number
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchPosts()
    fetchCategories()
  }, [session, status, router])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const togglePublished = async (postId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus })
      })
      if (res.ok) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Beheer</h1>
            <p className="text-gray-600 mt-2">Beheer artikelen en categorieën</p>
          </div>
          <button
            onClick={() => router.push('/admin/blog/new')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nieuw Artikel
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-primary">{posts.length}</div>
            <div className="text-gray-600">Totaal Artikelen</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(p => p.published).length}
            </div>
            <div className="text-gray-600">Gepubliceerd</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter(p => !p.published).length}
            </div>
            <div className="text-gray-600">Concepten</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-gray-600">Categorieën</div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Artikelen</h2>
          </div>

          {posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Nog geen artikelen. Maak je eerste artikel aan!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">/{post.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.author.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Gepubliceerd' : 'Concept'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => togglePublished(post.id, post.published)}
                            className={`p-1 rounded ${
                              post.published
                                ? 'text-yellow-600 hover:text-yellow-800'
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={post.published ? 'Depubliceren' : 'Publiceren'}
                          >
                            {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Bewerken"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Verwijderen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}