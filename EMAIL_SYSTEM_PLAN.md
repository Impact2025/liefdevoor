# 📧 World-Class Email Systeem - Implementatie Plan

**Voor:** Liefde Voor Iedereen Dating App
**Doel:** Professional email systeem voor 16K+ gebruikers

---

## 🎯 Doelen

1. **Transactionele Emails** - Verificatie, notifications, etc.
2. **Marketing Emails** - 15-jaar relaunch campagne
3. **Engagement Emails** - Match notifications, messages, etc.
4. **Lifecycle Emails** - Onboarding, re-engagement, etc.

---

## ✅ Wat Bestaat Al

### Geïmplementeerd (Nu):
- ✅ Email verificatie systeem
- ✅ Beautiful HTML templates (verificatie + welcome)
- ✅ Email send functie (Resend-ready)
- ✅ Development mode (console logging)

### Wat Ontbreekt:
- ❌ Marketing email systeem (relaunch campagne)
- ❌ Batch sending (voor 16K users)
- ❌ Email templates voor matches/messages
- ❌ Email preferences (unsubscribe)
- ❌ Analytics & tracking
- ❌ Email scheduling
- ❌ Bounce handling

---

## 📊 Email Types Overzicht

### 1. **Transactionele Emails** (Hoge Prioriteit)
*Kritisch voor app functionaliteit - MOET werken*

| Email Type | Trigger | Frequentie | Status |
|------------|---------|------------|--------|
| Email Verification | Registratie | 1x | ✅ Klaar |
| Welcome Email | Email verified | 1x | ✅ Klaar |
| Password Reset | User request | On demand | ❌ TODO |
| New Match | Match created | Real-time | ❌ TODO |
| New Message | Message received | Real-time/Digest | ❌ TODO |
| Account Security | Login from new device | On demand | ❌ TODO |

### 2. **Marketing Emails** (15-Jaar Campagne)
*Voor relaunch - batch sending naar 16K users*

| Email | Timing | Doel | Batch Size |
|-------|--------|------|------------|
| Teaser Email | 1 week voor launch | Curiosity | 500-2500/dag |
| Launch Email | Launch dag | Direct return | 500-2500/dag |
| Feature Highlight | 3 dagen na launch | Engagement | Alleen openers |
| Last Chance | 1 week na launch | FOMO | Alleen non-openers |

### 3. **Engagement Emails** (Lifecycle)
*Houd users actief*

| Email Type | Trigger | Frequentie |
|------------|---------|------------|
| Daily Digest | New matches/messages | Daily (opt-in) |
| Weekly Summary | Activity summary | Weekly |
| Profile Incomplete | No profile pic after 3 days | 1x |
| Dormant User | No login 30 days | Monthly |
| Win-back | No login 90 days | 1x |

### 4. **Systeem Emails**
*Administrative*

| Email Type | Trigger | Frequentie |
|------------|---------|------------|
| Subscription Receipt | Payment | Per transaction |
| Subscription Renewal | 7 days before renewal | 1x |
| Report Received | User reports someone | 1x |
| Account Warning | Terms violation | On demand |

---

## 🏗️ Technische Architectuur

### Email Service Provider: **Resend**

**Waarom Resend?**
- ✅ 3,000 gratis emails/maand (perfect voor start)
- ✅ €20/maand voor 50,000 emails (schaalbaar)
- ✅ Beste developer experience
- ✅ Automatische DKIM/SPF setup
- ✅ Real-time webhook events
- ✅ Template support
- ✅ Batch API (tot 100 emails per call)

**Alternatieven:**
- SendGrid: Meer features, complexer
- Mailgun: Goedkoper, minder betrouwbaar
- AWS SES: Goedkoopst (€0.10/1000), maar meer setup

### Database Schema

```prisma
// Bestaande models (OK)
model VerificationToken { ... } ✅
model User { emailVerified, ... } ✅

// Nieuwe models nodig:

model EmailLog {
  id          String   @id @default(cuid())
  userId      String?
  email       String
  type        String   // "transactional", "marketing", "engagement"
  category    String   // "verification", "match_notification", "relaunch", etc.
  subject     String
  status      String   // "sent", "delivered", "bounced", "opened", "clicked"
  sentAt      DateTime @default(now())
  deliveredAt DateTime?
  openedAt    DateTime?
  clickedAt   DateTime?
  bouncedAt   DateTime?
  errorMessage String?

  @@index([userId])
  @@index([email])
  @@index([type, category])
  @@index([sentAt])
}

model EmailPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])

  // Marketing
  marketingEmails       Boolean  @default(true)
  relaunchCampaign      Boolean  @default(true)

  // Engagement
  matchNotifications    Boolean  @default(true)
  messageNotifications  Boolean  @default(true)
  dailyDigest           Boolean  @default(false)
  weeklyDigest          Boolean  @default(true)

  // Lifecycle
  dormantReminders      Boolean  @default(true)
  productUpdates        Boolean  @default(true)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
}

model EmailBounce {
  id        String   @id @default(cuid())
  email     String   @unique
  bounceType String  // "hard", "soft", "complaint"
  reason    String?
  count     Int      @default(1)
  firstBounce DateTime @default(now())
  lastBounce  DateTime @default(now())

  @@index([email])
  @@index([bounceType])
}

model EmailCampaign {
  id              String   @id @default(cuid())
  name            String
  type            String   // "relaunch", "engagement", "feature"
  status          String   @default("draft") // "draft", "scheduled", "sending", "completed"
  targetAudience  String   // "all", "dormant", "active", etc.

  // Batch sending
  totalRecipients Int      @default(0)
  sentCount       Int      @default(0)
  batchSize       Int      @default(500)

  scheduledAt     DateTime?
  startedAt       DateTime?
  completedAt     DateTime?

  // Stats
  deliveredCount  Int      @default(0)
  openedCount     Int      @default(0)
  clickedCount    Int      @default(0)
  bouncedCount    Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([scheduledAt])
}
```

---

## 📝 Email Templates Structuur

### Template Categorieën

**1. Transactional Templates** (React Components)
```typescript
// lib/email/templates/transactional/
├── verification.tsx          ✅ Klaar
├── welcome.tsx               ✅ Klaar
├── password-reset.tsx        ❌ TODO
├── new-match.tsx             ❌ TODO
├── new-message.tsx           ❌ TODO
├── account-security.tsx      ❌ TODO
```

**2. Marketing Templates** (React Components)
```typescript
// lib/email/templates/marketing/
├── relaunch-teaser.tsx       ❌ TODO
├── relaunch-launch.tsx       ❌ TODO
├── relaunch-features.tsx     ❌ TODO
├── relaunch-last-chance.tsx  ❌ TODO
```

**3. Engagement Templates**
```typescript
// lib/email/templates/engagement/
├── daily-digest.tsx          ❌ TODO
├── weekly-summary.tsx        ❌ TODO
├── profile-incomplete.tsx    ❌ TODO
├── dormant-reminder.tsx      ❌ TODO
├── winback.tsx               ❌ TODO
```

### Template Engine: **React Email**

**Waarom React Email?**
- ✅ Write templates in React (type-safe!)
- ✅ Automatic responsive design
- ✅ Preview templates locally
- ✅ Compile to HTML automatically
- ✅ Component reusability

**Setup:**
```bash
npm install react-email @react-email/components
```

**Voorbeeld Template:**
```tsx
// lib/email/templates/transactional/new-match.tsx
import {
  Body, Container, Head, Heading, Html,
  Img, Link, Preview, Text, Button
} from '@react-email/components'

interface NewMatchEmailProps {
  userName: string
  matchName: string
  matchAge: number
  matchPhoto: string
  matchUrl: string
}

export default function NewMatchEmail({
  userName,
  matchName,
  matchAge,
  matchPhoto,
  matchUrl
}: NewMatchEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Je hebt een nieuwe match met {matchName}! 💖</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            🎉 Nieuwe Match!
          </Heading>
          <Text style={text}>
            Hey {userName}!
          </Text>
          <Text style={text}>
            Je hebt een match met <strong>{matchName}, {matchAge}</strong>!
          </Text>
          <Img
            src={matchPhoto}
            width="200"
            height="200"
            alt={matchName}
            style={profileImg}
          />
          <Button style={button} href={matchUrl}>
            💬 Begin met chatten!
          </Button>
          <Text style={footer}>
            Liefde Voor Iedereen - Vind je perfecte match
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles...
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px' }
// ... etc
```

---

## 🚀 Sending Strategie

### 1. **Transactionele Emails** (Real-time)
```typescript
// Immediate sending
async function sendTransactionalEmail(type, userId, data) {
  // Check user preferences
  const prefs = await getEmailPreferences(userId)
  if (!prefs[`${type}Notifications`]) return

  // Check bounce list
  const isBounced = await isEmailBounced(user.email)
  if (isBounced) return

  // Send
  await sendEmail({
    to: user.email,
    template: type,
    data: data
  })

  // Log
  await logEmail({ userId, type, status: 'sent' })
}
```

### 2. **Marketing Emails** (Batch)
```typescript
// Batch sending for relaunch campaign
async function sendCampaignBatch(campaignId, batchSize = 500) {
  const campaign = await getCampaign(campaignId)

  // Get next batch of recipients
  const recipients = await getNextBatch(campaign, batchSize)

  // Send in parallel (max 100 per Resend API call)
  const chunks = chunkArray(recipients, 100)

  for (const chunk of chunks) {
    await resend.batch.send(
      chunk.map(user => ({
        from: 'Liefde Voor Iedereen <noreply@liefdevoorlvb.nl>',
        to: user.email,
        subject: campaign.subject,
        html: renderTemplate(campaign.template, { userName: user.name })
      }))
    )

    // Rate limit: wait 1 second between batches
    await sleep(1000)
  }

  // Update campaign stats
  await updateCampaignProgress(campaignId, recipients.length)
}
```

### 3. **Scheduled Emails** (Cron Jobs)
```typescript
// Daily digest - runs every day at 9 AM
export async function sendDailyDigests() {
  const users = await getUsersWithPendingDigests()

  for (const user of users) {
    const digest = await generateDigest(user.id)

    if (digest.newMatches > 0 || digest.newMessages > 0) {
      await sendTransactionalEmail('daily_digest', user.id, digest)
    }
  }
}
```

---

## 📈 Analytics & Tracking

### Webhook Events (Resend)

```typescript
// app/api/webhooks/resend/route.ts
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.json()
  const { type, data } = body

  switch (type) {
    case 'email.delivered':
      await updateEmailLog(data.email_id, {
        status: 'delivered',
        deliveredAt: new Date()
      })
      break

    case 'email.opened':
      await updateEmailLog(data.email_id, {
        openedAt: new Date()
      })
      break

    case 'email.clicked':
      await updateEmailLog(data.email_id, {
        clickedAt: new Date()
      })
      break

    case 'email.bounced':
      await handleBounce({
        email: data.to,
        type: data.bounce_type,
        reason: data.reason
      })
      break
  }

  return Response.json({ success: true })
}
```

### Dashboard Metrics

**Key Metrics:**
- Delivery rate (should be >95%)
- Open rate (target 20-30%)
- Click rate (target 3-5%)
- Bounce rate (should be <5%)
- Unsubscribe rate (should be <1%)

**Per Email Type:**
- Transactional: 70-80% open rate (urgent!)
- Marketing: 20-30% open rate
- Engagement: 15-25% open rate

---

## 🔐 Security & Compliance

### 1. **GDPR Compliance**
- ✅ Easy unsubscribe (1-click in footer)
- ✅ Email preferences dashboard
- ✅ Data export (include email history)
- ✅ Right to be forgotten (delete all email logs)

### 2. **CAN-SPAM Compliance**
- ✅ Physical address in footer
- ✅ Clear "from" name
- ✅ Honest subject lines
- ✅ Unsubscribe link

### 3. **Bounce Management**
```typescript
// Automatic bounce handling
async function handleBounce({ email, type, reason }) {
  // Log bounce
  await prisma.emailBounce.upsert({
    where: { email },
    create: { email, bounceType: type, reason, count: 1 },
    update: {
      count: { increment: 1 },
      lastBounce: new Date(),
      reason
    }
  })

  // Hard bounce = permanent failure
  if (type === 'hard') {
    // Mark email as invalid
    await prisma.user.update({
      where: { email },
      data: { emailVerified: null }
    })
  }

  // Too many soft bounces = treat as hard
  const bounce = await prisma.emailBounce.findUnique({ where: { email } })
  if (bounce.count >= 5) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: null }
    })
  }
}
```

---

## 💰 Kosten Schatting

### Resend Pricing

**Gratis Tier:**
- 3,000 emails/maand
- Perfect voor:
  - Verificatie emails (~200/maand voor 200 nieuwe users)
  - Match notifications (~500/maand)
  - Totaal: ~1,000/maand = **€0**

**Pro Plan (€20/maand):**
- 50,000 emails/maand
- Perfect voor:
  - Relaunch campagne (16,000 emails in 2 weken)
  - Daily digests (~2,000/maand)
  - Marketing emails (~1,000/maand)
  - Totaal: ~20,000/maand = **€20/maand**

**Voor 16K User Relaunch:**
```
Emails:
- Teaser: 16,000
- Launch: 16,000
- Features: 3,000 (only openers)
- Last Chance: 5,000 (non-openers)
Total: 40,000 emails over 1 maand

Kosten: €20 (Pro plan, 1 maand)
```

**Na Relaunch (steady state):**
```
Monthly:
- Nieuwe registraties: 200 × 2 = 400
- Match notifications: 1,000
- Message notifications: 500
- Weekly digests: 2,000
- Win-back emails: 200
Total: ~4,000/maand

Kosten: €0 (binnen gratis tier!)
```

---

## 📅 Implementatie Roadmap

### **Fase 1: Core Transactionele Emails** (2-3 dagen)
*Kritisch voor app functionaliteit*

**Week 1:**
- [x] Email verificatie ✅ KLAAR
- [x] Welcome email ✅ KLAAR
- [ ] Password reset email
- [ ] New match notification
- [ ] New message notification
- [ ] Setup Resend production
- [ ] Setup webhook handlers
- [ ] Email logging database

**Deliverable:** Users krijgen betrouwbare notifications

---

### **Fase 2: Email Preferences & Compliance** (1-2 dagen)
*Voor GDPR en user control*

**Week 2:**
- [ ] Email preferences model
- [ ] Preferences page in settings
- [ ] Unsubscribe functionality
- [ ] Bounce handling
- [ ] Email footer met unsubscribe + address

**Deliverable:** Users kunnen email preferences beheren

---

### **Fase 3: Marketing Email System** (2-3 dagen)
*Voor 15-jaar relaunch campagne*

**Week 3:**
- [ ] React Email setup
- [ ] Relaunch email templates (4 emails)
- [ ] Batch sending system
- [ ] Campaign management (database)
- [ ] Campaign scheduler
- [ ] Analytics dashboard (basic)

**Deliverable:** Klaar voor relaunch campagne

---

### **Fase 4: Engagement Emails** (2-3 dagen)
*Voor user retention*

**Week 4:**
- [ ] Daily digest email
- [ ] Weekly summary email
- [ ] Dormant user emails
- [ ] Profile incomplete reminder
- [ ] Win-back campaign

**Deliverable:** Automated lifecycle emails

---

### **Fase 5: Advanced Features** (Optioneel)
*Nice to have*

**Later:**
- [ ] A/B testing system
- [ ] Advanced analytics dashboard
- [ ] Email preview before send
- [ ] Template editor (visual)
- [ ] Personalization engine
- [ ] Smart send time optimization

---

## 🎯 Success Criteria

### **Transactionele Emails:**
- ✅ 99%+ delivery rate
- ✅ <1 second sending latency
- ✅ 70%+ open rate
- ✅ 0 spam complaints

### **Marketing Emails (Relaunch):**
- ✅ 95%+ delivery rate
- ✅ 20-30% open rate
- ✅ 3-5% click rate
- ✅ 2,000-3,000 reactivated users
- ✅ <1% bounce rate

### **Engagement Emails:**
- ✅ 90%+ delivery rate
- ✅ 15-25% open rate
- ✅ 2-4% click rate
- ✅ 10% reduction in churn

---

## 🚨 Risico's & Mitigatie

### **Risico 1: Domain Reputation**
**Probleem:** Grote batch (16K emails) kan domain als spam markeren

**Mitigatie:**
- ✅ Gefaseerd versturen (500-2500/dag)
- ✅ Start met meest recente users (laagste bounce)
- ✅ Warm-up period (week 1: 500, week 2: 1000, etc.)
- ✅ Monitor bounce rate real-time
- ✅ Stop bij >5% bounce rate

### **Risico 2: High Bounce Rate (Oude Emails)**
**Probleem:** 16K users van 15 jaar oud = veel bounces

**Mitigatie:**
- ✅ Email validation voor versturen
- ✅ Bounce handling systeem
- ✅ Segment per account age
- ✅ Test batch eerst (500 emails)

### **Risico 3: Spam Complaints**
**Probleem:** Users herinneren zich niet meer aangemeld te hebben

**Mitigatie:**
- ✅ Duidelijke "from" naam
- ✅ Reminder in email: "Je kreeg deze email omdat je in [jaar] account maakte"
- ✅ Easy 1-click unsubscribe
- ✅ Persoonlijke tone (niet corporate)

### **Risico 4: Kosten Overschrijding**
**Probleem:** Meer emails dan verwacht = hogere kosten

**Mitigatie:**
- ✅ Start met gratis tier (3K emails)
- ✅ Upgrade naar Pro (€20) alleen voor relaunch maand
- ✅ Downgrade na relaunch
- ✅ Monitor usage dashboard

---

## 🎊 Conclusie

**Wat Je Krijgt:**

✅ **Production-Ready Email Systeem**
- Transactionele emails (verificatie, notifications)
- Marketing emails (relaunch campagne)
- Engagement emails (lifecycle, retention)

✅ **Schaalbaar & Betrouwbaar**
- Batch sending voor 16K+ users
- Bounce handling
- GDPR compliant

✅ **Analytics & Optimization**
- Real-time tracking
- Open/click rates
- A/B testing ready

✅ **Kostenefficiënt**
- €0/maand voor normale operatie
- €20/maand tijdens relaunch
- €0 setup kosten

**Totale Implementatie Tijd:** 8-12 dagen
**Kosten:** €20 eenmalig (relaunch maand)
**ROI:** 2,000-3,000 reactivated users = unmeasurable value! 🚀

---

## 🤔 Volgende Stap

**Wat wil je eerst bouwen?**

1. **Transactionele emails afmaken** (password reset, match/message notifications)
2. **Marketing email systeem** (voor relaunch campagne)
3. **Email preferences systeem** (GDPR compliance)
4. **Iets anders?**

Zeg maar wat prioriteit heeft! 😊
