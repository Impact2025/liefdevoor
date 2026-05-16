import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface SecondChanceEmailProps {
  userName: string
  landingUrl: string
  premiumMonths: number
  superMessages: number
  segment: 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT'
  daysRemaining: number
}

export default function SecondChanceEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  premiumMonths = 1,
  superMessages = 3,
  segment = 'ACTIVE',
  daysRemaining = 30,
}: SecondChanceEmailProps) {
  const premiumValue = (premiumMonths * 12.99).toFixed(2)
  const isHighValue = segment === 'VIP' || segment === 'GOLD'

  const previewText = isHighValue
    ? `We maken een uitzondering voor jou — ${premiumMonths} maanden gratis Premium`
    : `We maken een uitzondering voor oud-gebruikers — gratis Premium`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Img
              src="https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png"
              width="180"
              height="auto"
              alt="Liefde Voor Iedereen"
              style={{ margin: '0 auto' }}
            />
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Text style={badge}>TWEEDE KANS</Text>
            <Heading style={h1}>
              {userName}, we geven je nog één kans
            </Heading>
            <Text style={subText}>
              De migratieperiode van OogvoorLiefde is officieel gesloten.
              Maar voor een kleine groep oud-gebruikers maken we een uitzondering.
              Jij bent daar één van.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Reward Box */}
          <Section style={rewardSection}>
            <Text style={rewardTitle}>Wat staat er voor jou klaar:</Text>

            <Section style={rewardBox}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={rewardIcon}>🎁</td>
                    <td style={rewardText}>
                      <strong>{premiumMonths} {premiumMonths === 1 ? 'maand' : 'maanden'} Premium gratis</strong>
                      <br />
                      <span style={rewardSub}>Waarde: €{premiumValue} — 100% gratis voor jou</span>
                    </td>
                  </tr>
                  {superMessages > 0 && (
                    <tr>
                      <td style={rewardIcon}>⚡</td>
                      <td style={rewardText}>
                        <strong>{superMessages} gratis SuperBerichten</strong>
                        <br />
                        <span style={rewardSub}>Doorbreek het ijs met een speciaal bericht</span>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={rewardIcon}>💌</td>
                    <td style={rewardText}>
                      <strong>Jouw profiel klaarstaan</strong>
                      <br />
                      <span style={rewardSub}>Foto's en gegevens staan al voor je ingeladen</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={landingUrl} style={ctaButton}>
              Claim nu mijn gratis Premium
            </Button>
            <Text style={ctaNote}>
              Duurt minder dan 1 minuut. Geen betaling nodig.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Urgency */}
          <Section style={urgencySection}>
            <Text style={urgencyText}>
              Deze aanbieding verloopt over <strong>{daysRemaining} dagen</strong>.
              Daarna is de kans weg.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Met vriendelijke groet,<br />
              Het Liefde Voor Iedereen team
            </Text>
            <Text style={footerSmall}>
              Je ontvangt deze mail omdat je een account had op OogvoorLiefde.nl.{' '}
              <a href={`https://liefdevooriedereen.nl/migration/unsubscribe`} style={unsubLink}>
                Afmelden
              </a>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '0 0 48px',
}

const header = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#fff1f2',
}

const heroSection = {
  padding: '40px 40px 0',
  textAlign: 'center' as const,
}

const badge = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '20px',
  color: '#92400e',
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: '700' as const,
  letterSpacing: '1px',
  margin: '0 0 16px',
  padding: '4px 16px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700' as const,
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const subText = {
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const divider = {
  borderColor: '#f3f4f6',
  margin: '32px 40px',
}

const rewardSection = {
  padding: '0 40px',
}

const rewardTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '700' as const,
  margin: '0 0 20px',
}

const rewardBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '12px',
  padding: '24px',
}

const rewardIcon = {
  fontSize: '24px',
  paddingRight: '16px',
  paddingBottom: '16px',
  verticalAlign: 'top' as const,
  width: '40px',
}

const rewardText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '1.4',
  paddingBottom: '16px',
}

const rewardSub = {
  color: '#4b7c59',
  fontSize: '13px',
}

const ctaSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const ctaButton = {
  backgroundColor: '#e11d48',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '18px',
  fontWeight: '700' as const,
  padding: '16px 40px',
  textDecoration: 'none',
}

const ctaNote = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '12px 0 0',
}

const urgencySection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  margin: '0 40px',
  padding: '16px 24px',
  textAlign: 'center' as const,
}

const urgencyText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
}

const footer = {
  padding: '32px 40px 0',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}

const unsubLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
}
