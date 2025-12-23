/**
 * Profile Nudge Email Template
 *
 * Encourages users to complete their profile
 * Optimized for LVB audience: friendly, encouraging, simple language
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

interface ProfileNudgeEmailProps {
  userName: string
  profileScore: number // 0-100
  missingFields?: string[] // What they still need to add
}

export default function ProfileNudgeEmail({
  userName = 'daar',
  profileScore = 40,
  missingFields = ['foto', 'interesses', 'over jezelf']
}: ProfileNudgeEmailProps) {
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
              Je profiel is bijna klaar, {userName}!
            </Heading>

            <Text style={styles.text}>
              Een compleet profiel krijgt <strong>5x meer matches</strong>.
              Help anderen jou beter te leren kennen.
            </Text>

            {/* Progress Bar */}
            <Section style={styles.progressSection}>
              <Text style={styles.progressLabel}>
                Jouw profiel is nu {profileScore}% compleet
              </Text>
              <div style={styles.progressBarContainer}>
                <div style={{
                  ...styles.progressBarFill,
                  width: `${profileScore}%`
                }}></div>
              </div>
            </Section>

            {/* Missing Fields */}
            {missingFields.length > 0 && (
              <Section style={styles.checklistBox}>
                <Text style={styles.checklistTitle}>
                  Nog toe te voegen:
                </Text>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  {missingFields.map((field, index) => (
                    <tr key={index}>
                      <td style={styles.checklistItem}>
                        <span style={styles.checkIcon}>☐</span> {field}
                      </td>
                    </tr>
                  ))}
                </table>
              </Section>
            )}

            {/* Encouragement */}
            <Section style={styles.encouragementBox}>
              <Text style={styles.encouragementText}>
                Mensen die hun profiel afmaken, vinden <strong>sneller een match</strong>.
                Het duurt maar een paar minuten!
              </Text>
            </Section>

            {/* CTA Button - High contrast, large */}
            <Section style={styles.ctaSection}>
              <Button
                href={`${BRAND.website}/profile/edit`}
                style={styles.button}
              >
                Maak mijn profiel af
              </Button>
            </Section>

            {/* Tips Section */}
            <Section style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>
                Tips voor een goed profiel:
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.tipItem}>
                    📸 Voeg een duidelijke foto toe waar je gezicht goed te zien is
                  </td>
                </tr>
                <tr>
                  <td style={styles.tipItem}>
                    ✍️ Schrijf iets over jezelf - wat vind je leuk?
                  </td>
                </tr>
                <tr>
                  <td style={styles.tipItem}>
                    ❤️ Vertel wat je zoekt in een relatie
                  </td>
                </tr>
              </table>
            </Section>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              Lukt het niet? Geen probleem! Stuur een mail naar{' '}
              <a href={`mailto:${BRAND.email}`} style={styles.helperLink}>
                {BRAND.email}
              </a>
              {' '}en we helpen je graag.
            </Text>
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
              Je ontvangt deze hulp omdat je profiel nog niet compleet is.
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
  text: {
    fontSize: '18px', // 18px+ for LVB
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  progressSection: {
    margin: '0 0 32px'
  },
  progressLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND.textColor,
    textAlign: 'center' as const,
    margin: '0 0 16px'
  },
  progressBarContainer: {
    width: '100%',
    height: '32px', // Thick for visibility
    backgroundColor: BRAND.bgColor,
    borderRadius: '16px',
    overflow: 'hidden' as const,
    border: `2px solid ${BRAND.borderColor}`
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BRAND.primaryColor,
    transition: 'width 0.3s ease',
    borderRadius: '14px'
  },
  checklistBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  checklistTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  checklistItem: {
    fontSize: '16px',
    color: '#92400e',
    padding: '8px 0',
    lineHeight: '1.5'
  },
  checkIcon: {
    fontSize: '20px',
    marginRight: '8px',
    color: BRAND.primaryColor
  },
  encouragementBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '20px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  encouragementText: {
    fontSize: '16px',
    color: BRAND.textColor,
    margin: '0',
    lineHeight: '1.6'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0 0 32px'
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
  tipsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  tipsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  tipItem: {
    fontSize: '16px',
    color: BRAND.textColor,
    padding: '8px 0',
    lineHeight: '1.6'
  },
  helperText: {
    fontSize: '16px',
    color: BRAND.textMuted,
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.6'
  },
  helperLink: {
    color: BRAND.primaryColor,
    textDecoration: 'underline'
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
