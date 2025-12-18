/**
 * Test Endpoints for All Email Templates
 *
 * Usage:
 * - GET /api/test/emails?type=match&email=user@example.com
 * - GET /api/test/emails?type=message&email=user@example.com
 * - GET /api/test/emails?type=password-reset&email=user@example.com
 *
 * Only available in development mode
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendMatchNotification,
  sendMessageNotification,
  sendPasswordResetEmail
} from '@/lib/email/notification-service'

/**
 * Test email endpoints
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints not available in production' },
      { status: 403 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      {
        error: 'Missing email parameter',
        usage: {
          match: '/api/test/emails?type=match&email=user@example.com',
          message: '/api/test/emails?type=message&email=user@example.com',
          passwordReset: '/api/test/emails?type=password-reset&email=user@example.com'
        }
      },
      { status: 400 }
    )
  }

  try {
    switch (type) {
      case 'match':
        return await testMatchNotification(email)

      case 'message':
        return await testMessageNotification(email)

      case 'password-reset':
        return await testPasswordReset(email)

      default:
        return NextResponse.json(
          {
            error: 'Invalid type parameter',
            validTypes: ['match', 'message', 'password-reset'],
            usage: {
              match: '/api/test/emails?type=match&email=user@example.com',
              message: '/api/test/emails?type=message&email=user@example.com',
              passwordReset: '/api/test/emails?type=password-reset&email=user@example.com'
            }
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Test Emails] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Test Match Notification Email
 */
async function testMatchNotification(email: string) {
  console.log(`[Test] Testing match notification for ${email}`)

  // Get the test user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: 'User email is not verified' }, { status: 400 })
  }

  // Find another user to use as the "match"
  const matchUser = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      emailVerified: { not: null }
    },
    select: {
      id: true,
      name: true,
      birthDate: true,
      profileImage: true,
      city: true,
      bio: true
    }
  })

  if (!matchUser) {
    return NextResponse.json(
      { error: 'No other users available for test match' },
      { status: 404 }
    )
  }

  // Send the test email
  await sendMatchNotification({
    userId: user.id,
    matchUserId: matchUser.id,
    matchId: 'test-match-id-123'
  })

  return NextResponse.json({
    success: true,
    type: 'match',
    sentTo: user.email,
    testData: {
      userName: user.name,
      matchName: matchUser.name,
      matchCity: matchUser.city
    }
  })
}

/**
 * Test Message Notification Email
 */
async function testMessageNotification(email: string) {
  console.log(`[Test] Testing message notification for ${email}`)

  // Get the test user (recipient)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: 'User email is not verified' }, { status: 400 })
  }

  // Find another user to use as the "sender"
  const sender = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      emailVerified: { not: null }
    },
    select: {
      id: true,
      name: true,
      birthDate: true,
      profileImage: true
    }
  })

  if (!sender) {
    return NextResponse.json(
      { error: 'No other users available for test sender' },
      { status: 404 }
    )
  }

  // Send the test email
  await sendMessageNotification({
    userId: user.id,
    senderId: sender.id,
    messageId: 'test-message-id-456',
    messageContent: 'Hey! Hoe is je dag vandaag? Ik zag je profiel en dacht, laten we eens een leuk gesprek hebben! 😊',
    matchId: 'test-match-id-789'
  })

  return NextResponse.json({
    success: true,
    type: 'message',
    sentTo: user.email,
    testData: {
      recipientName: user.name,
      senderName: sender.name,
      messagePreview: 'Hey! Hoe is je dag vandaag? Ik zag je profiel...'
    }
  })
}

/**
 * Test Password Reset Email
 */
async function testPasswordReset(email: string) {
  console.log(`[Test] Testing password reset for ${email}`)

  // Send the test email (no user verification needed for password reset)
  await sendPasswordResetEmail({
    email,
    resetToken: 'test-token-' + Date.now(),
    expiresIn: '1 uur'
  })

  return NextResponse.json({
    success: true,
    type: 'password-reset',
    sentTo: email,
    testData: {
      expiresIn: '1 uur',
      note: 'This is a test password reset email. The token is not real.'
    }
  })
}
