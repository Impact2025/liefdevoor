/**
 * Professional Registration API
 *
 * Registers professionals (organizations) with full spam protection:
 * - Rate limiting
 * - Turnstile CAPTCHA
 * - SpamGuard email/name validation
 * - Email verification required
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { rateLimiters, rateLimitResponse, getClientIdentifier } from '@/lib/rate-limit'
import { verifyTurnstileToken, shouldEnforceTurnstile } from '@/lib/turnstile'
import { SpamGuard } from '@/lib/spam-guard'
import { IPReputationTracker } from '@/lib/spam-guard/ip-reputation'
import { auditLog, getClientInfo } from '@/lib/audit'
import { createVerificationToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/email/templates'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Naam moet minimaal 2 tekens bevatten')
    .max(100, 'Naam is te lang'),
  email: z
    .string()
    .email('Ongeldig email formaat')
    .max(255, 'Email is te lang'),
  password: z
    .string()
    .min(8, 'Wachtwoord moet minimaal 8 karakters zijn')
    .max(128, 'Wachtwoord is te lang'),
  organizationName: z
    .string()
    .min(2, 'Organisatienaam moet minimaal 2 tekens bevatten')
    .max(200, 'Organisatienaam is te lang'),
  organizationType: z.enum([
    'CARE_FACILITY',
    'HEALTHCARE',
    'SOCIAL_WORK',
    'EDUCATION',
    'GOVERNMENT',
    'OTHER',
  ]),
  kvkNumber: z.string().max(20).optional(),
  newsletter: z.boolean().optional().default(true),
  turnstileToken: z.string().optional(),
})

// POST /api/professionals/register - Register as professional
export async function POST(request: NextRequest) {
  // Rate limiting: same as regular registration
  const rateLimitResult = await rateLimiters.register(request)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const clientIP = getClientIdentifier(request)
    const clientInfo = getClientInfo(request)

    // Check IP reputation first
    const ipCheck = await IPReputationTracker.shouldBlock(clientIP)
    if (ipCheck.blocked) {
      auditLog('PROFESSIONAL_REGISTER_BLOCKED', {
        userId: undefined,
        details: `IP blocked: ${ipCheck.reason}`,
        clientInfo,
        success: false,
      })

      return NextResponse.json(
        { success: false, error: 'Registratie tijdelijk niet mogelijk. Probeer het later opnieuw.' },
        { status: 403 }
      )
    }

    // Turnstile verification (bot protection)
    if (shouldEnforceTurnstile()) {
      const { turnstileToken } = body

      if (!turnstileToken) {
        return NextResponse.json({
          success: false,
          error: 'Beveiligingsverificatie vereist'
        }, { status: 400 })
      }

      const verification = await verifyTurnstileToken(turnstileToken, clientIP)

      if (!verification.success) {
        auditLog('PROFESSIONAL_TURNSTILE_FAILED', {
          userId: undefined,
          details: `Turnstile verification failed: ${verification.error}`,
          clientInfo,
          success: false,
        })

        // Update IP reputation
        await IPReputationTracker.update(clientIP, { failedRegistration: true, flag: 'turnstile_failed' })

        return NextResponse.json({
          success: false,
          error: verification.error || 'Beveiligingsverificatie mislukt'
        }, { status: 400 })
      }
    }

    // Validate input with Zod
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message },
        { status: 400 }
      )
    }

    const {
      name,
      email,
      password,
      organizationName,
      organizationType,
      kvkNumber,
      newsletter = true,
    } = validationResult.data

    // SpamGuard checks
    const spamCheck = await SpamGuard.check({
      email,
      name,
      ip: clientIP,
      request,
    })

    if (spamCheck.shouldBlock) {
      auditLog('PROFESSIONAL_SPAM_BLOCKED', {
        userId: undefined,
        details: JSON.stringify({
          score: spamCheck.overallScore,
          reasons: spamCheck.reasons.slice(0, 3),
        }),
        clientInfo,
        success: false,
      })

      // Update IP reputation
      await IPReputationTracker.update(clientIP, { failedRegistration: true, flag: 'spam_detected' })

      // Give user-friendly error for disposable emails
      if (spamCheck.details.email.isDisposable) {
        return NextResponse.json(
          { success: false, error: 'Wegwerp email adressen zijn niet toegestaan' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Registratie kon niet worden verwerkt. Controleer je gegevens.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Dit e-mailadres is al geregistreerd' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user and professional account in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          role: 'USER',
          // Email not verified yet
          emailVerified: null,
        },
      })

      // Create professional account
      const professional = await tx.professionalAccount.create({
        data: {
          userId: user.id,
          organizationName,
          organizationType: organizationType as any,
          kvkNumber: kvkNumber || null,
          isVerified: false, // Requires manual verification
          professionalTier: 'BASIC',
          canAccessContent: true,
          canDownloadPdf: false, // Requires upgrade
        },
      })

      return { user, professional }
    })

    // Update IP reputation (successful registration)
    await IPReputationTracker.update(clientIP, { successfulRegistration: true })

    // Audit log the registration
    auditLog('PROFESSIONAL_REGISTER', {
      userId: result.user.id,
      details: `Professional registered: ${organizationName} (${organizationType})`,
      clientInfo,
      success: true,
    })

    // Create verification token
    const token = await createVerificationToken(result.user.email!)

    // Generate verification URL
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    const verificationUrl = `${baseUrl}/verify-email/confirm?token=${token}`

    // Send verification email
    try {
      await sendEmail({
        to: result.user.email!,
        subject: 'Activeer je Liefde Voor Iedereen Professional account',
        html: getVerificationEmailHtml({
          name: result.user.name || 'daar',
          verificationUrl,
        }),
        text: getVerificationEmailText({
          name: result.user.name || 'daar',
          verificationUrl,
        }),
      })
    } catch (emailError) {
      console.error('[Professional Register] Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        professionalId: result.professional.id,
      },
      message: 'Account aangemaakt! Controleer je e-mail om je account te activeren.',
    })
  } catch (error) {
    console.error('Error registering professional:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij de registratie' },
      { status: 500 }
    )
  }
}
