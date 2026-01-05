'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock, Share2, Heart } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  slug: string | null
  excerpt: string | null
  featuredImage: string | null
  bannerText: string | null
  published: boolean
  createdAt: string
  author: {
    name: string | null
    profileImage: string | null
  }
  category: {
    id: string
    name: string
  }
  seoTitle: string | null
  seoDescription: string | null
  keywords?: string[]
  likeCount: number
}

interface BlogPostClientProps {
  post: Post
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
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

      {/* Featured Image or Banner Text */}
      {post.bannerText ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="w-full h-64 md:h-80 rounded-xl shadow-lg bg-gradient-to-r from-[#C34C60] to-pink-500 flex items-center justify-center">
            <span className="text-white text-5xl md:text-6xl font-bold tracking-tight drop-shadow-lg text-center px-8">
              {post.bannerText}
            </span>
          </div>
        </div>
      ) : post.featuredImage ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
      ) : null}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <style jsx global>{`
          .blog-content {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 1.125rem;
            line-height: 1.8;
            color: #374151;
          }
          .blog-content > p:first-of-type::first-letter {
            float: left;
            font-size: 4.5rem;
            line-height: 0.8;
            padding-right: 0.75rem;
            padding-top: 0.25rem;
            font-weight: 700;
            color: #C34C60;
            font-family: 'Georgia', serif;
          }
          .blog-content p {
            margin-bottom: 1.75rem;
            text-align: left;
          }
          .blog-content h2 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 1.875rem;
            font-weight: 700;
            color: #111827;
            margin-top: 3rem;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 3px solid #C34C60;
            letter-spacing: -0.02em;
          }
          .blog-content h3 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            letter-spacing: -0.01em;
          }
          .blog-content strong {
            color: #111827;
            font-weight: 700;
          }
          .blog-content h2 + p {
            font-size: 1.25rem;
            color: #4b5563;
            line-height: 1.7;
          }
          .blog-content a {
            color: #C34C60;
            text-decoration: underline;
            text-underline-offset: 3px;
            text-decoration-thickness: 2px;
            transition: all 0.2s ease;
          }
          .blog-content a:hover {
            color: #a83d4f;
            text-decoration-color: #a83d4f;
          }
          .blog-content ul, .blog-content ol {
            margin: 1.5rem 0;
            padding-left: 1.5rem;
          }
          .blog-content li {
            margin-bottom: 0.75rem;
            padding-left: 0.5rem;
          }
          .blog-content ul li::marker { color: #C34C60; }
          .blog-content ol li::marker { color: #C34C60; font-weight: 600; }
          .blog-content blockquote {
            margin: 2rem 0;
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #fdf2f4 0%, #fff5f7 100%);
            border-left: 4px solid #C34C60;
            border-radius: 0 12px 12px 0;
            font-style: italic;
            color: #4b5563;
          }
          .blog-content blockquote p { margin-bottom: 0; }
          .blog-content img {
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
            max-width: 100%;
            height: auto;
          }
          .blog-content code {
            background: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9em;
            color: #C34C60;
          }
          .blog-content hr {
            margin: 3rem auto;
            border: none;
            height: 3px;
            width: 60px;
            background: linear-gradient(90deg, #C34C60, #ec4899);
            border-radius: 3px;
          }
          @media (max-width: 640px) {
            .blog-content { font-size: 1rem; }
            .blog-content > p:first-of-type::first-letter { font-size: 3.5rem; }
            .blog-content h2 { font-size: 1.5rem; }
            .blog-content h3 { font-size: 1.25rem; }
          }
        `}</style>
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
