/**
 * Detractor Follow-Up Email
 *
 * Sent to users who gave a low NPS score (0-6)
 * Personal outreach from the founder to understand their concerns
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
  Section,
  Hr,
  Link
} from '@react-email/components'

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#e11d48',
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#fff1f2',
  website: 'https://liefdevooriedereen.nl'
}

interface FeedbackFollowupEmailProps {
  userName: string
  npsScore: number
  improvements?: string
  calendarUrl?: string
}

export default function FeedbackFollowupEmail({
  userName = 'daar',
  npsScore = 5,
  improvements = '',
  calendarUrl = 'https://calendly.com/liefdevooriedereen/feedback'
}: FeedbackFollowupEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header - More Personal */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="140"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.h1}>
              {userName}, ik wil graag even persoonlijk contact
            </Heading>

            <Text style={styles.paragraph}>
              Bedankt voor het invullen van onze feedback survey. Ik zag dat je ervaring
              met Liefde Voor Iedereen nog niet is wat het zou moeten zijn.
            </Text>

            <Text style={styles.paragraph}>
              <strong>Dat vind ik oprecht jammer.</strong>
            </Text>

            <Text style={styles.paragraph}>
              Als oprichter voel ik me persoonlijk verantwoordelijk voor jouw ervaring.
              Ik zou graag willen begrijpen wat er beter kan, zodat we het voor jou
              (en anderen) kunnen verbeteren.
            </Text>

            {improvements && (
              <Section style={styles.feedbackBox}>
                <Text style={styles.feedbackLabel}>Je gaf aan:</Text>
                <Text style={styles.feedbackText}>"{improvements}"</Text>
              </Section>
            )}

            <Text style={styles.paragraph}>
              Zou je <strong>10 minuten</strong> willen bellen of videochatten?
              Ik waardeer je eerlijkheid enorm en wil graag luisteren.
            </Text>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={calendarUrl} style={styles.button}>
                Plan een gesprek in
              </Button>
            </Section>

            <Text style={styles.smallText}>
              Of mail me direct op{' '}
              <Link href="mailto:vincent@liefdevooriedereen.nl" style={styles.link}>
                vincent@liefdevooriedereen.nl
              </Link>
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* What we can discuss */}
          <Section style={styles.content}>
            <Text style={styles.h3}>Wat ik graag zou willen bespreken:</Text>
            <Text style={styles.listItem}>Waar liep je precies tegenaan?</Text>
            <Text style={styles.listItem}>Wat had je verwacht van de migratie?</Text>
            <Text style={styles.listItem}>Hoe kunnen we het goedmaken?</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Signature */}
          <Section style={styles.content}>
            <Text style={styles.paragraph}>
              Nogmaals bedankt voor je eerlijkheid. Alleen zo kunnen we beter worden.
            </Text>
            <Text style={styles.signature}>
              Vincent
            </Text>
            <Text style={styles.signatureTitle}>
              Oprichter, Liefde Voor Iedereen
              <br />
              <Link href="tel:+31612345678" style={styles.link}>06-12345678</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              {BRAND.name}
            </Text>
            <Text style={styles.footerDisclaimer}>
              Je ontvangt deze persoonlijke mail omdat je recent feedback hebt gegeven.
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
    borderRadius: '16px',
    maxWidth: '600px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden' as const
  },
  header: {
    backgroundColor: BRAND.bgColor,
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  logo: {
    display: 'block',
    margin: '0 auto'
  },
  content: {
    padding: '32px 40px'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '700' as const,
    margin: '0 0 20px',
    lineHeight: '1.3'
  },
  h3: {
    color: BRAND.textColor,
    fontSize: '16px',
    fontWeight: '600' as const,
    margin: '0 0 12px'
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: BRAND.textMuted,
    margin: '0 0 16px'
  },
  smallText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    textAlign: 'center' as const,
    margin: '16px 0 0'
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textMuted,
    margin: '0 0 8px',
    paddingLeft: '16px'
  },
  ctaSection: {
    textAlign: 'center' as const,
    padding: '24px 0'
  },
  button: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  feedbackBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px'
  },
  feedbackLabel: {
    fontSize: '12px',
    color: '#92400e',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  feedbackText: {
    fontSize: '15px',
    color: '#78350f',
    margin: '0',
    fontStyle: 'italic' as const
  },
  divider: {
    borderColor: '#e5e7eb',
    borderWidth: '1px 0 0 0',
    margin: '0'
  },
  signature: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: BRAND.textColor,
    margin: '8px 0 4px'
  },
  signatureTitle: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0',
    lineHeight: '1.6'
  },
  link: {
    color: BRAND.primaryColor,
    textDecoration: 'underline'
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  footerDisclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0'
  }
}
