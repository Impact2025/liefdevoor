/**
 * Disposable Email Checker
 *
 * Controleert of een email adres:
 * - Een wegwerp domein gebruikt
 * - Een verdacht patroon heeft
 * - Van een risicovol domein komt
 */

import {
  DISPOSABLE_EMAIL_DOMAINS,
  SUSPICIOUS_EMAIL_PATTERNS,
  SUSPICIOUS_DOMAINS,
  isDisposableEmail,
  hasSuspiciousEmailPattern,
  isSuspiciousDomain,
} from './disposable-domains'

export interface EmailCheckResult {
  isValid: boolean
  isDisposable: boolean
  isSuspicious: boolean
  suspicionScore: number
  reasons: string[]
  domain: string
  localPart: string
}

/**
 * Volledig email adres analyseren
 */
export function analyzeEmail(email: string): EmailCheckResult {
  const normalized = email.toLowerCase().trim()
  const [localPart, domain] = normalized.split('@')

  if (!localPart || !domain) {
    return {
      isValid: false,
      isDisposable: false,
      isSuspicious: true,
      suspicionScore: 100,
      reasons: ['Ongeldig email formaat'],
      domain: domain || '',
      localPart: localPart || '',
    }
  }

  const reasons: string[] = []
  let suspicionScore = 0

  // Check disposable domain
  const disposable = isDisposableEmail(normalized)
  if (disposable) {
    suspicionScore += 100
    reasons.push(`Wegwerp email domein gedetecteerd: ${domain}`)
  }

  // Check suspicious patterns
  const suspiciousPattern = hasSuspiciousEmailPattern(normalized)
  if (suspiciousPattern) {
    suspicionScore += 40
    reasons.push('Email heeft verdacht patroon (mogelijk bot-gegenereerd)')
  }

  // Check suspicious domain
  const suspiciousDomain = isSuspiciousDomain(normalized)
  if (suspiciousDomain) {
    suspicionScore += 20
    reasons.push(`Email van risicovol domein: ${domain}`)
  }

  // Extra checks

  // Check voor + alias (gmail trick)
  if (localPart.includes('+')) {
    suspicionScore += 10
    reasons.push('Email bevat + alias (kan legitiem zijn)')
  }

  // Check voor extreem kort local part
  if (localPart.length <= 2) {
    suspicionScore += 15
    reasons.push('Zeer kort email adres')
  }

  // Check voor alleen cijfers
  if (/^\d+$/.test(localPart)) {
    suspicionScore += 25
    reasons.push('Email local part bevat alleen cijfers')
  }

  // Check voor random karakter string
  if (/^[a-z]{1,3}\d{5,}$/.test(localPart)) {
    suspicionScore += 35
    reasons.push('Email lijkt automatisch gegenereerd')
  }

  // Check voor keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '1234']
  if (keyboardPatterns.some(p => localPart.includes(p))) {
    suspicionScore += 20
    reasons.push('Email bevat keyboard patroon')
  }

  // Check voor te lange email
  if (normalized.length > 100) {
    suspicionScore += 15
    reasons.push('Ongewoon lang email adres')
  }

  // Check voor subdomain abuse (bv mail.provider.disposable.com)
  if (domain.split('.').length > 3) {
    suspicionScore += 10
    reasons.push('Email domein heeft veel subdomeinen')
  }

  // Cap at 100
  suspicionScore = Math.min(100, suspicionScore)

  return {
    isValid: !disposable && suspicionScore < 80,
    isDisposable: disposable,
    isSuspicious: suspicionScore >= 50,
    suspicionScore,
    reasons,
    domain,
    localPart,
  }
}

/**
 * Quick check - alleen disposable check
 */
export function isEmailDisposable(email: string): boolean {
  return isDisposableEmail(email)
}

/**
 * Quick check - email bruikbaar voor registratie?
 */
export function isEmailAllowedForRegistration(email: string): {
  allowed: boolean
  reason?: string
} {
  const result = analyzeEmail(email)

  if (result.isDisposable) {
    return {
      allowed: false,
      reason: 'Wegwerp email adressen zijn niet toegestaan',
    }
  }

  if (result.suspicionScore >= 80) {
    return {
      allowed: false,
      reason: 'Dit email adres kan niet worden gebruikt voor registratie',
    }
  }

  return { allowed: true }
}

// Named export
export const DisposableEmailChecker = {
  analyze: analyzeEmail,
  isDisposable: isEmailDisposable,
  isAllowed: isEmailAllowedForRegistration,
  domains: DISPOSABLE_EMAIL_DOMAINS,
  patterns: SUSPICIOUS_EMAIL_PATTERNS,
  suspiciousDomains: SUSPICIOUS_DOMAINS,
}
