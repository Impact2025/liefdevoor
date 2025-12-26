/**
 * Admin Alert: New User Registration
 *
 * Sent when a new user completes registration
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

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'admin@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface NewRegistrationAdminEmailProps {
  userName: string
  userEmail: string
  userId: string
  gender: string
  age: number
  city: string
  registrationDate: Date
  referralSource?: string
}

export default function NewRegistrationAdminEmail({
  userName = 'Jane Doe',
  userEmail = 'jane@example.com',
  userId = 'user123',
  gender = 'Vrouw',
  age = 28,
  city = 'Amsterdam',
  registrationDate = new Date(),
  referralSource
}: NewRegistrationAdminEmailProps) {
  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(registrationDate)

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={BRAND.logoUrl} width="140" height="auto" alt={BRAND.name} style={styles.logo} />
            <Text style={styles.headerBadge}>🔔 ADMIN ALERT</Text>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.iconSection}>
              <div style={styles.icon}>👤</div>
            </Section>

            <Heading style={styles.h1}>Nieuwe Registratie!</Heading>

            <Section style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Gebruikersdetails</Text>
              <Hr style={styles.hr} />
              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Naam</td>
                  <td style={styles.detailValue}>{userName}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Email</td>
                  <td style={styles.detailValue}>{userEmail}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Gender</td>
                  <td style={styles.detailValue}>{gender}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Leeftijd</td>
                  <td style={styles.detailValue}>{age} jaar</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Locatie</td>
                  <td style={styles.detailValue}>{city}</td>
                </tr>
                {referralSource && (
                  <tr>
                    <td style={styles.detailLabel}>Bron</td>
                    <td style={styles.detailValue}>{referralSource}</td>
                  </tr>
                )}
                <tr>
                  <td style={styles.detailLabel}>Registratie</td>
                  <td style={styles.detailValue}>{formattedDate}</td>
                </tr>
              </table>
            </Section>

            <Section style={styles.buttonGroup}>
              <Button href={`${BRAND.website}/admin/users/${userId}`} style={styles.primaryButton}>
                Bekijk Profiel
              </Button>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>{BRAND.name} Admin Dashboard</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '8px',
    maxWidth: '600px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden' as const
  },
  header: {
    backgroundColor: '#1f2937',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  logo: {
    display: 'block',
    margin: '0 auto 12px',
    filter: 'brightness(0) invert(1)'
  },
  headerBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '12px',
    margin: '0'
  },
  content: {
    padding: '40px'
  },
  iconSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  icon: {
    fontSize: '48px'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  detailsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '24px',
    margin: '0 0 24px',
    border: `2px solid ${BRAND.borderColor}`
  },
  detailsTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: BRAND.textColor,
    margin: '0 0 16px',
    textTransform: 'uppercase' as const
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
    fontSize: '13px',
    color: BRAND.textMuted,
    padding: '8px 0',
    textAlign: 'left' as const
  },
  detailValue: {
    fontSize: '14px',
    color: BRAND.textColor,
    fontWeight: '600',
    padding: '8px 0',
    textAlign: 'right' as const
  },
  buttonGroup: {
    textAlign: 'center' as const
  },
  primaryButton: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '6px'
  },
  footer: {
    backgroundColor: '#1f2937',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0'
  }
}
