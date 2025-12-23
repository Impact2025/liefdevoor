/**
 * Perfect Match Email Template
 *
 * Highlights a special match with shared interests
 * Optimized for LVB audience: warm, personal, highlights commonalities
 */

import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Img,
  Section
} from '@react-email/components'

// Brand configuration - Purple theme for retention emails
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#9333ea', // Purple for accessibility
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface PerfectMatchEmailProps {
  userName: string
  matchName: string
  matchAge: number
  matchPhoto: string
  matchCity: string
  sharedInterests: string[] // e.g., ['Wandelen', 'Lezen', 'Muziek']
  compatibilityScore?: number // 0-100
}

export default function PerfectMatchEmail({
  userName = 'daar',
  matchName = 'Bonnie',
  matchAge = 67,
  matchPhoto = 'https://via.placeholder.com/150',
  matchCity = 'Amsterdam',
  sharedInterests = ['Wandelen', 'Koffie drinken'],
  compatibilityScore = 85
}: PerfectMatchEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header with Logo */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="180"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            {/* Special Badge */}
            <Section style={styles.badgeSection}>
              <div style={styles.badge}>
                <Text style={styles.badgeText}>✨ Bijzondere match</Text>
              </div>
            </Section>

            <Heading style={styles.h1}>
              We vonden iemand speciaal voor jou, {userName}!
            </Heading>

            <Text style={styles.text}>
              We denken dat jullie goed bij elkaar passen.
              Jullie hebben veel gemeen!
            </Text>

            {/* Match Profile Card */}
            <Section style={styles.matchCard}>
              <Img
                src={matchPhoto}
                width="150"
                height="150"
                style={styles.matchPhoto}
                alt={matchName}
              />
              <Text style={styles.matchName}>
                {matchName}, {matchAge} jaar
              </Text>
              <Text style={styles.matchCity}>
                📍 {matchCity}
              </Text>

              {/* Compatibility Score */}
              {compatibilityScore && (
                <Section style={styles.scoreSection}>
                  <Text style={styles.scoreLabel}>Match percentage</Text>
                  <Text style={styles.scoreValue}>{compatibilityScore}%</Text>
                </Section>
              )}
            </Section>

            {/* Shared Interests */}
            <Section style={styles.interestsBox}>
              <Text style={styles.interestsTitle}>
                Wat jullie delen:
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                {sharedInterests.slice(0, 3).map((interest, index) => (
                  <tr key={index}>
                    <td style={styles.interestItem}>
                      <span style={styles.heartIcon}>❤️</span> Jullie houden allebei van <strong>{interest}</strong>
                    </td>
                  </tr>
                ))}
              </table>
            </Section>

            {/* Encouragement */}
            <Section style={styles.encouragementBox}>
              <Text style={styles.encouragementTitle}>
                Een perfecte kans!
              </Text>
              <Text style={styles.encouragementText}>
                {matchName} is nieuw op {BRAND.name}.
                Wees de eerste om contact te maken!
              </Text>
            </Section>

            {/* CTA Button - High contrast, large */}
            <Section style={styles.ctaSection}>
              <Button
                href={`${BRAND.website}/profile/${matchName.toLowerCase()}`}
                style={styles.button}
              >
                Bekijk profiel van {matchName}
              </Button>
            </Section>

            {/* Secondary CTA */}
            <Section style={styles.secondaryCta}>
              <Text style={styles.secondaryText}>
                Of ontdek meer matches:
              </Text>
              <Button
                href={`${BRAND.website}/discover`}
                style={styles.secondaryButton}
              >
                Meer matches bekijken
              </Button>
            </Section>

            {/* Tips for Starting Conversation */}
            <Section style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>
                💬 Hoe begin je het gesprek?
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.tipItem}>
                    Stel een vraag over jullie gedeelde interesse
                  </td>
                </tr>
                <tr>
                  <td style={styles.tipItem}>
                    Bijvoorbeeld: "Ik zie dat je ook van {sharedInterests[0]} houdt! Waar ga je het liefst heen?"
                  </td>
                </tr>
              </table>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Img
              src={BRAND.logoUrl}
              width="120"
              height="auto"
              alt={BRAND.name}
              style={styles.footerLogo}
            />
            <Text style={styles.footerText}>
              {BRAND.name}
            </Text>
            <Text style={styles.footerEmail}>
              <a href={`mailto:${BRAND.email}`} style={styles.footerLink}>
                {BRAND.email}
              </a>
            </Text>
            <Text style={styles.footerDisclaimer}>
              Je ontvangt deze mail omdat we een goede match voor je vonden.
              <br />
              <a href={`${BRAND.website}/settings/notifications`} style={styles.unsubscribeLink}>
                Email instellingen wijzigen
              </a>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '8px',
    maxWidth: '600px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden' as const
  },
  header: {
    padding: '32px 40px 24px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${BRAND.borderColor}`
  },
  logo: {
    display: 'block',
    margin: '0 auto'
  },
  content: {
    padding: '40px'
  },
  badgeSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#fef3c7',
    borderRadius: '20px',
    padding: '8px 20px'
  },
  badgeText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '28px', // Larger for LVB
    fontWeight: '600',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  text: {
    fontSize: '18px', // 18px+ for LVB
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 32px',
    textAlign: 'center' as const
  },
  matchCard: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center' as const,
    margin: '0 0 24px',
    border: `3px solid ${BRAND.primaryColor}` // Highlight
  },
  matchPhoto: {
    borderRadius: '75px',
    display: 'block',
    margin: '0 auto 16px',
    border: '5px solid #ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  matchName: {
    fontSize: '24px',
    fontWeight: '700',
    color: BRAND.textColor,
    margin: '0 0 8px'
  },
  matchCity: {
    fontSize: '18px',
    color: BRAND.textMuted,
    margin: '0 0 16px'
  },
  scoreSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    margin: '16px 0 0'
  },
  scoreLabel: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 4px',
    textTransform: 'uppercase' as const
  },
  scoreValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: BRAND.primaryColor,
    margin: '0'
  },
  interestsBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  interestsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#065f46',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  interestItem: {
    fontSize: '16px',
    color: '#065f46',
    padding: '8px 0',
    lineHeight: '1.6'
  },
  heartIcon: {
    fontSize: '20px',
    marginRight: '8px'
  },
  encouragementBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  encouragementTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 8px'
  },
  encouragementText: {
    fontSize: '16px',
    color: '#92400e',
    margin: '0',
    lineHeight: '1.6'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  button: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '18px', // Large, readable
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 40px', // Large padding for easy clicking
    borderRadius: '8px'
  },
  secondaryCta: {
    textAlign: 'center' as const,
    margin: '0 0 32px'
  },
  secondaryText: {
    fontSize: '16px',
    color: BRAND.textMuted,
    margin: '0 0 12px'
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    color: BRAND.primaryColor,
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
    borderRadius: '8px',
    border: `2px solid ${BRAND.primaryColor}`
  },
  tipsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '24px',
    margin: '0'
  },
  tipsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  tipItem: {
    fontSize: '15px',
    color: BRAND.textMuted,
    padding: '6px 0',
    lineHeight: '1.6'
  },
  footer: {
    backgroundColor: BRAND.bgColor,
    padding: '32px 40px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${BRAND.borderColor}`
  },
  footerLogo: {
    display: 'block',
    margin: '0 auto 16px'
  },
  footerText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  footerEmail: {
    fontSize: '14px',
    margin: '0 0 16px'
  },
  footerLink: {
    color: BRAND.primaryColor,
    textDecoration: 'none'
  },
  footerDisclaimer: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: '1.6'
  },
  unsubscribeLink: {
    color: BRAND.textMuted,
    textDecoration: 'underline'
  }
}
