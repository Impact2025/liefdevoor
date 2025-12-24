import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import './types'
import { auditLog } from './audit'
import { trackRegistrationComplete, trackLoginEvent } from './analytics-events'
import { verifyTurnstileToken, shouldEnforceTurnstile } from './turnstile'

// Simple in-memory rate limiter for auth (use Redis in production)
const loginAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkLoginRateLimit(email: string): boolean {
  const now = Date.now()
  const key = email.toLowerCase()
  const entry = loginAttempts.get(key)

  if (!entry || now > entry.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + LOGIN_WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    return false
  }

  entry.count++
  return true
}

function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase())
}

export const authOptions: NextAuthOptions = {
  // PrismaAdapter returns a compatible Adapter type
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        turnstileToken: { label: 'Turnstile Token', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Turnstile verification (bot protection)
        if (shouldEnforceTurnstile()) {
          if (!credentials.turnstileToken) {
            auditLog('LOGIN_FAILED', {
              userId: undefined,
              details: `Turnstile token missing for ${credentials.email.substring(0, 3)}***`
            })
            throw new Error('Beveiligingsverificatie vereist')
          }

          const verification = await verifyTurnstileToken(credentials.turnstileToken)

          if (!verification.success) {
            auditLog('LOGIN_FAILED', {
              userId: undefined,
              details: `Turnstile verification failed for ${credentials.email.substring(0, 3)}***: ${verification.error}`
            })
            throw new Error('Beveiligingsverificatie mislukt')
          }
        }

        // Rate limit check
        if (!checkLoginRateLimit(credentials.email)) {
          auditLog('LOGIN_RATE_LIMITED', {
            details: { email: credentials.email.substring(0, 3) + '***' },
            success: false
          })
          throw new Error('Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            profileComplete: true,
            onboardingStep: true,
            isOnboarded: true,
          }
        })
        if (!user || !user.passwordHash) {
          auditLog('LOGIN_FAILED', {
            details: { email: credentials.email.substring(0, 3) + '***', reason: 'user_not_found' },
            success: false
          })
          return null
        }

        // Check if user is banned
        if (user.role === 'BANNED') {
          auditLog('LOGIN_FAILED', {
            userId: user.id,
            details: { reason: 'account_banned' },
            success: false
          })
          throw new Error('Dit account is geblokkeerd.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isPasswordValid) {
          auditLog('LOGIN_FAILED', {
            userId: user.id,
            details: { reason: 'invalid_password' },
            success: false
          })
          return null
        }

        // Reset rate limit on successful login
        resetLoginAttempts(credentials.email)

        // Log successful login
        auditLog('LOGIN_SUCCESS', {
          userId: user.id,
          success: true
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileComplete: user.profileComplete,
          onboardingStep: user.onboardingStep,
          isOnboarded: user.isOnboarded,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If user is trying to access a URL, allow it
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // If URL is on the same origin, allow it
      if (url.startsWith(baseUrl)) return url
      // Default to base URL
      return baseUrl
    },
    async signIn({ user, account, profile }) {
      // Track login/signup events (only for OAuth providers)
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { createdAt: true }
        })

        const isNewUser = dbUser &&
          new Date().getTime() - new Date(dbUser.createdAt).getTime() < 5000 // Created in last 5 seconds

        if (isNewUser) {
          // Track registration
          trackRegistrationComplete(user.id, user.email!, 'google')
        } else {
          // Track login
          trackLoginEvent(user.id, 'google')
        }

        // Audit log
        auditLog(isNewUser ? 'OAUTH_SIGNUP' : 'OAUTH_LOGIN', {
          userId: user.id,
          details: { provider: 'google' },
          success: true
        })
      }

      return true
    },
    async jwt({ token, user, trigger, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.profileComplete = user.profileComplete
        token.onboardingStep = user.onboardingStep
        token.isOnboarded = user.isOnboarded
      }

      // Refresh profile status from database on update
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { profileComplete: true, onboardingStep: true, isOnboarded: true }
        })
        if (dbUser) {
          token.profileComplete = dbUser.profileComplete
          token.onboardingStep = dbUser.onboardingStep
          token.isOnboarded = dbUser.isOnboarded
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.profileComplete = token.profileComplete as boolean
        session.user.onboardingStep = token.onboardingStep as number
        session.user.isOnboarded = token.isOnboarded as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}