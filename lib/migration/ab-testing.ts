/**
 * A/B Testing Framework for Migration Campaign
 * Tests subject line variants to optimize open rates
 */

import crypto from 'crypto'

export type SubjectVariant = 'A' | 'B' | 'C'
export type MigrationSegment = 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT' | 'INACTIVE'

export interface SubjectLineTest {
  segment: MigrationSegment
  variants: {
    A: string
    B: string
    C: string
  }
}

/**
 * Subject line A/B tests per segment
 * Variables: {{firstName}}, {{photoCount}}, {{matchCount}}
 */
export const subjectLineTests: Record<MigrationSegment, SubjectLineTest> = {
  VIP: {
    segment: 'VIP',
    variants: {
      A: '🎁 {{firstName}}, je 6 maanden gratis Premium wacht!',
      B: '{{firstName}}, we missen je - Speciale comeback aanbieding',
      C: 'Je OogvoorLiefde account + 6 maanden Premium → Claim nu!'
    }
  },
  GOLD: {
    segment: 'GOLD',
    variants: {
      A: '🎁 {{firstName}}, je 4 maanden Premium is klaar!',
      B: 'Laatste kans: {{firstName}}, claim je Gold voordeel',
      C: '{{photoCount}} foto\'s overgezet + 4 maanden Premium gratis'
    }
  },
  ACTIVE: {
    segment: 'ACTIVE',
    variants: {
      A: '{{firstName}}, je profiel staat klaar met 3 maanden Premium',
      B: '💕 {{matchCount}} potentiële matches wachten op je!',
      C: 'OogvoorLiefde wordt LiefdevoorIedereen - Welkom terug!'
    }
  },
  DORMANT: {
    segment: 'DORMANT',
    variants: {
      A: '{{firstName}}, we hebben je gemist - 2 maanden Premium cadeau!',
      B: 'Je oude profiel + nieuwe kansen = Perfect match',
      C: '🔥 Kom terug met een speciale comeback bonus'
    }
  },
  INACTIVE: {
    segment: 'INACTIVE',
    variants: {
      A: '{{firstName}}, je data van OogvoorLiefde staat klaar',
      B: 'Laatste kans om je profiel te redden + 1 maand Premium',
      C: 'We verwijderen je data binnenkort - claim nu je account'
    }
  }
}

/**
 * Get A/B test variant for a user (deterministic)
 * Same user always gets same variant for consistency
 */
export function getSubjectVariant(
  userId: string,
  segment: MigrationSegment
): SubjectVariant {
  // Hash user ID to get consistent variant assignment
  const hash = crypto.createHash('md5').update(userId).digest('hex')
  const num = parseInt(hash.substring(0, 8), 16)
  const variants: SubjectVariant[] = ['A', 'B', 'C']
  return variants[num % 3]
}

/**
 * Render subject line template with data
 */
export function renderSubject(
  template: string,
  data: {
    firstName: string
    photoCount?: number
    matchCount?: number
  }
): string {
  return template
    .replace(/\{\{firstName\}\}/g, data.firstName)
    .replace(/\{\{photoCount\}\}/g, String(data.photoCount || 0))
    .replace(/\{\{matchCount\}\}/g, String(data.matchCount || 0))
}

/**
 * Get subject line for user with A/B testing
 */
export function getSubjectLine(
  userId: string,
  segment: MigrationSegment,
  data: {
    firstName: string
    photoCount?: number
    matchCount?: number
  }
): { subject: string; variant: SubjectVariant } {
  const variant = getSubjectVariant(userId, segment)
  const template = subjectLineTests[segment].variants[variant]
  const subject = renderSubject(template, data)

  return { subject, variant }
}
