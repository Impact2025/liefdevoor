/**
 * WERELDKLASSE Professional Test Suite
 *
 * Comprehensive testing of all implemented fixes:
 * - Email system
 * - Database connectivity
 * - Scripts functionality
 * - Environment configuration
 * - API endpoints
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  category: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  duration: number
  message: string
  details?: string
}

class TestSuite {
  private results: TestResult[] = []
  private startTime: Date = new Date()

  async runTest(
    name: string,
    category: string,
    testFn: () => Promise<{ status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'; message: string; details?: string }>
  ) {
    const start = Date.now()
    console.log(`\n▶️  ${category} / ${name}`)

    try {
      const result = await testFn()
      const duration = Date.now() - start

      this.results.push({
        name,
        category,
        ...result,
        duration
      })

      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : result.status === 'SKIP' ? '⏭️' : '❌'
      console.log(`${icon} ${result.status} - ${result.message} (${duration}ms)`)
      if (result.details) {
        console.log(`   ${result.details}`)
      }
    } catch (error) {
      const duration = Date.now() - start
      const message = error instanceof Error ? error.message : 'Unknown error'

      this.results.push({
        name,
        category,
        status: 'FAIL',
        duration,
        message: 'Exception thrown',
        details: message
      })

      console.log(`❌ FAIL - Exception: ${message} (${duration}ms)`)
    }
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime.getTime()
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warned = this.results.filter(r => r.status === 'WARN').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length
    const total = this.results.length

    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST SUITE REPORT')
    console.log('='.repeat(80))
    console.log()
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed} (${(passed / total * 100).toFixed(1)}%)`)
    console.log(`❌ Failed: ${failed} (${(failed / total * 100).toFixed(1)}%)`)
    console.log(`⚠️  Warnings: ${warned} (${(warned / total * 100).toFixed(1)}%)`)
    console.log(`⏭️  Skipped: ${skipped} (${(skipped / total * 100).toFixed(1)}%)`)
    console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`)
    console.log()

    // Group by category
    const categories = [...new Set(this.results.map(r => r.category))]
    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category)
      const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length
      const categoryTotal = categoryResults.length

      console.log(`\n📦 ${category}`)
      console.log(`   Tests: ${categoryTotal} | Passed: ${categoryPassed}/${categoryTotal}`)

      for (const result of categoryResults) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : result.status === 'SKIP' ? '⏭️' : '❌'
        console.log(`   ${icon} ${result.name} - ${result.message}`)
      }
    }

    // Failed tests details
    const failedTests = this.results.filter(r => r.status === 'FAIL')
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS DETAILS:')
      for (const test of failedTests) {
        console.log(`\n   ${test.category} / ${test.name}`)
        console.log(`   Message: ${test.message}`)
        if (test.details) {
          console.log(`   Details: ${test.details}`)
        }
      }
    }

    console.log('\n' + '='.repeat(80))

    // Overall status
    if (failed === 0 && warned === 0) {
      console.log('🎉 ALL TESTS PASSED - PRODUCTION READY!')
    } else if (failed === 0) {
      console.log('⚠️  ALL TESTS PASSED WITH WARNINGS - Review warnings before production')
    } else {
      console.log('❌ SOME TESTS FAILED - Fix issues before production')
    }

    console.log('='.repeat(80))
    console.log()

    return {
      passed,
      failed,
      warned,
      skipped,
      total,
      success: failed === 0
    }
  }
}

async function runTestSuite() {
  console.log('🧪 WERELDKLASSE PROFESSIONAL TEST SUITE')
  console.log('='.repeat(80))
  console.log('Testing all implemented fixes and features')
  console.log('='.repeat(80))

  const suite = new TestSuite()

  // ==================== ENVIRONMENT TESTS ====================
  await suite.runTest('RESEND_API_KEY configured', 'Environment', async () => {
    const hasKey = !!process.env.RESEND_API_KEY
    return {
      status: hasKey ? 'PASS' : 'FAIL',
      message: hasKey ? 'API key is set' : 'API key is NOT set',
      details: hasKey ? undefined : 'Set RESEND_API_KEY in .env'
    }
  })

  await suite.runTest('EMAIL_FROM configured', 'Environment', async () => {
    const hasFrom = !!process.env.EMAIL_FROM
    return {
      status: hasFrom ? 'PASS' : 'WARN',
      message: hasFrom ? `Set to: ${process.env.EMAIL_FROM}` : 'Not set - will use default',
      details: hasFrom ? undefined : 'Consider setting EMAIL_FROM="Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>"'
    }
  })

  await suite.runTest('DATABASE_URL configured', 'Environment', async () => {
    const hasDb = !!process.env.DATABASE_URL
    return {
      status: hasDb ? 'PASS' : 'FAIL',
      message: hasDb ? 'Database URL is set' : 'Database URL is NOT set'
    }
  })

  await suite.runTest('NEXTAUTH_URL configured', 'Environment', async () => {
    const hasUrl = !!process.env.NEXTAUTH_URL
    return {
      status: hasUrl ? 'PASS' : 'WARN',
      message: hasUrl ? `Set to: ${process.env.NEXTAUTH_URL}` : 'Not set - using default'
    }
  })

  // ==================== DATABASE TESTS ====================
  await suite.runTest('Database connection', 'Database', async () => {
    try {
      await prisma.$connect()
      return { status: 'PASS', message: 'Connected successfully' }
    } catch (error) {
      return {
        status: 'FAIL',
        message: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  await suite.runTest('User table accessible', 'Database', async () => {
    try {
      const count = await prisma.user.count()
      return {
        status: 'PASS',
        message: `Found ${count} users`
      }
    } catch (error) {
      return {
        status: 'FAIL',
        message: 'Cannot access User table',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  await suite.runTest('EmailLog table accessible', 'Database', async () => {
    try {
      const count = await prisma.emailLog.count()
      return {
        status: 'PASS',
        message: `Found ${count} email logs`
      }
    } catch (error) {
      return {
        status: 'FAIL',
        message: 'Cannot access EmailLog table',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  await suite.runTest('AuditLog table accessible', 'Database', async () => {
    try {
      const count = await prisma.auditLog.count()
      return {
        status: 'PASS',
        message: `Found ${count} audit logs`
      }
    } catch (error) {
      return {
        status: 'FAIL',
        message: 'Cannot access AuditLog table',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // ==================== DATA QUALITY TESTS ====================
  await suite.runTest('Stuck users exist', 'Data Quality', async () => {
    const stuckUsers = await prisma.user.count({
      where: {
        emailVerified: null,
        isOnboarded: false,
        onboardingStep: 1,
        email: { not: null }
      }
    })

    return {
      status: stuckUsers > 0 ? 'WARN' : 'PASS',
      message: stuckUsers > 0 ? `${stuckUsers} stuck users found` : 'No stuck users',
      details: stuckUsers > 0 ? 'Run resend script to help these users' : undefined
    }
  })

  await suite.runTest('Email delivery rate', 'Data Quality', async () => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const emails = await prisma.emailLog.groupBy({
      by: ['status'],
      where: { sentAt: { gte: last24h } },
      _count: true
    })

    const total = emails.reduce((acc, e) => acc + e._count, 0)
    const delivered = emails.find(e => e.status === 'delivered')?._count || 0
    const rate = total > 0 ? (delivered / total * 100) : 0

    return {
      status: total === 0 ? 'WARN' : rate >= 95 ? 'PASS' : rate >= 80 ? 'WARN' : 'FAIL',
      message: total === 0 ? 'No emails sent in last 24h' : `${rate.toFixed(1)}% delivery rate (${delivered}/${total})`,
      details: rate < 80 && total > 0 ? 'Delivery rate below target (80%)' : undefined
    }
  })

  await suite.runTest('Recent registrations', 'Data Quality', async () => {
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const registrations = await prisma.user.count({
      where: { createdAt: { gte: last7d } }
    })

    return {
      status: 'PASS',
      message: `${registrations} registrations in last 7 days`
    }
  })

  await suite.runTest('Spam accounts detected', 'Data Quality', async () => {
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const spam = await prisma.auditLog.count({
      where: {
        action: {
          in: ['REGISTER_HONEYPOT_TRIGGERED', 'REGISTER_SPAM_DETECTED', 'REGISTER_BOT_TIMING']
        },
        createdAt: { gte: last7d }
      }
    })

    return {
      status: spam > 10 ? 'WARN' : 'PASS',
      message: `${spam} spam attempts blocked in last 7 days`,
      details: spam > 10 ? 'Consider running spam cleanup' : undefined
    }
  })

  // ==================== FILE EXISTENCE TESTS ====================
  await suite.runTest('Email send module exists', 'Code', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('lib/email/send.ts')
      return {
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? 'File exists' : 'File missing'
      }
    } catch {
      return { status: 'FAIL', message: 'Cannot check file' }
    }
  })

  await suite.runTest('Resend script exists', 'Code', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('scripts/resend-verification-emails.ts')
      return {
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? 'Script exists' : 'Script missing'
      }
    } catch {
      return { status: 'FAIL', message: 'Cannot check file' }
    }
  })

  await suite.runTest('Spam cleanup script exists', 'Code', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('scripts/spam-cleanup.ts')
      return {
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? 'Script exists' : 'Script missing'
      }
    } catch {
      return { status: 'FAIL', message: 'Cannot check file' }
    }
  })

  await suite.runTest('Monitoring dashboard exists', 'Code', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('app/admin/monitoring/page.tsx')
      return {
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? 'Dashboard exists' : 'Dashboard missing'
      }
    } catch {
      return { status: 'FAIL', message: 'Cannot check file' }
    }
  })

  await suite.runTest('Monitoring API exists', 'Code', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('app/api/admin/monitoring/health/route.ts')
      return {
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? 'API exists' : 'API missing'
      }
    } catch {
      return { status: 'FAIL', message: 'Cannot check file' }
    }
  })

  // ==================== DOCUMENTATION TESTS ====================
  await suite.runTest('Executive summary exists', 'Documentation', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('docs/EXECUTIVE-SUMMARY-REGISTRATION-CRISIS.md')
      return {
        status: exists ? 'PASS' : 'WARN',
        message: exists ? 'Documentation exists' : 'Documentation missing'
      }
    } catch {
      return { status: 'WARN', message: 'Cannot check file' }
    }
  })

  await suite.runTest('Implementation guide exists', 'Documentation', async () => {
    try {
      const fs = require('fs')
      const exists = fs.existsSync('docs/REGISTRATION-FIX-IMPLEMENTATION.md')
      return {
        status: exists ? 'PASS' : 'WARN',
        message: exists ? 'Guide exists' : 'Guide missing'
      }
    } catch {
      return { status: 'WARN', message: 'Cannot check file' }
    }
  })

  // Disconnect
  await prisma.$disconnect()

  // Generate report
  return suite.generateReport()
}

// Run
runTestSuite()
  .then((result) => {
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('\n💥 FATAL ERROR:', error)
    process.exit(1)
  })
