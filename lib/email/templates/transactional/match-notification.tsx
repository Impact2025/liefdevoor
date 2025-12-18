/**
 * Match Notification Email Template
 *
 * Sent when two users match - most important email for engagement!
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

interface MatchNotificationEmailProps {
  userName: string
  matchName: string
  matchAge: number
  matchPhoto: string
  matchCity: string
  matchBio?: string
  chatUrl: string
}

export default function MatchNotificationEmail({
  userName = 'daar',
  matchName = 'Sarah',
  matchAge = 27,
  matchPhoto = 'https://ui-avatars.com/api/?name=Sarah&size=400',
  matchCity = 'Amsterdam',
  matchBio = 'Houdt van reizen en goede gesprekken',
  chatUrl = 'http://localhost:3004/matches'
}: MatchNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Celebration Header */}
          <Section style={styles.headerSection}>
            <Text style={styles.celebrationEmoji}>🎉 💖 🎊</Text>
            <Heading style={styles.h1}>
              Het is een Match!
            </Heading>
            <Text style={styles.subtitle}>
              {matchName} vindt jou ook leuk!
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Match Card */}
          <Section style={styles.matchCard}>
            {/* Profile Photo */}
            <Img
              src={matchPhoto}
              width="150"
              height="150"
              style={styles.matchPhoto}
              alt={matchName}
            />

            {/* Match Info */}
            <Heading style={styles.matchName}>
              {matchName}, {matchAge}
            </Heading>

            <Text style={styles.matchCity}>
              📍 {matchCity}
            </Text>

            {matchBio && (
              <Text style={styles.matchBio}>
                "{matchBio}"
              </Text>
            )}
          </Section>

          {/* Excitement Message */}
          <Section style={styles.messageSection}>
            <Text style={styles.message}>
              💘 <strong>Dit is het moment waar je op wachtte!</strong>
            </Text>
            <Text style={styles.submessage}>
              Jullie hebben allebei interesse in elkaar. Begin nu met chatten en wie weet waar dit toe leidt!
            </Text>
          </Section>

          {/* Call to Action */}
          <Section style={styles.ctaSection}>
            <Button href={chatUrl} style={styles.button}>
              💬 Begin met chatten!
            </Button>
          </Section>

          {/* Tips Section */}
          <Section style={styles.tipsBox}>
            <Text style={styles.tipsHeading}>
              💡 <strong>Tips voor het eerste bericht:</strong>
            </Text>
            <ul style={styles.tipsList}>
              <li style={styles.tipItem}>Stel een vraag over hun profiel</li>
              <li style={styles.tipItem}>Wees authentiek en jezelf</li>
              <li style={styles.tipItem}>Gebruik humor (maar niet té veel)</li>
              <li style={styles.tipItem}>Toon echte interesse</li>
            </ul>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Text style={styles.footer}>
            Veel succes met je nieuwe match! 🍀
          </Text>

          <Text style={styles.signature}>
            Met liefde,
            <br />
            Het Liefde Voor Iedereen Team ❤️
          </Text>

          {/* Unsubscribe */}
          <Text style={styles.unsubscribe}>
            Je ontvangt deze email omdat je een nieuwe match hebt.
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
    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)'
  },
  headerSection: {
    textAlign: 'center' as const,
    marginBottom: '20px'
  },
  celebrationEmoji: {
    fontSize: '48px',
    textAlign: 'center' as const,
    margin: '0 0 20px',
    letterSpacing: '10px'
  },
  h1: {
    color: '#dc2626',
    fontSize: '36px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 12px',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '0'
  },
  hr: {
    borderColor: '#f3f4f6',
    margin: '30px 0'
  },
  matchCard: {
    backgroundColor: '#fef2f2',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center' as const,
    margin: '20px 0',
    border: '2px solid #fecaca'
  },
  matchPhoto: {
    borderRadius: '75px',
    margin: '0 auto 20px',
    display: 'block',
    border: '4px solid #ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  matchName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px',
    lineHeight: '1.2'
  },
  matchCity: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 16px'
  },
  matchBio: {
    fontSize: '15px',
    color: '#4b5563',
    fontStyle: 'italic',
    margin: '0',
    lineHeight: '1.5'
  },
  messageSection: {
    textAlign: 'center' as const,
    margin: '30px 0'
  },
  message: {
    fontSize: '18px',
    color: '#111827',
    margin: '0 0 12px',
    lineHeight: '1.5'
  },
  submessage: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.6'
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
  tipsBox: {
    backgroundColor: '#dbeafe',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0'
  },
  tipsHeading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af',
    margin: '0 0 12px'
  },
  tipsList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#1e40af',
    fontSize: '14px',
    lineHeight: '24px'
  },
  tipItem: {
    marginBottom: '6px'
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
