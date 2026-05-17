import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Img,
  Section,
  Hr,
} from '@react-email/components'

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#e11d48',
  textColor: '#1f2937',
  textMuted: '#4b5563',
  bgColor: '#fff1f2',
  website: 'https://liefdevooriedereen.nl',
}

interface AmbassadorInviteEmailProps {
  userName: string
  acceptUrl: string
}

export default function AmbassadorInviteEmail({
  userName = 'daar',
  acceptUrl = 'https://liefdevooriedereen.nl/ambassadeur',
}: AmbassadorInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="180"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.greeting}>Hoi {userName}!</Heading>

            <Text style={styles.text}>
              Mijn naam is Vincent.
              Ik ben de baas van Liefde Voor Iedereen.
            </Text>

            <Text style={styles.text}>
              Liefde Voor Iedereen is een datingsite.
              Een datingsite helpt je nieuwe mensen te leren kennen.
              Misschien vind je er een vriend, vriendin of geliefde.
            </Text>

            <Text style={styles.text}>
              <strong>Ik heb een vraag aan jou.</strong>
            </Text>

            <Text style={styles.bigQuestion}>
              Wil jij ambassadeur worden?
            </Text>

            <Text style={styles.text}>
              Een ambassadeur is iemand die ons helpt.
              Dat klinkt misschien moeilijk.
              Maar het is heel gewoon!
            </Text>

            <Section style={styles.listBox}>
              <Text style={styles.listTitle}>Dit doe je als ambassadeur:</Text>
              <Text style={styles.listItem}>💬 Je vertelt aan vrienden of familie over de site.</Text>
              <Text style={styles.listItem}>📝 Je schrijft op wat je goed vindt. En wat beter kan.</Text>
              <Text style={styles.listItem}>💡 Je geeft ideeën voor de site.</Text>
              <Text style={styles.listNote}>Je mag zelf kiezen hoeveel je doet. Er is geen druk.</Text>
            </Section>

            <Section style={styles.rewardsBox}>
              <Text style={styles.listTitle}>Dit krijg je van ons:</Text>
              <Text style={styles.listItem}>🎁 Een jaar lang <strong>gratis lidmaatschap</strong>.</Text>
              <Text style={styles.listItem}>🌟 Je mag als eerste nieuwe dingen op de site uitproberen.</Text>
              <Text style={styles.listItem}>💛 We luisteren echt naar wat jij zegt.</Text>
            </Section>

            <Section style={styles.ctaSection}>
              <Button style={styles.ctaButton} href={acceptUrl}>
                Ja, ik wil ambassadeur worden!
              </Button>
            </Section>

            <Hr style={styles.divider} />

            <Text style={styles.footer}>
              Heb je een vraag? Stuur gerust een berichtje. We antwoorden altijd.
            </Text>

            <Text style={styles.signature}>
              Groeten,<br />
              <strong>Vincent</strong><br />
              Liefde Voor Iedereen
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#f9fafb',
    fontFamily: 'Arial, sans-serif',
    margin: 0,
    padding: '20px 0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  header: {
    backgroundColor: BRAND.bgColor,
    padding: '24px',
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 auto',
  },
  content: {
    padding: '32px 32px 24px',
  },
  greeting: {
    fontSize: '24px',
    color: BRAND.primaryColor,
    margin: '0 0 16px',
  },
  bigQuestion: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: BRAND.primaryColor,
    margin: '20px 0',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: BRAND.textColor,
    margin: '0 0 12px',
  },
  listBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '20px 0',
  },
  rewardsBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '20px 0',
  },
  listTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: BRAND.textColor,
    margin: '0 0 10px',
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: BRAND.textColor,
    margin: '0 0 6px',
  },
  listNote: {
    fontSize: '13px',
    color: BRAND.textMuted,
    margin: '8px 0 0',
    fontStyle: 'italic',
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '28px 0',
  },
  ctaButton: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '24px 0',
  },
  footer: {
    fontSize: '14px',
    color: BRAND.textMuted,
    lineHeight: '1.6',
    margin: '0 0 12px',
  },
  signature: {
    fontSize: '14px',
    color: BRAND.textColor,
    lineHeight: '1.8',
    margin: '0',
  },
}
