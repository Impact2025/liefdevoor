import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In serverless (Vercel) we append connection_limit to avoid exhausting Neon's
// direct-connection pool. The pooler is incompatible with npg_ passwords (SCRAM-SHA-256-PLUS).
function buildDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return url
  // Only add connection_limit when not already present and running serverless
  if (process.env.VERCEL && !url.includes('connection_limit')) {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}connection_limit=3&pool_timeout=10`
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
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