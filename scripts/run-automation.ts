/**
 * Run Migration Automation
 * Execute daily automation sequences
 *
 * Usage: npx tsx scripts/run-automation.ts
 */

import { runDailyAutomation } from '../lib/migration/automation'
import { prisma } from '../lib/prisma'

async function main() {
  try {
    const results = await runDailyAutomation()

    // Store automation run results (using Prisma ORM for proper JSON handling)
    await prisma.migrationError.create({
      data: {
        errorType: 'automation_run',
        errorMessage: 'Daily automation completed',
        context: results as any, // Prisma handles JSON serialization
        createdAt: new Date()
      }
    })

    console.log('\n✅ Automation completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Automation failed:', error)
    process.exit(1)
  }
}

main()
