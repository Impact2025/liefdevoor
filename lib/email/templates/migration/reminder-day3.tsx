import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ReminderDay3EmailProps {
  firstName: string
  lastName?: string
  activationUrl: string
  couponCode: string
  incentive: {
    premiumMonths: number
    superMessages: number
  }
  daysRemaining: number
  activatedCount: number
}

/**
 * Day 3 Reminder Email - "Mis je iets?"
 *
 * Strategy:
 * - Gentle reminder (not pushy)
 * - Extended deadline (+7 days bonus)
 * - Social proof (others are joining)
 * - Clear value proposition
 *
 * Timing: 3 days after landing visit (no activation)
 * Expected conversion: 15-20%
 */
export function ReminderDay3Email({
  firstName,
  lastName,
  activationUrl,
  couponCode,
  incentive,
  daysRemaining,
  activatedCount,
}: ReminderDay3EmailProps) {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName
  const previewText = `${firstName}, je ${incentive.premiumMonths} maanden Premium wachten nog steeds 🎁`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png"
              width="200"
              height="auto"
              alt="Liefde Voor Iedereen"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Greeting */}
            <Heading style={h1}>Hey {firstName}! 👋</Heading>

            <Text style={text}>
              Een paar dagen geleden heb je je welkomstpagina bezocht, maar je hebt je account nog niet geactiveerd.
            </Text>

            <Text style={text}>
              <strong>Mis je iets?</strong> We willen er zeker van zijn dat je niet per ongeluk je welkomstcadeau misloopt:
            </Text>

            {/* Incentive Box */}
            <Section style={incentiveBox}>
              <Text style={incentiveTitle}>🎁 Jouw Welkomstcadeau</Text>
              <Text style={incentiveValue}>
                {incentive.premiumMonths} Maanden Premium GRATIS
              </Text>
              {incentive.superMessages > 0 && (
                <Text style={incentiveExtra}>
                  + {incentive.superMessages} SuperBerichten 🌟
                </Text>
              )}
              <Text style={couponCodeStyle}>
                Code: <strong>{couponCode}</strong>
              </Text>
            </Section>

            {/* Extended Deadline Announcement */}
            <Section style={bonusBox}>
              <Text style={bonusText}>
                ⏰ <strong>Goed nieuws!</strong> We hebben je deadline verlengd met 7 dagen.
                Je hebt nu nog <strong>{daysRemaining + 7} dagen</strong> om je cadeau te claimen.
              </Text>
            </Section>

            <Text style={text}>
              Het activeren duurt maar 30 seconden:
            </Text>

            <Text style={listItem}>✓ Kies een wachtwoord</Text>
            <Text style={listItem}>✓ Claim je Premium cadeau</Text>
            <Text style={listItem}>✓ Start direct met daten</Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={activationUrl}>
                Activeer Mijn Account
              </Button>
            </Section>

            {/* Social Proof */}
            {activatedCount > 0 && (
              <Section style={socialProofBox}>
                <Text style={socialProofText}>
                  👥 Al <strong>{activatedCount}</strong> leden zijn overgestapt naar LiefdevoorIedereen.
                  Word jij de volgende?
                </Text>
              </Section>
            )}

            <Hr style={hr} />

            {/* Why OogvoorLiefde → LiefdevoorIedereen */}
            <Text style={subheading}>
              <strong>Waarom overstappen?</strong>
            </Text>

            <Text style={text}>
              LiefdevoorIedereen is de compleet vernieuwde versie van OogvoorLiefde:
            </Text>

            <Text style={featureItem}>
              ⚡ <strong>Snellere app</strong> - Moderne technologie
            </Text>
            <Text style={featureItem}>
              🎯 <strong>Betere matches</strong> - Slimmere algoritmes
            </Text>
            <Text style={featureItem}>
              🔒 <strong>Veiliger</strong> - Verbeterde privacy & verificatie
            </Text>
            <Text style={featureItem}>
              💬 <strong>Beter design</strong> - Intuïtievere interface
            </Text>

            {/* Reassurance */}
            <Section style={reassuranceBox}>
              <Text style={reassuranceText}>
                ✓ Al je data is overgezet (foto's, berichten, matches)
                <br />
                ✓ 100% gratis overstappen
                <br />
                ✓ Je kunt direct verder waar je was gebleven
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Final CTA */}
            <Text style={text}>
              Klaar om verder te gaan? Klik hieronder om je account te activeren:
            </Text>

            <Section style={buttonContainer}>
              <Button style={buttonSecondary} href={activationUrl}>
                Ja, Activeer Mijn Account
              </Button>
            </Section>

            {/* Help */}
            <Text style={helpText}>
              Vragen? We helpen je graag! Stuur een email naar{' '}
              <Link href="mailto:support@liefdevooriedereen.nl" style={link}>
                support@liefdevooriedereen.nl
              </Link>
            </Text>

            <Text style={signature}>
              Groetjes,
              <br />
              Het LiefdevoorIedereen Team 💕
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Liefde Voor Iedereen
              <br />
              Je ontvangt deze email omdat je een account hebt op OogvoorLiefde.
            </Text>
            <Text style={footerText}>
              <Link href="https://liefdevooriedereen.nl/privacy" style={footerLink}>
                Privacy
              </Link>
              {' · '}
              <Link href="https://liefdevooriedereen.nl/terms" style={footerLink}>
                Voorwaarden
              </Link>
              {' · '}
              <Link href="https://liefdevooriedereen.nl/support" style={footerLink}>
                Support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ReminderDay3Email

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
}

const logoSection = {
  padding: '32px 24px 24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '0 24px 32px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const subheading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px',
}

const listItem = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  paddingLeft: '8px',
}

const featureItem = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const incentiveBox = {
  backgroundColor: '#fef3c7',
  border: '2px dashed #f59e0b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const incentiveTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 8px',
}

const incentiveValue = {
  color: '#92400e',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const incentiveExtra = {
  color: '#b45309',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const couponCodeStyle = {
  color: '#78350f',
  fontSize: '16px',
  margin: '0',
}

const bonusBox = {
  backgroundColor: '#d1fae5',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const bonusText = {
  color: '#065f46',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
}

const socialProofBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const socialProofText = {
  color: '#4b5563',
  fontSize: '15px',
  margin: '0',
}

const reassuranceBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0',
}

const reassuranceText = {
  color: '#065f46',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '0',
}

const buttonSecondary = {
  ...button,
  backgroundColor: '#f43f5e',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 16px',
  textAlign: 'center' as const,
}

const signature = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '24px 0 0',
}

const link = {
  color: '#ec4899',
  textDecoration: 'underline',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#6b7280',
  textDecoration: 'underline',
}
