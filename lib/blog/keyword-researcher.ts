/**
 * AI Keyword Research Tool
 *
 * Suggests keywords based on topic, competition, and search intent
 */

import { prisma } from '@/lib/prisma'

export interface KeywordSuggestion {
  keyword: string
  searchVolume: 'low' | 'medium' | 'high' | 'very-high'
  competition: 'low' | 'medium' | 'high'
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional'
  difficulty: number // 0-100
  opportunity: number // 0-100 (how good this keyword is for you)
  relatedKeywords: string[]
  questionFormat?: string
  reason: string
}

export interface KeywordResearchResult {
  topic: string
  primaryKeywords: KeywordSuggestion[]
  secondaryKeywords: KeywordSuggestion[]
  longTailKeywords: KeywordSuggestion[]
  contentIdeas: ContentIdea[]
}

export interface ContentIdea {
  title: string
  format: 'listicle' | 'how-to' | 'guide' | 'comparison' | 'review' | 'case-study'
  targetKeywords: string[]
  estimatedWords: number
  priority: 'high' | 'medium' | 'low'
}

/**
 * Research keywords for a given topic
 */
export async function researchKeywords(topic: string): Promise<KeywordResearchResult> {
  const normalizedTopic = topic.toLowerCase().trim()

  // Generate keyword variations
  const primaryKeywords = await generatePrimaryKeywords(normalizedTopic)
  const secondaryKeywords = await generateSecondaryKeywords(normalizedTopic)
  const longTailKeywords = await generateLongTailKeywords(normalizedTopic)

  // Generate content ideas
  const contentIdeas = generateContentIdeas(normalizedTopic, primaryKeywords, longTailKeywords)

  return {
    topic: normalizedTopic,
    primaryKeywords,
    secondaryKeywords,
    longTailKeywords,
    contentIdeas,
  }
}

/**
 * Generate primary keywords (1-2 words, broad)
 */
async function generatePrimaryKeywords(topic: string): Promise<KeywordSuggestion[]> {
  const datingKeywords: Record<string, Partial<KeywordSuggestion>> = {
    'online dating': {
      searchVolume: 'very-high',
      competition: 'high',
      intent: 'informational',
      difficulty: 75,
      opportunity: 60,
      reason: 'High volume maar competitief - gebruik in pillar posts',
    },
    'dating tips': {
      searchVolume: 'high',
      competition: 'medium',
      intent: 'informational',
      difficulty: 55,
      opportunity: 75,
      reason: 'Goede balans tussen volume en competitie',
    },
    'eerste date': {
      searchVolume: 'high',
      competition: 'medium',
      intent: 'informational',
      difficulty: 50,
      opportunity: 80,
      reason: 'Nederlands keyword, minder competitie',
    },
    'dating app': {
      searchVolume: 'very-high',
      competition: 'high',
      intent: 'commercial',
      difficulty: 70,
      opportunity: 65,
      reason: 'Commercieel intent - kan leiden tot conversies',
    },
    'relatie': {
      searchVolume: 'very-high',
      competition: 'high',
      intent: 'informational',
      difficulty: 80,
      opportunity: 50,
      reason: 'Breed keyword - combineer met specifiekere termen',
    },
    'tinder': {
      searchVolume: 'very-high',
      competition: 'high',
      intent: 'navigational',
      difficulty: 85,
      opportunity: 70,
      reason: 'Brand keyword - mensen zoeken tips, niet de app zelf',
    },
    'bumble': {
      searchVolume: 'high',
      competition: 'medium',
      intent: 'navigational',
      difficulty: 70,
      opportunity: 75,
      reason: 'Groeiende app, minder verzadigde content',
    },
    'match': {
      searchVolume: 'medium',
      competition: 'medium',
      intent: 'informational',
      difficulty: 60,
      opportunity: 70,
      reason: 'Meerdere betekenissen, focus op dating context',
    },
  }

  // Find keywords related to topic
  const suggestions: KeywordSuggestion[] = []

  Object.entries(datingKeywords).forEach(([keyword, data]) => {
    if (
      keyword.includes(topic) ||
      topic.includes(keyword) ||
      isRelated(topic, keyword)
    ) {
      suggestions.push({
        keyword,
        searchVolume: data.searchVolume || 'medium',
        competition: data.competition || 'medium',
        intent: data.intent || 'informational',
        difficulty: data.difficulty || 60,
        opportunity: data.opportunity || 60,
        relatedKeywords: generateRelatedKeywords(keyword),
        reason: data.reason || 'Relevant voor jouw topic',
      })
    }
  })

  // Add topic itself if not already included
  if (!suggestions.some(s => s.keyword === topic)) {
    suggestions.unshift({
      keyword: topic,
      searchVolume: 'medium',
      competition: 'medium',
      intent: 'informational',
      difficulty: 60,
      opportunity: 75,
      relatedKeywords: generateRelatedKeywords(topic),
      reason: 'Exact match voor je topic',
    })
  }

  return suggestions.slice(0, 5)
}

/**
 * Generate secondary keywords (2-3 words, more specific)
 */
async function generateSecondaryKeywords(topic: string): Promise<KeywordSuggestion[]> {
  const secondaryTemplates = [
    `${topic} tips`,
    `${topic} voor beginners`,
    `${topic} gids`,
    `beste ${topic}`,
    `${topic} voorbeelden`,
    `${topic} uitleg`,
    `${topic} nederland`,
    `${topic} 2026`,
    `hoe werkt ${topic}`,
    `${topic} advies`,
  ]

  const suggestions: KeywordSuggestion[] = secondaryTemplates.slice(0, 8).map(keyword => ({
    keyword,
    searchVolume: 'medium',
    competition: 'low',
    intent: 'informational',
    difficulty: 40,
    opportunity: 85,
    relatedKeywords: [],
    reason: 'Specifieke variant met lagere competitie',
  }))

  return suggestions
}

/**
 * Generate long-tail keywords (4+ words, very specific)
 */
async function generateLongTailKeywords(topic: string): Promise<KeywordSuggestion[]> {
  const questionWords = ['hoe', 'wat', 'waarom', 'wanneer', 'welke', 'wie']
  const modifiers = ['beste', 'goede', 'slechte', 'fouten', 'tips', 'trucs']

  const suggestions: KeywordSuggestion[] = []

  // Question-based long-tail
  const questionTemplates = [
    `hoe ${topic} je succesvol`,
    `wat zijn de beste ${topic} tips`,
    `waarom is ${topic} belangrijk`,
    `wanneer moet je ${topic}`,
    `welke ${topic} app is het beste`,
    `hoe begin je met ${topic}`,
    `wat moet je niet doen bij ${topic}`,
    `hoe herken je ${topic} red flags`,
    `wat zijn de do's en don'ts van ${topic}`,
    `hoe maak je ${topic} profiel`,
  ]

  questionTemplates.forEach(keyword => {
    suggestions.push({
      keyword,
      searchVolume: 'low',
      competition: 'low',
      intent: 'informational',
      difficulty: 20,
      opportunity: 95,
      relatedKeywords: [],
      questionFormat: keyword,
      reason: 'Vraag-based keyword - perfect voor featured snippets',
    })
  })

  return suggestions.slice(0, 10)
}

/**
 * Generate content ideas based on keywords
 */
function generateContentIdeas(
  topic: string,
  primaryKeywords: KeywordSuggestion[],
  longTailKeywords: KeywordSuggestion[]
): ContentIdea[] {
  const ideas: ContentIdea[] = []

  // Listicle ideas
  ideas.push({
    title: `10 ${topic.charAt(0).toUpperCase() + topic.slice(1)} Tips die Écht Werken`,
    format: 'listicle',
    targetKeywords: [`${topic} tips`, topic],
    estimatedWords: 1500,
    priority: 'high',
  })

  ideas.push({
    title: `Top 5 ${topic.charAt(0).toUpperCase() + topic.slice(1)} Fouten (En Hoe Je Ze Voorkomt)`,
    format: 'listicle',
    targetKeywords: [`${topic} fouten`, `${topic} tips`],
    estimatedWords: 1200,
    priority: 'medium',
  })

  // How-to guide
  ideas.push({
    title: `Hoe ${topic.charAt(0).toUpperCase() + topic.slice(1)} in 5 Stappen: Complete Gids 2026`,
    format: 'how-to',
    targetKeywords: [`hoe ${topic}`, `${topic} gids`],
    estimatedWords: 2000,
    priority: 'high',
  })

  // Ultimate guide (pillar)
  ideas.push({
    title: `Ultimate ${topic.charAt(0).toUpperCase() + topic.slice(1)} Gids: Alles Wat Je Moet Weten`,
    format: 'guide',
    targetKeywords: primaryKeywords.map(k => k.keyword).slice(0, 3),
    estimatedWords: 3000,
    priority: 'high',
  })

  // Comparison
  if (topic.includes('app') || topic.includes('dating')) {
    ideas.push({
      title: `Tinder vs Bumble vs Hinge: Welke Dating App is Beste?`,
      format: 'comparison',
      targetKeywords: ['beste dating app', 'dating app vergelijking'],
      estimatedWords: 1800,
      priority: 'medium',
    })
  }

  // Question-based (from long-tail)
  if (longTailKeywords.length > 0) {
    const questionKeyword = longTailKeywords[0]
    ideas.push({
      title: questionKeyword.keyword.charAt(0).toUpperCase() + questionKeyword.keyword.slice(1) + '?',
      format: 'how-to',
      targetKeywords: [questionKeyword.keyword],
      estimatedWords: 1000,
      priority: 'medium',
    })
  }

  return ideas.slice(0, 6)
}

/**
 * Check if two keywords are related
 */
function isRelated(keyword1: string, keyword2: string): boolean {
  const relatedTerms: Record<string, string[]> = {
    'dating': ['relatie', 'match', 'tinder', 'bumble', 'online', 'app', 'profiel', 'date'],
    'eerste date': ['date idee', 'gesprek', 'tips', 'locatie', 'outfit'],
    'profiel': ['foto', 'bio', 'tekst', 'opener', 'match'],
    'match': ['swipe', 'like', 'chat', 'bericht', 'opener'],
    'ghosting': ['contact', 'reactie', 'bericht', 'verdwijnen'],
    'red flags': ['waarschuwing', 'signalen', 'toxisch', 'gevaar'],
  }

  const k1Lower = keyword1.toLowerCase()
  const k2Lower = keyword2.toLowerCase()

  // Direct word match
  const k1Words = k1Lower.split(' ')
  const k2Words = k2Lower.split(' ')

  if (k1Words.some(w => k2Words.includes(w))) return true

  // Related terms
  for (const [key, related] of Object.entries(relatedTerms)) {
    if (k1Lower.includes(key) && related.some(r => k2Lower.includes(r))) return true
    if (k2Lower.includes(key) && related.some(r => k1Lower.includes(r))) return true
  }

  return false
}

/**
 * Generate related keywords
 */
function generateRelatedKeywords(keyword: string): string[] {
  const related: string[] = []

  // Add variations
  related.push(`${keyword} tips`)
  related.push(`beste ${keyword}`)
  related.push(`${keyword} 2026`)
  related.push(`${keyword} nederland`)

  return related.slice(0, 4)
}

/**
 * Suggest keywords based on existing blog posts
 * (Find gaps in your content)
 */
export async function suggestKeywordGaps(): Promise<{
  missingTopics: string[]
  underservedKeywords: string[]
  opportunities: KeywordSuggestion[]
}> {
  // Get existing blog posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { title: true, keywords: true },
  })

  // Common dating topics
  const allTopics = [
    'online dating',
    'eerste date',
    'dating profiel',
    'ghosting',
    'red flags',
    'catfish',
    'dating tips',
    'tinder',
    'bumble',
    'conversatie starters',
    'dating app fotos',
    'lange afstand relatie',
    'breadcrumbing',
    'love bombing',
    'situationship',
  ]

  // Find topics not covered
  const coveredTopics = new Set<string>()
  posts.forEach(post => {
    const keywords = Array.isArray(post.keywords) ? post.keywords : []
    keywords.forEach((kw: any) => {
      const kwStr = String(kw).toLowerCase()
      allTopics.forEach(topic => {
        if (kwStr.includes(topic) || topic.includes(kwStr)) {
          coveredTopics.add(topic)
        }
      })
    })
  })

  const missingTopics = allTopics.filter(t => !coveredTopics.has(t))

  // Generate opportunities from missing topics
  const opportunities: KeywordSuggestion[] = missingTopics.slice(0, 5).map(topic => ({
    keyword: topic,
    searchVolume: 'medium',
    competition: 'low',
    intent: 'informational',
    difficulty: 40,
    opportunity: 90,
    relatedKeywords: generateRelatedKeywords(topic),
    reason: 'Gap in je content - geen competitie van eigen artikelen',
  }))

  return {
    missingTopics,
    underservedKeywords: missingTopics.slice(0, 10),
    opportunities,
  }
}
