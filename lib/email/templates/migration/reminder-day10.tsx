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

interface ReminderDay10EmailProps {
  firstName: string
  lastName?: string
  activationUrl: string
  couponCode: string
  incentive: {
    premiumMonths: number
    superMessages: number
  }
  daysRemaining: number
  feedbackUrl?: string
}

/**
 * Day 10 Reminder Email - "We willen je graag terug"
 *
 * Strategy:
 * - Soft sell (understanding, not pushy)
 * - Feedback request (why didn't you activate?)
 * - Alternative smaller offer
 * - Keep door open
 *
 * Timing: 10 days after landing visit (final attempt)
 * Expected conversion: 5-10%
 */
export function ReminderDay10Email({
  firstName,
  lastName,
  activationUrl,
  couponCode,
  incentive,
  daysRemaining,
  feedbackUrl,
}: ReminderDay10EmailProps) {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName
  const previewText = `${firstName}, we begrijpen het - maar de deur staat nog open...`

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
            {/* Understanding Greeting */}
            <Heading style={h1}>Hey {firstName},</Heading>

            <Text style={text}>
              We hebben je een paar keer gemaild over je welkomstcadeau, maar je hebt je account nog niet geactiveerd.
            </Text>

            <Text style={text}>
              <strong>We begrijpen het.</strong> Misschien was het niet het juiste moment, of misschien zat er iets in de weg.
            </Text>

            <Text style={text}>
              Daarom wilden we even contact opnemen - niet om je te overtuigen, maar om te begrijpen:
            </Text>

            {/* Feedback Request Box */}
            <Section style={feedbackBox}>
              <Text style={feedbackTitle}>
                💬 Waarom heb je je account nog niet geactiveerd?
              </Text>
              <Text style={feedbackText}>
                We willen graag leren van je feedback. Was er iets onduidelijk?
                Werkte iets niet? Of ben je gewoon niet meer op zoek?
              </Text>
              {feedbackUrl && (
                <Section style={feedbackButtonContainer}>
                  <Button style={feedbackButton} href={feedbackUrl}>
                    Deel Je Feedback (1 minuut)
                  </Button>
                </Section>
              )}
              <Text style={feedbackSmall}>
                Je feedback helpt ons om de overstap voor anderen makkelijker te maken. 🙏
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Still Interested Section */}
            <Text style={subheading}>
              <strong>Toch nog interesse?</strong>
            </Text>

            <Text style={text}>
              Als timing het probleem was, hebben we goed nieuws:
            </Text>

            <Section style={offerBox}>
              <Text style={offerTitle}>
                🎁 Je Welkomstcadeau Wacht Nog Steeds
              </Text>
              <Text style={offerValue}>
                {incentive.premiumMonths} Maanden Premium
                {incentive.superMessages > 0 && ` + ${incentive.superMessages} SuperBerichten`}
              </Text>
              <Text style={offerValidity}>
                Nog geldig voor {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagen'}
              </Text>
            </Section>

            <Text style={text}>
              De overstap duurt letterlijk 30 seconden. Klik hieronder als je toch wilt activeren:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={activationUrl}>
                Activeer Mijn Account
              </Button>
            </Section>

            <Text style={smallText}>
              (Of gebruik code: <strong>{couponCode}</strong>)
            </Text>

            <Hr style={hr} />

            {/* Alternative Offer */}
            <Text style={subheading}>
              <strong>Niet helemaal overtuigd?</strong>
            </Text>

            <Text style={text}>
              We snappen dat overstappen spannend kan zijn. Daarom bieden we je dit aan:
            </Text>

            <Section style={alternativeBox}>
              <Text style={alternativeTitle}>
                🆓 Probeer Eerst Gratis
              </Text>
              <Text style={alternativeText}>
                Activeer je account zonder Premium en kijk eerst hoe de nieuwe app bevalt.
                Je kunt later altijd upgraden als je het leuk vindt.
              </Text>
              <Text style={alternativeText}>
                <strong>Nog steeds beschikbaar:</strong>
              </Text>
              <Text style={alternativeFeature}>
                ✓ Al je data is overgezet
              </Text>
              <Text style={alternativeFeature}>
                ✓ Moderne, snelle app
              </Text>
              <Text style={alternativeFeature}>
                ✓ Betere privacy & veiligheid
              </Text>
              <Text style={alternativeFeature}>
                ✓ Gratis basis features
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={buttonSecondary} href={activationUrl}>
                OK, Ik Probeer Het Gratis
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Common Concerns */}
            <Text style={subheading}>
              <strong>Veelgestelde zorgen:</strong>
            </Text>

            <Section style={faqBox}>
              <Text style={faqQuestion}>
                <strong>❓ "Ik wil niet betalen"</strong>
              </Text>
              <Text style={faqAnswer}>
                → De overstap is 100% gratis! Je Premium cadeau is gratis, en je kunt ook
                zonder Premium de app gebruiken.
              </Text>

              <Text style={faqQuestion}>
                <strong>❓ "Ik weet niet of ik nog wil daten"</strong>
              </Text>
              <Text style={faqAnswer}>
                → Geen probleem! Activeer je account nu, en gebruik het wanneer je er klaar voor bent.
                Je data blijft veilig bewaard.
              </Text>

              <Text style={faqQuestion}>
                <strong>❓ "Ik vond OogvoorLiefde beter"</strong>
              </Text>
              <Text style={faqAnswer}>
                → We begrijpen dat nieuwe dingen wennen. Maar veel leden vinden LiefdevoorIedereen
                juist beter: sneller, moderner, en betere matches. Geef het een kans?
              </Text>

              <Text style={faqQuestion}>
                <strong>❓ "Ik heb geen tijd"</strong>
              </Text>
              <Text style={faqAnswer}>
                → Activeren duurt 30 seconden. Letterlijk. Daarna bepaal je zelf wanneer je de app gebruikt.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Final Message */}
            <Text style={text}>
              <strong>Wat je ook kiest, {firstName} - we respecteren je beslissing.</strong>
            </Text>

            <Text style={text}>
              Als je toch wilt activeren, de deur staat nog {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagen'} open.
              Klik gewoon op de knop hieronder:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={activationUrl}>
                Ja, Ik Activeer Mijn Account
              </Button>
            </Section>

            <Text style={text}>
              En als je niet activeert? Geen hard feelings. We hopen dat je vindt wat je zoekt,
              waar dat ook is. 💕
            </Text>

            {/* Goodbye Option */}
            <Section style={goodbyeBox}>
              <Text style={goodbyeText}>
                Als je écht niet meer wilt daten en ook je account wilt verwijderen,
                laat het ons weten via{' '}
                <Link href="mailto:support@liefdevooriedereen.nl" style={link}>
                  support@liefdevooriedereen.nl
                </Link>
              </Text>
            </Section>

            <Text style={signature}>
              Wat je ook kiest, we wensen je het allerbeste,
              <br />
              Het LiefdevoorIedereen Team 💕
            </Text>

            <Text style={ps}>
              <strong>P.S.</strong> Dit is onze laatste email over dit onderwerp.
              We willen niet pushen - de keuze is aan jou. 🙂
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Liefde Voor Iedereen
              <br />
              Dit is de laatste herinnering over je welkomstcadeau.
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

export default ReminderDay10Email

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

const feedbackBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const feedbackTitle = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const feedbackText = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 16px',
}

const feedbackButtonContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
}

const feedbackButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
  margin: '0',
}

const feedbackSmall = {
  color: '#1e40af',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}

const offerBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const offerTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 8px',
}

const offerValue = {
  color: '#92400e',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const offerValidity = {
  color: '#b45309',
  fontSize: '14px',
  margin: '0',
}

const alternativeBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '24px',
  margin: '16px 0',
}

const alternativeTitle = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const alternativeText = {
  color: '#047857',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const alternativeFeature = {
  color: '#047857',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
}

const faqBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const faqQuestion = {
  color: '#1f2937',
  fontSize: '15px',
  margin: '0 0 8px',
}

const faqAnswer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  paddingLeft: '8px',
}

const goodbyeBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
}

const goodbyeText = {
  color: '#7f1d1d',
  fontSize: '13px',
  lineHeight: '1.5',
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
  backgroundColor: '#10b981',
}

const smallText = {
  color: '#6b7280',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}

const ps = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '4px',
  padding: '16px',
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '24px 0',
  fontStyle: 'italic',
}

const signature = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '24px 0 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
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
