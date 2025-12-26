/**
 * Admin Alert: Payment Failed
 * Sent when a recurring payment fails
 */

import { Html, Head, Body, Container, Heading, Text, Button, Section, Img, Hr } from '@react-email/components'

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  dangerColor: '#ef4444',
  warningColor: '#f59e0b',
  website: 'https://liefdevooriedereen.nl'
}

interface PaymentFailedAdminEmailProps {
  userName: string
  userEmail: string
  userId: string
  planName: string
  amount: number
  reason: string
  failedDate: Date
}

export default function PaymentFailedAdminEmail({
  userName = 'John Doe',
  userEmail = 'john@example.com',
  userId = 'user123',
  planName = 'Premium',
  amount = 24.95,
  reason = 'Insufficient funds',
  failedDate = new Date()
}: PaymentFailedAdminEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{...styles.body}}>
        <Container style={{...styles.container, border: `3px solid ${BRAND.warningColor}`}}>
          <Section style={{...styles.header, backgroundColor: '#78350f'}}>
            <Img src={BRAND.logoUrl} width="140" height="auto" alt={BRAND.name} style={styles.logo} />
            <Text style={styles.headerBadge}>⚠️ PAYMENT ALERT</Text>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.iconSection}><div style={{fontSize: '48px'}}>💳</div></Section>

            <Heading style={{...styles.h1, color: BRAND.warningColor}}>
              Betaling Mislukt
            </Heading>

            <Section style={styles.detailsBox}>
              <Text style={styles.title}>Betalingsdetails</Text>
              <Hr style={{borderColor: '#e5e7eb', margin: '0 0 16px'}} />
              <table style={{width: '100%'}}>
                <tr>
                  <td style={styles.label}>Klant</td>
                  <td style={styles.value}>{userName}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Email</td>
                  <td style={styles.value}>{userEmail}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Plan</td>
                  <td style={styles.value}>{planName}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Bedrag</td>
                  <td style={{...styles.value, color: BRAND.dangerColor}}>€{amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Reden</td>
                  <td style={styles.value}>{reason}</td>
                </tr>
              </table>
            </Section>

            <Section style={{textAlign: 'center' as const}}>
              <Button href={`${BRAND.website}/admin/users/${userId}`} style={styles.button}>
                Bekijk Klant
              </Button>
            </Section>
          </Section>

          <Section style={{...styles.footer, backgroundColor: '#78350f'}}>
            <Text style={{fontSize: '13px', color: '#fcd34d', margin: '0'}}>
              Overweeg om klant te contacteren voor betaalmethode update
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 },
  container: { backgroundColor: '#ffffff', margin: '40px auto', borderRadius: '8px', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' as const },
  header: { padding: '24px 40px', textAlign: 'center' as const },
  logo: { display: 'block', margin: '0 auto 12px', filter: 'brightness(0) invert(1)' },
  headerBadge: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: '700' as const, padding: '4px 12px', borderRadius: '12px', margin: '0' },
  content: { padding: '40px' },
  iconSection: { textAlign: 'center' as const, margin: '0 0 24px' },
  h1: { fontSize: '24px', fontWeight: '700' as const, margin: '0 0 24px', textAlign: 'center' as const },
  detailsBox: { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '24px', margin: '0 0 24px', border: '2px solid #e5e7eb' },
  title: { fontSize: '14px', fontWeight: '700' as const, color: '#1f2937', margin: '0 0 16px', textTransform: 'uppercase' as const },
  label: { fontSize: '13px', color: '#6b7280', padding: '8px 0', textAlign: 'left' as const },
  value: { fontSize: '14px', color: '#1f2937', fontWeight: '600' as const, padding: '8px 0', textAlign: 'right' as const },
  button: { backgroundColor: BRAND.primaryColor, color: '#fff', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none', padding: '12px 24px', borderRadius: '6px' },
  footer: { padding: '24px 40px', textAlign: 'center' as const }
}
