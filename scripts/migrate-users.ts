/**
 * User Migration Script
 *
 * Migrates users from old MySQL database (oudedatabase.sql) to new PostgreSQL database
 *
 * Usage: npx tsx scripts/migrate-users.ts
 */

import { PrismaClient, Gender } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

interface OldUser {
  user_id: number
  name: string
  mail: string
  password: string
  gender: 'M' | 'F'
  birth: string
  city: string
  state: string
  country: string
  register: string
  last_visit: string
  is_photo: 'Y' | 'N'
  geo_position_lat?: number
  geo_position_long?: number
  role: 'user' | 'admin' | 'demo_admin'
  active: number
}

interface OldUserInfo {
  user_id: number
  about_me?: string
  interested_in?: string
  height?: number
  soort_beperking?: number
  mijn_beperking?: number
}

// Map old gender to new Gender enum
function mapGender(oldGender: 'M' | 'F'): Gender {
  return oldGender === 'M' ? Gender.MALE : Gender.FEMALE
}

// Calculate age from birth date
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Parse SQL INSERT statement to extract values
function parseInsertStatement(line: string): any[] {
  // Remove INSERT INTO ... VALUES and trailing semicolon
  const valuesMatch = line.match(/VALUES\s+(.+);?$/i)
  if (!valuesMatch) return []

  const valuesStr = valuesMatch[1]
  const users: any[] = []

  // Split by "),(" to get individual user records
  const records = valuesStr.split(/\),\s*\(/)

  for (let record of records) {
    // Clean up the record
    record = record.replace(/^\(/, '').replace(/\)$/, '')

    // This is a simplified parser - in production you'd want something more robust
    // For now, we'll use a regex to extract the key fields we need
    const values = record.split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/)

    if (values.length > 10) {
      users.push({
        values,
        raw: record
      })
    }
  }

  return users
}

// Read userinfo data
async function readUserInfo(): Promise<Map<number, OldUserInfo>> {
  const userInfoMap = new Map<number, OldUserInfo>()

  console.log('📖 Reading userinfo data...')

  const filePath = path.join(__dirname, '../Huidigedatabase/oudedatabase.sql')
  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let inUserInfo = false
  let buffer = ''

  for await (const line of rl) {
    if (line.includes('INSERT INTO `userinfo`')) {
      inUserInfo = true
      buffer = line
    } else if (inUserInfo) {
      buffer += ' ' + line

      if (line.includes(');')) {
        // Parse the complete INSERT statement
        const records = parseInsertStatement(buffer)

        for (const record of records) {
          const values = record.values
          if (values.length >= 3) {
            const userId = parseInt(values[0])
            const aboutMe = values[25] ? values[25].replace(/^'|'$/g, '') : ''
            const interestedIn = values[26] ? values[26].replace(/^'|'$/g, '') : ''

            userInfoMap.set(userId, {
              user_id: userId,
              about_me: aboutMe,
              interested_in: interestedIn
            })
          }
        }

        inUserInfo = false
        buffer = ''
      }
    }
  }

  console.log(`✅ Loaded ${userInfoMap.size} userinfo records`)
  return userInfoMap
}

// Main migration function
async function migrateUsers() {
  console.log('🚀 Starting user migration...\n')

  try {
    // Read userinfo first
    const userInfoMap = await readUserInfo()

    // Now read users
    console.log('📖 Reading user data...')

    const filePath = path.join(__dirname, '../Huidigedatabase/oudedatabase.sql')
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let inUser = false
    let buffer = ''
    let userCount = 0
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    const userFields = [
      'user_id', 'partner', 'gold_days', 'role', 'name', 'name_seo', 'gender',
      'orientation', 'p_orientation', 'relation', 'couple', 'couple_id', 'mail',
      'change_mail', 'password', 'avatar', 'is_photo', 'is_photo_public', 'record',
      'record_id', 'country_id', 'state_id', 'city_id', 'country', 'state', 'city',
      'zip', 'birth' // ... and many more
    ]

    for await (const line of rl) {
      // Skip CREATE TABLE and other non-INSERT lines
      if (line.includes('CREATE TABLE `user`')) {
        continue
      }

      if (line.includes('INSERT INTO `user`')) {
        inUser = true
        buffer = line
      } else if (inUser) {
        buffer += ' ' + line

        if (line.includes(');') || line.includes('--')) {
          // Parse the complete INSERT statement
          const records = parseInsertStatement(buffer)

          for (const record of records) {
            const values = record.values

            if (values.length >= 28) {
              userCount++

              try {
                const userId = parseInt(values[0])
                const name = values[4] ? values[4].replace(/^'|'$/g, '') : null
                const email = values[12] ? values[12].replace(/^'|'$/g, '') : null
                const password = values[14] ? values[14].replace(/^'|'$/g, '') : null
                const genderRaw = values[6] ? values[6].replace(/^'|'$/g, '') : 'M'
                const birthRaw = values[27] ? values[27].replace(/^'|'$/g, '') : null
                const city = values[25] ? values[25].replace(/^'|'$/g, '') : null
                const state = values[24] ? values[24].replace(/^'|'$/g, '') : null
                const country = values[23] ? values[23].replace(/^'|'$/g, '') : null
                const registerRaw = values[35] ? values[35].replace(/^'|'$/g, '') : null
                const isPhoto = values[16] ? values[16].replace(/^'|'$/g, '') : 'N'
                const role = values[3] ? values[3].replace(/^'|'$/g, '') : 'user'
                const active = parseInt(values[32]) || 1

                // Skip if no email or invalid email
                if (!email || email === '' || email === '0' || !email.includes('@')) {
                  skippedCount++
                  continue
                }

                // Skip if banned or inactive
                if (active === 0) {
                  skippedCount++
                  continue
                }

                // Get userinfo for this user
                const userInfo = userInfoMap.get(userId)

                // Parse birth date
                let birthDate: Date | null = null
                if (birthRaw && birthRaw !== '0000-00-00' && birthRaw !== '') {
                  try {
                    birthDate = new Date(birthRaw)
                    // Validate age (must be 18+)
                    const age = calculateAge(birthDate)
                    if (age < 18 || age > 100) {
                      birthDate = null
                    }
                  } catch (e) {
                    birthDate = null
                  }
                }

                // Parse registration date
                let createdAt: Date = new Date()
                if (registerRaw && registerRaw !== '0000-00-00 00:00:00' && registerRaw !== '') {
                  try {
                    createdAt = new Date(registerRaw)
                  } catch (e) {
                    // Use default
                  }
                }

                // Map gender
                const gender = mapGender(genderRaw as 'M' | 'F')

                // Build bio from userinfo
                let bio = ''
                if (userInfo) {
                  if (userInfo.about_me) {
                    bio += userInfo.about_me
                  }
                  if (userInfo.interested_in) {
                    if (bio) bio += '\n\n'
                    bio += `Zoekt: ${userInfo.interested_in}`
                  }
                }

                // Create the user in new database
                const newUser = await prisma.user.create({
                  data: {
                    email: email.toLowerCase().trim(),
                    name: name || email.split('@')[0],
                    passwordHash: password, // Old bcrypt hashes should still work
                    gender,
                    birthDate,
                    city,
                    bio: bio || null,
                    role: role === 'admin' ? 'ADMIN' : 'USER',
                    isVerified: true, // Assume old users are verified
                    hasAcceptedTerms: true,
                    profileImage: isPhoto === 'Y' ? `https://utfs.io/placeholder-${userId}.jpg` : null,
                    createdAt,
                    updatedAt: createdAt,
                  }
                })

                migratedCount++

                if (migratedCount % 100 === 0) {
                  console.log(`✅ Migrated ${migratedCount} users...`)
                }

                // Stop if we've reached the limit
                if (MIGRATION_LIMIT && migratedCount >= MIGRATION_LIMIT) {
                  console.log(`\n🎯 Reached migration limit of ${MIGRATION_LIMIT} users`)
                  break
                }

              } catch (error: any) {
                errorCount++
                if (error.code === 'P2002') {
                  // Duplicate email - skip
                  skippedCount++
                } else {
                  console.error(`❌ Error migrating user ${values[0]}:`, error.message)
                }
              }
            }
          }

          inUser = false
          buffer = ''

          // Break outer loop if limit reached
          if (MIGRATION_LIMIT && migratedCount >= MIGRATION_LIMIT) {
            break
          }
        }
      }

      // Break outer loop if limit reached
      if (MIGRATION_LIMIT && migratedCount >= MIGRATION_LIMIT) {
        break
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`   Total users found: ${userCount}`)
    console.log(`   Successfully migrated: ${migratedCount}`)
    console.log(`   Skipped: ${skippedCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log('\n✅ Migration complete!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get limit from command line argument
const args = process.argv.slice(2)
const limitArg = args.find(arg => arg.startsWith('--limit='))
const MIGRATION_LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : undefined

if (MIGRATION_LIMIT) {
  console.log(`🎯 Test mode: Will migrate maximum ${MIGRATION_LIMIT} users\n`)
}

// Run migration
migrateUsers()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
