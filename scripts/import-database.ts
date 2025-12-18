/**
 * Import database from SQL file
 * WARNING: This will DELETE all existing data!
 */

import { prisma } from '../lib/prisma'
import fs from 'fs'
import path from 'path'

async function importDatabase() {
  const inputPath = path.join(process.cwd(), 'Huidigedatabase', 'oudedatabase.sql')

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    process.exit(1)
  }

  console.log('⚠️  WARNING: This will DELETE all existing data!')
  console.log('📁 Import file:', inputPath)
  console.log('\n⏳ Starting import in 5 seconds...')
  console.log('   Press Ctrl+C to cancel\n')

  // Wait 5 seconds to allow cancellation
  await new Promise(resolve => setTimeout(resolve, 5000))

  try {
    console.log('🗑️  Clearing existing data...\n')

    // Delete in correct order (respect foreign keys)
    await prisma.message.deleteMany()
    console.log('   ✓ Deleted Messages')

    await prisma.report.deleteMany()
    console.log('   ✓ Deleted Reports')

    await prisma.block.deleteMany()
    console.log('   ✓ Deleted Blocks')

    await prisma.swipe.deleteMany()
    console.log('   ✓ Deleted Swipes')

    await prisma.match.deleteMany()
    console.log('   ✓ Deleted Matches')

    await prisma.photo.deleteMany()
    console.log('   ✓ Deleted Photos')

    await prisma.emailLog.deleteMany()
    console.log('   ✓ Deleted EmailLogs')

    await prisma.user.deleteMany()
    console.log('   ✓ Deleted Users')

    console.log('\n📥 Reading SQL file...')
    const sql = fs.readFileSync(inputPath, 'utf8')

    // Split by lines and filter INSERT statements
    const lines = sql.split('\n')
    const insertStatements = lines.filter(line =>
      line.trim().startsWith('INSERT INTO')
    )

    console.log(`📊 Found ${insertStatements.length} INSERT statements\n`)
    console.log('⚡ Executing inserts...')

    let success = 0
    let failed = 0

    for (const statement of insertStatements) {
      try {
        await prisma.$executeRawUnsafe(statement)
        success++
        if (success % 100 === 0) {
          console.log(`   ✓ Imported ${success} records...`)
        }
      } catch (error) {
        failed++
        console.error(`   ✗ Failed to import: ${statement.substring(0, 80)}...`)
        console.error(`      Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log('\n✅ Import complete!')
    console.log(`   ✓ Success: ${success}`)
    if (failed > 0) {
      console.log(`   ✗ Failed: ${failed}`)
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importDatabase()
