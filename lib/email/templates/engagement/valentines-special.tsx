/**
 * Valentine's Day Special Email Template
 *
 * Seasonal campaign to boost engagement around Valentine's Day
 * Optimized for LVB audience: warm, romantic, non-commercial
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
  valentineColor: '#C34C60', // Logo color for Valentine's
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface ValentinesSpecialEmailProps {
  userName: string
  suggestedMatches?: Array<{
    name: string
    age: number
    photo: string
    city: string
    sharedInterest?: string
  }>
}

export default function ValentinesSpecialEmail({
  userName = 'daar',
  suggestedMatches = []
}: ValentinesSpecialEmailProps) {
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
            {/* Valentine's Badge */}
            <Section style={styles.badgeSection}>
              <div style={styles.badge}>
                <Text style={styles.badgeText}>💕 Valentijnsdag Special</Text>
              </div>
            </Section>

            <Heading style={styles.h1}>
              De liefde is in de lucht, {userName}!
            </Heading>

            <Text style={styles.text}>
              Valentijnsdag komt eraan. Dit is het perfecte moment om
              iemand speciaal te leren kennen.
            </Text>

            {/* Heart Decoration */}
            <Section style={styles.heartsSection}>
              <Text style={styles.heartsText}>
                ❤️ 💕 💝 💖 💗
              </Text>
            </Section>

            {/* Suggested Matches */}
            {suggestedMatches.length > 0 && (
              <>
                <Text style={styles.matchesIntro}>
                  We hebben deze bijzondere mensen voor je uitgezocht:
                </Text>

                {suggestedMatches.map((match, index) => (
                  <Section key={index} style={styles.matchCard}>
                    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td style={styles.matchPhotoCell}>
                          <Img
                            src={match.photo}
                            width="100"
                            height="100"
                            style={styles.matchPhoto}
                            alt={match.name}
                          />
                        </td>
                        <td style={styles.matchInfoCell}>
                          <Text style={styles.matchName}>
                            {match.name}, {match.age}
                          </Text>
                          <Text style={styles.matchCity}>
                            📍 {match.city}
                          </Text>
                          {match.sharedInterest && (
                            <Text style={styles.matchInterest}>
                              ❤️ Houdt ook van {match.sharedInterest}
                            </Text>
                          )}
                        </td>
                      </tr>
                    </table>
                  </Section>
                ))}
              </>
            )}

            {/* Valentine's Message */}
            <Section style={styles.messageBox}>
              <Text style={styles.messageTitle}>
                💌 Stuur een Valentijnsgroet
              </Text>
              <Text style={styles.messageText}>
                Verras iemand met een lief bericht.
                Een klein gebaar kan een groot verschil maken!
              </Text>
            </Section>

            {/* Tips */}
            <Section style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>
                💡 Tips voor Valentijnsdag:
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.tipItem}>
                    ✓ Wees jezelf - authenticiteit is aantrekkelijk
                  </td>
                </tr>
                <tr>
                  <td style={styles.tipItem}>
                    ✓ Stel open vragen om een gesprek te starten
                  </td>
                </tr>
                <tr>
                  <td style={styles.tipItem}>
                    ✓ Complimenteer iets in hun profiel
                  </td>
                </tr>
              </table>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button
                href={`${BRAND.website}/discover`}
                style={styles.button}
              >
                Vind jouw Valentine
              </Button>
            </Section>

            {/* Closing Message */}
            <Text style={styles.closingText}>
              Iedereen verdient liefde. Misschien vind jij deze Valentijnsdag
              jouw perfecte match!
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
              Een speciale Valentijnsgroet van {BRAND.name}.
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
    backgroundColor: '#fff5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '8px',
    maxWidth: '600px',
    boxShadow: '0 1px 3px rgba(236, 72, 153, 0.2)',
    overflow: 'hidden' as const,
    border: `2px solid ${BRAND.valentineColor}`
  },
  header: {
    padding: '32px 40px 24px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #fce7f3 0%, #ffffff 100%)',
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
    backgroundColor: '#fce7f3',
    borderRadius: '20px',
    padding: '8px 20px',
    border: `2px solid ${BRAND.valentineColor}`
  },
  badgeText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#9f1239',
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
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  heartsSection: {
    textAlign: 'center' as const,
    margin: '0 0 32px',
    padding: '20px 0'
  },
  heartsText: {
    fontSize: '36px',
    margin: '0',
    letterSpacing: '8px'
  },
  matchesIntro: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND.textColor,
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  matchCard: {
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    padding: '20px',
    margin: '0 0 16px',
    border: `2px solid #fecdd3`
  },
  matchPhotoCell: {
    width: '100px',
    verticalAlign: 'middle' as const,
    paddingRight: '16px'
  },
  matchPhoto: {
    borderRadius: '50px',
    display: 'block',
    border: `3px solid ${BRAND.valentineColor}`,
    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.2)'
  },
  matchInfoCell: {
    verticalAlign: 'middle' as const
  },
  matchName: {
    fontSize: '20px',
    fontWeight: '700',
    color: BRAND.textColor,
    margin: '0 0 4px'
  },
  matchCity: {
    fontSize: '16px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  matchInterest: {
    fontSize: '15px',
    color: '#be123c',
    margin: '0',
    fontWeight: '500'
  },
  messageBox: {
    backgroundColor: '#fce7f3',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const
  },
  messageTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#9f1239',
    margin: '0 0 12px'
  },
  messageText: {
    fontSize: '16px',
    color: '#9f1239',
    margin: '0',
    lineHeight: '1.6'
  },
  tipsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px'
  },
  tipsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  tipItem: {
    fontSize: '15px',
    color: BRAND.textColor,
    padding: '6px 0',
    lineHeight: '1.6'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  button: {
    backgroundColor: BRAND.valentineColor,
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 40px',
    borderRadius: '8px'
  },
  closingText: {
    fontSize: '16px',
    color: BRAND.textMuted,
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.6',
    fontStyle: 'italic'
  },
  footer: {
    backgroundColor: '#fef2f2',
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
    color: BRAND.valentineColor,
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
