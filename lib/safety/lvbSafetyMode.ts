/**
 * LVBSafetyMode - Extra veiligheidsbescherming voor LVB gebruikers
 *
 * Features:
 * - Cooldown tussen berichten (voorkom impulsiviteit)
 * - Waarschuwing bij snel achter elkaar berichten sturen
 * - Extra gevoelige data detectie
 * - Logging naar SafetyFlag model
 */

import { prisma } from '@/lib/prisma'
import { detectSensitiveData, shouldWarnLVBUser, type DetectionResult } from './sensitiveDataDetector'

// Default cooldown in seconds (configurable per user)
const DEFAULT_COOLDOWN_SECONDS = 30

// Rapid messaging threshold (3 messages in 5 minutes triggers warning)
const RAPID_MESSAGE_THRESHOLD = 3
const RAPID_MESSAGE_WINDOW_MINUTES = 5

export interface LVBSafetyCheckResult {
  allowed: boolean
  requiresConfirmation: boolean
  warningType?: 'cooldown' | 'rapid_messaging' | 'sensitive_data' | 'scam_pattern'
  warningMessage?: string
  cooldownRemaining?: number // seconds
  detectionResult?: DetectionResult
}

export interface LVBUserSafetySettings {
  lvbMode: boolean
  messageCooldownSeconds: number
  dailyMessageLimit: number | null
  lastMessageSentAt: Date | null
  guardianEnabled: boolean
  guardianEmail: string | null
}

/**
 * Get LVB safety settings for a user
 */
export async function getLVBSafetySettings(userId: string): Promise<LVBUserSafetySettings | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lvbMode: true,
      messageCooldownSeconds: true,
      dailyMessageLimit: true,
      lastMessageSentAt: true,
      guardianEnabled: true,
      guardianEmail: true,
    },
  })

  return user
}

/**
 * Check if user is in LVB mode
 */
export async function isLVBUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lvbMode: true },
  })
  return user?.lvbMode ?? false
}

/**
 * Check cooldown for LVB user
 * Returns remaining seconds if still in cooldown, 0 if allowed
 */
export async function checkCooldown(userId: string): Promise<number> {
  const settings = await getLVBSafetySettings(userId)

  if (!settings?.lvbMode || settings.messageCooldownSeconds === 0) {
    return 0
  }

  if (!settings.lastMessageSentAt) {
    return 0
  }

  const cooldownMs = settings.messageCooldownSeconds * 1000
  const timeSinceLastMessage = Date.now() - settings.lastMessageSentAt.getTime()
  const remainingMs = cooldownMs - timeSinceLastMessage

  if (remainingMs <= 0) {
    return 0
  }

  return Math.ceil(remainingMs / 1000)
}

/**
 * Check if user is sending messages too rapidly
 */
export async function checkRapidMessaging(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RAPID_MESSAGE_WINDOW_MINUTES * 60 * 1000)

  const recentMessages = await prisma.message.count({
    where: {
      senderId: userId,
      createdAt: { gte: windowStart },
    },
  })

  return recentMessages >= RAPID_MESSAGE_THRESHOLD
}

/**
 * Check daily message limit for LVB user
 */
export async function checkDailyLimit(userId: string): Promise<{ exceeded: boolean; remaining: number }> {
  const settings = await getLVBSafetySettings(userId)

  if (!settings?.lvbMode || !settings.dailyMessageLimit) {
    return { exceeded: false, remaining: Infinity }
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayMessages = await prisma.message.count({
    where: {
      senderId: userId,
      createdAt: { gte: todayStart },
    },
  })

  const remaining = Math.max(0, settings.dailyMessageLimit - todayMessages)
  return { exceeded: remaining === 0, remaining }
}

/**
 * Main LVB safety check for sending a message
 * Returns whether the message is allowed and any warnings
 */
export async function checkLVBMessageSafety(
  userId: string,
  content: string
): Promise<LVBSafetyCheckResult> {
  const settings = await getLVBSafetySettings(userId)

  // Not an LVB user - skip special checks
  if (!settings?.lvbMode) {
    return { allowed: true, requiresConfirmation: false }
  }

  // Check cooldown
  const cooldownRemaining = await checkCooldown(userId)
  if (cooldownRemaining > 0) {
    return {
      allowed: false,
      requiresConfirmation: false,
      warningType: 'cooldown',
      warningMessage: `Wacht nog ${cooldownRemaining} seconden voordat je een nieuw bericht stuurt.`,
      cooldownRemaining,
    }
  }

  // Check daily limit
  const { exceeded: dailyLimitExceeded, remaining } = await checkDailyLimit(userId)
  if (dailyLimitExceeded) {
    return {
      allowed: false,
      requiresConfirmation: false,
      warningType: 'rapid_messaging',
      warningMessage: 'Je hebt vandaag al veel berichten gestuurd. Probeer morgen opnieuw.',
    }
  }

  // Check for sensitive data
  if (content) {
    const lvbWarning = shouldWarnLVBUser(content)

    if (lvbWarning.shouldWarn) {
      const detectionResult = detectSensitiveData(content)

      // Log the safety flag
      await logSafetyFlag(userId, content, detectionResult)

      return {
        allowed: true, // Allow but require confirmation
        requiresConfirmation: true,
        warningType: 'sensitive_data',
        warningMessage: getWarningMessage(lvbWarning.warningType),
        detectionResult,
      }
    }
  }

  // Check rapid messaging (warning only, doesn't block)
  const isRapidMessaging = await checkRapidMessaging(userId)
  if (isRapidMessaging) {
    return {
      allowed: true,
      requiresConfirmation: true,
      warningType: 'rapid_messaging',
      warningMessage: 'Je stuurt veel berichten achter elkaar. Weet je zeker dat je dit wilt versturen?',
    }
  }

  return { allowed: true, requiresConfirmation: false }
}

/**
 * Update last message timestamp for cooldown tracking
 */
export async function updateLastMessageSent(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastMessageSentAt: new Date() },
  })
}

/**
 * Log a safety flag for Guardian notification
 */
async function logSafetyFlag(
  userId: string,
  content: string,
  detectionResult: DetectionResult
): Promise<void> {
  const settings = await getLVBSafetySettings(userId)

  // Log to SafetyFlag (existing model)
  await prisma.safetyFlag.create({
    data: {
      userId,
      triggerType: 'lvb_safety_mode',
      triggerId: null,
      category: detectionResult.detections[0]?.type || 'unknown',
      severity: mapRiskToSeverity(detectionResult.highestRisk),
      status: 'pending',
      details: {
        source: 'lvb_safety_mode',
        detections: detectionResult.detections.map(d => ({
          type: d.type,
          risk: d.risk,
        })),
        userConfirmed: false,
      },
    },
  })

  // If guardian is enabled, create alert
  if (settings?.guardianEnabled && settings.guardianEmail) {
    await prisma.guardianAlert.create({
      data: {
        userId,
        type: 'SAFETY_FLAG',
        content: {
          type: 'sensitive_content_detected',
          category: detectionResult.suggestedWarningType,
          severity: detectionResult.highestRisk,
          // Never include actual content - privacy first!
          timestamp: new Date().toISOString(),
        },
      },
    })
  }
}

/**
 * Map risk level to severity for SafetyFlag model (0.0-1.0)
 */
function mapRiskToSeverity(risk: string): number {
  switch (risk) {
    case 'critical':
      return 0.9
    case 'high':
      return 0.7
    case 'medium':
      return 0.5
    default:
      return 0.3
  }
}

/**
 * Get user-friendly warning message based on type
 */
function getWarningMessage(warningType: string): string {
  switch (warningType) {
    case 'phone':
      return 'Je wilt een telefoonnummer delen. Weet je zeker dat dit veilig is? Vraag eventueel hulp aan je begeleider.'
    case 'iban':
      return 'Je wilt een bankrekening delen. Dit kan gevaarlijk zijn! Deel nooit je IBAN met mensen die je niet goed kent.'
    case 'money':
      return 'Je praat over geld of betalen. Wees voorzichtig! Vraag eerst hulp aan iemand die je vertrouwt.'
    case 'scam':
      return 'Dit bericht bevat iets wat kan wijzen op oplichting. Wees extra voorzichtig!'
    case 'personal':
      return 'Je wilt persoonlijke informatie delen. Denk goed na of je dit wilt.'
    default:
      return 'Let op! Dit bericht bevat gevoelige informatie. Weet je zeker dat je dit wilt versturen?'
  }
}

export default checkLVBMessageSafety
