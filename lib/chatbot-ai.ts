/**
 * Chatbot AI Logic
 * Handles FAQ search and chatbot response generation
 */

import { prisma } from './prisma'

interface Message {
  role: string
  content: string
}

interface ChatbotResponse {
  message: string
  suggestedArticleIds: string[]
  suggestEscalation: boolean
}

/**
 * Search FAQ articles using keywords and content matching
 */
export async function searchFAQArticles(query: string, limit: number = 5) {
  try {
    // Extract keywords from query
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out short words

    // Search in title, content, and keywords
    const articles = await prisma.fAQArticle.findMany({
      where: {
        isPublished: true,
        OR: [
          { titleNl: { contains: query, mode: 'insensitive' } },
          { contentNl: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: keywords } },
          { excerpt: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: {
          select: { nameNl: true, icon: true }
        }
      },
      take: limit,
      orderBy: [
        { viewCount: 'desc' }, // Prioritize popular articles
        { helpfulCount: 'desc' }
      ]
    })

    return articles
  } catch (error) {
    console.error('Error searching FAQ articles:', error)
    return []
  }
}

/**
 * Generate chatbot response using FAQ articles and conversation context
 *
 * This is a rule-based implementation for MVP.
 * Can be enhanced with OpenAI/Claude API for more intelligent responses.
 */
export async function generateChatbotResponse(params: {
  userMessage: string
  conversationHistory: Message[]
  relevantArticles: any[]
}): Promise<ChatbotResponse> {
  const { userMessage, conversationHistory, relevantArticles } = params

  // Check if we have relevant FAQ articles
  if (relevantArticles.length > 0) {
    const topArticle = relevantArticles[0]

    // Extract first paragraph or first 300 characters from content
    const excerpt = topArticle.contentNl
      .split('\n\n')[0]
      .substring(0, 300)

    // Build response message
    const message = `
Ik heb deze informatie gevonden die je kan helpen:

**${topArticle.titleNl}**

${excerpt}${topArticle.contentNl.length > 300 ? '...' : ''}

${relevantArticles.length > 1 ? `\n\nIk heb ook ${relevantArticles.length - 1} andere relevante artikel(en) gevonden.` : ''}

Wil je het volledige artikel lezen? Of kan ik je ergens anders mee helpen?

Als je antwoord niet compleet is, kan ik je vraag doorsturen naar ons support team.
    `.trim()

    return {
      message,
      suggestedArticleIds: relevantArticles.map(a => a.id),
      suggestEscalation: false
    }
  }

  // No FAQ articles found - suggest escalation
  // Check if user is asking for human help
  const escalationKeywords = [
    'help',
    'hulp',
    'spreek',
    'praat',
    'mens',
    'medewerker',
    'agent',
    'ticket',
    'probleem',
    'lukt niet',
    'werkt niet'
  ]

  const wantsEscalation = escalationKeywords.some(keyword =>
    userMessage.toLowerCase().includes(keyword)
  )

  if (wantsEscalation || conversationHistory.length >= 4) {
    // After 4+ messages or explicit request, suggest ticket
    return {
      message: `
Het spijt me dat ik je vraag niet direct kan beantwoorden.

Ik kan je vraag doorsturen naar ons support team, zodat een medewerker je persoonlijk kan helpen. Zij reageren meestal binnen 24 uur.

Wil je een support ticket aanmaken?
      `.trim(),
      suggestedArticleIds: [],
      suggestEscalation: true
    }
  }

  // General helpful response
  return {
    message: `
Bedankt voor je vraag. Ik heb helaas geen direct antwoord in onze kennisbank gevonden.

Kun je je vraag misschien anders formuleren? Of vertel me meer details, dan kan ik beter zoeken.

Je kunt ook onze veelgestelde vragen doorbladeren, of ik kan je vraag doorsturen naar het support team.
    `.trim(),
    suggestedArticleIds: [],
    suggestEscalation: false
  }
}

/**
 * Determine if message contains common greeting
 */
export function isGreeting(message: string): boolean {
  const greetings = ['hoi', 'hey', 'hallo', 'goedemiddag', 'goedemorgen', 'goedenavond', 'hi', 'hello']
  const lowerMessage = message.toLowerCase().trim()

  return greetings.some(greeting => lowerMessage === greeting || lowerMessage.startsWith(greeting + ' '))
}

/**
 * Generate greeting response
 */
export function getGreetingResponse(): string {
  const greetings = [
    'Hoi! Ik ben je support assistent. Hoe kan ik je helpen?',
    'Hey! Waarmee kan ik je vandaag helpen?',
    'Hallo! Stel gerust je vraag, ik help je graag verder.',
    'Goedendag! Hoe kan ik je van dienst zijn?'
  ]

  return greetings[Math.floor(Math.random() * greetings.length)]
}

/**
 * Enhanced version using OpenAI API (for future implementation)
 *
 * @example
 * const response = await generateAIChatbotResponse({ ... })
 */
export async function generateAIChatbotResponse(params: {
  userMessage: string
  conversationHistory: Message[]
  relevantArticles: any[]
}): Promise<ChatbotResponse> {
  // TODO: Implement OpenAI/Claude API integration
  //
  // const systemPrompt = `
  // Je bent een behulpzame support chatbot voor Liefde Voor Iedereen,
  // een Nederlandse dating app. Je helpt gebruikers met hun vragen over
  // de app, accounts, matching, berichten, betalingen en verificatie.
  //
  // Gebruik de FAQ artikelen hieronder om vragen te beantwoorden.
  // Als je geen passend antwoord hebt, stel dan voor om de vraag door
  // te sturen naar het support team.
  //
  // Wees vriendelijk, behulpzaam en professioneel. Antwoord altijd in het Nederlands.
  // `
  //
  // const faqContext = params.relevantArticles
  //   .map(a => `**${a.titleNl}**: ${a.excerpt || a.contentNl.substring(0, 200)}`)
  //   .join('\n\n')
  //
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [
  //     { role: 'system', content: systemPrompt + '\n\nFAQ:\n' + faqContext },
  //     ...params.conversationHistory,
  //     { role: 'user', content: params.userMessage }
  //   ],
  //   temperature: 0.7,
  //   max_tokens: 500
  // })
  //
  // return {
  //   message: response.choices[0].message.content || '',
  //   suggestedArticleIds: params.relevantArticles.map(a => a.id),
  //   suggestEscalation: response.choices[0].message.content?.toLowerCase().includes('support team') || false
  // }

  // Fallback to rule-based for now
  return generateChatbotResponse(params)
}
