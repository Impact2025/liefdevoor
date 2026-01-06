/**
 * SpamGuard Test Suite
 *
 * Test of echte gebruikers niet worden geblokkeerd
 * en spam/bots wel worden gedetecteerd.
 */

import { SpamGuard } from '../lib/spam-guard'
import { analyzeName } from '../lib/spam-guard/name-analyzer'
import { analyzeEmail } from '../lib/spam-guard/disposable-emails'

// Kleuren voor output
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

// =============================================================================
// TEST DATA
// =============================================================================

// Echte Nederlandse namen die NIET geblokkeerd mogen worden
const LEGITIMATE_DUTCH_NAMES = [
  'Jan de Vries',
  'Anna van der Berg',
  'Pieter-Jan Bakker',
  'Marie-Louise de Jong',
  'Henk Jansen',
  'Sophie Vermeer',
  'Willem-Alexander',
  'Máxima',
  'Fleur',
  'Daan',
  'Emma',
  'Lucas',
  'Julia',
  'Bram van Dijk',
  'Sanne',
  'Thijs',
  'Lisa Smit',
  'Niels de Boer',
  'Eva',
  'Jesse',
  'Noa',
  'Milan',
  'Tessa Mulder',
  'Ruben',
  'Lotte Visser',
  'Tim',
  'Amy',
  'Bas',
  'Eline',
  'Stijn de Graaf',
  // Wat langere namen
  'Anne-Sophie van der Linden',
  'Jan-Willem Hendriksen',
  'Maria-Christina de Groot',
  // Friese namen
  'Sjoerd',
  'Femke',
  'Tjeerd',
  'Rixt',
  // Limburgse namen
  'Sjef',
  'Fien',
]

// Internationale namen die ook legitiem zijn
const LEGITIMATE_INTERNATIONAL_NAMES = [
  'Mohammed Al-Hassan',
  'Fatima Youssef',
  'Ahmed',
  'Aisha',
  'Wei Chen',
  'Yuki Tanaka',
  'Priya Sharma',
  'Raj Patel',
  'Olga Petrova',
  'Dmitri',
  'Maria García',
  'José',
  'João Silva',
  'Amélie',
  'François',
  'Björn',
  'Åsa',
  'Søren',
  'Øyvind',
  'Zoë',
  'Chloé',
  'Renée',
  'André',
  // Turkse namen
  'Mehmet Yılmaz',
  'Ayşe',
  'Mustafa',
  'Fatma Özdemir',
  // Marokkaanse namen
  'Youssef Amrani',
  'Rachid',
  'Samira',
  'Nadia Benali',
  // Surinaamse namen
  'Radjesh',
  'Sharmila',
  'Dewi',
]

// Korte maar legitieme namen
const LEGITIMATE_SHORT_NAMES = [
  'Bo',
  'Isa',
  'Cas',
  'Evi',
  'Mees',
  'Fay',
  'Sef',
  'Lot',
  'Sam',
  'Max',
  'Jay',
  'Kim',
  'Tom',
  'Rik',
  'Bas',
  'Lex',
  'Tim',
  'Roy',
  'Sem',
  'Pip',
]

// SPAM namen die WEL geblokkeerd moeten worden
const SPAM_NAMES = [
  'Abdulkairmgmoc',        // De originele spam
  'asdfghjkl',             // Keyboard pattern
  'qwertyuiop',
  'test123456',
  'user98765',
  'aaaaaaaaa',             // Repetitief
  'xyzxyzxyz',
  'jd9862506',             // Random cijfers
  'ab12345cd',
  'admin',
  'testuser',
  'abcdefghijklmnop',      // Lange random
  'zzzzzzzzzz',
  'asdasdasd',
  'Jkhsdkjfhskdf',         // Random letters
  'Xvnwoeifnwef',
  '12345john',
  'mike99999999',
  'sexy_lady_69',
  'hot_girl_23',
]

// Legitieme emails die NIET geblokkeerd mogen worden
const LEGITIMATE_EMAILS = [
  'jan.devries@gmail.com',
  'anna.vanderberg@hotmail.com',
  'info@bedrijf.nl',
  'contact@example.com',
  'pieter.bakker@outlook.com',
  'sophie123@gmail.com',
  'henk_jansen@yahoo.com',
  'marie.de.jong@live.nl',
  'test@company.nl',          // test@ is ok bij bedrijfsdomein
  'j.jansen@uva.nl',
  'student@hva.nl',
  'medewerker@overheid.nl',
  'info@zorginstelling.nl',
  'm.vermeer@xs4all.nl',
  'contact@kpn.com',
  'service@ziggo.nl',
  // Internationaal
  'ahmed.hassan@gmail.com',
  'wei.chen@hotmail.com',
  'maria.garcia@outlook.es',
  // Met + alias (Gmail feature)
  'jan+dating@gmail.com',
  'sophie+test@gmail.com',
]

// SPAM emails die WEL geblokkeerd moeten worden
const SPAM_EMAILS = [
  'jd9862506@gmail.com',      // De originele spam
  'test@10minutemail.com',
  'fake@guerrillamail.com',
  'spam@mailinator.com',
  'bot@tempmail.com',
  'user@yopmail.com',
  'fake@throwaway.email',
  'x@trashmail.com',
  'a@maildrop.cc',
  'test@sharklasers.com',
  // Verdachte patronen
  'ab12345@gmail.com',
  'xy98765@hotmail.com',
  'qwerty123@outlook.com',
  'asdf1234@yahoo.com',
  'temp999@gmail.com',
  'user123456789@gmail.com',
  'a1b2c3d4e5@gmail.com',
]

// =============================================================================
// TEST RUNNER
// =============================================================================

interface TestResult {
  input: string
  passed: boolean
  score: number
  reasons: string[]
  expected: 'allow' | 'block'
  actual: 'allow' | 'block'
}

function testName(name: string, shouldBlock: boolean): TestResult {
  const result = analyzeName(name)
  const blocked = result.suspicionScore >= 50
  const passed = blocked === shouldBlock

  return {
    input: name,
    passed,
    score: result.suspicionScore,
    reasons: result.reasons,
    expected: shouldBlock ? 'block' : 'allow',
    actual: blocked ? 'block' : 'allow',
  }
}

function testEmail(email: string, shouldBlock: boolean): TestResult {
  const result = analyzeEmail(email)
  const blocked = result.isDisposable || result.suspicionScore >= 80
  const passed = blocked === shouldBlock

  return {
    input: email,
    passed,
    score: result.suspicionScore,
    reasons: result.reasons,
    expected: shouldBlock ? 'block' : 'allow',
    actual: blocked ? 'block' : 'allow',
  }
}

function printResults(title: string, results: TestResult[], showAll: boolean = false) {
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const passRate = ((passed / results.length) * 100).toFixed(1)

  console.log(`\n${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}  ${title}${RESET}`)
  console.log(`${BLUE}═══════════════════════════════════════════════════════════════${RESET}`)
  console.log(`  ${GREEN}✓ Passed: ${passed}${RESET}  ${RED}✗ Failed: ${failed}${RESET}  Pass Rate: ${passRate}%\n`)

  // Toon alleen failures, of alles als showAll=true
  const toShow = showAll ? results : results.filter(r => !r.passed)

  if (toShow.length === 0 && !showAll) {
    console.log(`  ${GREEN}Alle tests geslaagd!${RESET}\n`)
    return
  }

  toShow.forEach(r => {
    const icon = r.passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`
    const scoreColor = r.score >= 70 ? RED : r.score >= 50 ? YELLOW : GREEN

    console.log(`  ${icon} "${r.input}"`)
    console.log(`    Score: ${scoreColor}${r.score}${RESET} | Expected: ${r.expected} | Actual: ${r.actual}`)
    if (r.reasons.length > 0 && !r.passed) {
      console.log(`    ${YELLOW}Reasons: ${r.reasons.slice(0, 3).join(', ')}${RESET}`)
    }
  })
}

async function runTests() {
  console.log(`\n${BOLD}${BLUE}`)
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║           SPAMGUARD TEST SUITE - FALSE POSITIVE CHECK         ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log(RESET)

  // Test 1: Nederlandse namen (moeten NIET geblokkeerd worden)
  console.log(`\n${BOLD}Testing Dutch Names (should ALL pass)...${RESET}`)
  const dutchResults = LEGITIMATE_DUTCH_NAMES.map(name => testName(name, false))
  printResults('🇳🇱 NEDERLANDSE NAMEN (mogen NIET geblokkeerd worden)', dutchResults)

  // Test 2: Internationale namen (moeten NIET geblokkeerd worden)
  console.log(`\n${BOLD}Testing International Names (should ALL pass)...${RESET}`)
  const intlResults = LEGITIMATE_INTERNATIONAL_NAMES.map(name => testName(name, false))
  printResults('🌍 INTERNATIONALE NAMEN (mogen NIET geblokkeerd worden)', intlResults)

  // Test 3: Korte namen (moeten NIET geblokkeerd worden)
  console.log(`\n${BOLD}Testing Short Names (should ALL pass)...${RESET}`)
  const shortResults = LEGITIMATE_SHORT_NAMES.map(name => testName(name, false))
  printResults('📝 KORTE NAMEN (mogen NIET geblokkeerd worden)', shortResults)

  // Test 4: Spam namen (moeten WEL geblokkeerd worden)
  console.log(`\n${BOLD}Testing Spam Names (should ALL be blocked)...${RESET}`)
  const spamNameResults = SPAM_NAMES.map(name => testName(name, true))
  printResults('🚫 SPAM NAMEN (moeten WEL geblokkeerd worden)', spamNameResults)

  // Test 5: Legitieme emails (moeten NIET geblokkeerd worden)
  console.log(`\n${BOLD}Testing Legitimate Emails (should ALL pass)...${RESET}`)
  const legitEmailResults = LEGITIMATE_EMAILS.map(email => testEmail(email, false))
  printResults('📧 LEGITIEME EMAILS (mogen NIET geblokkeerd worden)', legitEmailResults)

  // Test 6: Spam emails (moeten WEL geblokkeerd worden)
  console.log(`\n${BOLD}Testing Spam Emails (should ALL be blocked)...${RESET}`)
  const spamEmailResults = SPAM_EMAILS.map(email => testEmail(email, true))
  printResults('🚫 SPAM EMAILS (moeten WEL geblokkeerd worden)', spamEmailResults)

  // Overall Summary
  const allResults = [
    ...dutchResults,
    ...intlResults,
    ...shortResults,
    ...spamNameResults,
    ...legitEmailResults,
    ...spamEmailResults,
  ]

  const totalPassed = allResults.filter(r => r.passed).length
  const totalFailed = allResults.filter(r => !r.passed).length
  const falsePositives = [...dutchResults, ...intlResults, ...shortResults, ...legitEmailResults]
    .filter(r => !r.passed).length
  const falsenegatives = [...spamNameResults, ...spamEmailResults]
    .filter(r => !r.passed).length

  console.log(`\n${BOLD}${BLUE}`)
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║                      OVERALL SUMMARY                          ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log(RESET)

  console.log(`  Total Tests: ${allResults.length}`)
  console.log(`  ${GREEN}✓ Passed: ${totalPassed}${RESET}`)
  console.log(`  ${RED}✗ Failed: ${totalFailed}${RESET}`)
  console.log(`  Pass Rate: ${((totalPassed / allResults.length) * 100).toFixed(1)}%`)
  console.log('')
  console.log(`  ${RED}False Positives (echte users geblokkeerd): ${falsePositives}${RESET}`)
  console.log(`  ${YELLOW}False Negatives (spam doorgelaten): ${falsenegatives}${RESET}`)

  if (falsePositives > 0) {
    console.log(`\n  ${RED}⚠️  WAARSCHUWING: Er zijn false positives! Echte gebruikers worden geblokkeerd.${RESET}`)
  } else {
    console.log(`\n  ${GREEN}✅ Geen false positives! Echte gebruikers hebben geen last van SpamGuard.${RESET}`)
  }

  // Return exit code
  process.exit(falsePositives > 0 ? 1 : 0)
}

// Run tests
runTests().catch(console.error)
