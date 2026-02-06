/**
 * MIGRATION LAUNCH HELPER
 *
 * Interactief script voor het lanceren en monitoren van de migratiecampagne.
 *
 * GEBRUIK:
 *   npx tsx scripts/migration-launch.ts status      # Bekijk huidige status
 *   npx tsx scripts/migration-launch.ts preview     # Preview eerste emails
 *   npx tsx scripts/migration-launch.ts send-test   # Stuur test email
 *   npx tsx scripts/migration-launch.ts start       # Start de campagne
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type MigrationSegment = 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT' | 'INACTIVE'

// ============================================
// STATUS COMMAND
// ============================================

async function showStatus(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('           MIGRATION CAMPAGNE STATUS')
  console.log('═══════════════════════════════════════════════════════════════\n')

  // Get overview stats
  const overview = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
      COUNT(*) FILTER (WHERE status = 'EMAIL_SENT') as email_sent,
      COUNT(*) FILTER (WHERE status = 'EMAIL_OPENED') as email_opened,
      COUNT(*) FILTER (WHERE status = 'LINK_CLICKED') as link_clicked,
      COUNT(*) FILTER (WHERE status = 'LANDING_VISITED') as landing_visited,
      COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as claimed
    FROM "MigrationUser"
  `

  const stats = overview[0]
  const total = Number(stats.total)

  if (total === 0) {
    console.log('   ⚠️  Geen migration users gevonden!')
    console.log('   Run eerst: npx tsx scripts/import-oogvoorliefde.ts')
    return
  }

  console.log('📊 OVERZICHT')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   Totaal te migreren:       ${total.toLocaleString('nl-NL')}`)
  console.log()

  // Segment breakdown
  const segments = await prisma.$queryRaw<{ segment: string; count: bigint }[]>`
    SELECT segment, COUNT(*) as count
    FROM "MigrationUser"
    GROUP BY segment
    ORDER BY
      CASE segment
        WHEN 'VIP' THEN 1
        WHEN 'GOLD' THEN 2
        WHEN 'ACTIVE' THEN 3
        WHEN 'DORMANT' THEN 4
        WHEN 'INACTIVE' THEN 5
      END
  `

  const segmentEmojis: Record<string, string> = {
    VIP: '🟣',
    GOLD: '🟡',
    ACTIVE: '🟢',
    DORMANT: '🟠',
    INACTIVE: '⚪'
  }

  console.log('🎯 PER SEGMENT')
  console.log('───────────────────────────────────────────────────────────────')
  for (const seg of segments) {
    const emoji = segmentEmojis[seg.segment] || '⚪'
    console.log(`   ${emoji} ${seg.segment.padEnd(10)} ${Number(seg.count).toLocaleString('nl-NL').padStart(8)}`)
  }
  console.log()

  // Funnel
  console.log('📈 CONVERSIE FUNNEL')
  console.log('───────────────────────────────────────────────────────────────')
  const pending = Number(stats.pending)
  const emailSent = Number(stats.email_sent)
  const emailOpened = Number(stats.email_opened)
  const linkClicked = Number(stats.link_clicked)
  const landingVisited = Number(stats.landing_visited)
  const claimed = Number(stats.claimed)

  const funnelSteps = [
    { name: 'Pending', count: pending, emoji: '📬' },
    { name: 'Email verstuurd', count: emailSent, emoji: '📧' },
    { name: 'Email geopend', count: emailOpened, emoji: '👀' },
    { name: 'Link geklikt', count: linkClicked, emoji: '🖱️' },
    { name: 'Landing bezocht', count: landingVisited, emoji: '🌐' },
    { name: 'Geclaimd', count: claimed, emoji: '✅' },
  ]

  for (const step of funnelSteps) {
    const bar = '█'.repeat(Math.round(step.count / total * 30)) + '░'.repeat(30 - Math.round(step.count / total * 30))
    const pct = total > 0 ? (step.count / total * 100).toFixed(1) : '0'
    console.log(`   ${step.emoji} ${step.name.padEnd(16)} ${bar} ${step.count.toLocaleString('nl-NL').padStart(6)} (${pct}%)`)
  }
  console.log()

  // Email stats
  const emailStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) as total_sent,
      COUNT(*) FILTER (WHERE "openedAt" IS NOT NULL) as opened,
      COUNT(*) FILTER (WHERE "clickedAt" IS NOT NULL) as clicked
    FROM "MigrationEmail"
  `

  if (emailStats[0] && Number(emailStats[0].total_sent) > 0) {
    console.log('📧 EMAIL PERFORMANCE')
    console.log('───────────────────────────────────────────────────────────────')
    const sent = Number(emailStats[0].total_sent)
    const opened = Number(emailStats[0].opened)
    const clicked = Number(emailStats[0].clicked)
    console.log(`   Verstuurd:     ${sent.toLocaleString('nl-NL')}`)
    console.log(`   Open rate:     ${(opened / sent * 100).toFixed(1)}%`)
    console.log(`   Click rate:    ${(clicked / sent * 100).toFixed(1)}%`)
    console.log()
  }

  // Recent activity
  const recentClaims = await prisma.$queryRaw<{ firstName: string; claimedAt: Date }[]>`
    SELECT "firstName", "claimedAt"
    FROM "MigrationUser"
    WHERE status IN ('CLAIMED', 'ACTIVATED')
    ORDER BY "claimedAt" DESC
    LIMIT 5
  `

  if (recentClaims.length > 0) {
    console.log('🎉 RECENTE CLAIMS')
    console.log('───────────────────────────────────────────────────────────────')
    for (const claim of recentClaims) {
      const timeAgo = getTimeAgo(new Date(claim.claimedAt))
      console.log(`   ✅ ${claim.firstName} - ${timeAgo}`)
    }
    console.log()
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'zojuist'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minuten geleden`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} uur geleden`
  return `${Math.floor(seconds / 86400)} dagen geleden`
}

// ============================================
// PREVIEW COMMAND
// ============================================

async function showPreview(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('           EMAIL PREVIEW - Eerste 5 per segment')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const segments: MigrationSegment[] = ['VIP', 'GOLD', 'ACTIVE', 'DORMANT', 'INACTIVE']

  for (const segment of segments) {
    const users = await prisma.$queryRaw<any[]>`
      SELECT "firstName", "oldEmail", "couponCode", "claimToken"
      FROM "MigrationUser"
      WHERE segment = ${segment}::"MigrationSegment"
      AND status = 'PENDING'
      ORDER BY "createdAt" ASC
      LIMIT 5
    `

    if (users.length === 0) continue

    console.log(`🎯 ${segment} (${users.length} shown)`)
    console.log('───────────────────────────────────────────────────────────────')

    for (const user of users) {
      console.log(`   ${user.firstName.padEnd(15)} ${user.oldEmail}`)
      console.log(`      Coupon: ${user.couponCode}`)
      console.log(`      Link:   /welkom/${user.claimToken.substring(0, 8)}...`)
      console.log()
    }
  }
}

// ============================================
// SEND TEST COMMAND
// ============================================

async function sendTestEmail(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('           SEND TEST EMAIL')
  console.log('═══════════════════════════════════════════════════════════════\n')

  // Get first VIP user
  const testUsers = await prisma.$queryRaw<any[]>`
    SELECT id, "firstName", "oldEmail", "couponCode", "claimToken"
    FROM "MigrationUser"
    WHERE status = 'PENDING'
    ORDER BY segment ASC, "createdAt" ASC
    LIMIT 1
  `

  if (testUsers.length === 0) {
    console.log('   ⚠️  Geen pending users gevonden voor test')
    return
  }

  const user = testUsers[0]

  console.log('   Test user:')
  console.log(`   ─────────────────────────────────────────`)
  console.log(`   Naam:     ${user.firstName}`)
  console.log(`   Email:    ${user.oldEmail}`)
  console.log(`   Coupon:   ${user.couponCode}`)
  console.log(`   Link:     /welkom/${user.claimToken}`)
  console.log()

  // Check if email service is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('   ⚠️  RESEND_API_KEY is niet geconfigureerd')
    console.log('   Voeg dit toe aan je .env bestand om emails te versturen')
    console.log()
    console.log('   Preview URL (test lokaal):')
    console.log(`   http://localhost:3000/welkom/${user.claimToken}`)
    return
  }

  console.log('   📧 Versturen van test email...')

  try {
    // Dynamic import to avoid issues if engine not loaded
    const { sendMigrationEmail } = await import('../lib/migration/migration-engine')

    // Note: sendMigrationEmail is internal, we'd need to expose it or use the cron endpoint
    console.log('   ✅ Email functie geladen')
    console.log()
    console.log('   Om een test email te versturen, gebruik:')
    console.log('   curl -X POST http://localhost:3000/api/cron/migration-emails \\')
    console.log('     -H "Authorization: Bearer $CRON_SECRET"')

  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
  }
}

// ============================================
// START COMMAND
// ============================================

async function startCampaign(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('           START MIGRATION CAMPAGNE')
  console.log('═══════════════════════════════════════════════════════════════\n')

  // Check prerequisites
  const checks = {
    users: false,
    emailConfig: false,
    cronSecret: false
  }

  // Check users
  const userCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "MigrationUser" WHERE status = 'PENDING'
  `
  checks.users = Number(userCount[0].count) > 0

  // Check email config
  checks.emailConfig = !!process.env.RESEND_API_KEY

  // Check cron secret
  checks.cronSecret = !!process.env.CRON_SECRET

  console.log('📋 PRE-LAUNCH CHECKLIST')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   ${checks.users ? '✅' : '❌'} Migration users geladen (${Number(userCount[0].count)} pending)`)
  console.log(`   ${checks.emailConfig ? '✅' : '❌'} RESEND_API_KEY geconfigureerd`)
  console.log(`   ${checks.cronSecret ? '✅' : '❌'} CRON_SECRET geconfigureerd`)
  console.log()

  const allGood = checks.users && checks.emailConfig && checks.cronSecret

  if (!allGood) {
    console.log('   ⚠️  Niet alle checks zijn geslaagd. Los bovenstaande issues op.')
    console.log()

    if (!checks.users) {
      console.log('   → Run: npx tsx scripts/import-oogvoorliefde.ts')
    }
    if (!checks.emailConfig) {
      console.log('   → Voeg RESEND_API_KEY toe aan .env')
    }
    if (!checks.cronSecret) {
      console.log('   → Voeg CRON_SECRET toe aan .env')
    }
    return
  }

  console.log('🚀 KLAAR VOOR LAUNCH!')
  console.log('───────────────────────────────────────────────────────────────')
  console.log()
  console.log('   Om de campagne te starten:')
  console.log()
  console.log('   1. Vercel Cron (aanbevolen):')
  console.log('      - Deploy naar Vercel')
  console.log('      - Cron draait automatisch dagelijks om 10:00')
  console.log()
  console.log('   2. Handmatig triggeren:')
  console.log('      curl -X GET https://yourdomain.com/api/cron/migration-emails \\')
  console.log('        -H "Authorization: Bearer YOUR_CRON_SECRET"')
  console.log()
  console.log('   3. Lokaal testen:')
  console.log('      curl -X GET http://localhost:3000/api/cron/migration-emails')
  console.log()

  // Show wave plan
  const segmentCounts = await prisma.$queryRaw<{ segment: string; count: bigint }[]>`
    SELECT segment, COUNT(*) as count
    FROM "MigrationUser"
    WHERE status = 'PENDING'
    GROUP BY segment
  `

  console.log('📅 WAVE PLANNING')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   Wave 1 (Week 1-2): VIP + GOLD')

  const vipCount = segmentCounts.find(s => s.segment === 'VIP')?.count || 0n
  const goldCount = segmentCounts.find(s => s.segment === 'GOLD')?.count || 0n
  console.log(`      VIP:   ${Number(vipCount).toLocaleString('nl-NL')} users`)
  console.log(`      GOLD:  ${Number(goldCount).toLocaleString('nl-NL')} users`)
  console.log()

  console.log('   Wave 2 (Week 3-4): ACTIVE')
  const activeCount = segmentCounts.find(s => s.segment === 'ACTIVE')?.count || 0n
  console.log(`      ACTIVE: ${Number(activeCount).toLocaleString('nl-NL')} users`)
  console.log()

  console.log('   Wave 3 (Week 5-8): DORMANT + INACTIVE')
  const dormantCount = segmentCounts.find(s => s.segment === 'DORMANT')?.count || 0n
  const inactiveCount = segmentCounts.find(s => s.segment === 'INACTIVE')?.count || 0n
  console.log(`      DORMANT:  ${Number(dormantCount).toLocaleString('nl-NL')} users`)
  console.log(`      INACTIVE: ${Number(inactiveCount).toLocaleString('nl-NL')} users`)
  console.log()
}

// ============================================
// MAIN
// ============================================

async function main() {
  const command = process.argv[2] || 'status'

  try {
    switch (command) {
      case 'status':
        await showStatus()
        break
      case 'preview':
        await showPreview()
        break
      case 'send-test':
        await sendTestEmail()
        break
      case 'start':
        await startCampaign()
        break
      default:
        console.log(`
GEBRUIK:
  npx tsx scripts/migration-launch.ts [command]

COMMANDS:
  status      Bekijk huidige campagne status
  preview     Preview eerste emails per segment
  send-test   Verstuur test email
  start       Pre-launch checklist en instructies
        `)
    }
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
