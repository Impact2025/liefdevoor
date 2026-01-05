/**
 * Internal Link Suggester
 *
 * Suggests relevant internal links for blog posts to boost SEO
 */

import { prisma } from '@/lib/prisma'

export interface InternalLinkSuggestion {
  targetPost: {
    id: string
    title: string
    slug: string | null
    url: string
    excerpt: string | null
  }
  relevanceScore: number // 0-100
  anchorTextSuggestions: string[]
  reason: string
  placement: 'intro' | 'body' | 'conclusion'
}

export interface InternalLinkAnalysis {
  currentLinks: number
  suggestedLinks: InternalLinkSuggestion[]
  orphanedPosts: Array<{ id: string; title: string; slug: string | null }>
  topLinkingOpportunities: InternalLinkSuggestion[]
}

/**
 * Suggest internal links for a blog post
 */
export async function suggestInternalLinks(
  content: string,
  keywords: string[],
  currentPostId?: string
): Promise<InternalLinkAnalysis> {
  // Get all published posts (excluding current)
  const allPosts = await prisma.post.findMany({
    where: {
      published: true,
      ...(currentPostId ? { id: { not: currentPostId } } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      keywords: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get kennisbank articles
  const kennisbankArticles = await prisma.knowledgeBaseArticle.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      titleNl: true,
      slug: true,
      excerptNl: true,
      contentNl: true,
      keywords: true,
      category: {
        select: { slug: true },
      },
    },
    take: 50, // Limit to most recent
  })

  // Calculate current links in content
  const currentLinks = (content.match(/href=["'][^"']*["']/g) || []).length

  // Generate suggestions
  const suggestedLinks: InternalLinkSuggestion[] = []

  // Suggest blog post links
  allPosts.forEach(post => {
    const postKeywords = Array.isArray(post.keywords) ? (post.keywords as string[]) : []

    const score = calculateRelevanceScore(
      content,
      keywords,
      post.content,
      postKeywords,
      post.title
    )

    if (score > 30) {
      // Only suggest if relevance > 30%
      suggestedLinks.push({
        targetPost: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          url: `/blog/${post.slug}`,
          excerpt: post.excerpt,
        },
        relevanceScore: score,
        anchorTextSuggestions: generateAnchorText(post.title, postKeywords),
        reason: getReasonForSuggestion(score),
        placement: suggestPlacement(score),
      })
    }
  })

  // Suggest kennisbank article links
  kennisbankArticles.forEach(article => {
    const score = calculateRelevanceScore(
      content,
      keywords,
      article.contentNl,
      article.keywords,
      article.titleNl
    )

    if (score > 30) {
      suggestedLinks.push({
        targetPost: {
          id: article.id,
          title: article.titleNl,
          slug: article.slug,
          url: `/kennisbank/${article.category.slug}/${article.slug}`,
          excerpt: article.excerptNl,
        },
        relevanceScore: score,
        anchorTextSuggestions: generateAnchorText(article.titleNl, article.keywords),
        reason: getReasonForSuggestion(score) + ' (Kennisbank - extra authority)',
        placement: suggestPlacement(score),
      })
    }
  })

  // Sort by relevance
  suggestedLinks.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Find orphaned posts (posts with no incoming links)
  const linkedPostIds = new Set(
    suggestedLinks.map(s => s.targetPost.id)
  )
  const orphanedPosts = allPosts
    .filter(post => !linkedPostIds.has(post.id))
    .slice(0, 5)
    .map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
    }))

  return {
    currentLinks,
    suggestedLinks: suggestedLinks.slice(0, 8), // Top 8 suggestions
    orphanedPosts,
    topLinkingOpportunities: suggestedLinks.slice(0, 3), // Top 3
  }
}

/**
 * Calculate relevance score between two pieces of content
 */
function calculateRelevanceScore(
  sourceContent: string,
  sourceKeywords: string[],
  targetContent: string,
  targetKeywords: string[],
  targetTitle: string
): number {
  let score = 0

  const sourceText = sourceContent.toLowerCase()
  const targetText = targetContent.toLowerCase()

  // Check keyword overlap
  const sourceKw = sourceKeywords.map(k => k.toLowerCase())
  const targetKw = targetKeywords.map(k => k.toLowerCase())

  const keywordOverlap = sourceKw.filter(k => targetKw.includes(k))
  score += keywordOverlap.length * 15 // 15 points per shared keyword

  // Check if target keywords appear in source content
  targetKw.forEach(keyword => {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = sourceText.match(regex)
    if (matches) {
      score += Math.min(matches.length * 5, 20) // Max 20 points per keyword
    }
  })

  // Check if target title appears in source
  if (sourceText.includes(targetTitle.toLowerCase())) {
    score += 25
  }

  // Check semantic similarity (simple word overlap)
  const sourceWords = new Set(sourceText.split(/\s+/).filter(w => w.length > 4))
  const targetWords = new Set(targetText.split(/\s+/).filter(w => w.length > 4))

  const commonWords = Array.from(sourceWords).filter(w => targetWords.has(w))
  score += Math.min(commonWords.length * 2, 20) // Max 20 points

  return Math.min(100, score)
}

/**
 * Generate anchor text suggestions
 */
function generateAnchorText(title: string, keywords: string[]): string[] {
  const suggestions: string[] = []

  // Use exact title
  suggestions.push(title)

  // Use keywords
  const keywordArray = Array.isArray(keywords) ? keywords : []
  keywordArray.slice(0, 2).forEach(kw => {
    if (typeof kw === 'string') {
      suggestions.push(kw)
    }
  })

  // Generate natural variations
  const titleWords = title.split(' ')
  if (titleWords.length > 5) {
    // Shorten title
    suggestions.push(titleWords.slice(0, 5).join(' ') + '...')
  }

  // Add "lees meer over" variant
  suggestions.push(`lees meer over ${keywordArray[0] || title.toLowerCase()}`)

  // Add "bekijk ook" variant
  suggestions.push(`bekijk ook: ${title}`)

  return Array.from(new Set(suggestions)).slice(0, 5)
}

/**
 * Get reason for link suggestion
 */
function getReasonForSuggestion(score: number): string {
  if (score >= 80) {
    return 'Zeer relevant - veel keyword overlap'
  } else if (score >= 60) {
    return 'Hoog relevant - sterke topicale connectie'
  } else if (score >= 40) {
    return 'Relevant - gerelateerde content'
  } else {
    return 'Mogelijk relevant - overweeg toevoegen'
  }
}

/**
 * Suggest placement in content
 */
function suggestPlacement(score: number): 'intro' | 'body' | 'conclusion' {
  if (score >= 70) return 'intro' // High relevance = intro
  if (score >= 50) return 'body' // Medium = body
  return 'conclusion' // Low = conclusion
}

/**
 * Analyze link distribution across your blog
 */
export async function analyzeLinkDistribution(): Promise<{
  totalPosts: number
  averageInternalLinks: number
  postsWithNoLinks: number
  postsWithTooManyLinks: number
  topLinkedPosts: Array<{ title: string; slug: string | null; linkCount: number }>
  recommendations: string[]
}> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
    },
  })

  const linkCounts = posts.map(post => {
    const internalLinks = (post.content.match(/href=["'][^"']*(?:\/blog|\/kennisbank)[^"']*["']/gi) || []).length
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      linkCount: internalLinks,
    }
  })

  const totalLinks = linkCounts.reduce((sum, p) => sum + p.linkCount, 0)
  const averageInternalLinks = posts.length > 0 ? totalLinks / posts.length : 0

  const postsWithNoLinks = linkCounts.filter(p => p.linkCount === 0).length
  const postsWithTooManyLinks = linkCounts.filter(p => p.linkCount > 10).length

  const topLinkedPosts = linkCounts
    .sort((a, b) => b.linkCount - a.linkCount)
    .slice(0, 5)

  const recommendations: string[] = []

  if (averageInternalLinks < 3) {
    recommendations.push('⚠️ Gemiddeld te weinig interne links - doel: 3-5 per post')
  }

  if (postsWithNoLinks > 0) {
    recommendations.push(`⚠️ ${postsWithNoLinks} posts hebben GEEN interne links - update deze!`)
  }

  if (postsWithTooManyLinks > 0) {
    recommendations.push(`ℹ️ ${postsWithTooManyLinks} posts hebben >10 links - mogelijk te veel`)
  }

  if (averageInternalLinks >= 3 && averageInternalLinks <= 5) {
    recommendations.push('✅ Goede gemiddelde internal linking!')
  }

  return {
    totalPosts: posts.length,
    averageInternalLinks,
    postsWithNoLinks,
    postsWithTooManyLinks,
    topLinkedPosts,
    recommendations,
  }
}

/**
 * Get update opportunities (old posts that need new links)
 */
export async function getUpdateOpportunities(): Promise<Array<{
  post: { id: string; title: string; slug: string | null; createdAt: Date }
  currentLinks: number
  suggestedNewLinks: number
  priority: 'high' | 'medium' | 'low'
}>> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      createdAt: true,
      keywords: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const opportunities = []

  for (const post of posts) {
    const currentLinks = (post.content.match(/href=["'][^"']*(?:\/blog|\/kennisbank)[^"']*["']/gi) || []).length

    // Get potential new links
    const keywords = Array.isArray(post.keywords) ? (post.keywords as string[]) : []
    const analysis = await suggestInternalLinks(post.content, keywords, post.id)

    // Count how many new posts could be linked
    const suggestedNewLinks = analysis.suggestedLinks.length

    // Determine priority
    let priority: 'high' | 'medium' | 'low' = 'low'
    const postAge = Date.now() - post.createdAt.getTime()
    const daysOld = postAge / (1000 * 60 * 60 * 24)

    if (currentLinks === 0 && suggestedNewLinks > 0) {
      priority = 'high' // No links at all
    } else if (currentLinks < 3 && suggestedNewLinks >= 3) {
      priority = 'high' // Few links, many opportunities
    } else if (daysOld > 90 && suggestedNewLinks > 2) {
      priority = 'medium' // Old post with opportunities
    }

    if (priority === 'high' || priority === 'medium') {
      opportunities.push({
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          createdAt: post.createdAt,
        },
        currentLinks,
        suggestedNewLinks,
        priority,
      })
    }
  }

  // Sort by priority
  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
