'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { marked } from 'marked'
import {
  ChevronRight,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  BookOpenCheck,
  User,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Printer,
  Loader2
} from 'lucide-react'

interface Article {
  id: string
  title: string
  titleNl: string
  slug: string
  content: string
  contentNl: string
  contentEasyRead?: string
  hasEasyRead: boolean
  excerpt: string
  excerptNl: string
  featuredImage?: string
  articleType: string
  category: {
    name: string
    nameNl: string
    slug: string
    color: string
  }
  author: {
    name: string
  }
  keywords: string[]
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  publishedAt: string
  updatedAt: string
  readTime: number
}

// Configure marked for professional output
marked.setOptions({
  gfm: true,
  breaks: true,
})

export default function ArticlePage() {
  const params = useParams()
  const categorySlug = params?.category as string
  const articleSlug = params?.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEasyRead, setIsEasyRead] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null)
  const [showTableOfContents, setShowTableOfContents] = useState(true)

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/kennisbank/articles/${articleSlug}`)

        if (!res.ok) {
          throw new Error('Artikel niet gevonden')
        }

        const data = await res.json()
        if (data.success && data.data?.article) {
          setArticle(data.data.article)
        } else {
          throw new Error('Artikel niet gevonden')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er ging iets mis')
      } finally {
        setIsLoading(false)
      }
    }

    if (articleSlug) {
      fetchArticle()
    }
  }, [articleSlug])

  // Convert markdown to HTML
  const renderedContent = useMemo(() => {
    if (!article) return ''
    const content = isEasyRead && article.contentEasyRead
      ? article.contentEasyRead
      : article.contentNl
    return marked(content) as string
  }, [article, isEasyRead])

  // Extract headings for table of contents
  const headings = useMemo(() => {
    if (!article) return []
    const content = isEasyRead && article.contentEasyRead
      ? article.contentEasyRead
      : article.contentNl

    const headingsList: { level: number; text: string; id: string }[] = []
    const lines = content.split('\n')

    for (const line of lines) {
      const h2Match = line.match(/^## (.+)$/)
      const h3Match = line.match(/^### (.+)$/)

      if (h2Match) {
        const text = h2Match[1].replace(/\*\*/g, '').trim()
        const id = text.toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        headingsList.push({ level: 2, text, id })
      } else if (h3Match) {
        const text = h3Match[1].replace(/\*\*/g, '').trim()
        const id = text.toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        headingsList.push({ level: 3, text, id })
      }
    }

    return headingsList
  }, [article, isEasyRead])

  // Add IDs to headings in rendered content
  const contentWithIds = useMemo(() => {
    let html = renderedContent
    headings.forEach(({ text, id }) => {
      const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      html = html.replace(
        new RegExp(`<h([23])>\\s*${escapedText}\\s*</h[23]>`, 'gi'),
        `<h$1 id="${id}">${text}</h$1>`
      )
    })
    return html
  }, [renderedContent, headings])

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedbackGiven(isHelpful ? 'helpful' : 'not-helpful')
    // TODO: Call API to save feedback
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article?.titleNl,
        text: article?.excerptNl,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link gekopieerd!')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Artikel laden...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Artikel niet gevonden</h1>
          <p className="text-gray-500 mb-6">{error || 'Dit artikel bestaat niet of is verwijderd.'}</p>
          <Link
            href="/kennisbank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Kennisbank
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/kennisbank" className="text-gray-500 hover:text-primary transition-colors">
              Kennisbank
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link
              href={`/kennisbank/${article.category.slug}`}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              {article.category.nameNl || article.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {article.titleNl}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Back Link */}
            <Link
              href={`/kennisbank/${article.category.slug}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar {article.category.nameNl || article.category.name}
            </Link>

            {/* Article Header */}
            <header className="mb-12">
              {/* Category & Type Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: `${article.category.color}15`,
                    color: article.category.color
                  }}
                >
                  {article.category.nameNl || article.category.name}
                </span>
                {article.articleType === 'PILLAR' && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                    Uitgebreide gids
                  </span>
                )}
                {article.hasEasyRead && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                    <BookOpenCheck className="w-3.5 h-3.5" />
                    Easy Read
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
                {article.titleNl}
              </h1>

              {/* Excerpt */}
              {article.excerptNl && (
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {article.excerptNl}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-100">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {article.author?.name || 'Redactie'}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publishedAt).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {article.readTime || Math.ceil(article.contentNl.split(/\s+/).length / 200)} min
                </span>
                {article.viewCount > 0 && (
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {article.viewCount.toLocaleString('nl-NL')}
                  </span>
                )}
              </div>
            </header>

            {/* Easy Read Toggle */}
            {article.hasEasyRead && article.contentEasyRead && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-5 mb-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <BookOpenCheck className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-teal-900">Makkelijk Lezen</p>
                      <p className="text-sm text-teal-700">Korte zinnen, eenvoudige woorden</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEasyRead(!isEasyRead)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      isEasyRead ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                        isEasyRead ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Table of Contents (Mobile) */}
            {headings.length > 3 && (
              <div className="lg:hidden bg-gray-50 rounded-2xl p-5 mb-10">
                <button
                  onClick={() => setShowTableOfContents(!showTableOfContents)}
                  className="w-full flex items-center justify-between font-semibold text-gray-900"
                >
                  <span>Inhoudsopgave</span>
                  {showTableOfContents ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {showTableOfContents && (
                  <nav className="mt-4 pt-4 border-t border-gray-200">
                    <ul className="space-y-2">
                      {headings.map((heading, index) => (
                        <li key={index}>
                          <a
                            href={`#${heading.id}`}
                            className={`block text-sm text-gray-600 hover:text-primary transition-colors py-1 ${
                              heading.level === 3 ? 'pl-4 text-gray-500' : 'font-medium'
                            }`}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            )}

            {/* Article Content with Professional Typography */}
            <div
              className={`
                kennisbank-article
                prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-100
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700
                prose-ul:my-6 prose-ul:space-y-2
                prose-ol:my-6 prose-ol:space-y-2
                prose-li:text-gray-700
                prose-hr:my-12 prose-hr:border-gray-200
                prose-table:w-full prose-table:border-collapse
                prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-200
                prose-td:p-3 prose-td:border prose-td:border-gray-200
                prose-img:rounded-xl prose-img:shadow-sm
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none
                ${isEasyRead ? 'prose-xl prose-p:text-xl prose-p:leading-loose prose-li:text-xl' : ''}
              `}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Keywords/Tags */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-4">Gerelateerde onderwerpen</p>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword) => (
                    <Link
                      key={keyword}
                      href={`/kennisbank/zoeken?q=${encodeURIComponent(keyword)}`}
                      className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share & Actions */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Delen
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
                  <Bookmark className="w-4 h-4" />
                  Opslaan
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-12 p-8 bg-gray-50 rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-2">Was dit artikel nuttig?</h3>
              <p className="text-sm text-gray-500 mb-6">Je feedback helpt ons de content te verbeteren</p>

              {feedbackGiven ? (
                <div className="flex items-center gap-3 text-teal-600 bg-teal-50 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Bedankt voor je feedback!</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors font-medium"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Ja, nuttig
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Kan beter
                  </button>
                </div>
              )}

              {article.helpfulCount > 0 && (
                <p className="text-sm text-gray-500 mt-6">
                  {article.helpfulCount.toLocaleString('nl-NL')} mensen vonden dit artikel nuttig
                </p>
              )}
            </div>
          </article>

          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-6">

              {/* Table of Contents */}
              {headings.length > 2 && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 text-sm">Inhoudsopgave</h3>
                  <nav>
                    <ul className="space-y-1">
                      {headings.map((heading, index) => (
                        <li key={index}>
                          <a
                            href={`#${heading.id}`}
                            className={`block text-sm text-gray-600 hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary ${
                              heading.level === 3 ? 'pl-6 text-gray-500' : 'pl-3 font-medium'
                            }`}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Help Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1 text-sm">Hulp nodig?</p>
                    <p className="text-sm text-amber-700 mb-3">
                      Neem contact op met de Fraudehelpdesk.
                    </p>
                    <a
                      href="https://www.fraudehelpdesk.nl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-1"
                    >
                      fraudehelpdesk.nl
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Custom styles for article content */}
      <style jsx global>{`
        .kennisbank-article h2 {
          scroll-margin-top: 5rem;
        }

        .kennisbank-article h3 {
          scroll-margin-top: 5rem;
        }

        .kennisbank-article blockquote p {
          margin: 0;
        }

        .kennisbank-article blockquote p:first-child::before {
          content: none;
        }

        .kennisbank-article ul li::marker {
          color: #E11D48;
        }

        .kennisbank-article ol li::marker {
          color: #E11D48;
          font-weight: 600;
        }

        @media print {
          .sticky, aside, nav, button {
            display: none !important;
          }
          article {
            max-width: 100% !important;
          }
          .kennisbank-article {
            font-size: 12pt;
          }
        }
      `}</style>
    </div>
  )
}
