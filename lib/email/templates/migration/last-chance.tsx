/**
 * Migration Last Chance Email Template
 *
 * Day 21: Final warning with strong urgency
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
  primaryColor: '#dc2626',
  website: 'https://liefdevooriedereen.nl'
}

interface MigrationLastChanceEmailProps {
  userName: string
  landingUrl: string
  daysRemaining: number
  photoCount: number
  messageCount: number
  matchCount: number
  couponCode: string
}

export default function MigrationLastChanceEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  daysRemaining = 7,
  photoCount = 12,
  messageCount = 47,
  matchCount = 5,
  couponCode = 'WELKOM-NAAM-VIP'
}: MigrationLastChanceEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Urgent Header */}
          <Section style={styles.urgentHeader}>
            <Text style={styles.urgentBadge}>
              ⚠️ LAATSTE KANS
            </Text>
          </Section>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="160"
              height="auto"
              alt={BRAND.name}
            />
          </Section>

          {/* Content */}
          <Section style={styles.content}>

            <Heading style={styles.h1}>
              {userName}, nog {daysRemaining} dagen!
            </Heading>

            <Text style={styles.text}>
              Dit is je <strong>laatste kans</strong> om je profiel te behouden.
              Over {daysRemaining} dagen worden je gegevens permanent verwijderd.
            </Text>

            {/* Data at Risk */}
            <Section style={styles.dataRiskBox}>
              <Text style={styles.dataRiskTitle}>
                🗑️ Dit gaat verloren:
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.dataItem}>
                    <span style={styles.dataIcon}>📸</span>
                    <span style={styles.dataValue}>{photoCount}</span>
                    <span style={styles.dataLabel}>foto's</span>
                  </td>
                  <td style={styles.dataItem}>
                    <span style={styles.dataIcon}>💬</span>
                    <span style={styles.dataValue}>{messageCount}</span>
                    <span style={styles.dataLabel}>berichten</span>
                  </td>
                  <td style={styles.dataItem}>
                    <span style={styles.dataIcon}>❤️</span>
                    <span style={styles.dataValue}>{matchCount}</span>
                    <span style={styles.dataLabel}>matches</span>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Countdown */}
            <Section style={styles.countdownBox}>
              <Text style={styles.countdownTitle}>
                Tijd over:
              </Text>
              <Text style={styles.countdownDays}>
                {daysRemaining} DAGEN
              </Text>
              <Text style={styles.countdownSubtext}>
                Daarna is het te laat
              </Text>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={landingUrl} style={styles.button}>
                Activeer NU - Red Je Data
              </Button>
            </Section>

            {/* Coupon Reminder */}
            <Section style={styles.couponReminder}>
              <Text style={styles.couponText}>
                Je krijgt nog steeds <strong>gratis Premium</strong> met code:
              </Text>
              <Text style={styles.couponCode}>
                {couponCode}
              </Text>
            </Section>

            {/* Reassurance */}
            <Text style={styles.reassurance}>
              Activeren duurt minder dan 2 minuten.
              <br />
              Geen betaling nodig.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Dit is een dringende herinnering over je OogvoorLiefde account.
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
    backgroundColor: '#fef2f2',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '16px',
    maxWidth: '600px',
    overflow: 'hidden' as const,
    border: '2px solid #dc2626'
  },
  urgentHeader: {
    backgroundColor: '#dc2626',
    padding: '12px 40px',
    textAlign: 'center' as const
  },
  urgentBadge: {
    fontSize: '16px',
    fontWeight: '700' as const,
    color: '#ffffff',
    margin: '0',
    letterSpacing: '1px'
  },
  header: {
    padding: '24px 40px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #fee2e2'
  },
  content: {
    padding: '40px'
  },
  h1: {
    color: '#dc2626',
    fontSize: '32px',
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
  dataRiskBox: {
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #fecaca'
  },
  dataRiskTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#991b1b',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  dataItem: {
    textAlign: 'center' as const,
    padding: '8px'
  },
  dataIcon: {
    display: 'block',
    fontSize: '24px',
    marginBottom: '4px'
  },
  dataValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '700' as const,
    color: '#dc2626'
  },
  dataLabel: {
    display: 'block',
    fontSize: '13px',
    color: '#991b1b'
  },
  countdownBox: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  countdownTitle: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px'
  },
  countdownDays: {
    fontSize: '48px',
    fontWeight: '800' as const,
    color: '#ffffff',
    margin: '0',
    fontFamily: 'monospace'
  },
  countdownSubtext: {
    fontSize: '14px',
    color: '#f87171',
    margin: '8px 0 0'
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginBottom: '24px'
  },
  button: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '700' as const,
    textDecoration: 'none',
    padding: '18px 48px',
    borderRadius: '8px',
    display: 'inline-block',
    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
  },
  couponReminder: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  couponText: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0 0 8px'
  },
  couponCode: {
    fontSize: '20px',
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    color: '#92400e',
    margin: '0'
  },
  reassurance: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.6'
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
