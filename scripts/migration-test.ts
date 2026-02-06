/**
 * Migration Test Script
 *
 * Tests the migration flow with sample users from OogvoorLiefde database
 *
 * Usage: npx tsx scripts/migration-test.ts [--dry-run] [--count=10]
 */

import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as readline from 'readline'

const prisma = new PrismaClient()

// Command line args
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const COUNT = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '10')

interface OldUser {
  user_id: number
  name: string
  gender: 'M' | 'F'
  mail: string
  birth: string
  register: string
  last_visit: string
  gold_days: number
  is_photo: 'Y' | 'N'
  country: string
  city: string
  password: string
  total_views: number
}

type MigrationSegment = 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT' | 'INACTIVE'

/**
 * Parse users from SQL dump
 */
async function parseUsersFromSQL(limit: number): Promise<OldUser[]> {
  console.log(`📖 Reading users from SQL dump (limit: ${limit})...\n`)

  const sqlFile = 'D:\\datingsite2026\\Huidigedatabase\\u14932p48270_vin.sql'
  const users: OldUser[] = []

  // Read specific lines containing user data
  const fileStream = fs.createReadStream(sqlFile)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let inUserInsert = false
  let lineCount = 0

  for await (const line of rl) {
    lineCount++

    // Find start of user INSERT
    if (line.includes("INSERT INTO `user`")) {
      inUserInsert = true
      continue
    }

    // Parse user data lines
    if (inUserInsert && line.startsWith('(') && users.length < limit) {
      try {
        const user = parseUserLine(line)
        if (user && user.mail && user.mail.includes('@')) {
          users.push(user)
        }
      } catch (e) {
        // Skip malformed lines
      }
    }

    // Stop after we have enough
    if (users.length >= limit) {
      break
    }

    // Stop reading after user table data
    if (inUserInsert && line.includes('ENGINE=')) {
      break
    }
  }

  rl.close()

  console.log(`   Found ${users.length} valid users\n`)
  return users
}

/**
 * Parse a single user line from SQL
 */
function parseUserLine(line: string): OldUser | null {
  // Remove trailing comma and newline
  line = line.trim().replace(/,\s*$/, '').replace(/\);?\s*$/, '')

  // Extract values between parentheses
  const match = line.match(/^\((.+)$/)
  if (!match) return null

  const values = parseCSV(match[1])

  return {
    user_id: parseInt(values[0]) || 0,
    name: cleanString(values[4]),
    gender: values[6] === 'F' ? 'F' : 'M',
    mail: cleanString(values[12]),
    birth: cleanString(values[27]),
    register: cleanString(values[35]),
    last_visit: cleanString(values[36]),
    gold_days: parseInt(values[2]) || 0,
    is_photo: values[16] === 'Y' ? 'Y' : 'N',
    country: cleanString(values[23]),
    city: cleanString(values[25]),
    password: cleanString(values[14]),
    total_views: parseInt(values[40]) || 0
  }
}

/**
 * Parse CSV values handling quoted strings
 */
function parseCSV(str: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (char === "'" && !inQuote) {
      inQuote = true
      continue
    }

    if (char === "'" && inQuote) {
      if (str[i + 1] === "'") {
        current += "'"
        i++
        continue
      }
      inQuote = false
      continue
    }

    if (char === ',' && !inQuote) {
      result.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  result.push(current.trim())
  return result
}

/**
 * Clean string value
 */
function cleanString(val: string): string {
  if (!val) return ''
  return val.replace(/^['"]|['"]$/g, '').trim()
}

/**
 * Determine user segment based on activity
 */
function determineSegment(user: OldUser): MigrationSegment {
  const now = new Date()
  const lastVisit = new Date(user.last_visit)
  const daysSinceVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

  // VIP: Gold members OR very recent activity with photos
  if (user.gold_days > 0) return 'GOLD'
  if (daysSinceVisit < 90 && user.is_photo === 'Y' && user.total_views > 100) return 'VIP'
  if (daysSinceVisit < 90) return 'ACTIVE'
  if (daysSinceVisit < 365) return 'ACTIVE'
  if (daysSinceVisit < 730) return 'DORMANT'
  return 'INACTIVE'
}

/**
 * Generate unique coupon code
 */
function generateCouponCode(firstName: string): string {
  const cleanName = firstName.split(' ')[0].toUpperCase().substring(0, 8)
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `WELKOM-${cleanName}-${random}`
}

/**
 * Generate claim token
 */
function generateClaimToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Create migration users in database
 */
async function createMigrationUsers(users: OldUser[]): Promise<void> {
  console.log('🚀 Creating migration users...\n')

  for (const user of users) {
    const segment = determineSegment(user)
    const couponCode = generateCouponCode(user.name)
    const claimToken = generateClaimToken()

    const couponExpiresAt = new Date()
    couponExpiresAt.setDate(couponExpiresAt.getDate() + 30)

    const claimTokenExpiresAt = new Date()
    claimTokenExpiresAt.setDate(claimTokenExpiresAt.getDate() + 30)

    console.log(`   📧 ${user.mail}`)
    console.log(`      Name: ${user.name}`)
    console.log(`      Segment: ${segment}`)
    console.log(`      Coupon: ${couponCode}`)
    console.log(`      Token: ${claimToken.substring(0, 8)}...`)
    console.log(`      Landing: /welkom/${claimToken}`)
    console.log()

    if (!DRY_RUN) {
      try {
        // Check if already exists
        const existing = await prisma.$queryRaw<any[]>`
          SELECT id FROM "MigrationUser" WHERE "oldUserId" = ${user.user_id} LIMIT 1
        `

        if (existing.length > 0) {
          console.log(`      ⚠️  Already exists, skipping\n`)
          continue
        }

        // Create migration user
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
            ${user.user_id},
            ${user.mail},
            ${user.name.split(' ')[0]},
            ${user.name.split(' ').slice(1).join(' ') || null},
            ${new Date(user.register)},
            ${new Date(user.last_visit)},
            ${user.gold_days > 0},
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
        console.log(`      ✅ Created in database\n`)
      } catch (error) {
        console.error(`      ❌ Error: ${error}\n`)
      }
    }
  }
}

/**
 * Display test summary
 */
async function displaySummary(users: OldUser[]): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('                    TEST SAMENVATTING')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const segments: Record<MigrationSegment, number> = {
    VIP: 0, GOLD: 0, ACTIVE: 0, DORMANT: 0, INACTIVE: 0
  }

  users.forEach(u => {
    segments[determineSegment(u)]++
  })

  console.log('   Segment verdeling:')
  Object.entries(segments).forEach(([seg, count]) => {
    if (count > 0) {
      console.log(`      ${seg.padEnd(10)} ${count} users`)
    }
  })
  console.log()

  if (!DRY_RUN) {
    // Count in database
    const dbCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "MigrationUser" WHERE status = 'PENDING'
    `
    console.log(`   📊 Totaal in database: ${dbCount[0]?.count || 0} pending migrations`)
  }

  console.log()
  console.log('   Volgende stappen:')
  console.log('   ─────────────────')
  console.log('   1. Controleer de MigrationUser records in de database')
  console.log('   2. Test de landing pagina: /welkom/[token]')
  console.log('   3. Trigger een test email via de cron endpoint')
  console.log('   4. Claim een test account en verifieer de flow')
  console.log()

  if (DRY_RUN) {
    console.log('   ⚠️  DRY RUN MODE - Geen data is opgeslagen')
    console.log('      Voer opnieuw uit zonder --dry-run om echt te migreren')
  }
}

/**
 * Main execution
 */
async function main() {
  console.log()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('        MIGRATION TEST - OogvoorLiefde → LiefdevoorIedereen')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()
  console.log(`   Mode: ${DRY_RUN ? '🔍 DRY RUN (geen database wijzigingen)' : '🚀 LIVE'}`)
  console.log(`   Count: ${COUNT} users`)
  console.log()

  try {
    // Parse users from SQL
    const users = await parseUsersFromSQL(COUNT)

    if (users.length === 0) {
      console.log('❌ Geen users gevonden in database dump')
      return
    }

    // Create migration records
    await createMigrationUsers(users)

    // Display summary
    await displaySummary(users)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
