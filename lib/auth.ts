import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import './types'
import { auditLog } from './audit'
import { trackRegistrationComplete, trackLoginEvent } from './analytics-events'

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
  adapter: PrismaAdapter(prisma) as any,
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
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
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
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
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
      }

      // Refresh profile status from database on update
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { profileComplete: true, onboardingStep: true }
        })
        if (dbUser) {
          token.profileComplete = dbUser.profileComplete
          token.onboardingStep = dbUser.onboardingStep
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
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}