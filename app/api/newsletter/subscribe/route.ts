import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'BLOG_PAGE' } = body

    // Get base URL from request for email links
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres. Voer een geldig e-mailadres in.' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.isVerified) {
        return NextResponse.json(
          {
            error: 'Dit e-mailadres is al ingeschreven voor onze nieuwsbrief.',
            alreadySubscribed: true
          },
          { status: 400 }
        )
      } else {
        // Resend verification email if not verified yet
        const verifyToken = crypto.randomBytes(32).toString('hex')
        const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await prisma.newsletterSubscription.update({
          where: { email: normalizedEmail },
          data: {
            verifyToken,
            verifyTokenExpires,
          },
        })

        // Send verification email
        await sendVerificationEmail(normalizedEmail, verifyToken, baseUrl)

        return NextResponse.json({
          success: true,
          message: 'Er is een nieuwe verificatie-email verzonden. Check je inbox!',
          requiresVerification: true,
        })
      }
    }

    // Create new subscription
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Get request metadata for GDPR compliance
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referralUrl = request.headers.get('referer') || undefined

    await prisma.newsletterSubscription.create({
      data: {
        email: normalizedEmail,
        verifyToken,
        verifyTokenExpires,
        unsubscribeToken,
        source,
        referralUrl,
        ipAddress,
        userAgent,
      },
    })

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verifyToken, baseUrl)

    return NextResponse.json({
      success: true,
      message: 'Check je inbox! We hebben je een verificatie-email gestuurd.',
      requiresVerification: true,
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

async function sendVerificationEmail(email: string, token: string, baseUrl?: string) {
  // Use provided baseUrl or fallback to NEXTAUTH_URL
  const domain = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const verifyUrl = `${domain}/api/newsletter/verify?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f3f4f6;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f43f5e 0%, #a855f7 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Bevestig je inschrijving</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px; background-color: #ffffff;">
              <p style="margin: 0 0 15px 0; color: #333;">Hoi daar! 👋</p>

              <p style="margin: 0 0 15px 0; color: #333;">
                Bedankt voor je interesse in onze nieuwsbrief! We zijn blij dat je op de hoogte wilt blijven
                van de laatste dating tips, relatie advies en verhalen.
              </p>

              <p style="margin: 0 0 20px 0; color: #333;">
                Klik op de knop hieronder om je inschrijving te bevestigen:
              </p>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f43f5e 0%, #a855f7 100%); border-radius: 8px; text-align: center;">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Bevestig inschrijving
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                Deze link is 24 uur geldig. Als je deze email niet hebt aangevraagd, kun je deze negeren.
              </p>

              <p style="margin: 30px 0 0 0; color: #333;">
                Tot snel! ❤️<br>
                <strong>Team Liefde Voor Iedereen</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Liefde Voor Iedereen<br>
                De dating app waar iedereen zich thuis voelt
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  const text = `
Bevestig je nieuwsbrief inschrijving

Hoi daar!

Bedankt voor je interesse in onze nieuwsbrief! We zijn blij dat je op de hoogte wilt blijven van de laatste dating tips, relatie advies en verhalen.

Bevestig je inschrijving door op deze link te klikken:
${verifyUrl}

Deze link is 24 uur geldig. Als je deze email niet hebt aangevraagd, kun je deze negeren.

Tot snel!
Team Liefde Voor Iedereen

© ${new Date().getFullYear()} Liefde Voor Iedereen
De dating app waar iedereen zich thuis voelt
  `.trim()

  await sendEmail({
    to: email,
    subject: '📧 Bevestig je nieuwsbrief inschrijving',
    html,
    text,
  })
}
