/**
 * Test Resend Webhook Endpoint
 * Simulates webhook events to verify the endpoint works
 *
 * Usage: npx tsx scripts/test-webhook-endpoint.ts
 */

import { prisma } from '../lib/prisma'

async function testWebhookEndpoint() {
  console.log('\n' + '═'.repeat(60))
  console.log('   WEBHOOK ENDPOINT TEST')
  console.log('═'.repeat(60))

  // 1. Create a test migration email record
  console.log('\n1. Creating test email record...')

  const testUser = await prisma.migrationUser.findFirst({
    where: { status: 'EMAIL_SENT' }
  })

  if (!testUser) {
    console.log('❌ No users with EMAIL_SENT status found')
    console.log('   Run migration-batch-send.ts first')
    return
  }

  const testResendId = `test_${Date.now()}`

  const testEmail = await prisma.migrationEmail.create({
    data: {
      migrationUserId: testUser.id,
      emailType: 'WELCOME',
      subject: 'Test Email',
      abVariant: 'A',
      sentAt: new Date(),
      resendId: testResendId
    }
  })

  console.log(`✅ Created test email with resendId: ${testResendId}`)

  // 2. Simulate webhook events
  console.log('\n2. Simulating webhook events...')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const webhookUrl = `${baseUrl}/api/webhooks/resend`

  // Test payloads
  const events = [
    {
      name: 'email.delivered',
      payload: {
        type: 'email.delivered',
        data: {
          email_id: testResendId,
          to: testUser.oldEmail
        }
      }
    },
    {
      name: 'email.opened',
      payload: {
        type: 'email.opened',
        data: {
          email_id: testResendId,
          to: testUser.oldEmail
        }
      }
    },
    {
      name: 'email.clicked',
      payload: {
        type: 'email.clicked',
        data: {
          email_id: testResendId,
          to: testUser.oldEmail,
          link: {
            url: 'https://liefdevooriedereen.nl/welkom/test'
          }
        }
      }
    }
  ]

  for (const event of events) {
    try {
      console.log(`\n   Testing: ${event.name}`)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event.payload)
      })

      if (response.ok) {
        console.log(`   ✅ ${event.name} - Success`)
      } else {
        console.log(`   ❌ ${event.name} - Failed: ${response.status}`)
        const text = await response.text()
        console.log(`   Response: ${text}`)
      }
    } catch (error) {
      console.log(`   ❌ ${event.name} - Error: ${error}`)
    }

    // Small delay between events
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // 3. Verify database updates
  console.log('\n3. Verifying database updates...')

  const updatedEmail = await prisma.migrationEmail.findUnique({
    where: { id: testEmail.id },
    include: { migrationUser: true }
  })

  console.log('\n   Email Record:')
  console.log(`   - Delivered: ${updatedEmail?.deliveredAt ? '✅' : '❌'}`)
  console.log(`   - Opened: ${updatedEmail?.openedAt ? '✅' : '❌'}`)
  console.log(`   - Clicked: ${updatedEmail?.clickedAt ? '✅' : '❌'}`)
  console.log(`   - Open Count: ${updatedEmail?.openCount || 0}`)
  console.log(`   - Click Count: ${updatedEmail?.clickCount || 0}`)

  console.log('\n   User Record:')
  console.log(`   - Status: ${updatedEmail?.migrationUser.status}`)
  console.log(`   - Last Opened: ${updatedEmail?.migrationUser.lastEmailOpenedAt ? '✅' : '❌'}`)
  console.log(`   - Last Clicked: ${updatedEmail?.migrationUser.lastEmailClickedAt ? '✅' : '❌'}`)
  console.log(`   - Total Opens: ${updatedEmail?.migrationUser.totalEmailsOpened || 0}`)

  // 4. Cleanup
  console.log('\n4. Cleaning up test data...')
  await prisma.migrationEmail.delete({ where: { id: testEmail.id } })
  console.log('✅ Test email deleted')

  console.log('\n' + '═'.repeat(60))
  console.log('   TEST COMPLETE')
  console.log('═'.repeat(60))

  if (updatedEmail?.deliveredAt && updatedEmail?.openedAt && updatedEmail?.clickedAt) {
    console.log('\n✅ ALL TESTS PASSED - Webhook endpoint working correctly!')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Check webhook configuration')
    console.log('   Make sure:')
    console.log('   1. Next.js dev server is running')
    console.log('   2. Webhook endpoint is accessible')
    console.log('   3. RESEND_WEBHOOK_SECRET is set (optional for local testing)')
  }

  console.log()
  await prisma.$disconnect()
}

testWebhookEndpoint().catch(console.error)
