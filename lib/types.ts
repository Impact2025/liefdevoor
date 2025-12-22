import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      profileComplete: boolean
      onboardingStep: number
      isOnboarded: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    profileComplete: boolean
    onboardingStep: number
    isOnboarded: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    profileComplete: boolean
    onboardingStep: number
    isOnboarded: boolean
  }
}

// Re-export all API types for convenience
export * from './types/api'
export { Gender, Role } from '@prisma/client'
