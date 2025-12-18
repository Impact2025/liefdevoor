/**
 * New Message Notification Email Template
 *
 * Sent when user receives a new message
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
  Section,
  Hr
} from '@react-email/components'

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
  messagePreview = 'Hey! Hoe is je dag vandaag? 😊',
  replyUrl = 'http://localhost:3004/matches',
  unreadCount = 1
}: MessageNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.headerSection}>
            <Text style={styles.icon}>💬</Text>
            <Heading style={styles.h1}>
              Nieuw Bericht!
            </Heading>
            <Text style={styles.subtitle}>
              {senderName} heeft je een bericht gestuurd
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Message Card */}
          <Section style={styles.messageCard}>
            {/* Sender Photo */}
            <div style={styles.senderRow}>
              <Img
                src={senderPhoto}
                width="60"
                height="60"
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

            {/* Message Preview */}
            <div style={styles.messageBox}>
              <Text style={styles.messageText}>
                "{messagePreview}"
              </Text>
            </div>

            {/* Unread Badge */}
            {unreadCount && unreadCount > 1 && (
              <div style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  +{unreadCount - 1} meer ongelezen {unreadCount === 2 ? 'bericht' : 'berichten'}
                </Text>
              </div>
            )}
          </Section>

          {/* Call to Action */}
          <Section style={styles.ctaSection}>
            <Button href={replyUrl} style={styles.button}>
              💬 Antwoord nu!
            </Button>
          </Section>

          {/* Tips Section */}
          <Section style={styles.tipsBox}>
            <Text style={styles.tipsText}>
              💡 <strong>Tip:</strong> Reageer binnen 24 uur voor de beste kans op een gesprek!
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Text style={styles.footer}>
            Veel plezier met chatten! 😊
          </Text>

          <Text style={styles.signature}>
            Met liefde,
            <br />
            Het Liefde Voor Iedereen Team ❤️
          </Text>

          {/* Unsubscribe */}
          <Text style={styles.unsubscribe}>
            Je ontvangt deze email omdat je een nieuw bericht hebt ontvangen.
            <br />
            <a href="http://localhost:3004/settings/email-preferences" style={styles.unsubscribeLink}>
              Email voorkeuren beheren
            </a>
          </Text>

        </Container>
      </Body>
    </Html>
  )
}

// Styles
const styles = {
  body: {
    backgroundColor: '#f0f9ff',
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
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)'
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
    color: '#1e40af',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 12px',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '0'
  },
  hr: {
    borderColor: '#f3f4f6',
    margin: '30px 0'
  },
  messageCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: '12px',
    padding: '24px',
    margin: '20px 0',
    border: '1px solid #bfdbfe'
  },
  senderRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  senderPhoto: {
    borderRadius: '30px',
    marginRight: '12px',
    border: '2px solid #ffffff'
  },
  senderInfo: {
    flex: 1
  },
  senderName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px',
    lineHeight: '1.2'
  },
  timeAgo: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0'
  },
  messageBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e5e7eb'
  },
  messageText: {
    fontSize: '16px',
    color: '#374151',
    margin: '0',
    lineHeight: '1.6',
    fontStyle: 'italic'
  },
  unreadBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    padding: '8px 12px',
    marginTop: '12px',
    textAlign: 'center' as const
  },
  unreadText: {
    fontSize: '13px',
    color: '#1e40af',
    margin: '0',
    fontWeight: '600'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '30px 0'
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 40px',
    borderRadius: '12px',
    margin: '0',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  tipsBox: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0'
  },
  tipsText: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0',
    lineHeight: '1.5'
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
  },
  unsubscribe: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '30px 0 0',
    lineHeight: '18px'
  },
  unsubscribeLink: {
    color: '#6b7280',
    textDecoration: 'underline'
  }
}
