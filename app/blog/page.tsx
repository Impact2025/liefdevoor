'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Tag, ArrowRight } from 'lucide-react'

interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  featuredImage?: string
  author: {
    name: string
  }
  category: {
    name: string
    color: string
  }
  createdAt: string
  readTime?: number
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
  postCount: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [selectedCategory])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)

      const res = await fetch(`/api/blog/posts?${params}`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-600">Blog laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-rose-500 to-purple-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Dating Advies & Verhalen
          </h1>
          <p className="text-xl text-rose-100 max-w-3xl mx-auto">
            Ontdek tips, verhalen en inzichten over moderne liefde en relaties.
            Van date ideeën tot relatie advies - alles wat je nodig hebt voor succesvol daten.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Categorieën</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === '' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Alle artikelen ({categories.reduce((sum, cat) => sum + cat.postCount, 0)})
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    {category.name} ({category.postCount})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Geen artikelen gevonden in deze categorie.</p>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="mt-4 text-primary hover:underline"
                >
                  Bekijk alle artikelen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {post.featuredImage && (
                      <div className="relative h-48">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar size={14} className="mr-1" />
                          {new Date(post.createdAt).toLocaleDateString('nl-NL')}
                        </div>
                        {post.readTime && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <span>{post.readTime} min lezen</span>
                          </div>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-500 text-sm">
                          <User size={14} className="mr-1" />
                          {post.author.name}
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="flex items-center text-primary hover:text-rose-hover font-medium transition-colors"
                        >
                          Lees meer
                          <ArrowRight size={16} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Newsletter Signup */}
            <div className="mt-12 bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Blijf op de hoogte
              </h3>
              <p className="text-gray-600 mb-6">
                Ontvang wekelijks dating tips en relatie advies in je inbox.
              </p>
              <div className="max-w-md mx-auto flex gap-2">
                <input
                  type="email"
                  placeholder="jouw@email.com"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-rose-hover transition-colors">
                  Inschrijven
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}