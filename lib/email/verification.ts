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
 * Validate a token WITHOUT consuming it (for preview/check)
 * Used to show confirmation page before actual verification
 */
export async function validateToken(token: string): Promise<{
  valid: boolean
  message: string
  email?: string
  userName?: string
  errorCode?: 'INVALID' | 'EXPIRED' | 'ALREADY_VERIFIED' | 'ERROR'
}> {
  try {
    console.log('[ValidateToken] Checking token:', token?.substring(0, 10) + '...')

    if (!token || token.length !== 64) {
      return {
        valid: false,
        message: 'Ongeldige verificatie link. De link is niet compleet.',
        errorCode: 'INVALID'
      }
    }

    // Find the token
    const verificationToken = await prisma.emailVerification.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      // Check if user is already verified
      const allTokens = await prisma.emailVerification.findMany()
      console.log('[ValidateToken] Token not found. Total tokens in DB:', allTokens.length)

      return {
        valid: false,
        message: 'Deze verificatie link is niet geldig. Mogelijk is je account al geverifieerd.',
        errorCode: 'INVALID'
      }
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      console.log('[ValidateToken] Token expired:', {
        expires: verificationToken.expires,
        now: new Date()
      })

      return {
        valid: false,
        message: 'Deze verificatie link is verlopen. Vraag een nieuwe link aan.',
        errorCode: 'EXPIRED',
        email: verificationToken.email
      }
    }

    // Check if user is already verified
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
      select: { name: true, emailVerified: true, isVerified: true }
    })

    if (user?.emailVerified || user?.isVerified) {
      console.log('[ValidateToken] User already verified')
      return {
        valid: false,
        message: 'Je account is al geverifieerd. Je kunt direct inloggen.',
        errorCode: 'ALREADY_VERIFIED',
        email: verificationToken.email
      }
    }

    console.log('[ValidateToken] Token is valid for:', verificationToken.email)

    return {
      valid: true,
      message: 'Token is geldig',
      email: verificationToken.email,
      userName: user?.name || verificationToken.email.split('@')[0]
    }
  } catch (error) {
    console.error('[ValidateToken] Error:', error)
    return {
      valid: false,
      message: 'Er ging iets mis bij het controleren van de link.',
      errorCode: 'ERROR'
    }
  }
}

/**
 * Verify a token and activate the user's account
 * This actually CONSUMES the token (should only be called after user confirmation)
 */
export async function verifyToken(token: string): Promise<{
  success: boolean
  message: string
  email?: string
}> {
  try {
    console.log('[VerifyToken] Attempting to verify token:', token?.substring(0, 10) + '...')

    // First validate the token
    const validation = await validateToken(token)

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      }
    }

    const email = validation.email!

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

    console.log('[VerifyToken] Successfully verified:', email)

    return {
      success: true,
      message: 'Je email is geverifieerd! Je account is nu actief.',
      email,
    }
  } catch (error) {
    console.error('[VerifyToken] Error:', error)
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
