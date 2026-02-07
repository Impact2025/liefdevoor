# 🤖 Campaign Automation Setup

**Automatische monitoring en nurture emails voor de komende 10 dagen**

---

## 📋 Overview

Twee nieuwe automation scripts gemaakt:

1. **`daily-health-check.ts`** - Complete status overview (run 3x per dag)
2. **`auto-nurture-sender.ts`** - Automated nurture emails (run 1x per dag)

---

## 🏥 Daily Health Check

**Complete campaign status in één commando!**

### Gebruik

```bash
# Run manually
npx tsx scripts/daily-health-check.ts
```

### Wat het doet

✅ **Campaign Overview** - Total users, emails sent, conversions
✅ **Today vs Yesterday** - Daily progress comparison
✅ **Nurture Status** - Who's ready for Day 3/7/10 emails
✅ **Health Alerts** - Automatic issue detection
✅ **Quick Actions** - Next steps en commands

### Output Example

```
╔══════════════════════════════════════════════════════════╗
║     MIGRATION CAMPAIGN - DAILY HEALTH CHECK              ║
╚══════════════════════════════════════════════════════════╝

📅 donderdag 6 februari 2026
⏰ 09:00:00

📊 CAMPAIGN OVERVIEW
────────────────────────────────────────────────────────────
Total Users:       8,820
Emails Sent:       8,383 (95.0%)
Claimed:           67
Activated:         52
Conversion Rate:   0.8% 🔴

📈 TODAY
────────────────────────────────────────────────────────────
Emails Sent:       0
Claimed:           2 🎉
Activated:         1 ✅

📧 NURTURE SEQUENCE
────────────────────────────────────────────────────────────
Ready for Day 3:   15 users 🔔
Ready for Day 7:   8 users 🔔
Ready for Day 10:  3 users 🔔

   💡 Action: Run "npx tsx scripts/send-nurture-sequence.ts --day=3 --live"

🏥 HEALTH STATUS
────────────────────────────────────────────────────────────
Status:            ✅ HEALTHY
Issues Detected:   0

⚡ QUICK ACTIONS
────────────────────────────────────────────────────────────
View Dashboard:        /admin/migration/dashboard
Full Status:           npx tsx scripts/check-migration-status.ts
Send Nurture Emails:   npx tsx scripts/send-nurture-sequence.ts --day=X --live

════════════════════════════════════════════════════════════
✅ Campaign is healthy and converting! Keep monitoring.
════════════════════════════════════════════════════════════
```

### Aanbevolen Schedule

Run **3x per dag**:
- **09:00** - Morning check (overnight activity)
- **15:00** - Afternoon check (midday progress)
- **21:00** - Evening check (end of day summary)

---

## 📧 Auto Nurture Sender

**Automatically send nurture emails when users reach day thresholds!**

### Gebruik

```bash
# Dry run (test mode)
npx tsx scripts/auto-nurture-sender.ts

# Live mode (send emails)
npx tsx scripts/auto-nurture-sender.ts --live

# Custom limit
npx tsx scripts/auto-nurture-sender.ts --live --limit=50
```

### Wat het doet

✅ Checks for users at Day 3, 7, 10 thresholds
✅ Sends appropriate nurture email automatically
✅ Updates database records
✅ Rate limiting (2 emails/second)
✅ Error logging
✅ Summary report

### Output Example

```
╔══════════════════════════════════════════════════════════╗
║         AUTOMATED NURTURE EMAIL SENDER                   ║
╚══════════════════════════════════════════════════════════╝

Mode:  ✉️  LIVE
Limit: 100 emails per day threshold
Time:  6-2-2026 10:00:00

📧 Day 3 Emails
────────────────────────────────────────────────────────────
Found: 15 users
  → John (john@example.com)
    ✅ Sent
  → Sarah (sarah@example.com)
    ✅ Sent
  ...
✓ Day 3 complete: 15 sent, 0 errors

📧 Day 7 Emails
────────────────────────────────────────────────────────────
Found: 8 users
  → Mike (mike@example.com)
    ✅ Sent
  ...
✓ Day 7 complete: 8 sent, 0 errors

📧 Day 10 Emails
────────────────────────────────────────────────────────────
Found: 0 users
✓ No users to email for Day 10

════════════════════════════════════════════════════════════
SUMMARY
════════════════════════════════════════════════════════════
Mode:        LIVE
Day 3:       15 emails ✅
Day 7:       8 emails ✅
Day 10:      0 emails
Total Sent:  23
Errors:      0

✅ Nurture emails sent successfully!

Next steps:
1. Check dashboard for conversions
2. Monitor email open/click rates
3. Run again tomorrow for next batch
```

### Aanbevolen Schedule

Run **1x per dag**:
- **10:00** - Daily automated send (after morning health check)

---

## ⚙️ Cron Setup (Optional)

### Linux/Mac

**Edit crontab:**
```bash
crontab -e
```

**Add these lines:**
```bash
# Daily health checks (9am, 3pm, 9pm)
0 9 * * * cd /path/to/app && npx tsx scripts/daily-health-check.ts >> /var/log/migration-health.log 2>&1
0 15 * * * cd /path/to/app && npx tsx scripts/daily-health-check.ts >> /var/log/migration-health.log 2>&1
0 21 * * * cd /path/to/app && npx tsx scripts/daily-health-check.ts >> /var/log/migration-health.log 2>&1

# Auto nurture sender (10am daily)
0 10 * * * cd /path/to/app && npx tsx scripts/auto-nurture-sender.ts --live --limit=100 >> /var/log/migration-nurture.log 2>&1
```

### Windows (Task Scheduler)

**Create scheduled tasks:**

1. Open Task Scheduler
2. Create Task → "Migration Health Check - Morning"
3. Trigger: Daily at 9:00
4. Action: `npx tsx scripts/daily-health-check.ts`
5. Repeat for 15:00 and 21:00
6. Create another task for nurture sender at 10:00

---

## 🔔 Email Alerts (Optional Upgrade)

Want email notifications? Add this to health check:

```typescript
// At end of daily-health-check.ts
if (stats.health.status === 'critical') {
  await sendEmail({
    to: 'admin@yourdomain.com',
    subject: '🚨 Migration Campaign - Critical Alert',
    html: `Critical issues detected: ${stats.health.alerts.length}`,
    text: stats.health.alerts.map(a => a.message).join('\n')
  })
}
```

---

## 📊 Manual vs Automated

### **Option A: Fully Manual** (Recommended for now)

Run commands manually when you check dashboard:

```bash
# Morning routine
npx tsx scripts/daily-health-check.ts

# If nurture emails needed
npx tsx scripts/auto-nurture-sender.ts --live
```

**Pros:**
- Full control
- See results immediately
- Catch issues faster

**Cons:**
- Need to remember daily
- Requires manual effort

---

### **Option B: Fully Automated** (After testing)

Set up cron jobs and let it run automatically.

**Pros:**
- Zero manual effort
- Never miss a day
- Consistent timing

**Cons:**
- Need to check logs
- Less visibility
- Could miss issues

---

### **Option C: Hybrid** (Best of both)

- Manual health checks (see results)
- Automated nurture sender (consistent delivery)

```bash
# Manual (3x per dag)
npx tsx scripts/daily-health-check.ts

# Automated (cron at 10am)
0 10 * * * ... auto-nurture-sender.ts --live
```

---

## 🎯 Recommended Workflow (Next 10 Days)

### **Daily Routine**

**Morning (09:00):**
```bash
# 1. Health check
npx tsx scripts/daily-health-check.ts

# 2. If nurture emails ready, send them
npx tsx scripts/auto-nurture-sender.ts --live

# 3. Check dashboard
open /admin/migration/dashboard
```

**Afternoon (15:00):**
```bash
# Quick health check
npx tsx scripts/daily-health-check.ts
```

**Evening (21:00):**
```bash
# End of day summary
npx tsx scripts/daily-health-check.ts
```

---

### **Weekly Routine**

**Sunday (end of week):**
```bash
# Comprehensive analysis
npx tsx scripts/check-migration-status.ts
npx tsx scripts/segment-conversion-analysis.ts

# Document results
# Update stakeholders
# Adjust strategy if needed
```

---

## 📈 Expected Results

### **Week 1 (6-13 feb)**

**Day 0-2:** Monitor Landing Page V2 performance
**Day 3:** First nurture emails sent (~15-20 users)
**Day 4-6:** Monitor nurture conversions (+2-3 expected)
**Day 7:** Evaluate V2, send second nurture wave

### **Week 2 (14-16 feb)**

**Day 8-9:** Continue monitoring
**Day 10:** Final nurture emails, full Phase 1 report

### **Expected Metrics**

```
Daily Health Checks:   21 runs (3x per dag × 7 dagen)
Nurture Emails Sent:   30-50 emails (automatic)
New Conversions:       +10-15 (from V2 + nurture)
Time Saved:            ~30 min/dag (automation)
```

---

## 🛠️ Troubleshooting

### Health Check Shows "CRITICAL"

**Action:**
1. Read alerts in output
2. Follow suggested actions
3. Check dashboard for details
4. Run diagnostics: `npx tsx scripts/migration-diagnostics.ts`

### Nurture Sender Fails

**Check:**
1. RESEND_API_KEY configured?
2. Database connection OK?
3. Email templates exist?
4. Check error logs in MigrationError table

### Cron Jobs Not Running

**Debug:**
```bash
# Check cron is running
sudo service cron status

# View cron logs
tail -f /var/log/syslog | grep CRON

# Test command manually first
cd /path/to/app && npx tsx scripts/daily-health-check.ts
```

---

## 🎯 Quick Reference

### Commands

```bash
# Health check
npx tsx scripts/daily-health-check.ts

# Auto nurture (dry run)
npx tsx scripts/auto-nurture-sender.ts

# Auto nurture (live)
npx tsx scripts/auto-nurture-sender.ts --live

# Manual nurture (specific day)
npx tsx scripts/send-nurture-sequence.ts --day=3 --live

# Full status
npx tsx scripts/check-migration-status.ts

# Segment analysis
npx tsx scripts/segment-conversion-analysis.ts
```

### Files Created

- ✅ `scripts/daily-health-check.ts` - Complete status overview
- ✅ `scripts/auto-nurture-sender.ts` - Automated email sender
- ✅ `AUTOMATION_SETUP.md` - This guide

---

## ✅ Next Steps

1. **Test Scripts** (now)
   ```bash
   npx tsx scripts/daily-health-check.ts
   npx tsx scripts/auto-nurture-sender.ts  # dry run
   ```

2. **Run Daily** (starting tomorrow)
   - Morning, afternoon, evening health checks
   - Send nurture emails when ready

3. **Automate** (optional, after testing)
   - Set up cron jobs
   - Monitor logs
   - Adjust as needed

---

**🎉 Automation setup complete! Monitor effortlessly! 💪**

**Questions?** All tools are documented and ready to use.

---

**Created:** 6 februari 2026
**Status:** Ready to use
