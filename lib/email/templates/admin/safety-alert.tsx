/**
 * Admin Alert: Safety - Multiple Reports
 *
 * Sent when a user receives 3 or more reports (urgent action needed)
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
  dangerColor: '#ef4444',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'admin@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface SafetyAlertAdminEmailProps {
  reportedUserName: string
  reportedUserId: string
  reportCount: number
  reasons: string[]
  latestReportDate: Date
}

export default function SafetyAlertAdminEmail({
  reportedUserName = 'John Doe',
  reportedUserId = 'user123',
  reportCount = 3,
  reasons = ['Harassment', 'Fake Profile'],
  latestReportDate = new Date()
}: SafetyAlertAdminEmailProps) {
  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(latestReportDate)

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={BRAND.logoUrl} width="140" height="auto" alt={BRAND.name} style={styles.logo} />
            <Text style={styles.urgentBadge}>
              🚨 URGENT - ACTIE VEREIST
            </Text>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.iconSection}>
              <div style={styles.dangerIcon}>⚠️</div>
            </Section>

            <Heading style={styles.h1}>
              Safety Alert: {reportCount}+ Reports!
            </Heading>

            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                Een gebruiker heeft meerdere meldingen ontvangen en vereist directe aandacht van de moderatie.
              </Text>
            </Section>

            <Section style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Report Details</Text>
              <Hr style={styles.hr} />

              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Gerapporteerde Gebruiker</td>
                  <td style={styles.detailValue}>{reportedUserName}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Aantal Reports</td>
                  <td style={{...styles.detailValue, color: BRAND.dangerColor, fontSize: '18px'}}>
                    {reportCount} meldingen
                  </td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Laatste Report</td>
                  <td style={styles.detailValue}>{formattedDate}</td>
                </tr>
              </table>

              <Section style={styles.reasonsSection}>
                <Text style={styles.reasonsTitle}>Redenen:</Text>
                <ul style={styles.reasonsList}>
                  {reasons.map((reason, index) => (
                    <li key={index} style={styles.reasonItem}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </Section>
            </Section>

            <Section style={styles.actionsBox}>
              <Text style={styles.actionsTitle}>⚡ Vereiste Actie</Text>
              <Text style={styles.actionsText}>
                Bekijk de reports en neem één van de volgende acties:
              </Text>
              <ul style={styles.actionsList}>
                <li style={styles.actionItem}>Review profiel en gedrag</li>
                <li style={styles.actionItem}>Contacteer gebruiker voor opheldering</li>
                <li style={styles.actionItem}>Temporele ban indien nodig</li>
                <li style={styles.actionItem}>Permanente ban bij ernstige overtredingen</li>
              </ul>
            </Section>

            <Section style={styles.buttonGroup}>
              <Button href={`${BRAND.website}/admin/users/${reportedUserId}`} style={styles.primaryButton}>
                Bekijk Profiel
              </Button>
              <Button href={`${BRAND.website}/admin/safety/reports`} style={styles.secondaryButton}>
                Alle Reports
              </Button>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>{BRAND.name} Safety Team</Text>
            <Text style={styles.footerUrgent}>
              Dit is een high-priority safety alert
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
    overflow: 'hidden' as const,
    border: '3px solid #ef4444'
  },
  header: {
    backgroundColor: '#7f1d1d',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  logo: {
    display: 'block',
    margin: '0 auto 12px',
    filter: 'brightness(0) invert(1)'
  },
  urgentBadge: {
    display: 'inline-block',
    backgroundColor: '#fecaca',
    color: '#7f1d1d',
    fontSize: '12px',
    fontWeight: '900',
    padding: '6px 16px',
    borderRadius: '16px',
    margin: '0',
    animation: 'pulse 2s infinite'
  },
  content: {
    padding: '40px'
  },
  iconSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  dangerIcon: {
    fontSize: '56px',
    animation: 'bounce 1s infinite'
  },
  h1: {
    color: BRAND.dangerColor,
    fontSize: '24px',
    fontWeight: '900',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #ef4444',
    borderRadius: '0 8px 8px 0',
    padding: '20px',
    margin: '0 0 24px'
  },
  warningText: {
    fontSize: '14px',
    color: '#7f1d1d',
    margin: '0',
    fontWeight: '600',
    lineHeight: '1.6'
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
    borderCollapse: 'collapse' as const,
    marginBottom: '16px'
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
  reasonsSection: {
    marginTop: '16px'
  },
  reasonsTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 8px'
  },
  reasonsList: {
    margin: '0',
    padding: '0 0 0 20px'
  },
  reasonItem: {
    fontSize: '13px',
    color: BRAND.textColor,
    margin: '0 0 4px'
  },
  actionsBox: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '0 8px 8px 0',
    padding: '20px',
    margin: '0 0 24px'
  },
  actionsTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e40af',
    margin: '0 0 12px'
  },
  actionsText: {
    fontSize: '13px',
    color: '#1e40af',
    margin: '0 0 12px'
  },
  actionsList: {
    margin: '0',
    padding: '0 0 0 20px'
  },
  actionItem: {
    fontSize: '13px',
    color: '#1e40af',
    margin: '0 0 6px',
    fontWeight: '500'
  },
  buttonGroup: {
    textAlign: 'center' as const
  },
  primaryButton: {
    backgroundColor: BRAND.dangerColor,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    margin: '0 6px 6px 0',
    display: 'inline-block'
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    margin: '0 0 6px 0',
    display: 'inline-block'
  },
  footer: {
    backgroundColor: '#7f1d1d',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '13px',
    color: '#fca5a5',
    margin: '0 0 8px',
    fontWeight: '600'
  },
  footerUrgent: {
    fontSize: '11px',
    color: '#fecaca',
    margin: '0',
    fontStyle: 'italic'
  }
}
