import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Retry wrapper for Neon cold starts
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error: unknown) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("Can't reach database") ||
        error.message.includes('Connection refused') ||
        error.message.includes('ECONNREFUSED'))

    if (retries > 0 && isConnectionError) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return withRetry(fn, retries - 1, delayMs * 2)
    }
    throw error
  }
}