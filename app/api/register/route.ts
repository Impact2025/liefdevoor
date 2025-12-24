import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimiters, rateLimitResponse, getClientIP } from '@/lib/rate-limit'
import { auditLog, getClientInfo } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { Gender } from '@prisma/client'
import { createVerificationToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/email/templates'
import { verifyTurnstileToken, shouldEnforceTurnstile } from '@/lib/turnstile'

// Zod schema for registration validation
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Naam moet minimaal 2 tekens bevatten')
    .max(50, 'Naam mag maximaal 50 tekens bevatten')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Naam bevat ongeldige tekens'),
  email: z
    .string()
    .email('Ongeldig email formaat')
    .max(255, 'Email is te lang'),
  password: z
    .string()
    .min(8, 'Wachtwoord moet minimaal 8 tekens bevatten')
    .max(128, 'Wachtwoord is te lang')
    .regex(/[a-z]/, 'Wachtwoord moet minimaal 1 kleine letter bevatten')
    .regex(/[A-Z]/, 'Wachtwoord moet minimaal 1 hoofdletter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet minimaal 1 cijfer bevatten'),
  birthDate: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  city: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  turnstileToken: z.string().optional(), // Cloudflare Turnstile verification token
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registrations per 10 minutes per IP
    const rateLimitResult = await rateLimiters.register(request)
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()

    // Turnstile verification (bot protection)
    if (shouldEnforceTurnstile()) {
      const { turnstileToken } = body

      if (!turnstileToken) {
        return NextResponse.json({
          success: false,
          error: { message: 'Beveiligingsverificatie vereist' }
        }, { status: 400 })
      }

      const clientIP = getClientIP(request)
      const verification = await verifyTurnstileToken(turnstileToken, clientIP)

      if (!verification.success) {
        auditLog('REGISTER_TURNSTILE_FAILED', {
          ip: clientIP,
          details: verification.error,
          success: false
        })

        return NextResponse.json({
          success: false,
          error: { message: verification.error || 'Beveiligingsverificatie mislukt' }
        }, { status: 400 })
      }
    }

    // Validate input with Zod
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json({
        success: false,
        error: { message: firstError.message }
      }, { status: 400 })
    }

    const { name, email, password, birthDate, gender, city, bio } = validationResult.data

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: { message: 'Er bestaat al een account met dit emailadres' }
      }, { status: 400 })
    }

    // Hash password with 12 rounds
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: gender || null,
        city: city || null,
        bio: bio || null,
        hasAcceptedTerms: true, // Accepted in multi-step form
      }
    })

    // Audit log the registration
    const clientInfo = getClientInfo(request)
    auditLog('REGISTER', {
      userId: user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      success: true
    })

    // Create verification token
    const token = await createVerificationToken(user.email!)

    // Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`

    // Send verification email
    try {
      await sendEmail({
        to: user.email!,
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
    } catch (emailError) {
      console.error('[Register] Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        message: 'Account aangemaakt! Check je email om je account te activeren.',
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Er is een fout opgetreden' }
    }, { status: 500 })
  }
}