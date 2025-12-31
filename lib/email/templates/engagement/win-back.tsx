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

interface WinBackEmailProps {
  userName: string
  daysSinceLastVisit: number
  specialOffer?: {
    discount: number
    code: string
    expiresIn: string
  }
  newFeatures: string[]
  successStories?: {
    name: string
    quote: string
  }[]
  personalizedMessage: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'

export const WinBackEmail = ({
  userName = 'daar',
  daysSinceLastVisit = 90,
  specialOffer,
  newFeatures = [],
  successStories = [],
  personalizedMessage,
}: WinBackEmailProps) => {
  const previewText = `${userName}, we missen je! Kom terug met ${specialOffer ? `${specialOffer.discount}% korting` : 'een speciale verrassing'}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header met hartje */}
          <Section style={headerSection}>
            <Img
              src={`${baseUrl}/images/logo.png`}
              width="150"
              height="50"
              alt="Liefde Voor Iedereen"
              style={logo}
            />
          </Section>

          {/* Hero sectie */}
          <Section style={heroSection}>
            <Text style={heroEmoji}>💔</Text>
            <Heading style={heading}>
              We missen je, {userName}!
            </Heading>
            <Text style={subheading}>
              Het is al {daysSinceLastVisit} dagen geleden...
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Persoonlijke boodschap */}
          <Section style={section}>
            <Text style={paragraph}>
              {personalizedMessage || `Hoi ${userName}, we merkten dat je al een tijdje niet meer bent langs geweest. We begrijpen het - soms heb je even een pauze nodig. Maar de liefde wacht niet!`}
            </Text>
          </Section>

          {/* Speciale aanbieding */}
          {specialOffer && (
            <Section style={offerSection}>
              <Text style={offerBadge}>EXCLUSIEVE AANBIEDING</Text>
              <Heading style={offerHeading}>
                {specialOffer.discount}% korting
              </Heading>
              <Text style={offerText}>
                Speciaal voor jou, omdat we je missen
              </Text>
              <Text style={codeBox}>
                Code: <strong>{specialOffer.code}</strong>
              </Text>
              <Text style={expiryText}>
                Geldig tot {specialOffer.expiresIn}
              </Text>
              <Button style={primaryButton} href={`${baseUrl}/subscription?coupon=${specialOffer.code}`}>
                Claim je korting
              </Button>
            </Section>
          )}

          {/* Wat is er nieuw */}
          {newFeatures.length > 0 && (
            <Section style={section}>
              <Heading style={sectionHeading}>
                ✨ Dit heb je gemist
              </Heading>
              {newFeatures.map((feature, index) => (
                <Text key={index} style={featureItem}>
                  • {feature}
                </Text>
              ))}
            </Section>
          )}

          {/* Succesverhalen */}
          {successStories.length > 0 && (
            <Section style={storiesSection}>
              <Heading style={sectionHeading}>
                💕 Recente succesverhalen
              </Heading>
              {successStories.map((story, index) => (
                <Section key={index} style={storyCard}>
                  <Text style={storyQuote}>"{story.quote}"</Text>
                  <Text style={storyName}>— {story.name}</Text>
                </Section>
              ))}
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Jouw perfecte match kan vandaag nog wachten...
            </Text>
            <Button style={primaryButton} href={`${baseUrl}/discover`}>
              Ontdek wie er op je wacht
            </Button>
            <Text style={smallText}>
              Of bekijk eerst je{' '}
              <Link href={`${baseUrl}/dashboard`} style={link}>
                profiel
              </Link>
            </Text>
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
            <Text style={footerAddress}>
              Liefde Voor Iedereen B.V. | Nederland
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WinBackEmail

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
  padding: '30px 20px',
}

const heroEmoji = {
  fontSize: '60px',
  margin: '0 0 20px 0',
}

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 10px 0',
}

const subheading = {
  fontSize: '18px',
  color: '#666',
  margin: '0',
}

const hr = {
  borderColor: '#ffe4e9',
  margin: '30px 0',
}

const section = {
  padding: '0 20px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
}

const offerSection = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '30px',
  margin: '20px',
  textAlign: 'center' as const,
  border: '2px dashed #ec4899',
}

const offerBadge = {
  backgroundColor: '#ec4899',
  color: '#fff',
  fontSize: '12px',
  fontWeight: '700',
  padding: '6px 12px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0 0 15px 0',
}

const offerHeading = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#ec4899',
  margin: '0 0 10px 0',
}

const offerText = {
  fontSize: '16px',
  color: '#666',
  margin: '0 0 20px 0',
}

const codeBox = {
  backgroundColor: '#fdf2f8',
  fontSize: '20px',
  padding: '15px 30px',
  borderRadius: '8px',
  margin: '0 0 10px 0',
  fontFamily: 'monospace',
}

const expiryText = {
  fontSize: '14px',
  color: '#999',
  margin: '0 0 20px 0',
}

const sectionHeading = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '30px 0 15px 0',
}

const featureItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 8px 0',
}

const storiesSection = {
  padding: '0 20px',
}

const storyCard = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '20px',
  margin: '15px 0',
  borderLeft: '4px solid #ec4899',
}

const storyQuote = {
  fontSize: '15px',
  fontStyle: 'italic',
  color: '#333',
  margin: '0 0 10px 0',
  lineHeight: '24px',
}

const storyName = {
  fontSize: '14px',
  color: '#ec4899',
  fontWeight: '600',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '30px 20px',
}

const ctaText = {
  fontSize: '18px',
  color: '#333',
  margin: '0 0 20px 0',
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

const smallText = {
  fontSize: '14px',
  color: '#666',
  margin: '20px 0 0 0',
}

const link = {
  color: '#ec4899',
  textDecoration: 'underline',
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
  margin: '20px 0 10px 0',
}

const footerLink = {
  color: '#999',
  textDecoration: 'underline',
}

const footerAddress = {
  fontSize: '11px',
  color: '#bbb',
  margin: '0',
}
