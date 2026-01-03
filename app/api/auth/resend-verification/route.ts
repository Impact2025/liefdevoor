/**
 * Resend Verification Email API
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVerificationToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/email/templates'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Als dit email bestaat, is er een nieuwe link verstuurd.'
      })
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: { message: 'Email is al geverifieerd. Je kunt inloggen.' }
      }, { status: 400 })
    }

    const token = await createVerificationToken(user.email!)
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    // Direct link to confirmation page (avoids redirect issues in email app browsers)
    const verificationUrl = `${baseUrl}/verify-email/confirm?token=${token}`

    await sendEmail({
      to: user.email!,
      subject: 'Activeer je account',
      html: getVerificationEmailHtml({ name: user.name || 'daar', verificationUrl }),
      text: getVerificationEmailText({ name: user.name || 'daar', verificationUrl }),
    })

    return NextResponse.json({
      success: true,
      message: 'Nieuwe verificatie link verstuurd!'
    })
  } catch (error) {
    console.error('[Resend] Error:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Er ging iets mis' }
    }, { status: 500 })
  }
}
