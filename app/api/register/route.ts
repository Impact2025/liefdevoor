/**
 * User Registration API
 *
 * Full spam protection with:
 * - Rate limiting (3 per 10 min per IP)
 * - Turnstile CAPTCHA
 * - SpamGuard validation (email, name, IP reputation)
 * - Form timing analysis (bot detection)
 * - Honeypot field
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimiters, rateLimitResponse, getClientIdentifier } from '@/lib/rate-limit'
import { auditLog, getClientInfo } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { Gender } from '@prisma/client'
import { createVerificationToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/email/templates'
import { verifyTurnstileToken, shouldEnforceTurnstile } from '@/lib/turnstile'
import { sendNewRegistrationAdminAlert } from '@/lib/email/admin-notification-service'
import { SpamGuard } from '@/lib/spam-guard'
import { IPReputationTracker } from '@/lib/spam-guard/ip-reputation'
import { FormTimingAnalyzer, REGISTRATION_FORM_CONFIG } from '@/lib/spam-guard/form-timing'

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
  source: z.string().optional(), // Doelgroep source for auto-enabling accessibility features
  // Spam protection fields
  timingToken: z.string().optional(), // Form timing token for bot detection
  honeypot: z.string().optional(), // Honeypot field - should be empty
})

export async function POST(request: NextRequest) {
  const clientIP = getClientIdentifier(request)
  const clientInfo = getClientInfo(request)

  try {
    // 1. Rate limiting: 3 registrations per 10 minutes per IP
    const rateLimitResult = await rateLimiters.register(request)
    if (!rateLimitResult.success) {
      // Update IP reputation for rate limit abuse
      await IPReputationTracker.update(clientIP, { rateLimitHit: true })
      return rateLimitResponse(rateLimitResult)
    }

    // 2. Check IP reputation before processing
    const ipCheck = await IPReputationTracker.shouldBlock(clientIP)
    if (ipCheck.blocked) {
      auditLog('REGISTER_IP_BLOCKED', {
        userId: undefined,
        details: `IP blocked: ${ipCheck.reason}`,
        clientInfo,
        success: false,
      })

      return NextResponse.json({
        success: false,
        error: { message: 'Registratie tijdelijk niet mogelijk. Probeer het later opnieuw.' }
      }, { status: 403 })
    }

    const body = await request.json()

    // 3. Honeypot check (invisible field that should be empty)
    if (body.honeypot && body.honeypot.length > 0) {
      auditLog('REGISTER_HONEYPOT_TRIGGERED', {
        userId: undefined,
        details: `Honeypot triggered with value: ${body.honeypot.substring(0, 50)}`,
        clientInfo,
        success: false,
      })

      // Update IP reputation
      await IPReputationTracker.update(clientIP, {
        failedRegistration: true,
        flag: 'honeypot_triggered',
      })

      // Return success to not reveal detection (but don't actually register)
      return NextResponse.json({
        success: true,
        data: {
          user: { id: 'fake', name: body.name, email: body.email },
          message: 'Account aangemaakt! Check je email om je account te activeren.',
        }
      })
    }

    // 4. Form timing check (detect bots that fill forms too fast)
    if (body.timingToken) {
      const timingResult = await FormTimingAnalyzer.validate(body.timingToken, REGISTRATION_FORM_CONFIG)

      if (timingResult.isBot) {
        auditLog('REGISTER_BOT_TIMING', {
          userId: undefined,
          details: `Bot detected via timing: ${timingResult.timingMs}ms (min: ${REGISTRATION_FORM_CONFIG.minimumTotalMs}ms)`,
          clientInfo,
          success: false,
        })

        // Update IP reputation
        await IPReputationTracker.update(clientIP, {
          failedRegistration: true,
          flag: 'bot_timing',
        })

        return NextResponse.json({
          success: false,
          error: { message: 'Registratie kon niet worden verwerkt. Probeer het opnieuw.' }
        }, { status: 400 })
      }
    }

    // 5. Turnstile verification (bot protection)
    if (shouldEnforceTurnstile()) {
      const { turnstileToken } = body

      if (!turnstileToken) {
        return NextResponse.json({
          success: false,
          error: { message: 'Beveiligingsverificatie vereist' }
        }, { status: 400 })
      }

      const verification = await verifyTurnstileToken(turnstileToken, clientIP)

      if (!verification.success) {
        auditLog('REGISTER', {
          userId: undefined,
          details: `Turnstile verification failed: ${verification.error}`,
          clientInfo,
          success: false
        })

        // Update IP reputation
        await IPReputationTracker.update(clientIP, {
          failedRegistration: true,
          flag: 'turnstile_failed',
        })

        return NextResponse.json({
          success: false,
          error: { message: verification.error || 'Beveiligingsverificatie mislukt' }
        }, { status: 400 })
      }
    }

    // 6. Validate input with Zod
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json({
        success: false,
        error: { message: firstError.message }
      }, { status: 400 })
    }

    const { name, email, password, birthDate, gender, city, bio, source } = validationResult.data

    // 7. SpamGuard comprehensive check
    const spamCheck = await SpamGuard.check({
      email,
      name,
      ip: clientIP,
      timingToken: body.timingToken,
      honeypotValue: body.honeypot,
      request,
    })

    if (spamCheck.shouldBlock) {
      auditLog('REGISTER_SPAM_BLOCKED', {
        userId: undefined,
        details: JSON.stringify({
          score: spamCheck.overallScore,
          reasons: spamCheck.reasons.slice(0, 5),
          recommendation: spamCheck.recommendation,
        }),
        clientInfo,
        success: false,
      })

      // Update IP reputation
      await IPReputationTracker.update(clientIP, {
        failedRegistration: true,
        flag: 'spam_blocked',
      })

      // User-friendly error messages
      if (spamCheck.details.email.isDisposable) {
        return NextResponse.json({
          success: false,
          error: { message: 'Wegwerp email adressen zijn niet toegestaan. Gebruik een permanent email adres.' }
        }, { status: 400 })
      }

      if (spamCheck.details.name.isSuspicious && spamCheck.details.name.suspicionScore >= 70) {
        return NextResponse.json({
          success: false,
          error: { message: 'Voer alsjeblieft je echte naam in.' }
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: { message: 'Registratie kon niet worden verwerkt. Controleer je gegevens en probeer opnieuw.' }
      }, { status: 400 })
    }

    // Log high-risk but allowed registrations for review
    if (spamCheck.isHighRisk && !spamCheck.shouldBlock) {
      auditLog('REGISTER_HIGH_RISK', {
        userId: undefined,
        details: JSON.stringify({
          score: spamCheck.overallScore,
          reasons: spamCheck.reasons.slice(0, 3),
        }),
        clientInfo,
        success: true,
      })
    }

    // 8. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: { message: 'Er bestaat al een account met dit emailadres' }
      }, { status: 400 })
    }

    // 9. Hash password with 12 rounds
    const hashedPassword = await bcrypt.hash(password, 12)

    // Auto-enable accessibility features based on registration source
    const getAccessibilityDefaults = (source?: string) => {
      switch (source) {
        case 'visueel': // Slechtzienden/Blinden
          return {
            visionImpairedMode: true,
            extraHighContrast: true,
            textToSpeech: true,
            largeTextMode: true,
            largeTargetsMode: true,
          }
        case 'lvb': // Licht Verstandelijke Beperking
          return {
            largeTextMode: true,
            largeTargetsMode: true,
          }
        default:
          return {}
      }
    }

    const accessibilityDefaults = getAccessibilityDefaults(source)

    // 10. Create user
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
        registrationSource: source || null, // Track doelgroep
        ...accessibilityDefaults, // Auto-enable accessibility features
      }
    })

    // 11. Update IP reputation for successful registration
    await IPReputationTracker.update(clientIP, { successfulRegistration: true })

    // 12. Audit log the registration
    auditLog('REGISTER', {
      userId: user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: spamCheck.isHighRisk ? `High risk registration (score: ${spamCheck.overallScore})` : undefined,
      success: true
    })

    // 13. Create verification token
    const token = await createVerificationToken(user.email!)
    console.log('[Register] Created verification token:', token)

    // Generate verification URL (remove trailing slash to prevent //)
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    // Direct link to confirmation page (avoids redirect issues in email app browsers)
    const verificationUrl = `${baseUrl}/verify-email/confirm?token=${token}`

    // 14. Send verification email
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

      // Send admin notification (non-blocking)
      sendNewRegistrationAdminAlert({
        userId: user.id,
        isHighRisk: spamCheck.isHighRisk,
        spamScore: spamCheck.overallScore,
      }).catch(err => console.error('[Register] Admin alert failed:', err))
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
