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

interface InactiveInviteEmailProps {
  userName: string
  registerUrl: string
}

export default function InactiveInviteEmail({
  userName = 'daar',
  registerUrl = 'https://liefdevooriedereen.nl/register',
}: InactiveInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Een nieuwe dating app voor mensen zoals jij — rustig, eerlijk, zonder gedoe</Preview>
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
            <Heading style={h1}>
              {userName}, ken je Liefde Voor Iedereen al?
            </Heading>
            <Text style={subText}>
              Je had vroeger een account op OogvoorLiefde. We wilden je laten weten
              dat we een nieuwe app hebben gebouwd — en we denken dat je hem leuk zult vinden.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Why Different */}
          <Section style={featuresSection}>
            <Text style={featuresTitle}>Wat maakt het anders:</Text>

            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={featureIcon}>💛</td>
                  <td style={featureText}>
                    <strong>Voor iedereen welkom</strong><br />
                    <span style={featureSub}>Of je nu ADHD, HSP of gewoon jezelf bent</span>
                  </td>
                </tr>
                <tr>
                  <td style={featureIcon}>🧠</td>
                  <td style={featureText}>
                    <strong>Matching op basis van wie je bent</strong><br />
                    <span style={featureSub}>Niet alleen op foto's, maar op persoonlijkheid</span>
                  </td>
                </tr>
                <tr>
                  <td style={featureIcon}>🔒</td>
                  <td style={featureText}>
                    <strong>Geen eindeloos swipen</strong><br />
                    <span style={featureSub}>Rustig en op jouw eigen tempo</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={registerUrl} style={ctaButton}>
              Bekijk Liefde Voor Iedereen
            </Button>
            <Text style={ctaNote}>
              Gratis registreren. Altijd.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Met vriendelijke groet,<br />
              Het Liefde Voor Iedereen team
            </Text>
            <Text style={footerSmall}>
              Je ontvangt deze mail omdat je een account had op OogvoorLiefde.nl.{' '}
              <a href="https://liefdevooriedereen.nl/migration/unsubscribe" style={unsubLink}>
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

const h1 = {
  color: '#1a1a1a',
  fontSize: '26px',
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

const featuresSection = {
  padding: '0 40px',
}

const featuresTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700' as const,
  margin: '0 0 20px',
}

const featureIcon = {
  fontSize: '22px',
  paddingRight: '16px',
  paddingBottom: '20px',
  verticalAlign: 'top' as const,
  width: '36px',
}

const featureText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.4',
  paddingBottom: '20px',
}

const featureSub = {
  color: '#6b7280',
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
  fontSize: '17px',
  fontWeight: '700' as const,
  padding: '16px 40px',
  textDecoration: 'none',
}

const ctaNote = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '12px 0 0',
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
