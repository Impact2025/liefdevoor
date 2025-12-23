/**
 * Re-Engagement Email Template
 *
 * Win back dormant users with personalized content
 * Optimized for LVB audience: warm, welcoming, non-pushy
 */

import * as React from 'react'
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

// Brand configuration - Purple theme for retention emails
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#9333ea', // Purple for accessibility
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface ReEngagementEmailProps {
  userName: string
  daysSinceLastVisit: number
  newMatchesCount: number
  newMessagesCount: number
  featuredMatches?: Array<{
    name: string
    age: number
    photo: string
    city: string
  }>
  whatsNew?: string[] // New features since they left
}

export default function ReEngagementEmail({
  userName = 'daar',
  daysSinceLastVisit = 30,
  newMatchesCount = 8,
  newMessagesCount = 3,
  featuredMatches = [],
  whatsNew = []
}: ReEngagementEmailProps) {
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
            {/* Miss You Badge */}
            <Section style={styles.badgeSection}>
              <div style={styles.badge}>
                <Text style={styles.badgeText}>💙 We missen je</Text>
              </div>
            </Section>

            <Heading style={styles.h1}>
              Welkom terug, {userName}!
            </Heading>

            <Text style={styles.text}>
              Het is alweer <strong>{daysSinceLastVisit} dagen</strong> geleden dat we je zagen.
              Er is veel gebeurd sinds je weg was!
            </Text>

            {/* Activity Summary */}
            {(newMatchesCount > 0 || newMessagesCount > 0) && (
              <Section style={styles.activityBox}>
                <Text style={styles.activityTitle}>
                  Wat je gemist hebt:
                </Text>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  {newMatchesCount > 0 && (
                    <tr>
                      <td style={styles.activityItem}>
                        <span style={styles.activityIcon}>❤️</span>
                        <strong>{newMatchesCount}</strong> nieuwe matches wachten op je
                      </td>
                    </tr>
                  )}
                  {newMessagesCount > 0 && (
                    <tr>
                      <td style={styles.activityItem}>
                        <span style={styles.activityIcon}>💬</span>
                        <strong>{newMessagesCount}</strong> nieuwe berichten voor jou
                      </td>
                    </tr>
                  )}
                </table>
              </Section>
            )}

            {/* Featured Matches */}
            {featuredMatches.length > 0 && (
              <Section style={styles.matchesSection}>
                <Text style={styles.matchesTitle}>
                  Kijk wie er op je wacht:
                </Text>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    {featuredMatches.slice(0, 3).map((match, index) => (
                      <td key={index} style={styles.matchCell}>
                        <Img
                          src={match.photo}
                          width="80"
                          height="80"
                          style={styles.matchPhoto}
                          alt={match.name}
                        />
                        <Text style={styles.matchName}>
                          {match.name}, {match.age}
                        </Text>
                        <Text style={styles.matchCity}>
                          {match.city}
                        </Text>
                      </td>
                    ))}
                  </tr>
                </table>
              </Section>
            )}

            {/* What's New */}
            {whatsNew.length > 0 && (
              <Section style={styles.whatsNewBox}>
                <Text style={styles.whatsNewTitle}>
                  ✨ Nieuw op {BRAND.name}:
                </Text>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  {whatsNew.map((feature, index) => (
                    <tr key={index}>
                      <td style={styles.featureItem}>
                        <span style={styles.checkmark}>✓</span> {feature}
                      </td>
                    </tr>
                  ))}
                </table>
              </Section>
            )}

            {/* Encouragement */}
            <Section style={styles.encouragementBox}>
              <Text style={styles.encouragementText}>
                De liefde wacht niet. Kom terug en ontdek wie er op je let!
              </Text>
            </Section>

            {/* CTA Button - High contrast, large */}
            <Section style={styles.ctaSection}>
              <Button
                href={`${BRAND.website}/discover`}
                style={styles.button}
              >
                Kom terug naar {BRAND.name}
              </Button>
            </Section>

            {/* Secondary CTA */}
            {newMessagesCount > 0 && (
              <Section style={styles.secondaryCta}>
                <Text style={styles.secondaryText}>
                  Of lees eerst je berichten:
                </Text>
                <Button
                  href={`${BRAND.website}/messages`}
                  style={styles.secondaryButton}
                >
                  Bekijk {newMessagesCount} {newMessagesCount === 1 ? 'bericht' : 'berichten'}
                </Button>
              </Section>
            )}

            {/* Reassurance */}
            <Text style={styles.reassurance}>
              Je profiel is precies zoals je het achterliet.
              <br />
              Start waar je gebleven was.
            </Text>
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
              Je ontvangt deze mail omdat we je missen.
              <br />
              <a href={`${BRAND.website}/settings/notifications`} style={styles.unsubscribeLink}>
                Email instellingen wijzigen
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
  badgeSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#dbeafe',
    borderRadius: '20px',
    padding: '8px 20px'
  },
  badgeText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af',
    margin: '0'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '28px',
    fontWeight: '600',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  text: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 32px',
    textAlign: 'center' as const
  },
  activityBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  activityTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#065f46',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  activityItem: {
    fontSize: '16px',
    color: '#065f46',
    padding: '8px 0',
    lineHeight: '1.6',
    textAlign: 'center' as const
  },
  activityIcon: {
    fontSize: '20px',
    marginRight: '8px'
  },
  matchesSection: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  matchesTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 20px',
    textAlign: 'center' as const
  },
  matchCell: {
    textAlign: 'center' as const,
    padding: '0 8px',
    verticalAlign: 'top' as const
  },
  matchPhoto: {
    borderRadius: '40px',
    display: 'block',
    margin: '0 auto 8px',
    border: '3px solid #ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  matchName: {
    fontSize: '14px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 4px'
  },
  matchCity: {
    fontSize: '12px',
    color: BRAND.textMuted,
    margin: '0'
  },
  whatsNewBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  whatsNewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  featureItem: {
    fontSize: '15px',
    color: '#92400e',
    padding: '6px 0',
    lineHeight: '1.6'
  },
  checkmark: {
    color: '#059669',
    fontWeight: '700',
    marginRight: '8px'
  },
  encouragementBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '20px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  encouragementText: {
    fontSize: '16px',
    color: BRAND.textColor,
    margin: '0',
    lineHeight: '1.6',
    fontWeight: '500'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  button: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 40px',
    borderRadius: '8px'
  },
  secondaryCta: {
    textAlign: 'center' as const,
    margin: '0 0 32px'
  },
  secondaryText: {
    fontSize: '16px',
    color: BRAND.textMuted,
    margin: '0 0 12px'
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    color: BRAND.primaryColor,
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
    borderRadius: '8px',
    border: `2px solid ${BRAND.primaryColor}`
  },
  reassurance: {
    fontSize: '14px',
    color: BRAND.textMuted,
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.6'
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
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  footerEmail: {
    fontSize: '14px',
    margin: '0 0 16px'
  },
  footerLink: {
    color: BRAND.primaryColor,
    textDecoration: 'none'
  },
  footerDisclaimer: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: '1.6'
  },
  unsubscribeLink: {
    color: BRAND.textMuted,
    textDecoration: 'underline'
  }
}
