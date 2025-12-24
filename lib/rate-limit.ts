/**
 * Rate Limiting - Production-Ready with Redis Support
 *
 * This module re-exports the Redis-based rate limiter for backward compatibility.
 * All existing imports will now use Redis when REDIS_URL is set, or fall back to
 * in-memory storage in development.
 *
 * To enable Redis in production:
 * 1. Install: npm install ioredis
 * 2. Set environment variable: REDIS_URL=redis://your-redis-url
 * 3. Or use Upstash Redis REST API (see redis-rate-limit.ts)
 */

export {
  rateLimit,
  rateLimiters,
  rateLimitResponse,
  getClientIdentifier,
  getClientIdentifier as getClientIP,
  type RateLimitConfig,
  type RateLimitResult,
} from './redis-rate-limit'
