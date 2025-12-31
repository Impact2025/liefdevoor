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

interface WeeklyStats {
  profileViews: number
  profileViewsChange: number // percentage change from last week
  likesReceived: number
  likesReceivedChange: number
  newMatches: number
  messagesSent: number
  messagesReceived: number
}

interface TopViewer {
  name: string
  age: number
  photo: string
  city: string
}

interface WeeklySummaryEmailProps {
  userName: string
  weekNumber: number
  stats: WeeklyStats
  topViewers: TopViewer[]
  unmatchedLikes: number
  unreadMessages: number
  tips: string[]
  highlightMessage?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'

export const WeeklySummaryEmail = ({
  userName = 'daar',
  weekNumber = 1,
  stats = {
    profileViews: 0,
    profileViewsChange: 0,
    likesReceived: 0,
    likesReceivedChange: 0,
    newMatches: 0,
    messagesSent: 0,
    messagesReceived: 0,
  },
  topViewers = [],
  unmatchedLikes = 0,
  unreadMessages = 0,
  tips = [],
  highlightMessage,
}: WeeklySummaryEmailProps) => {
  const previewText = `Je week in cijfers: ${stats.profileViews} profielbezoeken, ${stats.newMatches} nieuwe matches`

  const getChangeEmoji = (change: number) => {
    if (change > 20) return '🚀'
    if (change > 0) return '📈'
    if (change < -20) return '📉'
    if (change < 0) return '↘️'
    return '➡️'
  }

  const getChangeText = (change: number) => {
    if (change > 0) return `+${change}%`
    if (change < 0) return `${change}%`
    return 'gelijk'
  }

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
            <Text style={heroEmoji}>📊</Text>
            <Heading style={heading}>
              Je Weekoverzicht
            </Heading>
            <Text style={subheading}>
              Week {weekNumber} • Hoi {userName}!
            </Text>
          </Section>

          {/* Highlight message */}
          {highlightMessage && (
            <Section style={highlightSection}>
              <Text style={highlightText}>
                ✨ {highlightMessage}
              </Text>
            </Section>
          )}

          {/* Stats Grid */}
          <Section style={statsSection}>
            {/* Profile Views */}
            <Section style={statCard}>
              <Text style={statEmoji}>👀</Text>
              <Text style={statValue}>{stats.profileViews}</Text>
              <Text style={statLabel}>Profielbezoeken</Text>
              <Text style={statChange}>
                {getChangeEmoji(stats.profileViewsChange)} {getChangeText(stats.profileViewsChange)} vs vorige week
              </Text>
            </Section>

            {/* Likes Received */}
            <Section style={statCard}>
              <Text style={statEmoji}>❤️</Text>
              <Text style={statValue}>{stats.likesReceived}</Text>
              <Text style={statLabel}>Likes ontvangen</Text>
              <Text style={statChange}>
                {getChangeEmoji(stats.likesReceivedChange)} {getChangeText(stats.likesReceivedChange)} vs vorige week
              </Text>
            </Section>

            {/* New Matches */}
            <Section style={statCard}>
              <Text style={statEmoji}>💕</Text>
              <Text style={statValue}>{stats.newMatches}</Text>
              <Text style={statLabel}>Nieuwe matches</Text>
            </Section>

            {/* Messages */}
            <Section style={statCard}>
              <Text style={statEmoji}>💬</Text>
              <Text style={statValue}>{stats.messagesSent + stats.messagesReceived}</Text>
              <Text style={statLabel}>Berichten</Text>
              <Text style={statChange}>
                {stats.messagesSent} verzonden • {stats.messagesReceived} ontvangen
              </Text>
            </Section>
          </Section>

          {/* Top Viewers */}
          {topViewers.length > 0 && (
            <Section style={viewersSection}>
              <Heading style={sectionHeading}>
                👀 Wie bekeek jouw profiel
              </Heading>
              <Section style={viewersGrid}>
                {topViewers.slice(0, 3).map((viewer, index) => (
                  <Section key={index} style={viewerCard}>
                    <Img
                      src={viewer.photo}
                      width="60"
                      height="60"
                      alt={viewer.name}
                      style={viewerImage}
                    />
                    <Text style={viewerName}>{viewer.name}, {viewer.age}</Text>
                    <Text style={viewerCity}>📍 {viewer.city}</Text>
                  </Section>
                ))}
              </Section>
              <Button style={secondaryButton} href={`${baseUrl}/dashboard/visitors`}>
                Bekijk alle bezoekers
              </Button>
            </Section>
          )}

          {/* Action Items */}
          {(unmatchedLikes > 0 || unreadMessages > 0) && (
            <Section style={actionSection}>
              <Heading style={sectionHeading}>
                ⚡ Actie nodig
              </Heading>
              {unmatchedLikes > 0 && (
                <Section style={actionItem}>
                  <Text style={actionIcon}>❤️</Text>
                  <Text style={actionText}>
                    <strong>{unmatchedLikes}</strong> mensen hebben je geliked - bekijk ze!
                  </Text>
                  <Button style={actionButton} href={`${baseUrl}/discover`}>
                    Bekijk
                  </Button>
                </Section>
              )}
              {unreadMessages > 0 && (
                <Section style={actionItem}>
                  <Text style={actionIcon}>💬</Text>
                  <Text style={actionText}>
                    <strong>{unreadMessages}</strong> ongelezen berichten wachten op je
                  </Text>
                  <Button style={actionButton} href={`${baseUrl}/matches`}>
                    Lees
                  </Button>
                </Section>
              )}
            </Section>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <Section style={tipsSection}>
              <Heading style={sectionHeading}>
                💡 Tips voor deze week
              </Heading>
              {tips.map((tip, index) => (
                <Text key={index} style={tipItem}>
                  • {tip}
                </Text>
              ))}
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={primaryButton} href={`${baseUrl}/discover`}>
              Start je week goed
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Elke zondag sturen we je een weekoverzicht.<br />
              Met liefde, Het Liefde Voor Iedereen Team
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

export default WeeklySummaryEmail

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
  margin: '0 0 10px 0',
}

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
}

const subheading = {
  fontSize: '16px',
  color: '#666',
  margin: '0',
}

const highlightSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '15px 20px',
  margin: '0 20px 20px 20px',
  textAlign: 'center' as const,
}

const highlightText = {
  fontSize: '15px',
  color: '#92400e',
  margin: '0',
  fontWeight: '500',
}

const statsSection = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '15px',
  padding: '0 20px',
  marginBottom: '25px',
}

const statCard = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
}

const statEmoji = {
  fontSize: '28px',
  margin: '0 0 10px 0',
}

const statValue = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#ec4899',
  margin: '0',
}

const statLabel = {
  fontSize: '13px',
  color: '#666',
  margin: '5px 0',
}

const statChange = {
  fontSize: '11px',
  color: '#999',
  margin: '0',
}

const viewersSection = {
  padding: '0 20px',
  textAlign: 'center' as const,
}

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 20px 0',
}

const viewersGrid = {
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  marginBottom: '20px',
}

const viewerCard = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '15px',
  textAlign: 'center' as const,
  minWidth: '100px',
}

const viewerImage = {
  borderRadius: '50%',
  margin: '0 auto 10px auto',
  border: '3px solid #fce7f3',
}

const viewerName = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#333',
  margin: '0',
}

const viewerCity = {
  fontSize: '11px',
  color: '#666',
  margin: '5px 0 0 0',
}

const secondaryButton = {
  backgroundColor: '#fff',
  border: '2px solid #ec4899',
  borderRadius: '20px',
  color: '#ec4899',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '10px 25px',
  display: 'inline-block',
}

const actionSection = {
  padding: '0 20px',
  marginBottom: '25px',
}

const actionItem = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '15px 20px',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
}

const actionIcon = {
  fontSize: '24px',
  margin: '0',
}

const actionText = {
  fontSize: '14px',
  color: '#333',
  margin: '0',
  flex: '1',
}

const actionButton = {
  backgroundColor: '#ec4899',
  borderRadius: '15px',
  color: '#fff',
  fontSize: '12px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '8px 15px',
}

const tipsSection = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 20px 25px 20px',
}

const tipItem = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 8px 0',
  lineHeight: '22px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
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

const hr = {
  borderColor: '#ffe4e9',
  margin: '30px 0',
}

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
}

const footerText = {
  fontSize: '13px',
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
