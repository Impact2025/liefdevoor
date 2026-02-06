# Migration Campaign System - Setup Guide

## Phase 1 Implementation Complete ✅

This guide helps you set up the world-class migration campaign system with real-time email tracking, automated premium activation, and comprehensive analytics.

---

## What's Been Implemented

### ✅ Phase 1: Critical Fixes & Foundation

1. **Resend Webhook Integration** - Real-time email tracking
2. **Coupon Auto-Redemption** - Automatic premium + credits activation
3. **Enhanced Incentives** - Increased rewards for active segments
4. **A/B Testing Framework** - Subject line optimization
5. **Alert System** - Automated health monitoring
6. **Cache Management** - Fast dashboard performance

---

## Setup Instructions

### 1. Database Migration

Run the Prisma migration to add monitoring tables:

```bash
npx prisma db push
```

This adds:
- `MigrationAlert` - Campaign health alerts
- `MigrationError` - Error tracking
- Index on `MigrationEmail.resendId` for webhook lookups

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Resend Webhooks (CRITICAL!)
RESEND_WEBHOOK_SECRET=whsec_your_secret_here

# Admin Alerts
ADMIN_EMAIL=your-email@liefdevooriedereen.nl

# Feature Flags
ENABLE_AB_TESTING=true
ENABLE_AUTO_FOLLOWUP=true
```

### 3. Configure Resend Webhooks

**CRITICAL STEP** - Without this, email tracking won't work!

1. Go to [Resend Dashboard > Webhooks](https://resend.com/webhooks)
2. Click **"Create Webhook"**
3. Set webhook URL:
   ```
   https://liefdevooriedereen.nl/api/webhooks/resend
   ```
4. Select these events:
   - ✅ `email.delivered`
   - ✅ `email.opened`
   - ✅ `email.clicked`
   - ✅ `email.bounced`
   - ✅ `email.complained`

5. Copy the webhook secret (starts with `whsec_`)
6. Add to `.env` as `RESEND_WEBHOOK_SECRET`

### 4. Test the Webhook

Send a test email to verify webhook integration:

```bash
npx tsx scripts/migration-batch-send.ts VIP 1
```

Then:
1. Open the email
2. Click a link
3. Check database:
   ```sql
   SELECT "openedAt", "clickedAt", "openCount", "clickCount"
   FROM "MigrationEmail"
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```

You should see timestamps populated!

---

## New Features Explained

### 🎯 A/B Testing

Subject lines are automatically tested with 3 variants per segment:

```typescript
// Example for VIP segment
A: "🎁 {{firstName}}, je 6 maanden gratis Premium wacht!"
B: "{{firstName}}, we missen je - Speciale comeback aanbieding"
C: "Je OogvoorLiefde account + 6 maanden Premium → Claim nu!"
```

Track results via dashboard API:
```bash
curl http://localhost:3000/api/admin/migration/dashboard
```

### 🚨 Automated Alerts

The system monitors:
- **Conversion Rate** - Alerts if < 5%
- **Email Open Rate** - Alerts if < 15%
- **Premium Activation** - Detects failed activations
- **Webhook Health** - Alerts if no webhooks for 1 hour
- **Segment Performance** - Alerts if below 50% of target

Run health check manually:
```bash
npx tsx -e "import { checkMigrationHealth } from './lib/migration/alerts'; checkMigrationHealth().then(console.log)"
```

### 💰 Enhanced Incentives

New incentive structure (designed for 20-40% conversion):

| Segment  | Premium Months | SuperMessages | Previous |
|----------|----------------|---------------|----------|
| VIP      | 6 months       | 20 credits    | 3, 10    |
| GOLD     | 4 months       | 15 credits    | 2, 5     |
| ACTIVE   | 3 months       | 10 credits    | 1, 3     |
| DORMANT  | 2 months       | 10 credits    | 1, 5     |
| INACTIVE | 1 month        | 3 credits     | same     |

### ⚡ Automatic Premium Activation

When users claim their account:
1. ✅ User tier set to PREMIUM
2. ✅ SuperMessages credits added
3. ✅ Subscription record created
4. ✅ Coupon marked as redeemed
5. ✅ Status changed to ACTIVATED

No manual intervention needed!

---

## Testing Checklist

### Phase 1 Tests

- [ ] **Webhook Integration**
  ```bash
  # 1. Send test email
  npx tsx scripts/migration-batch-send.ts VIP 1

  # 2. Open the email
  # 3. Click a link

  # 4. Verify tracking
  SELECT * FROM "MigrationEmail"
  WHERE "openedAt" IS NOT NULL
  ORDER BY "createdAt" DESC LIMIT 1;
  ```

- [ ] **Premium Activation**
  ```bash
  # After a user claims their account, verify:
  SELECT u."subscriptionTier", u.credits, s."endDate", mu.status, mu."couponRedeemedAt"
  FROM "User" u
  JOIN "MigrationUser" mu ON u.id = mu."newUserId"
  LEFT JOIN "Subscription" s ON u.id = s."userId"
  WHERE mu.status = 'ACTIVATED'
  ORDER BY mu."claimedAt" DESC
  LIMIT 1;

  # Expected:
  # - subscriptionTier = 'PREMIUM'
  # - credits > 0 (10-20 depending on segment)
  # - subscription with endDate
  # - status = 'ACTIVATED'
  # - couponRedeemedAt not null
  ```

- [ ] **A/B Testing**
  ```sql
  # Check variant distribution
  SELECT "abVariant", COUNT(*)
  FROM "MigrationEmail"
  WHERE "emailType" = 'WELCOME'
  GROUP BY "abVariant";

  # Should be roughly equal A/B/C split
  ```

- [ ] **Alert System**
  ```bash
  # Run health check
  npx tsx scripts/check-migration-health.ts

  # Should output current health status
  # Check alerts table
  SELECT * FROM "MigrationAlert"
  ORDER BY "createdAt" DESC LIMIT 10;
  ```

- [ ] **Dashboard API**
  ```bash
  # Get stats (requires admin auth)
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:3000/api/admin/migration/dashboard

  # Should return JSON with overview, funnel, segments, etc.
  ```

---

## Expected Results

### Conversion Rate Targets

| Segment  | Current | Target | Notes |
|----------|---------|--------|-------|
| VIP      | 18.8%   | 40%    | Most engaged users |
| GOLD     | 10.6%   | 35%    | Premium members |
| ACTIVE   | 4.1%    | 25%    | Recent activity |
| DORMANT  | 1.2%    | 10%    | Long dormant |
| INACTIVE | 0.6%    | 5%     | Very old users |

### Email Performance Targets

- **Open Rate:** 25% (was 0%)
- **Click Rate:** 5% (was 0%)
- **Landing→Claim:** 90% (currently 89.7%)
- **Premium Activation:** 100% (was ~94%)

---

## Monitoring & Maintenance

### Daily Checks (First Week)

1. **Check webhook health**
   ```sql
   SELECT MAX("openedAt") as last_webhook
   FROM "MigrationEmail";
   -- Should be recent (< 1 hour if emails sent)
   ```

2. **Check conversion rates**
   ```sql
   SELECT
     segment,
     COUNT(*) as total,
     COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as claimed,
     ROUND(COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED'))::numeric / COUNT(*) * 100, 1) as conversion_rate
   FROM "MigrationUser"
   WHERE status != 'PENDING'
   GROUP BY segment;
   ```

3. **Check alerts**
   ```sql
   SELECT * FROM "MigrationAlert"
   WHERE "resolvedAt" IS NULL
   ORDER BY "createdAt" DESC;
   ```

### Weekly Reviews

- Review A/B test results
- Optimize subject lines for winning variants
- Adjust incentives if needed
- Review error logs

---

## Troubleshooting

### Webhooks Not Working

**Symptoms:** `openedAt` and `clickedAt` always NULL

**Fix:**
1. Check Resend dashboard > Webhooks
2. Verify webhook URL is correct
3. Check webhook secret in `.env`
4. Test webhook manually:
   ```bash
   curl -X POST https://liefdevooriedereen.nl/api/webhooks/resend \
     -H "Content-Type: application/json" \
     -d '{"type": "email.opened", "data": {"email_id": "test"}}'
   ```

### Premium Not Applied

**Symptoms:** Users claimed but no premium

**Fix:**
```bash
# Run the fix script
npx tsx scripts/fix-missing-premium.ts

# Or manually for one user
npx tsx -e "
import { prisma } from './lib/prisma';
const mu = await prisma.migrationUser.findUnique({ where: { id: 'USER_ID' }, include: { newUserId: true } });
// Then call applyMigrationPremium(mu.newUserId, mu.segment)
"
```

### Low Conversion Rate

**Actions:**
1. Check email deliverability (spam folder?)
2. Review subject line variants
3. Increase incentives for underperforming segments
4. Send reminder emails
5. Check landing page functionality

---

## Next Steps: Phase 2

Once Phase 1 is stable, implement:

1. **Enhanced Email Templates** - More personalization
2. **Behavior-Triggered Follow-ups** - Smart automation
3. **Admin Dashboard UI** - React dashboard
4. **SMS Integration** - For VIP non-openers

See `MIGRATIE_WERELDKLASSE_UPGRADE.md` for full roadmap.

---

## Support

For issues or questions:
- Check logs: `tail -f logs/migration.log`
- Review alerts: `SELECT * FROM "MigrationAlert"`
- Contact: admin@liefdevooriedereen.nl
