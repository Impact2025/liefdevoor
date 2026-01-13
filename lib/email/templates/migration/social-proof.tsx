/**
 * Migration Social Proof Email Template
 *
 * Day 14: Show success stories and statistics
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

interface Testimonial {
  name: string
  age: number
  city: string
  quote: string
  photo?: string
}

interface MigrationSocialProofEmailProps {
  userName: string
  landingUrl: string
  couponCode: string
  activatedCount: number
  matchesCreated: number
  testimonials: Testimonial[]
}

export default function MigrationSocialProofEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  couponCode = 'WELKOM-NAAM-VIP',
  activatedCount = 2847,
  matchesCreated = 512,
  testimonials = [
    {
      name: 'Linda',
      age: 34,
      city: 'Utrecht',
      quote: 'De overstap was super makkelijk. Binnen een week had ik al 3 leuke dates!'
    },
    {
      name: 'Peter',
      age: 41,
      city: 'Amsterdam',
      quote: 'Veel betere matches dan voorheen. De AI werkt echt goed.'
    },
    {
      name: 'Sandra',
      age: 29,
      city: 'Rotterdam',
      quote: 'Eindelijk een platform waar mensen serieus zijn. Aanrader!'
    }
  ]
}: MigrationSocialProofEmailProps) {
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

            {/* Stats Banner */}
            <Section style={styles.statsBanner}>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.statItem}>
                    <Text style={styles.statValue}>{activatedCount.toLocaleString('nl-NL')}</Text>
                    <Text style={styles.statLabel}>Overgezet</Text>
                  </td>
                  <td style={styles.statItem}>
                    <Text style={styles.statValue}>{matchesCreated.toLocaleString('nl-NL')}</Text>
                    <Text style={styles.statLabel}>Nieuwe matches</Text>
                  </td>
                  <td style={styles.statItem}>
                    <Text style={styles.statValue}>4.8</Text>
                    <Text style={styles.statLabel}>Gemiddelde score</Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Heading style={styles.h1}>
              {userName}, je oud-collega's zijn al actief!
            </Heading>

            <Text style={styles.text}>
              Duizenden OogvoorLiefde leden hebben hun account al geactiveerd.
              Dit is wat ze zeggen:
            </Text>

            {/* Testimonials */}
            <Section style={styles.testimonialSection}>
              {testimonials.map((testimonial, index) => (
                <Section key={index} style={styles.testimonialCard}>
                  <Text style={styles.testimonialQuote}>
                    "{testimonial.quote}"
                  </Text>
                  <Text style={styles.testimonialAuthor}>
                    - {testimonial.name}, {testimonial.age} uit {testimonial.city}
                  </Text>
                </Section>
              ))}
            </Section>

            {/* FOMO Box */}
            <Section style={styles.fomoBox}>
              <Text style={styles.fomoTitle}>
                Mis de boot niet!
              </Text>
              <Text style={styles.fomoText}>
                Elke dag activeren gemiddeld <strong>127 nieuwe leden</strong>.
                Hoe langer je wacht, hoe meer matches je misloopt.
              </Text>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={landingUrl} style={styles.button}>
                Sluit Je Aan
              </Button>
            </Section>

            {/* Coupon */}
            <Text style={styles.couponReminder}>
              Vergeet niet: code <strong>{couponCode}</strong> geeft je
              gratis Premium toegang!
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
  statsBanner: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px'
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '0 8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '800' as const,
    color: '#ffffff',
    margin: '0 0 4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  content: {
    padding: '40px'
  },
  h1: {
    color: '#1f2937',
    fontSize: '26px',
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
  testimonialSection: {
    marginBottom: '32px'
  },
  testimonialCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    borderLeft: '4px solid #e11d48'
  },
  testimonialQuote: {
    fontSize: '16px',
    fontStyle: 'italic' as const,
    color: '#374151',
    margin: '0 0 12px',
    lineHeight: '1.5'
  },
  testimonialAuthor: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
    fontWeight: '500' as const
  },
  fomoBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '32px',
    textAlign: 'center' as const
  },
  fomoTitle: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: '#92400e',
    margin: '0 0 8px'
  },
  fomoText: {
    fontSize: '15px',
    color: '#92400e',
    margin: '0',
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
