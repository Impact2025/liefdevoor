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

type MilestoneType =
  | 'first_match'
  | 'five_matches'
  | 'ten_matches'
  | 'twentyfive_matches'
  | 'fifty_matches'
  | 'first_message_sent'
  | 'first_message_received'
  | 'profile_complete'
  | 'one_week_active'
  | 'one_month_active'
  | 'first_super_like'
  | 'verified_profile'

interface MilestoneEmailProps {
  userName: string
  milestoneType: MilestoneType
  milestoneValue?: number
  nextMilestone?: string
  tips?: string[]
  stats?: {
    label: string
    value: string
  }[]
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'

const milestoneConfig: Record<MilestoneType, {
  emoji: string
  title: string
  message: string
  celebration: string
}> = {
  first_match: {
    emoji: '🎉',
    title: 'Je eerste match!',
    message: 'Gefeliciteerd! Iemand vindt jou ook leuk. Dit is het begin van iets moois!',
    celebration: 'Tip: De eerste 24 uur zijn cruciaal - stuur nu een berichtje!',
  },
  five_matches: {
    emoji: '🔥',
    title: '5 matches bereikt!',
    message: 'Je bent on fire! 5 mensen vinden jou interessant. Keep going!',
    celebration: 'Je doet het geweldig!',
  },
  ten_matches: {
    emoji: '⭐',
    title: '10 matches!',
    message: 'Dubbele cijfers! Je profiel spreekt echt aan.',
    celebration: 'Je bent een echte match-magneet!',
  },
  twentyfive_matches: {
    emoji: '💫',
    title: '25 matches!',
    message: 'Wow, 25 matches! Je bent officieel populair op Liefde Voor Iedereen.',
    celebration: 'Een kwart eeuw aan matches! (Oké, 25 dan)',
  },
  fifty_matches: {
    emoji: '👑',
    title: '50 matches!',
    message: 'VIJFTIG matches! Je bent een ware dating-royalty.',
    celebration: 'Tijd voor een kroon? 👑',
  },
  first_message_sent: {
    emoji: '💬',
    title: 'Eerste bericht verstuurd!',
    message: 'Dapper! De eerste stap is gezet. Nu wachten op antwoord...',
    celebration: 'De moedigste stap is de eerste!',
  },
  first_message_received: {
    emoji: '📬',
    title: 'Je eerste bericht!',
    message: 'Iemand heeft je een bericht gestuurd. Spannend!',
    celebration: 'Nieuwsgierig? Open de chat!',
  },
  profile_complete: {
    emoji: '✅',
    title: 'Profiel 100% compleet!',
    message: 'Een volledig profiel krijgt tot 40% meer matches. Slim bezig!',
    celebration: 'Je bent klaar om te shinen!',
  },
  one_week_active: {
    emoji: '📅',
    title: 'Al een week actief!',
    message: 'Je eerste week zit erop. Hoe bevalt het tot nu toe?',
    celebration: 'Volhouden loont!',
  },
  one_month_active: {
    emoji: '🏆',
    title: 'Een maand lid!',
    message: 'Een hele maand al! Je bent een toegewijde liefdeszoeker.',
    celebration: 'De liefde komt naar degenen die wachten... en actief blijven!',
  },
  first_super_like: {
    emoji: '💝',
    title: 'Je eerste Super Like!',
    message: 'Iemand is ECHT onder de indruk van jou. Super Likes zijn zeldzaam!',
    celebration: 'Je bent special!',
  },
  verified_profile: {
    emoji: '🛡️',
    title: 'Profiel geverifieerd!',
    message: 'Je draagt nu het verificatie-badge. Anderen zien dat je echt bent!',
    celebration: 'Vertrouwen = Meer matches!',
  },
}

export const MilestoneEmail = ({
  userName = 'daar',
  milestoneType = 'first_match',
  milestoneValue,
  nextMilestone,
  tips = [],
  stats = [],
}: MilestoneEmailProps) => {
  const config = milestoneConfig[milestoneType]
  const previewText = `${config.emoji} ${config.title}`

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

          {/* Celebration Hero */}
          <Section style={heroSection}>
            <Text style={celebrationEmoji}>{config.emoji}</Text>
            <Heading style={heading}>
              {config.title}
            </Heading>
            <Text style={userName as any}>
              Gefeliciteerd, {userName}!
            </Text>
          </Section>

          {/* Achievement Card */}
          <Section style={achievementCard}>
            <Text style={achievementMessage}>
              {config.message}
            </Text>
            <Text style={celebrationText}>
              {config.celebration}
            </Text>
          </Section>

          {/* Stats if available */}
          {stats.length > 0 && (
            <Section style={statsSection}>
              <Heading style={statsHeading}>📊 Jouw stats</Heading>
              <Section style={statsGrid}>
                {stats.map((stat, index) => (
                  <Section key={index} style={statItem}>
                    <Text style={statValue}>{stat.value}</Text>
                    <Text style={statLabel}>{stat.label}</Text>
                  </Section>
                ))}
              </Section>
            </Section>
          )}

          {/* Next Milestone */}
          {nextMilestone && (
            <Section style={nextMilestoneSection}>
              <Text style={nextMilestoneLabel}>Volgende doel:</Text>
              <Text style={nextMilestoneText}>{nextMilestone}</Text>
            </Section>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <Section style={tipsSection}>
              <Heading style={tipsHeading}>💡 Tips om door te gaan</Heading>
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
              Ga verder met ontdekken
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Blijf actief voor meer achievements! 🏅
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

export default MilestoneEmail

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
  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
  borderRadius: '16px',
  margin: '0 20px',
}

const celebrationEmoji = {
  fontSize: '70px',
  margin: '0 0 15px 0',
}

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 10px 0',
}

const achievementCard = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '25px',
  margin: '25px 20px',
  textAlign: 'center' as const,
  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)',
}

const achievementMessage = {
  fontSize: '16px',
  color: '#333',
  lineHeight: '26px',
  margin: '0 0 15px 0',
}

const celebrationText = {
  fontSize: '14px',
  color: '#ec4899',
  fontWeight: '600',
  margin: '0',
}

const statsSection = {
  padding: '0 20px',
  marginBottom: '20px',
}

const statsHeading = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 15px 0',
  textAlign: 'center' as const,
}

const statsGrid = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
}

const statItem = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '15px 25px',
  textAlign: 'center' as const,
  minWidth: '100px',
}

const statValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#ec4899',
  margin: '0',
}

const statLabel = {
  fontSize: '12px',
  color: '#666',
  margin: '5px 0 0 0',
}

const nextMilestoneSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '15px 20px',
  margin: '0 20px 20px 20px',
  textAlign: 'center' as const,
}

const nextMilestoneLabel = {
  fontSize: '12px',
  color: '#92400e',
  textTransform: 'uppercase' as const,
  margin: '0 0 5px 0',
}

const nextMilestoneText = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0',
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

const ctaSection = {
  textAlign: 'center' as const,
  padding: '25px 20px',
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
  margin: '25px 0',
}

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
}

const footerText = {
  fontSize: '14px',
  color: '#666',
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
