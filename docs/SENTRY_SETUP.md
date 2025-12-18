# Sentry Setup Guide

## 🎯 Waarom Sentry?

Sentry is **essentieel** voor productie:
- ⚠️ Real-time error tracking
- 📊 Performance monitoring
- 🔍 Session replay (zie wat gebruikers deden)
- 📈 Release tracking
- 🚨 Instant alerts via email/Slack/Discord

**Zonder Sentry = blind vliegen in productie!**

---

## 🚀 Quick Setup (15 minuten)

### Step 1: Create Sentry Account

1. Ga naar [sentry.io](https://sentry.io/signup/)
2. Sign up (gratis voor 5K errors/maand)
3. Create new project:
   - Platform: **Next.js**
   - Alert frequency: **On every new issue**
   - Project name: `liefde-voor-iedereen`

### Step 2: Get Your DSN

Na project creation zie je:
```
DSN: https://abc123def456@o123456.ingest.sentry.io/123456
```

**Kopieer deze DSN!**

### Step 3: Add to Environment Variables

#### Development (.env.local)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/123456
```

#### Production (Vercel Dashboard)
```
Settings → Environment Variables → Add:

Name: NEXT_PUBLIC_SENTRY_DSN
Value: https://abc123def456@o123456.ingest.sentry.io/123456
Scope: Production, Preview, Development
```

### Step 4: Deploy & Verify

```bash
# Build locally to test
npm run build

# Check for Sentry initialization logs
npm start
```

Bezoek je app en Sentry Dashboard - je zou events moeten zien!

---

## 🧪 Testing Sentry

### Test Error Tracking

Create test endpoint:

```typescript
// app/api/sentry-test/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('🧪 Sentry Test Error - This is intentional!')
}
```

Visit: `http://localhost:3000/api/sentry-test`

Check Sentry Dashboard → **Issues** → You should see the error!

### Test Client-Side Error

```typescript
// Add button to any page
<button onClick={() => {
  throw new Error('🧪 Client-side Sentry test')
}}>
  Test Sentry
</button>
```

---

## ⚙️ Configuration

### Files Created

```
sentry.client.config.ts    # Browser error tracking
sentry.server.config.ts    # API/Server error tracking
sentry.edge.config.ts      # Edge runtime tracking
instrumentation.ts         # Early initialization
next.config.mjs            # Webpack integration
```

### What's Tracked?

✅ **Automatically tracked:**
- Uncaught exceptions
- Unhandled promise rejections
- API errors
- Network errors
- Build errors
- Performance issues

✅ **Sensitive data filtered:**
- Passwords removed
- Email addresses masked
- Auth tokens removed
- Database credentials sanitized

---

## 📊 Features Enabled

### 1. Error Tracking
```typescript
// Errors are automatically captured!
try {
  await riskyOperation()
} catch (error) {
  // Automatically sent to Sentry
  throw error
}
```

### 2. Performance Monitoring
```typescript
// API response times tracked
// Page load times tracked
// Database query times tracked

Sample Rate: 10% in production
```

### 3. Session Replay
```typescript
// 10% of sessions recorded
// 100% of error sessions recorded

You can SEE what users did before crash!
```

### 4. Breadcrumbs
```typescript
// Automatic breadcrumbs:
- Navigation (page changes)
- Console logs
- Network requests
- User interactions
- State changes
```

---

## 🚨 Alerting

### Email Alerts (Default)
- Krijg email bij elk nieuw error type
- Daily/weekly digest voor recurring errors

### Slack Integration
1. Sentry Dashboard → **Settings** → **Integrations**
2. Search "Slack" → **Install**
3. Authorize Slack workspace
4. Set alert rules:
   - New issues → #alerts channel
   - Spike in errors → #critical channel

### Discord Webhook
1. Discord → Server Settings → Integrations → Webhooks
2. Create webhook → Copy URL
3. Sentry → Settings → Integrations → Webhooks
4. Add webhook URL
5. Set alert rules

---

## 📈 Monitoring

### Sentry Dashboard

**Issues Tab:**
- See all errors grouped
- Frequency, users affected
- Stack traces with source maps

**Performance Tab:**
- Slow API endpoints
- Slow page loads
- Database query times
- External API calls

**Releases Tab:**
- Track errors by deployment
- Compare error rates between versions
- Identify regressions

---

## 🎯 Best Practices

### 1. Tag Errors with Context
```typescript
import * as Sentry from '@sentry/nextjs'

// Add user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Add custom tags
Sentry.setTag('feature', 'payment')
Sentry.setTag('plan', 'premium')

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'subscription',
  message: 'User upgraded to premium',
  level: 'info',
})
```

### 2. Handle Expected Errors Gracefully
```typescript
try {
  await payment.process()
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Don't send to Sentry - this is expected
    return { error: 'Insufficient funds' }
  }

  // Unexpected error - send to Sentry
  Sentry.captureException(error)
  throw error
}
```

### 3. Ignore Noisy Errors
```typescript
// In sentry.*.config.ts
ignoreErrors: [
  'Failed to fetch', // Network errors
  'ResizeObserver loop',  // Browser quirks
  'Non-Error promise rejection', // Not real errors
]
```

### 4. Use Releases
```bash
# In CI/CD, tag releases
SENTRY_RELEASE=$(git rev-parse HEAD)

# Sentry will track which errors belong to which release
```

---

## 📊 Metrics to Monitor

### Daily (Critical)
- ⚠️ New error types
- 📈 Error spike alerts
- 🔥 High-frequency errors

### Weekly
- 📊 Total error count trend
- 👥 Users affected
- 🚀 Performance regressions
- 📱 Browser/device breakdown

### Monthly
- 🎯 Error resolution rate
- 📉 Overall stability trend
- 💰 Plan usage (approaching limits?)

---

## 🔧 Troubleshooting

### "Sentry not capturing errors"

**Check:**
1. DSN is set correctly (with `NEXT_PUBLIC_` prefix!)
2. Build succeeded without errors
3. Check browser console for Sentry logs
4. Verify `sentry.*.config.ts` files exist

### "Source maps not uploading"

**Fix:**
```bash
# Install Sentry CLI
npm install -D @sentry/cli

# Set auth token in .env
SENTRY_AUTH_TOKEN=your_auth_token_here

# Rebuild
npm run build
```

### "Too many events (quota exceeded)"

**Options:**
1. Increase sample rate filters
2. Upgrade Sentry plan
3. Ignore more error types
4. Fix the bugs! 😅

---

## 💰 Pricing

### Free Tier (Perfect for starting!)
- 5,000 errors/month
- 10,000 performance events/month
- 500 replays/month
- 30 days retention

### Team ($26/month)
- 50K errors/month
- 100K performance events/month
- 5K replays/month
- 90 days retention

**Start free, upgrade when needed!**

---

## 🎓 Next Steps

1. ✅ Setup Sentry (you're here!)
2. ⏳ Test error tracking
3. ⏳ Configure Slack alerts
4. ⏳ Set up release tracking
5. ⏳ Review errors weekly

**Sentry = Peace of mind in production!** 😴

---

**Setup Status:**
- ✅ Sentry SDK installed
- ✅ Configuration files created
- ✅ CSP updated
- ✅ Next.js integration complete
- ⏳ DSN needs to be added to environment variables

**Next:** Add your DSN to `.env.local` and deploy!
