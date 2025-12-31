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
import * as React from 'react'

interface MatchReminderEmailProps {
  userName: string
  matchName: string
  matchPhoto: string
  matchAge: number
  matchCity: string
  daysSinceMatch: number
  isFirstMessage: boolean
  conversationType: 'no_reply' | 'inactive_chat' | 'new_match'
  lastMessagePreview?: string
  compatibilityScore?: number
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'

export const MatchReminderEmail = ({
  userName = 'daar',
  matchName = 'Anna',
  matchPhoto = 'https://via.placeholder.com/150',
  matchAge = 28,
  matchCity = 'Amsterdam',
  daysSinceMatch = 3,
  isFirstMessage = true,
  conversationType = 'new_match',
  lastMessagePreview,
  compatibilityScore,
}: MatchReminderEmailProps) => {
  const getSubjectLine = () => {
    switch (conversationType) {
      case 'no_reply':
        return `${matchName} wacht nog steeds op je antwoord...`
      case 'inactive_chat':
        return `Jullie gesprek met ${matchName} is stil gevallen`
      case 'new_match':
      default:
        return `${matchName} wacht op je eerste bericht!`
    }
  }

  const getHeroText = () => {
    switch (conversationType) {
      case 'no_reply':
        return `${matchName} stuurde je ${daysSinceMatch} dagen geleden een bericht`
      case 'inactive_chat':
        return `Het is ${daysSinceMatch} dagen stil in jullie chat`
      case 'new_match':
      default:
        return `Jullie matchten ${daysSinceMatch} dagen geleden`
    }
  }

  const getEmoji = () => {
    switch (conversationType) {
      case 'no_reply':
        return '💬'
      case 'inactive_chat':
        return '🤔'
      case 'new_match':
      default:
        return '💕'
    }
  }

  const getCTA = () => {
    switch (conversationType) {
      case 'no_reply':
        return 'Beantwoord nu'
      case 'inactive_chat':
        return 'Stuur een berichtje'
      case 'new_match':
      default:
        return 'Start het gesprek'
    }
  }

  const previewText = getSubjectLine()

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Img
              src={`${baseUrl}/images/logo.png`}
              width="150"
              height="50"
              alt="Liefde Voor Iedereen"
              style={logo}
            />
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Text style={heroEmoji}>{getEmoji()}</Text>
            <Heading style={heading}>
              Hoi {userName}!
            </Heading>
            <Text style={subheading}>
              {getHeroText()}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Match Profile Card */}
          <Section style={matchCard}>
            <Img
              src={matchPhoto}
              width="120"
              height="120"
              alt={matchName}
              style={matchImage}
            />
            <Heading style={matchName as any}>
              {matchName}, {matchAge}
            </Heading>
            <Text style={matchLocation}>
              📍 {matchCity}
            </Text>
            {compatibilityScore && (
              <Text style={compatibilityBadge}>
                {compatibilityScore}% match
              </Text>
            )}
          </Section>

          {/* Last message preview */}
          {lastMessagePreview && conversationType === 'no_reply' && (
            <Section style={messagePreviewSection}>
              <Text style={messageLabel}>Laatste bericht van {matchName}:</Text>
              <Text style={messagePreview}>
                "{lastMessagePreview}"
              </Text>
            </Section>
          )}

          {/* Conversation starters */}
          {isFirstMessage && (
            <Section style={tipsSection}>
              <Heading style={tipsHeading}>
                💡 Gespreksopeners die werken
              </Heading>
              <Text style={tipItem}>
                • Vraag naar iets uit hun bio of foto's
              </Text>
              <Text style={tipItem}>
                • Deel een grappige observatie
              </Text>
              <Text style={tipItem}>
                • Stel een "zou je liever" vraag
              </Text>
            </Section>
          )}

          {/* Urgency message */}
          <Section style={urgencySection}>
            <Text style={urgencyText}>
              {conversationType === 'new_match'
                ? '⏰ Tip: Matches die binnen 24 uur chatten hebben 3x meer kans op een date!'
                : '⏰ Laat de vonk niet doven - stuur vandaag nog een berichtje!'
              }
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={primaryButton} href={`${baseUrl}/matches`}>
              {getCTA()}
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Met liefde,<br />
              Het Liefde Voor Iedereen Team
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/email/preferences`} style={footerLink}>
                E-mail voorkeuren
              </Link>
              {' • '}
              <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>
                Uitschrijven
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default MatchReminderEmail

// Styles
const main = {
  backgroundColor: '#fff5f7',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const headerSection = {
  padding: '20px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const heroSection = {
  textAlign: 'center' as const,
  padding: '20px',
}

const heroEmoji = {
  fontSize: '50px',
  margin: '0 0 15px 0',
}

const heading = {
  fontSize: '26px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 10px 0',
}

const subheading = {
  fontSize: '16px',
  color: '#666',
  margin: '0',
}

const hr = {
  borderColor: '#ffe4e9',
  margin: '25px 0',
}

const matchCard = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '30px',
  margin: '0 20px',
  textAlign: 'center' as const,
  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.1)',
}

const matchImage = {
  borderRadius: '50%',
  margin: '0 auto 15px auto',
  border: '4px solid #ec4899',
}

const matchLocation = {
  fontSize: '14px',
  color: '#666',
  margin: '5px 0 15px 0',
}

const compatibilityBadge = {
  backgroundColor: '#fdf2f8',
  color: '#ec4899',
  fontSize: '14px',
  fontWeight: '600',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
}

const messagePreviewSection = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px',
  borderLeft: '4px solid #ec4899',
}

const messageLabel = {
  fontSize: '12px',
  color: '#999',
  textTransform: 'uppercase' as const,
  margin: '0 0 10px 0',
}

const messagePreview = {
  fontSize: '15px',
  fontStyle: 'italic',
  color: '#333',
  margin: '0',
  lineHeight: '24px',
}

const tipsSection = {
  padding: '0 20px',
}

const tipsHeading = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 15px 0',
}

const tipItem = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 8px 0',
  lineHeight: '22px',
}

const urgencySection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '15px 20px',
  margin: '20px',
}

const urgencyText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  textAlign: 'center' as const,
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '20px',
}

const primaryButton = {
  backgroundColor: '#ec4899',
  borderRadius: '30px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 40px',
  display: 'inline-block',
}

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
}

const footerText = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '22px',
}

const footerLinks = {
  fontSize: '12px',
  color: '#999',
  margin: '15px 0 0 0',
}

const footerLink = {
  color: '#999',
  textDecoration: 'underline',
}
