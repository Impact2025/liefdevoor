/**
 * SpamGuard Combined Test
 *
 * Test de volledige SpamGuard check die alle factoren combineert.
 */

import { SpamGuard } from '../lib/spam-guard'

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

interface TestCase {
  name: string
  email: string
  description: string
  shouldBlock: boolean
}

// Test cases met naam + email combinaties
const TEST_CASES: TestCase[] = [
  // ===== SPAM - MOET GEBLOKKEERD WORDEN =====
  {
    name: 'Abdulkairmgmoc',
    email: 'jd9862506@gmail.com',
    description: 'De originele spam registratie',
    shouldBlock: true,
  },
  {
    name: 'Xvnwoeifnwef',
    email: 'ab12345@gmail.com',
    description: 'Random naam + random email',
    shouldBlock: true,
  },
  {
    name: 'asdfghjkl',
    email: 'qwerty123@gmail.com',
    description: 'Keyboard pattern naam + email',
    shouldBlock: true,
  },
  {
    name: 'testuser',
    email: 'test@10minutemail.com',
    description: 'Test user + disposable email',
    shouldBlock: true,
  },
  {
    name: 'John123456',
    email: 'user@guerrillamail.com',
    description: 'Naam met cijfers + disposable',
    shouldBlock: true,
  },
  {
    name: 'aaaaaaaaa',
    email: 'spam@mailinator.com',
    description: 'Repetitieve naam + disposable',
    shouldBlock: true,
  },

  // ===== LEGITIEM - MAG NIET GEBLOKKEERD WORDEN =====
  {
    name: 'Jan de Vries',
    email: 'jan.devries@gmail.com',
    description: 'Nederlandse naam + normale email',
    shouldBlock: false,
  },
  {
    name: 'Anna van der Berg',
    email: 'anna.vanderberg@hotmail.com',
    description: 'Nederlandse naam + Hotmail',
    shouldBlock: false,
  },
  {
    name: 'Sophie',
    email: 'sophie123@gmail.com',
    description: 'Korte naam + email met cijfers',
    shouldBlock: false,
  },
  {
    name: 'Mohammed Al-Hassan',
    email: 'mohammed.hassan@outlook.com',
    description: 'Internationale naam + Outlook',
    shouldBlock: false,
  },
  {
    name: 'Fatima Youssef',
    email: 'fatima@bedrijf.nl',
    description: 'Internationale naam + NL domein',
    shouldBlock: false,
  },
  {
    name: 'Pieter-Jan Bakker',
    email: 'pj.bakker@xs4all.nl',
    description: 'Dubbele voornaam + NL ISP',
    shouldBlock: false,
  },
  {
    name: 'Bo',
    email: 'bo@gmail.com',
    description: 'Zeer korte naam + Gmail',
    shouldBlock: false,
  },
  {
    name: 'Wei Chen',
    email: 'wei.chen@gmail.com',
    description: 'Chinese naam + Gmail',
    shouldBlock: false,
  },
  {
    name: 'Máxima',
    email: 'maxima@koningshuis.nl',
    description: 'Naam met accent + NL domein',
    shouldBlock: false,
  },
  {
    name: 'Jan',
    email: 'jan+dating@gmail.com',
    description: 'Korte naam + Gmail alias',
    shouldBlock: false,
  },
]

async function runTest() {
  console.log(`\n${BOLD}${BLUE}`)
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║         SPAMGUARD COMBINED CHECK - NAAM + EMAIL               ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log(RESET)

  let passed = 0
  let failed = 0
  const failures: { test: TestCase; result: any }[] = []

  for (const test of TEST_CASES) {
    // Simuleer een check met fake IP
    const result = await SpamGuard.check({
      name: test.name,
      email: test.email,
      ip: '192.168.1.1', // Fake IP voor test
    })

    const blocked = result.shouldBlock
    const testPassed = blocked === test.shouldBlock

    if (testPassed) {
      passed++
      console.log(`${GREEN}✓${RESET} ${test.description}`)
      console.log(`  Name: "${test.name}" | Email: "${test.email}"`)
      console.log(`  Score: ${result.overallScore} | Blocked: ${blocked} | Expected: ${test.shouldBlock ? 'block' : 'allow'}`)
    } else {
      failed++
      failures.push({ test, result })
      console.log(`${RED}✗${RESET} ${test.description}`)
      console.log(`  Name: "${test.name}" | Email: "${test.email}"`)
      console.log(`  Score: ${result.overallScore} | Blocked: ${blocked} | Expected: ${test.shouldBlock ? 'block' : 'allow'}`)
      console.log(`  ${YELLOW}Reasons: ${result.reasons.slice(0, 3).join(', ')}${RESET}`)
    }
    console.log('')
  }

  // Summary
  console.log(`\n${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}SUMMARY${RESET}`)
  console.log(`${BLUE}═══════════════════════════════════════════════════════════════${RESET}`)
  console.log(`  ${GREEN}✓ Passed: ${passed}${RESET}`)
  console.log(`  ${RED}✗ Failed: ${failed}${RESET}`)
  console.log(`  Pass Rate: ${((passed / TEST_CASES.length) * 100).toFixed(1)}%`)

  // Analyze failures
  const falsePositives = failures.filter(f => !f.test.shouldBlock)
  const falseNegatives = failures.filter(f => f.test.shouldBlock)

  console.log('')
  console.log(`  ${RED}False Positives (echte users geblokkeerd): ${falsePositives.length}${RESET}`)
  console.log(`  ${YELLOW}False Negatives (spam doorgelaten): ${falseNegatives.length}${RESET}`)

  if (falsePositives.length > 0) {
    console.log(`\n${RED}⚠️  KRITIEK: Echte gebruikers worden geblokkeerd!${RESET}`)
    falsePositives.forEach(f => {
      console.log(`   - "${f.test.name}" (${f.test.email})`)
    })
  }

  if (falseNegatives.length > 0) {
    console.log(`\n${YELLOW}⚠️  Spam komt nog door:${RESET}`)
    falseNegatives.forEach(f => {
      console.log(`   - "${f.test.name}" (${f.test.email}) - Score: ${f.result.overallScore}`)
    })
  }

  if (falsePositives.length === 0 && falseNegatives.length === 0) {
    console.log(`\n${GREEN}✅ Perfect! Alle spam wordt geblokkeerd en geen echte users hebben er last van.${RESET}`)
  }
}

runTest().catch(console.error)
