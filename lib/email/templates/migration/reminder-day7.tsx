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

interface ReminderDay7EmailProps {
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
 * Day 7 Reminder Email - "Laatste Kans"
 *
 * Strategy:
 * - Strong urgency (deadline approaching)
 * - FOMO (fear of missing out)
 * - Social proof testimonial
 * - Clear countdown
 *
 * Timing: 7 days after landing visit (still no activation)
 * Expected conversion: 10-15%
 */
export function ReminderDay7Email({
  firstName,
  lastName,
  activationUrl,
  couponCode,
  incentive,
  daysRemaining,
  activatedCount,
}: ReminderDay7EmailProps) {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName
  const previewText = `⏰ Nog ${daysRemaining} dagen! Je ${incentive.premiumMonths} maanden Premium vervallen binnenkort...`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Urgency Banner */}
          <Section style={urgencyBanner}>
            <Text style={urgencyText}>
              ⏰ LAATSTE KANS · NOG {daysRemaining} DAGEN
            </Text>
          </Section>

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
            {/* Urgent Greeting */}
            <Heading style={h1}>{firstName}, je Premium vervalt! ⚠️</Heading>

            <Text style={text}>
              <strong>Dit is je laatste herinnering.</strong>
            </Text>

            <Text style={text}>
              Over <strong>{daysRemaining} dagen</strong> vervalt je welkomstcadeau van{' '}
              <strong>{incentive.premiumMonths} maanden Premium</strong> ({incentive.superMessages} SuperBerichten).
            </Text>

            <Text style={text}>
              We willen niet dat je dit misloopt, dus hier is je laatste kans:
            </Text>

            {/* Countdown Box */}
            <Section style={countdownBox}>
              <Text style={countdownTitle}>⏰ TIJD LOOPT AF</Text>
              <Text style={countdownValue}>
                {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagen'}
              </Text>
              <Text style={countdownSubtext}>
                Dan vervalt je welkomstcadeau permanent
              </Text>
            </Section>

            {/* Big CTA */}
            <Section style={buttonContainer}>
              <Button style={urgentButton} href={activationUrl}>
                Claim Nu Mijn {incentive.premiumMonths} Maanden Premium
              </Button>
            </Section>

            <Text style={smallText}>
              (Activeren duurt 30 seconden)
            </Text>

            <Hr style={hr} />

            {/* What You're Missing Out On */}
            <Text style={subheading}>
              <strong>Wat je misloopt als je niet activeert:</strong>
            </Text>

            <Section style={valueBox}>
              <Text style={valueItem}>
                ❌ <strong>€{(incentive.premiumMonths * 9.99).toFixed(2)}</strong> aan gratis Premium
              </Text>
              <Text style={valueItem}>
                ❌ <strong>{incentive.superMessages} SuperBerichten</strong> om op te vallen
              </Text>
              <Text style={valueItem}>
                ❌ <strong>Onbeperkt liken</strong> voor betere matches
              </Text>
              <Text style={valueItem}>
                ❌ <strong>Zie wie jou liket</strong> voor snellere matches
              </Text>
              <Text style={valueItem}>
                ❌ <strong>Prioriteit in zoekresultaten</strong>
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Testimonial */}
            <Text style={subheading}>
              <strong>Waarom anderen al overstapten:</strong>
            </Text>

            <Section style={testimonialBox}>
              <Text style={testimonialQuote}>
                "Binnen 2 weken na de overstap had ik al meerdere leuke matches.
                De app is veel sneller en de matches zijn beter dan bij OogvoorLiefde.
                Blij dat ik de overstap heb gemaakt!"
              </Text>
              <Text style={testimonialAuthor}>
                – Marieke, 32 jaar, Amsterdam
              </Text>
              <Text style={testimonialRating}>
                ⭐⭐⭐⭐⭐
              </Text>
            </Section>

            {/* Social Proof */}
            {activatedCount > 0 && (
              <Section style={socialProofBox}>
                <Text style={socialProofText}>
                  👥 <strong>{activatedCount} leden</strong> zijn al overgestapt.
                  <br />
                  Waarom mis jij het nog?
                </Text>
              </Section>
            )}

            <Hr style={hr} />

            {/* Final Push */}
            <Text style={text}>
              <strong>{firstName}, dit is het moment.</strong>
            </Text>

            <Text style={text}>
              Over {daysRemaining} dagen is deze kans voorgoed voorbij.
              Klik nu op de knop hieronder en activeer je account in 30 seconden:
            </Text>

            <Section style={buttonContainer}>
              <Button style={urgentButton} href={activationUrl}>
                Ja, Ik Claim Mijn Premium Nu!
              </Button>
            </Section>

            {/* Coupon Code Reminder */}
            <Section style={couponBox}>
              <Text style={couponText}>
                Je persoonlijke code: <strong style={couponCodeBold}>{couponCode}</strong>
              </Text>
            </Section>

            {/* PS */}
            <Text style={ps}>
              <strong>P.S.</strong> Twijfel je nog? Het overstappen is 100% gratis,
              al je data is al overgezet, en je kunt direct verder waar je was gebleven.
              Je hebt letterlijk niks te verliezen, maar wel {incentive.premiumMonths} maanden
              Premium te winnen! ⚡
            </Text>

            <Text style={signature}>
              Tot snel op LiefdevoorIedereen,
              <br />
              Het Team 💕
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Liefde Voor Iedereen
              <br />
              Je ontvangt deze email omdat je deadline bijna afloopt.
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

export default ReminderDay7Email

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

const urgencyBanner = {
  backgroundColor: '#dc2626',
  padding: '12px 24px',
  textAlign: 'center' as const,
}

const urgencyText = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0.05em',
  margin: '0',
  textTransform: 'uppercase' as const,
}

const logoSection = {
  padding: '24px 24px 16px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '0 24px 32px',
}

const h1 = {
  color: '#dc2626',
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

const countdownBox = {
  backgroundColor: '#fee2e2',
  border: '3px solid #dc2626',
  borderRadius: '12px',
  padding: '32px 24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const countdownTitle = {
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 12px',
}

const countdownValue = {
  color: '#dc2626',
  fontSize: '48px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0 0 8px',
}

const countdownSubtext = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0',
}

const valueBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '4px',
  padding: '20px',
  margin: '16px 0',
}

const valueItem = {
  color: '#7f1d1d',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '0 0 12px',
}

const testimonialBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '24px',
  margin: '16px 0',
}

const testimonialQuote = {
  color: '#065f46',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const testimonialAuthor = {
  color: '#047857',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const testimonialRating = {
  color: '#fbbf24',
  fontSize: '18px',
  margin: '0',
}

const socialProofBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const socialProofText = {
  color: '#92400e',
  fontSize: '15px',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '0',
}

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
}

const urgentButton = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  margin: '0',
}

const smallText = {
  color: '#6b7280',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}

const couponBox = {
  backgroundColor: '#f3f4f6',
  border: '2px dashed #9ca3af',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const couponText = {
  color: '#4b5563',
  fontSize: '16px',
  margin: '0',
}

const couponCodeBold = {
  color: '#1f2937',
  fontSize: '20px',
  fontFamily: 'monospace',
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
