/**
 * Password Reset Email Template
 *
 * Sent when user requests password reset
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
  Hr
} from '@react-email/components'

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

          {/* Header */}
          <Section style={styles.headerSection}>
            <Text style={styles.icon}>🔐</Text>
            <Heading style={styles.h1}>
              Wachtwoord Resetten
            </Heading>
          </Section>

          <Hr style={styles.hr} />

          {/* Content */}
          <Text style={styles.greeting}>
            Hoi {userName},
          </Text>

          <Text style={styles.text}>
            Je hebt gevraagd om je wachtwoord te resetten voor je Liefde Voor Iedereen account.
          </Text>

          <Text style={styles.text}>
            Klik op de knop hieronder om een nieuw wachtwoord in te stellen:
          </Text>

          {/* Call to Action */}
          <Section style={styles.ctaSection}>
            <Button href={resetUrl} style={styles.button}>
              🔓 Reset Wachtwoord
            </Button>
          </Section>

          {/* Expiry Warning */}
          <Section style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⏰ <strong>Let op:</strong> Deze link vervalt over <strong>{expiresIn}</strong>.
            </Text>
          </Section>

          {/* Alternative Link */}
          <Text style={styles.altText}>
            <strong>Werkt de knop niet?</strong>
            <br />
            Kopieer deze link en plak hem in je browser:
          </Text>

          <div style={styles.linkBox}>
            <Text style={styles.linkText}>
              {resetUrl}
            </Text>
          </div>

          <Hr style={styles.hr} />

          {/* Security Notice */}
          <Section style={styles.securityBox}>
            <Text style={styles.securityHeading}>
              🛡️ <strong>Veiligheid eerst!</strong>
            </Text>
            <Text style={styles.securityText}>
              • Heb je deze reset NIET aangevraagd? Negeer deze email dan. Je account blijft veilig.
              <br />
              • Deel deze link NOOIT met anderen.
              <br />
              • We vragen je NOOIT per email om je wachtwoord.
            </Text>
          </Section>

          {/* Footer */}
          <Text style={styles.footer}>
            Als je hulp nodig hebt, neem dan contact met ons op.
          </Text>

          <Text style={styles.signature}>
            Met liefde,
            <br />
            Het Liefde Voor Iedereen Team ❤️
          </Text>

        </Container>
      </Body>
    </Html>
  )
}

// Styles
const styles = {
  body: {
    backgroundColor: '#fef2f2',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '40px 30px',
    borderRadius: '16px',
    maxWidth: '600px',
    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)'
  },
  headerSection: {
    textAlign: 'center' as const,
    marginBottom: '20px'
  },
  icon: {
    fontSize: '48px',
    textAlign: 'center' as const,
    margin: '0 0 16px'
  },
  h1: {
    color: '#dc2626',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.2'
  },
  hr: {
    borderColor: '#f3f4f6',
    margin: '30px 0'
  },
  greeting: {
    fontSize: '18px',
    color: '#111827',
    margin: '0 0 20px',
    fontWeight: '600'
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#4b5563',
    margin: '0 0 16px'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '30px 0'
  },
  button: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 40px',
    borderRadius: '12px',
    margin: '0',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0'
  },
  warningText: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0',
    lineHeight: '1.5'
  },
  altText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '20px 0 12px',
    lineHeight: '1.5'
  },
  linkBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px'
  },
  linkText: {
    fontSize: '12px',
    color: '#374151',
    margin: '0',
    wordBreak: 'break-all' as const,
    lineHeight: '1.4'
  },
  securityBox: {
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0'
  },
  securityHeading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af',
    margin: '0 0 12px'
  },
  securityText: {
    fontSize: '14px',
    color: '#1e40af',
    margin: '0',
    lineHeight: '1.8'
  },
  footer: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '20px 0'
  },
  signature: {
    fontSize: '15px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    margin: '20px 0'
  }
}
