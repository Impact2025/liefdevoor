/**
 * Payment Failed Email Template
 *
 * Sent when automatic renewal payment fails
 */

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Img
} from '@react-email/components'

// Brand configuration
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  errorColor: '#ef4444',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface PaymentFailedEmailProps {
  userName: string
  planName: string
  amount: string
  reason?: string
  updateUrl?: string
}

export default function PaymentFailedEmail({
  userName = 'daar',
  planName = 'Premium',
  amount = '€24.95',
  reason = 'Onvoldoende saldo',
  updateUrl = 'https://liefdevooriedereen.nl/settings/subscription'
}: PaymentFailedEmailProps) {
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
            {/* Error Icon */}
            <Section style={styles.iconSection}>
              <div style={styles.errorIcon}>!</div>
            </Section>

            <Heading style={styles.h1}>
              Betaling mislukt
            </Heading>

            <Text style={styles.greeting}>
              Hoi {userName},
            </Text>

            <Text style={styles.text}>
              Helaas is de automatische verlenging van je {planName} abonnement ({amount}) mislukt.
            </Text>

            {/* Error Details */}
            <Section style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                ⚠️ Wat is er gebeurd?
              </Text>
              <Text style={styles.errorText}>
                {reason}
              </Text>
            </Section>

            <Text style={styles.text}>
              <strong>Geen zorgen!</strong> Je abonnement blijft nog actief voor de komende dagen, zodat je tijd hebt om je betaalmethode bij te werken.
            </Text>

            {/* Action Steps */}
            <Section style={styles.stepsBox}>
              <Text style={styles.stepsTitle}>
                Wat moet je doen?
              </Text>
              <ol style={styles.stepsList}>
                <li style={styles.stepItem}>
                  Controleer je betaalmethode en saldo
                </li>
                <li style={styles.stepItem}>
                  Update indien nodig je betaalgegevens
                </li>
                <li style={styles.stepItem}>
                  We proberen de betaling automatisch opnieuw
                </li>
              </ol>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={updateUrl} style={styles.button}>
                Betaalmethode bijwerken
              </Button>
            </Section>

            {/* Warning Box */}
            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                <strong>Let op:</strong> Als we je abonnement niet binnen 7 dagen kunnen verlengen, wordt je account teruggezet naar het gratis plan en verlies je toegang tot premium functies.
              </Text>
            </Section>

            <Text style={styles.mutedText}>
              Heb je vragen? Neem gerust contact met ons op via {BRAND.email}
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
              Hulp nodig?
              <br />
              <a href={`${BRAND.website}/support`} style={styles.footerLink}>
                Contacteer onze support
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
  iconSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  errorIcon: {
    display: 'inline-block',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: BRAND.errorColor,
    color: '#ffffff',
    fontSize: '32px',
    lineHeight: '64px',
    fontWeight: '600'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  greeting: {
    fontSize: '15px',
    color: BRAND.textColor,
    margin: '0 0 16px',
    lineHeight: '1.6'
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 24px'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderLeft: '3px solid #ef4444',
    borderRadius: '0 6px 6px 0',
    padding: '16px 20px',
    margin: '0 0 24px'
  },
  errorTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#991b1b',
    margin: '0 0 8px'
  },
  errorText: {
    fontSize: '14px',
    color: '#991b1b',
    margin: '0',
    lineHeight: '1.5'
  },
  stepsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '20px 24px',
    margin: '0 0 24px'
  },
  stepsTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 12px'
  },
  stepsList: {
    margin: '0',
    padding: '0 0 0 20px',
    color: BRAND.textColor
  },
  stepItem: {
    fontSize: '14px',
    margin: '0 0 8px',
    lineHeight: '1.5'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  button: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: '6px'
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderLeft: '3px solid #f59e0b',
    borderRadius: '0 6px 6px 0',
    padding: '16px 20px',
    margin: '0 0 24px'
  },
  warningText: {
    fontSize: '13px',
    color: '#92400e',
    margin: '0',
    lineHeight: '1.6'
  },
  mutedText: {
    fontSize: '13px',
    color: BRAND.textMuted,
    margin: '0',
    lineHeight: '1.6',
    textAlign: 'center' as const
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
    fontSize: '13px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  footerEmail: {
    fontSize: '13px',
    margin: '0 0 16px'
  },
  footerLink: {
    color: BRAND.primaryColor,
    textDecoration: 'none'
  },
  footerDisclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: '1.6'
  }
}
