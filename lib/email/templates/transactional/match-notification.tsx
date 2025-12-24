/**
 * Match Notification Email Template
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
  primaryColor: '#C34C60',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

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
              Nieuwe match
            </Heading>

            <Text style={styles.subtitle}>
              {matchName} en jij hebben een match
            </Text>

            {/* Match Card */}
            <Section style={styles.matchCard}>
              <Img
                src={matchPhoto}
                width="120"
                height="120"
                style={styles.matchPhoto}
                alt={matchName}
              />

              <Text style={styles.matchName}>
                {matchName}, {matchAge}
              </Text>

              <Text style={styles.matchCity}>
                {matchCity}
              </Text>

              {matchBio && (
                <Text style={styles.matchBio}>
                  {matchBio}
                </Text>
              )}
            </Section>

            <Text style={styles.text}>
              Jullie hebben allebei interesse in elkaar getoond.
              Dit is het moment om een gesprek te starten.
            </Text>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={chatUrl} style={styles.button}>
                Start een gesprek
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
              Je ontvangt deze email omdat je een nieuwe match hebt.
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
  matchCard: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  matchPhoto: {
    borderRadius: '60px',
    margin: '0 auto 16px',
    display: 'block',
    border: '3px solid #ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  matchName: {
    fontSize: '20px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 4px',
    lineHeight: '1.3'
  },
  matchCity: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 12px'
  },
  matchBio: {
    fontSize: '14px',
    color: BRAND.textColor,
    margin: '0',
    lineHeight: '1.5',
    fontStyle: 'italic'
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 24px',
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
