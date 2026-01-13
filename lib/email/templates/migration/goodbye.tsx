/**
 * Migration Goodbye Email Template
 *
 * Day 28: Final email before data deletion
 */

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
  Section
} from '@react-email/components'

const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#6b7280',
  website: 'https://liefdevooriedereen.nl'
}

interface MigrationGoodbyeEmailProps {
  userName: string
  landingUrl: string
  photoCount: number
  messageCount: number
  memberSinceYear: number
}

export default function MigrationGoodbyeEmail({
  userName = 'daar',
  landingUrl = 'https://liefdevooriedereen.nl/welkom/token',
  photoCount = 12,
  messageCount = 47,
  memberSinceYear = 2019
}: MigrationGoodbyeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="160"
              height="auto"
              alt={BRAND.name}
            />
          </Section>

          {/* Content */}
          <Section style={styles.content}>

            <Heading style={styles.h1}>
              Vaarwel, {userName}
            </Heading>

            <Text style={styles.text}>
              Dit is onze laatste mail. We respecteren je keuze om niet
              over te stappen naar LiefdevoorIedereen.
            </Text>

            {/* Data Summary */}
            <Section style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>
                Wat er wordt verwijderd:
              </Text>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={styles.summaryItem}>📸 {photoCount} foto's</td>
                </tr>
                <tr>
                  <td style={styles.summaryItem}>💬 {messageCount} berichten</td>
                </tr>
                <tr>
                  <td style={styles.summaryItem}>📅 Account sinds {memberSinceYear}</td>
                </tr>
                <tr>
                  <td style={styles.summaryItem}>👤 Je volledige profiel</td>
                </tr>
              </table>
              <Text style={styles.summaryNote}>
                Deze gegevens worden binnen 7 dagen permanent verwijderd
                conform de AVG-wetgeving.
              </Text>
            </Section>

            {/* Change Mind Section */}
            <Section style={styles.changeMindSection}>
              <Text style={styles.changeMindTitle}>
                Van gedachten veranderd?
              </Text>
              <Text style={styles.changeMindText}>
                Je hebt nog <strong>7 dagen</strong> om je account te activeren
                en al je data te behouden. Daarna is dit niet meer mogelijk.
              </Text>
              <Button href={landingUrl} style={styles.button}>
                Toch Activeren
              </Button>
            </Section>

            {/* Thank You */}
            <Section style={styles.thankYouSection}>
              <Text style={styles.thankYouText}>
                Bedankt dat je lid was van OogvoorLiefde sinds {memberSinceYear}.
                We wensen je veel geluk en liefde toe.
              </Text>
              <Text style={styles.heartIcon}>
                💝
              </Text>
            </Section>

          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Dit is de laatste mail die je van ons ontvangt over de migratie.
            </Text>
            <Text style={styles.footerCompany}>
              {BRAND.name}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '16px',
    maxWidth: '600px',
    overflow: 'hidden' as const
  },
  header: {
    backgroundColor: '#f9fafb',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  content: {
    padding: '40px'
  },
  h1: {
    color: '#374151',
    fontSize: '28px',
    fontWeight: '700' as const,
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  text: {
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#6b7280',
    margin: '0 0 32px',
    textAlign: 'center' as const
  },
  summaryBox: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#374151',
    margin: '0 0 16px',
    textAlign: 'center' as const
  },
  summaryItem: {
    fontSize: '15px',
    color: '#6b7280',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  summaryNote: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '16px 0 0',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const
  },
  changeMindSection: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'center' as const
  },
  changeMindTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#92400e',
    margin: '0 0 8px'
  },
  changeMindText: {
    fontSize: '15px',
    color: '#92400e',
    margin: '0 0 16px',
    lineHeight: '1.5'
  },
  button: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    display: 'inline-block'
  },
  thankYouSection: {
    textAlign: 'center' as const,
    padding: '24px 0'
  },
  thankYouText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 16px',
    lineHeight: '1.6'
  },
  heartIcon: {
    fontSize: '48px',
    margin: '0'
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 8px'
  },
  footerCompany: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
    fontWeight: '500' as const
  }
}
