/**
 * Admin Alert: New Payment Received
 *
 * Sent immediately when a payment is successfully processed
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
  email: 'admin@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface NewPaymentAdminEmailProps {
  userName: string
  userEmail: string
  userId: string
  planName: string
  amount: number
  transactionId: string
  paymentDate: Date
  isNewCustomer: boolean
}

export default function NewPaymentAdminEmail({
  userName = 'John Doe',
  userEmail = 'john@example.com',
  userId = 'user123',
  planName = 'Premium',
  amount = 24.95,
  transactionId = 'MSP-123456',
  paymentDate = new Date(),
  isNewCustomer = true
}: NewPaymentAdminEmailProps) {
  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(paymentDate)

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="140"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
            <Text style={styles.headerBadge}>
              🔔 ADMIN ALERT
            </Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            {/* Success Icon */}
            <Section style={styles.iconSection}>
              <div style={styles.successIcon}>💰</div>
            </Section>

            <Heading style={styles.h1}>
              Nieuwe Betaling Ontvangen!
            </Heading>

            {isNewCustomer && (
              <Section style={styles.newCustomerBadge}>
                <Text style={styles.badgeText}>
                  🎉 NIEUWE KLANT
                </Text>
              </Section>
            )}

            {/* Payment Details */}
            <Section style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Betalingsdetails</Text>
              <Hr style={styles.hr} />

              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Klant</td>
                  <td style={styles.detailValue}>{userName}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Email</td>
                  <td style={styles.detailValue}>{userEmail}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Plan</td>
                  <td style={styles.detailValue}>{planName}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Bedrag</td>
                  <td style={{...styles.detailValue, ...styles.amountValue}}>
                    €{amount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Transactie ID</td>
                  <td style={styles.detailValue}>{transactionId}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Datum/Tijd</td>
                  <td style={styles.detailValue}>{formattedDate}</td>
                </tr>
              </table>
            </Section>

            {/* Quick Actions */}
            <Section style={styles.actionsBox}>
              <Text style={styles.actionsTitle}>Quick Actions</Text>
              <Section style={styles.buttonGroup}>
                <Button
                  href={`${BRAND.website}/admin/users/${userId}`}
                  style={styles.primaryButton}
                >
                  Bekijk Klant
                </Button>
                <Button
                  href={`${BRAND.website}/admin/payments`}
                  style={styles.secondaryButton}
                >
                  Alle Betalingen
                </Button>
              </Section>
            </Section>

            <Text style={styles.footerNote}>
              Dit is een geautomatiseerde notificatie. Je kunt admin alerts configureren in je instellingen.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              {BRAND.name} Admin Dashboard
            </Text>
            <Text style={styles.footerEmail}>
              <a href={`mailto:${BRAND.email}`} style={styles.footerLink}>
                {BRAND.email}
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
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
    letterSpacing: '0.5px',
    margin: '0'
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
    fontSize: '48px',
    lineHeight: '1'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  newCustomerBadge: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  badgeText: {
    display: 'inline-block',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 16px',
    borderRadius: '16px',
    margin: '0'
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
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
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
    textAlign: 'left' as const,
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '14px',
    color: BRAND.textColor,
    fontWeight: '600',
    padding: '8px 0',
    textAlign: 'right' as const
  },
  amountValue: {
    color: BRAND.successColor,
    fontSize: '18px'
  },
  actionsBox: {
    margin: '0 0 24px'
  },
  actionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 12px'
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
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '6px',
    margin: '0 6px 6px 0'
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '6px',
    margin: '0 0 6px 0'
  },
  footerNote: {
    fontSize: '12px',
    color: BRAND.textMuted,
    margin: '0',
    lineHeight: '1.5',
    textAlign: 'center' as const,
    fontStyle: 'italic'
  },
  footer: {
    backgroundColor: '#1f2937',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0 0 8px'
  },
  footerEmail: {
    fontSize: '13px',
    margin: '0'
  },
  footerLink: {
    color: '#60a5fa',
    textDecoration: 'none'
  }
}
