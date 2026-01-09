/**
 * PROFESSIONELE ANALYSE: Registratie & Onboarding Problemen
 *
 * Dit script analyseert:
 * 1. Onboarding completion rates per stap
 * 2. Email verificatie delivery & open rates
 * 3. Registratie patronen (spam vs legitimate)
 * 4. Time-to-action metrics
 * 5. Audit log analyse voor errors
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deepAnalysis() {
  console.log('🔍 PROFESSIONELE REGISTRATIE & ONBOARDING ANALYSE')
  console.log('=' .repeat(80))
  console.log()

  try {
    // ==================== DATASET OVERZICHT ====================
    console.log('📊 DATASET OVERZICHT\n')

    const totalUsers = await prisma.user.count()
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: last7Days } }
    })

    const todayUsers = await prisma.user.count({
      where: { createdAt: { gte: last24Hours } }
    })

    console.log(`   Totaal gebruikers: ${totalUsers.toLocaleString()}`)
    console.log(`   Laatste 24 uur: ${todayUsers}`)
    console.log(`   Laatste 7 dagen: ${recentUsers}`)
    console.log()

    // ==================== ONBOARDING ANALYSE ====================
    console.log('🎯 ONBOARDING FLOW ANALYSE\n')

    // Stap distributie
    const stepDistribution = await prisma.$queryRaw<Array<{ onboardingStep: number; count: bigint }>>`
      SELECT "onboardingStep", COUNT(*)::bigint as count
      FROM "User"
      WHERE "isOnboarded" = false
      GROUP BY "onboardingStep"
      ORDER BY "onboardingStep"
    `

    console.log('   Drop-off per stap (NIET onboarded):')
    let totalIncomplete = 0
    for (const row of stepDistribution) {
      const count = Number(row.count)
      totalIncomplete += count
      console.log(`      Stap ${row.onboardingStep}: ${count.toLocaleString()} gebruikers`)
    }

    const onboardedCount = await prisma.user.count({
      where: { isOnboarded: true }
    })

    const completionRate = totalUsers > 0 ? (onboardedCount / totalUsers * 100).toFixed(1) : '0'
    console.log(`\n   ✅ Onboarding voltooid: ${onboardedCount.toLocaleString()} (${completionRate}%)`)
    console.log(`   ❌ Niet voltooid: ${totalIncomplete.toLocaleString()} (${(100 - Number(completionRate)).toFixed(1)}%)`)

    // Time to complete onboarding
    const avgTimeToOnboard = await prisma.$queryRaw<Array<{ avg_minutes: number }>>`
      SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 60)::float as avg_minutes
      FROM "User"
      WHERE "isOnboarded" = true
      AND "createdAt" > NOW() - INTERVAL '30 days'
    `

    if (avgTimeToOnboard[0]?.avg_minutes) {
      const minutes = Math.round(avgTimeToOnboard[0].avg_minutes)
      console.log(`   ⏱️  Gemiddelde tijd tot onboarding: ${minutes} minuten`)
    }

    console.log()

    // ==================== EMAIL VERIFICATIE ====================
    console.log('✉️  EMAIL VERIFICATIE ANALYSE\n')

    const emailStats = await prisma.user.groupBy({
      by: ['emailVerified'],
      where: {
        createdAt: { gte: last30Days }
      },
      _count: true
    })

    const verified = emailStats.find(s => s.emailVerified !== null)?._count || 0
    const unverified = emailStats.find(s => s.emailVerified === null)?._count || 0
    const total = verified + unverified

    const verificationRate = total > 0 ? (verified / total * 100).toFixed(1) : '0'
    console.log(`   Laatste 30 dagen:`)
    console.log(`   ✅ Geverifieerd: ${verified} (${verificationRate}%)`)
    console.log(`   ❌ Niet geverifieerd: ${unverified} (${(100 - Number(verificationRate)).toFixed(1)}%)`)

    // Time to verify email
    const avgTimeToVerify = await prisma.$queryRaw<Array<{ avg_minutes: number }>>`
      SELECT AVG(EXTRACT(EPOCH FROM ("emailVerified" - "createdAt")) / 60)::float as avg_minutes
      FROM "User"
      WHERE "emailVerified" IS NOT NULL
      AND "createdAt" > NOW() - INTERVAL '30 days'
    `

    if (avgTimeToVerify[0]?.avg_minutes) {
      const minutes = Math.round(avgTimeToVerify[0].avg_minutes)
      console.log(`   ⏱️  Gemiddelde tijd tot verificatie: ${minutes} minuten`)
    }

    // Email verificatie emails check
    const verificationEmailsSent = await prisma.emailLog.count({
      where: {
        category: 'VERIFICATION',
        sentAt: { gte: last7Days }
      }
    })

    const verificationEmailsFailed = await prisma.emailLog.count({
      where: {
        category: 'VERIFICATION',
        status: 'failed',
        sentAt: { gte: last7Days }
      }
    })

    const emailSuccessRate = verificationEmailsSent > 0
      ? ((verificationEmailsSent - verificationEmailsFailed) / verificationEmailsSent * 100).toFixed(1)
      : '0'

    console.log(`\n   📧 Verificatie emails (laatste 7 dagen):`)
    console.log(`   Verzonden: ${verificationEmailsSent}`)
    console.log(`   Gefaald: ${verificationEmailsFailed}`)
    console.log(`   Success rate: ${emailSuccessRate}%`)

    console.log()

    // ==================== REGISTRATIE PATRONEN ====================
    console.log('📈 REGISTRATIE PATRONEN (laatste 30 dagen)\n')

    const registrationsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 7
    `

    console.log('   Registraties per dag (laatste 7 dagen):')
    for (const row of registrationsByDay) {
      const date = new Date(row.date).toLocaleDateString('nl-NL')
      console.log(`      ${date}: ${Number(row.count)} gebruikers`)
    }

    // Peak hours
    const registrationsByHour = await prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY count DESC
      LIMIT 3
    `

    console.log(`\n   🕐 Drukste uren (laatste 7 dagen):`)
    for (const row of registrationsByHour) {
      console.log(`      ${row.hour}:00 - ${row.hour + 1}:00: ${Number(row.count)} registraties`)
    }

    console.log()

    // ==================== SPAM/BOT ANALYSE ====================
    console.log('🛡️  SPAM & BOT DETECTIE\n')

    const spamMetrics = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        action: {
          in: [
            'REGISTER_HONEYPOT_TRIGGERED',
            'REGISTER_SPAM_DETECTED',
            'REGISTER_BLOCKED_EMAIL',
            'REGISTER_BLOCKED_DOMAIN'
          ]
        },
        createdAt: { gte: last30Days }
      },
      _count: true
    })

    let totalBlocked = 0
    console.log('   Geblokkeerde registraties (laatste 30 dagen):')
    for (const metric of spamMetrics) {
      totalBlocked += metric._count
      console.log(`      ${metric.action}: ${metric._count}`)
    }
    console.log(`   \n   Totaal geblokkeerd: ${totalBlocked}`)

    // Failed login attempts on new accounts
    const failedLogins = await prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: { gte: last7Days }
      }
    })

    console.log(`   \n   ⚠️  Mislukte login pogingen (laatste 7 dagen): ${failedLogins}`)

    // Suspicious patterns - accounts that registered but never verified + failed logins
    const suspiciousAccounts = await prisma.user.count({
      where: {
        emailVerified: null,
        createdAt: { gte: last7Days },
        isOnboarded: false,
        onboardingStep: 1
      }
    })

    const suspiciousRate = recentUsers > 0 ? (suspiciousAccounts / recentUsers * 100).toFixed(1) : '0'
    console.log(`\n   🚩 Verdachte accounts (niet verified, stap 1, laatste 7 dagen):`)
    console.log(`      ${suspiciousAccounts} van ${recentUsers} (${suspiciousRate}%)`)

    console.log()

    // ==================== EMAIL DOMEIN ANALYSE ====================
    console.log('🌐 EMAIL DOMEIN ANALYSE (laatste 30 dagen)\n')

    const emailDomains = await prisma.$queryRaw<Array<{ domain: string; count: bigint; verified_count: bigint }>>`
      SELECT
        SPLIT_PART(email, '@', 2) as domain,
        COUNT(*)::bigint as count,
        COUNT(CASE WHEN "emailVerified" IS NOT NULL THEN 1 END)::bigint as verified_count
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      AND email IS NOT NULL
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 10
    `

    console.log('   Top 10 email domeinen:')
    for (const row of emailDomains) {
      const verifiedPct = Number(row.count) > 0
        ? (Number(row.verified_count) / Number(row.count) * 100).toFixed(0)
        : '0'
      console.log(`      ${row.domain}: ${Number(row.count)} (${verifiedPct}% verified)`)
    }

    console.log()

    // ==================== PROFIEL COMPLEETHEID ====================
    console.log('📝 PROFIEL COMPLEETHEID (laatste 30 dagen)\n')

    const profileStats = await prisma.$queryRaw<Array<{
      with_bio: bigint
      with_photo: bigint
      with_birthdate: bigint
      with_city: bigint
      total: bigint
    }>>`
      SELECT
        COUNT(CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 END)::bigint as with_bio,
        COUNT(CASE WHEN EXISTS(SELECT 1 FROM "Photo" WHERE "Photo"."userId" = "User".id) THEN 1 END)::bigint as with_photo,
        COUNT(CASE WHEN "birthDate" IS NOT NULL THEN 1 END)::bigint as with_birthdate,
        COUNT(CASE WHEN city IS NOT NULL AND city != '' THEN 1 END)::bigint as with_city,
        COUNT(*)::bigint as total
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
    `

    if (profileStats[0]) {
      const stats = profileStats[0]
      const total = Number(stats.total)

      console.log(`   Van ${total} gebruikers:`)
      console.log(`      Bio: ${Number(stats.with_bio)} (${(Number(stats.with_bio) / total * 100).toFixed(1)}%)`)
      console.log(`      Foto: ${Number(stats.with_photo)} (${(Number(stats.with_photo) / total * 100).toFixed(1)}%)`)
      console.log(`      Geboortedatum: ${Number(stats.with_birthdate)} (${(Number(stats.with_birthdate) / total * 100).toFixed(1)}%)`)
      console.log(`      Locatie: ${Number(stats.with_city)} (${(Number(stats.with_city) / total * 100).toFixed(1)}%)`)
    }

    console.log()

    // ==================== CONVERSION FUNNEL ====================
    console.log('🎯 CONVERSION FUNNEL (laatste 30 dagen)\n')

    const funnelStats = await prisma.$queryRaw<Array<{
      registered: bigint
      verified: bigint
      onboarded: bigint
      with_photo: bigint
      profile_complete: bigint
    }>>`
      SELECT
        COUNT(*)::bigint as registered,
        COUNT(CASE WHEN "emailVerified" IS NOT NULL THEN 1 END)::bigint as verified,
        COUNT(CASE WHEN "isOnboarded" = true THEN 1 END)::bigint as onboarded,
        COUNT(CASE WHEN EXISTS(SELECT 1 FROM "Photo" WHERE "Photo"."userId" = "User".id) THEN 1 END)::bigint as with_photo,
        COUNT(CASE WHEN "profileComplete" = true THEN 1 END)::bigint as profile_complete
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
    `

    if (funnelStats[0]) {
      const funnel = funnelStats[0]
      const registered = Number(funnel.registered)

      console.log(`   Registratie → Profiel Compleet:`)
      console.log(`   1. Geregistreerd:       ${registered.toLocaleString()} (100%)`)

      const verifiedPct = (Number(funnel.verified) / registered * 100).toFixed(1)
      console.log(`   2. Email verified:      ${Number(funnel.verified).toLocaleString()} (${verifiedPct}%) ⬇️ ${(100 - Number(verifiedPct)).toFixed(1)}%`)

      const onboardedPct = (Number(funnel.onboarded) / registered * 100).toFixed(1)
      console.log(`   3. Onboarding voltooid: ${Number(funnel.onboarded).toLocaleString()} (${onboardedPct}%) ⬇️ ${(100 - Number(onboardedPct)).toFixed(1)}%`)

      const photoPct = (Number(funnel.with_photo) / registered * 100).toFixed(1)
      console.log(`   4. Foto toegevoegd:     ${Number(funnel.with_photo).toLocaleString()} (${photoPct}%) ⬇️ ${(100 - Number(photoPct)).toFixed(1)}%`)

      const completePct = (Number(funnel.profile_complete) / registered * 100).toFixed(1)
      console.log(`   5. Profiel compleet:    ${Number(funnel.profile_complete).toLocaleString()} (${completePct}%) ⬇️ ${(100 - Number(completePct)).toFixed(1)}%`)
    }

    console.log()

    // ==================== SYSTEEM ERRORS ====================
    console.log('🔴 SYSTEEM ERRORS (laatste 7 dagen)\n')

    const systemErrors = await prisma.auditLog.findMany({
      where: {
        success: false,
        createdAt: { gte: last7Days },
        action: {
          notIn: [
            'LOGIN_FAILED',
            'REGISTER_HONEYPOT_TRIGGERED',
            'REGISTER_SPAM_DETECTED',
            'REGISTER_BLOCKED_EMAIL',
            'REGISTER_BLOCKED_DOMAIN',
            'PASSWORD_RESET_INVALID_TOKEN'
          ]
        }
      },
      select: {
        action: true,
        createdAt: true,
        details: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (systemErrors.length > 0) {
      console.log(`   ⚠️  Gevonden: ${systemErrors.length} systeem errors\n`)
      for (const error of systemErrors.slice(0, 5)) {
        console.log(`      ${error.action}`)
        console.log(`      └─ ${new Date(error.createdAt).toLocaleString('nl-NL')}`)
        if (error.details) {
          console.log(`      └─ ${error.details}`)
        }
        console.log()
      }
    } else {
      console.log(`   ✅ Geen systeem errors gevonden`)
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('✅ Analyse compleet!')
    console.log()

  } catch (error) {
    console.error('❌ Error tijdens analyse:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run analysis
deepAnalysis().catch(console.error)
