/**
 * Birthday Email Template - World Class
 *
 * Beautiful, personalized birthday email with match suggestions
 */

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Img,
  Hr,
  Section,
  Row,
  Column
} from '@react-email/components'

interface BirthdayEmailProps {
  userName: string
  age: number
  newMatchesCount: number
  featuredMatch?: {
    name: string
    age: number
    photo: string
    city: string
  }
  isPremium: boolean
}

export default function BirthdayEmail({
  userName = 'daar',
  age = 25,
  newMatchesCount = 5,
  featuredMatch,
  isPremium = false
}: BirthdayEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Animated Birthday Banner */}
          <Section style={styles.bannerSection}>
            <Text style={styles.banner}>🎉 🎂 🎈</Text>
          </Section>

          {/* Main Heading */}
          <Heading style={styles.h1}>
            Gefeliciteerd {userName}!
          </Heading>

          {/* Age Celebration */}
          <Text style={styles.ageText}>
            🎂 Je bent vandaag <strong>{age}</strong> geworden!
          </Text>

          {/* Birthday Message */}
          <Text style={styles.text}>
            Een nieuwe levensjaar, nieuwe kansen op liefde! ❤️
          </Text>

          <Hr style={styles.hr} />

          {/* Match Teaser */}
          {newMatchesCount > 0 && (
            <>
              <Section style={styles.highlightBox}>
                <Text style={styles.highlightText}>
                  🎁 <strong>Verjaardagscadeau:</strong>
                  <br />
                  We hebben <strong>{newMatchesCount} nieuwe matches</strong> voor je gevonden!
                </Text>
              </Section>

              {/* Featured Match (if available) */}
              {featuredMatch && (
                <Section style={styles.matchCard}>
                  <Img
                    src={featuredMatch.photo}
                    width="120"
                    height="120"
                    style={styles.matchPhoto}
                    alt={featuredMatch.name}
                  />
                  <Text style={styles.matchText}>
                    <strong>{featuredMatch.name}, {featuredMatch.age}</strong>
                    <br />
                    📍 {featuredMatch.city}
                  </Text>
                  <Text style={styles.matchSubtext}>
                    Misschien is dit wel je perfecte match? 💘
                  </Text>
                </Section>
              )}
            </>
          )}

          {/* Premium Birthday Bonus */}
          {isPremium && (
            <Section style={styles.premiumBox}>
              <Text style={styles.premiumHeading}>
                ⭐ <strong>Premium Verjaardagsbonus:</strong>
              </Text>
              <ul style={styles.bonusList}>
                <li style={styles.bonusItem}>🚀 Gratis Boost vandaag (3x meer zichtbaar!)</li>
                <li style={styles.bonusItem}>💫 Unlimited likes voor 24 uur</li>
                <li style={styles.bonusItem}>🎂 Special Birthday badge op je profiel</li>
              </ul>
              <Text style={styles.premiumNote}>
                Je bonussen zijn automatisch geactiveerd! 🎉
              </Text>
            </Section>
          )}

          {/* Free User Upgrade Prompt */}
          {!isPremium && newMatchesCount > 0 && (
            <Section style={styles.upgradeBox}>
              <Text style={styles.upgradeHeading}>
                🎁 <strong>Verjaardag Special:</strong>
              </Text>
              <Text style={styles.upgradeText}>
                Upgrade vandaag naar Premium met <strong>50% korting</strong>!
                <br />
                <br />
                🚀 10x meer matches
                <br />
                💬 Onbeperkt chatten
                <br />
                ⭐ Zie wie jou leuk vindt
              </Text>
              <Text style={styles.upgradeSubtext}>
                Deze aanbieding vervalt om middernacht! ⏰
              </Text>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={styles.ctaSection}>
            <Button
              href={`http://localhost:3004/discover?birthday=true&utm_source=birthday_email&utm_campaign=birthday_${new Date().getFullYear()}`}
              style={styles.button}
            >
              🎉 Bekijk je matches!
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Sweet Message */}
          <Text style={styles.footer}>
            We hopen dat je een geweldige dag hebt!
            <br />
            Maak er een mooie {age}e! 🎈
          </Text>

          {/* Signature */}
          <Text style={styles.signature}>
            Met liefde,
            <br />
            Het Liefde Voor Iedereen Team ❤️
          </Text>

          {/* Unsubscribe */}
          <Text style={styles.unsubscribe}>
            Je ontvangt deze email omdat het je verjaardag is.
            <br />
            Wil je geen verjaardagsemails meer ontvangen?
            <a href="http://localhost:3004/settings/email-preferences" style={styles.unsubscribeLink}>
              Klik hier
            </a>
          </Text>

        </Container>
      </Body>
    </Html>
  )
}

// Styles
const styles = {
  body: {
    backgroundColor: '#fff5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '40px 30px',
    borderRadius: '16px',
    maxWidth: '600px',
    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.15)'
  },
  bannerSection: {
    textAlign: 'center' as const,
    marginBottom: '20px'
  },
  banner: {
    fontSize: '48px',
    textAlign: 'center' as const,
    margin: '0',
    letterSpacing: '10px'
  },
  h1: {
    color: '#ec4899',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 20px',
    lineHeight: '1.2'
  },
  ageText: {
    fontSize: '24px',
    textAlign: 'center' as const,
    color: '#374151',
    margin: '0 0 20px',
    lineHeight: '1.4'
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#4b5563',
    textAlign: 'center' as const,
    margin: '0 0 20px'
  },
  hr: {
    borderColor: '#f3f4f6',
    margin: '30px 0'
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
    textAlign: 'center' as const
  },
  highlightText: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#92400e',
    margin: '0'
  },
  matchCard: {
    backgroundColor: '#fdf2f8',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
    margin: '20px 0'
  },
  matchPhoto: {
    borderRadius: '60px',
    margin: '0 auto 15px',
    display: 'block'
  },
  matchText: {
    fontSize: '18px',
    color: '#374151',
    margin: '0 0 8px',
    fontWeight: '600'
  },
  matchSubtext: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
    fontStyle: 'italic'
  },
  premiumBox: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0'
  },
  premiumHeading: {
    color: '#ffffff',
    fontSize: '18px',
    textAlign: 'center' as const,
    margin: '0 0 15px',
    fontWeight: '700'
  },
  bonusList: {
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '28px',
    margin: '0 0 15px',
    paddingLeft: '20px'
  },
  bonusItem: {
    marginBottom: '8px'
  },
  premiumNote: {
    color: '#ffffff',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0',
    fontStyle: 'italic'
  },
  upgradeBox: {
    backgroundColor: '#dbeafe',
    border: '2px dashed #3b82f6',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
    textAlign: 'center' as const
  },
  upgradeHeading: {
    color: '#1e40af',
    fontSize: '18px',
    margin: '0 0 12px',
    fontWeight: '700'
  },
  upgradeText: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#1e40af',
    margin: '0 0 12px'
  },
  upgradeSubtext: {
    fontSize: '14px',
    color: '#3b82f6',
    margin: '0',
    fontWeight: '600'
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '30px 0'
  },
  button: {
    backgroundColor: '#ec4899',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 40px',
    borderRadius: '12px',
    margin: '0'
  },
  footer: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '20px 0'
  },
  signature: {
    fontSize: '15px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    margin: '20px 0'
  },
  unsubscribe: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '30px 0 0',
    lineHeight: '18px'
  },
  unsubscribeLink: {
    color: '#6b7280',
    textDecoration: 'underline'
  }
}
