/**
 * Check Neon Database Limits and Migration Capacity
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNeonLimits() {
  console.log()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('              NEON DATABASE ANALYSE')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()

  try {
    // Check current database size
    const dbSize = await prisma.$queryRaw<any[]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size,
             pg_database_size(current_database()) as bytes
    `
    console.log(`📦 HUIDIGE DATABASE GROOTTE: ${dbSize[0].size}`)
    console.log()

    // Count current tables and rows
    const tableCounts = await prisma.$queryRaw<any[]>`
      SELECT
        relname as table_name,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
      LIMIT 15
    `

    console.log('📋 TOP TABELLEN (op aantal rijen):')
    console.log('───────────────────────────────────────────────────────────────')
    tableCounts.forEach((t: any) => {
      const rows = Number(t.row_count).toLocaleString('nl-NL')
      console.log(`   ${t.table_name.padEnd(30)} ${rows.padStart(10)} rijen`)
    })
    console.log()

    // Total rows
    const totalRows = await prisma.$queryRaw<any[]>`
      SELECT SUM(n_live_tup)::bigint as total FROM pg_stat_user_tables
    `
    console.log(`📊 TOTAAL RIJEN: ${Number(totalRows[0].total).toLocaleString('nl-NL')}`)
    console.log()

    // Check MigrationUser count
    const migrationCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count FROM "MigrationUser"
    `
    console.log(`🚀 MIGRATION USERS: ${migrationCount[0].count}`)
    console.log()

    // Calculate migration impact
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('              MIGRATIE IMPACT BEREKENING')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log()

    // Estimate size per migration user
    const avgRowSize = 500 // bytes per MigrationUser row (estimated)
    const avgEmailSize = 200 // bytes per MigrationEmail row
    const usersToMigrate = 11190
    const emailsPerUser = 7 // 7-touch sequence

    const migrationUserBytes = usersToMigrate * avgRowSize
    const migrationEmailBytes = usersToMigrate * emailsPerUser * avgEmailSize
    const totalMigrationBytes = migrationUserBytes + migrationEmailBytes

    console.log('   Geschatte data voor migratie:')
    console.log('   ─────────────────────────────────────────────────────────────')
    console.log(`   MigrationUser (${usersToMigrate.toLocaleString('nl-NL')} users):    ~${(migrationUserBytes / 1024 / 1024).toFixed(1)} MB`)
    console.log(`   MigrationEmail (${(usersToMigrate * emailsPerUser).toLocaleString('nl-NL')} emails): ~${(migrationEmailBytes / 1024 / 1024).toFixed(1)} MB`)
    console.log(`   ─────────────────────────────────────────────────────────────`)
    console.log(`   TOTAAL MIGRATIE DATA:              ~${(totalMigrationBytes / 1024 / 1024).toFixed(1)} MB`)
    console.log()

    // Neon limits
    const currentBytes = Number(dbSize[0].bytes)
    const newTotalBytes = currentBytes + totalMigrationBytes

    console.log('═══════════════════════════════════════════════════════════════')
    console.log('              NEON PLAN LIMIETEN')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log()
    console.log('   Plan            Storage    Status na migratie')
    console.log('   ─────────────────────────────────────────────────────────────')

    const plans = [
      { name: 'Free', limit: 0.5 * 1024 * 1024 * 1024 },      // 512 MB
      { name: 'Launch', limit: 10 * 1024 * 1024 * 1024 },     // 10 GB
      { name: 'Scale', limit: 50 * 1024 * 1024 * 1024 },      // 50 GB
      { name: 'Business', limit: 500 * 1024 * 1024 * 1024 },  // 500 GB
    ]

    plans.forEach(plan => {
      const limitMB = plan.limit / 1024 / 1024
      const limitGB = limitMB / 1024
      const usagePercent = (newTotalBytes / plan.limit * 100).toFixed(1)
      const fits = newTotalBytes < plan.limit
      const status = fits ? `✅ ${usagePercent}% gebruikt` : `❌ Overschrijdt limiet`
      const limitStr = limitGB >= 1 ? `${limitGB} GB` : `${limitMB} MB`
      console.log(`   ${plan.name.padEnd(14)} ${limitStr.padStart(8)}    ${status}`)
    })
    console.log()

    // Current usage summary
    const currentMB = currentBytes / 1024 / 1024
    const newTotalMB = newTotalBytes / 1024 / 1024

    console.log('═══════════════════════════════════════════════════════════════')
    console.log('              SAMENVATTING')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log()
    console.log(`   Huidige database:     ${currentMB.toFixed(1)} MB`)
    console.log(`   + Migratie data:      ${(totalMigrationBytes / 1024 / 1024).toFixed(1)} MB`)
    console.log(`   ─────────────────────────────────────────────────────────────`)
    console.log(`   NIEUW TOTAAL:         ${newTotalMB.toFixed(1)} MB`)
    console.log()

    if (newTotalMB < 500) {
      console.log('   ✅ Past ruim binnen FREE plan (512 MB)')
    } else if (newTotalMB < 10000) {
      console.log('   ✅ Past binnen LAUNCH plan (10 GB)')
    } else {
      console.log('   ⚠️  Mogelijk upgrade nodig naar SCALE plan')
    }
    console.log()

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNeonLimits()
