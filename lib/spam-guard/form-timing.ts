/**
 * Form Timing Analyzer
 *
 * Detecteert bot gedrag op basis van hoe snel een formulier wordt ingevuld.
 * Mensen hebben een bepaalde minimum tijd nodig om:
 * - Het formulier te lezen
 * - Gegevens in te voeren
 * - Velden te valideren
 *
 * Bots vullen formulieren vaak in < 3 seconden in.
 */

import { getUpstash } from '../upstash'

export interface TimingAnalysis {
  isBot: boolean
  isSuspicious: boolean
  suspicionScore: number
  reasons: string[]
  timingMs: number
  expectedMinMs: number
}

export interface FormTimingConfig {
  // Minimum verwachte tijd per veld type (in ms)
  fieldTimings: {
    email: number
    password: number
    text: number
    select: number
    checkbox: number
  }
  // Minimum totale tijd (in ms)
  minimumTotalMs: number
  // Tijd onder welke het zeker een bot is (in ms)
  botThresholdMs: number
}

const DEFAULT_CONFIG: FormTimingConfig = {
  fieldTimings: {
    email: 2000,     // 2 seconden voor email typen
    password: 3000,  // 3 seconden voor wachtwoord
    text: 1500,      // 1.5 seconden voor tekstveld
    select: 500,     // 0.5 seconden voor dropdown
    checkbox: 300,   // 0.3 seconden voor checkbox
  },
  minimumTotalMs: 5000,  // Minimaal 5 seconden voor heel formulier
  botThresholdMs: 2000,  // < 2 seconden = zeker bot
}

// Registratie formulier specifieke config
export const REGISTRATION_FORM_CONFIG: FormTimingConfig = {
  fieldTimings: {
    email: 3000,     // Email typen + checken
    password: 4000,  // Wachtwoord bedenken + typen
    text: 2000,      // Naam typen
    select: 1000,    // Geslacht selecteren
    checkbox: 500,   // Terms accepteren
  },
  minimumTotalMs: 8000,   // Minimaal 8 seconden voor registratie
  botThresholdMs: 3000,   // < 3 seconden = zeker bot
}

const TIMING_PREFIX = 'spam:timing:'
const TIMING_TTL = 600 // 10 minuten

/**
 * Genereer een timing token voor een formulier sessie
 */
export async function generateTimingToken(): Promise<string> {
  const token = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const redis = getUpstash()

  if (redis) {
    try {
      await redis.setex(
        `${TIMING_PREFIX}${token}`,
        TIMING_TTL,
        Date.now().toString()
      )
    } catch (error) {
      console.error('[FormTiming] Error saving token:', error)
    }
  }

  return token
}

/**
 * Valideer form timing en bereken bot score
 */
export async function validateFormTiming(
  token: string,
  config: FormTimingConfig = DEFAULT_CONFIG
): Promise<TimingAnalysis> {
  const redis = getUpstash()
  let startTime: number | null = null
  const now = Date.now()

  // Haal start tijd op uit Redis
  if (redis) {
    try {
      const stored = await redis.get(`${TIMING_PREFIX}${token}`)
      if (stored) {
        startTime = parseInt(stored.toString(), 10)
        // Verwijder token (eenmalig gebruik)
        await redis.del(`${TIMING_PREFIX}${token}`)
      }
    } catch (error) {
      console.error('[FormTiming] Error getting token:', error)
    }
  }

  // Als geen token gevonden, gebruik fallback
  // Dit kan gebeuren als Redis niet beschikbaar is
  if (!startTime) {
    // Parse token voor fallback timing
    const [timestamp] = token.split('_')
    startTime = parseInt(timestamp, 10) || now - 10000 // Default 10 sec
  }

  const timingMs = now - startTime
  const expectedMinMs = config.minimumTotalMs
  const reasons: string[] = []
  let suspicionScore = 0

  // Check voor absolute bot threshold
  if (timingMs < config.botThresholdMs) {
    return {
      isBot: true,
      isSuspicious: true,
      suspicionScore: 100,
      reasons: [`Formulier ingevuld in ${timingMs}ms (< ${config.botThresholdMs}ms minimum)`],
      timingMs,
      expectedMinMs,
    }
  }

  // Check voor verdacht snelle invulling
  if (timingMs < config.minimumTotalMs) {
    const ratio = timingMs / config.minimumTotalMs
    suspicionScore = Math.round((1 - ratio) * 80)
    reasons.push(`Formulier ingevuld in ${(timingMs/1000).toFixed(1)}s (verwacht: ${(expectedMinMs/1000).toFixed(1)}s+)`)
  }

  // Check voor onmenselijk snelle invulling
  if (timingMs < 1000) {
    suspicionScore = 100
    reasons.push('Formulier ingevuld in minder dan 1 seconde')
  }

  // Negatieve timing (token manipulation)
  if (timingMs < 0) {
    return {
      isBot: true,
      isSuspicious: true,
      suspicionScore: 100,
      reasons: ['Ongeldige timing token (mogelijke manipulatie)'],
      timingMs: 0,
      expectedMinMs,
    }
  }

  // Te lange tijd is ook verdacht (token hergebruik poging)
  if (timingMs > TIMING_TTL * 1000) {
    suspicionScore += 20
    reasons.push('Formulier sessie verlopen')
  }

  const isBot = suspicionScore >= 90
  const isSuspicious = suspicionScore >= 50

  return {
    isBot,
    isSuspicious,
    suspicionScore,
    reasons,
    timingMs,
    expectedMinMs,
  }
}

/**
 * Simpele check zonder Redis (client-side timing)
 */
export function analyzeClientTiming(
  startTimestamp: number,
  config: FormTimingConfig = DEFAULT_CONFIG
): TimingAnalysis {
  const now = Date.now()
  const timingMs = now - startTimestamp
  const expectedMinMs = config.minimumTotalMs
  const reasons: string[] = []
  let suspicionScore = 0

  if (timingMs < config.botThresholdMs) {
    return {
      isBot: true,
      isSuspicious: true,
      suspicionScore: 100,
      reasons: [`Formulier ingevuld in ${timingMs}ms`],
      timingMs,
      expectedMinMs,
    }
  }

  if (timingMs < config.minimumTotalMs) {
    const ratio = timingMs / config.minimumTotalMs
    suspicionScore = Math.round((1 - ratio) * 80)
    reasons.push(`Snelle invulling: ${(timingMs/1000).toFixed(1)}s`)
  }

  return {
    isBot: suspicionScore >= 90,
    isSuspicious: suspicionScore >= 50,
    suspicionScore,
    reasons,
    timingMs,
    expectedMinMs,
  }
}

// Named export
export const FormTimingAnalyzer = {
  generateToken: generateTimingToken,
  validate: validateFormTiming,
  analyzeClient: analyzeClientTiming,
  REGISTRATION_CONFIG: REGISTRATION_FORM_CONFIG,
}
