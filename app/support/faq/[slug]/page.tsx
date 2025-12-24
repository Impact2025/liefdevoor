/**
 * FAQ Article Page
 * Display individual FAQ article with feedback
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FAQFeedbackWidget } from '@/components/helpdesk/FAQFeedbackWidget'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await prisma.fAQArticle.findUnique({
    where: { slug: params.slug },
    select: {
      titleNl: true,
      excerpt: true
    }
  })

  if (!article) {
    return {
      title: 'Artikel niet gevonden'
    }
  }

  return {
    title: article.titleNl,
    description: article.excerpt || `Lees meer over ${article.titleNl} in onze FAQ`,
  }
}

export default async function FAQArticlePage({ params }: PageProps) {
  const article = await prisma.fAQArticle.findUnique({
    where: { slug: params.slug },
    include: {
      category: {
        select: {
          nameNl: true,
          icon: true,
          slug: true
        }
      },
      author: {
        select: {
          name: true
        }
      }
    }
  })

  if (!article || !article.isPublished) {
    notFound()
  }

  // Increment view count
  await prisma.fAQArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } }
  })

  // Get related articles from same category
  const relatedArticles = await prisma.fAQArticle.findMany({
    where: {
      categoryId: article.categoryId,
      id: { not: article.id },
      isPublished: true
    },
    select: {
      id: true,
      titleNl: true,
      slug: true,
      excerpt: true
    },
    take: 3,
    orderBy: { viewCount: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/support" className="hover:text-gray-900">Support</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/support/faq" className="hover:text-gray-900">FAQ</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/support/faq?category=${article.category.slug}`} className="hover:text-gray-900">
            {article.category.nameNl}
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">{article.titleNl}</span>
        </nav>

        {/* Article */}
        <article className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          {/* Category Badge */}
          <Link
            href={`/support/faq?category=${article.category.slug}`}
            className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-medium hover:bg-rose-100 transition-colors mb-4"
          >
            {article.category.icon && <span>{article.category.icon}</span>}
            {article.category.nameNl}
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.titleNl}</h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.viewCount + 1} weergaven
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {article.helpfulCount} vonden dit nuttig
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Laatst bijgewerkt: {new Date(article.updatedAt).toLocaleDateString('nl-NL')}
            </span>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-3xl prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-gray-700 prose-li:my-2
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-rose-600
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
              prose-blockquote:border-l-4 prose-blockquote:border-rose-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600"
            dangerouslySetInnerHTML={{ __html: article.contentNl }}
          />
        </article>

        {/* Feedback Widget */}
        <FAQFeedbackWidget articleId={article.id} />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerelateerde artikelen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/support/faq/${related.slug}`}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:border-rose-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{related.titleNl}</h3>
                  {related.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3">{related.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center text-rose-600 text-sm font-medium">
                    Lees meer
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Nog steeds niet opgelost?</h2>
          <p className="mb-6 text-blue-100">
            Ons support team helpt je graag verder
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/support/tickets/new"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Maak support ticket aan
            </Link>
            <Link
              href="/support/faq"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Meer FAQ artikelen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
