/**
 * Encrypt Existing Data Migration
 *
 * Encrypts sensitive data that's currently stored in plain text:
 * - 2FA secrets
 * - 2FA backup codes
 * - Password reset tokens
 * - Private messages (optional)
 *
 * ⚠️  IMPORTANT:
 * - Backup database before running
 * - Run during maintenance window
 * - Cannot be reversed without backup
 *
 * Usage:
 *   npx tsx scripts/encrypt-existing-data.ts --dry-run
 *   npx tsx scripts/encrypt-existing-data.ts --confirm
 */

import { PrismaClient } from '@prisma/client'
import { encrypt, hashToken, isEncrypted } from '../lib/encryption'

const prisma = new PrismaClient()

// ============================================================================
// CONFIGURATION
// ============================================================================

const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const INCLUDE_MESSAGES = process.argv.includes('--include-messages')

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function encryptUserSecrets() {
  console.log('\n📝 Encrypting 2FA secrets and backup codes...')

  const usersWithSecrets = await prisma.user.findMany({
    where: {
      OR: [
        { twoFactorSecret: { not: null } },
        { twoFactorBackupCodes: { not: null } },
      ]
    },
    select: {
      id: true,
      email: true,
      twoFactorSecret: true,
      twoFactorBackupCodes: true,
    }
  })

  console.log(`Found ${usersWithSecrets.length} users with 2FA data`)

  let encrypted = 0
  let skipped = 0
  let errors = 0

  for (const user of usersWithSecrets) {
    try {
      const updates: any = {}

      // Encrypt 2FA secret
      if (user.twoFactorSecret && !isEncrypted(user.twoFactorSecret)) {
        updates.twoFactorSecret = encrypt(user.twoFactorSecret)
        console.log(`  ✓ Encrypted 2FA secret for ${user.email}`)
      } else if (user.twoFactorSecret) {
        console.log(`  ⊘ Skipped ${user.email} - already encrypted`)
        skipped++
      }

      // Encrypt backup codes
      if (user.twoFactorBackupCodes && !isEncrypted(user.twoFactorBackupCodes)) {
        updates.twoFactorBackupCodes = encrypt(user.twoFactorBackupCodes)
        console.log(`  ✓ Encrypted backup codes for ${user.email}`)
      }

      // Update if not dry run
      if (Object.keys(updates).length > 0) {
        if (!DRY_RUN && CONFIRM) {
          await prisma.user.update({
            where: { id: user.id },
            data: updates
          })
        }
        encrypted++
      }
    } catch (error) {
      console.error(`  ✗ Error encrypting data for ${user.email}:`, error)
      errors++
    }
  }

  return { encrypted, skipped, errors }
}

async function hashPasswordResetTokens() {
  console.log('\n🔐 Hashing password reset tokens...')

  const activeResets = await prisma.passwordReset.findMany({
    where: {
      used: false,
      expiresAt: { gt: new Date() }
    }
  })

  console.log(`Found ${activeResets.length} active reset tokens`)

  let hashed = 0
  let errors = 0

  for (const reset of activeResets) {
    try {
      // Check if already hashed (SHA-256 produces 64-char hex string)
      if (reset.token.length === 64 && /^[0-9a-f]+$/i.test(reset.token)) {
        console.log(`  ⊘ Token for ${reset.email} already hashed`)
        continue
      }

      const hashedToken = hashToken(reset.token)

      if (!DRY_RUN && CONFIRM) {
        await prisma.passwordReset.update({
          where: { id: reset.id },
          data: { token: hashedToken }
        })
      }

      console.log(`  ✓ Hashed reset token for ${reset.email}`)
      hashed++
    } catch (error) {
      console.error(`  ✗ Error hashing token for ${reset.email}:`, error)
      errors++
    }
  }

  return { hashed, errors }
}

async function encryptMessages() {
  console.log('\n💬 Encrypting private messages...')

  if (!INCLUDE_MESSAGES) {
    console.log('⊘ Skipped (use --include-messages to enable)')
    return { encrypted: 0, errors: 0 }
  }

  const messages = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
    }
  })

  console.log(`Found ${messages.length} messages`)

  let encrypted = 0
  let skipped = 0
  let errors = 0

  for (const message of messages) {
    try {
      // Skip if already encrypted
      if (isEncrypted(message.content)) {
        skipped++
        continue
      }

      const encryptedContent = encrypt(message.content)

      if (!DRY_RUN && CONFIRM) {
        await prisma.message.update({
          where: { id: message.id },
          data: { content: encryptedContent }
        })
      }

      encrypted++

      // Progress indicator
      if (encrypted % 100 === 0) {
        console.log(`  Progress: ${encrypted}/${messages.length}`)
      }
    } catch (error) {
      console.error(`  ✗ Error encrypting message ${message.id}:`, error)
      errors++
    }
  }

  return { encrypted, skipped, errors }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n🔐 ENCRYPTION MIGRATION SCRIPT')
  console.log('=' .repeat(70))

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY) {
    console.error('\n❌ ERROR: ENCRYPTION_KEY not set in environment')
    console.log('\nRun: npx tsx scripts/generate-encryption-key.ts')
    process.exit(1)
  }

  // Check mode
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made')
  } else if (!CONFIRM) {
    console.error('\n❌ ERROR: Must use --dry-run or --confirm')
    console.log('\nUsage:')
    console.log('  npx tsx scripts/encrypt-existing-data.ts --dry-run')
    console.log('  npx tsx scripts/encrypt-existing-data.ts --confirm')
    console.log('  npx tsx scripts/encrypt-existing-data.ts --confirm --include-messages')
    process.exit(1)
  } else {
    console.log('\n⚠️  LIVE MODE - Database will be modified!')
    console.log('Waiting 5 seconds... (Ctrl+C to cancel)\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  console.log('=' .repeat(70))

  try {
    // 1. Encrypt 2FA secrets
    const secrets = await encryptUserSecrets()

    // 2. Hash password reset tokens
    const tokens = await hashPasswordResetTokens()

    // 3. Encrypt messages (optional)
    const messages = await encryptMessages()

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('📊 MIGRATION SUMMARY')
    console.log('=' .repeat(70))
    console.log(`\n2FA Secrets:`)
    console.log(`  ✓ Encrypted: ${secrets.encrypted}`)
    console.log(`  ⊘ Skipped:   ${secrets.skipped}`)
    console.log(`  ✗ Errors:    ${secrets.errors}`)

    console.log(`\nPassword Reset Tokens:`)
    console.log(`  ✓ Hashed:    ${tokens.hashed}`)
    console.log(`  ✗ Errors:    ${tokens.errors}`)

    if (INCLUDE_MESSAGES) {
      console.log(`\nMessages:`)
      console.log(`  ✓ Encrypted: ${messages.encrypted}`)
      console.log(`  ⊘ Skipped:   ${messages.skipped}`)
      console.log(`  ✗ Errors:    ${messages.errors}`)
    }

    const totalErrors = secrets.errors + tokens.errors + messages.errors

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN COMPLETE - No changes made')
      console.log('Run with --confirm to apply changes')
    } else if (totalErrors === 0) {
      console.log('\n✅ MIGRATION SUCCESSFUL!')
    } else {
      console.log(`\n⚠️  MIGRATION COMPLETED WITH ${totalErrors} ERRORS`)
      console.log('Check errors above and verify database integrity')
    }

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
