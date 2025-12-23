/**
 * Safety Sentinel
 *
 * AI-powered content moderation to protect users from:
 * - Scams (money requests, cryptocurrency, investment schemes)
 * - Harassment and aggressive language
 * - Spam and commercial messages
 * - Underage/inappropriate content
 *
 * Returns a safety score and flags for moderation.
 */

import { prisma } from '@/lib/prisma';

export interface SafetyAnalysis {
  isBlocked: boolean;
  score: number; // 0.0 = safe, 1.0 = definitely dangerous
  category: 'safe' | 'scam' | 'harassment' | 'spam' | 'inappropriate';
  flags: string[];
  requiresLivenessRecheck: boolean;
  details?: string;
}

// Scam patterns (Dutch and English)
const SCAM_PATTERNS = [
  // Money/payment
  /\b(bitcoin|crypto|ethereum|btc|eth|usdt|wallet)\b/i,
  /\b(tikkie|betaal|overmaken|geld|money|euro|dollars?)\b.*\b(sturen|send|transfer)\b/i,
  /\b(investeer|invest|trading|winst|profit|rendement)\b/i,
  /\b(whatsapp|telegram|signal)\b.*\b(nummer|number)\b/i,
  /\b(www\.|http|\.com|\.nl)\b/i, // External links
  /\b(bank|rekening|iban|account)\b.*\b(nummer|number|details)\b/i,

  // Romance scam indicators
  /\b(erfenis|inheritance|weduwe|widow|leger|army|military)\b/i,
  /\b(vast.*?zitten|stuck|stranded|help.*?nodig)\b/i,
  /\b(gift\s*card|cadeaukaart|voucher)\b/i,
];

// Harassment patterns
const HARASSMENT_PATTERNS = [
  // Aggressive language
  /\b(fuck|kut|hoer|slet|teef|bitch|whore|slut)\b/i,
  /\b(kill|dood|vermoord|sterf|die)\b/i,
  /\b(stalk|volg|follow|weet.*?woon)\b/i,

  // Threats
  /\b(bedreig|threaten|hurt|pijn.*?doen)\b/i,

  // Pressure tactics
  /\b(moet|must|nu|now)\b.*\b(seks|sex|date|ontmoet)\b/i,
  /\b(waarom\s+reageer|why.*?(respond|reply|answer))\b/i,
];

// Spam patterns
const SPAM_PATTERNS = [
  /\b(gratis|free)\b.*\b(geld|money|prize|prijs)\b/i,
  /\b(klik|click)\b.*\b(link|hier|here)\b/i,
  /\b(abonneer|subscribe|follow)\b/i,
  /(.)\1{5,}/, // Repeated characters
  /[!?]{3,}/, // Excessive punctuation
];

// Inappropriate patterns
const INAPPROPRIATE_PATTERNS = [
  /\b(\d{1,2})\s*jaar\b.*\b(oud|old)\b/i, // Age mentions (check if under 18)
  /\b(kind|child|minor|minderjarig|tiener|teen)\b/i,
];

/**
 * Analyze message content for safety concerns
 */
export async function analyzeMessageSafety(
  content: string,
  senderId: string
): Promise<SafetyAnalysis> {
  const result: SafetyAnalysis = {
    isBlocked: false,
    score: 0,
    category: 'safe',
    flags: [],
    requiresLivenessRecheck: false,
  };

  if (!content || content.trim().length === 0) {
    return result;
  }

  const normalizedContent = content.toLowerCase().trim();

  // Check scam patterns
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(normalizedContent)) {
      result.flags.push(`scam_pattern: ${pattern.toString()}`);
      result.score += 0.3;
    }
  }

  // Check harassment patterns
  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(normalizedContent)) {
      result.flags.push(`harassment_pattern: ${pattern.toString()}`);
      result.score += 0.4;
    }
  }

  // Check spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(normalizedContent)) {
      result.flags.push(`spam_pattern: ${pattern.toString()}`);
      result.score += 0.2;
    }
  }

  // Check inappropriate patterns
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(normalizedContent)) {
      result.flags.push(`inappropriate_pattern: ${pattern.toString()}`);
      result.score += 0.5;
    }
  }

  // Normalize score to 0-1
  result.score = Math.min(1, result.score);

  // Determine category based on highest scoring flags
  if (result.flags.some(f => f.includes('harassment'))) {
    result.category = 'harassment';
  } else if (result.flags.some(f => f.includes('scam'))) {
    result.category = 'scam';
  } else if (result.flags.some(f => f.includes('spam'))) {
    result.category = 'spam';
  } else if (result.flags.some(f => f.includes('inappropriate'))) {
    result.category = 'inappropriate';
  }

  // Decision thresholds
  if (result.score >= 0.7) {
    // High severity - block and require liveness recheck
    result.isBlocked = true;
    result.requiresLivenessRecheck = true;
    result.details = 'Bericht geblokkeerd wegens mogelijke veiligheidsrisico\'s';

    // Log safety flag
    await createSafetyFlag(senderId, 'message_nlp', result);
  } else if (result.score >= 0.4) {
    // Medium severity - allow but flag for review
    result.requiresLivenessRecheck = true;

    // Log safety flag with lower severity
    await createSafetyFlag(senderId, 'message_nlp', result, false);
  }

  return result;
}

/**
 * Create a safety flag in the database for moderation review
 */
async function createSafetyFlag(
  userId: string,
  triggerType: string,
  analysis: SafetyAnalysis,
  urgent: boolean = true
): Promise<void> {
  try {
    await prisma.safetyFlag.create({
      data: {
        userId,
        triggerType,
        severity: analysis.score,
        category: analysis.category,
        details: {
          flags: analysis.flags,
          isBlocked: analysis.isBlocked,
        },
        status: urgent ? 'pending' : 'low_priority',
      },
    });

    // If blocking, also set requiresLivenessRecheck on user
    if (analysis.requiresLivenessRecheck) {
      await prisma.user.update({
        where: { id: userId },
        data: { requiresLivenessRecheck: true },
      });
    }
  } catch (error) {
    console.error('[SafetySentinel] Error creating safety flag:', error);
  }
}

/**
 * Check if a user has too many safety flags (should be banned)
 */
export async function checkUserSafetyStatus(userId: string): Promise<{
  shouldBlock: boolean;
  flagCount: number;
  severity: 'low' | 'medium' | 'high';
}> {
  try {
    // Get recent safety flags
    const recentFlags = await prisma.safetyFlag.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
        status: { not: 'dismissed' },
      },
    });

    const flagCount = recentFlags.length;
    const avgSeverity =
      recentFlags.reduce((sum, f) => sum + f.severity, 0) / (flagCount || 1);

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (avgSeverity >= 0.7 || flagCount >= 5) {
      severity = 'high';
    } else if (avgSeverity >= 0.4 || flagCount >= 3) {
      severity = 'medium';
    }

    return {
      shouldBlock: flagCount >= 5 || avgSeverity >= 0.8,
      flagCount,
      severity,
    };
  } catch (error) {
    console.error('[SafetySentinel] Error checking user safety:', error);
    return { shouldBlock: false, flagCount: 0, severity: 'low' };
  }
}

/**
 * Check message for common scam phone number patterns
 * Dutch phone numbers should not appear in early messages
 */
export function containsPhoneNumber(content: string): boolean {
  const phonePatterns = [
    /\b06[-\s]?\d{8}\b/, // Dutch mobile
    /\b\+31[-\s]?6[-\s]?\d{8}\b/, // Dutch mobile international
    /\b\+\d{1,3}[-\s]?\d{6,12}\b/, // International
    /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/, // Common format
  ];

  return phonePatterns.some(p => p.test(content));
}

/**
 * Calculate message frequency anomaly
 * Returns true if user is sending messages too frequently (spam behavior)
 */
export async function isSpammingMessages(
  userId: string,
  timeWindowMinutes: number = 5
): Promise<boolean> {
  try {
    const recentMessages = await prisma.message.count({
      where: {
        senderId: userId,
        createdAt: {
          gte: new Date(Date.now() - timeWindowMinutes * 60 * 1000),
        },
      },
    });

    // More than 20 messages in 5 minutes is suspicious
    return recentMessages > 20;
  } catch (error) {
    console.error('[SafetySentinel] Error checking spam rate:', error);
    return false;
  }
}
