/**
 * Valentijnsdag Comeback Email - INACTIVE Users
 *
 * Offer: Gratis 1 maand Premium (na compleet profiel)
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
  Hr
} from '@react-email/components'

const BRAND = {
  name: 'Liefde Voor Iedereen',
  primaryColor: '#e11d48',
  website: 'https://liefdevooriedereen.nl'
}

interface ValentinesComebackEmailProps {
  userName: string
  signupUrl: string
}

export default function ValentinesComebackEmail({
  userName = 'daar',
  signupUrl = 'https://liefdevooriedereen.nl'
}: ValentinesComebackEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Valentine Header */}
          <Section style={styles.valentineHeader}>
            <Text style={styles.valentineEmoji}>💝</Text>
            <Heading style={styles.valentineTitle}>
              Valentijnsdag Special
            </Heading>
          </Section>

          {/* Content */}
          <Section style={styles.content}>

            <Heading style={styles.h1}>
              {userName}, je comeback wacht!
            </Heading>

            <Text style={styles.text}>
              Het is <strong>Valentijnsdag</strong> – de perfecte dag voor een nieuwe start.
            </Text>

            <Text style={styles.text}>
              We missen je op LiefdevoorIedereen, en we hebben iets speciaals voor je...
            </Text>

            {/* Offer Box */}
            <Section style={styles.offerBox}>
              <Text style={styles.offerTitle}>
                🎁 Je Valentijnscadeau
              </Text>
              <Heading style={styles.offerHeading}>
                1 Maand Premium
                <br />
                <span style={styles.offerFree}>100% GRATIS</span>
              </Heading>
              <Text style={styles.offerSubtext}>
                Geen betaalgegevens vereist
                <br />
                Geen automatische verlenging
                <br />
                Geen verplichtingen
              </Text>
            </Section>

            {/* What You Get */}
            <Section style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>
                Wat krijg je?
              </Text>

              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>✨</Text>
                    <Text style={styles.benefitText}>
                      <strong>Onbeperkt liken</strong>
                      <br />
                      <span style={styles.benefitSubtext}>Zoveel matches als je wilt</span>
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>💬</Text>
                    <Text style={styles.benefitText}>
                      <strong>Onbeperkt berichten</strong>
                      <br />
                      <span style={styles.benefitSubtext}>Chat met al je matches</span>
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>👀</Text>
                    <Text style={styles.benefitText}>
                      <strong>Zie wie jou leuk vindt</strong>
                      <br />
                      <span style={styles.benefitSubtext}>Skip het giswerk</span>
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>🚀</Text>
                    <Text style={styles.benefitText}>
                      <strong>10 gratis SuperMessages</strong>
                      <br />
                      <span style={styles.benefitSubtext}>Val direct op</span>
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* The Catch */}
            <Section style={styles.catchBox}>
              <Text style={styles.catchTitle}>
                ✅ Eén simpele voorwaarde:
              </Text>
              <Text style={styles.catchText}>
                Maak je profiel compleet met minimaal 4 foto's en een leuke bio.
              </Text>
              <Text style={styles.catchWhy}>
                <em>Waarom? Omdat complete profielen 10× meer matches krijgen!</em>
              </Text>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={signupUrl} style={styles.button}>
                Claim Je Gratis Maand 💝
              </Button>
              <Text style={styles.ctaSubtext}>
                Activeer binnen 48 uur
              </Text>
            </Section>

            {/* Urgency */}
            <Section style={styles.urgencyBox}>
              <Text style={styles.urgencyText}>
                ⏰ <strong>Valentijnsdag Special</strong> – Geldig t/m 16 februari
              </Text>
            </Section>

            <Hr style={styles.divider} />

            {/* Footer Message */}
            <Text style={styles.footerMessage}>
              Dit is jouw kans om terug te komen en misschien wel <em>de ware</em> te vinden.
              <br />
              <br />
              Geen kosten. Geen risico. Gewoon liefde zoeken.
            </Text>

            <Text style={styles.signature}>
              Veel liefde,
              <br />
              Het Liefde Voor Iedereen team 💕
            </Text>

          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Je ontvangt deze mail omdat je ooit een account hebt aangemaakt op OogvoorLiefde.nl
            </Text>
            <Text style={styles.footerText}>
              Deze actie is beperkt geldig tot 16 februari 2026
            </Text>
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
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  valentineHeader: {
    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    padding: '32px',
    textAlign: 'center' as const
  },
  valentineEmoji: {
    fontSize: '48px',
    margin: '0 0 8px'
  },
  valentineTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '700' as const,
    margin: '0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px'
  },
  content: {
    padding: '40px'
  },
  h1: {
    color: '#1f2937',
    fontSize: '32px',
    fontWeight: '700' as const,
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.2'
  },
  text: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#4b5563',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  offerBox: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '16px',
    padding: '32px',
    margin: '32px 0',
    textAlign: 'center' as const,
    border: '3px solid #f59e0b'
  },
  offerTitle: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
    letterSpacing: '1px'
  },
  offerHeading: {
    fontSize: '36px',
    fontWeight: '800' as const,
    color: '#92400e',
    margin: '0 0 16px',
    lineHeight: '1.2'
  },
  offerFree: {
    color: '#dc2626',
    fontSize: '28px'
  },
  offerSubtext: {
    fontSize: '14px',
    color: '#78350f',
    margin: '0',
    lineHeight: '1.8'
  },
  benefitsSection: {
    margin: '32px 0'
  },
  benefitsTitle: {
    fontSize: '20px',
    fontWeight: '700' as const,
    color: '#1f2937',
    margin: '0 0 20px',
    textAlign: 'center' as const
  },
  benefitItem: {
    padding: '16px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  benefitIcon: {
    fontSize: '28px',
    margin: '0',
    display: 'inline-block',
    verticalAlign: 'top',
    width: '50px'
  },
  benefitText: {
    fontSize: '16px',
    color: '#1f2937',
    margin: '0',
    display: 'inline-block',
    lineHeight: '1.5',
    width: 'calc(100% - 50px)'
  },
  benefitSubtext: {
    color: '#6b7280',
    fontSize: '14px'
  },
  catchBox: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
    textAlign: 'center' as const
  },
  catchTitle: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: '#166534',
    margin: '0 0 12px'
  },
  catchText: {
    fontSize: '16px',
    color: '#15803d',
    margin: '0 0 12px',
    lineHeight: '1.6'
  },
  catchWhy: {
    fontSize: '14px',
    color: '#16a34a',
    margin: '0'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '40px 0 24px'
  },
  button: {
    backgroundColor: '#e11d48',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '700' as const,
    textDecoration: 'none',
    padding: '18px 48px',
    borderRadius: '12px',
    display: 'inline-block',
    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  ctaSubtext: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '12px 0 0',
    fontStyle: 'italic' as const
  },
  urgencyBox: {
    backgroundColor: '#fef2f2',
    border: '2px dashed #e11d48',
    borderRadius: '8px',
    padding: '16px',
    margin: '24px 0',
    textAlign: 'center' as const
  },
  urgencyText: {
    fontSize: '15px',
    color: '#be123c',
    margin: '0'
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '32px 0'
  },
  footerMessage: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '0 0 24px',
    lineHeight: '1.6'
  },
  signature: {
    fontSize: '16px',
    color: '#4b5563',
    textAlign: 'center' as const,
    margin: '0',
    fontStyle: 'italic' as const
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 4px'
  }
}
