/**
 * Birthday Email Template
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

interface BirthdayEmailProps {
  userName: string
  age: number
  newMatchesCount: number
  featuredMatch?: {
    name: string
    age: number
    photo: string
    city: string
  }
  isPremium: boolean
}

export default function BirthdayEmail({
  userName = 'daar',
  age = 25,
  newMatchesCount = 5,
  featuredMatch,
  isPremium = false
}: BirthdayEmailProps) {
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
              Gefeliciteerd, {userName}
            </Heading>

            <Text style={styles.ageText}>
              Vandaag word je {age} jaar
            </Text>

            <Text style={styles.text}>
              Het hele team van {BRAND.name} wenst je een fantastische verjaardag.
              Moge dit nieuwe levensjaar vol mooie ontmoetingen zijn.
            </Text>

            {/* New Matches Section */}
            {newMatchesCount > 0 && (
              <Section style={styles.highlightBox}>
                <Text style={styles.highlightTitle}>
                  Verjaardagsverrassing
                </Text>
                <Text style={styles.highlightText}>
                  We hebben {newMatchesCount} nieuwe matches voor je gevonden.
                </Text>
              </Section>
            )}

            {/* Featured Match */}
            {featuredMatch && (
              <Section style={styles.matchCard}>
                <Img
                  src={featuredMatch.photo}
                  width="80"
                  height="80"
                  style={styles.matchPhoto}
                  alt={featuredMatch.name}
                />
                <Text style={styles.matchName}>
                  {featuredMatch.name}, {featuredMatch.age}
                </Text>
                <Text style={styles.matchCity}>
                  {featuredMatch.city}
                </Text>
              </Section>
            )}

            {/* Premium Benefits */}
            {isPremium && (
              <Section style={styles.premiumBox}>
                <Text style={styles.premiumTitle}>
                  Premium verjaardagsvoordelen
                </Text>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={styles.benefitItem}>Gratis boost voor extra zichtbaarheid</td>
                  </tr>
                  <tr>
                    <td style={styles.benefitItem}>Ongelimiteerde likes vandaag</td>
                  </tr>
                  <tr>
                    <td style={styles.benefitItem}>Speciale verjaardagsbadge op je profiel</td>
                  </tr>
                </table>
                <Text style={styles.premiumNote}>
                  Je voordelen zijn automatisch geactiveerd.
                </Text>
              </Section>
            )}

            {/* Upgrade CTA for non-premium */}
            {!isPremium && newMatchesCount > 0 && (
              <Section style={styles.upgradeBox}>
                <Text style={styles.upgradeTitle}>
                  Verjaardagsaanbieding
                </Text>
                <Text style={styles.upgradeText}>
                  Upgrade vandaag naar Premium met 50% korting.
                  Ontgrendel meer matches en ongelimiteerd chatten.
                </Text>
                <Text style={styles.upgradeExpiry}>
                  Aanbieding geldig tot middernacht.
                </Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button
                href={`${BRAND.website}/discover`}
                style={styles.button}
              >
                Bekijk je matches
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
              Je ontvangt deze email omdat het je verjaardag is.
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
  ageText: {
    fontSize: '18px',
    color: BRAND.primaryColor,
    textAlign: 'center' as const,
    margin: '0 0 24px',
    fontWeight: '500'
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  highlightBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  highlightTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 8px'
  },
  highlightText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0'
  },
  matchCard: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  matchPhoto: {
    borderRadius: '40px',
    margin: '0 auto 12px',
    display: 'block',
    border: '3px solid #ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  matchName: {
    fontSize: '16px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 4px'
  },
  matchCity: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0'
  },
  premiumBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 24px'
  },
  premiumTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 12px',
    textAlign: 'center' as const
  },
  benefitItem: {
    fontSize: '14px',
    color: '#92400e',
    padding: '4px 0',
    lineHeight: '1.5'
  },
  premiumNote: {
    fontSize: '13px',
    color: '#b45309',
    margin: '12px 0 0',
    textAlign: 'center' as const,
    fontStyle: 'italic'
  },
  upgradeBox: {
    backgroundColor: BRAND.bgColor,
    border: `1px solid ${BRAND.borderColor}`,
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  upgradeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 8px'
  },
  upgradeText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 8px',
    lineHeight: '1.5'
  },
  upgradeExpiry: {
    fontSize: '13px',
    color: BRAND.primaryColor,
    margin: '0',
    fontWeight: '500'
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
