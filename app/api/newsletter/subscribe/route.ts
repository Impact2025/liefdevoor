import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'BLOG_PAGE' } = body

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
        await sendVerificationEmail(normalizedEmail, verifyToken)

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
    await sendVerificationEmail(normalizedEmail, verifyToken)

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

async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/newsletter/verify?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f43f5e 0%, #a855f7 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f43f5e 0%, #a855f7 100%);
            color: white !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Bevestig je inschrijving</h1>
        </div>
        <div class="content">
          <p>Hoi daar! 👋</p>
          <p>
            Bedankt voor je interesse in onze nieuwsbrief! We zijn blij dat je op de hoogte wilt blijven
            van de laatste dating tips, relatie advies en verhalen.
          </p>
          <p>
            Klik op de knop hieronder om je inschrijving te bevestigen:
          </p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" class="button">
              Bevestig inschrijving
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            Deze link is 24 uur geldig. Als je deze email niet hebt aangevraagd, kun je deze negeren.
          </p>
          <p style="margin-top: 30px;">
            Tot snel! ❤️<br>
            <strong>Team Liefde Voor Iedereen</strong>
          </p>
        </div>
        <div class="footer">
          <p>
            © ${new Date().getFullYear()} Liefde Voor Iedereen<br>
            De dating app waar iedereen zich thuis voelt
          </p>
        </div>
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
