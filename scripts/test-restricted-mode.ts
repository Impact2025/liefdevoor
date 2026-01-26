/**
 * Test Script: Restricted Mode voor INACTIVE Migration Users
 *
 * Test scenarios:
 * 1. INACTIVE migration user ZONDER verificatie → restricted
 * 2. INACTIVE migration user MET verificatie → niet restricted
 * 3. Andere migration users (VIP/GOLD/ACTIVE/DORMANT) → niet restricted
 * 4. Normale users → niet restricted
 */

import { PrismaClient } from '@prisma/client'
import { checkVerificationStatus } from '../lib/verification/restricted-mode'

const prisma = new PrismaClient()

// Colors for console output
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

function pass(msg: string) {
  console.log(`${GREEN}✓ PASS${RESET}: ${msg}`)
}

function fail(msg: string) {
  console.log(`${RED}✗ FAIL${RESET}: ${msg}`)
}

function section(msg: string) {
  console.log(`\n${BOLD}${YELLOW}═══ ${msg} ═══${RESET}\n`)
}

async function runTests() {
  console.log(`\n${BOLD}🧪 Testing Restricted Mode for INACTIVE Migration Users${RESET}\n`)

  let passCount = 0
  let failCount = 0

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: INACTIVE migration user WITHOUT verification
  // ═══════════════════════════════════════════════════════════════
  section('Test 1: INACTIVE migration user ZONDER verificatie')

  // Create or find test user
  const inactiveUnverified = await prisma.user.upsert({
    where: { email: 'test-inactive-unverified@test.local' },
    update: {
      registrationSource: 'oogvoorliefde_migration_inactive',
      isPhotoVerified: false,
      isLivenessVerified: false,
    },
    create: {
      email: 'test-inactive-unverified@test.local',
      name: 'Test Inactive Unverified',
      registrationSource: 'oogvoorliefde_migration_inactive',
      isPhotoVerified: false,
      isLivenessVerified: false,
    },
  })

  console.log(`  User: ${inactiveUnverified.email}`)
  console.log(`  registrationSource: ${inactiveUnverified.registrationSource}`)
  console.log(`  isPhotoVerified: ${inactiveUnverified.isPhotoVerified}`)
  console.log(`  isLivenessVerified: ${inactiveUnverified.isLivenessVerified}`)

  const result1 = await checkVerificationStatus(inactiveUnverified.id)
  console.log(`  Result:`, JSON.stringify(result1, null, 2))

  if (!result1.allowed && result1.isRestricted) {
    pass('INACTIVE user zonder verificatie is RESTRICTED')
    passCount++
  } else {
    fail('INACTIVE user zonder verificatie zou RESTRICTED moeten zijn')
    failCount++
  }

  if (result1.error?.code === 'VERIFICATION_REQUIRED') {
    pass('Error code is VERIFICATION_REQUIRED')
    passCount++
  } else {
    fail('Error code zou VERIFICATION_REQUIRED moeten zijn')
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: INACTIVE migration user WITH only photo verification
  // ═══════════════════════════════════════════════════════════════
  section('Test 2: INACTIVE migration user MET alleen photo verificatie')

  const inactivePhotoOnly = await prisma.user.upsert({
    where: { email: 'test-inactive-photo-only@test.local' },
    update: {
      registrationSource: 'oogvoorliefde_migration_inactive',
      isPhotoVerified: true,
      isLivenessVerified: false,
    },
    create: {
      email: 'test-inactive-photo-only@test.local',
      name: 'Test Inactive Photo Only',
      registrationSource: 'oogvoorliefde_migration_inactive',
      isPhotoVerified: true,
      isLivenessVerified: false,
    },
  })

  console.log(`  User: ${inactivePhotoOnly.email}`)
  console.log(`  isPhotoVerified: ${inactivePhotoOnly.isPhotoVerified}`)
  console.log(`  isLivenessVerified: ${inactivePhotoOnly.isLivenessVerified}`)

  const result2 = await checkVerificationStatus(inactivePhotoOnly.id)
  console.log(`  Result:`, JSON.stringify(result2, null, 2))

  if (!result2.allowed && result2.isRestricted) {
    pass('INACTIVE user met alleen photo verificatie is nog RESTRICTED')
    passCount++
  } else {
    fail('INACTIVE user met alleen photo verificatie zou nog RESTRICTED moeten zijn')
    failCount++
  }

  if (result2.error?.missingVerifications?.includes('liveness')) {
    pass('Missing verification bevat "liveness"')
    passCount++
  } else {
    fail('Missing verification zou "liveness" moeten bevatten')
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 3: INACTIVE migration user WITH both verifications
  // ═══════════════════════════════════════════════════════════════
  section('Test 3: INACTIVE migration user MET beide verificaties')

  const inactiveVerified = await prisma.user.upsert({
    where: { email: 'test-inactive-verified@test.local' },
    update: {
      registrationSource: 'oogvoorliefde_migration_inactive',
      isPhotoVerified: true,
      isLivenessVerified: true,
    },
    create: {
      email: 'test-inactive-verified@test.local',
      name: 'Test Inactive Verified',
      registrationSource: 'oogvoorliefde_migration_inactive',
      isPhotoVerified: true,
      isLivenessVerified: true,
    },
  })

  console.log(`  User: ${inactiveVerified.email}`)
  console.log(`  isPhotoVerified: ${inactiveVerified.isPhotoVerified}`)
  console.log(`  isLivenessVerified: ${inactiveVerified.isLivenessVerified}`)

  const result3 = await checkVerificationStatus(inactiveVerified.id)
  console.log(`  Result:`, JSON.stringify(result3, null, 2))

  if (result3.allowed && !result3.isRestricted) {
    pass('INACTIVE user met beide verificaties is NIET restricted')
    passCount++
  } else {
    fail('INACTIVE user met beide verificaties zou NIET restricted moeten zijn')
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 4: Regular migration user (not INACTIVE)
  // ═══════════════════════════════════════════════════════════════
  section('Test 4: Reguliere migration user (VIP/GOLD/ACTIVE/DORMANT)')

  const regularMigration = await prisma.user.upsert({
    where: { email: 'test-regular-migration@test.local' },
    update: {
      registrationSource: 'oogvoorliefde_migration',
      isPhotoVerified: false,
      isLivenessVerified: false,
    },
    create: {
      email: 'test-regular-migration@test.local',
      name: 'Test Regular Migration',
      registrationSource: 'oogvoorliefde_migration',
      isPhotoVerified: false,
      isLivenessVerified: false,
    },
  })

  console.log(`  User: ${regularMigration.email}`)
  console.log(`  registrationSource: ${regularMigration.registrationSource}`)
  console.log(`  isPhotoVerified: ${regularMigration.isPhotoVerified}`)
  console.log(`  isLivenessVerified: ${regularMigration.isLivenessVerified}`)

  const result4 = await checkVerificationStatus(regularMigration.id)
  console.log(`  Result:`, JSON.stringify(result4, null, 2))

  if (result4.allowed && !result4.isRestricted) {
    pass('Reguliere migration user is NIET restricted (ook zonder verificatie)')
    passCount++
  } else {
    fail('Reguliere migration user zou NIET restricted moeten zijn')
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 5: Normal user (no migration)
  // ═══════════════════════════════════════════════════════════════
  section('Test 5: Normale user (geen migratie)')

  const normalUser = await prisma.user.upsert({
    where: { email: 'test-normal-user@test.local' },
    update: {
      registrationSource: 'website',
      isPhotoVerified: false,
      isLivenessVerified: false,
    },
    create: {
      email: 'test-normal-user@test.local',
      name: 'Test Normal User',
      registrationSource: 'website',
      isPhotoVerified: false,
      isLivenessVerified: false,
    },
  })

  console.log(`  User: ${normalUser.email}`)
  console.log(`  registrationSource: ${normalUser.registrationSource}`)

  const result5 = await checkVerificationStatus(normalUser.id)
  console.log(`  Result:`, JSON.stringify(result5, null, 2))

  if (result5.allowed && !result5.isRestricted) {
    pass('Normale user is NIET restricted')
    passCount++
  } else {
    fail('Normale user zou NIET restricted moeten zijn')
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 6: Non-existent user
  // ═══════════════════════════════════════════════════════════════
  section('Test 6: Niet-bestaande user')

  const result6 = await checkVerificationStatus('non-existent-user-id-12345')
  console.log(`  Result:`, JSON.stringify(result6, null, 2))

  if (!result6.allowed) {
    pass('Niet-bestaande user krijgt geen toegang')
    passCount++
  } else {
    fail('Niet-bestaande user zou geen toegang moeten krijgen')
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 7: Check incentive update in migration engine
  // ═══════════════════════════════════════════════════════════════
  section('Test 7: INACTIVE incentive check (premiumMonths: 1)')

  // Import and check the EMAIL_SEQUENCE config
  const { EMAIL_SEQUENCE } = await import('../lib/migration/migration-engine')

  console.log(`  INACTIVE incentive:`, EMAIL_SEQUENCE.incentives.INACTIVE)

  if (EMAIL_SEQUENCE.incentives.INACTIVE.premiumMonths === 1) {
    pass('INACTIVE krijgt nu 1 maand premium (was 0)')
    passCount++
  } else {
    fail(`INACTIVE premiumMonths zou 1 moeten zijn, is ${EMAIL_SEQUENCE.incentives.INACTIVE.premiumMonths}`)
    failCount++
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${BOLD}═══════════════════════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}                        SUMMARY${RESET}`)
  console.log(`${BOLD}═══════════════════════════════════════════════════════════${RESET}\n`)

  console.log(`  ${GREEN}Passed: ${passCount}${RESET}`)
  console.log(`  ${RED}Failed: ${failCount}${RESET}`)
  console.log(`  Total:  ${passCount + failCount}`)

  if (failCount === 0) {
    console.log(`\n  ${GREEN}${BOLD}🎉 All tests passed!${RESET}\n`)
  } else {
    console.log(`\n  ${RED}${BOLD}⚠️  Some tests failed${RESET}\n`)
  }

  // Cleanup test users
  console.log(`${YELLOW}Cleaning up test users...${RESET}`)
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'test-inactive-unverified@test.local',
          'test-inactive-photo-only@test.local',
          'test-inactive-verified@test.local',
          'test-regular-migration@test.local',
          'test-normal-user@test.local',
        ]
      }
    }
  })
  console.log(`${GREEN}✓ Test users cleaned up${RESET}\n`)

  await prisma.$disconnect()

  process.exit(failCount > 0 ? 1 : 0)
}

runTests().catch(async (error) => {
  console.error(`${RED}Test failed with error:${RESET}`, error)
  await prisma.$disconnect()
  process.exit(1)
})
