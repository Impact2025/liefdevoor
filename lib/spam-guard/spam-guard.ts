/**
 * SpamGuard - Centrale Spam Preventie Module
 *
 * Combineert alle spam detectie methoden in een unified interface.
 * Geeft een overall spam score en beslissing.
 */

import { DisposableEmailChecker, type EmailCheckResult } from './disposable-emails'
import { NameAnalyzer, analyzeName, type NameAnalysisResult } from './name-analyzer'
import { IPReputationTracker, getIPReputation, shouldBlockIP, type IPReputation } from './ip-reputation'
import { FormTimingAnalyzer, validateFormTiming, REGISTRATION_FORM_CONFIG, type TimingAnalysis } from './form-timing'
import { auditLog, getClientInfo } from '../audit'
import type { NextRequest } from 'next/server'

export interface SpamCheckOptions {
  email: string
  name: string
  ip: string
  timingToken?: string
  honeypotValue?: string // Als ingevuld = bot
  request?: NextRequest
}

export interface SpamCheckResult {
  isSpam: boolean
  isHighRisk: boolean
  shouldBlock: boolean
  overallScore: number // 0-100
  reasons: string[]
  details: {
    email: EmailCheckResult
    name: NameAnalysisResult
    ip: IPReputation | null
    timing: TimingAnalysis | null
    honeypotTriggered: boolean
  }
  recommendation: 'allow' | 'review' | 'block'
}

/**
 * Voer een complete spam check uit
 */
export async function checkForSpam(options: SpamCheckOptions): Promise<SpamCheckResult> {
  const { email, name, ip, timingToken, honeypotValue, request } = options
  const reasons: string[] = []
  let overallScore = 0

  // 1. Honeypot check (als ingevuld = definitief bot)
  const honeypotTriggered = !!honeypotValue && honeypotValue.length > 0
  if (honeypotTriggered) {
    // Log de bot poging
    if (request) {
      auditLog('SPAM_BLOCKED', {
        userId: undefined,
        details: `Honeypot triggered: ${honeypotValue}`,
        clientInfo: getClientInfo(request),
        success: false,
      })
    }

    return {
      isSpam: true,
      isHighRisk: true,
      shouldBlock: true,
      overallScore: 100,
      reasons: ['Honeypot veld ingevuld (bot gedetecteerd)'],
      details: {
        email: { isValid: false, isDisposable: false, isSuspicious: true, suspicionScore: 0, reasons: [], domain: '', localPart: '' },
        name: { isValid: false, isSuspicious: true, suspicionScore: 0, reasons: [], details: {} as any },
        ip: null,
        timing: null,
        honeypotTriggered: true,
      },
      recommendation: 'block',
    }
  }

  // 2. Email check
  const emailResult = DisposableEmailChecker.analyze(email)
  if (emailResult.isDisposable) {
    overallScore += 50
    reasons.push(...emailResult.reasons)
  } else if (emailResult.isSuspicious) {
    // Verhoogde gewichten voor verdachte emails
    overallScore += emailResult.suspicionScore * 0.5
    reasons.push(...emailResult.reasons)
  }

  // 3. Name check
  const nameResult = analyzeName(name)
  if (nameResult.isSuspicious) {
    // Verhoogde gewichten voor verdachte namen
    overallScore += nameResult.suspicionScore * 0.5
    reasons.push(...nameResult.reasons)
  } else if (nameResult.suspicionScore > 30) {
    // Ook matig verdachte namen meenemen
    overallScore += nameResult.suspicionScore * 0.3
    reasons.push(...nameResult.reasons)
  }

  // 4. Combinatie bonus: verdachte naam + verdachte email = extra verdacht
  if (nameResult.suspicionScore >= 40 && emailResult.suspicionScore >= 40) {
    overallScore += 20
    reasons.push('Combinatie van verdachte naam en email')
  }

  // 4. IP reputation check
  const ipResult = await getIPReputation(ip)
  const ipBlockCheck = await shouldBlockIP(ip)
  if (ipBlockCheck.blocked) {
    overallScore += 40
    reasons.push(ipBlockCheck.reason || 'IP geblokkeerd')
  } else if (ipResult && ipResult.score > 30) {
    overallScore += ipResult.score * 0.2
    reasons.push(`IP heeft verhoogde risicoscore (${ipResult.score})`)
  }

  // 5. Form timing check
  let timingResult: TimingAnalysis | null = null
  if (timingToken) {
    timingResult = await validateFormTiming(timingToken, REGISTRATION_FORM_CONFIG)
    if (timingResult.isBot) {
      overallScore += 50
      reasons.push(...timingResult.reasons)
    } else if (timingResult.isSuspicious) {
      overallScore += timingResult.suspicionScore * 0.3
      reasons.push(...timingResult.reasons)
    }
  }

  // Cap at 100
  overallScore = Math.min(100, Math.round(overallScore))

  // Bepaal aanbeveling
  let recommendation: 'allow' | 'review' | 'block'
  if (overallScore >= 70 || emailResult.isDisposable || honeypotTriggered || ipBlockCheck.blocked) {
    recommendation = 'block'
  } else if (overallScore >= 40) {
    recommendation = 'review'
  } else {
    recommendation = 'allow'
  }

  const result: SpamCheckResult = {
    isSpam: overallScore >= 70,
    isHighRisk: overallScore >= 50,
    shouldBlock: recommendation === 'block',
    overallScore,
    reasons,
    details: {
      email: emailResult,
      name: nameResult,
      ip: ipResult,
      timing: timingResult,
      honeypotTriggered,
    },
    recommendation,
  }

  // Log high-risk attempts
  if (result.isHighRisk && request) {
    auditLog('SPAM_DETECTED', {
      userId: undefined,
      details: JSON.stringify({
        score: overallScore,
        email: email.substring(0, 3) + '***',
        reasons: reasons.slice(0, 5),
        recommendation,
      }),
      clientInfo: getClientInfo(request),
      success: false,
    })
  }

  return result
}

/**
 * Quick spam check (alleen email + naam)
 */
export function quickSpamCheck(email: string, name: string): {
  isSpam: boolean
  score: number
  reasons: string[]
} {
  const emailResult = DisposableEmailChecker.analyze(email)
  const nameResult = analyzeName(name)

  let score = 0
  const reasons: string[] = []

  if (emailResult.isDisposable) {
    score += 60
    reasons.push('Wegwerp email')
  }

  if (emailResult.isSuspicious) {
    score += emailResult.suspicionScore * 0.3
  }

  if (nameResult.isSuspicious) {
    score += nameResult.suspicionScore * 0.4
    reasons.push(...nameResult.reasons.slice(0, 2))
  }

  score = Math.min(100, Math.round(score))

  return {
    isSpam: score >= 60,
    score,
    reasons,
  }
}

/**
 * Check alleen email
 */
export function checkEmail(email: string): EmailCheckResult {
  return DisposableEmailChecker.analyze(email)
}

/**
 * Check alleen naam
 */
export function checkName(name: string): NameAnalysisResult {
  return analyzeName(name)
}

// Main export
export const SpamGuard = {
  check: checkForSpam,
  quickCheck: quickSpamCheck,
  checkEmail,
  checkName,
  email: DisposableEmailChecker,
  name: NameAnalyzer,
  ip: IPReputationTracker,
  timing: FormTimingAnalyzer,
}

export default SpamGuard
