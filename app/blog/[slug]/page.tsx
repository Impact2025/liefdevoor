'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock, Share2, Heart, MessageCircle } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  createdAt: string
  author: {
    name: string
    profileImage: string | null
  }
  category: {
    id: string
    name: string
  }
  seoTitle: string | null
  seoDescription: string | null
  likeCount: number
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/posts/${slug}`)
        if (!res.ok) {
          setError(true)
          return
        }
        const data = await res.json()
        setPost(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Artikel niet gevonden</h1>
          <p className="text-gray-600 mb-8">Het artikel dat je zoekt bestaat niet of is verwijderd.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar blog
          </Link>
        </div>
      </div>
    )
  }

  // Calculate read time (assuming 200 words per minute)
  const wordCount = post.content.split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar blog
          </Link>

          {/* Category */}
          {post.category && (
            <Link
              href={`/blog?category=${post.category.id}`}
              className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full mb-4 hover:bg-rose-200"
            >
              {post.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.createdAt).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readTime} min lezen</span>
            </div>
            {post.likeCount > 0 && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{post.likeCount} likes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div
          className="prose prose-lg prose-rose max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-4
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:mb-2 prose-li:text-gray-700
            prose-img:rounded-lg prose-img:shadow-md
            prose-blockquote:border-l-4 prose-blockquote:border-rose-500
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Share Section */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Deel dit artikel</h3>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Delen
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Klaar om je perfecte match te vinden?</h2>
          <p className="text-lg mb-6 opacity-90">
            Sluit je aan bij duizenden singles die al hun geluk hebben gevonden
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Gratis aanmelden
          </Link>
        </div>
      </div>
    </div>
  )
}
