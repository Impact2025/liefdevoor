/**
 * Verify Webhook Setup
 *
 * Checks if Resend webhooks are properly configured and working
 */

import { prisma } from '../lib/prisma'

async function verifyWebhookSetup() {
  console.log('🔍 WEBHOOK SETUP VERIFICATION\n')
  console.log('═'.repeat(60))

  let allGood = true

  // 1. Check environment variable
  console.log('\n1️⃣ Checking Environment Variables...')
  console.log('─'.repeat(60))

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.log('❌ RESEND_WEBHOOK_SECRET not set in .env')
    console.log('   👉 Add to .env file')
    allGood = false
  } else if (webhookSecret.includes('PLACEHOLDER') || webhookSecret === 'whsec_your_webhook_secret_here') {
    console.log('❌ RESEND_WEBHOOK_SECRET still has placeholder value')
    console.log('   👉 Replace with real secret from Resend dashboard')
    allGood = false
  } else if (!webhookSecret.startsWith('whsec_')) {
    console.log('⚠️  RESEND_WEBHOOK_SECRET doesn\'t start with "whsec_"')
    console.log('   Current value: ' + webhookSecret.substring(0, 10) + '...')
    console.log('   👉 Check if you copied the correct secret')
    allGood = false
  } else {
    console.log('✅ RESEND_WEBHOOK_SECRET is set')
    console.log('   Value: ' + webhookSecret.substring(0, 15) + '...')
  }

  // 2. Check if any emails have been tracked
  console.log('\n2️⃣ Checking Email Tracking Data...')
  console.log('─'.repeat(60))

  const emailStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*)::int as total,
      COUNT("deliveredAt")::int as delivered,
      COUNT("openedAt")::int as opened,
      COUNT("clickedAt")::int as clicked,
      SUM(COALESCE("openCount", 0))::int as total_opens,
      SUM(COALESCE("clickCount", 0))::int as total_clicks
    FROM "MigrationEmail"
  `

  const stats = emailStats[0]

  console.log(`   Total emails sent:     ${stats.total}`)
  console.log(`   Delivered:             ${stats.delivered} (${stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}%)`)
  console.log(`   Opened:                ${stats.opened} (${stats.total > 0 ? ((stats.opened / stats.total) * 100).toFixed(1) : 0}%)`)
  console.log(`   Clicked:               ${stats.clicked} (${stats.total > 0 ? ((stats.clicked / stats.total) * 100).toFixed(1) : 0}%)`)
  console.log(`   Total open events:     ${stats.total_opens}`)
  console.log(`   Total click events:    ${stats.total_clicks}`)
  console.log()

  if (stats.opened === 0 && stats.total > 100) {
    console.log('❌ No emails tracked as opened (but many sent)')
    console.log('   👉 Webhooks are probably NOT working')
    allGood = false
  } else if (stats.opened === 0 && stats.total > 0) {
    console.log('⚠️  No emails tracked as opened yet')
    console.log('   👉 Either webhooks not setup OR emails not opened yet')
  } else {
    console.log('✅ Email opens are being tracked')
  }

  // 3. Check recent webhook activity
  console.log('\n3️⃣ Checking Recent Webhook Activity...')
  console.log('─'.repeat(60))

  const recentOpened = await prisma.$queryRaw<any[]>`
    SELECT "openedAt", "firstName"
    FROM "MigrationEmail" me
    JOIN "MigrationUser" mu ON me."migrationUserId" = mu.id
    WHERE "openedAt" IS NOT NULL
    ORDER BY "openedAt" DESC
    LIMIT 5
  `

  if (recentOpened.length === 0) {
    console.log('⚠️  No recent webhook events found')
    console.log('   This could mean:')
    console.log('   - Webhooks not configured in Resend dashboard')
    console.log('   - No emails opened recently')
    console.log('   - Webhook endpoint not reachable')
  } else {
    console.log('✅ Recent webhook events found:')
    recentOpened.forEach((e, i) => {
      const timeAgo = Math.round((Date.now() - new Date(e.openedAt).getTime()) / (1000 * 60))
      console.log(`   ${i + 1}. ${e.firstName} - ${timeAgo} minutes ago`)
    })
  }

  // 4. Check if webhook endpoint exists
  console.log('\n4️⃣ Checking Webhook Endpoint...')
  console.log('─'.repeat(60))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const webhookUrl = `${appUrl}/api/webhooks/resend`

  console.log(`   Webhook URL: ${webhookUrl}`)

  try {
    const response = await fetch(webhookUrl, {
      method: 'GET'
    })

    if (response.status === 405) {
      console.log('✅ Webhook endpoint exists (returns 405 for GET - correct)')
    } else {
      console.log(`⚠️  Webhook endpoint returned ${response.status}`)
      console.log('   Expected: 405 (Method Not Allowed for GET)')
    }
  } catch (error: any) {
    console.log('❌ Could not reach webhook endpoint')
    console.log(`   Error: ${error.message}`)
    console.log('   👉 Make sure server is running')
    allGood = false
  }

  // 5. Summary and recommendations
  console.log('\n' + '═'.repeat(60))
  console.log('📋 SUMMARY')
  console.log('═'.repeat(60))

  if (allGood && stats.opened > 0) {
    console.log('\n✅ WEBHOOKS ARE WORKING!')
    console.log()
    console.log('Your email tracking is set up correctly.')
    console.log('You can now:')
    console.log('  - See real-time email opens and clicks')
    console.log('  - Analyze A/B test results')
    console.log('  - Optimize email content based on data')
    console.log()
  } else if (stats.total === 0) {
    console.log('\n⚠️  NO EMAILS SENT YET')
    console.log()
    console.log('Send a test email first to verify webhooks:')
    console.log('  npx tsx scripts/send-test-email-multi.ts')
    console.log()
  } else {
    console.log('\n❌ WEBHOOKS NOT WORKING')
    console.log()
    console.log('Follow these steps to fix:')
    console.log()
    console.log('1. Read the setup guide:')
    console.log('   cat docs/RESEND_WEBHOOK_SETUP.md')
    console.log()
    console.log('2. Go to Resend dashboard:')
    console.log('   https://resend.com/webhooks')
    console.log()
    console.log('3. Create webhook with:')
    console.log('   URL: ' + webhookUrl)
    console.log('   Events: email.delivered, email.opened, email.clicked, email.bounced, email.complained')
    console.log()
    console.log('4. Copy webhook secret to .env:')
    console.log('   RESEND_WEBHOOK_SECRET=whsec_...')
    console.log()
    console.log('5. Restart server:')
    console.log('   npm run dev')
    console.log()
    console.log('6. Send test email:')
    console.log('   npx tsx scripts/send-test-email-multi.ts')
    console.log()
    console.log('7. Open email and click link')
    console.log()
    console.log('8. Run this script again:')
    console.log('   npx tsx scripts/verify-webhook-setup.ts')
    console.log()
  }

  await prisma.$disconnect()
}

verifyWebhookSetup().catch(console.error)
