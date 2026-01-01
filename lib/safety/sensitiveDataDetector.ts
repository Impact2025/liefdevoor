/**
 * SensitiveDataDetector - Detecteert gevoelige gegevens in berichten
 *
 * Detecteert:
 * - Telefoonnummers (NL formaat)
 * - IBAN/bankrekeningen
 * - Email adressen
 * - Woorden gerelateerd aan geld/scams
 */

export interface DetectionResult {
  hasSensitiveData: boolean
  detections: Detection[]
  highestRisk: RiskLevel
  suggestedWarningType: WarningType
}

export interface Detection {
  type: DetectionType
  value: string
  risk: RiskLevel
  position: { start: number; end: number }
}

export type DetectionType =
  | 'phone'
  | 'iban'
  | 'email'
  | 'money_word'
  | 'crypto'
  | 'link'
  | 'personal_info'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type WarningType = 'phone' | 'iban' | 'money' | 'scam' | 'personal' | 'generic'

// Detection patterns
const PATTERNS = {
  // Dutch phone numbers
  phone: [
    /\b06[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{2}\b/g,    // 06 12 34 56 78
    /\b06[-\s]?\d{8}\b/g,                                       // 06 12345678
    /(?:^|\s)\+31[-\s]?6[-\s]?\d{8}(?:\s|$)/g,                  // +31 6 12345678 (no \b due to +)
    /\b0031[-\s]?6[-\s]?\d{8}\b/g,                              // 0031 6 12345678
  ],

  // IBAN numbers
  iban: [
    /\b[A-Z]{2}\d{2}[-\s]?[A-Z]{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{2,4}\b/gi, // NL91 ABNA 0417 1643 00
    /\bNL\d{2}\s?[A-Z]{4}\s?\d{4}\s?\d{4}\s?\d{2}\b/gi,                      // NL91 ABNA 0417 1643 00
    /\biban\s*[:=]?\s*[A-Z0-9\s-]{15,30}\b/gi,                               // IBAN: ...
  ],

  // Email addresses (external platforms)
  email: [
    /\b[A-Za-z0-9._%+-]+@(?!liefdevooriederen\.nl)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  ],

  // Crypto/payment words (Dutch + English)
  money_word: [
    /\b(tikkie|betaal|betalen|betaling|overmaken|geld\s+sturen|bank\s*rekening)\b/gi,
    /\b(overboeking|storting|opwaarderen)\b/gi,
    /\b(payment|transfer|send\s+money|bank\s*account)\b/gi,
  ],

  // Cryptocurrency
  crypto: [
    /\b(bitcoin|btc|ethereum|eth|crypto|wallet|usdt|binance)\b/gi,
    /\b0x[a-fA-F0-9]{30,42}\b/g,  // Ethereum address (flexible length)
    /\b(bc1[a-zA-Z0-9]{25,39})\b/g,  // Bitcoin bech32 address
  ],

  // External links
  link: [
    /\bhttps?:\/\/[^\s]+/gi,
    /\bwww\.[^\s]+/gi,
    /\b[a-z0-9-]+\.(com|nl|org|net|io|co)\b/gi,
  ],

  // Personal info keywords
  personal_info: [
    /\b(adres|woonplaats|postcode|huisnummer)\b/gi,
    /\b(bsn|burger\s*service\s*nummer|sofi\s*nummer)\b/gi,
    /\b(paspoort|rijbewijs|id[-\s]?kaart)\b/gi,
  ],
}

// Risk levels per detection type
const RISK_LEVELS: Record<DetectionType, RiskLevel> = {
  phone: 'high',
  iban: 'critical',
  email: 'medium',
  money_word: 'medium',
  crypto: 'critical',
  link: 'medium',
  personal_info: 'high',
}

// Warning type mapping
const WARNING_TYPES: Record<DetectionType, WarningType> = {
  phone: 'phone',
  iban: 'iban',
  email: 'personal',
  money_word: 'money',
  crypto: 'scam',
  link: 'scam',
  personal_info: 'personal',
}

/**
 * Detect sensitive data in a message
 */
export function detectSensitiveData(content: string): DetectionResult {
  const detections: Detection[] = []

  // Check each pattern type
  for (const [type, patterns] of Object.entries(PATTERNS)) {
    const detectionType = type as DetectionType

    for (const pattern of patterns) {
      // Reset regex lastIndex
      pattern.lastIndex = 0

      let match
      while ((match = pattern.exec(content)) !== null) {
        detections.push({
          type: detectionType,
          value: match[0],
          risk: RISK_LEVELS[detectionType],
          position: {
            start: match.index,
            end: match.index + match[0].length,
          },
        })
      }
    }
  }

  // Deduplicate detections by position
  const uniqueDetections = detections.filter((detection, index, self) =>
    index === self.findIndex(d =>
      d.position.start === detection.position.start &&
      d.position.end === detection.position.end
    )
  )

  // Sort by risk level (highest first)
  const riskOrder: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  uniqueDetections.sort((a, b) => riskOrder[b.risk] - riskOrder[a.risk])

  // Determine highest risk and suggested warning type
  const highestRisk = uniqueDetections[0]?.risk || 'low'
  const suggestedWarningType = uniqueDetections[0]
    ? WARNING_TYPES[uniqueDetections[0].type]
    : 'generic'

  return {
    hasSensitiveData: uniqueDetections.length > 0,
    detections: uniqueDetections,
    highestRisk,
    suggestedWarningType,
  }
}

/**
 * Check if content should trigger a warning for LVB users
 */
export function shouldWarnLVBUser(content: string): {
  shouldWarn: boolean
  warningType: WarningType
  detectedContent: string | null
} {
  const result = detectSensitiveData(content)

  // For LVB users, warn on medium risk and above
  const shouldWarn = result.hasSensitiveData &&
    ['medium', 'high', 'critical'].includes(result.highestRisk)

  return {
    shouldWarn,
    warningType: result.suggestedWarningType,
    detectedContent: result.detections[0]?.value || null,
  }
}

/**
 * Mask sensitive data in a message (for display/logging)
 */
export function maskSensitiveData(content: string): string {
  const result = detectSensitiveData(content)

  let maskedContent = content

  // Sort detections by position (descending) to avoid position shifts
  const sortedDetections = [...result.detections].sort(
    (a, b) => b.position.start - a.position.start
  )

  for (const detection of sortedDetections) {
    const { start, end } = detection.position
    const maskedValue = '*'.repeat(end - start)
    maskedContent = maskedContent.slice(0, start) + maskedValue + maskedContent.slice(end)
  }

  return maskedContent
}

export default detectSensitiveData
