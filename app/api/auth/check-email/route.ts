/**
 * Email Availability Check API
 *
 * Checks if an email address is already registered
 * Used for real-time validation during registration
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  email: z.string().email('Invalid email format'),
})

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Support GET for query parameter usage
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { available: false, error: 'Email parameter required' },
        { status: 400 }
      )
    }

    // Validate email format
    const result = schema.safeParse({ email })
    if (!result.success) {
      return NextResponse.json(
        { available: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? 'Dit emailadres is al in gebruik'
        : 'Email is beschikbaar',
    })
  } catch (error) {
    console.error('[Check Email GET] Error:', error)
    return NextResponse.json(
      { available: true, error: 'Could not verify email' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { available: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? 'Dit emailadres is al in gebruik'
        : 'Email is beschikbaar',
    })
  } catch (error) {
    console.error('[Check Email] Error:', error)
    return NextResponse.json(
      { available: true, error: 'Could not verify email' },
      { status: 500 }
    )
  }
}
