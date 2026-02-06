# Migration Campaign - Launch Guide

**Status:** ✅ Ready for Production
**Last Critical Step:** Configure Resend Webhook (5 minutes)

---

## 🚀 Launch Checklist

### Step 1: Configure Resend Webhook (CRITICAL)

**Time:** 5 minutes

1. **Login to Resend Dashboard**
   - Go to: https://resend.com/webhooks
   - Login with your account

2. **Create New Webhook**
   - Click "Add Webhook"
   - **URL:** `https://liefdeveoriedereen.nl/api/webhooks/resend`
   - **Events:** Select ALL of these:
     - ✅ `email.delivered`
     - ✅ `email.opened`
     - ✅ `email.clicked`
     - ✅ `email.bounced`
     - ✅ `email.complained`

3. **Get Webhook Secret**
   - After creating, Resend will show: `whsec_xxxxxxxxxxxxx`
   - Copy this secret

4. **Update Environment Variable**
   ```bash
   # Edit .env file
   # Replace the placeholder with your actual secret:
   RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Restart Application**
   ```bash
   # If using Vercel
   vercel --prod

   # If using local dev
   npm run dev
   ```

6. **Test Webhook**
   ```bash
   # Send test email to yourself
   npx tsx scripts/send-test-email.ts your@email.com

   # Open the email in your inbox
   # Click the link

   # Verify database updated (should show openedAt and clickedAt)
   npx tsx scripts/check-migration-status.ts
   ```

**Expected Result:**
- ✅ Email shows `openedAt` timestamp
- ✅ Email shows `clickedAt` timestamp
- ✅ User status updated to `EMAIL_OPENED` or `LINK_CLICKED`

---

### Step 2: A/B Test (Recommended)

**Time:** 48 hours monitoring

Send to small batch first to test A/B variants:

```bash
# Send to 30 VIP users (10 per A/B/C variant)
npx tsx scripts/migration-batch-send.ts VIP 30
```

**Monitor for 48h:**
- Visit dashboard: `/admin/migration/dashboard`
- Check which subject line has highest open rate
- Check which variant has highest click rate

**Winning variant will be:**
- Subject line with >30% open rate
- Variant with >5% click rate

---

### Step 3: Gradual Launch

**Day 1: VIP Segment**
```bash
npx tsx scripts/migration-batch-send.ts VIP 66
```
- Monitor: Dashboard every 4 hours
- Expected: 40% conversion (26 claims)
- Wait: 24h before next segment

**Day 2: GOLD Segment**
```bash
npx tsx scripts/migration-batch-send.ts GOLD 75
```
- Expected: 35% conversion (26 claims)
- Wait: 24h

**Day 3: ACTIVE Segment**
```bash
npx tsx scripts/migration-batch-send.ts ACTIVE 73
```
- Expected: 25% conversion (18 claims)
- Wait: 24h

**Day 4: DORMANT Segment**
```bash
npx tsx scripts/migration-batch-send.ts DORMANT 166
```
- Expected: 12% conversion (20 claims)
- Wait: 24h

**Day 5: INACTIVE Segment**
```bash
npx tsx scripts/migration-batch-send.ts INACTIVE 52
```
- Expected: 10% conversion (5 claims)

---

### Step 4: Enable Automation

**Setup Daily Automation:**

**Option A: Vercel Cron**
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/migration-automation",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Create `app/api/cron/migration-automation/route.ts`:
```typescript
import { runDailyAutomation } from '@/lib/migration/automation'

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await runDailyAutomation()
  return Response.json({ success: true })
}
```

**Option B: Manual Daily Run**
```bash
# Run every morning at 10:00 AM
npx tsx scripts/run-automation.ts
```

---

### Step 5: Daily Monitoring

**Every Morning (5 minutes):**

1. **Check Dashboard**
   - Visit: `/admin/migration/dashboard`
   - Review conversion rates
   - Check for alerts

2. **Run Health Check**
   ```bash
   npx tsx scripts/migration-health-check.ts
   ```
   - Fix any CRITICAL alerts immediately
   - Note WARNING alerts for investigation

3. **Review Automation**
   ```bash
   # Dry run to see who will get emails
   npx tsx scripts/test-automation-dry-run.ts

   # If looks good, run actual automation
   npx tsx scripts/run-automation.ts
   ```

---

## 📊 Success Metrics

### Week 1 Targets

| Metric | Target | How to Check |
|--------|--------|--------------|
| Email Open Rate | >25% | Dashboard → Email Metrics |
| Email Click Rate | >5% | Dashboard → Email Metrics |
| VIP Conversion | >30% | Dashboard → Segment Performance |
| GOLD Conversion | >25% | Dashboard → Segment Performance |
| Landing→Claim | >90% | Dashboard → Funnel Chart |

### Month 1 Targets

| Metric | Current | Target | Check |
|--------|---------|--------|-------|
| Total Claims | 52 | 107 | Dashboard → Overview |
| Overall Conversion | 1.2% | 20% | Dashboard → Overview |
| MRR Impact | €675 | €1,390 | Dashboard → Revenue |

---

## 🚨 Troubleshooting

### Problem: Webhook not firing

**Symptoms:**
- Email sent but `openedAt` is NULL
- Open rate shows 0% in dashboard

**Fix:**
1. Check Resend webhook logs: https://resend.com/webhooks
2. Verify webhook URL is correct: `https://liefdeveoriedereen.nl/api/webhooks/resend`
3. Check webhook secret matches `.env`
4. Test webhook manually in Resend dashboard

### Problem: Emails not opening

**Symptoms:**
- Sent but not delivered
- High bounce rate

**Fix:**
1. Check DNS records (SPF, DKIM, DMARC)
2. Verify sender domain: `noreply@liefdeveoriedereen.nl`
3. Check spam folder
4. Review Resend deliverability logs

### Problem: Low conversion rate

**Symptoms:**
- <10% conversion after week 1

**Fix:**
1. Check A/B test results - switch to winning variant
2. Increase incentives (add 1-2 months premium)
3. Add urgency to subject lines
4. Send more follow-ups (increase automation frequency)
5. Try SMS for VIP users

### Problem: Dashboard slow

**Symptoms:**
- >2 seconds to load

**Fix:**
1. Check Redis cache working: `redis-cli PING`
2. Verify cache TTL is 60s
3. Check database connection pool
4. Review query performance in logs

---

## 📈 Optimization Playbook

### If Open Rate <20% (Week 1)

**Actions:**
- Test new subject lines (more urgency)
- Send at different times (9 AM vs 7 PM)
- Segment by activity level
- Check spam folder placement

### If Click Rate <3% (Week 1)

**Actions:**
- Make CTA button larger/more prominent
- Add more urgency to email body
- Include countdown timer
- Add social proof testimonials

### If Landing→Claim <85%

**Actions:**
- Simplify landing page (remove steps)
- Add trust indicators
- Show real-time claims counter
- Add live chat support

### If Premium Activation <100%

**Actions:**
- Run fix script: `npx tsx scripts/fix-missing-premium.ts`
- Check logs for errors
- Verify subscription creation logic
- Contact affected users

---

## 🎯 Expected Timeline

### Today (Day 0)
- ✅ Configure webhook (5 min)
- ✅ Test webhook (5 min)
- ✅ Send test email (2 min)

### Tomorrow (Day 1)
- Send A/B test to 30 VIP users
- Monitor for 24h

### Day 2-6
- Gradual launch (1 segment per day)
- Daily monitoring
- Enable automation

### Week 2
- All segments contacted
- Automation running daily
- Optimize based on results

### Month 1
- Target: 107 claims (106% improvement)
- Revenue: €1,390 MRR (+€715)

---

## 🎉 Launch Day Message

When ready to launch, announce in team:

```
🚀 Migration Campaign LIVE!

We've launched our world-class migration campaign with:
- 8 professional email templates
- Real-time analytics dashboard
- Smart behavior-triggered follow-ups
- A/B tested subject lines

Target: 20% conversion (vs 1.2% current)
Expected: +€715/month MRR

Dashboard: /admin/migration/dashboard

Let's bring our users home! 💕
```

---

## Support

If issues arise:
1. Check `TEST_REPORT.md` for test results
2. Review `PHASE_2_COMPLETE.md` for implementation details
3. Check logs: `npx tsx scripts/migration-health-check.ts`
4. Contact development team

---

**Ready to launch?** Follow Step 1 above! 🚀
