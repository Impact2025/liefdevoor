# 🎉 15-Jarig Jubileum Relaunch Strategie

## Feestelijke Heropening: Liefde Voor Iedereen

**Tagline:** *"15 jaar liefde verbinden, nu vernieuwd voor de toekomst"*

---

## 📊 Realistische Verwachtingen

### Database Analyse (16.000 users uit 2009-2025)

**Verwachte Email Bounce Rates:**
- **15+ jaar oude accounts (2009-2015)**: 60-70% bounce
- **10-15 jaar oude accounts (2015-2020)**: 40-50% bounce
- **5-10 jaar oude accounts (2020-2023)**: 20-30% bounce
- **Recent actieve accounts (2023-2025)**: 5-10% bounce

**Geschatte bereik:**
```
16.000 totaal
- 6.000 bounced/invalid (37.5%)
= 10.000 bereikbaar
- 8.000 openen email (80%)
= 2.000 - 3.000 actieve returns (20-30% click rate)
```

**Dat is nog steeds 2.000-3.000 heractiveerde gebruikers! 🎯**

---

## 🎊 Jubileum Campagne: "15 Jaar Liefde"

### Fase 1: Pre-Launch Teaser (Week -1)

**Email Batch Strategie:**
```
Dag 1-2:   500 emails (test batch - meest recente users)
Dag 3-4:   1.000 emails (als test succesvol)
Dag 5-10:  2.000 emails/dag (scale up)
Dag 11-15: 2.500 emails/dag (rest)
```

**Waarom gefaseerd?**
- Monitor bounce rates
- Bescherm domain reputation
- Tijd om issues te fixen
- Email providers zien geen spam pattern

### Fase 2: Grand Opening (Week 0)

**Jubileum Features:**
1. **"Legacy Badge"** - Speciale badge voor oude members
2. **"15 Year Timeline"** - Toon je dating history (privacy-safe)
3. **"Founder Member Benefits"** - Speciale perks
4. **"Success Stories"** - Highlight couples die elkaar gevonden hebben

---

## 📧 Email Campagne Structuur

### Email 1: "Raad Eens Wie Er Terug Is?" (Teaser)
**Timing:** 1 week voor launch
**Doel:** Nieuwsgierigheid wekken

```
Onderwerp: 🎂 15 jaar later... we zijn terug!

Hoi [Naam],

Weet je nog? 15 jaar geleden begonnen we met een simpele missie:
iedereen helpen de liefde te vinden.

Nu, 15 jaar en [XXX] succesvolle relaties later, hebben we
groot nieuws...

We zijn COMPLEET VERNIEUWD! 🎉

🔓 Early Access volgende week
💝 Speciale voordelen voor oude leden
✨ Modern platform, vertrouwde community

Houd je inbox in de gaten!

[Reminder instellen]

Groetjes,
Het Liefde Voor Iedereen Team

P.S. Je account staat klaar en wacht op je...
```

### Email 2: "Welcome Back Home" (Launch)
**Timing:** Launch dag
**Doel:** Direct terughalen

```
Onderwerp: 🎉 Je bent er nog! Log direct in op het nieuwe platform

Hoi [Naam],

Het moment is daar! Na 15 jaar trouwe dienst, openen we de
deuren van ons gloednieuwe platform.

JE ACCOUNT IS OVERGEZET ✓
- Originele inschrijfdatum: [Datum]
- Legacy Member Badge: ✓
- Alle privacy instellingen: Behouden

🎁 JUBILEUM CADEAU:
Als dank voor je loyaliteit:
- Gratis Premium features (1 maand)
- Priority support
- Exclusive "Founding Member" badge
- Early access tot nieuwe features

[Log Nu In - Je Oude Wachtwoord Werkt Nog!]

Wachtwoord vergeten? [Herstel Hier]

Wat is er nieuw?
✨ Modern design
📱 Perfecte mobiele ervaring
🎯 Betere matching
🔒 Extra beveiliging
💬 Real-time chat

SAMEN 15 JAAR 💕
[Aantal] succesvolle matches
[Aantal] langdurige relaties
Ontelbare mooie verhalen

Welkom terug, we hebben je gemist!

Het Liefde Voor Iedereen Team

---
Niet meer geïnteresseerd? [Afmelden]
```

### Email 3: "Je Mist Al Nieuwe Matches!" (Re-engagement)
**Timing:** 3 dagen na launch
**Alleen voor niet-ingelogde users**

```
Onderwerp: 💕 [Aantal] nieuwe mensen in [Stad] wachten op je

Hoi [Naam],

Even een heads-up: er zijn al [Aantal] nieuwe leden in jouw
regio actief sinds de lancering!

Je mist nu al potentiële matches...

[Bekijk Wie Online Is]

💝 Special Anniversary Perks Expiren Binnenkort!
Je gratis Premium toegang vervalt over 25 dagen.

Tot snel!
```

### Email 4: "Last Chance" (Final Call)
**Timing:** 7 dagen na launch
**Alleen voor niet-ingelogde users**

```
Onderwerp: ⏰ Laatste kans: Je Premium toegang verloopt binnenkort

Hoi [Naam],

Dit is je laatste herinnering - je jubileum voordelen
vervallen over 3 dagen:

❌ Gratis Premium (t.w.v. €19.99)
❌ Founding Member Badge
❌ Priority Support

We snappen het als dating nu niet je prioriteit is.
Maar als je nog twijfelt: nu is het moment!

[Claim Je Voordelen]

Of [Definitief Afmelden]

Succes gewenst,
Het Team
```

---

## 🛠️ Technische Implementatie

### 1. Email Bounce Handling

```typescript
// scripts/send-relaunch-emails.ts
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendBatchWithBounceHandling() {
  const users = await prisma.user.findMany({
    where: {
      emailVerified: true,
      // Sorteer op laatste activiteit
      lastLogin: { not: null }
    },
    orderBy: { lastLogin: 'desc' },
    take: 500 // Batch size
  })

  for (const user of users) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>',
        to: user.email,
        subject: '🎉 15 jaar later... we zijn terug!',
        react: WelcomeBackEmail({ name: user.name }),
        tags: [
          { name: 'campaign', value: '15-year-relaunch' },
          { name: 'user-age', value: getAccountAge(user.createdAt) }
        ]
      })

      if (error) {
        // Log bounce
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailBounced: true,
            emailBouncedAt: new Date(),
            emailBounceReason: error.message
          }
        })
      } else {
        // Mark as sent
        await prisma.user.update({
          where: { id: user.id },
          data: { lastEmailSent: new Date() }
        })
      }

      // Rate limiting: wait 50ms between emails
      await new Promise(resolve => setTimeout(resolve, 50))

    } catch (error) {
      console.error(`Failed to send to ${user.email}:`, error)
    }
  }
}
```

### 2. Database Schema Update

```prisma
model User {
  // ... existing fields

  // Email status tracking
  emailBounced      Boolean?
  emailBouncedAt    DateTime?
  emailBounceReason String?
  lastEmailSent     DateTime?
  lastEmailOpened   DateTime?
  emailUnsubscribed Boolean   @default(false)

  // Legacy member tracking
  isLegacyMember    Boolean   @default(false)
  legacyJoinDate    DateTime?
  premiumUntil      DateTime? // Jubileum cadeau
}
```

### 3. Email Open Tracking

```typescript
// app/api/email/track/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id

  // Update last opened
  await prisma.user.update({
    where: { id: userId },
    data: { lastEmailOpened: new Date() }
  })

  // Return 1x1 transparent pixel
  return new Response(
    Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
    {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  )
}
```

---

## 🎁 Jubileum Features Te Implementeren

### 1. Legacy Member Badge
```typescript
// components/ui/LegacyBadge.tsx
export function LegacyBadge({ joinDate }: { joinDate: Date }) {
  const years = new Date().getFullYear() - joinDate.getFullYear()

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-sm font-semibold">
      <span>👑</span>
      <span>Lid sinds {joinDate.getFullYear()}</span>
      {years >= 10 && <span>• {years} jaar!</span>}
    </div>
  )
}
```

### 2. Gratis Premium Maand
```typescript
// Automatisch activeren bij eerste login na migratie
async function handleFirstLoginAfterMigration(userId: string) {
  const premiumUntil = new Date()
  premiumUntil.setMonth(premiumUntil.getMonth() + 1)

  await prisma.user.update({
    where: { id: userId },
    data: {
      premiumUntil,
      isLegacyMember: true
    }
  })
}
```

### 3. Success Stories Page
```typescript
// app/anniversary/page.tsx
- Timeline van 15 jaar
- Statistieken (X matches, Y succesvolle relaties)
- Testimonials (met toestemming)
- "Share Your Story" form
```

---

## 📊 Metrics & Success Tracking

### KPIs Om Te Monitoren:

```typescript
// Dashboard metrics
{
  emailsSent: 16000,
  emailsDelivered: 10000,    // 62.5% delivery rate
  emailsOpened: 8000,         // 80% open rate (good!)
  emailsClicked: 2000,        // 25% click rate (excellent!)
  newLogins: 1500,            // 75% conversion
  reactivatedUsers: 1200,     // 80% stayed active
  newMatches: 3000,           // 2.5 matches per user

  bounceRate: 37.5%,          // Expected for 15-year DB
  unsubscribeRate: 2%,        // Acceptable
}
```

### Success = 1.000+ reactivated users

---

## 💰 Budget Overzicht

### Email Service (Resend Aanbevolen)

**Maand 1 (Relaunch):**
- 16.000 emails verzenden: €40
- Domain verificatie: €0
- Email templates: €0 (zelf bouwen)
- **Totaal: €40**

**Maand 2-12 (Lopend):**
- 3.000 actieve users × 4 emails/maand = 12.000 emails
- Kosten: €30/maand
- **Totaal: €30/maand**

**Jaar 1 totaal: €40 + (€30 × 11) = €370**

Verhouding: **€370 / 1.200 users = €0.31 per heractiveerde user** 🎯

---

## ✅ Action Items - Wil Je Dit Nu Implementeren?

Ik kan voor je maken:

### 1. Email System (2-3 uur werk)
- [ ] Resend integratie
- [ ] 4 email templates (React components)
- [ ] Batch sender script
- [ ] Bounce handling
- [ ] Open tracking

### 2. Database Updates (1 uur)
- [ ] Add email tracking fields
- [ ] Add legacy member fields
- [ ] Migration script

### 3. Jubileum Features (3-4 uur)
- [ ] Legacy Member Badge component
- [ ] Auto-activate Premium (1 maand gratis)
- [ ] Anniversary landing page
- [ ] Success stories section

### 4. Analytics Dashboard (2 uur)
- [ ] Email campaign metrics
- [ ] Reactivation tracking
- [ ] Daily stats overview

**Totaal: 8-10 uur ontwikkeltijd**

---

## 🚀 Timeline Voorstel

**Deze Week:**
- Resend setup + test emails

**Week 1:**
- Email templates + jubileum features
- Test batch (500 users)

**Week 2:**
- Full launch (16.000 emails over 10 dagen)
- Monitor & optimize

**Week 3-4:**
- Re-engagement emails
- Success stories verzamelen

---

## 🎯 Zeg Maar Wat Je Wilt!

Opties:
1. **"Ja, maak alles!"** - Ik begin met de volledige implementatie
2. **"Alleen emails eerst"** - Ik focus op email systeem + templates
3. **"Laat me eerst testen"** - Ik maak test setup voor 50 users
4. **"Aanpassen..."** - Vertel wat je anders wilt

Wat wordt het? 🎉
