/**
 * Test Bulk Ban API
 *
 * Test script to debug the bulk ban functionality
 */

import { prisma } from '../lib/prisma'

async function testBulkBan() {
  try {
    console.log('🧪 Testing bulk ban functionality...\n')

    // Find a test user to ban (not admin)
    const testUser = await prisma.user.findFirst({
      where: {
        role: 'USER',
        NOT: {
          email: {
            contains: 'admin'
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    if (!testUser) {
      console.log('❌ No test user found to ban')
      return
    }

    console.log('Found test user:')
    console.log(`  Name: ${testUser.name}`)
    console.log(`  Email: ${testUser.email}`)
    console.log(`  ID: ${testUser.id}`)
    console.log(`  Current Role: ${testUser.role}\n`)

    // Simulate the bulk ban request
    console.log('Simulating bulk ban request...')

    const requestBody = {
      userIds: [testUser.id],
      action: 'ban',
      reason: 'Test ban reason for debugging'
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    // Validate the schema manually
    const { bulkUserActionSchema } = await import('../lib/validations/admin-schemas')

    console.log('\n📋 Validating request schema...')
    const validation = bulkUserActionSchema.safeParse(requestBody)

    if (!validation.success) {
      console.log('❌ Validation failed!')
      console.log(JSON.stringify(validation.error.issues, null, 2))
      return
    }

    console.log('✅ Schema validation passed!')

    // Test the actual database update
    console.log('\n🔄 Testing database update...')

    const updateData = {
      role: 'BANNED'
    }

    const result = await prisma.user.updateMany({
      where: { id: { in: [testUser.id] } },
      data: updateData
    })

    console.log(`✅ Updated ${result.count} user(s)`)

    // Verify the update
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        id: true,
        role: true,
      }
    })

    console.log('\n📊 Updated user state:')
    console.log(`  Role: ${updatedUser?.role}`)

    // Restore the user
    console.log('\n🔄 Restoring user to original state...')
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        role: testUser.role,
      }
    })
    console.log('✅ User restored')

    console.log('\n✅ All tests passed! The bulk ban API should work.')
    console.log('\nℹ️  If you still get errors in the UI, check:')
    console.log('  1. Browser console for detailed error messages')
    console.log('  2. Server logs (npm run dev output)')
    console.log('  3. Network tab in browser devtools')

  } catch (error) {
    console.error('❌ Test failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testBulkBan()
