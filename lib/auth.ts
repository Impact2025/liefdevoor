import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import './types'
import { auditLog } from './audit'

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
          where: { email: credentials.email.toLowerCase() }
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
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}