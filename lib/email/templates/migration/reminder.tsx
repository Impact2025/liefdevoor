/**
 * Migration Reminder Email Template
 *
 * Day 7: General reminder with value proposition
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

interface MigrationReminderEmailProps {
  userName: string
  landingUrl: string
  couponCode: string
  daysRemaining: number
  photoCount: number
  messageCount: number
}

export default function MigrationReminderEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  couponCode = 'WELKOM-NAAM-VIP',
  daysRemaining = 21,
  photoCount = 12,
  messageCount = 47
}: MigrationReminderEmailProps) {
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

            <Heading style={styles.h1}>
              {userName}, je profiel wacht nog steeds!
            </Heading>

            <Text style={styles.text}>
              We merkten dat je je account nog niet hebt geactiveerd.
              Je <strong>OogvoorLiefde profiel</strong> is volledig klaar om
              overgezet te worden naar LiefdevoorIedereen.
            </Text>

            {/* Data Box */}
            <Section style={styles.dataBox}>
              <Text style={styles.dataTitle}>
                Dit staat klaar voor je:
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
                    <span style={styles.dataIcon}>⏰</span>
                    <span style={styles.dataValue}>{daysRemaining}</span>
                    <span style={styles.dataLabel}>dagen over</span>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Why Switch Section */}
            <Section style={styles.whySection}>
              <Text style={styles.whyTitle}>
                Waarom overstappen?
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.whyItem}>
                    <Text style={styles.whyIcon}>🚀</Text>
                    <Text style={styles.whyText}>
                      <strong>Modernere interface</strong>
                      <br />
                      Sneller en gebruiksvriendelijker
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={styles.whyItem}>
                    <Text style={styles.whyIcon}>🧠</Text>
                    <Text style={styles.whyText}>
                      <strong>Slimmere matching</strong>
                      <br />
                      AI-gestuurde suggesties
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={styles.whyItem}>
                    <Text style={styles.whyIcon}>🛡️</Text>
                    <Text style={styles.whyText}>
                      <strong>Veiliger daten</strong>
                      <br />
                      Verificatie van profielen
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={landingUrl} style={styles.button}>
                Activeer Mijn Profiel
              </Button>
            </Section>

            {/* Coupon Reminder */}
            <Section style={styles.couponBox}>
              <Text style={styles.couponLabel}>
                Je welkomstcode:
              </Text>
              <Text style={styles.couponCode}>
                {couponCode}
              </Text>
              <Text style={styles.couponValue}>
                Gratis Premium toegang
              </Text>
            </Section>

            <Text style={styles.reassurance}>
              Activeren duurt minder dan 2 minuten en is volledig gratis.
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
  dataBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px'
  },
  dataTitle: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#166534',
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
    color: '#166534'
  },
  dataLabel: {
    display: 'block',
    fontSize: '13px',
    color: '#15803d'
  },
  whySection: {
    marginBottom: '32px'
  },
  whyTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  whyItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  whyIcon: {
    fontSize: '24px',
    margin: '0',
    display: 'inline-block',
    verticalAlign: 'top',
    width: '40px'
  },
  whyText: {
    fontSize: '15px',
    color: '#4b5563',
    margin: '0',
    display: 'inline-block',
    lineHeight: '1.4'
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
  couponBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  couponLabel: {
    fontSize: '13px',
    color: '#92400e',
    margin: '0 0 4px',
    textTransform: 'uppercase' as const
  },
  couponCode: {
    fontSize: '20px',
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    color: '#92400e',
    margin: '0 0 4px'
  },
  couponValue: {
    fontSize: '14px',
    color: '#b45309',
    margin: '0'
  },
  reassurance: {
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
