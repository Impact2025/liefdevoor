/**
 * Resend Verification Email API Route
 *
 * Allows users to request a new verification email
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVerificationToken, needsEmailVerification } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is verplicht' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    })

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({
        message: 'Als dit email adres bestaat, hebben we een verificatie email verstuurd.',
      })
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Dit email adres is al geverifieerd' },
        { status: 400 }
      )
    }

    // Create verification token
    const token = await createVerificationToken(email)

    // Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Activeer je Liefde Voor Iedereen account',
      html: getVerificationEmailHtml({
        name: user.name || 'daar',
        verificationUrl,
      }),
      text: getVerificationEmailText({
        name: user.name || 'daar',
        verificationUrl,
      }),
    })

    return NextResponse.json({
      message: 'Verificatie email verstuurd! Check je inbox.',
    })
  } catch (error) {
    console.error('[Resend Verification] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het versturen van de email' },
      { status: 500 }
    )
  }
}
