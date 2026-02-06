/**
 * Migration Welcome Email Template
 *
 * Day 0: First invitation to claim account
 * Personalized with user data from OogvoorLiefde
 * Extended version with trust-building content
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
  Hr,
  Link
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
  couponCode?: string
  couponExpiresAt?: Date
  memberSince: Date
  photoCount?: number
  messageCount?: number
  incentive?: {
    premiumMonths: number
    superMessages: number
  }
}

export default function MigrationWelcomeEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  couponCode = 'OOGVOOR2026',
  couponExpiresAt,
  memberSince = new Date(),
  photoCount = 0,
  messageCount = 0,
  incentive = { premiumMonths: 2, superMessages: 10 }
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
                Geweldig nieuws!
              </Text>
            </div>

            <Heading style={styles.h1}>
              Beste {userName},
            </Heading>

            <Text style={styles.heroText}>
              OogvoorLiefde wordt <strong>Liefde Voor Iedereen</strong>!
            </Text>
          </Section>

          {/* Introduction */}
          <Section style={styles.textSection}>
            <Text style={styles.paragraph}>
              Je ontvangt deze e-mail omdat je een gewaardeerd lid bent van OogvoorLiefde.
              We hebben fantastisch nieuws: OogvoorLiefde gaat verder als <strong>Liefde Voor Iedereen</strong> -
              een compleet vernieuwde dating ervaring met dezelfde betrouwbaarheid die je gewend bent.
            </Text>
          </Section>

          {/* What's Changing Section */}
          <Section style={styles.textSection}>
            <Heading as="h2" style={styles.h2}>
              Wat verandert er?
            </Heading>
            <Text style={styles.paragraph}>
              <strong>Nieuw platform, vertrouwde service:</strong> We hebben ons platform van de grond af
              opnieuw opgebouwd met moderne technologie voor een betere, snellere en veiligere ervaring.
            </Text>
            <Text style={styles.paragraph}>
              <strong>Jouw gegevens zijn veilig:</strong> Als trouw lid sinds {memberYear} hebben we al
              je profielgegevens, foto's en voorkeuren zorgvuldig overgezet naar het nieuwe platform.
              Je hoeft alleen nog je account te activeren.
            </Text>
          </Section>

          {/* Data Preserved Box */}
          <Section style={styles.preservedBox}>
            <Text style={styles.preservedTitle}>
              Je data is bewaard:
            </Text>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={styles.preservedItem}>
                  {photoCount} foto's
                </td>
                <td style={styles.preservedItem}>
                  {messageCount} berichten
                </td>
                <td style={styles.preservedItem}>
                  Lid sinds {memberYear}
                </td>
              </tr>
            </table>
          </Section>

          {/* What's New Section */}
          <Section style={styles.textSection}>
            <Heading as="h2" style={styles.h2}>
              Wat is er nieuw?
            </Heading>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.featureTable}>
              <tr>
                <td style={styles.featureRow}>
                  <Text style={styles.featureItem}>
                    <strong>Slimmere matching:</strong> Onze verbeterde algoritmes helpen je betere matches te vinden
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={styles.featureRow}>
                  <Text style={styles.featureItem}>
                    <strong>Moderne interface:</strong> Een frisse, gebruiksvriendelijke look
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={styles.featureRow}>
                  <Text style={styles.featureItem}>
                    <strong>Betere beveiliging:</strong> Extra bescherming voor jouw privacy
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={styles.featureRow}>
                  <Text style={styles.featureItem}>
                    <strong>Snellere app:</strong> Geen wachttijden meer
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Coupon Box */}
          <Section style={styles.couponBox}>
            <Text style={styles.couponLabel}>
              Jouw welkomstcode:
            </Text>
            <Text style={styles.couponCode}>
              OOGVOOR2026
            </Text>
            <Text style={styles.couponValue}>
              {incentive.premiumMonths} maanden GRATIS Premium
            </Text>
            <Text style={styles.couponExtra}>
              + {incentive.superMessages} SuperBerichten cadeau
            </Text>
            <Text style={styles.couponNote}>
              (Voer deze code in bij het activeren van je account)
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={styles.ctaSection}>
            <Button href={landingUrl} style={styles.button}>
              Activeer Mijn Account
            </Button>
            <Text style={styles.ctaSubtext}>
              Het activeren duurt minder dan 2 minuten
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Trust Section */}
          <Section style={styles.textSection}>
            <Heading as="h2" style={styles.h2}>
              Veiligheid en privacy
            </Heading>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={styles.trustItem}>
                  <Text style={styles.trustText}>Veilige overdracht van je gegevens</Text>
                </td>
              </tr>
              <tr>
                <td style={styles.trustItem}>
                  <Text style={styles.trustText}>Geen betaling nodig voor activatie</Text>
                </td>
              </tr>
              <tr>
                <td style={styles.trustItem}>
                  <Text style={styles.trustText}>Volledig AVG-compliant</Text>
                </td>
              </tr>
              <tr>
                <td style={styles.trustItem}>
                  <Text style={styles.trustText}>Je kunt altijd stoppen wanneer je wilt</Text>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={styles.divider} />

          {/* Feedback Section */}
          <Section style={styles.textSection}>
            <Heading as="h2" style={styles.h2}>
              We horen graag van je!
            </Heading>
            <Text style={styles.paragraph}>
              Heb je vragen over de overgang? Of wil je feedback geven over het nieuwe platform?
              We staan voor je klaar:
            </Text>
            <Text style={styles.contactInfo}>
              <strong>E-mail:</strong> info@liefdevooriedereen.nl
            </Text>
            <Text style={styles.contactInfo}>
              <strong>FAQ:</strong>{' '}
              <Link href="https://www.liefdevooriedereen.nl/support/faq" style={styles.link}>
                liefdevooriedereen.nl/support/faq
              </Link>
            </Text>
            <Text style={styles.contactInfo}>
              <strong>Over ons:</strong>{' '}
              <Link href="https://www.liefdevooriedereen.nl/over-ons" style={styles.link}>
                liefdevooriedereen.nl/over-ons
              </Link>
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Personal Signature */}
          <Section style={styles.signatureSection}>
            <Text style={styles.paragraph}>
              Met vriendelijke groet,
            </Text>
            <Text style={styles.signatureName}>
              Vincent
            </Text>
            <Text style={styles.signatureTitle}>
              Oprichter, Liefde Voor Iedereen
            </Text>
          </Section>

          {/* PS Notes */}
          <Section style={styles.psSection}>
            <Text style={styles.psText}>
              <strong>P.S.</strong> Bewaar deze e-mail! Je welkomstcode <strong>OOGVOOR2026</strong> is
              {' '}{expiryDate} geldig en geeft je {incentive.premiumMonths} maanden gratis Premium
              + {incentive.superMessages} SuperBerichten.
            </Text>
            <Text style={styles.psText}>
              <strong>P.P.S.</strong> Deel je ervaring! Als je tevreden bent over Liefde Voor Iedereen,
              vertel het aan je vrienden. Samen maken we de datingwereld een stukje mooier.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Social Media */}
          <Section style={styles.socialSection}>
            <Text style={styles.socialTitle}>Volg ons:</Text>
            <Text style={styles.socialLinks}>
              <Link href="https://facebook.com/liefdevooriedereen" style={styles.socialLink}>Facebook</Link>
              {' | '}
              <Link href="https://instagram.com/liefdevooriedereen" style={styles.socialLink}>Instagram</Link>
              {' | '}
              <Link href="https://linkedin.com/company/liefdevooriedereen" style={styles.socialLink}>LinkedIn</Link>
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
            <Text style={styles.footerDisclaimer}>
              Je ontvangt deze mail omdat je een account had op OogvoorLiefde.nl
              <br />
              <Link href={`${BRAND.website}/migration/unsubscribe`} style={styles.unsubscribeLink}>
                Geen emails meer ontvangen
              </Link>
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
    padding: '40px 40px 24px',
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
    fontSize: '28px',
    fontWeight: '700' as const,
    margin: '0 0 16px',
    lineHeight: '1.2'
  },
  heroText: {
    fontSize: '20px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0',
    fontWeight: '600' as const
  },
  textSection: {
    padding: '0 40px 24px'
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: BRAND.textMuted,
    margin: '0 0 16px'
  },
  h2: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: BRAND.textColor,
    margin: '0 0 16px'
  },
  preservedBox: {
    backgroundColor: '#f0fdf4',
    margin: '0 40px 24px',
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
  featureTable: {
    marginBottom: '8px'
  },
  featureRow: {
    padding: '4px 0'
  },
  featureItem: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textMuted,
    margin: '0 0 8px',
    paddingLeft: '8px'
  },
  couponBox: {
    backgroundColor: '#fef3c7',
    margin: '0 40px 24px',
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
  couponNote: {
    fontSize: '13px',
    color: '#b45309',
    margin: '0',
    fontStyle: 'italic' as const
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
  ctaSubtext: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '12px 0 0'
  },
  divider: {
    borderColor: '#e5e7eb',
    borderWidth: '1px 0 0 0',
    margin: '0 40px 24px'
  },
  trustItem: {
    padding: '4px 0'
  },
  trustText: {
    fontSize: '15px',
    color: BRAND.textMuted,
    margin: '0',
    paddingLeft: '8px'
  },
  contactInfo: {
    fontSize: '15px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  link: {
    color: BRAND.primaryColor,
    textDecoration: 'underline'
  },
  signatureSection: {
    padding: '0 40px 24px'
  },
  signatureName: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: BRAND.textColor,
    margin: '8px 0 4px'
  },
  signatureTitle: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0'
  },
  psSection: {
    padding: '0 40px 24px',
    backgroundColor: '#f9fafb',
    margin: '0 0 0'
  },
  psText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: BRAND.textMuted,
    margin: '0 0 12px',
    padding: '16px 0 0'
  },
  socialSection: {
    textAlign: 'center' as const,
    padding: '24px 40px'
  },
  socialTitle: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  socialLinks: {
    fontSize: '14px',
    margin: '0'
  },
  socialLink: {
    color: BRAND.primaryColor,
    textDecoration: 'none'
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
