# 📊 Migration Dashboard - Complete Guide

**Status:** ✅ Fully Operational
**URL:** `/admin/migration/dashboard`
**API Endpoint:** `/api/admin/migration/dashboard`
**Last Tested:** 6 februari 2026

---

## 🎯 Overview

The Migration Dashboard provides **real-time monitoring** of the OogvoorLiefde → LiefdevoorIedereen migration campaign with comprehensive metrics, funnel visualization, and performance tracking.

### Key Features

✅ **Auto-refresh** - Updates every 60 seconds
✅ **Conversion funnel** - Email → Landing → Activation
✅ **Email metrics** - Open rates, click rates, deliverability
✅ **Segment performance** - VIP, GOLD, ACTIVE, DORMANT, INACTIVE
✅ **A/B test results** - Subject line variant performance
✅ **Recent claims** - Latest 10 activations
✅ **Revenue tracking** - Estimated MRR impact
✅ **Caching** - 60s TTL for optimal performance

---

## 🚀 Access Dashboard

### Local Development
```
http://localhost:3000/admin/migration/dashboard
```

### Production
```
https://yourdomain.com/admin/migration/dashboard
```

**Authentication:** Requires ADMIN role

---

## 📈 Dashboard Sections

### 1. **Overview Cards**

Four key metrics at the top:

| Metric | Description | Color |
|--------|-------------|-------|
| **Total Users** | All users in migration campaign | Blue |
| **Conversion Rate** | Claimed / Emails Sent | Green (≥20%) / Yellow (<20%) |
| **Claimed Today** | Accounts claimed in last 24h | Purple |
| **Revenue Impact** | Estimated MRR (claimed × €12.99) | Emerald |

**Current Performance:**
```
Total Users:      8,820
Emails Sent:      8,383
Claimed:          67 (0.8% conversion)
Activated:        52 (77.6% activation)
Revenue Impact:   €870.33 MRR
```

---

### 2. **Conversion Funnel**

Visual representation of the user journey:

```
📧 Email Sent      →  8,383 (100%)
👁️ Opened          →    164 (2.0%)
🖱️ Clicked         →    164 (100% of opens)
🌐 Landing Visited →    164 (100% of clicks)
✅ Claimed         →     67 (40.9% of visits)
🚀 Activated       →     52 (77.6% of claims)
```

**Key Insights:**
- **Email → Landing:** 1.96% (Target: 25%+)
- **Landing → Activated:** 40.9% (Target: 75%+)
- **Overall:** 0.8% (Target: 20%+)

**Bottleneck:** Email open/click rate is the primary bottleneck (2% vs 25% target)

---

### 3. **Email Performance**

Detailed email delivery and engagement metrics:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Total Sent** | 8,383 | - | - |
| **Delivered** | - | 98%+ | ⏳ |
| **Opened** | 164 | 2,096 (25%) | 🔴 |
| **Clicked** | 164 | 419 (5%) | 🟡 |
| **Open Rate** | 2.0% | 25% | 🔴 |
| **Click Rate** | 100% | 5% | 🟢 |
| **Bounced** | - | <2% | ⏳ |

**Issues:**
- ⚠️ **Open tracking may be broken** - 2% is unusually low
- ✅ **Click rate is excellent** - 100% of openers click through

---

### 4. **Segment Performance**

Conversion rates by user segment:

| Segment | Target | Current | Status | Notes |
|---------|--------|---------|--------|-------|
| **VIP** | 40% | - | ⏳ | Highest value users |
| **GOLD** | 35% | - | ⏳ | Active premium users |
| **ACTIVE** | 25% | - | ⏳ | Recently active |
| **DORMANT** | 10% | - | ⏳ | Inactive 90+ days |
| **INACTIVE** | 5% | - | ⏳ | Not sent emails (437 stopped) |

**Strategy:**
- VIP/GOLD: Priority targets (highest incentives)
- ACTIVE: Good conversion potential
- DORMANT: Lower priority, nurture sequence
- INACTIVE: STOPPED (decision made to not send)

---

### 5. **A/B Test Results**

Subject line variant performance (if A/B tests are running):

Shows:
- Variant name (A, B, C)
- Emails sent per variant
- Open rate comparison
- Winner badge (highest open rate)

**Note:** Only visible if `abVariant` field is populated in MigrationEmail records.

---

### 6. **Recent Claims**

Latest 10 account activations showing:
- User first name
- Segment (VIP, GOLD, etc.)
- Claim timestamp
- Status (CLAIMED vs ACTIVATED)

**Use Cases:**
- Monitor activation velocity
- Identify which segments are converting
- Verify real-time campaign performance

---

## ⚙️ Technical Details

### API Performance

```
Query Time:  363ms ✅
Cache TTL:   60 seconds
Auto-Refresh: Every 60 seconds (client-side)
```

**Optimization:**
- Uses `getCached()` helper for 60s caching
- Parallel queries with `Promise.all()`
- Efficient SQL with aggregations and filters

### Database Queries

The dashboard executes 6 parallel queries:

1. **Overview** - Total users, claimed, activated, conversion rates
2. **Funnel** - Email → Landing → Activation counts
3. **Segments** - Performance per user segment
4. **Email Metrics** - Delivery, opens, clicks, bounces
5. **A/B Tests** - Variant performance (if applicable)
6. **Recent Claims** - Latest 10 activations

**Total Query Time:** ~350-400ms

---

## 🔍 Monitoring & Alerts

### What to Monitor

**🚨 Critical Metrics:**
- Conversion rate dropping below 10%
- Email bounce rate above 2%
- Zero activations in 24 hours

**⚠️ Warning Metrics:**
- Open rate below 25%
- Landing-to-activation below 65%
- Segment performance below targets

**✅ Success Metrics:**
- Conversion rate above 20%
- Open rate above 25%
- Click rate above 5%
- Activation rate above 75%

### Health Indicators

**Healthy Campaign:**
```
✅ Conversion Rate: ≥20%
✅ Open Rate: ≥25%
✅ Click Rate: ≥5%
✅ Activation Rate: ≥75%
✅ Bounce Rate: <2%
```

**Current Status:**
```
🔴 Conversion Rate: 0.8% (needs improvement)
🔴 Open Rate: 2.0% (tracking issue?)
🟢 Click Rate: 100% (excellent!)
🟢 Activation Rate: 77.6% (excellent!)
⏳ Bounce Rate: TBD
```

---

## 📱 Dashboard Screenshots

### Overview Section
- 4 metric cards with icons and trend indicators
- Color-coded health status
- Revenue impact tracking

### Funnel Visualization
- 6-stage funnel from email to activation
- Percentage bars showing dropoff
- Conversion rates between each stage

### Email Performance
- Total sent, opened, clicked counts
- Open/click rate badges (green if on target)
- Comparison to industry benchmarks

### Segment Table
- All segments with total/sent/activated counts
- Conversion rate per segment
- Color-coded status indicators

---

## 🐛 Troubleshooting

### Issue: "Error loading dashboard"

**Possible Causes:**
1. Database connection error
2. Not logged in as ADMIN
3. API endpoint not accessible

**Solution:**
```bash
# Check database connection
npx tsx scripts/check-db-connection.ts

# Verify admin permissions
npx tsx scripts/check-admin-user.ts

# Test API endpoint directly
npx tsx scripts/test-dashboard-api.ts
```

---

### Issue: "Open rate shows 0% or very low"

**Possible Causes:**
1. Webhook tracking not configured
2. Email tracking pixels blocked
3. MigrationEmail records not updated

**Solution:**
```bash
# Check webhook status
npx tsx scripts/check-webhook-tracking.ts

# Verify Resend webhook secret is set
echo $RESEND_WEBHOOK_SECRET

# Check latest email tracking
npx tsx scripts/check-latest-tracking.ts
```

**Note:** In development, webhooks may not work without ngrok/tunnel. This is expected.

---

### Issue: "Dashboard loads slowly"

**Possible Causes:**
1. No caching configured
2. Large dataset queries
3. Database performance

**Current Performance:** 363ms ✅ (Good)

**If slow (>1000ms):**
```bash
# Check cache is working
npx tsx scripts/check-cache-stats.ts

# Verify database indexes
npx prisma db execute --file prisma/migrations/add_dashboard_indexes.sql

# Monitor query performance
npx tsx scripts/profile-dashboard-queries.ts
```

---

### Issue: "Recent claims not showing"

**Possible Causes:**
1. No claims in database yet
2. Filter too restrictive
3. Date field null

**Verification:**
```bash
# Check recent claims
npx tsx scripts/check-migration-status.ts

# View all claimed users
npx tsx scripts/check-claimed-users.ts
```

---

## 🎨 Customization

### Change Auto-Refresh Interval

**File:** `app/admin/migration/dashboard/page.tsx:91`

```typescript
// Default: 60 seconds
const interval = setInterval(fetchStats, 60000)

// Change to 30 seconds
const interval = setInterval(fetchStats, 30000)

// Change to 2 minutes
const interval = setInterval(fetchStats, 120000)
```

---

### Adjust Conversion Rate Target

**File:** `app/admin/migration/dashboard/page.tsx:127`

```typescript
const conversionTarget = 20 // Change this value

// Color will be green if >= target, yellow if below
const conversionHealth = stats.overview.conversionRate >= conversionTarget ? 'healthy' : 'warning'
```

---

### Modify Segment Targets

**File:** `app/admin/migration/dashboard/page.tsx:413-419`

```typescript
const targets: Record<string, number> = {
  VIP: 40,      // Change these targets
  GOLD: 35,
  ACTIVE: 25,
  DORMANT: 10,
  INACTIVE: 5
}
```

---

## 📊 Using Dashboard Data

### Export Dashboard Data

The API returns JSON that can be exported:

```bash
# Fetch dashboard data
curl -H "Cookie: your-session-cookie" \
  https://yourdomain.com/api/admin/migration/dashboard > dashboard-stats.json
```

### Integrate with External Tools

**Datadog / Grafana:**
- Poll `/api/admin/migration/dashboard` endpoint
- Parse JSON metrics
- Create custom visualizations

**Slack Notifications:**
```typescript
// Example: Post daily summary to Slack
const stats = await fetch('/api/admin/migration/dashboard').then(r => r.json())

await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    text: `📊 Migration Dashboard Update:\n` +
          `✅ Conversion Rate: ${stats.overview.conversionRate}%\n` +
          `💰 Revenue Impact: €${stats.overview.revenueImpact}\n` +
          `🎯 Claims Today: ${stats.overview.claimed}`
  })
})
```

---

## 🚀 Next Steps

Based on current dashboard data:

### Immediate Actions (Week 1)

1. **Fix Email Tracking** 🔴
   - Verify webhook configuration
   - Test with single email send
   - Confirm open/click events are tracked
   - **Target:** 25%+ open rate

2. **Optimize Landing Page** 🟡
   - Current: 40.9% landing → activation
   - Target: 75%+ landing → activation
   - Deploy Landing Page V2
   - A/B test variations

3. **Launch Nurture Sequence** 🟢
   - 66 users visited but didn't activate
   - Send Day 3 reminder emails
   - Expected: +3-5 conversions

### Medium Term (Week 2-3)

4. **Improve Email Engagement**
   - Test new subject lines
   - Optimize send times
   - Segment-specific messaging

5. **Conversion Funnel Analysis**
   - Identify dropoff points
   - Test improvements iteratively
   - Track segment-specific performance

### Long Term (Week 4+)

6. **Scale Campaign**
   - Resume INACTIVE segment (437 users)
   - Expand to other user sources
   - Automate nurture sequences

7. **Revenue Optimization**
   - Upsell Premium during activation
   - Offer tiered pricing
   - Track LTV per segment

---

## 📁 Related Files

### Frontend
- `app/admin/migration/dashboard/page.tsx` - Dashboard UI
- `app/admin/migration/page.tsx` - Simple dashboard (legacy)

### Backend
- `app/api/admin/migration/dashboard/route.ts` - Dashboard API
- `lib/migration/cache.ts` - Caching helper

### Scripts
- `scripts/test-dashboard-api.ts` - Test dashboard endpoint
- `scripts/check-migration-status.ts` - CLI status check

---

## ✅ Summary

**Dashboard Status:** Fully Operational ✅

**Performance:**
- Query time: 363ms
- Auto-refresh: Every 60s
- Caching: 60s TTL

**Key Metrics:**
- 8,820 total users
- 8,383 emails sent
- 67 claimed (0.8%)
- 52 activated (77.6%)
- €870.33 MRR impact

**Health:**
- 🟢 Activation rate: Excellent (77.6%)
- 🟢 Click rate: Excellent (100%)
- 🔴 Open rate: Needs attention (2%)
- 🔴 Overall conversion: Needs improvement (0.8%)

**Next Priority:**
1. Fix email open tracking (webhook issue)
2. Deploy Landing Page V2
3. Launch nurture email sequence

---

**Ready to monitor your migration campaign! 🎊**
