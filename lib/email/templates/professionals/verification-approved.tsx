/**
 * Professional Verification Approved Email Template
 *
 * Sent when admin approves a professional account
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
  primaryColor: '#8b5cf6', // Violet-500
  secondaryColor: '#e11d48', // Rose
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#f5f3ff', // Violet-50
  website: 'https://liefdevooriedereen.nl'
}

interface VerificationApprovedEmailProps {
  organizationName: string
  contactName: string
  dashboardUrl: string
  tier: string
  features: string[]
}

export default function VerificationApprovedEmail({
  organizationName = 'Uw Organisatie',
  contactName = 'daar',
  dashboardUrl = 'https://liefdevooriedereen.nl/professionals/dashboard',
  tier = 'BASIC',
  features = [
    'Toegang tot 800+ artikelen over inclusief daten',
    'Interactieve tools voor uw cliënten',
    'Easy Read versies voor LVB-cliënten',
  ]
}: VerificationApprovedEmailProps) {
  const tierLabels: Record<string, string> = {
    BASIC: 'Basic (Gratis)',
    STANDARD: 'Standard (€29/maand)',
    PREMIUM: 'Premium (€99/maand)',
  }

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="180"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
          </Section>

          {/* Success Badge */}
          <Section style={styles.badgeSection}>
            <div style={styles.successBadge}>
              <Text style={styles.badgeIcon}>✓</Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Uw account is geverifieerd!
            </Heading>

            <Text style={styles.greeting}>
              Beste {contactName},
            </Text>

            <Text style={styles.paragraph}>
              Geweldig nieuws! Uw professional account voor <strong>{organizationName}</strong> is
              goedgekeurd en geverifieerd. U kunt nu volledig gebruik maken van alle professionals
              features op {BRAND.name}.
            </Text>

            {/* Tier Info */}
            <Section style={styles.tierBox}>
              <Text style={styles.tierLabel}>Uw huidige abonnement:</Text>
              <Text style={styles.tierValue}>{tierLabels[tier] || tier}</Text>
            </Section>

            {/* Features */}
            <Text style={styles.featuresTitle}>Wat u kunt doen:</Text>
            <Section style={styles.featuresList}>
              {features.map((feature, index) => (
                <Text key={index} style={styles.featureItem}>
                  ✓ {feature}
                </Text>
              ))}
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button style={styles.ctaButton} href={dashboardUrl}>
                Naar mijn dashboard
              </Button>
            </Section>

            {/* Tips */}
            <Section style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Tips om te starten:</Text>
              <Text style={styles.tipItem}>
                1. Bekijk de <Link href={`${BRAND.website}/kennisbank`} style={styles.link}>kennisbank</Link> voor
                artikelen die u met cliënten kunt delen
              </Text>
              <Text style={styles.tipItem}>
                2. Probeer de <Link href={`${BRAND.website}/professionals/tools`} style={styles.link}>interactieve tools</Link> zoals
                de Love Language Quiz
              </Text>
              <Text style={styles.tipItem}>
                3. Nodig teamleden uit via uw dashboard
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Vragen? Neem contact op via{' '}
              <Link href="mailto:professionals@liefdevooriedereen.nl" style={styles.link}>
                professionals@liefdevooriedereen.nl
              </Link>
            </Text>
            <Text style={styles.footerText}>
              {BRAND.name} - De inclusieve dating app voor iedereen
            </Text>
            <Text style={styles.footerMuted}>
              © {new Date().getFullYear()} {BRAND.name}. Alle rechten voorbehouden.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '16px 16px 0 0',
    padding: '32px',
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 auto',
  },
  badgeSection: {
    textAlign: 'center' as const,
    marginTop: '-30px',
  },
  successBadge: {
    display: 'inline-block',
    width: '60px',
    height: '60px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    border: '4px solid #ffffff',
  },
  badgeIcon: {
    color: '#ffffff',
    fontSize: '32px',
    lineHeight: '52px',
    margin: 0,
    textAlign: 'center' as const,
  },
  content: {
    padding: '32px',
  },
  heading: {
    color: BRAND.textColor,
    fontSize: '28px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '16px 0 24px',
  },
  greeting: {
    color: BRAND.textColor,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  paragraph: {
    color: BRAND.textColor,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  tierBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '16px 24px',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  tierLabel: {
    color: BRAND.textMuted,
    fontSize: '14px',
    margin: '0 0 4px',
  },
  tierValue: {
    color: BRAND.primaryColor,
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  featuresTitle: {
    color: BRAND.textColor,
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px',
  },
  featuresList: {
    marginBottom: '24px',
  },
  featureItem: {
    color: BRAND.textColor,
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0 0 8px',
    paddingLeft: '8px',
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  ctaButton: {
    backgroundColor: BRAND.primaryColor,
    borderRadius: '12px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '16px 32px',
    textDecoration: 'none',
  },
  tipsBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '16px 24px',
    marginTop: '24px',
  },
  tipsTitle: {
    color: '#92400e',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px',
  },
  tipItem: {
    color: '#92400e',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 8px',
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '0',
  },
  footer: {
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: BRAND.textMuted,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 8px',
  },
  footerMuted: {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '16px 0 0',
  },
  link: {
    color: BRAND.primaryColor,
    textDecoration: 'underline',
  },
}
