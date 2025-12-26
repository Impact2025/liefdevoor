/**
 * Subscription Renewed Email Template
 *
 * Sent after successful automatic renewal
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
  Img,
  Hr
} from '@react-email/components'

// Brand configuration
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  successColor: '#10b981',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface SubscriptionRenewedEmailProps {
  userName: string
  planName: string
  amount: string
  nextRenewalDate: string
  manageUrl?: string
}

export default function SubscriptionRenewedEmail({
  userName = 'daar',
  planName = 'Premium',
  amount = '€24.95',
  nextRenewalDate = '26 januari 2026',
  manageUrl = 'https://liefdevooriedereen.nl/settings/subscription'
}: SubscriptionRenewedEmailProps) {
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
            {/* Success Icon */}
            <Section style={styles.iconSection}>
              <div style={styles.successIcon}>✓</div>
            </Section>

            <Heading style={styles.h1}>
              Abonnement verlengd
            </Heading>

            <Text style={styles.greeting}>
              Hoi {userName},
            </Text>

            <Text style={styles.text}>
              Je {planName} abonnement is automatisch verlengd voor een nieuwe maand. Je blijft onbeperkt genieten van alle premium functies!
            </Text>

            {/* Renewal Details */}
            <Section style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Verlengingsgegevens</Text>
              <Hr style={styles.hr} />

              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Abonnement</td>
                  <td style={styles.detailValue}>{planName}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Bedrag</td>
                  <td style={styles.detailValue}>{amount}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Volgende verlenging</td>
                  <td style={styles.detailValue}>{nextRenewalDate}</td>
                </tr>
              </table>
            </Section>

            <Text style={styles.text}>
              Het bedrag is afgeschreven van je geregistreerde betaalmethode. Je ontvangt binnenkort een factuur per email.
            </Text>

            {/* Info Box */}
            <Section style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 <strong>Tip:</strong> Je kunt je abonnement op elk moment beheren of opzeggen in je accountinstellingen. Bij opzegging blijf je toegang houden tot premium functies tot het einde van je betaalde periode.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={manageUrl} style={styles.button}>
                Abonnement beheren
              </Button>
            </Section>

            <Text style={styles.mutedText}>
              Bedankt dat je lid blijft van Liefde Voor Iedereen! ❤️
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
              Heb je vragen over je abonnement?
              <br />
              <a href={manageUrl} style={styles.footerLink}>
                Accountinstellingen
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
  successIcon: {
    display: 'inline-block',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: BRAND.successColor,
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
  detailsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '24px',
    margin: '0 0 24px'
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 16px'
  },
  hr: {
    borderColor: BRAND.borderColor,
    margin: '0 0 16px'
  },
  detailsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  detailLabel: {
    fontSize: '14px',
    color: BRAND.textMuted,
    padding: '8px 0',
    textAlign: 'left' as const
  },
  detailValue: {
    fontSize: '14px',
    color: BRAND.textColor,
    fontWeight: '500',
    padding: '8px 0',
    textAlign: 'right' as const
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
