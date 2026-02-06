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

interface ReminderV2Props {
  userName: string
  landingUrl: string
  daysRemaining: number
  premiumMonths: number
  superMessages: number
  photoCount: number
  hasOpened?: boolean
  hasClicked?: boolean
  emailId?: string
}

export default function ReminderV2({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  daysRemaining = 7,
  premiumMonths = 3,
  superMessages = 10,
  photoCount = 5,
  hasOpened = false,
  hasClicked = false,
  emailId = 'email123'
}: ReminderV2Props) {
  const trackingPixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/tracking/pixel/${emailId}.gif`
  const isUrgent = daysRemaining <= 7

  // Personalized message based on behavior
  const getMessage = () => {
    if (hasClicked) {
      return "Je hebt onze vorige email gelezen en op de link geklikt - maar je hebt je account nog niet geactiveerd. 🤔"
    }
    if (hasOpened) {
      return "Je hebt onze vorige email geopend, maar je hebt je account nog niet geactiveerd. ⏰"
    }
    return "We hebben je een email gestuurd met je welkomstaanbieding, maar je hebt nog niet gereageerd."
  }

  return (
    <Html>
      <Head />
      <Preview>
        {`${isUrgent ? '⚠️ Nog maar' : 'Je hebt nog'} ${daysRemaining} dagen - Claim je ${premiumMonths} maanden Premium!`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://liefdevooriedereen.nl/logo.png"
              width="180"
              height="45"
              alt="Liefde Voor Iedereen"
              style={logo}
            />
          </Section>

          {/* Hero - Urgency Based */}
          <Section style={heroSection}>
            {isUrgent ? (
              <>
                <Text style={urgentBadge}>⚠️ LAATSTE KANS</Text>
                <Heading style={h1}>
                  {userName}, je aanbieding verloopt over {daysRemaining} dagen! ⏰
                </Heading>
              </>
            ) : (
              <>
                <Heading style={h1}>
                  {userName}, vergeet je niet iets? 🤔
                </Heading>
              </>
            )}
          </Section>

          {/* Personalized Message */}
          <Section style={messageSection}>
            <Text style={messageText}>
              {getMessage()}
            </Text>
          </Section>

          {/* What They're Missing */}
          <Section style={missingSection}>
            <Heading as="h2" style={h2}>
              💔 Dit loop je mis:
            </Heading>

            <table style={missingList}>
              <tr>
                <td style={missingIcon}>😢</td>
                <td style={missingText}>
                  <strong>{premiumMonths} maanden Premium gratis</strong> (t.w.v. €{(premiumMonths * 12.99).toFixed(2)})
                </td>
              </tr>
              <tr>
                <td style={missingIcon}>💔</td>
                <td style={missingText}>
                  {superMessages} gratis SuperBerichten
                </td>
              </tr>
              <tr>
                <td style={missingIcon}>📸</td>
                <td style={missingText}>
                  Je {photoCount} foto's worden permanent verwijderd
                </td>
              </tr>
              <tr>
                <td style={missingIcon}>🗑️</td>
                <td style={missingText}>
                  Al je matches en gesprekken verdwijnen
                </td>
              </tr>
            </table>
          </Section>

          {/* Countdown Timer Visual */}
          <Section style={countdownSection}>
            <table style={countdownGrid}>
              <tr>
                <td style={countdownBox}>
                  <Text style={countdownNumber}>{daysRemaining}</Text>
                  <Text style={countdownLabel}>dagen</Text>
                </td>
                <td style={countdownSeparator}>:</td>
                <td style={countdownBox}>
                  <Text style={countdownNumber}>??</Text>
                  <Text style={countdownLabel}>uren</Text>
                </td>
                <td style={countdownSeparator}>:</td>
                <td style={countdownBox}>
                  <Text style={countdownNumber}>??</Text>
                  <Text style={countdownLabel}>min</Text>
                </td>
              </tr>
            </table>
            <Text style={countdownSubtext}>
              Tot je account permanent wordt verwijderd
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Strong CTA */}
          <Section style={ctaSection}>
            <Button href={landingUrl} style={ctaButton}>
              ⚡ Ja, Activeer Nu Mijn Account!
            </Button>
            <Text style={ctaSubtext}>
              Klik hier en red je account voordat het te laat is
            </Text>
          </Section>

          {/* Social Proof - What Others Are Saying */}
          <Section style={testimonialSection}>
            <Heading as="h3" style={h3}>
              Wat anderen zeggen:
            </Heading>

            <Section style={testimonialBox}>
              <Text style={testimonialQuote}>
                "Ik had bijna niet gereageerd, maar ben zo blij dat ik het toch deed!
                De nieuwe site is veel beter en ik heb al 3 leuke dates gehad." ⭐⭐⭐⭐⭐
              </Text>
              <Text style={testimonialAuthor}>
                - Maria, 34 jaar
              </Text>
            </Section>

            <Section style={testimonialBox}>
              <Text style={testimonialQuote}>
                "Gratis Premium is echt geweldig. Ik zie nu wie mij leuk vindt
                en dat scheelt zoveel tijd!" ⭐⭐⭐⭐⭐
              </Text>
              <Text style={testimonialAuthor}>
                - Peter, 42 jaar
              </Text>
            </Section>
          </Section>

          {/* FAQ - Address Concerns */}
          <Section style={faqSection}>
            <Heading as="h3" style={h3}>
              Veelgestelde vragen:
            </Heading>

            <Section style={faqItem}>
              <Text style={faqQuestion}>
                ❓ Moet ik opnieuw betalen?
              </Text>
              <Text style={faqAnswer}>
                <strong>Nee!</strong> Je krijgt {premiumMonths} maanden Premium 100% gratis.
                Geen creditcard vereist.
              </Text>
            </Section>

            <Section style={faqItem}>
              <Text style={faqQuestion}>
                ❓ Worden mijn foto's echt verwijderd?
              </Text>
              <Text style={faqAnswer}>
                <strong>Ja.</strong> Na {daysRemaining} dagen verwijderen we permanent alle data
                volgens AVG wetgeving. Dit kan niet ongedaan gemaakt worden.
              </Text>
            </Section>

            <Section style={faqItem}>
              <Text style={faqQuestion}>
                ❓ Hoe lang duurt activeren?
              </Text>
              <Text style={faqAnswer}>
                <strong>30 seconden.</strong> Klik op de knop, kies een wachtwoord,
                en je bent klaar. Al je data staat direct klaar.
              </Text>
            </Section>
          </Section>

          {/* Final Urgency Push */}
          <Section style={finalUrgencySection}>
            <Text style={finalUrgencyTitle}>
              ⏰ Laatste kans, {userName}!
            </Text>
            <Text style={finalUrgencyText}>
              {isUrgent ? (
                <>
                  Je hebt nog <strong>minder dan een week</strong> om je account te activeren.
                  <br />
                  Daarna is alles voorgoed weg. Dat zou zonde zijn! 😢
                </>
              ) : (
                <>
                  Wacht niet te lang! Over {daysRemaining} dagen is deze aanbieding voorbij
                  <br />
                  en wordt je account permanent verwijderd.
                </>
              )}
            </Text>
            <Button href={landingUrl} style={finalCtaButton}>
              Activeer Nu →
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Heb je vragen? Antwoord op deze email.
            </Text>
            <Text style={footerText}>
              Met liefde,
              <br />
              Het Liefde Voor Iedereen Team
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerSmall}>
              <Link href={`${landingUrl}/unsubscribe`} style={unsubscribeLink}>
                Niet meer herinneren
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
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

const urgentBadge = {
  backgroundColor: '#fee2e2',
  border: '2px solid #ef4444',
  borderRadius: '20px',
  color: '#991b1b',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 16px',
  padding: '6px 20px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const h3 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const messageSection = {
  padding: '24px 40px',
}

const messageText = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
}

const missingSection = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  margin: '24px 40px',
  padding: '24px',
}

const missingList = {
  width: '100%',
}

const missingIcon = {
  fontSize: '24px',
  paddingRight: '12px',
  verticalAlign: 'top',
  width: '40px',
}

const missingText = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '1.5',
  padding: '8px 0',
}

const countdownSection = {
  backgroundColor: '#1f2937',
  margin: '32px 40px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderRadius: '12px',
}

const countdownGrid = {
  margin: '0 auto',
}

const countdownBox = {
  padding: '0 12px',
  textAlign: 'center' as const,
}

const countdownNumber = {
  color: '#fbbf24',
  fontSize: '48px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0',
}

const countdownLabel = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '8px 0 0',
  textTransform: 'uppercase' as const,
}

const countdownSeparator = {
  color: '#9ca3af',
  fontSize: '36px',
  fontWeight: '700',
  padding: '0 8px',
}

const countdownSubtext = {
  color: '#d1d5db',
  fontSize: '14px',
  margin: '16px 0 0',
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
  padding: '16px 40px',
  textDecoration: 'none',
}

const ctaSubtext = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '12px 0 0',
}

const testimonialSection = {
  margin: '32px 40px',
}

const testimonialBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '3px solid #10b981',
  borderRadius: '8px',
  margin: '16px 0',
  padding: '16px 20px',
}

const testimonialQuote = {
  color: '#374151',
  fontSize: '14px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 8px',
}

const testimonialAuthor = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0',
}

const faqSection = {
  margin: '32px 40px',
}

const faqItem = {
  margin: '0 0 20px',
}

const faqQuestion = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const faqAnswer = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const finalUrgencySection = {
  backgroundColor: '#fef3c7',
  border: '3px solid #fbbf24',
  borderRadius: '12px',
  margin: '32px 40px',
  padding: '24px',
  textAlign: 'center' as const,
}

const finalUrgencyTitle = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const finalUrgencyText = {
  color: '#92400e',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0 0 20px',
}

const finalCtaButton = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '700',
  padding: '14px 32px',
  textDecoration: 'none',
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

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}

const unsubscribeLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
}
