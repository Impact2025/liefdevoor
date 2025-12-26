/**
 * Subscription Expiring Email Template
 *
 * Sent 7 days before subscription expires (for non-recurring subscriptions)
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
  warningColor: '#f59e0b',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface SubscriptionExpiringEmailProps {
  userName: string
  planName: string
  expiryDate: string
  daysRemaining: number
  renewUrl?: string
}

export default function SubscriptionExpiringEmail({
  userName = 'daar',
  planName = 'Premium',
  expiryDate = '2 januari 2026',
  daysRemaining = 7,
  renewUrl = 'https://liefdevooriedereen.nl/subscription'
}: SubscriptionExpiringEmailProps) {
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
            {/* Warning Icon */}
            <Section style={styles.iconSection}>
              <div style={styles.warningIcon}>⏰</div>
            </Section>

            <Heading style={styles.h1}>
              Je abonnement verloopt binnenkort
            </Heading>

            <Text style={styles.greeting}>
              Hoi {userName},
            </Text>

            <Text style={styles.text}>
              We willen je er even aan herinneren dat je {planName} abonnement over <strong>{daysRemaining} dagen</strong> afloopt.
            </Text>

            {/* Expiry Details */}
            <Section style={styles.expiryBox}>
              <Text style={styles.expiryTitle}>
                📅 Verloopt op
              </Text>
              <Text style={styles.expiryDate}>
                {expiryDate}
              </Text>
              <Text style={styles.expirySubtext}>
                Na deze datum wordt je account teruggezet naar het gratis plan
              </Text>
            </Section>

            <Text style={styles.text}>
              Wil je blijven genieten van onbeperkte likes, super likes en alle andere premium functies? Verleng dan nu je abonnement!
            </Text>

            {/* Benefits Reminder */}
            <Section style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>
                ✨ Premium voordelen die je verliest:
              </Text>
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>💖 Onbeperkt likes</li>
                <li style={styles.benefitItem}>⭐ Super likes</li>
                <li style={styles.benefitItem}>👀 Zie wie jou leuk vindt</li>
                <li style={styles.benefitItem}>🎤 Stuur audioberichten</li>
                <li style={styles.benefitItem}>🌍 Passport feature</li>
              </ul>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={renewUrl} style={styles.button}>
                Abonnement verlengen
              </Button>
            </Section>

            {/* Info Box */}
            <Section style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 <strong>Wist je dat?</strong> Je kunt automatische verlenging instellen, zodat je nooit meer toegang verliest tot premium functies. Zo hoef je je nergens meer zorgen over te maken!
              </Text>
            </Section>

            <Text style={styles.mutedText}>
              Heb je vragen? We helpen je graag via {BRAND.email}
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
              Abonnement beheren?
              <br />
              <a href={`${BRAND.website}/settings/subscription`} style={styles.footerLink}>
                Naar instellingen
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
  warningIcon: {
    display: 'inline-block',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: BRAND.warningColor,
    color: '#ffffff',
    fontSize: '32px',
    lineHeight: '64px'
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
  expiryBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '24px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  expiryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  expiryDate: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#78350f',
    margin: '0 0 8px'
  },
  expirySubtext: {
    fontSize: '13px',
    color: '#92400e',
    margin: '0'
  },
  benefitsBox: {
    backgroundColor: '#fef3f2',
    borderLeft: `3px solid ${BRAND.primaryColor}`,
    borderRadius: '0 6px 6px 0',
    padding: '20px 24px',
    margin: '0 0 24px'
  },
  benefitsTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 12px'
  },
  benefitsList: {
    margin: '0',
    padding: '0 0 0 20px',
    listStyle: 'none'
  },
  benefitItem: {
    fontSize: '14px',
    color: BRAND.textColor,
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
  infoBox: {
    backgroundColor: '#eff6ff',
    borderLeft: '3px solid #3b82f6',
    borderRadius: '0 6px 6px 0',
    padding: '16px 20px',
    margin: '0 0 24px'
  },
  infoText: {
    fontSize: '13px',
    color: '#1e40af',
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
