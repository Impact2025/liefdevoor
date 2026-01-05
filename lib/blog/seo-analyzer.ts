/**
 * SEO Analyzer - Wereldklasse Blog Content Analysis
 *
 * Analyzes blog posts for SEO optimization and provides actionable recommendations
 */

export interface SEOAnalysisResult {
  score: number // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  issues: SEOIssue[]
  recommendations: SEORecommendation[]
  metrics: SEOMetrics
}

export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info'
  category: 'title' | 'description' | 'content' | 'keywords' | 'readability' | 'structure'
  message: string
  fix?: string
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  action: string
  impact: string
  example?: string
}

export interface SEOMetrics {
  wordCount: number
  readingTime: number // minutes
  keywordDensity: { [keyword: string]: number }
  headingStructure: {
    h1: number
    h2: number
    h3: number
    h4: number
  }
  internalLinks: number
  externalLinks: number
  images: number
  imagesWithAlt: number
  readabilityScore: number // Flesch Reading Ease
  sentenceCount: number
  paragraphCount: number
  avgWordsPerSentence: number
  avgWordsPerParagraph: number
}

export interface BlogPostInput {
  title: string
  content: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  keywords?: string[]
  featuredImage?: string
}

/**
 * Analyze blog post for SEO optimization
 */
export function analyzeSEO(post: BlogPostInput): SEOAnalysisResult {
  const issues: SEOIssue[] = []
  const recommendations: SEORecommendation[] = []

  // Calculate metrics
  const metrics = calculateMetrics(post)

  // Analyze title
  analyzeTitleSEO(post, issues, recommendations)

  // Analyze meta description
  analyzeDescriptionSEO(post, issues, recommendations)

  // Analyze content
  analyzeContentSEO(post, metrics, issues, recommendations)

  // Analyze keywords
  analyzeKeywordsSEO(post, metrics, issues, recommendations)

  // Analyze readability
  analyzeReadabilitySEO(metrics, issues, recommendations)

  // Analyze structure
  analyzeStructureSEO(metrics, issues, recommendations)

  // Calculate score
  const score = calculateSEOScore(issues, metrics)
  const grade = getGrade(score)

  return {
    score,
    grade,
    issues,
    recommendations,
    metrics,
  }
}

/**
 * Calculate content metrics
 */
function calculateMetrics(post: BlogPostInput): SEOMetrics {
  const content = post.content
  const plainText = stripHTML(content)

  // Word count
  const words = plainText.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length

  // Reading time (200 words per minute)
  const readingTime = Math.ceil(wordCount / 200)

  // Sentences
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceCount = sentences.length

  // Paragraphs
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)
  const paragraphCount = paragraphs.length

  // Average words per sentence/paragraph
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
  const avgWordsPerParagraph = paragraphCount > 0 ? wordCount / paragraphCount : 0

  // Heading structure
  const headingStructure = {
    h1: (content.match(/<h1[^>]*>/gi) || []).length + (content.match(/^# /gm) || []).length,
    h2: (content.match(/<h2[^>]*>/gi) || []).length + (content.match(/^## /gm) || []).length,
    h3: (content.match(/<h3[^>]*>/gi) || []).length + (content.match(/^### /gm) || []).length,
    h4: (content.match(/<h4[^>]*>/gi) || []).length + (content.match(/^#### /gm) || []).length,
  }

  // Links
  const internalLinks = (content.match(/href=["'][^"']*(?:\/|localhost|liefdevoor)[^"']*["']/gi) || []).length
  const externalLinks = (content.match(/href=["']https?:\/\/(?!.*(?:\/|localhost|liefdevoor))[^"']*["']/gi) || []).length

  // Images
  const imageMatches = content.match(/<img[^>]*>/gi) || []
  const images = imageMatches.length
  const imagesWithAlt = imageMatches.filter(img => /alt=["'][^"']+["']/.test(img)).length

  // Keyword density
  const keywordDensity: { [keyword: string]: number } = {}
  if (post.keywords && post.keywords.length > 0) {
    post.keywords.forEach(keyword => {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      const matches = plainText.match(regex) || []
      keywordDensity[keyword] = (matches.length / wordCount) * 100
    })
  }

  // Readability (Flesch Reading Ease)
  const readabilityScore = calculateFleschReadingEase(wordCount, sentenceCount, countSyllables(plainText))

  return {
    wordCount,
    readingTime,
    keywordDensity,
    headingStructure,
    internalLinks,
    externalLinks,
    images,
    imagesWithAlt,
    readabilityScore,
    sentenceCount,
    paragraphCount,
    avgWordsPerSentence,
    avgWordsPerParagraph,
  }
}

/**
 * Analyze title SEO
 */
function analyzeTitleSEO(post: BlogPostInput, issues: SEOIssue[], recommendations: SEORecommendation[]) {
  const seoTitle = post.seoTitle || post.title
  const titleLength = seoTitle.length

  // Check title length
  if (titleLength === 0) {
    issues.push({
      severity: 'critical',
      category: 'title',
      message: 'SEO title is missing',
      fix: 'Add a compelling SEO title (50-60 characters)',
    })
  } else if (titleLength < 30) {
    issues.push({
      severity: 'warning',
      category: 'title',
      message: `SEO title is too short (${titleLength} chars)`,
      fix: 'Expand title to 50-60 characters for better visibility',
    })
  } else if (titleLength > 60) {
    issues.push({
      severity: 'warning',
      category: 'title',
      message: `SEO title is too long (${titleLength} chars, will be truncated)`,
      fix: 'Shorten title to 50-60 characters',
    })
  }

  // Check if primary keyword is in title
  if (post.keywords && post.keywords.length > 0) {
    const primaryKeyword = post.keywords[0]
    if (!seoTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      issues.push({
        severity: 'warning',
        category: 'title',
        message: 'Primary keyword not in SEO title',
        fix: `Include "${primaryKeyword}" in your title`,
      })
    } else {
      // Check if keyword is at the beginning
      const titleWords = seoTitle.toLowerCase().split(' ')
      const keywordWords = primaryKeyword.toLowerCase().split(' ')
      const keywordAtStart = titleWords.slice(0, keywordWords.length).join(' ') === keywordWords.join(' ')

      if (!keywordAtStart) {
        recommendations.push({
          priority: 'medium',
          category: 'title',
          action: 'Move primary keyword to the beginning of title',
          impact: 'Can improve CTR by 10-20%',
          example: `"${primaryKeyword}: ${seoTitle}"`,
        })
      }
    }
  }

  // Check for power words
  const powerWords = ['ultimate', 'complete', 'guide', 'tips', 'secrets', 'proven', 'best', 'top', 'how to', 'why']
  const hasPowerWord = powerWords.some(word => seoTitle.toLowerCase().includes(word))

  if (!hasPowerWord) {
    recommendations.push({
      priority: 'low',
      category: 'title',
      action: 'Add a power word to make title more compelling',
      impact: 'Can improve CTR by 5-10%',
      example: 'Use words like: Ultimate, Complete, Proven, Best, Top',
    })
  }
}

/**
 * Analyze meta description SEO
 */
function analyzeDescriptionSEO(post: BlogPostInput, issues: SEOIssue[], recommendations: SEORecommendation[]) {
  const description = post.seoDescription || post.excerpt || ''
  const descLength = description.length

  if (descLength === 0) {
    issues.push({
      severity: 'critical',
      category: 'description',
      message: 'Meta description is missing',
      fix: 'Add a compelling meta description (150-160 characters)',
    })
  } else if (descLength < 120) {
    issues.push({
      severity: 'warning',
      category: 'description',
      message: `Meta description is too short (${descLength} chars)`,
      fix: 'Expand to 150-160 characters for better visibility',
    })
  } else if (descLength > 160) {
    issues.push({
      severity: 'warning',
      category: 'description',
      message: `Meta description is too long (${descLength} chars, will be truncated)`,
      fix: 'Shorten to 150-160 characters',
    })
  }

  // Check for call-to-action
  const ctaWords = ['leer', 'ontdek', 'krijg', 'vind', 'bekijk', 'lees', 'download', 'probeer']
  const hasCTA = ctaWords.some(word => description.toLowerCase().includes(word))

  if (!hasCTA) {
    recommendations.push({
      priority: 'medium',
      category: 'description',
      action: 'Add a call-to-action to meta description',
      impact: 'Can improve CTR by 15-25%',
      example: 'Use action words like: Leer, Ontdek, Krijg, Vind',
    })
  }

  // Check if primary keyword is in description
  if (post.keywords && post.keywords.length > 0) {
    const primaryKeyword = post.keywords[0]
    if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      issues.push({
        severity: 'warning',
        category: 'description',
        message: 'Primary keyword not in meta description',
        fix: `Include "${primaryKeyword}" in your description`,
      })
    }
  }
}

/**
 * Analyze content SEO
 */
function analyzeContentSEO(
  post: BlogPostInput,
  metrics: SEOMetrics,
  issues: SEOIssue[],
  recommendations: SEORecommendation[]
) {
  // Word count
  if (metrics.wordCount < 300) {
    issues.push({
      severity: 'critical',
      category: 'content',
      message: `Content too short (${metrics.wordCount} words)`,
      fix: 'Expand to at least 800 words for better rankings',
    })
  } else if (metrics.wordCount < 800) {
    issues.push({
      severity: 'warning',
      category: 'content',
      message: `Content could be longer (${metrics.wordCount} words)`,
      fix: 'Aim for 1500-2500 words for competitive keywords',
    })
  } else if (metrics.wordCount > 3000) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      action: 'Consider splitting into multiple posts',
      impact: 'Easier to read and more chances to rank',
      example: 'Create a pillar post with satellite posts',
    })
  }

  // Images
  const idealImageCount = Math.ceil(metrics.wordCount / 300)
  if (metrics.images === 0) {
    issues.push({
      severity: 'warning',
      category: 'content',
      message: 'No images found',
      fix: `Add ${idealImageCount} images (1 per 300 words)`,
    })
  } else if (metrics.images < idealImageCount / 2) {
    recommendations.push({
      priority: 'medium',
      category: 'content',
      action: `Add more images (current: ${metrics.images}, recommended: ${idealImageCount})`,
      impact: 'Improves user engagement and time on page',
    })
  }

  // Alt text for images
  if (metrics.images > 0 && metrics.imagesWithAlt < metrics.images) {
    issues.push({
      severity: 'warning',
      category: 'content',
      message: `${metrics.images - metrics.imagesWithAlt} images missing alt text`,
      fix: 'Add descriptive alt text to all images for accessibility and SEO',
    })
  }

  // Internal links
  if (metrics.internalLinks === 0) {
    issues.push({
      severity: 'critical',
      category: 'content',
      message: 'No internal links found',
      fix: 'Add 3-5 links to related blog posts or kennisbank articles',
    })
  } else if (metrics.internalLinks < 3) {
    recommendations.push({
      priority: 'high',
      category: 'content',
      action: `Add more internal links (current: ${metrics.internalLinks}, recommended: 3-5)`,
      impact: 'Crucial for SEO - helps Google discover content and builds authority',
    })
  }

  // External links
  if (metrics.externalLinks === 0) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      action: 'Add 1-2 external links to authority sites',
      impact: 'Shows Google you did research and builds trust',
    })
  }
}

/**
 * Analyze keywords SEO
 */
function analyzeKeywordsSEO(
  post: BlogPostInput,
  metrics: SEOMetrics,
  issues: SEOIssue[],
  recommendations: SEORecommendation[]
) {
  if (!post.keywords || post.keywords.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'keywords',
      message: 'No keywords defined',
      fix: 'Add 5-8 relevant keywords',
    })
    return
  }

  // Check keyword count
  if (post.keywords.length < 3) {
    recommendations.push({
      priority: 'medium',
      category: 'keywords',
      action: 'Add more keywords (aim for 5-8)',
      impact: 'More keywords = more ranking opportunities',
    })
  } else if (post.keywords.length > 10) {
    issues.push({
      severity: 'warning',
      category: 'keywords',
      message: 'Too many keywords (keyword stuffing risk)',
      fix: 'Focus on 5-8 most relevant keywords',
    })
  }

  // Check keyword density
  Object.entries(metrics.keywordDensity).forEach(([keyword, density]) => {
    if (density === 0) {
      issues.push({
        severity: 'warning',
        category: 'keywords',
        message: `Keyword "${keyword}" not found in content`,
        fix: 'Use keyword naturally 3-5 times in content',
      })
    } else if (density < 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'keywords',
        action: `Use "${keyword}" more often (current: ${density.toFixed(2)}%, recommended: 1-2%)`,
        impact: 'Better keyword relevance signals',
      })
    } else if (density > 3) {
      issues.push({
        severity: 'warning',
        category: 'keywords',
        message: `Keyword "${keyword}" overused (${density.toFixed(2)}%)`,
        fix: 'Reduce usage to 1-2% to avoid keyword stuffing penalty',
      })
    }
  })
}

/**
 * Analyze readability
 */
function analyzeReadabilitySEO(
  metrics: SEOMetrics,
  issues: SEOIssue[],
  recommendations: SEORecommendation[]
) {
  // Flesch Reading Ease: 60-70 = Standard, 70-80 = Fairly Easy, 80-90 = Easy
  if (metrics.readabilityScore < 60) {
    issues.push({
      severity: 'warning',
      category: 'readability',
      message: `Content is hard to read (score: ${metrics.readabilityScore.toFixed(0)})`,
      fix: 'Use shorter sentences and simpler words',
    })
  } else if (metrics.readabilityScore > 80) {
    recommendations.push({
      priority: 'low',
      category: 'readability',
      action: 'Content is very easy to read - consider adding depth',
      impact: 'Balance simplicity with authority',
    })
  }

  // Average words per sentence
  if (metrics.avgWordsPerSentence > 25) {
    issues.push({
      severity: 'warning',
      category: 'readability',
      message: `Sentences too long (avg: ${metrics.avgWordsPerSentence.toFixed(1)} words)`,
      fix: 'Aim for 15-20 words per sentence',
    })
  }

  // Average words per paragraph
  if (metrics.avgWordsPerParagraph > 150) {
    issues.push({
      severity: 'warning',
      category: 'readability',
      message: `Paragraphs too long (avg: ${metrics.avgWordsPerParagraph.toFixed(0)} words)`,
      fix: 'Break into smaller paragraphs (80-100 words max)',
    })
  }
}

/**
 * Analyze structure
 */
function analyzeStructureSEO(
  metrics: SEOMetrics,
  issues: SEOIssue[],
  recommendations: SEORecommendation[]
) {
  // H1 check
  if (metrics.headingStructure.h1 === 0) {
    issues.push({
      severity: 'critical',
      category: 'structure',
      message: 'No H1 heading found',
      fix: 'Add one H1 heading (usually the title)',
    })
  } else if (metrics.headingStructure.h1 > 1) {
    issues.push({
      severity: 'warning',
      category: 'structure',
      message: `Multiple H1 headings (${metrics.headingStructure.h1})`,
      fix: 'Use only one H1 heading per page',
    })
  }

  // H2 check
  if (metrics.headingStructure.h2 === 0) {
    issues.push({
      severity: 'warning',
      category: 'structure',
      message: 'No H2 headings found',
      fix: 'Add H2 headings to structure your content',
    })
  } else if (metrics.headingStructure.h2 < 3 && metrics.wordCount > 1000) {
    recommendations.push({
      priority: 'medium',
      category: 'structure',
      action: 'Add more H2 headings for better structure',
      impact: 'Easier to scan and better for featured snippets',
    })
  }

  // Heading hierarchy
  if (metrics.headingStructure.h3 > 0 && metrics.headingStructure.h2 === 0) {
    issues.push({
      severity: 'warning',
      category: 'structure',
      message: 'H3 used without H2 (incorrect hierarchy)',
      fix: 'Use H2 before H3 for proper structure',
    })
  }
}

/**
 * Calculate overall SEO score
 */
function calculateSEOScore(issues: SEOIssue[], metrics: SEOMetrics): number {
  let score = 100

  // Deduct points for issues
  issues.forEach(issue => {
    if (issue.severity === 'critical') {
      score -= 15
    } else if (issue.severity === 'warning') {
      score -= 5
    } else {
      score -= 2
    }
  })

  // Bonus points for good metrics
  if (metrics.wordCount >= 1500) score += 5
  if (metrics.internalLinks >= 3) score += 5
  if (metrics.readabilityScore >= 60 && metrics.readabilityScore <= 80) score += 5
  if (metrics.headingStructure.h2 >= 3) score += 3
  if (metrics.images > 0 && metrics.imagesWithAlt === metrics.images) score += 3

  return Math.max(0, Math.min(100, score))
}

/**
 * Get grade from score
 */
function getGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

/**
 * Strip HTML tags from content
 */
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate Flesch Reading Ease
 * Formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
 */
function calculateFleschReadingEase(words: number, sentences: number, syllables: number): number {
  if (words === 0 || sentences === 0) return 0

  const asl = words / sentences // Average sentence length
  const asw = syllables / words // Average syllables per word

  const score = 206.835 - 1.015 * asl - 84.6 * asw

  return Math.max(0, Math.min(100, score))
}

/**
 * Count syllables in text (approximation)
 */
function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  let syllables = 0

  words.forEach(word => {
    // Remove non-letters
    word = word.replace(/[^a-z]/g, '')
    if (word.length === 0) return

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g)
    syllables += vowelGroups ? vowelGroups.length : 1

    // Adjust for silent e
    if (word.endsWith('e')) syllables--
    if (word.endsWith('le') && word.length > 2) syllables++

    // Minimum 1 syllable per word
    if (syllables === 0) syllables = 1
  })

  return syllables
}
