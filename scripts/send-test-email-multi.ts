/**
 * Send Test Migration Email to Multi
 */

import { PrismaClient } from '@prisma/client'
import { sendEmail } from '../lib/email/send'

const prisma = new PrismaClient()

async function sendTestEmail() {
  console.log('\n📧 Sending test migration email to Multi...\n')

  try {
    // Get Multi's data
    const users = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        "oldUserId",
        "oldEmail",
        "firstName",
        "lastName",
        "memberSince",
        segment,
        "couponCode",
        "couponExpiresAt",
        "claimToken"
      FROM "MigrationUser"
      WHERE "oldUserId" = 22
    `

    if (users.length === 0) {
      console.log('❌ User Multi not found')
      return
    }

    const user = users[0]
    console.log('   User:', user.firstName)
    console.log('   Email:', user.oldEmail)
    console.log('   Segment:', user.segment)
    console.log('   Coupon:', user.couponCode)
    console.log('')

    // Calculate days remaining
    const daysRemaining = user.couponExpiresAt
      ? Math.max(0, Math.ceil((new Date(user.couponExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30

    // Get incentive based on segment
    const incentives: Record<string, { premiumMonths: number; superMessages: number }> = {
      VIP: { premiumMonths: 3, superMessages: 10 },
      GOLD: { premiumMonths: 2, superMessages: 5 },
      ACTIVE: { premiumMonths: 1, superMessages: 3 },
      DORMANT: { premiumMonths: 1, superMessages: 5 },
      INACTIVE: { premiumMonths: 0, superMessages: 3 }
    }

    const incentive = incentives[user.segment] || incentives.INACTIVE

    // Build claim URL
    const claimUrl = `https://liefdevooriedereen.nl/welkom/${user.claimToken}`
    const memberYear = user.memberSince ? new Date(user.memberSince).getFullYear().toString() : '2020'

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom terug bij Liefde voor Iedereen</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #e91e63; margin: 0;">💕 Liefde voor Iedereen</h1>
  </div>

  <div style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
    <h2 style="margin: 0 0 10px 0;">Welkom terug, ${user.firstName}! 🎉</h2>
    <p style="margin: 0; opacity: 0.9;">Je account van OogvoorLiefde.nl staat klaar</p>
  </div>

  <div style="padding: 30px 0;">
    <p>Beste ${user.firstName},</p>

    <p>Geweldig nieuws! OogvoorLiefde.nl is vernieuwd en heet nu <strong>Liefde voor Iedereen</strong>.</p>

    <p>Als trouwe gebruiker sinds <strong>${memberYear}</strong> hebben we je account bewaard. Activeer het nu en ontvang:</p>

    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3 style="color: #e91e63; margin: 0 0 15px 0;">🎁 Jouw exclusieve welkomstcadeau:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${incentive.premiumMonths > 0 ? `<li><strong>${incentive.premiumMonths} maand${incentive.premiumMonths > 1 ? 'en' : ''} Premium</strong> - Onbeperkt berichten sturen</li>` : ''}
        <li><strong>${incentive.superMessages} SuperBerichten</strong> - Val extra op bij je matches</li>
        <li><strong>Alle profielfoto's</strong> direct zichtbaar</li>
      </ul>
    </div>

    <div style="background: #fff3e0; border: 2px dashed #ff9800; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 5px 0; font-size: 14px;">Jouw persoonlijke couponcode:</p>
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #e91e63; letter-spacing: 2px;">${user.couponCode}</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Geldig nog ${daysRemaining} dagen</p>
    </div>

    <div style="text-align: center; padding: 20px 0;">
      <a href="${claimUrl}" style="display: inline-block; background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 18px;">
        ✨ Activeer mijn account
      </a>
    </div>

    <p style="color: #666; font-size: 14px; text-align: center;">
      Of kopieer deze link: <a href="${claimUrl}" style="color: #e91e63;">${claimUrl}</a>
    </p>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
    <p>Je ontvangt deze email omdat je een account had bij OogvoorLiefde.nl</p>
    <p>Liefde voor Iedereen - De datingsite waar echte connecties ontstaan</p>
  </div>
</body>
</html>
`

    const textVersion = `
Welkom terug, ${user.firstName}!

Geweldig nieuws! OogvoorLiefde.nl is vernieuwd en heet nu Liefde voor Iedereen.

Als trouwe gebruiker sinds ${memberYear} hebben we je account bewaard.

Jouw exclusieve welkomstcadeau:
${incentive.premiumMonths > 0 ? `- ${incentive.premiumMonths} maand${incentive.premiumMonths > 1 ? 'en' : ''} Premium` : ''}
- ${incentive.superMessages} SuperBerichten
- Alle profielfoto's direct zichtbaar

Jouw persoonlijke couponcode: ${user.couponCode}
Geldig nog ${daysRemaining} dagen

Activeer je account: ${claimUrl}

--
Liefde voor Iedereen
De datingsite waar echte connecties ontstaan
`

    // Send email
    console.log('   Sending email...')

    const result = await sendEmail({
      to: user.oldEmail,
      subject: `${user.firstName}, je account van OogvoorLiefde.nl staat klaar! 🎉`,
      html: emailHtml,
      text: textVersion,
      category: 'MIGRATION',
    })

    if (!result.success) {
      console.log('❌ Error:', result.error)
      return
    }

    console.log('   ✅ Email sent!')
    if (result.emailId) {
      console.log('   Resend ID:', result.emailId)
    }
    console.log('')

    // Update user status
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        status = 'EMAIL_SENT',
        "lastEmailSentAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${user.id}
    `

    console.log('   ✅ User status updated to EMAIL_SENT')
    console.log('')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('   Check je inbox: ' + user.oldEmail)
    console.log('   Landing page: ' + claimUrl)
    console.log('═══════════════════════════════════════════════════════════════')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

sendTestEmail()
