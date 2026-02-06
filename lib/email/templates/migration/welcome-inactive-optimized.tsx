/**
 * OPTIMIZED Migration Email for INACTIVE Segment
 *
 * Ultra-short, mobile-first, urgency-focused
 * Target: <150 words, 1 clear CTA, FOMO
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
  Section,
} from '@react-email/components'

interface Props {
  userName: string
  landingUrl: string
  couponCode: string
  daysRemaining: number
  memberYear: number
}

export default function MigrationWelcomeInactiveOptimized({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  couponCode = 'OOGVOOR2026',
  daysRemaining = 30,
  memberYear = 2020
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Urgent Badge */}
          <Section style={styles.urgentBadge}>
            <Text style={styles.urgentText}>
              ⏰ Nog {daysRemaining} dagen
            </Text>
          </Section>

          {/* Heading */}
          <Heading style={styles.h1}>
            {userName}, je account wordt verwijderd
          </Heading>

          {/* Short Message */}
          <Text style={styles.text}>
            OogvoorLiefde stopt. Je profiel van {memberYear} wordt permanent verwijderd
            tenzij je overzet naar ons nieuwe platform.
          </Text>

          {/* Value Proposition */}
          <Section style={styles.valueBox}>
            <Text style={styles.valueTitle}>Als je nu activeert krijg je:</Text>
            <Text style={styles.valueItem}>✅ 3 maanden gratis Premium</Text>
            <Text style={styles.valueItem}>✅ 3 gratis SuperBerichten</Text>
            <Text style={styles.valueItem}>✅ Al je data behouden</Text>
          </Section>

          {/* CTA */}
          <Section style={styles.ctaSection}>
            <Button href={landingUrl} style={styles.button}>
              Activeer Mijn Account →
            </Button>
          </Section>

          {/* Coupon Code */}
          <Text style={styles.couponText}>
            Code: <strong style={styles.couponCode}>{couponCode}</strong>
          </Text>

          {/* Social Proof */}
          <Text style={styles.socialProof}>
            847+ leden zijn al overgestapt
          </Text>

          {/* Footer */}
          <Text style={styles.footer}>
            Niet activeren? Je data wordt op {daysRemaining} februari permanent verwijderd.
          </Text>

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
    padding: '20px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 30px',
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '4px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  urgentText: {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '600',
    margin: 0,
    textAlign: 'center' as const,
  },
  h1: {
    color: '#1f2937',
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1.2',
    margin: '0 0 20px 0',
    textAlign: 'center' as const,
  },
  text: {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  },
  valueBox: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
  },
  valueTitle: {
    color: '#166534',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  valueItem: {
    color: '#15803d',
    fontSize: '15px',
    lineHeight: '1.8',
    margin: '4px 0',
  },
  ctaSection: {
    margin: '32px 0',
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: '#e11d48',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '18px',
    fontWeight: '600',
    padding: '16px 40px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  couponText: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '16px 0',
    textAlign: 'center' as const,
  },
  couponCode: {
    backgroundColor: '#fef3c7',
    borderRadius: '4px',
    color: '#92400e',
    fontFamily: 'monospace',
    fontSize: '16px',
    padding: '4px 8px',
  },
  socialProof: {
    color: '#9ca3af',
    fontSize: '13px',
    fontStyle: 'italic' as const,
    margin: '20px 0',
    textAlign: 'center' as const,
  },
  footer: {
    borderTop: '1px solid #e5e7eb',
    color: '#9ca3af',
    fontSize: '12px',
    marginTop: '32px',
    paddingTop: '20px',
    textAlign: 'center' as const,
  },
}
