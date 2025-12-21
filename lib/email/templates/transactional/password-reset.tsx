/**
 * Password Reset Email Template
 *
 * Professional, minimalist design
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
  primaryColor: '#f43f5e',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl'
}

interface PasswordResetEmailProps {
  userName: string
  resetUrl: string
  expiresIn?: string
}

export default function PasswordResetEmail({
  userName = 'daar',
  resetUrl = 'http://localhost:3004/reset-password?token=xxx',
  expiresIn = '1 uur'
}: PasswordResetEmailProps) {
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
              Wachtwoord herstellen
            </Heading>

            <Text style={styles.greeting}>
              Hoi {userName},
            </Text>

            <Text style={styles.text}>
              Je hebt een verzoek ingediend om je wachtwoord te herstellen.
              Klik op onderstaande knop om een nieuw wachtwoord in te stellen.
            </Text>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={resetUrl} style={styles.button}>
                Nieuw wachtwoord instellen
              </Button>
            </Section>

            {/* Warning */}
            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                <strong>Let op:</strong> Deze link is {expiresIn} geldig en kan slechts eenmaal worden gebruikt.
              </Text>
            </Section>

            <Text style={styles.mutedText}>
              Heb je dit verzoek niet gedaan? Dan kun je deze email veilig negeren.
              Je wachtwoord blijft ongewijzigd.
            </Text>

            {/* Alternative Link */}
            <Section style={styles.linkBox}>
              <Text style={styles.linkLabel}>
                Werkt de knop niet? Kopieer deze link:
              </Text>
              <Text style={styles.linkText}>
                {resetUrl}
              </Text>
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
              Dit bericht is verzonden door {BRAND.name}.
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
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 24px',
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
    margin: '0 0 16px'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '24px 0'
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
    padding: '16px',
    margin: '24px 0'
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
    margin: '0 0 24px',
    lineHeight: '1.6'
  },
  linkBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '6px',
    padding: '16px',
    margin: '24px 0 0'
  },
  linkLabel: {
    fontSize: '12px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  linkText: {
    fontSize: '12px',
    color: BRAND.textColor,
    margin: '0',
    wordBreak: 'break-all' as const,
    lineHeight: '1.5'
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
    margin: '0'
  }
}
