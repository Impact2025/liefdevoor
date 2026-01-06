/**
 * Admin Alert: Daily Management Report
 *
 * Sent every morning with key platform metrics
 */

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Img,
  Hr
} from '@react-email/components'

// Brand configuration
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  dangerColor: '#ef4444',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'admin@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

interface DailyManagementReportProps {
  reportDate: Date
  // User metrics
  totalUsers: number
  newUsersYesterday: number
  newUsersThisWeek: number
  activeUsersYesterday: number
  onlineNow: number
  // Match & engagement metrics
  totalMatches: number
  newMatchesYesterday: number
  messagesYesterday: number
  // Revenue metrics
  activeSubscriptions: number
  premiumUsers: number
  goldUsers: number
  revenueYesterday: number
  // Safety metrics
  pendingReports: number
  scamDetectionsYesterday: number
  blocksYesterday: number
  verificationsYesterday: number
  systemStatus: 'OK' | 'WARNING' | 'CRITICAL'
  // Funnel metrics (last 7 days)
  funnelVisitors: number
  funnelRegistrations: number
  funnelProfileComplete: number
  funnelFirstSwipe: number
  funnelFirstMatch: number
  funnelFirstMessage: number
  // Errors
  activeErrors: number
}

export default function DailyManagementReport({
  reportDate = new Date(),
  totalUsers = 1234,
  newUsersYesterday = 45,
  newUsersThisWeek = 312,
  activeUsersYesterday = 567,
  onlineNow = 89,
  totalMatches = 5678,
  newMatchesYesterday = 123,
  messagesYesterday = 2345,
  activeSubscriptions = 234,
  premiumUsers = 156,
  goldUsers = 78,
  revenueYesterday = 456.50,
  pendingReports = 12,
  scamDetectionsYesterday = 3,
  blocksYesterday = 8,
  verificationsYesterday = 25,
  systemStatus = 'OK',
  funnelVisitors = 2847,
  funnelRegistrations = 892,
  funnelProfileComplete = 634,
  funnelFirstSwipe = 521,
  funnelFirstMatch = 287,
  funnelFirstMessage = 198,
  activeErrors = 2
}: DailyManagementReportProps) {
  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(reportDate)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return BRAND.successColor
      case 'WARNING': return BRAND.warningColor
      case 'CRITICAL': return BRAND.dangerColor
      default: return BRAND.textMuted
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'OK': return '✅'
      case 'WARNING': return '⚠️'
      case 'CRITICAL': return '🚨'
      default: return '❓'
    }
  }

  // Calculate conversion rates
  const registrationRate = funnelVisitors > 0 ? Math.round((funnelRegistrations / funnelVisitors) * 100) : 0
  const activationRate = funnelRegistrations > 0 ? Math.round((funnelFirstSwipe / funnelRegistrations) * 100) : 0
  const matchRate = funnelFirstSwipe > 0 ? Math.round((funnelFirstMatch / funnelFirstSwipe) * 100) : 0

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={BRAND.logoUrl}
              width="140"
              height="auto"
              alt={BRAND.name}
              style={styles.logo}
            />
            <Text style={styles.headerBadge}>
              📊 DAGELIJKS RAPPORT
            </Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            {/* Title & Date */}
            <Heading style={styles.h1}>
              Management Rapportage
            </Heading>
            <Text style={styles.dateText}>
              {formattedDate}
            </Text>

            {/* System Status */}
            <Section style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(systemStatus) + '20',
              borderColor: getStatusColor(systemStatus)
            }}>
              <Text style={{
                ...styles.statusText,
                color: getStatusColor(systemStatus)
              }}>
                {getStatusEmoji(systemStatus)} Systeem Status: {systemStatus}
                {activeErrors > 0 && ` (${activeErrors} actieve errors)`}
              </Text>
            </Section>

            {/* Quick Stats Grid */}
            <Section style={styles.statsGrid}>
              {/* Users */}
              <Section style={styles.statCard}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statValue}>{totalUsers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Totaal Users</Text>
                <Text style={styles.statChange}>+{newUsersYesterday} gisteren</Text>
              </Section>

              {/* Matches */}
              <Section style={styles.statCard}>
                <Text style={styles.statIcon}>💕</Text>
                <Text style={styles.statValue}>{totalMatches.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Totaal Matches</Text>
                <Text style={styles.statChange}>+{newMatchesYesterday} gisteren</Text>
              </Section>

              {/* Revenue */}
              <Section style={styles.statCard}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statValue}>{activeSubscriptions}</Text>
                <Text style={styles.statLabel}>Actieve Abonnementen</Text>
                <Text style={styles.statChange}>€{revenueYesterday.toFixed(2)} gisteren</Text>
              </Section>

              {/* Active */}
              <Section style={styles.statCard}>
                <Text style={styles.statIcon}>🟢</Text>
                <Text style={styles.statValue}>{activeUsersYesterday}</Text>
                <Text style={styles.statLabel}>Actief Gisteren</Text>
                <Text style={styles.statChange}>{onlineNow} nu online</Text>
              </Section>
            </Section>

            {/* Detailed Metrics */}
            <Section style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>📈 Gebruikers & Engagement</Text>
              <Hr style={styles.hr} />
              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Nieuwe users deze week</td>
                  <td style={styles.detailValue}>{newUsersThisWeek}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Berichten gisteren</td>
                  <td style={styles.detailValue}>{messagesYesterday.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Premium users</td>
                  <td style={styles.detailValue}>{premiumUsers}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Gold users</td>
                  <td style={styles.detailValue}>{goldUsers}</td>
                </tr>
              </table>
            </Section>

            {/* Conversion Funnel */}
            <Section style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>🎯 Conversie Funnel (7 dagen)</Text>
              <Hr style={styles.hr} />
              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Bezoekers</td>
                  <td style={styles.detailValue}>{funnelVisitors.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>→ Registraties</td>
                  <td style={styles.detailValue}>{funnelRegistrations} ({registrationRate}%)</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>→ Profiel compleet</td>
                  <td style={styles.detailValue}>{funnelProfileComplete}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>→ Eerste swipe</td>
                  <td style={styles.detailValue}>{funnelFirstSwipe} ({activationRate}% activatie)</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>→ Eerste match</td>
                  <td style={styles.detailValue}>{funnelFirstMatch} ({matchRate}% match rate)</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>→ Eerste bericht</td>
                  <td style={styles.detailValue}>{funnelFirstMessage}</td>
                </tr>
              </table>
            </Section>

            {/* Safety */}
            <Section style={{
              ...styles.detailsBox,
              borderColor: pendingReports > 10 ? BRAND.dangerColor : BRAND.borderColor
            }}>
              <Text style={styles.detailsTitle}>🛡️ Veiligheid</Text>
              <Hr style={styles.hr} />
              <table style={styles.detailsTable}>
                <tr>
                  <td style={styles.detailLabel}>Openstaande reports</td>
                  <td style={{
                    ...styles.detailValue,
                    color: pendingReports > 10 ? BRAND.dangerColor : BRAND.textColor
                  }}>
                    {pendingReports} {pendingReports > 10 ? '⚠️' : ''}
                  </td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Scam detecties gisteren</td>
                  <td style={styles.detailValue}>{scamDetectionsYesterday}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Blokkades gisteren</td>
                  <td style={styles.detailValue}>{blocksYesterday}</td>
                </tr>
                <tr>
                  <td style={styles.detailLabel}>Verificaties gisteren</td>
                  <td style={{...styles.detailValue, color: BRAND.successColor}}>
                    {verificationsYesterday} ✓
                  </td>
                </tr>
              </table>
            </Section>

            {/* Quick Actions */}
            <Section style={styles.actionsBox}>
              <Text style={styles.actionsTitle}>Quick Actions</Text>
              <Section style={styles.buttonGroup}>
                <Button
                  href={`${BRAND.website}/admin/dashboard`}
                  style={styles.primaryButton}
                >
                  Open Dashboard
                </Button>
                <Button
                  href={`${BRAND.website}/admin/dashboard?tab=reports`}
                  style={styles.secondaryButton}
                >
                  Bekijk Reports
                </Button>
              </Section>
            </Section>

            <Text style={styles.footerNote}>
              Dit rapport wordt elke ochtend om 08:00 verzonden. Configureer je voorkeuren in het admin dashboard.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              {BRAND.name} Admin Dashboard
            </Text>
            <Text style={styles.footerEmail}>
              <a href={`mailto:${BRAND.email}`} style={styles.footerLink}>
                {BRAND.email}
              </a>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    borderRadius: '8px',
    maxWidth: '600px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden' as const
  },
  header: {
    backgroundColor: '#1f2937',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  logo: {
    display: 'block',
    margin: '0 auto 12px',
    filter: 'brightness(0) invert(1)'
  },
  headerBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
    margin: '0'
  },
  content: {
    padding: '40px'
  },
  h1: {
    color: BRAND.textColor,
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px',
    textAlign: 'center' as const,
    lineHeight: '1.3'
  },
  dateText: {
    color: BRAND.textMuted,
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0 0 24px'
  },
  statusBadge: {
    textAlign: 'center' as const,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid',
    margin: '0 0 24px'
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0'
  },
  statsGrid: {
    margin: '0 0 24px'
  },
  statCard: {
    display: 'inline-block',
    width: '48%',
    textAlign: 'center' as const,
    padding: '16px 8px',
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    margin: '0 1% 8px 0',
    verticalAlign: 'top' as const
  },
  statIcon: {
    fontSize: '24px',
    margin: '0 0 8px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: BRAND.textColor,
    margin: '0'
  },
  statLabel: {
    fontSize: '12px',
    color: BRAND.textMuted,
    margin: '4px 0 0'
  },
  statChange: {
    fontSize: '11px',
    color: BRAND.successColor,
    margin: '4px 0 0',
    fontWeight: '600'
  },
  detailsBox: {
    backgroundColor: BRAND.bgColor,
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 16px',
    border: `2px solid ${BRAND.borderColor}`
  },
  detailsTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: BRAND.textColor,
    margin: '0 0 12px'
  },
  hr: {
    borderColor: BRAND.borderColor,
    margin: '0 0 12px'
  },
  detailsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  detailLabel: {
    fontSize: '13px',
    color: BRAND.textMuted,
    padding: '6px 0',
    textAlign: 'left' as const
  },
  detailValue: {
    fontSize: '14px',
    color: BRAND.textColor,
    fontWeight: '600',
    padding: '6px 0',
    textAlign: 'right' as const
  },
  actionsBox: {
    margin: '24px 0'
  },
  actionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: BRAND.textColor,
    margin: '0 0 12px',
    textAlign: 'center' as const
  },
  buttonGroup: {
    textAlign: 'center' as const
  },
  primaryButton: {
    backgroundColor: BRAND.primaryColor,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '6px',
    margin: '0 6px 6px 0'
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '6px',
    margin: '0 0 6px 0'
  },
  footerNote: {
    fontSize: '12px',
    color: BRAND.textMuted,
    margin: '0',
    lineHeight: '1.5',
    textAlign: 'center' as const,
    fontStyle: 'italic'
  },
  footer: {
    backgroundColor: '#1f2937',
    padding: '24px 40px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0 0 8px'
  },
  footerEmail: {
    fontSize: '13px',
    margin: '0'
  },
  footerLink: {
    color: '#60a5fa',
    textDecoration: 'none'
  }
}
