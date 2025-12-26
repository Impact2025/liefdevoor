/**
 * Subscription Expired Email Template
 *
 * Sent when subscription has expired
 */

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Img
} from '@react-email/components'

// Brand configuration
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface SubscriptionExpiredEmailProps {
  userName: string
  planName: string
  expiredDate: string
  renewUrl?: string
  specialOffer?: {
    discount: string
    validUntil: string
  }
}

export default function SubscriptionExpiredEmail({
  userName = 'daar',
  planName = 'Premium',
  expiredDate = '26 december 2025',
  renewUrl = 'https://liefdevooriedereen.nl/subscription',
  specialOffer
}: SubscriptionExpiredEmailProps) {
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
            {/* Icon */}
            <Section style={styles.iconSection}>
              <div style={styles.icon}>😢</div>
            </Section>

            <Heading style={styles.h1}>
              Je abonnement is verlopen
            </Heading>

            <Text style={styles.greeting}>
              Hoi {userName},
            </Text>

            <Text style={styles.text}>
              Je {planName} abonnement is op {expiredDate} verlopen. Je account is teruggezet naar het gratis plan.
            </Text>

            {/* What Changed */}
            <Section style={styles.changesBox}>
              <Text style={styles.changesTitle}>
                Wat betekent dit voor jou?
              </Text>
              <ul style={styles.changesList}>
                <li style={styles.changeItem}>
                  ✓ <strong>Je profiel blijft actief</strong> - Matches kunnen je nog steeds vinden
                </li>
                <li style={styles.changeItem}>
                  ✓ <strong>Bestaande matches behouden</strong> - Je kunt nog steeds chatten
                </li>
                <li style={styles.changeItem}>
                  ✗ <strong>Beperkte likes</strong> - Maximaal 25 likes per dag
                </li>
                <li style={styles.changeItem}>
                  ✗ <strong>Geen premium functies</strong> - Super likes, passport, etc.
                </li>
              </ul>
            </Section>

            <Text style={styles.text}>
              We missen je nu al! Kom terug en ontdek weer onbeperkte mogelijkheden. ❤️
            </Text>

            {/* Special Offer (if applicable) */}
            {specialOffer && (
              <Section style={styles.offerBox}>
                <Text style={styles.offerBadge}>
                  🎁 SPECIALE AANBIEDING
                </Text>
                <Text style={styles.offerTitle}>
                  Kom terug met {specialOffer.discount} korting!
                </Text>
                <Text style={styles.offerText}>
                  Alleen geldig tot {specialOffer.validUntil}
                </Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={renewUrl} style={styles.button}>
                {specialOffer ? 'Claim je korting' : 'Premium opnieuw activeren'}
              </Button>
            </Section>

            {/* Why Return */}
            <Section style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>
                Waarom premium leden gelukkiger zijn:
              </Text>
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>
                  💝 <strong>3x meer matches</strong> - Door onbeperkte likes en super likes
                </li>
                <li style={styles.benefitItem}>
                  ⚡ <strong>Sneller connecties</strong> - Zie direct wie jou leuk vindt
                </li>
                <li style={styles.benefitItem}>
                  🌍 <strong>Geen grenzen</strong> - Date overal met de passport feature
                </li>
              </ul>
            </Section>

            <Text style={styles.mutedText}>
              We hopen je snel weer te zien! 💕
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
              Vragen over je abonnement?
              <br />
              <a href={`${BRAND.website}/support`} style={styles.footerLink}>
                Contacteer support
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
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '8px',
    maxWidth: '600px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden' as const
  },
  header: {
    padding: '32px 40px 24px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${BRAND.borderColor}`
  },
  logo: {
    display: 'block',
    margin: '0 auto'
  },
  content: {
    padding: '40px'
  },
  iconSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  icon: {
    fontSize: '48px',
    lineHeight: '1'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  greeting: {
    fontSize: '15px',
    color: BRAND.textColor,
    margin: '0 0 16px',
    lineHeight: '1.6'
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  changesBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '24px',
    margin: '0 0 24px'
  },
  changesTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 16px'
  },
  changesList: {
    margin: '0',
    padding: '0',
    listStyle: 'none'
  },
  changeItem: {
    fontSize: '14px',
    color: BRAND.textColor,
    margin: '0 0 12px',
    lineHeight: '1.5',
    paddingLeft: '0'
  },
  offerBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    padding: '32px 24px',
    margin: '0 0 24px',
    textAlign: 'center' as const
  },
  offerBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '4px',
    margin: '0 0 12px',
    letterSpacing: '0.5px'
  },
  offerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px',
    lineHeight: '1.3'
  },
  offerText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.9)',
    margin: '0'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  button: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: '6px'
  },
  benefitsBox: {
    backgroundColor: '#fef3f2',
    borderLeft: `3px solid ${BRAND.primaryColor}`,
    borderRadius: '0 6px 6px 0',
    padding: '20px 24px',
    margin: '0 0 24px'
  },
  benefitsTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 12px'
  },
  benefitsList: {
    margin: '0',
    padding: '0',
    listStyle: 'none'
  },
  benefitItem: {
    fontSize: '14px',
    color: BRAND.textColor,
    margin: '0 0 12px',
    lineHeight: '1.5'
  },
  mutedText: {
    fontSize: '13px',
    color: BRAND.textMuted,
    margin: '0',
    lineHeight: '1.6',
    textAlign: 'center' as const
  },
  footer: {
    backgroundColor: BRAND.bgColor,
    padding: '32px 40px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${BRAND.borderColor}`
  },
  footerLogo: {
    display: 'block',
    margin: '0 auto 16px'
  },
  footerText: {
    fontSize: '13px',
    color: BRAND.textMuted,
    margin: '0 0 8px'
  },
  footerEmail: {
    fontSize: '13px',
    margin: '0 0 16px'
  },
  footerLink: {
    color: BRAND.primaryColor,
    textDecoration: 'none'
  },
  footerDisclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: '1.6'
  }
}
