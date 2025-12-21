/**
 * New Message Notification Email Template
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
  Img,
  Section
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
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface MessageNotificationEmailProps {
  userName: string
  senderName: string
  senderAge: number
  senderPhoto: string
  messagePreview: string
  replyUrl: string
  unreadCount?: number
}

export default function MessageNotificationEmail({
  userName = 'daar',
  senderName = 'Sarah',
  senderAge = 27,
  senderPhoto = 'https://ui-avatars.com/api/?name=Sarah&size=400',
  messagePreview = 'Hey! Hoe is je dag vandaag?',
  replyUrl = 'http://localhost:3004/matches',
  unreadCount = 1
}: MessageNotificationEmailProps) {
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
              Nieuw bericht
            </Heading>

            <Text style={styles.subtitle}>
              {senderName} heeft je een bericht gestuurd
            </Text>

            {/* Message Card */}
            <Section style={styles.messageCard}>
              <div style={styles.senderRow}>
                <Img
                  src={senderPhoto}
                  width="48"
                  height="48"
                  style={styles.senderPhoto}
                  alt={senderName}
                />
                <div style={styles.senderInfo}>
                  <Text style={styles.senderName}>
                    {senderName}, {senderAge}
                  </Text>
                  <Text style={styles.timeAgo}>
                    Zojuist
                  </Text>
                </div>
              </div>

              <div style={styles.messageBox}>
                <Text style={styles.messageText}>
                  {messagePreview}
                </Text>
              </div>

              {unreadCount && unreadCount > 1 && (
                <Text style={styles.unreadBadge}>
                  +{unreadCount - 1} meer ongelezen {unreadCount === 2 ? 'bericht' : 'berichten'}
                </Text>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={replyUrl} style={styles.button}>
                Bekijk bericht
              </Button>
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
              Je ontvangt deze email omdat je een nieuw bericht hebt ontvangen.
              <br />
              <a href={`${BRAND.website}/settings/notifications`} style={styles.unsubscribeLink}>
                Emailvoorkeuren beheren
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
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 8px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  subtitle: {
    fontSize: '15px',
    color: BRAND.textMuted,
    textAlign: 'center' as const,
    margin: '0 0 32px'
  },
  messageCard: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 24px'
  },
  senderRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  senderPhoto: {
    borderRadius: '24px',
    marginRight: '12px',
    border: '2px solid #ffffff'
  },
  senderInfo: {
    flex: 1
  },
  senderName: {
    fontSize: '16px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 2px',
    lineHeight: '1.3'
  },
  timeAgo: {
    fontSize: '13px',
    color: BRAND.textMuted,
    margin: '0'
  },
  messageBox: {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    padding: '16px',
    border: `1px solid ${BRAND.borderColor}`
  },
  messageText: {
    fontSize: '15px',
    color: BRAND.textColor,
    margin: '0',
    lineHeight: '1.6'
  },
  unreadBadge: {
    fontSize: '13px',
    color: BRAND.primaryColor,
    margin: '12px 0 0',
    fontWeight: '500',
    textAlign: 'center' as const
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0'
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
  },
  unsubscribeLink: {
    color: BRAND.textMuted,
    textDecoration: 'underline'
  }
}
