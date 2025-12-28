import { NextRequest, NextResponse } from 'next/server'
import { blogArtikelen, getBlogsByTag } from '@/lib/doelgroepen-data'

/**
 * API endpoint voor doelgroep-specifieke blog artikelen
 *
 * Query params:
 * - tag: Filter op specifieke tag (bijv. 'autisme', 'lvb', 'slechtziend')
 * - limit: Maximum aantal artikelen (default: 10)
 * - audio: Filter op audio beschikbaarheid ('true' voor alleen audio)
 * - simple: Filter op eenvoudige versies ('true' voor alleen simple)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '10')
    const audioOnly = searchParams.get('audio') === 'true'
    const simpleOnly = searchParams.get('simple') === 'true'

    let articles = tag ? getBlogsByTag(tag) : blogArtikelen

    // Filter op audio beschikbaarheid
    if (audioOnly) {
      articles = articles.filter(a => a.audioAvailable)
    }

    // Filter op eenvoudige versies
    if (simpleOnly) {
      articles = articles.filter(a => a.simpleVersion)
    }

    // Limit resultaten
    articles = articles.slice(0, limit)

    // Format response
    const formattedArticles = articles.map(article => ({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: simpleOnly && article.simpleVersion ? article.simpleVersion : article.content,
      featuredImage: article.featuredImage,
      category: article.category,
      tags: article.tags,
      readTime: article.readTime,
      publishedAt: article.publishedAt,
      audioAvailable: article.audioAvailable || false,
      hasSimpleVersion: !!article.simpleVersion
    }))

    return NextResponse.json({
      articles: formattedArticles,
      total: formattedArticles.length,
      filters: {
        tag,
        audioOnly,
        simpleOnly
      }
    })
  } catch (error) {
    console.error('Doelgroep blog fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
