/**
 * Apply Migration Safely
 * Executes the migration SQL directly
 */

import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigration() {
  console.log('📦 Applying migration: add_migration_monitoring')

  const sql = fs.readFileSync(
    path.join(__dirname, '../prisma/migrations/20260130_add_migration_monitoring/migration.sql'),
    'utf-8'
  )

  try {
    // Execute SQL statements one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      await prisma.$executeRawUnsafe(statement)
    }

    console.log('✅ Migration applied successfully!')

    // Verify tables exist
    const alertCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'MigrationAlert'
      );
    `

    const errorCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'MigrationError'
      );
    `

    console.log('\n📋 Verification:')
    console.log('MigrationAlert table:', alertCheck[0].exists ? '✅' : '❌')
    console.log('MigrationError table:', errorCheck[0].exists ? '✅' : '❌')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
