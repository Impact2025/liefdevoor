/**
 * Professional Verification Rejected Email Template
 *
 * Sent when admin rejects a professional account
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
  bgColor: '#fef2f2', // Red-50
  website: 'https://liefdevooriedereen.nl'
}

interface VerificationRejectedEmailProps {
  organizationName: string
  contactName: string
  reason?: string
  reapplyUrl: string
  supportEmail: string
}

export default function VerificationRejectedEmail({
  organizationName = 'Uw Organisatie',
  contactName = 'daar',
  reason,
  reapplyUrl = 'https://liefdevooriedereen.nl/professionals/aanmelden',
  supportEmail = 'professionals@liefdevooriedereen.nl'
}: VerificationRejectedEmailProps) {
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

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Verificatie niet goedgekeurd
            </Heading>

            <Text style={styles.greeting}>
              Beste {contactName},
            </Text>

            <Text style={styles.paragraph}>
              Bedankt voor uw aanmelding als professional bij {BRAND.name}. Helaas kunnen we uw
              account voor <strong>{organizationName}</strong> op dit moment niet verifiëren.
            </Text>

            {/* Reason Box */}
            {reason && (
              <Section style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Reden:</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </Section>
            )}

            {/* What to do */}
            <Section style={styles.helpBox}>
              <Text style={styles.helpTitle}>Wat kunt u doen?</Text>
              <Text style={styles.helpItem}>
                <strong>1. Controleer uw gegevens:</strong> Zorg ervoor dat uw KVK-nummer correct is
                en uw organisatie actief is.
              </Text>
              <Text style={styles.helpItem}>
                <strong>2. Upload documentatie:</strong> Voeg relevante documenten toe zoals een
                KVK-uittreksel of bewijs van registratie.
              </Text>
              <Text style={styles.helpItem}>
                <strong>3. Neem contact op:</strong> Heeft u vragen? Mail ons gerust voor hulp.
              </Text>
            </Section>

            {/* CTA Buttons */}
            <Section style={styles.ctaSection}>
              <Button style={styles.ctaButton} href={reapplyUrl}>
                Opnieuw aanmelden
              </Button>
            </Section>

            <Text style={styles.contactText}>
              Of neem contact op via{' '}
              <Link href={`mailto:${supportEmail}`} style={styles.link}>
                {supportEmail}
              </Link>
            </Text>

            {/* Reassurance */}
            <Section style={styles.reassuranceBox}>
              <Text style={styles.reassuranceText}>
                We waarderen uw interesse in {BRAND.name} en hopen u snel alsnog te kunnen
                verwelkomen als geverifieerde professional.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
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
  content: {
    padding: '32px',
  },
  heading: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '0 0 24px',
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
  reasonBox: {
    backgroundColor: BRAND.bgColor,
    borderLeft: '4px solid #ef4444',
    borderRadius: '0 12px 12px 0',
    padding: '16px 24px',
    marginBottom: '24px',
  },
  reasonLabel: {
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px',
  },
  reasonText: {
    color: BRAND.textColor,
    fontSize: '15px',
    lineHeight: '1.6',
    margin: 0,
  },
  helpBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '24px',
  },
  helpTitle: {
    color: '#166534',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 16px',
  },
  helpItem: {
    color: '#166534',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 12px',
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '32px 0 16px',
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
  contactText: {
    color: BRAND.textMuted,
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  reassuranceBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: '12px',
    padding: '16px 24px',
  },
  reassuranceText: {
    color: BRAND.primaryColor,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    textAlign: 'center' as const,
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
