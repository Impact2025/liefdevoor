import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// POST /api/professionals/register - Register as professional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      password,
      organizationName,
      organizationType,
      kvkNumber,
      newsletter = true,
    } = body

    // Validation
    if (!name || !email || !password || !organizationName || !organizationType) {
      return NextResponse.json(
        { success: false, error: 'Alle verplichte velden moeten ingevuld zijn' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Ongeldig e-mailadres' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Wachtwoord moet minimaal 8 karakters zijn' },
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

      // TODO: Newsletter subscription (model not yet in schema)
      // if (newsletter) { ... }

      return { user, professional }
    })

    // TODO: Send verification email
    // TODO: Send welcome email with getting started guide

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        professionalId: result.professional.id,
      },
      message: 'Account aangemaakt! Controleer je e-mail voor verificatie.',
    })
  } catch (error) {
    console.error('Error registering professional:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij de registratie' },
      { status: 500 }
    )
  }
}
