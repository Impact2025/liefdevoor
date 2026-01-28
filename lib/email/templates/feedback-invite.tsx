/**
 * Feedback Survey Invitation Email
 *
 * Invite migrated users to share their experience
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

interface FeedbackInviteEmailProps {
  userName: string
  surveyUrl: string
  daysActive: number
}

export default function FeedbackInviteEmail({
  userName = 'daar',
  surveyUrl = 'https://liefdevooriedereen.nl/feedback',
  daysActive = 3
}: FeedbackInviteEmailProps) {
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
              style={styles.logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.h1}>
              Hoi {userName}, hoe bevalt het?
            </Heading>

            <Text style={styles.paragraph}>
              Je bent nu {daysActive} dagen actief op Liefde Voor Iedereen.
              We zijn super benieuwd naar jouw ervaring!
            </Text>

            <Text style={styles.paragraph}>
              Zou je <strong>2 minuten</strong> willen nemen om een paar vragen te beantwoorden?
              Jouw feedback helpt ons enorm om de site nog beter te maken.
            </Text>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={surveyUrl} style={styles.button}>
                Deel je mening
              </Button>
            </Section>

            {/* Incentive */}
            <Section style={styles.incentiveBox}>
              <Text style={styles.incentiveText}>
                Als dank krijg je <strong>5 gratis SuperBerichten</strong> cadeau!
              </Text>
            </Section>

            <Text style={styles.paragraph}>
              Je antwoorden zijn anoniem en worden alleen gebruikt om onze service te verbeteren.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* What we want to know */}
          <Section style={styles.content}>
            <Text style={styles.h3}>We zijn benieuwd naar:</Text>
            <Text style={styles.listItem}>Hoe tevreden je bent met de nieuwe site</Text>
            <Text style={styles.listItem}>Wat je het beste vindt</Text>
            <Text style={styles.listItem}>Wat je mist van OogvoorLiefde</Text>
            <Text style={styles.listItem}>Hoe we kunnen verbeteren</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Signature */}
          <Section style={styles.content}>
            <Text style={styles.paragraph}>
              Alvast bedankt!
            </Text>
            <Text style={styles.signature}>
              Vincent
            </Text>
            <Text style={styles.signatureTitle}>
              Oprichter, Liefde Voor Iedereen
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              {BRAND.name}
            </Text>
            <Text style={styles.footerDisclaimer}>
              Je ontvangt deze mail omdat je recent je account hebt geactiveerd.
              <br />
              <Link href={`${BRAND.website}/settings/notifications`} style={styles.unsubscribeLink}>
                Email voorkeuren aanpassen
              </Link>
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
    padding: '32px 40px 24px',
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
    fontSize: '26px',
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
    fontSize: '18px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 48px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  incentiveBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    textAlign: 'center' as const
  },
  incentiveText: {
    fontSize: '15px',
    color: '#92400e',
    margin: '0'
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
    margin: '0'
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '14px',
    color: BRAND.textMuted,
    margin: '0 0 12px'
  },
  footerDisclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: '1.6'
  },
  unsubscribeLink: {
    color: BRAND.textMuted,
    textDecoration: 'underline'
  }
}
