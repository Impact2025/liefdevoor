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

interface SuperLikeNotificationEmailProps {
  userName: string
  senderName: string
  senderAge: number
  senderPhoto: string
  senderCity: string
  senderBio?: string
  personalMessage?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'

export const SuperLikeNotificationEmail = ({
  userName = 'daar',
  senderName = 'Thomas',
  senderAge = 32,
  senderPhoto = 'https://via.placeholder.com/150',
  senderCity = 'Amsterdam',
  senderBio,
  personalMessage,
}: SuperLikeNotificationEmailProps) => {
  const previewText = `💝 ${senderName} heeft je een Super Like gegeven!`

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

          {/* Hero - Special Super Like Design */}
          <Section style={heroSection}>
            <Section style={superLikeBadge}>
              <Text style={superLikeIcon}>💝</Text>
              <Text style={superLikeText}>SUPER LIKE</Text>
            </Section>
            <Heading style={heading}>
              Iemand is echt onder de indruk!
            </Heading>
            <Text style={subheading}>
              {senderName} heeft jou een Super Like gegeven
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Explanation */}
          <Section style={explanationSection}>
            <Text style={explanationText}>
              Super Likes zijn zeldzaam en speciaal. {senderName} wil hiermee zeggen
              dat jij echt opvalt tussen alle anderen. Dit is geen gewone like -
              dit is iemand die jou écht wil leren kennen!
            </Text>
          </Section>

          {/* Sender Profile Card */}
          <Section style={profileCard}>
            <Section style={profileHeader}>
              <Section style={profileImageContainer}>
                <Img
                  src={senderPhoto}
                  width="120"
                  height="120"
                  alt={senderName}
                  style={profileImage}
                />
                <Text style={superLikeBadgeSmall}>💝</Text>
              </Section>
              <Heading style={profileName}>
                {senderName}, {senderAge}
              </Heading>
              <Text style={profileLocation}>
                📍 {senderCity}
              </Text>
            </Section>

            {senderBio && (
              <Section style={bioSection}>
                <Text style={bioText}>
                  "{senderBio}"
                </Text>
              </Section>
            )}
          </Section>

          {/* Personal Message if included */}
          {personalMessage && (
            <Section style={messageSection}>
              <Text style={messageLabel}>
                {senderName} stuurde je ook een persoonlijk bericht:
              </Text>
              <Section style={messageCard}>
                <Text style={messageText}>
                  "{personalMessage}"
                </Text>
              </Section>
            </Section>
          )}

          {/* Stats about Super Likes */}
          <Section style={statsSection}>
            <Text style={statItem}>
              ⭐ Super Likes hebben <strong>3x meer kans</strong> op een match
            </Text>
            <Text style={statItem}>
              💕 Gemiddeld leidt <strong>1 op 3</strong> Super Like matches tot een date
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Benieuwd wie {senderName} is?
            </Text>
            <Button style={primaryButton} href={`${baseUrl}/discover`}>
              Bekijk {senderName}'s profiel
            </Button>
            <Text style={hintText}>
              Like terug voor een directe match! 💕
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
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SuperLikeNotificationEmail

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
  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
  borderRadius: '16px',
  margin: '0 20px',
}

const superLikeBadge = {
  backgroundColor: '#ec4899',
  borderRadius: '30px',
  padding: '10px 25px',
  display: 'inline-block',
  marginBottom: '20px',
}

const superLikeIcon = {
  fontSize: '24px',
  display: 'inline',
  margin: '0 8px 0 0',
  verticalAlign: 'middle',
}

const superLikeText = {
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '2px',
  display: 'inline',
  verticalAlign: 'middle',
  margin: '0',
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

const explanationSection = {
  padding: '0 20px',
}

const explanationText = {
  fontSize: '15px',
  color: '#666',
  lineHeight: '24px',
  textAlign: 'center' as const,
}

const profileCard = {
  backgroundColor: '#fff',
  borderRadius: '20px',
  padding: '30px',
  margin: '20px',
  textAlign: 'center' as const,
  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.15)',
  border: '2px solid #fce7f3',
}

const profileHeader = {
  marginBottom: '20px',
}

const profileImageContainer = {
  position: 'relative' as const,
  display: 'inline-block',
  marginBottom: '15px',
}

const profileImage = {
  borderRadius: '50%',
  border: '4px solid #ec4899',
  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
}

const superLikeBadgeSmall = {
  position: 'absolute' as const,
  bottom: '-5px',
  right: '-5px',
  backgroundColor: '#fff',
  borderRadius: '50%',
  width: '35px',
  height: '35px',
  fontSize: '20px',
  lineHeight: '35px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  margin: '0',
}

const profileName = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 5px 0',
}

const profileLocation = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
}

const bioSection = {
  backgroundColor: '#fdf2f8',
  borderRadius: '12px',
  padding: '15px',
  marginTop: '15px',
}

const bioText = {
  fontSize: '14px',
  fontStyle: 'italic',
  color: '#333',
  margin: '0',
  lineHeight: '22px',
}

const messageSection = {
  padding: '0 20px',
}

const messageLabel = {
  fontSize: '13px',
  color: '#666',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
}

const messageCard = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '20px',
  borderLeft: '4px solid #ec4899',
}

const messageText = {
  fontSize: '15px',
  color: '#333',
  margin: '0',
  lineHeight: '24px',
  fontStyle: 'italic',
}

const statsSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px',
}

const statItem = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 10px 0',
  lineHeight: '22px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '20px',
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
  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
}

const hintText = {
  fontSize: '14px',
  color: '#ec4899',
  margin: '15px 0 0 0',
  fontWeight: '500',
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
