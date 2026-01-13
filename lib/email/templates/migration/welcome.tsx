/**
 * Migration Welcome Email Template
 *
 * Day 0: First invitation to claim account
 * Personalized with user data from OogvoorLiefde
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
  Section,
  Hr
} from '@react-email/components'

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#e11d48', // Rose-600
  secondaryColor: '#9333ea', // Purple for accents
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#fff1f2', // Rose-50
  website: 'https://liefdevooriedereen.nl'
}

interface MigrationWelcomeEmailProps {
  userName: string
  landingUrl: string
  couponCode: string
  couponExpiresAt?: Date
  memberSince: Date
  photoCount?: number
  messageCount?: number
  incentive: {
    premiumMonths: number
    superMessages: number
  }
}

export default function MigrationWelcomeEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  couponCode = 'WELKOM-NAAM-VIP',
  couponExpiresAt,
  memberSince = new Date(),
  photoCount = 0,
  messageCount = 0,
  incentive = { premiumMonths: 3, superMessages: 10 }
}: MigrationWelcomeEmailProps) {
  const memberYear = memberSince.getFullYear()
  const expiryDate = couponExpiresAt
    ? new Date(couponExpiresAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long'
      })
    : '30 dagen'

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="200"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={styles.hero}>
            <div style={styles.badge}>
              <Text style={styles.badgeText}>
                🎉 Je profiel staat klaar!
              </Text>
            </div>

            <Heading style={styles.h1}>
              Welkom terug, {userName}!
            </Heading>

            <Text style={styles.heroText}>
              OogvoorLiefde wordt <strong>LiefdevoorIedereen</strong> -
              een compleet vernieuwde dating ervaring.
              Als trouw lid sinds {memberYear} staat je profiel al klaar.
            </Text>
          </Section>

          {/* Data Preserved Box */}
          <Section style={styles.preservedBox}>
            <Text style={styles.preservedTitle}>
              ✅ Je data is bewaard:
            </Text>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={styles.preservedItem}>
                  📸 {photoCount} foto's
                </td>
                <td style={styles.preservedItem}>
                  💬 {messageCount} berichten
                </td>
                <td style={styles.preservedItem}>
                  📅 Lid sinds {memberYear}
                </td>
              </tr>
            </table>
          </Section>

          {/* Coupon Box */}
          <Section style={styles.couponBox}>
            <Text style={styles.couponLabel}>
              Jouw persoonlijke welkomstcode:
            </Text>
            <Text style={styles.couponCode}>
              {couponCode}
            </Text>
            <Text style={styles.couponValue}>
              {incentive.premiumMonths} maanden GRATIS Premium
            </Text>
            <Text style={styles.couponExtra}>
              + {incentive.superMessages} SuperBerichten
            </Text>
            <Text style={styles.couponExpiry}>
              Geldig tot {expiryDate}
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={styles.ctaSection}>
            <Button href={landingUrl} style={styles.button}>
              Activeer Mijn Account
            </Button>
          </Section>

          {/* Trust Indicators */}
          <Section style={styles.trustSection}>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={styles.trustItem}>
                  🔒 Veilige overdracht
                </td>
                <td style={styles.trustItem}>
                  ✅ Geen betaling nodig
                </td>
                <td style={styles.trustItem}>
                  🛡️ AVG-compliant
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={styles.divider} />

          {/* What's New Preview */}
          <Section style={styles.whatsNewSection}>
            <Heading as="h2" style={styles.h2}>
              Wat is er nieuw?
            </Heading>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={styles.featureCell}>
                  <Text style={styles.featureIcon}>🧠</Text>
                  <Text style={styles.featureTitle}>AI Matching</Text>
                  <Text style={styles.featureDesc}>Slimmere matches</Text>
                </td>
                <td style={styles.featureCell}>
                  <Text style={styles.featureIcon}>🎤</Text>
                  <Text style={styles.featureTitle}>Voice Berichten</Text>
                  <Text style={styles.featureDesc}>Persoonlijker contact</Text>
                </td>
                <td style={styles.featureCell}>
                  <Text style={styles.featureIcon}>🛡️</Text>
                  <Text style={styles.featureTitle}>Verificatie</Text>
                  <Text style={styles.featureDesc}>Alleen echte mensen</Text>
                </td>
              </tr>
            </table>
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
            <Text style={styles.footerDisclaimer}>
              Je ontvangt deze mail omdat je een account had op OogvoorLiefde.nl
              <br />
              <a href={`${BRAND.website}/migration/unsubscribe`} style={styles.unsubscribeLink}>
                Geen emails meer ontvangen
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
    borderRadius: '16px',
    maxWidth: '600px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden' as const
  },
  header: {
    backgroundColor: BRAND.bgColor,
    padding: '32px 40px 24px',
    textAlign: 'center' as const
  },
  logo: {
    display: 'block',
    margin: '0 auto'
  },
  hero: {
    padding: '40px 40px 32px',
    textAlign: 'center' as const
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#dcfce7',
    borderRadius: '24px',
    padding: '8px 20px',
    marginBottom: '24px'
  },
  badgeText: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#166534',
    margin: '0'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '32px',
    fontWeight: '700' as const,
    margin: '0 0 16px',
    lineHeight: '1.2'
  },
  heroText: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: BRAND.textMuted,
    margin: '0'
  },
  preservedBox: {
    backgroundColor: '#f0fdf4',
    margin: '0 40px 32px',
    borderRadius: '12px',
    padding: '20px 24px'
  },
  preservedTitle: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#166534',
    margin: '0 0 12px',
    textAlign: 'center' as const
  },
  preservedItem: {
    fontSize: '15px',
    color: '#166534',
    textAlign: 'center' as const,
    padding: '4px 8px'
  },
  couponBox: {
    backgroundColor: '#fef3c7',
    margin: '0 40px 32px',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    border: '2px dashed #f59e0b'
  },
  couponLabel: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  couponCode: {
    fontSize: '28px',
    fontWeight: '800' as const,
    fontFamily: 'monospace',
    color: '#92400e',
    margin: '0 0 12px',
    letterSpacing: '2px'
  },
  couponValue: {
    fontSize: '20px',
    fontWeight: '700' as const,
    color: '#b45309',
    margin: '0 0 4px'
  },
  couponExtra: {
    fontSize: '16px',
    color: '#92400e',
    margin: '0 0 12px'
  },
  couponExpiry: {
    fontSize: '13px',
    color: '#b45309',
    margin: '0'
  },
  ctaSection: {
    textAlign: 'center' as const,
    padding: '0 40px 32px'
  },
  button: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 48px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  trustSection: {
    padding: '0 40px 32px'
  },
  trustItem: {
    fontSize: '13px',
    color: BRAND.textMuted,
    textAlign: 'center' as const,
    padding: '4px'
  },
  divider: {
    borderColor: '#e5e7eb',
    borderWidth: '1px 0 0 0',
    margin: '0 40px'
  },
  whatsNewSection: {
    padding: '32px 40px'
  },
  h2: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: BRAND.textColor,
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  featureCell: {
    textAlign: 'center' as const,
    padding: '0 8px',
    verticalAlign: 'top' as const
  },
  featureIcon: {
    fontSize: '32px',
    margin: '0 0 8px'
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: BRAND.textColor,
    margin: '0 0 4px'
  },
  featureDesc: {
    fontSize: '12px',
    color: BRAND.textMuted,
    margin: '0'
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '32px 40px',
    textAlign: 'center' as const
  },
  footerLogo: {
    display: 'block',
    margin: '0 auto 16px'
  },
  footerText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 16px'
  },
  footerDisclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: '1.6'
  },
  unsubscribeLink: {
    color: BRAND.textMuted,
    textDecoration: 'underline'
  }
}
