/**
 * Test Migration for User: Multi
 *
 * Specific test for vincent@stichtingphilia.nl
 */

import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// User Multi data from OogvoorLiefde database
const USER_MULTI = {
  user_id: 22,
  name: 'Multi',
  gender: 'M' as const,
  mail: 'vincent@stichtingphilia.nl',
  password: '$2y$10$./QJFV3mEtXX2rMYK5FCKuimSLdi7udj933WGX.s/3fsTDz2G10yG', // bcrypt!
  birth: '1985-09-23',
  register: '2019-07-10 10:43:43',
  last_visit: '2025-09-04 10:15:46',
  gold_days: 8,  // GOLD MEMBER!
  is_photo: 'Y' as const,
  country: 'Nederland',
  city: 'Hoofddorp',
  state: 'Noord-Holland',
  total_views: 415,
  type: 'membership'  // Actief betalend lid
}

function generateCouponCode(firstName: string): string {
  const cleanName = firstName.toUpperCase().substring(0, 8)
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `WELKOM-${cleanName}-${random}`
}

function generateClaimToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

async function testUserMulti() {
  console.log()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('              TEST MIGRATION: USER MULTI')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()

  // Display user data
  console.log('📋 ORIGINELE DATA (OogvoorLiefde)')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   User ID:          ${USER_MULTI.user_id}`)
  console.log(`   Naam:             ${USER_MULTI.name}`)
  console.log(`   Email:            ${USER_MULTI.mail}`)
  console.log(`   Geslacht:         ${USER_MULTI.gender === 'M' ? 'Man' : 'Vrouw'}`)
  console.log(`   Geboortedatum:    ${USER_MULTI.birth}`)
  console.log(`   Locatie:          ${USER_MULTI.city}, ${USER_MULTI.state}`)
  console.log(`   Lid sinds:        ${USER_MULTI.register}`)
  console.log(`   Laatst actief:    ${USER_MULTI.last_visit}`)
  console.log(`   Gold dagen:       ${USER_MULTI.gold_days} dagen`)
  console.log(`   Heeft foto:       ${USER_MULTI.is_photo === 'Y' ? 'Ja' : 'Nee'}`)
  console.log(`   Profiel views:    ${USER_MULTI.total_views}`)
  console.log(`   Account type:     ${USER_MULTI.type}`)
  console.log(`   Wachtwoord type:  ${USER_MULTI.password.startsWith('$2y$') ? 'bcrypt (modern)' : 'MD5 (legacy)'}`)
  console.log()

  // Determine segment
  const now = new Date()
  const lastVisit = new Date(USER_MULTI.last_visit)
  const daysSinceVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

  let segment = 'INACTIVE'
  let segmentReason = ''

  if (USER_MULTI.gold_days > 0) {
    segment = 'GOLD'
    segmentReason = `Had ${USER_MULTI.gold_days} dagen Gold membership`
  } else if (daysSinceVisit < 90) {
    segment = 'VIP'
    segmentReason = `Recent actief (${daysSinceVisit} dagen geleden)`
  } else if (daysSinceVisit < 365) {
    segment = 'ACTIVE'
    segmentReason = `Actief binnen 1 jaar (${daysSinceVisit} dagen geleden)`
  } else if (daysSinceVisit < 730) {
    segment = 'DORMANT'
    segmentReason = `Slapend (${daysSinceVisit} dagen geleden)`
  } else {
    segment = 'INACTIVE'
    segmentReason = `Inactief (${daysSinceVisit} dagen geleden)`
  }

  // Get incentive based on segment
  const incentives: Record<string, { premiumMonths: number; superMessages: number }> = {
    VIP: { premiumMonths: 3, superMessages: 10 },
    GOLD: { premiumMonths: 2, superMessages: 5 },
    ACTIVE: { premiumMonths: 1, superMessages: 3 },
    DORMANT: { premiumMonths: 1, superMessages: 5 },
    INACTIVE: { premiumMonths: 0, superMessages: 3 }
  }

  const incentive = incentives[segment]
  const couponCode = generateCouponCode(USER_MULTI.name)
  const claimToken = generateClaimToken()

  console.log('🎯 MIGRATIE SEGMENTATIE')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   Segment:          🟡 ${segment}`)
  console.log(`   Reden:            ${segmentReason}`)
  console.log(`   Dagen sinds actief: ${daysSinceVisit} dagen`)
  console.log()

  console.log('🎁 INCENTIVE PAKKET')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   Premium maanden:  ${incentive.premiumMonths} maanden GRATIS`)
  console.log(`   SuperBerichten:   ${incentive.superMessages} berichten`)
  console.log(`   Coupon code:      ${couponCode}`)
  console.log()

  console.log('🔗 PERSOONLIJKE LINKS')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   Claim token:      ${claimToken}`)
  console.log(`   Landing pagina:   https://liefdevooriedereen.nl/welkom/${claimToken}`)
  console.log()

  // Check what we're creating
  console.log('📧 EMAIL SEQUENCE (7-touch campaign)')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   Dag 0:  Welcome email met coupon')
  console.log('   Dag 3:  "Multi, er wachten matches op je!"')
  console.log('   Dag 7:  Reminder - "Je coupon verloopt over 21 dagen"')
  console.log('   Dag 10: Features email - AI matching, voice berichten')
  console.log('   Dag 14: Social proof - "2847 anderen zijn al overgestapt"')
  console.log('   Dag 21: Last chance - "Nog 7 dagen voor je data verdwijnt"')
  console.log('   Dag 28: Goodbye email (als niet geactiveerd)')
  console.log()

  // Ask to create
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('              CREËER MIGRATIE RECORD?')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()

  const DRY_RUN = process.argv.includes('--dry-run')

  if (DRY_RUN) {
    console.log('   🔍 DRY RUN MODE - Geen database wijzigingen')
    console.log()
    console.log('   Voer uit zonder --dry-run om record aan te maken:')
    console.log('   npx tsx scripts/test-user-multi.ts')
    console.log()
  } else {
    console.log('   🚀 CREATING MIGRATION RECORD...')
    console.log()

    try {
      // Check if already exists
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id, status, "couponCode", "claimToken"
        FROM "MigrationUser"
        WHERE "oldUserId" = ${USER_MULTI.user_id}
        LIMIT 1
      `

      if (existing.length > 0) {
        console.log('   ⚠️  User Multi bestaat al in MigrationUser tabel!')
        console.log(`      Status: ${existing[0].status}`)
        console.log(`      Coupon: ${existing[0].couponCode}`)
        console.log(`      Token:  ${existing[0].claimToken}`)
        console.log()
        console.log(`   🔗 Test de landing pagina:`)
        console.log(`      http://localhost:3000/welkom/${existing[0].claimToken}`)
        console.log()
      } else {
        const couponExpiresAt = new Date()
        couponExpiresAt.setDate(couponExpiresAt.getDate() + 30)

        const claimTokenExpiresAt = new Date()
        claimTokenExpiresAt.setDate(claimTokenExpiresAt.getDate() + 30)

        // Create the migration record
        await prisma.$executeRaw`
          INSERT INTO "MigrationUser" (
            id,
            "oldUserId",
            "oldEmail",
            "firstName",
            "lastName",
            "memberSince",
            "lastActiveOld",
            "hadGoldMembership",
            "photoCount",
            "messageCount",
            "matchCount",
            segment,
            status,
            "couponCode",
            "couponExpiresAt",
            "claimToken",
            "claimTokenExpiresAt",
            "createdAt",
            "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${USER_MULTI.user_id},
            ${USER_MULTI.mail},
            ${USER_MULTI.name},
            NULL,
            ${new Date(USER_MULTI.register)},
            ${new Date(USER_MULTI.last_visit)},
            ${USER_MULTI.gold_days > 0},
            3,
            47,
            5,
            ${segment}::"MigrationSegment",
            'PENDING'::"MigrationStatus",
            ${couponCode},
            ${couponExpiresAt},
            ${claimToken},
            ${claimTokenExpiresAt},
            NOW(),
            NOW()
          )
        `

        console.log('   ✅ MIGRATIE RECORD AANGEMAAKT!')
        console.log()
        console.log('   📧 Test de welkomst email:')
        console.log('      curl -X POST http://localhost:3000/api/cron/migration-emails \\')
        console.log('        -H "Authorization: Bearer $CRON_SECRET"')
        console.log()
        console.log(`   🔗 Test de landing pagina:`)
        console.log(`      http://localhost:3000/welkom/${claimToken}`)
        console.log()
      }
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        console.log('   ❌ MigrationUser tabel bestaat nog niet!')
        console.log('      Voer eerst de Prisma migratie uit:')
        console.log('      npx prisma migrate dev')
        console.log()
      } else {
        console.error('   ❌ Error:', error.message || error)
      }
    }
  }

  await prisma.$disconnect()
}

testUserMulti()
