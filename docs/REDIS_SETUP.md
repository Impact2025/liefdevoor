# 🔴 Redis Setup Guide - PRODUCTION BLOCKER

**Status:** ⚠️ **REQUIRED FOR LAUNCH** - Rate limiting will not work in production without Redis

---

## Why Redis is Critical

Your dating app uses Redis for:

1. **Rate Limiting** - Prevents API abuse and DDoS attacks
2. **Session Management** - Fast user session lookups
3. **Real-time Features** - Typing indicators, online status
4. **Caching** - Reduces database load

**Without Redis:** Rate limiting falls back to in-memory Map, which:
- ❌ Resets on every deployment
- ❌ Doesn't work across multiple server instances
- ❌ Allows unlimited API requests (security risk!)

---

## Setup Options

### Option 1: Upstash (Recommended) ✅

**Cost:** FREE tier (10,000 commands/day)
**Setup Time:** 5 minutes
**Best For:** Production deployment

#### Steps:

1. **Create Upstash Account**
   - Go to https://upstash.com
   - Sign up with GitHub/Google (free)

2. **Create Redis Database**
   - Click "Create Database"
   - Name: `dating-app-prod`
   - Type: **Regional** (faster, free tier)
   - Region: Select closest to your Vercel region (e.g., `eu-west-1` for Europe)
   - TLS: **Enabled** (more secure)

3. **Copy Connection String**
   - Click on your database
   - Scroll to "REST API" section
   - Copy the **`UPSTASH_REDIS_REST_URL`**
   - Copy the **`UPSTASH_REDIS_REST_TOKEN`**

4. **Add to Environment Variables**

   **Local Development** (`.env.local`):
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token-here
   ```

   **Vercel Production**:
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add both variables to "Production" and "Preview"

5. **Verify Setup**
   ```bash
   # Test connection locally
   npm run dev

   # Make an API request (should see rate limit headers)
   curl -I http://localhost:3000/api/profile

   # You should see:
   # X-RateLimit-Limit: 100
   # X-RateLimit-Remaining: 99
   ```

---

### Option 2: Redis Cloud (Alternative)

**Cost:** FREE tier (30MB storage)
**Best For:** Production with more control

#### Steps:

1. Go to https://redis.com/try-free/
2. Create account and database
3. Copy connection string format:
   ```
   redis://default:password@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
   ```
4. Add to `.env.local`:
   ```bash
   REDIS_URL=redis://default:password@your-redis-cloud.com:12345
   ```

---

### Option 3: Local Redis (Development Only) 💻

**Cost:** FREE
**Best For:** Local testing only (NOT production!)

#### Option A: Docker (Recommended for Windows)

```bash
# Run Redis in Docker
docker run -d \
  --name dating-redis \
  -p 6379:6379 \
  redis:alpine

# Add to .env.local
REDIS_URL=redis://localhost:6379
```

#### Option B: Native Installation

**Windows (via WSL):**
```bash
# Install via WSL
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
redis-server

# Add to .env.local
REDIS_URL=redis://localhost:6379
```

**macOS (via Homebrew):**
```bash
# Install
brew install redis

# Start
brew services start redis

# Add to .env.local
REDIS_URL=redis://localhost:6379
```

---

## Verification

### 1. Check Redis Connection

Create `scripts/test-redis.ts`:

```typescript
import { redis } from '@/lib/redis'

async function testRedis() {
  try {
    // Test write
    await redis.set('test-key', 'Hello Redis!', { ex: 10 })
    console.log('✅ Write successful')

    // Test read
    const value = await redis.get('test-key')
    console.log('✅ Read successful:', value)

    // Test rate limiting
    const rateLimit = await redis.incr('rate-limit-test')
    console.log('✅ Rate limit counter:', rateLimit)

    console.log('\n🎉 Redis is working correctly!\n')
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    process.exit(1)
  }
}

testRedis()
```

Run it:
```bash
npx tsx scripts/test-redis.ts
```

### 2. Check Rate Limiting

```bash
# Make 10 rapid requests
for i in {1..10}; do
  curl -I http://localhost:3000/api/profile 2>&1 | grep -i "ratelimit"
done

# You should see rate limit headers decreasing:
# X-RateLimit-Remaining: 99
# X-RateLimit-Remaining: 98
# ...
```

---

## Configuration

### Rate Limit Settings

Edit `lib/rate-limiter.ts` to customize limits:

```typescript
const rateLimits = {
  // API endpoints
  api: { limit: 100, window: '1m' },        // 100 requests per minute

  // Authentication
  login: { limit: 5, window: '15m' },       // 5 attempts per 15 minutes
  register: { limit: 3, window: '1h' },     // 3 registrations per hour

  // Swipe actions
  swipe: { limit: 1000, window: '1d' },     // 1000 swipes per day (basic)
  superlike: { limit: 5, window: '1d' },    // 5 superlikes per day

  // Messaging
  message: { limit: 200, window: '1h' },    // 200 messages per hour
}
```

### Redis Client Configuration

The app uses `@upstash/redis` for edge compatibility:

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

---

## Monitoring

### Upstash Dashboard

1. Log in to https://console.upstash.com
2. View real-time metrics:
   - Commands per second
   - Storage usage
   - Latency
   - Error rate

### Key Metrics to Watch

- **Commands/day:** Should stay under 10,000 for free tier
- **Storage:** Should stay under 100MB
- **Latency:** Should be < 50ms for regional database

### Upgrade Triggers

Upgrade from free tier when:
- ✅ 100+ concurrent users
- ✅ 10,000+ daily API requests
- ✅ Need multi-region replication
- ✅ Need more than 100MB storage

**Paid Plan:** $10/month (100K commands/day)

---

## Troubleshooting

### Error: "Cannot connect to Redis"

**Cause:** Missing environment variables

**Fix:**
```bash
# Check if variables are set
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# If empty, add to .env.local
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Error: "Rate limit not working"

**Cause:** Falling back to in-memory cache

**Fix:**
1. Verify Redis connection (run test script above)
2. Check Vercel environment variables are set
3. Redeploy after adding variables

### Error: "Too many requests"

**Cause:** Exceeded free tier limits

**Solutions:**
1. **Optimize:** Reduce unnecessary API calls
2. **Cache:** Add client-side caching for repeated requests
3. **Upgrade:** Switch to paid plan ($10/month)

---

## Production Deployment Checklist

Before deploying to production:

- [ ] ✅ Upstash account created
- [ ] ✅ Redis database created (regional, TLS enabled)
- [ ] ✅ Environment variables added to Vercel
- [ ] ✅ Test script passes (`npx tsx scripts/test-redis.ts`)
- [ ] ✅ Rate limiting works (verify with curl)
- [ ] ✅ Monitor dashboard shows activity
- [ ] ✅ Backup plan: Know how to upgrade if free tier insufficient

---

## Cost Estimates

### Free Tier Capacity

With 10,000 commands/day, you can support:
- **~100 daily active users** (100 commands per user)
- **~420 users per hour** (during peak hours)

### When to Upgrade

| Users/Day | Commands/Day | Plan Needed | Cost |
|-----------|--------------|-------------|------|
| 0-100 | <10K | Free | $0 |
| 100-1K | 10K-100K | Pay-as-you-go | $10/mo |
| 1K-10K | 100K-1M | Pro | $50/mo |
| 10K+ | 1M+ | Enterprise | Custom |

---

## Security Best Practices

1. **Enable TLS:** Always use TLS for production
2. **Rotate Tokens:** Rotate Redis tokens every 90 days
3. **Monitor Access:** Set up alerts for unusual activity
4. **Separate Environments:** Use different Redis instances for dev/staging/prod
5. **Firewall Rules:** Whitelist only your server IPs (if using Redis Cloud)

---

## Additional Resources

- **Upstash Docs:** https://docs.upstash.com/redis
- **Rate Limiting Guide:** https://upstash.com/docs/redis/features/ratelimiting
- **Next.js + Upstash:** https://upstash.com/docs/redis/tutorials/nextjs-ratelimiting

---

## Support

If you encounter issues:

1. Check the [Upstash Status Page](https://status.upstash.com/)
2. Review [Upstash Discord](https://discord.gg/upstash)
3. Contact Upstash support (Enterprise plans)

---

**Last Updated:** December 23, 2025
**Estimated Setup Time:** 5-10 minutes
**Blocking Status:** ⚠️ REQUIRED FOR PRODUCTION LAUNCH
