import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendGuardianConfirmation } from '@/lib/email/guardian-emails'

// Schema for guardian setup
const guardianSetupSchema = z.object({
  guardianEmail: z.string().email('Voer een geldig emailadres in'),
  guardianName: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
})

// GET /api/user/guardian - Get guardian status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Niet ingelogd' }
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        guardianEmail: true,
        guardianName: true,
        guardianEnabled: true,
        guardianConfirmed: true,
        guardianLastNotified: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { message: 'Gebruiker niet gevonden' }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      guardian: {
        email: user.guardianEmail,
        name: user.guardianName,
        enabled: user.guardianEnabled,
        confirmed: user.guardianConfirmed,
        lastNotified: user.guardianLastNotified,
      }
    })
  } catch (error) {
    console.error('Error fetching guardian status:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Er ging iets mis' }
    }, { status: 500 })
  }
}

// POST /api/user/guardian - Add a guardian
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Niet ingelogd' }
      }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = guardianSetupSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Ongeldige gegevens',
          details: validationResult.error.flatten().fieldErrors
        }
      }, { status: 400 })
    }

    const { guardianEmail, guardianName } = validationResult.data

    // Generate confirmation token
    const confirmToken = crypto.randomBytes(32).toString('hex')

    // Update user with guardian info
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        guardianEmail,
        guardianName,
        guardianEnabled: true,
        guardianConfirmed: false,
        guardianConfirmToken: confirmToken,
      },
      select: {
        name: true,
        guardianEmail: true,
        guardianName: true,
        guardianEnabled: true,
        guardianConfirmed: true,
      }
    })

    // Send confirmation email to guardian
    const confirmUrl = `${process.env.NEXTAUTH_URL}/api/guardian/confirm/${confirmToken}`

    try {
      await sendGuardianConfirmation({
        guardianEmail,
        guardianName,
        userName: user.name || 'Onbekend',
        confirmUrl,
      })
      console.log(`[Guardian] Confirmation email sent to ${guardianEmail}`)
    } catch (emailError) {
      console.error(`[Guardian] Failed to send confirmation email:`, emailError)
      // Continue anyway - the link is still valid
    }

    // Create initial guardian alert
    await prisma.guardianAlert.create({
      data: {
        userId: session.user.id,
        type: 'PROFILE_CHANGE',
        content: {
          action: 'guardian_added',
          guardianName,
          guardianEmail,
          timestamp: new Date().toISOString(),
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Er is een bevestigingsmail gestuurd naar ${guardianEmail}`,
      guardian: {
        email: user.guardianEmail,
        name: user.guardianName,
        enabled: user.guardianEnabled,
        confirmed: user.guardianConfirmed,
      }
    })
  } catch (error) {
    console.error('Error adding guardian:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Er ging iets mis bij het toevoegen van de begeleider' }
    }, { status: 500 })
  }
}

// DELETE /api/user/guardian - Remove guardian
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Niet ingelogd' }
      }, { status: 401 })
    }

    // Update user to remove guardian
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        guardianEmail: null,
        guardianName: null,
        guardianEnabled: false,
        guardianConfirmed: false,
        guardianConfirmToken: null,
        guardianLastNotified: null,
      }
    })

    // Create guardian alert for removal
    await prisma.guardianAlert.create({
      data: {
        userId: session.user.id,
        type: 'PROFILE_CHANGE',
        content: {
          action: 'guardian_removed',
          timestamp: new Date().toISOString(),
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Begeleider is verwijderd'
    })
  } catch (error) {
    console.error('Error removing guardian:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Er ging iets mis bij het verwijderen van de begeleider' }
    }, { status: 500 })
  }
}
