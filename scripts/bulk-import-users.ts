/**
 * Bulk Import Users from OogvoorLiefde.nl
 *
 * Parses the MySQL dump and imports all users into MigrationUser table
 */

import * as fs from 'fs'
import * as crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface OldUser {
  id: number
  name: string
  first_name: string
  last_name: string
  email: string
  gender: string
  is_photo: string
  gold_days: number
  date_created: string
  last_visit: string
  is_active: string
}

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

function generateCouponCode(firstName: string): string {
  const cleanName = firstName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10)
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `WELKOM-${cleanName}-${randomPart}`
}

function determineSegment(user: OldUser): string {
  const lastVisit = new Date(user.last_visit)
  const now = new Date()
  const daysSinceVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
  const hasGold = user.gold_days > 0

  // VIP: Recent + Gold or very active
  if (hasGold && daysSinceVisit < 90) return 'VIP'
  if (hasGold) return 'GOLD'
  if (daysSinceVisit < 90) return 'ACTIVE'
  if (daysSinceVisit < 365) return 'DORMANT'
  return 'INACTIVE'
}

async function parseUsersFromDump(): Promise<OldUser[]> {
  console.log('\n📂 Reading SQL dump file...')

  const filePath = 'D:/datingsite2026/Huidigedatabase/u14932p48270_vin.sql'
  const content = fs.readFileSync(filePath, 'utf8')

  console.log(`   File size: ${(content.length / 1024 / 1024).toFixed(1)} MB`)

  // Find INSERT INTO users statements
  // The table is likely called `user` or `users`
  const userInsertRegex = /INSERT INTO `user` \(`[^)]+`\) VALUES\s*([\s\S]*?);/g
  const users: OldUser[] = []

  let match
  let foundTable = false

  // First, find the table structure to understand column order
  const tableStructMatch = content.match(/CREATE TABLE `user` \(([\s\S]*?)\) ENGINE/)
  if (tableStructMatch) {
    console.log('   Found `user` table structure')
    foundTable = true
  }

  // Parse INSERT statements
  const insertMatch = content.match(/INSERT INTO `user` \(`([^)]+)`\) VALUES([\s\S]*?);/g)

  if (!insertMatch) {
    // Try alternative table name
    const altInsertMatch = content.match(/INSERT INTO `users` \(`([^)]+)`\) VALUES([\s\S]*?);/g)
    if (altInsertMatch) {
      console.log('   Found `users` table')
    } else {
      console.log('   ❌ Could not find user table INSERT statements')

      // Let's try to find what tables have INSERT statements
      const tables = content.match(/INSERT INTO `([^`]+)`/g)
      const uniqueTables = [...new Set(tables?.map(t => t.replace('INSERT INTO `', '').replace('`', '')) || [])]
      console.log('   Available tables with data:', uniqueTables.filter(t => t.toLowerCase().includes('user')).join(', '))
      return []
    }
  }

  // Parse the data - the table appears to be `user`
  // Let's extract column names and values more carefully
  const insertStatements = content.match(/INSERT INTO `user` \(`([^)]+)`\) VALUES\s*\n?([\s\S]*?);/g)

  if (!insertStatements) {
    // Try finding any reference to user table
    const userRef = content.indexOf('`user`')
    if (userRef > -1) {
      console.log('   Found user table reference at position:', userRef)
      const context = content.substring(userRef - 50, userRef + 500)
      console.log('   Context:', context.substring(0, 200))
    }
    return []
  }

  console.log(`   Found ${insertStatements.length} INSERT statement(s)`)

  for (const stmt of insertStatements) {
    // Extract column names
    const colMatch = stmt.match(/INSERT INTO `user` \(`([^)]+)`\)/)
    if (!colMatch) continue

    const columns = colMatch[1].split('`, `')

    // Find column indices - columns from OogvoorLiefde database
    const idIdx = columns.indexOf('user_id')
    const nameIdx = columns.indexOf('name')
    const firstNameIdx = columns.indexOf('name') // No separate first_name
    const lastNameIdx = -1 // No last_name column
    const emailIdx = columns.indexOf('mail')
    const genderIdx = columns.indexOf('gender')
    const isPhotoIdx = columns.indexOf('is_photo')
    const goldDaysIdx = columns.indexOf('gold_days')
    const dateCreatedIdx = columns.indexOf('register')
    const lastVisitIdx = columns.indexOf('last_visit')
    const isActiveIdx = columns.indexOf('active')

    // Only print column info once
    if (users.length === 0) {
      console.log(`   Columns: ${columns.length} found`)
      console.log(`   Key columns: user_id(${idIdx}), name(${nameIdx}), mail(${emailIdx}), active(${isActiveIdx})`)
    }

    // Extract VALUES part
    const valuesMatch = stmt.match(/VALUES\s*\n?([\s\S]*)/s)
    if (!valuesMatch) {
      console.log('   No VALUES found in this INSERT')
      continue
    }

    const valuesStr = valuesMatch[1].replace(/;$/, '')

    // Parse individual value tuples - this is tricky due to escaped strings
    // We'll use a simple state machine
    let inString = false
    let escaped = false
    let currentValue = ''
    let currentTuple: string[] = []
    let depth = 0

    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i]

      if (escaped) {
        currentValue += char
        escaped = false
        continue
      }

      if (char === '\\') {
        escaped = true
        currentValue += char
        continue
      }

      if (char === "'" && !escaped) {
        inString = !inString
        currentValue += char
        continue
      }

      if (!inString) {
        if (char === '(') {
          depth++
          if (depth === 1) {
            currentValue = ''
            currentTuple = []
            continue
          }
        }

        if (char === ')') {
          depth--
          if (depth === 0) {
            // End of tuple
            currentTuple.push(currentValue.trim())

            // Create user object
            const getValue = (idx: number): string => {
              const val = currentTuple[idx] || ''
              if (val === 'NULL') return ''
              // Remove surrounding quotes
              if (val.startsWith("'") && val.endsWith("'")) {
                return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\n/g, '\n')
              }
              return val
            }

            const user: OldUser = {
              id: parseInt(getValue(idIdx)) || 0,
              name: getValue(nameIdx),
              first_name: getValue(firstNameIdx) || getValue(nameIdx),
              last_name: getValue(lastNameIdx) || '',
              email: getValue(emailIdx),
              gender: getValue(genderIdx),
              is_photo: getValue(isPhotoIdx),
              gold_days: parseInt(getValue(goldDaysIdx)) || 0,
              date_created: getValue(dateCreatedIdx),
              last_visit: getValue(lastVisitIdx),
              is_active: getValue(isActiveIdx)
            }

            // Check if valid user: has ID, email, and is active (active = 'Y' or active = '1')
            if (user.id > 0 && user.email && user.email.includes('@') && (user.is_active === 'Y' || user.is_active === '1' || user.is_active === 'y')) {
              users.push(user)
            }
            continue
          }
        }

        if (char === ',' && depth === 1) {
          currentTuple.push(currentValue.trim())
          currentValue = ''
          continue
        }
      }

      currentValue += char
    }
  }

  console.log(`   Parsed ${users.length} active users`)
  return users
}

async function importUsers(users: OldUser[], dryRun: boolean = false) {
  console.log('\n📥 Starting import...')
  console.log(`   Total users to import: ${users.length}`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`)

  if (dryRun) {
    // Show sample data
    console.log('\n   Sample users (first 5):')
    users.slice(0, 5).forEach(u => {
      console.log(`   - ${u.id}: ${u.first_name} (${u.email}) - ${determineSegment(u)}`)
    })
    return
  }

  const BATCH_SIZE = 100
  let imported = 0
  let skipped = 0
  let errors = 0

  // Calculate coupon expiry (30 days from now)
  const couponExpiresAt = new Date()
  couponExpiresAt.setDate(couponExpiresAt.getDate() + 30)

  // Token expiry (60 days from now)
  const tokenExpiresAt = new Date()
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 60)

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE)
    console.log(`\n   Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(users.length / BATCH_SIZE)}...`)

    for (const user of batch) {
      try {
        // Check if already exists
        const existing = await prisma.$queryRaw<any[]>`
          SELECT id FROM "MigrationUser" WHERE "oldUserId" = ${user.id}
        `

        if (existing.length > 0) {
          skipped++
          continue
        }

        const segment = determineSegment(user)
        const claimToken = generateToken()
        const couponCode = generateCouponCode(user.first_name || user.name)
        const memberSince = user.date_created ? new Date(user.date_created) : new Date('2020-01-01')
        const lastActive = user.last_visit ? new Date(user.last_visit) : null
        const id = crypto.randomUUID()

        await prisma.$executeRaw`
          INSERT INTO "MigrationUser" (
            "id",
            "oldUserId",
            "oldEmail",
            "firstName",
            "lastName",
            "memberSince",
            "lastActiveOld",
            "hadGoldMembership",
            "photoCount",
            "segment",
            "status",
            "couponCode",
            "couponExpiresAt",
            "claimToken",
            "claimTokenExpiresAt",
            "createdAt",
            "updatedAt"
          ) VALUES (
            ${id},
            ${user.id},
            ${user.email},
            ${user.first_name || user.name || 'Gebruiker'},
            ${user.last_name || ''},
            ${memberSince},
            ${lastActive},
            ${user.gold_days > 0},
            ${user.is_photo === 'Y' ? 1 : 0},
            ${segment}::"MigrationSegment",
            'PENDING'::"MigrationStatus",
            ${couponCode},
            ${couponExpiresAt},
            ${claimToken},
            ${tokenExpiresAt},
            NOW(),
            NOW()
          )
        `

        imported++

        if (imported % 50 === 0) {
          console.log(`   ✓ Imported ${imported} users...`)
        }
      } catch (err: any) {
        errors++
        if (errors <= 5) {
          console.log(`   ❌ Error for user ${user.id}: ${err.message}`)
        }
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('                    IMPORT COMPLETE')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`   ✅ Imported: ${imported}`)
  console.log(`   ⏭️  Skipped (existing): ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log()
}

async function showStats() {
  console.log('\n📊 Current MigrationUser Stats:')

  const stats = await prisma.$queryRaw<any[]>`
    SELECT
      segment,
      status,
      COUNT(*)::int as count
    FROM "MigrationUser"
    GROUP BY segment, status
    ORDER BY segment, status
  `

  const bySegment: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  stats.forEach((row: any) => {
    bySegment[row.segment] = (bySegment[row.segment] || 0) + row.count
    byStatus[row.status] = (byStatus[row.status] || 0) + row.count
  })

  console.log('\n   By Segment:')
  Object.entries(bySegment).forEach(([seg, count]) => {
    console.log(`   - ${seg}: ${count}`)
  })

  console.log('\n   By Status:')
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`   - ${status}: ${count}`)
  })

  const total = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*)::int as total FROM "MigrationUser"
  `
  console.log(`\n   Total: ${total[0].total}`)
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('        BULK IMPORT - OogvoorLiefde.nl → LiefdevoorIedereen.nl')
  console.log('═══════════════════════════════════════════════════════════════')

  try {
    // First show current stats
    await showStats()

    // Parse users from dump
    const users = await parseUsersFromDump()

    if (users.length === 0) {
      console.log('\n⚠️  No users found. Please check the SQL dump format.')
      return
    }

    // Import users
    await importUsers(users, dryRun)

    // Show final stats
    await showStats()

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
