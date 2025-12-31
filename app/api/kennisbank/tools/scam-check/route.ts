import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Red flag patterns for scam detection
const RED_FLAG_PATTERNS = [
  // Money-related
  { pattern: /geld|betalen|overmaken|bedrag|euro|€/i, flag: 'Verzoek om geld', weight: 20 },
  { pattern: /crypto|bitcoin|ethereum|investering|trading/i, flag: 'Cryptocurrency/investering', weight: 25 },
  { pattern: /gift\s?card|cadeaubon|itunes|google play/i, flag: 'Vraagt om gift cards', weight: 30 },
  { pattern: /western union|moneygram|bank transfer/i, flag: 'Vraagt om geld overschrijving', weight: 30 },

  // Moving off platform
  { pattern: /whatsapp|telegram|signal|hangouts/i, flag: 'Wil snel van platform af', weight: 10 },
  { pattern: /email|mail me|stuur.*mail/i, flag: 'Wil via email communiceren', weight: 8 },

  // Love bombing / emotional manipulation
  { pattern: /ik hou van je|i love you|mijn liefde|my love|schat|darling/i, flag: 'Snelle liefdesverklaring', weight: 15 },
  { pattern: /zielsverwant|soulmate|destiny|lot|voorbestemd/i, flag: 'Overdreven romantisch', weight: 12 },
  { pattern: /eenzaam|lonely|alleen|weduwe|widow|gescheiden/i, flag: 'Emotionele manipulatie', weight: 10 },

  // Urgency / emergency
  { pattern: /noodgeval|emergency|urgent|dringend|snel|immediately/i, flag: 'Urgentie/noodsituatie', weight: 18 },
  { pattern: /ziekenhuis|hospital|dokter|operatie|ziekte|sick/i, flag: 'Medische noodsituatie', weight: 20 },
  { pattern: /vastzitten|stranded|stuck|vliegveld|airport/i, flag: 'Zegt vast te zitten', weight: 22 },

  // Suspicious occupation/location
  { pattern: /leger|army|military|soldier|soldaat/i, flag: 'Zegt in het leger te zitten', weight: 18 },
  { pattern: /olie|oil rig|offshore|platform|schip/i, flag: 'Zegt offshore te werken', weight: 20 },
  { pattern: /vn|un|united nations|hulpverlener|ngo/i, flag: 'Zegt voor UN/NGO te werken', weight: 15 },
  { pattern: /nigeria|ghana|ivory coast|ivoorkust/i, flag: 'Verdachte locatie genoemd', weight: 12 },

  // Financial manipulation
  { pattern: /erfenis|inheritance|nalatenschap|testament/i, flag: 'Erfenis genoemd', weight: 25 },
  { pattern: /miljoen|million|fortuin|fortune|rijk|wealthy/i, flag: 'Grote bedragen genoemd', weight: 15 },
  { pattern: /bank|rekening|account|iban|bic/i, flag: 'Bankgegevens genoemd', weight: 18 },
  { pattern: /advocaat|lawyer|notaris|douane|customs/i, flag: 'Juridische kosten', weight: 20 },

  // Identity verification concerns
  { pattern: /paspoort|passport|id|identiteit|bewijs/i, flag: 'Vraagt om ID', weight: 12 },
  { pattern: /foto|picture|selfie|videocall/i, flag: 'Foto-gerelateerd', weight: 5 },

  // Pig butchering specific
  { pattern: /trading platform|forex|binance|coinbase/i, flag: 'Trading platform genoemd', weight: 22 },
  { pattern: /winst|profit|returns|rendement|verdienen/i, flag: 'Belooft winst', weight: 18 },
]

// Additional context checks
function analyzeContext(message: string): { flags: string[]; score: number } {
  const flags: string[] = []
  let score = 0
  const lowerMessage = message.toLowerCase()

  // Short message with phone number
  if (message.length < 100 && /(\+31|06|00\d{2})[\d\s-]{8,}/.test(message)) {
    flags.push('Kort bericht met telefoonnummer')
    score += 15
  }

  // External links
  const urlMatches = message.match(/https?:\/\/[^\s]+/gi)
  if (urlMatches) {
    // Check for suspicious domains
    const suspiciousDomains = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'shorturl']
    urlMatches.forEach((url) => {
      if (suspiciousDomains.some((d) => url.includes(d))) {
        flags.push('Verkorte URL (verdacht)')
        score += 15
      } else {
        flags.push('Externe link')
        score += 8
      }
    })
  }

  // Specific amount mentioned
  if (/€\s?\d+|EUR\s?\d+|\$\s?\d+|USD\s?\d+|\d+\s?(euro|dollar)/i.test(message)) {
    flags.push('Specifiek bedrag genoemd')
    score += 18
  }

  // Poor grammar indicators (common in scams)
  const poorGrammarPatterns = [
    /dear\s+(friend|one|beloved)/i,
    /kindly\s+(send|help|assist)/i,
    /god\s+bless/i,
    /am\s+a\s+\w+\s+from/i,
  ]
  if (poorGrammarPatterns.some((p) => p.test(message))) {
    flags.push('Typische scam-taal')
    score += 12
  }

  // Message too long and formal for dating context
  if (message.length > 1000 && /dear|hereby|regarding|kindly/i.test(message)) {
    flags.push('Onnatuurlijk formeel taalgebruik')
    score += 10
  }

  // First message asks personal questions
  if (
    message.length < 300 &&
    /waar\s+woon|what.*work|hoeveel\s+verdien|how.*much.*earn|bank|financ/i.test(message)
  ) {
    flags.push('Vroege vraag naar persoonlijke info')
    score += 12
  }

  return { flags, score }
}

interface ScamCheckResult {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  advice: string[]
  detectedPatterns: string[]
}

function analyzeMessage(message: string): ScamCheckResult {
  const flags: string[] = []
  const detectedPatterns: string[] = []
  let riskScore = 0

  // Check against patterns
  RED_FLAG_PATTERNS.forEach(({ pattern, flag, weight }) => {
    if (pattern.test(message)) {
      if (!flags.includes(flag)) {
        flags.push(flag)
        detectedPatterns.push(pattern.source)
        riskScore += weight
      }
    }
  })

  // Add context analysis
  const contextAnalysis = analyzeContext(message)
  contextAnalysis.flags.forEach((flag) => {
    if (!flags.includes(flag)) {
      flags.push(flag)
    }
  })
  riskScore += contextAnalysis.score

  // Cap score at 100
  riskScore = Math.min(100, riskScore)

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (riskScore >= 50) riskLevel = 'high'
  else if (riskScore >= 25) riskLevel = 'medium'

  // Generate advice
  const advice: string[] = []

  if (riskScore < 25) {
    advice.push('Dit bericht lijkt veilig, maar blijf altijd alert.')
    advice.push('Vertrouw op je gevoel - als iets te mooi lijkt om waar te zijn, is het dat vaak ook.')
    advice.push('Neem de tijd om iemand te leren kennen voordat je persoonlijke informatie deelt.')
  } else if (riskScore < 50) {
    advice.push('Er zijn enkele waarschuwingssignalen in dit bericht.')
    advice.push('Wees voorzichtig met het delen van persoonlijke informatie.')
    advice.push('Vraag om een videogesprek voordat je verder gaat.')
    advice.push('Deel NOOIT financiële gegevens met iemand die je niet persoonlijk kent.')
  } else {
    advice.push('⚠️ WAARSCHUWING: Dit bericht bevat meerdere rode vlaggen.')
    advice.push('Stuur NOOIT geld naar iemand die je alleen online kent.')
    advice.push('Deel GEEN bankgegevens, gift cards of cryptocurrency.')
    advice.push('Overweeg dit profiel te blokkeren en te melden.')
    advice.push('Als je al geld hebt overgemaakt, bel direct de Fraudehelpdesk: 088-786 73 72')
  }

  return {
    riskScore,
    riskLevel,
    flags,
    advice,
    detectedPatterns,
  }
}

// POST /api/kennisbank/tools/scam-check - Analyze a message for scam patterns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, type = 'message' } = body

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Geen bericht om te analyseren' },
        { status: 400 }
      )
    }

    if (content.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Bericht is te kort (minimaal 10 karakters)' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Bericht is te lang (maximaal 10.000 karakters)' },
        { status: 400 }
      )
    }

    // Analyze the message
    const result = analyzeMessage(content)

    // Track tool usage (fire and forget)
    const session = await getServerSession(authOptions)
    prisma.knowledgeBaseTool
      .updateMany({
        where: { slug: 'scam-checker' },
        data: { usageCount: { increment: 1 } },
      })
      .catch(() => {})

    // Optionally save result for analytics (anonymized)
    prisma.knowledgeBaseToolResult
      .create({
        data: {
          toolId: 'scam-checker', // Will need to be actual tool ID
          userId: session?.user?.id || null,
          input: { type, length: content.length }, // Don't store actual content
          output: {
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            flagCount: result.flags.length,
          },
          score: result.riskScore,
        },
      })
      .catch(() => {})

    return NextResponse.json({
      success: true,
      data: {
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        flags: result.flags,
        advice: result.advice,
        // Additional metadata
        analysisType: type,
        messageLength: content.length,
        // Cross-promotion
        externalTools: {
          advancedCheck: {
            name: 'DatingAssistent.nl Scam Checker',
            url: 'https://datingassistent.nl/scam-checker?ref=lvi',
            description: 'Voor geavanceerde AI-analyse met meer context',
          },
        },
        // Help resources
        resources: {
          fraudehelpdesk: {
            name: 'Fraudehelpdesk',
            phone: '088-786 73 72',
            url: 'https://www.fraudehelpdesk.nl',
          },
          politie: {
            name: 'Aangifte doen',
            url: 'https://www.politie.nl/aangifte-of-melding-doen',
          },
        },
      },
    })
  } catch (error) {
    console.error('Error analyzing message:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het analyseren' },
      { status: 500 }
    )
  }
}
