# 🚀 Production Launch Checklist

**Current Status:** 78/100 Launch Ready
**Target Date:** January 7, 2026
**Last Updated:** December 23, 2025

---

## ✅ COMPLETED (Phase 1)

### Security (85/100) ✅

- [x] **Encryption System** - AES-256-GCM for sensitive data
  - File: `lib/encryption.ts`
  - 2FA secrets encrypted
  - Backup codes encrypted
  - Migration script: `scripts/encrypt-existing-data.ts`

- [x] **Key Generation** - Secure encryption key generator
  - Script: `scripts/generate-encryption-key.ts`
  - Documentation in encryption.ts

### SEO (85/100) ✅

- [x] **Sitemap.xml** - Auto-generated for search engines
  - File: `app/sitemap.ts`
  - Updates automatically on deployment

- [x] **Robots.txt** - Crawler control
  - File: `app/robots.ts`
  - Blocks auth pages, allows public pages

- [x] **JSON-LD Structured Data** - Rich snippets
  - File: `app/layout.tsx`
  - LocalBusiness schema
  - AggregateRating (4.7/5 stars)
  - AggregateOffer (€0 - €24.95)

- [x] **Page Metadata** - SEO optimization for 4 critical pages
  - `/login` - "Inloggen" keywords
  - `/register` - "Gratis Aanmelden" (high intent)
  - `/blog` - "Dating Tips & Advies"
  - `/prijzen` - "Abonnementen & Prijzen"

### Performance (70/100) ⬆️

- [x] **Web Vitals Monitoring** - Core metrics tracking
  - File: `lib/web-vitals.ts`
  - Tracks: LCP, FID, CLS, FCP, TTFB, INP
  - Sends to: Google Analytics, Sentry, console

- [x] **Code Splitting** - Dynamic imports for heavy components
  - `app/discover/page.tsx` - PassportModal lazy loaded
  - `app/chat/[matchId]/page.tsx` - IcebreakersPanel & GifPicker lazy loaded
  - Reduces initial bundle by ~50KB

- [x] **Suspense Boundaries** - Loading skeletons created
  - Files: `components/ui/skeletons/`
  - DiscoverSkeleton, MatchesSkeleton, ChatSkeleton

### Infrastructure (70/100) ✅

- [x] **Redis Setup Guide** - Rate limiting configuration
  - File: `docs/REDIS_SETUP.md`
  - Test script: `scripts/test-redis.ts`
  - `.env.example` updated with instructions

---

## ⏳ REMAINING TASKS

### Week 1: Critical (Dec 24-30)

#### 1. Configure Redis ⚠️ BLOCKING

**Priority:** 🔴 CRITICAL - Required for production
**Time:** 1 hour
**Status:** Documented, needs execution

**Steps:**
```bash
# 1. Create Upstash account
open https://console.upstash.com

# 2. Create database (Regional, TLS enabled)

# 3. Add credentials to Vercel
# Settings → Environment Variables
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# 4. Test connection
npx tsx scripts/test-redis.ts

# 5. Verify rate limiting works
curl -I https://yourdomain.com/api/profile
# Should show: X-RateLimit-Limit, X-RateLimit-Remaining
```

**Documentation:** `docs/REDIS_SETUP.md`

#### 2. Hash Password Reset Tokens 🟠 HIGH

**Priority:** Security improvement
**Time:** 2 hours

**Current Issue:** Plain text tokens in database
**Solution:** SHA-256 hashing

**Files to update:**
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`

**Implementation:**
```typescript
import { hashToken, compareToken } from '@/lib/encryption'

// When creating reset token
const token = generateSecureToken()
const hashedToken = hashToken(token)
await prisma.passwordReset.create({
  data: { token: hashedToken, userId, expiresAt }
})

// When validating
const reset = await prisma.passwordReset.findFirst({
  where: { expiresAt: { gt: new Date() } }
})
const isValid = compareToken(plainToken, reset.token)
```

#### 3. File Upload Validation 🟠 HIGH

**Priority:** Security + Content safety
**Time:** 1 day

**Current:** Basic MIME type checking
**Needed:** Magic number validation + virus scanning

**Steps:**
```bash
# Install dependency
npm install file-type

# Update uploadthing config
# File: app/api/uploadthing/core.ts
```

**Implementation:**
```typescript
import { fileTypeFromBuffer } from 'file-type'

onUploadComplete: async ({ file }) => {
  // Fetch file and validate
  const buffer = await fetch(file.url).then(r => r.arrayBuffer())
  const type = await fileTypeFromBuffer(Buffer.from(buffer))

  // Check against allowed types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(type?.mime || '')) {
    // Delete file and throw error
    await utapi.deleteFiles(file.key)
    throw new Error('Invalid file type')
  }
}
```

---

### Week 2: Polish (Dec 31 - Jan 6)

#### 4. Database Query Optimization 🟡 MEDIUM

**Priority:** Performance improvement
**Time:** 1 day

**Current Issue:** N+1 queries in `/api/top-picks`

**Before:**
```typescript
// ❌ Fetches 100 users, filters in memory
const users = await prisma.user.findMany({ take: 100 })
const filtered = users.filter(u =>
  u.age >= minAge && u.age <= maxAge && nearbyCities.includes(u.city)
)
```

**After:**
```typescript
// ✅ Database filtering
const users = await prisma.user.findMany({
  where: {
    age: { gte: minAge, lte: maxAge },
    city: { in: nearbyCities },
  },
  take: 20,
  select: {
    id: true,
    name: true,
    photos: { take: 1 },
    // Only select needed fields
  }
})
```

**Files to optimize:**
- `app/api/top-picks/route.ts`
- `app/api/discover/route.ts`
- `app/api/matches/route.ts`

#### 5. Fix GDPR Data Export 🟡 MEDIUM

**Priority:** Legal compliance
**Time:** 1 day

**Current Issue:** Uses data: URI (breaks for large exports)
**Solution:** Upload to S3/R2, generate signed URL

**Implementation:**
```bash
# Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Upload export
const s3 = new S3Client({ region: 'eu-west-1' })
await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `exports/${userId}-${Date.now()}.json`,
  Body: dataJson,
  ContentType: 'application/json',
}))

// Generate download URL (expires in 1 hour)
const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `exports/${userId}-${Date.now()}.json`,
}), { expiresIn: 3600 })

// Email download link to user
await sendEmail({
  to: user.email,
  subject: 'Je gegevensexport is klaar',
  html: `Download: <a href="${downloadUrl}">Klik hier</a> (geldig 1 uur)`
})
```

**Files to update:**
- `app/api/data-export/route.ts`
- Add S3/R2 credentials to `.env`

#### 6. E2E Testing Setup 🟡 MEDIUM

**Priority:** Quality assurance
**Time:** 2 days

**Setup:**
```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Create test directory
mkdir -p tests/e2e
```

**Critical Test Flows:**

1. **Registration & Login** (`tests/e2e/auth.spec.ts`)
```typescript
import { test, expect } from '@playwright/test'

test('user can register and login', async ({ page }) => {
  // Register
  await page.goto('/register')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.click('button[type="submit"]')

  // Verify redirect to onboarding
  await expect(page).toHaveURL('/onboarding')
})
```

2. **Swipe & Match** (`tests/e2e/discover.spec.ts`)
```typescript
test('user can swipe and match', async ({ page }) => {
  // Login first
  await page.goto('/login')
  await page.fill('[name="email"]', 'user1@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Go to discover
  await page.goto('/discover')

  // Swipe right
  await page.click('[data-testid="like-button"]')

  // Check for match modal if match occurs
  const matchModal = page.locator('text=It\'s a Match!')
  if (await matchModal.isVisible()) {
    await expect(matchModal).toBeVisible()
  }
})
```

3. **Payment Flow** (`tests/e2e/payment.spec.ts`)
```typescript
test('user can upgrade to premium', async ({ page }) => {
  await page.goto('/prijzen')
  await page.click('text=Premium')
  await page.click('button:has-text("Kies plan")')

  // Verify redirect to payment
  await expect(page).toHaveURL(/multisafepay|ideal/)
})
```

**Run tests:**
```bash
# All tests
npx playwright test

# Specific test
npx playwright test tests/e2e/auth.spec.ts

# With UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

---

## 🔒 Pre-Launch Security Checklist

### Environment Variables

- [ ] Generate unique `NEXTAUTH_SECRET` for production
  ```bash
  openssl rand -base64 32
  ```

- [ ] Generate unique `ENCRYPTION_KEY` for production
  ```bash
  npx tsx scripts/generate-encryption-key.ts
  ```

- [ ] Rotate all API keys
  - [ ] UploadThing (use `sk_live_*` not `sk_test_*`)
  - [ ] MultiSafepay (use live API key)
  - [ ] Resend (use production key)
  - [ ] OpenRouter
  - [ ] Sightengine

- [ ] Configure Redis (Upstash)
  - [ ] Create production database
  - [ ] Add `UPSTASH_REDIS_REST_URL` to Vercel
  - [ ] Add `UPSTASH_REDIS_REST_TOKEN` to Vercel
  - [ ] Test connection: `npx tsx scripts/test-redis.ts`

- [ ] Set up monitoring
  - [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel
  - [ ] Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to Vercel

- [ ] Configure cron jobs
  - [ ] Generate `CRON_SECRET`: `openssl rand -base64 32`
  - [ ] Add to Vercel environment variables

### Data Migration

- [ ] Run encryption migration on production data
  ```bash
  # Dry run first!
  npx tsx scripts/encrypt-existing-data.ts --dry-run

  # Review output, then run for real
  npx tsx scripts/encrypt-existing-data.ts --confirm

  # Include messages if needed
  npx tsx scripts/encrypt-existing-data.ts --confirm --include-messages
  ```

### Database

- [ ] Review and optimize indexes
  ```sql
  -- Check missing indexes
  SELECT * FROM pg_stat_user_tables;

  -- Add indexes for common queries
  CREATE INDEX CONCURRENTLY idx_swipes_created_at ON swipes(created_at);
  CREATE INDEX CONCURRENTLY idx_messages_match_id ON messages(match_id, created_at);
  ```

- [ ] Set up automated backups (Neon.tech)
  - [ ] Enable daily backups
  - [ ] Test restore process
  - [ ] Document backup location

### Vercel Deployment

- [ ] Configure production environment
  - [ ] Set all environment variables
  - [ ] Enable branch protection for main
  - [ ] Set up preview deployments

- [ ] Configure custom domain
  - [ ] Add DNS records
  - [ ] Enable automatic HTTPS
  - [ ] Verify SSL certificate

- [ ] Configure build settings
  - [ ] Enable caching
  - [ ] Set Node.js version: 18.x
  - [ ] Configure redirects if needed

### Performance

- [ ] Run Lighthouse audit
  ```bash
  # Target scores:
  # Performance: 90+
  # Accessibility: 95+
  # Best Practices: 90+
  # SEO: 95+

  npx lighthouse https://yourdomain.com --view
  ```

- [ ] Load testing
  ```bash
  # Test with 100 concurrent users
  npx loadtest -c 100 -n 1000 https://yourdomain.com/api/profile

  # Should handle 100+ RPS without errors
  ```

### Security Scanning

- [ ] Run OWASP ZAP scan
  ```bash
  # Download OWASP ZAP
  # Point at your staging environment
  # Review and fix any HIGH/CRITICAL issues
  ```

- [ ] Review dependencies
  ```bash
  npm audit
  npm audit fix

  # Review remaining vulnerabilities
  # Upgrade packages if needed
  ```

- [ ] Check headers
  ```bash
  curl -I https://yourdomain.com

  # Should include:
  # X-Content-Type-Options: nosniff
  # X-Frame-Options: DENY
  # X-XSS-Protection: 1; mode=block
  # Strict-Transport-Security: max-age=31536000
  ```

---

## 📊 Final Verification

### Functional Testing

- [ ] User Registration
  - [ ] Email verification works
  - [ ] Password requirements enforced
  - [ ] Profile creation completes

- [ ] Authentication
  - [ ] Login works
  - [ ] Logout works
  - [ ] Session persists correctly
  - [ ] Password reset works

- [ ] Core Features
  - [ ] Discover page loads users
  - [ ] Swipe actions work
  - [ ] Matches appear correctly
  - [ ] Chat messages send/receive
  - [ ] Voice messages work
  - [ ] GIFs send correctly

- [ ] Premium Features
  - [ ] Payment flow completes
  - [ ] Features unlock correctly
  - [ ] Swipe limits enforced
  - [ ] Premium perks accessible

- [ ] Admin Panel
  - [ ] User moderation works
  - [ ] Photo verification works
  - [ ] Reports visible
  - [ ] Analytics load

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Benchmarks

- [ ] Page load time < 2s (4G)
- [ ] Time to Interactive < 3s
- [ ] First Contentful Paint < 1s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### SEO Verification

- [ ] Sitemap accessible: `https://yourdomain.com/sitemap.xml`
- [ ] Robots.txt correct: `https://yourdomain.com/robots.txt`
- [ ] Meta tags present on all public pages
- [ ] Open Graph images load
- [ ] Structured data validates: https://search.google.com/test/rich-results

---

## 🚀 Go-Live Procedure

### T-24 hours: Final Prep

1. Announce maintenance window to users (if replacing existing site)
2. Take final backup of staging database
3. Run all E2E tests on staging
4. Review analytics dashboards are ready
5. Brief support team on launch

### T-4 hours: Deployment

1. **Deploy to Production**
   ```bash
   git checkout main
   git pull
   vercel --prod
   ```

2. **Verify Environment**
   - Check all environment variables in Vercel dashboard
   - Verify custom domain is connected
   - Test HTTPS certificate

3. **Run Post-Deploy Tests**
   ```bash
   # Smoke tests
   curl https://yourdomain.com/api/health
   curl https://yourdomain.com/sitemap.xml

   # Redis connection
   npx tsx scripts/test-redis.ts --prod

   # Database migration status
   npx prisma migrate status
   ```

4. **Data Migration** (if needed)
   ```bash
   # Encrypt existing production data
   npx tsx scripts/encrypt-existing-data.ts --confirm
   ```

### T-1 hour: Final Checks

- [ ] Homepage loads correctly
- [ ] Registration flow works
- [ ] Login works
- [ ] Payment test (small amount)
- [ ] Monitoring dashboards show data
  - Sentry: No errors
  - Vercel Analytics: Traffic flowing
  - Upstash: Redis commands working

### T-0: Go Live! 🎉

1. **Remove "Under Construction" messages** (if any)
2. **Enable Google Analytics**
3. **Start social media promotion**
4. **Monitor closely for first 24 hours**
   - Check error rates in Sentry
   - Monitor Redis usage in Upstash
   - Watch database performance in Neon
   - Review user signup flow

### T+1 hour: Post-Launch

- [ ] First user registered successfully
- [ ] Payment flow completed (test or real)
- [ ] No critical errors in Sentry
- [ ] Redis rate limiting working
- [ ] All cron jobs running

### T+24 hours: Review

- [ ] Review analytics data
- [ ] Check error rates < 0.1%
- [ ] Verify uptime 99.9%+
- [ ] User feedback collected
- [ ] Performance metrics meet targets

---

## 📞 Emergency Contacts

**Critical Issues During Launch:**

1. **Database Issues**
   - Neon.tech Dashboard: https://console.neon.tech
   - Support: support@neon.tech

2. **Redis Issues**
   - Upstash Dashboard: https://console.upstash.com
   - Support: support@upstash.com

3. **Payment Issues**
   - MultiSafepay Support: support@multisafepay.com
   - Dashboard: https://merchant.multisafepay.com

4. **Hosting Issues**
   - Vercel Dashboard: https://vercel.com/dashboard
   - Support: vercel.com/support

---

## 📈 Post-Launch Monitoring (Week 1)

### Daily Checks

- [ ] Error rate in Sentry < 0.1%
- [ ] Uptime > 99.9%
- [ ] Page load time < 2s average
- [ ] Payment success rate > 95%
- [ ] User registration rate trending up

### Weekly Reviews

- [ ] Security scan (OWASP ZAP)
- [ ] Dependency updates (`npm audit`)
- [ ] Performance audit (Lighthouse)
- [ ] User feedback review
- [ ] Feature usage analytics

---

## ✨ Success Metrics

**Launch is successful when:**

- ✅ Zero critical bugs in first 48 hours
- ✅ 99.9% uptime first week
- ✅ < 0.1% error rate
- ✅ Lighthouse score 90+
- ✅ Payment flow 95%+ success rate
- ✅ User growth 10%+ week-over-week

---

**Last Updated:** December 23, 2025
**Version:** 1.0
**Status:** 78/100 Ready → Target: 85/100 by January 7, 2026
