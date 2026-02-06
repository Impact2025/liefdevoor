import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeV2Props {
  userName: string
  landingUrl: string
  premiumMonths: number
  superMessages: number
  photoCount: number
  matchCount?: number
  memberYears?: number
  segment: string
  activatedToday?: number
  daysUntilExpiry?: number
  claimToken?: string
  emailId?: string
}

export default function WelcomeV2({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  premiumMonths = 3,
  superMessages = 10,
  photoCount = 5,
  matchCount = 0,
  memberYears = 2,
  segment = 'ACTIVE',
  activatedToday = 12,
  daysUntilExpiry = 30,
  claimToken = 'token123',
  emailId = 'email123'
}: WelcomeV2Props) {
  const premiumValue = (premiumMonths * 12.99).toFixed(2)
  const trackingPixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/tracking/pixel/${emailId}.gif`

  return (
    <Html>
      <Head />
      <Preview>
        Je profiel staat klaar + {premiumMonths} maanden Premium gratis! 🎁
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://liefdevooriedereen.nl/logo.png"
              width="180"
              height="45"
              alt="Liefde Voor Iedereen"
              style={logo}
            />
          </Section>

          {/* Hero Section with Urgency */}
          <Section style={heroSection}>
            <Heading style={h1}>
              Hoi {userName}, welkom terug! 🎉
            </Heading>
            <Text style={urgencyText}>
              ⏰ Claim binnen {daysUntilExpiry} dagen je exclusieve aanbieding
            </Text>
            {segment === 'VIP' && (
              <Text style={vipBadge}>
                ⭐ VIP Status - Onze meest waardevolle gebruiker
              </Text>
            )}
          </Section>

          {/* Personal Value Section */}
          <Section style={valueSection}>
            <Heading as="h2" style={h2}>
              Wat je krijgt:
            </Heading>
            <table style={benefitsList}>
              <tr>
                <td style={benefitIcon}>✅</td>
                <td style={benefitText}>
                  Al je data automatisch overgezet
                </td>
              </tr>
              <tr>
                <td style={benefitIcon}>📸</td>
                <td style={benefitText}>
                  {photoCount} foto's bewaard
                </td>
              </tr>
              {matchCount > 0 && (
                <tr>
                  <td style={benefitIcon}>💕</td>
                  <td style={benefitText}>
                    {matchCount} matches bewaard
                  </td>
                </tr>
              )}
              <tr>
                <td style={benefitIcon}>🎁</td>
                <td style={benefitText}>
                  <strong>{premiumMonths} maanden Premium GRATIS</strong>
                  <br />
                  <span style={valueHighlight}>(t.w.v. €{premiumValue})</span>
                </td>
              </tr>
              <tr>
                <td style={benefitIcon}>✨</td>
                <td style={benefitText}>
                  {superMessages} SuperBerichten cadeau
                </td>
              </tr>
            </table>
          </Section>

          {/* Premium Features Highlight */}
          <Section style={featuresSection}>
            <Heading as="h3" style={h3}>
              💎 Met Premium krijg je:
            </Heading>
            <table style={featureGrid}>
              <tr>
                <td style={featureBox}>
                  <Text style={featureEmoji}>👀</Text>
                  <Text style={featureTitle}>Zie wie je leuk vindt</Text>
                  <Text style={featureDesc}>Direct zien wie interesse heeft</Text>
                </td>
                <td style={featureBox}>
                  <Text style={featureEmoji}>⚡</Text>
                  <Text style={featureTitle}>Onbeperkt matchen</Text>
                  <Text style={featureDesc}>Swipe zoveel je wilt</Text>
                </td>
              </tr>
              <tr>
                <td style={featureBox}>
                  <Text style={featureEmoji}>🔄</Text>
                  <Text style={featureTitle}>Herstel swipes</Text>
                  <Text style={featureDesc}>Terug naar vorige profielen</Text>
                </td>
                <td style={featureBox}>
                  <Text style={featureEmoji}>🎯</Text>
                  <Text style={featureTitle}>Boost je profiel</Text>
                  <Text style={featureDesc}>10x meer zichtbaarheid</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Social Proof */}
          <Section style={socialProofSection}>
            <Text style={socialProofText}>
              🔥 <strong>{activatedToday} mensen</strong> activeerden vandaag hun account
            </Text>
            <Text style={testimonialText}>
              "{memberYears > 0
                ? `Je was ${memberYears} jaar lid bij OogvoorLiefde - je plek staat klaar!`
                : 'Welkom in de nieuwe generatie dating!'}"
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Strong CTA */}
          <Section style={ctaSection}>
            <Button href={landingUrl} style={ctaButton}>
              ⚡ Activeer Mijn Account Nu →
            </Button>
            <Text style={ctaSubtext}>
              Klik hier en je account is binnen 30 seconden klaar
            </Text>
          </Section>

          {/* Secondary CTA - Create Urgency */}
          <Section style={urgencyBox}>
            <Text style={urgencyBoxTitle}>
              ⏰ Let op: Deze aanbieding verloopt!
            </Text>
            <Text style={urgencyBoxText}>
              Je hebt nog <strong>{daysUntilExpiry} dagen</strong> om je account te activeren.
              <br />
              Daarna wordt je data permanent verwijderd.
            </Text>
          </Section>

          {/* Trust Indicators */}
          <Section style={trustSection}>
            <table style={trustGrid}>
              <tr>
                <td style={trustItem}>
                  <Text style={trustIcon}>🔒</Text>
                  <Text style={trustText}>AVG-compliant</Text>
                </td>
                <td style={trustItem}>
                  <Text style={trustIcon}>🇳🇱</Text>
                  <Text style={trustText}>Nederlands bedrijf</Text>
                </td>
                <td style={trustItem}>
                  <Text style={trustIcon}>✅</Text>
                  <Text style={trustText}>Veilige overdracht</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Heb je vragen? Antwoord op deze email of bezoek onze{' '}
              <Link href="https://liefdevooriedereen.nl/hulp" style={footerLink}>
                helpcentrum
              </Link>
            </Text>
            <Text style={footerText}>
              Met liefde,
              <br />
              Het Liefde Voor Iedereen Team
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerSmall}>
              Deze email is verstuurd naar jou omdat je lid was van OogvoorLiefde.nl
              <br />
              <Link href={`${landingUrl}/unsubscribe`} style={unsubscribeLink}>
                Niet meer ontvangen
              </Link>
            </Text>
          </Section>

          {/* Tracking Pixel */}
          <Img
            src={trackingPixelUrl}
            width="1"
            height="1"
            alt=""
            style={{ display: 'block' }}
          />
        </Container>
      </Body>
    </Html>
  )
}

// ============================================
// STYLES
// ============================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const heroSection = {
  padding: '0 40px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const urgencyText = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '8px',
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0',
  padding: '12px 20px',
  textAlign: 'center' as const,
}

const vipBadge = {
  backgroundColor: '#fef3c7',
  borderRadius: '20px',
  color: '#92400e',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '700',
  margin: '8px 0 0',
  padding: '6px 16px',
}

const valueSection = {
  padding: '32px 40px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 20px',
}

const h3 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const benefitsList = {
  width: '100%',
}

const benefitIcon = {
  fontSize: '24px',
  paddingRight: '12px',
  verticalAlign: 'top',
  width: '40px',
}

const benefitText = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  padding: '8px 0',
}

const valueHighlight = {
  color: '#059669',
  fontWeight: '600',
}

const featuresSection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '12px',
  margin: '32px 40px',
  padding: '24px',
}

const featureGrid = {
  width: '100%',
}

const featureBox = {
  padding: '12px',
  textAlign: 'center' as const,
  verticalAlign: 'top',
  width: '50%',
}

const featureEmoji = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const featureTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const featureDesc = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}

const socialProofSection = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  margin: '32px 40px',
  padding: '20px',
}

const socialProofText = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const testimonialText = {
  color: '#7f1d1d',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
}

const ctaSection = {
  padding: '0 40px',
  textAlign: 'center' as const,
}

const ctaButton = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '1',
  padding: '16px 40px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const ctaSubtext = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '12px 0 0',
}

const urgencyBox = {
  backgroundColor: '#fef3c7',
  border: '2px dashed #fbbf24',
  borderRadius: '12px',
  margin: '32px 40px',
  padding: '20px',
  textAlign: 'center' as const,
}

const urgencyBoxTitle = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const urgencyBoxText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const trustSection = {
  padding: '32px 40px',
}

const trustGrid = {
  width: '100%',
}

const trustItem = {
  textAlign: 'center' as const,
  width: '33.33%',
}

const trustIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const trustText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}

const footer = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const footerLink = {
  color: '#ef4444',
  textDecoration: 'underline',
}

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
}

const unsubscribeLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
}
