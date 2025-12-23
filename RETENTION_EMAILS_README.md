# 📧 World-Class Retention Email System

## Overview

We've upgraded your email system from "transactional" to "engagement-driven" with ethical retention loops designed specifically for your LVB (Licht Verstandelijk Beperkt) target audience.

This system uses **react-email** for templates and **Resend** (or generic SMTP) for sending.

---

## 🎯 Features

### 1. **Daily Digest Email** (`daily-digest.tsx`)
- Shows "You have X new profile visits and Y new likes"
- Blurred preview of a visitor avatar to trigger curiosity
- CTA: "Kijk wie het is" (See who it is)
- **Runs daily at 19:00 (7 PM)** via Vercel Cron

### 2. **Profile Nudge Email** (`profile-nudge.tsx`)
- Friendly, encouraging tone: "Complete your profile to find love"
- Shows a progress bar (e.g., 40% complete)
- Lists missing fields with checkboxes
- CTA: "Maak mijn profiel af" (Complete my profile)
- **Runs daily at 10:00 AM** via Vercel Cron

### 3. **Perfect Match Email** (`perfect-match.tsx`)
- "We found someone special"
- Highlights 1-3 shared interests (e.g., "You both love Wandelen")
- Shows compatibility score
- CTA: "Bekijk profiel van [Name]"
- **Triggered by matching algorithm** (on-demand)

---

## 🎨 Design Guidelines (LVB Accessibility)

All templates follow these principles:

✅ **Large font sizes** (18px+)
✅ **High contrast buttons** (Purple #9333ea background, White text)
✅ **Simple, direct Dutch language** (B1 level)
✅ **No marketing jargon** - clear, friendly communication
✅ **Visual cues** - emojis and icons for easy scanning

---

## 📂 File Structure

```
lib/
├── email/
│   └── templates/
│       └── engagement/
│           ├── daily-digest.tsx       # Profile visits & likes summary
│           ├── profile-nudge.tsx      # Incomplete profile encouragement
│           └── perfect-match.tsx      # High-quality match notification
├── cron/
│   └── retention.ts                   # Retention engine logic

app/
├── api/
│   └── cron/
│       ├── daily-digest/
│       │   └── route.ts              # Vercel Cron endpoint (19:00)
│       └── profile-nudge/
│           └── route.ts              # Vercel Cron endpoint (10:00)

scripts/
└── test-emails.ts                    # Testing script

vercel.json                           # Cron configuration
```

---

## 🚀 Setup Instructions

### 1. **Environment Variables**

Add to your `.env` file:

```bash
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>

# Cron Security (optional but recommended)
CRON_SECRET=your-secret-key-here

# App URL
NEXT_PUBLIC_APP_URL=https://liefdevooriedereen.nl

# Testing
TEST_EMAIL=developer@liefdevooriedereen.nl
```

### 2. **Install Dependencies**

The required dependencies should already be installed:
- `@react-email/components`
- `@react-email/render`
- `resend` (optional, we use fetch API)

### 3. **Deploy to Vercel**

The cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 19 * * *"  // Daily at 7 PM
    },
    {
      "path": "/api/cron/profile-nudge",
      "schedule": "0 10 * * *"  // Daily at 10 AM
    }
  ]
}
```

When you deploy to Vercel, these cron jobs will **automatically run** at the specified times.

---

## 🧪 Testing

### Test All Templates

Run the test script to send all three emails to your test address:

```bash
npx tsx scripts/test-emails.ts
```

This will send:
1. Daily Digest with dummy data (Bonnie, 67 jaar)
2. Profile Nudge at 40% completion
3. Perfect Match with shared interests

### Test Individual Templates

You can also test via the Vercel Cron endpoints locally:

```bash
# Test Daily Digest
curl http://localhost:3000/api/cron/daily-digest

# Test Profile Nudge
curl http://localhost:3000/api/cron/profile-nudge
```

---

## 📊 Retention Logic

### Daily Digest (`sendDailyDigests()`)

**Triggers:**
- User received profile views in the last 24 hours
- User received likes in the last 24 hours
- User has `marketingEmailsConsent: true` (GDPR compliant)
- User is `isOnboarded: true`

**Sends:**
- Summary of visits and likes
- Blurred photo of most recent visitor
- Link to `/dashboard/visitors`

**Scheduled:** Daily at 19:00 (7 PM)

---

### Profile Nudge (`checkIncompleteProfiles()`)

**Triggers:**
- User registered > 3 days ago
- Profile completion < 50%
- User has `marketingEmailsConsent: true`
- No nudge sent in the last 7 days (prevents spam)

**Profile Score Calculation:**
- Profile image: 30%
- Bio (>20 chars): 20%
- Interests: 15%
- Birth date: 10%
- City: 10%
- Voice intro: 10%
- Looking for: 5%

**Sends:**
- Progress bar showing completion %
- List of missing fields
- Encouragement message
- Link to `/profile/edit`

**Scheduled:** Daily at 10:00 AM

---

### Perfect Match (`sendPerfectMatchEmail()`)

**Triggers:**
- Called by your matching algorithm
- When a high-quality match is detected
- Users share at least 1 common interest

**Sends:**
- Match profile with photo
- Compatibility score
- 1-3 shared interests highlighted
- Conversation starter tip
- Link to match profile

**Scheduled:** On-demand (triggered by code)

**Usage Example:**

```typescript
import { sendPerfectMatchEmail } from '@/lib/cron/retention'

// When your matching algorithm finds a great match
await sendPerfectMatchEmail(userId, matchUserId)
```

---

## 🔐 Security

### Cron Secret Protection

To prevent unauthorized access to your cron endpoints, set a `CRON_SECRET`:

```bash
# .env
CRON_SECRET=your-super-secret-key
```

Then when calling the endpoints manually or from external services:

```bash
curl -H "Authorization: Bearer your-super-secret-key" \
  https://liefdevooriedereen.nl/api/cron/daily-digest
```

Vercel's built-in cron automatically includes the correct authorization.

---

## 📈 Email Logging

All emails are logged to the `EmailLog` table in your database:

```typescript
await prisma.emailLog.create({
  data: {
    userId: user.id,
    email: user.email,
    type: 'daily_digest', // or 'profile_nudge', 'perfect_match'
    category: 'engagement',
    subject: 'Email subject',
    status: 'sent'
  }
})
```

This allows you to:
- Track email delivery
- Prevent duplicate sends
- Analyze engagement metrics
- Comply with GDPR data retention policies

---

## 🎯 Best Practices

### For LVB Audience

1. **Simple Language** - Use B1-level Dutch, avoid complex words
2. **Clear CTAs** - Large buttons with action-oriented text
3. **Visual Hierarchy** - Use colors and spacing to guide attention
4. **Avoid Overwhelm** - One primary action per email
5. **Friendly Tone** - Supportive, never pushy

### Timing

- **Daily Digest:** 19:00 (evening, when users are relaxed)
- **Profile Nudge:** 10:00 (morning, start the day with action)
- **Perfect Match:** Send immediately when match is found

### Frequency Limits

- **Daily Digest:** Max 1 per day (only if there's activity)
- **Profile Nudge:** Max 1 per 7 days
- **Perfect Match:** Only when truly good match found

---

## 🚨 Troubleshooting

### Emails Not Sending?

1. **Check RESEND_API_KEY** - Make sure it's set correctly
2. **Check email console logs** - Development mode logs to console
3. **Check spam folder** - Emails might be filtered
4. **Verify Resend domain** - Domain must be verified in Resend dashboard

### Cron Jobs Not Running?

1. **Deploy to Vercel** - Cron only works on Vercel, not localhost
2. **Check Vercel Logs** - Go to Vercel Dashboard > Deployments > Function Logs
3. **Verify vercel.json** - Make sure cron config is correct
4. **Check CRON_SECRET** - If set, authorization header must match

### Database Errors?

1. **Run migrations** - `npx prisma migrate dev`
2. **Generate Prisma Client** - `npx prisma generate`
3. **Check EmailLog table** - Make sure it exists in schema

---

## 📝 Example Email Preview

### Daily Digest

```
Subject: 8 nieuwe bezoekers op je profiel!

Goed nieuws, Pieter!

You have:
┌─────────────┬─────────────┐
│  5 nieuwe   │  3 nieuwe   │
│  bezoekers  │   likes     │
└─────────────┴─────────────┘

Wie keek naar je?
[Blurred Photo]
?
Bonnie, 67 jaar
uit Amsterdam

[Kijk wie het is] ← Large purple button
```

---

## 🔄 Future Enhancements

Consider adding:
- **Re-engagement emails** - For users inactive 30+ days
- **Weekly summary** - Instead of daily, for less active users
- **A/B testing** - Test subject lines and CTA text
- **Unsubscribe preferences** - Let users choose email frequency
- **Localization** - Support for other languages

---

## 📞 Support

Voor vragen of hulp:
- Email: info@liefdevooriedereen.nl
- Check logs in Vercel Dashboard
- Review EmailLog table in database

---

**Made with ❤️ for Liefde Voor Iedereen**
