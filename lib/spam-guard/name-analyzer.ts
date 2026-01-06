/**
 * Name Analyzer - Detecteert bot-gegenereerde namen
 *
 * Analyseert namen op:
 * - Shannon entropy (randomness)
 * - Consonant/vowel ratio
 * - Bekende spam patronen
 * - Keyboard patterns
 * - Repetitieve karakters
 */

export interface NameAnalysisResult {
  isValid: boolean
  isSuspicious: boolean
  suspicionScore: number // 0-100, hoger = verdachter
  reasons: string[]
  details: {
    entropy: number
    consonantRatio: number
    hasKeyboardPattern: boolean
    hasRepetition: boolean
    hasNumbersInName: boolean
    isAllCaps: boolean
    isTooShort: boolean
    isTooLong: boolean
  }
}

// Keyboard patterns die vaak door bots worden gebruikt
const KEYBOARD_PATTERNS = [
  'qwerty', 'asdf', 'zxcv', 'qazwsx', 'wasd',
  '1234', '4321', 'abcd', 'dcba',
  'aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff',
  'abc123', '123abc', 'test', 'user', 'admin',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
]

// Bekende spam naam patronen
const SPAM_NAME_PATTERNS = [
  /^[a-z]+\d{3,}$/i,           // john123456
  /^\d+[a-z]+$/i,              // 123john
  /^[a-z]{1,3}\d{5,}[a-z]*$/i, // abc12345, jd9862506
  /^test\d*$/i,                // test, test123
  /^user\d*$/i,                // user, user123
  /^admin\d*$/i,               // admin, admin123
  /^[a-z]{15,}$/i,             // extreem lange naam zonder spaties
  /^(.)\1{3,}/i,               // aaaa, bbbb (4+ herhalingen aan begin)
  /(.)\1{4,}/i,                // 5+ herhalingen ergens
  /^[bcdfghjklmnpqrstvwxyz]{5,}$/i, // alleen medeklinkers
]

// Echte Nederlandse/internationale voornamen (whitelist)
const COMMON_FIRST_NAMES = new Set([
  // Nederlandse namen
  'jan', 'piet', 'klaas', 'henk', 'willem', 'johan', 'peter', 'marco', 'robert',
  'anna', 'maria', 'emma', 'sophie', 'julia', 'lisa', 'eva', 'sara', 'laura',
  'thomas', 'lucas', 'daan', 'sem', 'finn', 'liam', 'noah', 'jesse', 'milan',
  'fleur', 'lotte', 'sanne', 'isa', 'noa', 'mila', 'tessa', 'lynn', 'anne',
  // Internationale namen
  'john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'joseph',
  'sarah', 'jennifer', 'jessica', 'emily', 'ashley', 'amanda', 'nicole', 'stephanie',
  'mohammed', 'ahmed', 'ali', 'omar', 'hassan', 'fatima', 'aisha', 'leila',
  'wei', 'chen', 'zhang', 'li', 'wang', 'liu', 'yang', 'huang',
])

/**
 * Bereken Shannon entropy van een string
 * Hogere entropy = meer random/onvoorspelbaar
 */
function calculateEntropy(str: string): number {
  const len = str.length
  if (len === 0) return 0

  const freq: Record<string, number> = {}
  for (const char of str.toLowerCase()) {
    freq[char] = (freq[char] || 0) + 1
  }

  let entropy = 0
  for (const count of Object.values(freq)) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }

  return entropy
}

/**
 * Bereken de ratio medeklinkers vs klinkers
 */
function calculateConsonantRatio(str: string): number {
  const vowels = str.toLowerCase().match(/[aeiouäëïöüáéíóúàèìòù]/g)?.length || 0
  const consonants = str.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0

  if (vowels === 0) return consonants > 0 ? 10 : 0
  return consonants / vowels
}

/**
 * Check voor keyboard patterns
 */
function hasKeyboardPattern(str: string): boolean {
  const lower = str.toLowerCase().replace(/[^a-z0-9]/g, '')
  return KEYBOARD_PATTERNS.some(pattern => lower.includes(pattern))
}

/**
 * Check voor repetitieve karakters
 */
function hasRepetitiveCharacters(str: string): boolean {
  // 3+ dezelfde karakters op rij
  return /(.)\1{2,}/i.test(str)
}

/**
 * Check of naam een bekend spam patroon matcht
 */
function matchesSpamPattern(str: string): boolean {
  const normalized = str.replace(/\s+/g, '').toLowerCase()
  return SPAM_NAME_PATTERNS.some(pattern => pattern.test(normalized))
}

/**
 * Check of naam een bekende voornaam bevat
 */
function containsCommonName(str: string): boolean {
  const words = str.toLowerCase().split(/[\s'-]+/)
  return words.some(word => COMMON_FIRST_NAMES.has(word))
}

/**
 * Check of een naam "gibberish" is (onuitspreekbare letter combinaties)
 * Dit detecteert namen zoals "Abdulkairmgmoc", "Xvnwoeifnwef", etc.
 */
function isGibberish(str: string): { isGibberish: boolean; score: number; reasons: string[] } {
  const lower = str.toLowerCase().replace(/[^a-z]/g, '')
  if (lower.length < 6) return { isGibberish: false, score: 0, reasons: [] }

  const reasons: string[] = []
  let score = 0

  // Check voor ongebruikelijke lettercombinaties (trigrams)
  const uncommonTrigrams = [
    'mgm', 'gmoc', 'xvn', 'woe', 'nwef', 'ksd', 'jfh', 'skd', 'fhsk',
    'qwr', 'wrt', 'zxc', 'xcv', 'cvb', 'vbn', 'bnm', 'dfg', 'fgh', 'ghj',
    'hjk', 'jkl', 'sdf', 'asd', 'zaq', 'qaz', 'wsx', 'xsw', 'edc', 'cde',
    'rfv', 'vfr', 'tgb', 'bgt', 'yhn', 'nhy', 'ujm', 'mju', 'ijk', 'okm',
    'plm', 'qwer', 'wert', 'erty', 'asdf', 'sdfg', 'dfgh', 'zxcv', 'xcvb',
  ]

  let uncommonCount = 0
  for (let i = 0; i < lower.length - 2; i++) {
    const trigram = lower.substring(i, i + 3)
    if (uncommonTrigrams.some(ut => trigram.includes(ut) || ut.includes(trigram))) {
      uncommonCount++
    }
  }

  if (uncommonCount >= 2) {
    score += 25
    reasons.push('Naam bevat ongebruikelijke lettercombinaties')
  }

  // Check voor te veel medeklinkers op rij (3+ zonder klinker)
  const consonantStreaks = lower.match(/[bcdfghjklmnpqrstvwxyz]{4,}/g) || []
  if (consonantStreaks.length > 0) {
    score += 30
    reasons.push(`Naam bevat lange medeklinkerreeks: ${consonantStreaks[0]}`)
  }

  // Check voor willekeurige mix van hoofdletters in het midden
  const originalMiddle = str.slice(1, -1)
  const randomCaps = originalMiddle.match(/[a-z][A-Z][a-z]/g) || []
  if (randomCaps.length >= 2) {
    score += 20
    reasons.push('Naam heeft willekeurige hoofdletters')
  }

  // Check voor "echte naam" structuur: voornaam of voornaam + achternaam
  // Echte namen hebben meestal herkenbare patronen
  const hasVowelConsonantPattern = /^[bcdfghjklmnpqrstvwxyz]?[aeiou][bcdfghjklmnpqrstvwxyz]+[aeiou]/i.test(lower)
  const looksLikeName = hasVowelConsonantPattern || COMMON_FIRST_NAMES.has(lower.slice(0, 4)) ||
    COMMON_FIRST_NAMES.has(lower.slice(0, 5)) || COMMON_FIRST_NAMES.has(lower.slice(0, 6))

  // Als het niet op een naam lijkt en lang is, verhoog score
  if (!looksLikeName && lower.length > 8) {
    score += 20
    reasons.push('Naam heeft geen herkenbare naamstructuur')
  }

  // Check voor rare letter frequenties (te veel van dezelfde letter)
  const letterCounts: Record<string, number> = {}
  for (const char of lower) {
    letterCounts[char] = (letterCounts[char] || 0) + 1
  }
  const maxCount = Math.max(...Object.values(letterCounts))
  const maxRatio = maxCount / lower.length
  if (maxRatio > 0.3 && lower.length > 6) {
    score += 15
    reasons.push('Naam heeft ongebruikelijke letterverdeling')
  }

  return {
    isGibberish: score >= 40,
    score,
    reasons,
  }
}

/**
 * Analyseer een naam op verdachte eigenschappen
 */
export function analyzeName(name: string): NameAnalysisResult {
  const trimmed = name.trim()
  const normalized = trimmed.replace(/\s+/g, '').toLowerCase()
  const reasons: string[] = []
  let suspicionScore = 0

  // Basis validatie
  const isTooShort = trimmed.length < 2
  const isTooLong = trimmed.length > 50
  const hasNumbersInName = /\d/.test(trimmed)
  const isAllCaps = trimmed === trimmed.toUpperCase() && trimmed.length > 3

  // Bereken metrics
  const entropy = calculateEntropy(normalized)
  const consonantRatio = calculateConsonantRatio(normalized)
  const hasKeyboard = hasKeyboardPattern(normalized)
  const hasRepetition = hasRepetitiveCharacters(normalized)

  // Score berekening
  if (isTooShort) {
    suspicionScore += 30
    reasons.push('Naam is te kort')
  }

  if (isTooLong) {
    suspicionScore += 20
    reasons.push('Naam is ongewoon lang')
  }

  if (hasNumbersInName) {
    suspicionScore += 40
    reasons.push('Naam bevat cijfers')
  }

  if (isAllCaps) {
    suspicionScore += 15
    reasons.push('Naam is volledig in hoofdletters')
  }

  // Entropy analyse
  // Normale namen hebben entropy tussen 2.5 en 4.0
  // Bot-gegenereerde namen hebben vaak hogere entropy (meer random)
  // Of juist lagere (bv "aaaaaaa")
  if (entropy > 4.2) {
    suspicionScore += 25
    reasons.push('Naam lijkt willekeurig gegenereerd (hoge entropy)')
  } else if (entropy < 1.5 && normalized.length > 4) {
    suspicionScore += 20
    reasons.push('Naam heeft onnatuurlijk patroon (lage entropy)')
  }

  // Consonant ratio
  // Normale namen: ratio tussen 1.0 en 3.0
  if (consonantRatio > 4.0) {
    suspicionScore += 30
    reasons.push('Naam heeft onnatuurlijke medeklinker/klinker verhouding')
  } else if (consonantRatio < 0.3 && normalized.length > 3) {
    suspicionScore += 15
    reasons.push('Naam heeft weinig medeklinkers')
  }

  if (hasKeyboard) {
    suspicionScore += 35
    reasons.push('Naam bevat keyboard patroon')
  }

  if (hasRepetition) {
    suspicionScore += 25
    reasons.push('Naam bevat herhalende karakters')
  }

  if (matchesSpamPattern(trimmed)) {
    suspicionScore += 45
    reasons.push('Naam matcht bekend spam patroon')
  }

  // Gibberish detectie (onuitspreekbare namen zoals "Abdulkairmgmoc")
  const gibberishResult = isGibberish(trimmed)
  if (gibberishResult.isGibberish) {
    suspicionScore += gibberishResult.score
    reasons.push(...gibberishResult.reasons)
  }

  // Bonus voor bekende namen (verlaag score)
  if (containsCommonName(trimmed)) {
    suspicionScore = Math.max(0, suspicionScore - 30)
    if (suspicionScore > 0) {
      reasons.push('Naam bevat bekende voornaam (score verlaagd)')
    }
  }

  // Check specifiek voor lange namen zonder spaties
  if (normalized.length > 10 && !trimmed.includes(' ') && !trimmed.includes('-')) {
    // Geen spaties en lang = verdacht tenzij het een bekende naam is
    if (!containsCommonName(trimmed)) {
      suspicionScore += 25  // Verhoogd van 20 naar 25
      reasons.push('Lange naam zonder spaties')
    }
  }

  // Cap at 100
  suspicionScore = Math.min(100, suspicionScore)

  const isValid = !isTooShort && !isTooLong && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)
  const isSuspicious = suspicionScore >= 50

  return {
    isValid,
    isSuspicious,
    suspicionScore,
    reasons,
    details: {
      entropy,
      consonantRatio,
      hasKeyboardPattern: hasKeyboard,
      hasRepetition,
      hasNumbersInName,
      isAllCaps,
      isTooShort,
      isTooLong,
    }
  }
}

/**
 * Quick check - geeft alleen true/false terug
 */
export function isNameSuspicious(name: string, threshold: number = 50): boolean {
  const result = analyzeName(name)
  return result.suspicionScore >= threshold
}

// Named export voor backwards compatibility
export const NameAnalyzer = {
  analyze: analyzeName,
  isSuspicious: isNameSuspicious,
  calculateEntropy,
}
