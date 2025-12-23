/**
 * Daily Digest Email Template
 *
 * Shows profile visits and likes with blurred preview
 * Optimized for LVB audience: large fonts, high contrast, simple language
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

interface DailyDigestEmailProps {
  userName: string
  newVisitsCount: number
  newLikesCount: number
  featuredVisitor?: {
    name: string
    age: number
    photo: string // We'll apply blur effect
    city: string
  }
}

export default function DailyDigestEmail({
  userName = 'daar',
  newVisitsCount = 3,
  newLikesCount = 2,
  featuredVisitor
}: DailyDigestEmailProps) {
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
            <Heading style={styles.h1}>
              Goed nieuws, {userName}!
            </Heading>

            {/* Activity Summary - Large, clear numbers */}
            <Section style={styles.statsBox}>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.statCell}>
                    <Text style={styles.statNumber}>{newVisitsCount}</Text>
                    <Text style={styles.statLabel}>
                      {newVisitsCount === 1 ? 'nieuw bezoek' : 'nieuwe bezoekers'}
                    </Text>
                  </td>
                  <td style={styles.statDivider}></td>
                  <td style={styles.statCell}>
                    <Text style={styles.statNumber}>{newLikesCount}</Text>
                    <Text style={styles.statLabel}>
                      {newLikesCount === 1 ? 'nieuwe like' : 'nieuwe likes'}
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Text style={styles.text}>
              Er is vandaag veel interesse in jouw profiel.
            </Text>

            {/* Featured Visitor with Blurred Photo */}
            {featuredVisitor && (
              <Section style={styles.matchCard}>
                <Text style={styles.matchTitle}>
                  Wie keek naar je?
                </Text>
                <div style={styles.blurredImageWrapper}>
                  <Img
                    src={featuredVisitor.photo}
                    width="120"
                    height="120"
                    style={styles.blurredPhoto}
                    alt="Bezoeker"
                  />
                  <div style={styles.blurOverlay}>
                    <Text style={styles.blurText}>?</Text>
                  </div>
                </div>
                <Text style={styles.matchHint}>
                  {featuredVisitor.name}, {featuredVisitor.age} jaar
                  <br />
                  uit {featuredVisitor.city}
                </Text>
              </Section>
            )}

            <Text style={styles.encouragement}>
              Klik op de knop om te zien wie het is!
            </Text>

            {/* CTA Button - High contrast, large */}
            <Section style={styles.ctaSection}>
              <Button
                href={`${BRAND.website}/dashboard/visitors`}
                style={styles.button}
              >
                Kijk wie het is
              </Button>
            </Section>

            {/* Secondary CTA */}
            <Section style={styles.secondaryCta}>
              <Text style={styles.secondaryText}>
                Of ga direct naar je matches:
              </Text>
              <Button
                href={`${BRAND.website}/discover`}
                style={styles.secondaryButton}
              >
                Bekijk matches
              </Button>
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
              Je ontvangt deze mail omdat je actief bent op {BRAND.name}.
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
  h1: {
    color: BRAND.textColor,
    fontSize: '28px', // Larger for LVB
    fontWeight: '600',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  statsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  statCell: {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const
  },
  statDivider: {
    width: '1px',
    backgroundColor: BRAND.borderColor,
    padding: '0 12px'
  },
  statNumber: {
    fontSize: '48px', // Very large for easy reading
    fontWeight: '700',
    color: BRAND.primaryColor,
    margin: '0 0 8px',
    lineHeight: '1',
    display: 'block'
  },
  statLabel: {
    fontSize: '18px', // Large, readable
    color: BRAND.textMuted,
    margin: '0',
    fontWeight: '500'
  },
  text: {
    fontSize: '18px', // 18px+ for LVB
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  matchCard: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  matchTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 20px'
  },
  blurredImageWrapper: {
    position: 'relative' as const,
    display: 'inline-block',
    margin: '0 0 16px'
  },
  blurredPhoto: {
    borderRadius: '60px',
    display: 'block',
    border: '4px solid #ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    filter: 'blur(12px)', // Heavy blur for curiosity
    opacity: 0.7
  },
  blurOverlay: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60px',
    height: '60px',
    backgroundColor: BRAND.primaryColor,
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  blurText: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0'
  },
  matchHint: {
    fontSize: '16px',
    color: BRAND.textMuted,
    margin: '0',
    lineHeight: '1.5'
  },
  encouragement: {
    fontSize: '18px',
    color: BRAND.textColor,
    textAlign: 'center' as const,
    margin: '0 0 24px',
    fontWeight: '500'
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
    margin: '0'
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
