/**
 * Migration Features Email Template
 *
 * Day 10: Highlight new platform features
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
  primaryColor: '#9333ea',
  website: 'https://liefdevooriedereen.nl'
}

interface MigrationFeaturesEmailProps {
  userName: string
  landingUrl: string
  couponCode: string
}

export default function MigrationFeaturesEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  couponCode = 'WELKOM-NAAM-VIP'
}: MigrationFeaturesEmailProps) {
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
            <Text style={styles.headerBadge}>
              Nieuw Platform
            </Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>

            <Heading style={styles.h1}>
              Ontdek wat er nieuw is, {userName}!
            </Heading>

            <Text style={styles.text}>
              LiefdevoorIedereen is compleet vernieuwd met functies
              die je dating ervaring naar een hoger niveau tillen.
            </Text>

            {/* Features Grid */}
            <Section style={styles.featuresSection}>

              {/* Feature 1: AI Matching */}
              <Section style={styles.featureCard}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={styles.featureIconCell}>
                      <Text style={styles.featureIcon}>🧠</Text>
                    </td>
                    <td style={styles.featureContent}>
                      <Text style={styles.featureTitle}>
                        AI-Powered Matching
                      </Text>
                      <Text style={styles.featureDesc}>
                        Onze slimme algoritmes leren van je voorkeuren
                        en suggereren steeds betere matches. Tot 3x
                        meer relevante connecties.
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Feature 2: Voice Messages */}
              <Section style={styles.featureCard}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={styles.featureIconCell}>
                      <Text style={styles.featureIcon}>🎤</Text>
                    </td>
                    <td style={styles.featureContent}>
                      <Text style={styles.featureTitle}>
                        Voice Berichten
                      </Text>
                      <Text style={styles.featureDesc}>
                        Laat je stem horen! Voice messages maken het
                        gesprek persoonlijker en authentieker dan
                        alleen tekst.
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Feature 3: Verified Profiles */}
              <Section style={styles.featureCard}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={styles.featureIconCell}>
                      <Text style={styles.featureIcon}>✅</Text>
                    </td>
                    <td style={styles.featureContent}>
                      <Text style={styles.featureTitle}>
                        Geverifieerde Profielen
                      </Text>
                      <Text style={styles.featureDesc}>
                        Weet zeker dat je met echte mensen praat.
                        Verificatie met foto en ID voor een veilige
                        dating ervaring.
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Feature 4: Video Dates */}
              <Section style={styles.featureCard}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={styles.featureIconCell}>
                      <Text style={styles.featureIcon}>📹</Text>
                    </td>
                    <td style={styles.featureContent}>
                      <Text style={styles.featureTitle}>
                        Video Dates
                      </Text>
                      <Text style={styles.featureDesc}>
                        Maak kennis via video voordat je afspreekt.
                        Veilig, makkelijk, en je bespaart tijd door
                        de klik te voelen.
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Feature 5: Smart Filters */}
              <Section style={styles.featureCard}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={styles.featureIconCell}>
                      <Text style={styles.featureIcon}>🎯</Text>
                    </td>
                    <td style={styles.featureContent}>
                      <Text style={styles.featureTitle}>
                        Geavanceerde Filters
                      </Text>
                      <Text style={styles.featureDesc}>
                        Filter op leeftijd, locatie, interesses,
                        levensstijl en nog veel meer. Vind precies
                        wie je zoekt.
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Text style={styles.ctaText}>
                Klaar om deze functies te ervaren?
              </Text>
              <Button href={landingUrl} style={styles.button}>
                Start Met Ontdekken
              </Button>
            </Section>

            {/* Coupon */}
            <Section style={styles.couponSection}>
              <Text style={styles.couponText}>
                Gebruik code <strong>{couponCode}</strong> voor
                gratis Premium en probeer alle functies!
              </Text>
            </Section>

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
    backgroundColor: '#f5f3ff',
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
    background: 'linear-gradient(135deg, #9333ea 0%, #e11d48 100%)',
    padding: '32px 40px',
    textAlign: 'center' as const
  },
  headerBadge: {
    fontSize: '13px',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '16px',
    padding: '6px 16px',
    display: 'inline-block',
    marginTop: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px'
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
  featuresSection: {
    marginBottom: '32px'
  },
  featureCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  featureIconCell: {
    width: '56px',
    verticalAlign: 'top' as const
  },
  featureIcon: {
    fontSize: '32px',
    margin: '0'
  },
  featureContent: {
    verticalAlign: 'top' as const,
    paddingLeft: '12px'
  },
  featureTitle: {
    fontSize: '17px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: '0 0 6px'
  },
  featureDesc: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#6b7280',
    margin: '0'
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginBottom: '24px'
  },
  ctaText: {
    fontSize: '16px',
    color: '#4b5563',
    margin: '0 0 16px'
  },
  button: {
    background: 'linear-gradient(135deg, #9333ea 0%, #e11d48 100%)',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    padding: '16px 40px',
    borderRadius: '8px',
    display: 'inline-block'
  },
  couponSection: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center' as const
  },
  couponText: {
    fontSize: '14px',
    color: '#92400e',
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
