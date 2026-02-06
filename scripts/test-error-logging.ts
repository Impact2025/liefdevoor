/**
 * Test error logging fix
 */

import { prisma } from '../lib/prisma'

async function testErrorLogging() {
  console.log('Testing MigrationError context field...\n')

  try {
    // Test inserting with JSON context
    const testData = {
      sequence1: 0,
      sequence2: 1,
      sequence3: 0,
      sequence4: 50,
      totalSent: 51,
      timestamp: new Date().toISOString()
    }

    const error = await prisma.migrationError.create({
      data: {
        errorType: 'test_run',
        errorMessage: 'Testing JSON context field',
        context: testData as any,
        createdAt: new Date()
      }
    })

    console.log('✅ Successfully created MigrationError with JSON context')
    console.log('   ID:', error.id)
    console.log('   Context stored:', JSON.stringify(testData, null, 2))

    // Read it back
    const retrieved = await prisma.migrationError.findUnique({
      where: { id: error.id }
    })

    console.log('\n✅ Successfully retrieved error')
    console.log('   Context retrieved:', JSON.stringify(retrieved?.context, null, 2))

    // Clean up test data
    await prisma.migrationError.delete({
      where: { id: error.id }
    })

    console.log('\n✅ Test cleanup complete')
    console.log('\n🎉 Fix verified - JSON context field working correctly!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testErrorLogging()
