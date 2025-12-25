/**
 * Cloudflare Turnstile Server-Side Verification
 *
 * Handelt token verificatie met Cloudflare API en voorkomt replay attacks
 * via Redis-based token caching.
 */

import { getRedis } from './redis'
import type { TurnstileServerVerificationResponse } from './types/turnstile'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TOKEN_CACHE_PREFIX = 'turnstile:token:'
const TOKEN_CACHE_TTL = 300 // 5 minuten

/**
 * Verify Turnstile token met Cloudflare API
 *
 * @param token - Token van client-side Turnstile widget
 * @param remoteIp - Optioneel client IP voor extra verificatie
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // Always bypass in development mode
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Turnstile] Bypassing verification in development mode')
    return { success: true }
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error('[Turnstile] TURNSTILE_SECRET_KEY niet geconfigureerd')
    return { success: false, error: 'Turnstile niet geconfigureerd' }
  }

  // Check voor replay attacks - is deze token al gebruikt?
  const redis = getRedis()
  if (redis) {
    const cacheKey = `${TOKEN_CACHE_PREFIX}${token}`
    try {
      const cached = await redis.get(cacheKey)

      if (cached) {
        console.warn('[Turnstile] Token replay attack gedetecteerd:', token.substring(0, 10) + '...')
        return { success: false, error: 'Token al gebruikt' }
      }
    } catch (error) {
      console.error('[Turnstile] Redis check error:', error)
      // Continue zonder replay protection als Redis faalt
    }
  }

  // Verify token met Cloudflare
  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (remoteIp) {
      formData.append('remoteip', remoteIp)
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const result: TurnstileServerVerificationResponse = await response.json()

    if (!result.success) {
      console.error('[Turnstile] Verificatie mislukt:', result['error-codes'])
      return {
        success: false,
        error: getTurnstileErrorMessage(result['error-codes'])
      }
    }

    // Cache succesvolle token om replay te voorkomen
    if (redis) {
      const cacheKey = `${TOKEN_CACHE_PREFIX}${token}`
      try {
        await redis.setex(cacheKey, TOKEN_CACHE_TTL, '1')
      } catch (error) {
        console.error('[Turnstile] Redis cache error:', error)
        // Niet fatal - verificatie was succesvol
      }
    }

    console.log('[Turnstile] Verificatie succesvol')
    return { success: true }
  } catch (error) {
    console.error('[Turnstile] Verificatie error:', error)
    return { success: false, error: 'Verificatie mislukt' }
  }
}

/**
 * Get user-friendly error message van Turnstile error codes
 */
function getTurnstileErrorMessage(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return 'Verificatie mislukt'
  }

  const code = errorCodes[0]
  const messages: Record<string, string> = {
    'missing-input-secret': 'Configuratiefout',
    'invalid-input-secret': 'Configuratiefout',
    'missing-input-response': 'Verificatie token ontbreekt',
    'invalid-input-response': 'Ongeldige verificatie',
    'bad-request': 'Ongeldig verzoek',
    'timeout-or-duplicate': 'Verificatie verlopen of al gebruikt',
    'internal-error': 'Verificatie service niet beschikbaar',
  }

  return messages[code] || 'Verificatie mislukt'
}

/**
 * Valideer dat Turnstile correct is geconfigureerd
 */
export function isTurnstileConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.TURNSTILE_SECRET_KEY
  )
}

/**
 * Check of we Turnstile moeten enforced (production only by default)
 */
export function shouldEnforceTurnstile(): boolean {
  // Altijd enforce in production
  if (process.env.NODE_ENV === 'production') {
    return true
  }

  // In development, alleen enforce als expliciet geconfigureerd
  return isTurnstileConfigured()
}
