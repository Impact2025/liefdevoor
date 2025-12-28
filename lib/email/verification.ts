/**
 * Email Verification Helpers
 *
 * Functions for creating and verifying email tokens
 */

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * Create a verification token for a user
 */
export async function createVerificationToken(email: string): Promise<string> {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex')

  // Store token in database (expires in 24 hours)
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  // Delete any existing tokens for this email
  await prisma.emailVerification.deleteMany({
    where: { email },
  })

  // Create new token
  await prisma.emailVerification.create({
    data: {
      email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify a token and activate the user's account
 */
export async function verifyToken(token: string): Promise<{
  success: boolean
  message: string
  email?: string
}> {
  try {
    console.log('[VerifyToken] Received token:', token)
    console.log('[VerifyToken] Token length:', token.length)

    // Find the token
    const verificationToken = await prisma.emailVerification.findUnique({
      where: { token },
    })

    console.log('[VerifyToken] Token found in DB:', !!verificationToken)
    if (verificationToken) {
      console.log('[VerifyToken] Token details:', {
        email: verificationToken.email,
        expires: verificationToken.expires,
        isExpired: verificationToken.expires < new Date()
      })
    }

    if (!verificationToken) {
      // Check if there are ANY tokens in the database for debugging
      const allTokens = await prisma.emailVerification.findMany()
      console.log('[VerifyToken] Total tokens in DB:', allTokens.length)
      if (allTokens.length > 0) {
        console.log('[VerifyToken] Sample token length from DB:', allTokens[0].token.length)
      }

      return {
        success: false,
        message: 'Ongeldige verificatie link. Vraag een nieuwe link aan.',
      }
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerification.delete({
        where: { token },
      })

      return {
        success: false,
        message: 'Deze verificatie link is verlopen. Vraag een nieuwe link aan.',
      }
    }

    const email = verificationToken.email

    // Update user to mark email as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        isVerified: true,
      },
    })

    // Delete the used token
    await prisma.emailVerification.delete({
      where: { token },
    })

    return {
      success: true,
      message: 'Je email is geverifieerd! Je account is nu actief.',
      email,
    }
  } catch (error) {
    console.error('[Verification] Error verifying token:', error)
    return {
      success: false,
      message: 'Er ging iets mis bij het verifiëren. Probeer het opnieuw.',
    }
  }
}

/**
 * Check if a user needs to verify their email
 */
export async function needsEmailVerification(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  })

  return !user?.emailVerified
}
