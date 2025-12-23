/**
 * A/B Testing Framework for Email Campaigns
 *
 * World-class A/B testing with statistical significance
 * Tests subject lines, CTAs, content variants
 */

import { prisma } from '@/lib/prisma'

interface ABTestVariant {
  subjectLine: string
  template?: string
  cta?: string
  contentBlocks?: Record<string, string>
}

interface ABTestConfig {
  name: string
  emailType: string
  variantA: ABTestVariant
  variantB: ABTestVariant
  trafficSplit?: number // Percentage to variant B (default 50)
}

interface ABTestResult {
  winningVariant: 'A' | 'B' | null
  confidenceScore: number
  variantAStats: {
    sent: number
    opens: number
    clicks: number
    openRate: number
    clickRate: number
  }
  variantBStats: {
    sent: number
    opens: number
    clicks: number
    openRate: number
    clickRate: number
  }
}

/**
 * Create a new A/B test
 */
export async function createABTest(config: ABTestConfig): Promise<string> {
  const test = await prisma.emailABTest.create({
    data: {
      name: config.name,
      emailType: config.emailType,
      variantA: config.variantA as any,
      variantB: config.variantB as any,
      trafficSplitPercent: config.trafficSplit || 50,
      isActive: true,
    },
  })

  console.log(`[A/B Test] Created test: ${test.name} (${test.id})`)
  return test.id
}

/**
 * Get active A/B test for email type
 */
export async function getActiveABTest(
  emailType: string
): Promise<any | null> {
  const test = await prisma.emailABTest.findFirst({
    where: {
      emailType,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return test
}

/**
 * Assign user to A/B test variant
 * Uses consistent hashing to ensure same user gets same variant
 */
export function assignVariant(userId: string, trafficSplit: number = 50): 'A' | 'B' {
  // Simple hash function for consistent assignment
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  const normalized = Math.abs(hash) % 100

  return normalized < trafficSplit ? 'B' : 'A'
}

/**
 * Get variant content for user
 */
export async function getABTestVariant(
  emailType: string,
  userId: string
): Promise<{
  variant: 'A' | 'B'
  content: ABTestVariant
  testId: string | null
}> {
  const test = await getActiveABTest(emailType)

  if (!test) {
    return {
      variant: 'A',
      content: {} as ABTestVariant,
      testId: null,
    }
  }

  const variant = assignVariant(userId, test.trafficSplitPercent)
  const content = variant === 'A'
    ? (test.variantA as ABTestVariant)
    : (test.variantB as ABTestVariant)

  return {
    variant,
    content,
    testId: test.id,
  }
}

/**
 * Track email sent for A/B test
 */
export async function trackABTestSend(
  testId: string,
  variant: 'A' | 'B'
): Promise<void> {
  const field = variant === 'A' ? 'variantASent' : 'variantBSent'

  await prisma.emailABTest.update({
    where: { id: testId },
    data: {
      [field]: {
        increment: 1,
      },
    },
  })
}

/**
 * Track email open for A/B test
 */
export async function trackABTestOpen(
  testId: string,
  variant: 'A' | 'B'
): Promise<void> {
  const field = variant === 'A' ? 'variantAOpens' : 'variantBOpens'

  await prisma.emailABTest.update({
    where: { id: testId },
    data: {
      [field]: {
        increment: 1,
      },
    },
  })
}

/**
 * Track email click for A/B test
 */
export async function trackABTestClick(
  testId: string,
  variant: 'A' | 'B'
): Promise<void> {
  const field = variant === 'A' ? 'variantAClicks' : 'variantBClicks'

  await prisma.emailABTest.update({
    where: { id: testId },
    data: {
      [field]: {
        increment: 1,
      },
    },
  })
}

/**
 * Calculate statistical significance using Z-test
 * Returns confidence score (0-100)
 */
function calculateConfidence(
  countA: number,
  totalA: number,
  countB: number,
  totalB: number
): number {
  if (totalA < 30 || totalB < 30) {
    return 0 // Need minimum sample size
  }

  const p1 = countA / totalA
  const p2 = countB / totalB

  const pPooled = (countA + countB) / (totalA + totalB)
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / totalA + 1 / totalB))

  if (se === 0) return 0

  const z = Math.abs((p1 - p2) / se)

  // Convert z-score to confidence percentage
  // z > 1.96 = 95% confidence
  // z > 2.58 = 99% confidence
  if (z < 1.64) return 0 // < 90% confidence
  if (z < 1.96) return 90
  if (z < 2.33) return 95
  if (z < 2.58) return 98
  return 99
}

/**
 * Analyze A/B test results
 */
export async function analyzeABTest(testId: string): Promise<ABTestResult> {
  const test = await prisma.emailABTest.findUnique({
    where: { id: testId },
  })

  if (!test) {
    throw new Error('A/B test not found')
  }

  const variantAOpenRate = test.variantASent > 0
    ? test.variantAOpens / test.variantASent
    : 0
  const variantBOpenRate = test.variantBSent > 0
    ? test.variantBOpens / test.variantBSent
    : 0

  const variantAClickRate = test.variantASent > 0
    ? test.variantAClicks / test.variantASent
    : 0
  const variantBClickRate = test.variantBSent > 0
    ? test.variantBClicks / test.variantBSent
    : 0

  // Calculate confidence for open rate
  const confidence = calculateConfidence(
    test.variantAOpens,
    test.variantASent,
    test.variantBOpens,
    test.variantBSent
  )

  // Determine winner
  let winner: 'A' | 'B' | null = null
  if (confidence >= 95) {
    winner = variantAOpenRate > variantBOpenRate ? 'A' : 'B'
  }

  return {
    winningVariant: winner,
    confidenceScore: confidence,
    variantAStats: {
      sent: test.variantASent,
      opens: test.variantAOpens,
      clicks: test.variantAClicks,
      openRate: variantAOpenRate,
      clickRate: variantAClickRate,
    },
    variantBStats: {
      sent: test.variantBSent,
      opens: test.variantBOpens,
      clicks: test.variantBClicks,
      openRate: variantBOpenRate,
      clickRate: variantBClickRate,
    },
  }
}

/**
 * End A/B test and declare winner
 */
export async function endABTest(testId: string): Promise<ABTestResult> {
  const result = await analyzeABTest(testId)

  await prisma.emailABTest.update({
    where: { id: testId },
    data: {
      isActive: false,
      endedAt: new Date(),
      winningVariant: result.winningVariant,
      confidenceScore: result.confidenceScore,
    },
  })

  console.log(`[A/B Test] Ended test ${testId}`)
  console.log(`[A/B Test] Winner: ${result.winningVariant} (${result.confidenceScore}% confidence)`)

  return result
}

/**
 * Auto-end A/B tests that have reached statistical significance
 */
export async function autoEndABTests(): Promise<void> {
  const activeTests = await prisma.emailABTest.findMany({
    where: { isActive: true },
  })

  for (const test of activeTests) {
    // Minimum sample size check
    if (test.variantASent < 100 && test.variantBSent < 100) {
      continue
    }

    const result = await analyzeABTest(test.id)

    // Auto-end if 95%+ confidence
    if (result.confidenceScore >= 95) {
      await endABTest(test.id)
    }
  }
}
