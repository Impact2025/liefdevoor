# WERELDKLASSE Migratie & Activatie Plan
## OogvoorLiefde.nl → LiefdevoorIedereen.nl

> **Dit document upgradet het basisplan naar wereldklasse niveau met bewezen conversion-optimalisatie technieken.**

---

## Wat Maakt Dit Wereldklasse?

| Standaard Migratie | Wereldklasse Migratie |
|--------------------|----------------------|
| Generieke email | Persoonlijke landingspagina |
| Eén couponcode | Unieke code per gebruiker |
| Alleen email | Email + SMS + WhatsApp |
| "Claim je account" | "Sophie, 3 mannen wachten op je" |
| Tekst-based | Video van oprichter |
| Eenmalige email | 7-touch nurture sequence |
| Geen urgentie | Countdown + scarcity |
| Geen social proof | Live activatie ticker |
| Geen referral | "Nodig vrienden uit" bonus |

---

## 1. PERSOONLIJKE LANDINGSPAGINA

### Concept: `/welkom/[token]`

Elke gebruiker krijgt een **unieke, gepersonaliseerde landingspagina**:

```
https://liefdeveoriedereen.nl/welkom/sophie-abc123
```

### Pagina Layout

```tsx
// app/welkom/[token]/page.tsx

export default async function PersonalWelcomePage({ params }) {
  const migrationData = await getMigrationData(params.token);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero met persoonlijke foto */}
      <section className="relative h-[60vh]">
        <div className="absolute inset-0 bg-black/40" />
        <Image
          src={migrationData.userPhoto || '/images/default-hero.jpg'}
          fill
          className="object-cover"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            Welkom terug, {migrationData.firstName}!
          </h1>
          <p className="text-xl mt-4 opacity-90">
            Je profiel staat klaar op LiefdevoorIedereen.nl
          </p>
        </div>
      </section>

      {/* Persoonlijke statistieken */}
      <section className="py-12 -mt-20 relative z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">

            {/* Matches wachten op je */}
            {migrationData.potentialMatches > 0 && (
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-6 text-white mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {migrationData.matchPreviews.slice(0, 3).map((match, i) => (
                      <Avatar
                        key={i}
                        src={match.photo}
                        className="w-16 h-16 border-4 border-white"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {migrationData.potentialMatches} potentiële matches
                    </p>
                    <p className="opacity-90">wachten om je te ontmoeten</p>
                  </div>
                </div>
              </div>
            )}

            {/* Je data is bewaard */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon="📸"
                value={migrationData.photoCount}
                label="foto's bewaard"
              />
              <StatCard
                icon="💬"
                value={migrationData.messageCount}
                label="berichten"
              />
              <StatCard
                icon="📅"
                value={formatDate(migrationData.memberSince)}
                label="lid sinds"
              />
            </div>

            {/* Persoonlijke couponcode */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">
                    Jouw persoonlijke welkomstcode
                  </p>
                  <p className="text-3xl font-mono font-bold text-amber-900">
                    {migrationData.couponCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-900">
                    3 maanden GRATIS
                  </p>
                  <p className="text-amber-700">Premium (waarde €38,97)</p>
                </div>
              </div>

              {/* Countdown timer */}
              <div className="mt-4 pt-4 border-t border-amber-200">
                <CountdownTimer
                  deadline={migrationData.couponExpiry}
                  label="Code verloopt over"
                />
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size="xl"
              className="w-full bg-rose-600 hover:bg-rose-700 text-xl py-6"
              onClick={() => trackAndRedirect('claim_clicked')}
            >
              Activeer Mijn Account
              <ArrowRight className="ml-2" />
            </Button>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" /> AVG-compliant
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" /> Veilige overdracht
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> Geen betaling nodig
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Video van oprichter */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Een persoonlijk bericht van onze oprichter
          </h2>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
            <video
              src="/videos/founder-welcome.mp4"
              poster="/images/founder-thumbnail.jpg"
              controls
              className="w-full h-full"
            />
          </div>
          <p className="mt-4 text-gray-600">
            "Waarom we van OogvoorLiefde naar LiefdevoorIedereen gaan"
          </p>
        </div>
      </section>

      {/* Wat is nieuw */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Wat is er nieuw?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon="🧠"
              title="AI-Powered Matching"
              description="Slimmere matches op basis van persoonlijkheid, niet alleen filters"
            />
            <FeatureCard
              icon="🎤"
              title="Voice Berichten"
              description="Stuur spraakberichten - persoonlijker dan tekst"
            />
            <FeatureCard
              icon="🛡️"
              title="Liveness Verificatie"
              description="Echte mensen, geen catfish - iedereen is geverifieerd"
            />
            <FeatureCard
              icon="♿"
              title="Toegankelijk Design"
              description="Speciaal ontworpen voor mensen met een beperking"
            />
          </div>
        </div>
      </section>

      {/* Social proof - Live activatie ticker */}
      <section className="py-8 bg-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <LiveActivationTicker />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Veelgestelde vragen
          </h2>
          <Accordion>
            <AccordionItem title="Moet ik opnieuw betalen?">
              Nee! Als je een actief abonnement had, wordt dit 1-op-1 overgezet.
              Plus: je krijgt 3 maanden GRATIS Premium erbij.
            </AccordionItem>
            <AccordionItem title="Wat gebeurt er met mijn berichten?">
              Al je conversaties worden bewaard en overgezet.
            </AccordionItem>
            <AccordionItem title="Kan ik ook op de oude site blijven?">
              OogvoorLiefde.nl sluit op [datum]. Activeer je account voor die
              tijd om je data te behouden.
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden">
        <Button className="w-full bg-rose-600">
          Activeer Nu - Gratis
        </Button>
      </div>
    </div>
  );
}
```

---

## 2. GEPERSONALISEERDE COUPONCODES

### Coupon Structuur

```
WELKOM-[NAAM]-[JAAR]

Voorbeelden:
- WELKOM-SOPHIE-2019   (lid sinds 2019)
- WELKOM-JAN-VIP       (super actief)
- WELKOM-MARIA-GOLD    (had gold membership)
```

### Coupon Generatie Script

```typescript
// scripts/generate-migration-coupons.ts

import { prisma } from '@/lib/prisma';

interface MigrationUserData {
  oldUserId: number;
  firstName: string;
  email: string;
  memberSince: Date;
  wasGold: boolean;
  isVIP: boolean; // laatste 3 maanden actief
}

async function generatePersonalizedCoupon(user: MigrationUserData) {
  // Bepaal coupon waarde op basis van user segment
  let couponValue: { type: string; value: number; months: number };

  if (user.isVIP) {
    couponValue = { type: 'FREE_TRIAL', value: 100, months: 3 }; // 3 maanden gratis
  } else if (user.wasGold) {
    couponValue = { type: 'FREE_TRIAL', value: 100, months: 2 }; // 2 maanden gratis
  } else {
    couponValue = { type: 'FREE_TRIAL', value: 100, months: 1 }; // 1 maand gratis
  }

  // Genereer unieke code
  const suffix = user.isVIP ? 'VIP' : user.memberSince.getFullYear().toString();
  const code = `WELKOM-${user.firstName.toUpperCase().slice(0, 8)}-${suffix}`;

  // Maak coupon aan
  const coupon = await prisma.coupon.create({
    data: {
      code,
      description: `Migratie coupon voor ${user.email}`,
      type: 'FREE_TRIAL',
      value: couponValue.months,
      applicableTo: 'SUBSCRIPTION',
      maxTotalUses: 1,
      maxUsesPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dagen geldig
      isActive: true,
      notes: JSON.stringify({
        migrationType: 'oogvoorliefde',
        oldUserId: user.oldUserId,
        segment: user.isVIP ? 'vip' : user.wasGold ? 'gold' : 'standard'
      })
    }
  });

  return coupon;
}

// Batch generatie voor alle migratie users
async function generateAllMigrationCoupons() {
  const migrationUsers = await prisma.migrationMapping.findMany({
    where: { activated: false }
  });

  console.log(`Generating coupons for ${migrationUsers.length} users...`);

  for (const user of migrationUsers) {
    try {
      const coupon = await generatePersonalizedCoupon({
        oldUserId: user.oldUserId,
        firstName: user.firstName,
        email: user.email,
        memberSince: user.memberSince,
        wasGold: user.wasGold,
        isVIP: user.isVIP
      });

      // Update mapping met coupon code
      await prisma.migrationMapping.update({
        where: { id: user.id },
        data: { couponCode: coupon.code }
      });

      console.log(`✅ Created coupon ${coupon.code} for ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed for ${user.email}:`, error);
    }
  }
}
```

### Coupon Tracking Dashboard

```typescript
// Metrics voor coupon performance
interface CouponMigrationMetrics {
  totalGenerated: number;
  totalRedeemed: number;
  redemptionRate: number;
  bySegment: {
    vip: { generated: number; redeemed: number; rate: number };
    gold: { generated: number; redeemed: number; rate: number };
    standard: { generated: number; redeemed: number; rate: number };
  };
  revenue: {
    potentialMRR: number;      // Als iedereen na trial blijft
    actualConversions: number; // Na trial blijven betalen
  };
}
```

---

## 3. MULTI-CHANNEL OUTREACH

### Channel Strategie

```
                    Email
                   (Primary)
                      │
         ┌───────────┼───────────┐
         │           │           │
    WhatsApp    Retargeting     SMS
   (Engaged)      Ads        (No open)
         │           │           │
         └───────────┼───────────┘
                     │
              Physical Mail
              (Last resort)
```

### Email Sequence (7 touches)

| Dag | Email | Subject Line | Focus |
|-----|-------|--------------|-------|
| 0 | Welcome | "Sophie, je profiel staat klaar" | Eerste uitnodiging |
| 3 | Reminder | "3 mensen bekeken je profiel" | Social proof |
| 7 | FOMO | "Je coupon verloopt over 7 dagen" | Urgency |
| 10 | Value | "Wat is er nieuw?" | Features |
| 14 | Social | "Maria uit Utrecht activeerde haar profiel" | Social proof |
| 21 | Last chance | "Laatste kans: morgen sluiten we je data" | Scarcity |
| 28 | Goodbye | "We hebben je data verwijderd" | Loss aversion |

### WhatsApp Template (Opt-in only)

```
Hoi {naam}! 👋

Je OogvoorLiefde profiel is nu beschikbaar op LiefdevoorIedereen.nl

🎁 Jouw welkomstcadeau: 3 maanden GRATIS Premium

Activeer hier: {link}

Groetjes, Team Liefde ❤️

---
Antwoord STOP om geen berichten meer te ontvangen
```

### SMS Fallback (alleen bij geen email open na 14 dagen)

```
{naam}, je LiefdevoorIedereen account wacht!
3 mnd GRATIS: {short_link}
Code: {coupon}
```

---

## 4. LIVE SOCIAL PROOF

### Activatie Ticker Component

```tsx
// components/migration/LiveActivationTicker.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activation {
  name: string;
  city: string;
  timeAgo: string;
}

export function LiveActivationTicker() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Fetch recent activations
    fetch('/api/migration/recent-activations')
      .then(res => res.json())
      .then(data => setActivations(data.activations));

    // Rotate every 5 seconds
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % activations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activations.length]);

  if (activations.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-white"
        >
          <strong>{activations[current].name}</strong> uit {activations[current].city}{' '}
          activeerde {activations[current].timeAgo}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
```

### Counter Widget

```tsx
// "Sluit je aan bij 847 anderen die al zijn overgestapt"

export function MigrationCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch('/api/migration/stats')
      .then(res => res.json())
      .then(data => setCount(data.totalActivated));
  }, []);

  return (
    <div className="text-center py-8">
      <p className="text-lg text-gray-600">
        Sluit je aan bij
      </p>
      <p className="text-5xl font-bold text-rose-600 my-2">
        <CountUp end={count} duration={2} />
      </p>
      <p className="text-lg text-gray-600">
        anderen die al zijn overgestapt
      </p>
    </div>
  );
}
```

---

## 5. REFERRAL PROGRAMMA

### "Nodig Je OogvoorLiefde Vrienden Uit"

```tsx
// Referral bonus voor gemigreerde users
interface MigrationReferralBonus {
  referrer: {
    perReferral: number;           // 5 SuperBerichten
    maxReferrals: number;          // Max 10
    bonusPremiumDays: number;      // +7 dagen per referral
  };
  referred: {
    signupBonus: number;           // 3 SuperBerichten
    extraPremiumDays: number;      // +14 dagen Premium
  };
}

// Referral tracking
model MigrationReferral {
  id            String   @id @default(cuid())
  referrerId    String
  referredEmail String
  status        String   @default("pending") // pending, activated, expired
  rewardsClaimed Boolean @default(false)
  createdAt     DateTime @default(now())
  activatedAt   DateTime?
}
```

### Referral Email Template

```
Subject: {naam}, nodig je OogvoorLiefde vrienden uit en verdien beloningen!

---

Hoi {naam},

Fijn dat je bent overgestapt naar LiefdevoorIedereen! 🎉

Ken je nog andere mensen van OogvoorLiefde? Nodig ze uit en jullie krijgen
ALLEBEI een beloning:

🎁 JIJ KRIJGT (per vriend):
• 5 SuperBerichten
• 7 extra dagen Premium

🎁 JE VRIEND KRIJGT:
• 3 SuperBerichten
• 14 dagen extra Premium (bovenop hun welkomstbonus)

Jouw persoonlijke uitnodigingslink:
{referral_link}

Of deel deze code: {referral_code}

---

Je hebt al {count} vrienden uitgenodigd.
Nog {remaining} uitnodigingen beschikbaar.
```

---

## 6. GAMIFICATION & PROGRESS

### Onboarding Progress Bar

```tsx
// Na claim: laat zien wat ze nog moeten doen voor volledige toegang

const migrationOnboardingSteps = [
  { id: 'claim', label: 'Account geclaimd', icon: '✓', done: true },
  { id: 'password', label: 'Wachtwoord ingesteld', icon: '🔐', done: false },
  { id: 'photo_verify', label: 'Foto geverifieerd', icon: '📸', done: false },
  { id: 'profile_update', label: 'Profiel bijgewerkt', icon: '✏️', done: false },
  { id: 'first_swipe', label: 'Eerste swipe', icon: '💕', done: false },
];

// Progress bar component
export function MigrationProgress({ steps }) {
  const completed = steps.filter(s => s.done).length;
  const percentage = (completed / steps.length) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Je voortgang</h3>
        <span className="text-rose-600 font-bold">{percentage}%</span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
        />
      </div>

      <div className="mt-6 space-y-3">
        {steps.map(step => (
          <div
            key={step.id}
            className={`flex items-center gap-3 ${
              step.done ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{step.done ? '✅' : step.icon}</span>
            <span>{step.label}</span>
            {!step.done && (
              <Button size="sm" variant="outline" className="ml-auto">
                Doe nu
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Beloning bij 100% */}
      {percentage < 100 && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <p className="text-amber-800">
            🎁 Rond je profiel af en ontvang <strong>5 extra SuperBerichten</strong>!
          </p>
        </div>
      )}
    </div>
  );
}
```

### Achievement Badges

```tsx
const migrationBadges = [
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Eén van de eerste 100 die overstapte',
    icon: '🌟',
    rarity: 'legendary'
  },
  {
    id: 'oogvoorliefde_veteran',
    name: 'OogvoorLiefde Veteraan',
    description: 'Lid sinds 2019 of eerder',
    icon: '🏆',
    rarity: 'epic'
  },
  {
    id: 'connector',
    name: 'Connector',
    description: '3+ vrienden uitgenodigd',
    icon: '🤝',
    rarity: 'rare'
  },
  {
    id: 'profile_perfectionist',
    name: 'Profiel Perfectionist',
    description: 'Profiel 100% compleet binnen 24 uur',
    icon: '✨',
    rarity: 'uncommon'
  }
];
```

---

## 7. COUNTDOWN & URGENCY

### Dynamic Countdown Component

```tsx
// components/migration/CountdownTimer.tsx

'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  deadline,
  onExpire,
  label = "Code verloopt over"
}: {
  deadline: Date;
  onExpire?: () => void;
  label?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(deadline).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (!timeLeft) return null;

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex justify-center gap-4">
        <TimeUnit value={timeLeft.days} label="dagen" />
        <TimeUnit value={timeLeft.hours} label="uren" />
        <TimeUnit value={timeLeft.minutes} label="min" />
        <TimeUnit value={timeLeft.seconds} label="sec" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold font-mono bg-gray-900 text-white px-3 py-2 rounded">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}
```

### Scarcity Messages

```typescript
const scarcityMessages = {
  veryUrgent: "⚠️ Je code verloopt VANDAAG om middernacht!",
  urgent: "⏰ Nog maar 3 dagen om je account te activeren",
  moderate: "📅 Je hebt nog 7 dagen om je gratis Premium te claimen",
  standard: "🎁 Activeer binnen 30 dagen en ontvang 3 maanden gratis"
};

// Dynamic message based on days left
function getScarcityMessage(daysLeft: number): string {
  if (daysLeft <= 1) return scarcityMessages.veryUrgent;
  if (daysLeft <= 3) return scarcityMessages.urgent;
  if (daysLeft <= 7) return scarcityMessages.moderate;
  return scarcityMessages.standard;
}
```

---

## 8. ANALYTICS & TRACKING

### UTM Parameters

```
Alle links met tracking:
?utm_source=migration
&utm_medium=email
&utm_campaign=wave1_vip
&utm_content=cta_button
&ref={user_id}
```

### Event Tracking

```typescript
// lib/migration/analytics.ts

const migrationEvents = {
  // Email events
  EMAIL_SENT: 'migration_email_sent',
  EMAIL_OPENED: 'migration_email_opened',
  EMAIL_CLICKED: 'migration_email_clicked',

  // Landing page events
  LANDING_VIEWED: 'migration_landing_viewed',
  VIDEO_PLAYED: 'migration_video_played',
  FAQ_EXPANDED: 'migration_faq_expanded',

  // Conversion events
  CLAIM_STARTED: 'migration_claim_started',
  CLAIM_COMPLETED: 'migration_claim_completed',
  COUPON_APPLIED: 'migration_coupon_applied',
  ONBOARDING_STEP: 'migration_onboarding_step',

  // Engagement events
  FIRST_SWIPE: 'migration_first_swipe',
  FIRST_MESSAGE: 'migration_first_message',
  REFERRAL_SENT: 'migration_referral_sent',

  // Churn events
  COUPON_EXPIRED: 'migration_coupon_expired',
  DATA_DELETED: 'migration_data_deleted'
};

// Track event
async function trackMigrationEvent(
  event: string,
  userId: string,
  properties: Record<string, any>
) {
  await prisma.migrationEvent.create({
    data: {
      event,
      userId,
      properties,
      timestamp: new Date()
    }
  });

  // Also send to analytics provider (Mixpanel, Amplitude, etc.)
  if (process.env.MIXPANEL_TOKEN) {
    mixpanel.track(event, { distinct_id: userId, ...properties });
  }
}
```

---

## 9. IMPLEMENTATIE CHECKLIST

### Week -2: Voorbereiding

- [ ] Database migratie script uitbreiden
- [ ] Persoonlijke landingspagina bouwen
- [ ] Coupon generatie script
- [ ] Email templates (7 sequence)
- [ ] Video van oprichter opnemen
- [ ] WhatsApp Business API setup

### Week -1: Testing

- [ ] A/B test subject lines
- [ ] Load test landing pages
- [ ] Test coupon redemption flow
- [ ] Test email deliverability (warm-up)
- [ ] Beta met 20 echte users

### Week 0: Launch Wave 1

- [ ] VIP segment emails verzenden
- [ ] Real-time dashboard monitoren
- [ ] Support team standby
- [ ] Social media posts live

### Week 1-2: Optimize

- [ ] Analyseer open/click rates
- [ ] A/B test winnaar doorvoeren
- [ ] WhatsApp follow-up voor non-openers
- [ ] Prepare Wave 2

### Week 3-8: Scale

- [ ] Wave 2 & 3 uitrollen
- [ ] Referral programma activeren
- [ ] Retargeting ads starten
- [ ] Success stories verzamelen

---

## 10. SUCCESS METRICS

### Target KPIs (Wereldklasse)

| Metric | Standaard | Goed | Wereldklasse |
|--------|-----------|------|--------------|
| Email open rate | 15% | 25% | **40%+** |
| Click-through rate | 2% | 5% | **10%+** |
| Claim rate | 10% | 20% | **35%+** |
| Activation rate | 50% | 70% | **85%+** |
| 30-day retention | 30% | 50% | **70%+** |
| Referral rate | 5% | 10% | **20%+** |
| Premium conversion | 5% | 10% | **15%+** |

---

*Dit plan combineert bewezen growth hacking technieken met empathische communicatie specifiek voor de doelgroep van mensen met een beperking.*

**Volgende stap:** Wil je dat ik begin met de implementatie van de persoonlijke landingspagina of het coupon systeem uitbreiden?
