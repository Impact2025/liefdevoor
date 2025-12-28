import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for accessibility updates
const accessibilitySchema = z.object({
  visionImpairedMode: z.boolean().optional(),
  extraHighContrast: z.boolean().optional(),
  textToSpeech: z.boolean().optional(),
  voiceCommands: z.boolean().optional(),
  colorBlindMode: z.string().nullable().optional(),
  largeTextMode: z.boolean().optional(),
  largeTargetsMode: z.boolean().optional(),
})

// GET /api/user/accessibility - Fetch user's accessibility settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Unauthorized' }
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        visionImpairedMode: true,
        extraHighContrast: true,
        textToSpeech: true,
        voiceCommands: true,
        colorBlindMode: true,
        largeTextMode: true,
        largeTargetsMode: true,
        registrationSource: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { message: 'User not found' }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      settings: user
    })
  } catch (error) {
    console.error('Error fetching accessibility settings:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Internal server error' }
    }, { status: 500 })
  }
}

// PATCH /api/user/accessibility - Update user's accessibility settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Unauthorized' }
      }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = accessibilitySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid request data' }
      }, { status: 400 })
    }

    const updates = validationResult.data

    // Update user's accessibility settings
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        visionImpairedMode: true,
        extraHighContrast: true,
        textToSpeech: true,
        voiceCommands: true,
        colorBlindMode: true,
        largeTextMode: true,
        largeTargetsMode: true,
        registrationSource: true,
      }
    })

    return NextResponse.json({
      success: true,
      settings: user,
      message: 'Accessibility instellingen bijgewerkt'
    })
  } catch (error) {
    console.error('Error updating accessibility settings:', error)
    return NextResponse.json({
      success: false,
      error: { message: 'Internal server error' }
    }, { status: 500 })
  }
}
