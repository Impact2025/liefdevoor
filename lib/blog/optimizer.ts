/**
 * Blog Content Optimizer
 *
 * Optimizes blog content for SEO, readability, and social media using OpenRouter API
 */

export interface OptimizeContentParams {
  title: string
  content: string
  categoryId: string
  excerpt?: string
}

export interface OptimizedContent {
  optimizedContent: string  // SEO-optimized version
  seoTitle: string
  seoDescription: string
  keywords: string[]
  socialMedia: {
    instagram: string
    facebook: string
    linkedin: string
    twitter: string
  }
  imagePrompt: string
  excerpt: string
}

/**
 * Optimizes blog content using OpenRouter API (Claude 3 Haiku)
 * This is the core optimization function that will be called from the save route
 */
export async function optimizeBlogContent(
  params: OptimizeContentParams
): Promise<OptimizedContent> {

  // If no API key, return minimal optimization
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[Blog Optimizer] No OPENROUTER_API_KEY found, using fallback')
    return createFallbackOptimization(params)
  }

  const prompt = buildOptimizationPrompt(params)

  // Call OpenRouter with retry logic
  const maxRetries = 2
  let lastError: any = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
          'X-Title': 'Wereldklasse Dating App - Blog Optimizer',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429 && attempt < maxRetries) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
          continue
        }
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const rawContent = data.choices?.[0]?.message?.content?.trim()

      if (!rawContent) {
        throw new Error('No content received from AI')
      }

      // Parse JSON response
      const cleanedContent = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim()

      const optimized = JSON.parse(cleanedContent)

      // Validate optimized content
      if (!validateOptimizedContent(optimized)) {
        console.warn('[Blog Optimizer] Invalid optimized content structure, using fallback')
        return createFallbackOptimization(params)
      }

      console.log('[Blog Optimizer] Successfully optimized content')

      return {
        optimizedContent: optimized.content,
        seoTitle: optimized.seoTitle,
        seoDescription: optimized.seoDescription,
        keywords: optimized.keywords || [],
        socialMedia: optimized.socialMedia,
        imagePrompt: optimized.midjourneyPrompt || optimized.imagePrompt,
        excerpt: optimized.excerpt
      }

    } catch (error: any) {
      lastError = error

      if (error.name === 'AbortError') {
        console.error('[Blog Optimizer] Request timeout')
      } else {
        console.error(`[Blog Optimizer] Attempt ${attempt} failed:`, error.message)
      }

      if (attempt === maxRetries) {
        console.error('[Blog Optimizer] All retries failed, using fallback')
        return createFallbackOptimization(params)
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  return createFallbackOptimization(params)
}

/**
 * Build optimization prompt for OpenRouter API
 */
function buildOptimizationPrompt(params: OptimizeContentParams): string {
  return `Je bent een wereldklasse SEO expert en content optimizer voor Nederlandse dating content.

TAAK: Optimaliseer de volgende blog content voor maximale SEO impact en leesbaarheid.

ORIGINELE CONTENT:
Titel: ${params.title}
Content: ${params.content}
${params.excerpt ? `Excerpt: ${params.excerpt}` : ''}

OPTIMALISATIE VEREISTEN:

1. CONTENT OPTIMALISATIE:
   - Behoud de originele H1 en structuur
   - Verbeter SEO: voeg primary/secondary keywords natuurlijk toe
   - Optimaliseer heading structuur (H1 → H2 → H3)
   - Verbeter leesbaarheid: kortere zinnen, duidelijke paragrafen
   - Voeg 2-3 strategische interne links toe: /register (registreren), /features (premium functies), of /dashboard (dashboard)
   - Gebruik semantische HTML: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>
   - GEEN emoji's toevoegen

2. SEO METADATA:
   - seoTitle: 50-60 karakters, bevat primary keyword, actionable
   - seoDescription: 145-155 karakters, bevat keyword + CTA
   - keywords: 5 long-tail keywords (Nederlands) relevant voor dating

3. SOCIAL MEDIA:
   - instagram: 150 chars max, casual tone, 3-4 hashtags (#datingtips #relatie #liefde)
   - facebook: 250 chars max, vraag-element voor engagement
   - linkedin: 200 chars max, professionele tone
   - twitter: 280 chars max, pakkend met hashtags

4. FEATURED IMAGE:
   - midjourneyPrompt: Engelse prompt voor moderne, authentieke Nederlandse dating scene
   - Stijl: "Modern lifestyle photography, warm tones, authentic Dutch people, professional quality"

5. EXCERPT:
   - 2-3 zinnen, maximum 200 karakters
   - Vat essentie artikel samen

OUTPUT FORMAT (JSON only, geen markdown):
{
  "content": "...optimized HTML content...",
  "seoTitle": "...",
  "seoDescription": "...",
  "keywords": ["...", "...", "...", "...", "..."],
  "socialMedia": {
    "instagram": "...",
    "facebook": "...",
    "linkedin": "...",
    "twitter": "..."
  },
  "midjourneyPrompt": "...",
  "excerpt": "..."
}

Optimaliseer nu de content naar wereldklasse niveau.`
}

/**
 * Validate optimized content structure
 */
function validateOptimizedContent(optimized: any): boolean {
  // Ensure required fields exist
  if (!optimized.content || optimized.content.length < 100) return false
  if (!optimized.seoTitle || optimized.seoTitle.length > 60) return false
  if (!optimized.seoDescription || optimized.seoDescription.length > 155) return false
  if (!optimized.keywords || optimized.keywords.length === 0) return false

  // Ensure HTML structure is maintained
  if (!optimized.content.includes('<h1>') && !optimized.content.includes('<h2>')) return false

  // Ensure social media fields exist
  if (!optimized.socialMedia ||
      !optimized.socialMedia.instagram ||
      !optimized.socialMedia.facebook) return false

  return true
}

/**
 * Create fallback optimization without AI
 */
function createFallbackOptimization(params: OptimizeContentParams): OptimizedContent {
  const title = params.title
  const excerpt = params.excerpt || `Ontdek meer over ${title} in dit artikel.`

  return {
    optimizedContent: params.content, // Keep original
    seoTitle: title.substring(0, 60),
    seoDescription: excerpt.substring(0, 155),
    keywords: [
      title.toLowerCase(),
      'dating tips',
      'relatie',
      'online dating',
      'liefde'
    ],
    socialMedia: {
      instagram: `${title.substring(0, 120)} #datingtips #relatie #liefde`,
      facebook: `Nieuw artikel: ${title}`,
      linkedin: `Nieuwe inzichten over ${title}`,
      twitter: `${title.substring(0, 250)} #dating`
    },
    imagePrompt: `Modern lifestyle photography of Dutch people in a dating context, warm tones, authentic connection, professional quality`,
    excerpt
  }
}
