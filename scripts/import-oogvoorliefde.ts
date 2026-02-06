/**
 * PRODUCTIE IMPORT SCRIPT - OogvoorLiefde → LiefdevoorIedereen
 *
 * Dit script importeert gebruikers uit de OogvoorLiefde SQL dump
 * en maakt MigrationUser records aan voor de email campagne.
 *
 * GEBRUIK:
 *   npx tsx scripts/import-oogvoorliefde.ts --dry-run          # Test mode
 *   npx tsx scripts/import-oogvoorliefde.ts --segment=VIP      # Alleen VIP segment
 *   npx tsx scripts/import-oogvoorliefde.ts --limit=100        # Max 100 users
 *   npx tsx scripts/import-oogvoorliefde.ts                    # Volledige import
 *
 * OPTIES:
 *   --dry-run       Geen database writes, alleen analyse
 *   --segment=X     Filter op segment (VIP, GOLD, ACTIVE, DORMANT, INACTIVE)
 *   --limit=N       Maximum aantal te importeren users
 *   --skip-existing Skip users die al in MigrationUser zitten
 *   --batch-size=N  Batch size voor inserts (default: 100)
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as readline from 'readline'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Pas dit pad aan naar de locatie van je SQL dump
  sqlDumpPath: 'D:\\datingsite2026\\Huidigedatabase\\u14932p48270_vin.sql',

  // Coupon geldigheid in dagen
  couponValidDays: 30,

  // Claim token geldigheid in dagen
  claimTokenValidDays: 30,

  // Batch size voor database inserts
  defaultBatchSize: 100,

  // Activity thresholds (in dagen)
  activityThresholds: {
    recent: 90,      // 0-3 maanden = VIP candidate
    active: 365,     // 3-12 maanden = ACTIVE
    dormant: 730,    // 1-2 jaar = DORMANT
    // >2 jaar = INACTIVE
  }
}

// ============================================
// TYPES
// ============================================

type MigrationSegment = 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT' | 'INACTIVE'

interface OldUser {
  user_id: number
  name: string
  gender: 'M' | 'F'
  email: string
  birthDate: string
  registerDate: string
  lastVisit: string
  goldDays: number
  hasPhoto: boolean
  country: string
  city: string
  profileViews: number
}

interface ImportStats {
  total: number
  imported: number
  skipped: number
  errors: number
  bySegment: Record<MigrationSegment, number>
}

// ============================================
// COMMAND LINE PARSING
// ============================================

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const SKIP_EXISTING = args.includes('--skip-existing')
const SEGMENT_FILTER = args.find(a => a.startsWith('--segment='))?.split('=')[1]?.toUpperCase() as MigrationSegment | undefined
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0') || Infinity
const BATCH_SIZE = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || String(CONFIG.defaultBatchSize))

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateToken(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex')
}

function generateCouponCode(firstName: string, segment: MigrationSegment): string {
  const cleanName = firstName
    .split(' ')[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 6)
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  const prefix = segment === 'VIP' ? 'VIP' : segment === 'GOLD' ? 'GOLD' : 'WELKOM'
  return `${prefix}-${cleanName}-${random}`
}

function determineSegment(user: OldUser): MigrationSegment {
  const now = new Date()
  const lastVisit = new Date(user.lastVisit)
  const daysSinceVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

  // Gold members get GOLD segment (unless very recent)
  if (user.goldDays > 0) {
    return 'GOLD'
  }

  // Very active users with photos and views = VIP
  if (daysSinceVisit <= CONFIG.activityThresholds.recent) {
    if (user.hasPhoto && user.profileViews > 50) {
      return 'VIP'
    }
    return 'ACTIVE'
  }

  // Activity-based segmentation
  if (daysSinceVisit <= CONFIG.activityThresholds.active) {
    return 'ACTIVE'
  }

  if (daysSinceVisit <= CONFIG.activityThresholds.dormant) {
    return 'DORMANT'
  }

  return 'INACTIVE'
}

function cleanString(val: string | null | undefined): string {
  if (!val) return ''
  return val.replace(/^['"]|['"]$/g, '').trim()
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === "'" && !inQuote) {
      inQuote = true
      continue
    }

    if (char === "'" && inQuote) {
      if (line[i + 1] === "'") {
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

// ============================================
// SQL DUMP PARSER
// ============================================

async function* parseUsersFromSQLDump(): AsyncGenerator<OldUser> {
  console.log(`\n📖 Reading SQL dump: ${CONFIG.sqlDumpPath}\n`)

  if (!fs.existsSync(CONFIG.sqlDumpPath)) {
    throw new Error(`SQL dump niet gevonden: ${CONFIG.sqlDumpPath}`)
  }

  const fileStream = fs.createReadStream(CONFIG.sqlDumpPath, { encoding: 'utf8' })
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let inUserInsert = false
  let lineBuffer = ''
  let usersYielded = 0

  for await (const line of rl) {
    // Detect start of user INSERT
    if (line.includes('INSERT INTO `user`')) {
      inUserInsert = true
      lineBuffer = ''
      continue
    }

    // End of user table
    if (inUserInsert && (line.includes('ENGINE=') || line.startsWith('DROP TABLE') || line.startsWith('CREATE TABLE'))) {
      inUserInsert = false
      continue
    }

    // Parse user data
    if (inUserInsert) {
      lineBuffer += line

      // Check if we have complete records (lines ending with ), or );)
      const records = lineBuffer.split(/\),\s*\(/g)

      for (let i = 0; i < records.length - 1; i++) {
        let record = records[i]
        // Clean up the record
        record = record.replace(/^\(/, '').replace(/\)$/, '')

        try {
          const user = parseUserRecord(record)
          if (user && isValidEmail(user.email)) {
            usersYielded++
            yield user
          }
        } catch (e) {
          // Skip malformed records
        }
      }

      // Keep the last incomplete record in buffer
      lineBuffer = records[records.length - 1]
    }
  }

  // Process any remaining buffer
  if (lineBuffer.trim()) {
    try {
      const record = lineBuffer.replace(/^\(/, '').replace(/\);?\s*$/, '')
      const user = parseUserRecord(record)
      if (user && isValidEmail(user.email)) {
        yield user
      }
    } catch (e) {
      // Skip
    }
  }

  rl.close()
  console.log(`   Found ${usersYielded} valid users in SQL dump\n`)
}

function parseUserRecord(record: string): OldUser | null {
  const values = parseCSVLine(record)

  // Map values based on known OogvoorLiefde database structure
  // Adjust these indices based on actual table structure!
  const user: OldUser = {
    user_id: parseInt(values[0]) || 0,
    name: cleanString(values[4]) || 'Onbekend',
    gender: values[6] === 'F' ? 'F' : 'M',
    email: cleanString(values[12]) || '',
    birthDate: cleanString(values[27]) || '1990-01-01',
    registerDate: cleanString(values[35]) || '2020-01-01',
    lastVisit: cleanString(values[36]) || '2020-01-01',
    goldDays: parseInt(values[2]) || 0,
    hasPhoto: values[16] === 'Y',
    country: cleanString(values[23]) || 'NL',
    city: cleanString(values[25]) || '',
    profileViews: parseInt(values[40]) || 0
  }

  return user.user_id > 0 ? user : null
}

function isValidEmail(email: string): boolean {
  if (!email) return false
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function checkExistingUsers(): Promise<Set<number>> {
  console.log('   Checking existing migration users...')

  const existing = await prisma.$queryRaw<{ oldUserId: number }[]>`
    SELECT "oldUserId" FROM "MigrationUser"
  `

  const set = new Set(existing.map(e => e.oldUserId))
  console.log(`   Found ${set.size} existing migration users\n`)

  return set
}

interface MigrationUserInsert {
  oldUserId: number
  oldEmail: string
  firstName: string
  lastName: string | null
  memberSince: Date
  lastActiveOld: Date
  hadGoldMembership: boolean
  photoCount: number
  segment: MigrationSegment
  couponCode: string
  couponExpiresAt: Date
  claimToken: string
  claimTokenExpiresAt: Date
}

async function insertMigrationUsers(users: MigrationUserInsert[]): Promise<number> {
  if (users.length === 0) return 0

  let inserted = 0

  for (const user of users) {
    try {
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
          ${user.oldUserId},
          ${user.oldEmail},
          ${user.firstName},
          ${user.lastName},
          ${user.memberSince},
          ${user.lastActiveOld},
          ${user.hadGoldMembership},
          ${user.photoCount},
          0,
          0,
          ${user.segment}::"MigrationSegment",
          'PENDING'::"MigrationStatus",
          ${user.couponCode},
          ${user.couponExpiresAt},
          ${user.claimToken},
          ${user.claimTokenExpiresAt},
          NOW(),
          NOW()
        )
        ON CONFLICT ("oldUserId") DO NOTHING
      `
      inserted++
    } catch (error) {
      // Skip duplicates or errors silently
    }
  }

  return inserted
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

async function runImport(): Promise<ImportStats> {
  const stats: ImportStats = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    bySegment: { VIP: 0, GOLD: 0, ACTIVE: 0, DORMANT: 0, INACTIVE: 0 }
  }

  // Get existing users if skip-existing is enabled
  const existingUsers = SKIP_EXISTING ? await checkExistingUsers() : new Set<number>()

  // Prepare batch
  let batch: MigrationUserInsert[] = []
  let processedCount = 0

  const couponExpiresAt = new Date()
  couponExpiresAt.setDate(couponExpiresAt.getDate() + CONFIG.couponValidDays)

  const claimTokenExpiresAt = new Date()
  claimTokenExpiresAt.setDate(claimTokenExpiresAt.getDate() + CONFIG.claimTokenValidDays)

  console.log('🚀 Starting import...\n')

  // Process users from SQL dump
  for await (const user of parseUsersFromSQLDump()) {
    stats.total++

    // Check limit
    if (processedCount >= LIMIT) {
      console.log(`   Reached limit of ${LIMIT} users`)
      break
    }

    // Skip if already exists
    if (existingUsers.has(user.user_id)) {
      stats.skipped++
      continue
    }

    // Determine segment
    const segment = determineSegment(user)

    // Filter by segment if specified
    if (SEGMENT_FILTER && segment !== SEGMENT_FILTER) {
      stats.skipped++
      continue
    }

    // Parse name
    const nameParts = user.name.split(' ')
    const firstName = nameParts[0] || 'Gebruiker'
    const lastName = nameParts.slice(1).join(' ') || null

    // Generate coupon and token
    const couponCode = generateCouponCode(firstName, segment)
    const claimToken = generateToken()

    // Add to batch
    batch.push({
      oldUserId: user.user_id,
      oldEmail: user.email,
      firstName,
      lastName,
      memberSince: new Date(user.registerDate),
      lastActiveOld: new Date(user.lastVisit),
      hadGoldMembership: user.goldDays > 0,
      photoCount: user.hasPhoto ? 1 : 0,
      segment,
      couponCode,
      couponExpiresAt,
      claimToken,
      claimTokenExpiresAt
    })

    stats.bySegment[segment]++
    processedCount++

    // Process batch
    if (batch.length >= BATCH_SIZE) {
      if (!DRY_RUN) {
        const inserted = await insertMigrationUsers(batch)
        stats.imported += inserted
        stats.errors += batch.length - inserted
      } else {
        stats.imported += batch.length
      }

      // Progress indicator
      process.stdout.write(`\r   Processed: ${processedCount} | Imported: ${stats.imported} | Errors: ${stats.errors}`)

      batch = []
    }
  }

  // Process remaining batch
  if (batch.length > 0) {
    if (!DRY_RUN) {
      const inserted = await insertMigrationUsers(batch)
      stats.imported += inserted
      stats.errors += batch.length - inserted
    } else {
      stats.imported += batch.length
    }
  }

  console.log('\n')

  return stats
}

// ============================================
// REPORTING
// ============================================

function printReport(stats: ImportStats): void {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('              IMPORT RESULTAAT')
  console.log('═══════════════════════════════════════════════════════════════\n')

  if (DRY_RUN) {
    console.log('   ⚠️  DRY RUN MODE - Geen database wijzigingen gemaakt\n')
  }

  console.log('📊 TOTALEN')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`   Totaal in SQL dump:       ${stats.total.toLocaleString('nl-NL')}`)
  console.log(`   Geïmporteerd:             ${stats.imported.toLocaleString('nl-NL')}`)
  console.log(`   Overgeslagen:             ${stats.skipped.toLocaleString('nl-NL')}`)
  console.log(`   Errors:                   ${stats.errors.toLocaleString('nl-NL')}`)
  console.log()

  console.log('🎯 PER SEGMENT')
  console.log('───────────────────────────────────────────────────────────────')

  const segmentEmojis: Record<MigrationSegment, string> = {
    VIP: '🟣',
    GOLD: '🟡',
    ACTIVE: '🟢',
    DORMANT: '🟠',
    INACTIVE: '⚪'
  }

  for (const [segment, count] of Object.entries(stats.bySegment)) {
    const emoji = segmentEmojis[segment as MigrationSegment]
    console.log(`   ${emoji} ${segment.padEnd(10)} ${count.toLocaleString('nl-NL').padStart(8)}`)
  }
  console.log()

  if (!DRY_RUN && stats.imported > 0) {
    console.log('✅ VOLGENDE STAPPEN')
    console.log('───────────────────────────────────────────────────────────────')
    console.log('   1. Check de stats: GET /api/migration/stats')
    console.log('   2. Test met één user: /welkom/[token]')
    console.log('   3. Start campagne: POST /api/cron/migration-emails')
    console.log()
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('     IMPORT OOGVOORLIEFDE → LIEFDEVOORIEDEREN')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()
  console.log(`   Mode:           ${DRY_RUN ? '🔍 DRY RUN' : '🚀 LIVE'}`)
  console.log(`   Segment filter: ${SEGMENT_FILTER || 'Alle segmenten'}`)
  console.log(`   Limit:          ${LIMIT === Infinity ? 'Geen' : LIMIT}`)
  console.log(`   Skip existing:  ${SKIP_EXISTING ? 'Ja' : 'Nee'}`)
  console.log(`   Batch size:     ${BATCH_SIZE}`)
  console.log()

  try {
    const stats = await runImport()
    printReport(stats)
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
