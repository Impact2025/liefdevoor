/**
 * Migration Matches Waiting Email Template
 *
 * Day 3: Show potential matches to create urgency
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

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#e11d48',
  website: 'https://liefdevooriedereen.nl'
}

interface Match {
  name: string
  age: number
  city: string
  photo: string
}

interface MigrationMatchesWaitingEmailProps {
  userName: string
  landingUrl: string
  matchCount: number
  potentialMatches: Match[]
  couponCode: string
}

export default function MigrationMatchesWaitingEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  matchCount = 8,
  potentialMatches = [],
  couponCode = 'WELKOM-NAAM-VIP'
}: MigrationMatchesWaitingEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="180"
              height="auto"
              alt={BRAND.name}
            />
          </Section>

          {/* Content */}
          <Section style={styles.content}>

            {/* Attention Badge */}
            <Section style={styles.badgeSection}>
              <div style={styles.badge}>
                <Text style={styles.badgeText}>
                  💕 {matchCount} mensen wachten op je!
                </Text>
              </div>
            </Section>

            <Heading style={styles.h1}>
              {userName}, ze wachten op jou!
            </Heading>

            <Text style={styles.text}>
              Er zijn <strong>{matchCount} potentiële matches</strong> die
              graag met je in contact willen komen. Ze hebben hun profiel al
              aangemaakt op LiefdevoorIedereen.
            </Text>

            {/* Match Previews */}
            {potentialMatches.length > 0 && (
              <Section style={styles.matchesSection}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    {potentialMatches.slice(0, 3).map((match, index) => (
                      <td key={index} style={styles.matchCell}>
                        <Img
                          src={match.photo}
                          width="90"
                          height="90"
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
                <Text style={styles.moreMatches}>
                  + nog {matchCount - 3} anderen
                </Text>
              </Section>
            )}

            {/* Urgency Message */}
            <Section style={styles.urgencyBox}>
              <Text style={styles.urgencyText}>
                🕐 Deze matches zijn nu actief online.
                <br />
                Hoe sneller je activeert, hoe groter je kans op contact!
              </Text>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={landingUrl} style={styles.button}>
                Bekijk Je Matches
              </Button>
            </Section>

            <Text style={styles.couponReminder}>
              Vergeet niet: je code <strong>{couponCode}</strong> geeft
              je gratis Premium toegang!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Je ontvangt deze mail omdat je een account had op OogvoorLiefde.nl
            </Text>
            <a href={`${BRAND.website}/migration/unsubscribe`} style={styles.unsubscribeLink}>
              Geen emails meer ontvangen
            </a>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '16px',
    maxWidth: '600px',
    overflow: 'hidden' as const
  },
  header: {
    backgroundColor: '#fff1f2',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  content: {
    padding: '40px'
  },
  badgeSection: {
    textAlign: 'center' as const,
    marginBottom: '24px'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#fce7f3',
    borderRadius: '24px',
    padding: '12px 24px'
  },
  badgeText: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: '#be185d',
    margin: '0'
  },
  h1: {
    color: '#1f2937',
    fontSize: '28px',
    fontWeight: '700' as const,
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  text: {
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#4b5563',
    margin: '0 0 32px',
    textAlign: 'center' as const
  },
  matchesSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  matchCell: {
    textAlign: 'center' as const,
    padding: '0 8px',
    verticalAlign: 'top' as const
  },
  matchPhoto: {
    borderRadius: '50%',
    display: 'block',
    margin: '0 auto 8px',
    border: '4px solid #ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  matchName: {
    fontSize: '15px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: '0 0 4px'
  },
  matchCity: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0'
  },
  moreMatches: {
    fontSize: '14px',
    color: '#e11d48',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    margin: '16px 0 0'
  },
  urgencyBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px'
  },
  urgencyText: {
    fontSize: '15px',
    color: '#92400e',
    margin: '0',
    textAlign: 'center' as const,
    lineHeight: '1.5'
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginBottom: '24px'
  },
  button: {
    backgroundColor: '#e11d48',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    padding: '16px 40px',
    borderRadius: '8px',
    display: 'inline-block'
  },
  couponReminder: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '0'
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 8px'
  },
  unsubscribeLink: {
    fontSize: '12px',
    color: '#6b7280',
    textDecoration: 'underline'
  }
}
