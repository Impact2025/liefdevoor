# Migratie & Activatie Plan: OogvoorLiefde.nl → LiefdevoorIedereen.nl

## Inhoudsopgave
1. [Executive Summary](#executive-summary)
2. [Fase 1: Data Voorbereiding](#fase-1-data-voorbereiding)
3. [Fase 2: Technische Migratie](#fase-2-technische-migratie)
4. [Fase 3: Activatie Campagne](#fase-3-activatie-campagne)
5. [Fase 4: Go-Live & Monitoring](#fase-4-go-live--monitoring)
6. [Risico's & Mitigatie](#risicos--mitigatie)
7. [Timeline & Milestones](#timeline--milestones)

---

## Executive Summary

### Doel
Migratie van ~5.000-17.000 actieve gebruikers van OogvoorLiefde.nl naar LiefdevoorIedereen.nl met maximale activatie en behoud van gebruikersdata.

### Belangrijkste Uitdagingen
- Legacy MySQL/MyISAM database naar modern PostgreSQL/Prisma
- Mix van MD5 en bcrypt wachtwoord hashes
- Verouderde user data (laatste activiteit tot 2025)
- Nieuwe features uitleggen aan bestaande gebruikers
- AVG/GDPR compliance bij data overdracht

### Aanbevolen Aanpak
**Opt-in Migratie**: Gebruikers krijgen uitnodiging om account te claimen op nieuwe platform, waarbij data automatisch wordt overgezet na verificatie.

---

## Fase 1: Data Voorbereiding

### 1.1 Data Cleaning & Analyse

#### Stap 1: Identificeer Actieve Gebruikers
```sql
-- Selectie criteria voor migratie-waardige accounts
SELECT COUNT(*) FROM user
WHERE active = 1
  AND mail IS NOT NULL
  AND mail != ''
  AND mail NOT LIKE '%test%'
  AND last_visit >= '2023-01-01'  -- Actief in laatste 2 jaar
```

**Verwachte segmenten:**
| Segment | Criteria | Geschat Aantal |
|---------|----------|----------------|
| **Super Actief** | last_visit in laatste 3 maanden | ~500-1.000 |
| **Actief** | last_visit 3-12 maanden | ~2.000-3.000 |
| **Slapend** | last_visit 1-2 jaar | ~3.000-5.000 |
| **Inactief** | last_visit >2 jaar | ~5.000-8.000 |

#### Stap 2: Data Quality Check
```javascript
// Validatie checks uit te voeren
const validationChecks = {
  emailFormat: 'Geldige email format',
  duplicateEmails: 'Geen duplicate emails',
  passwordHash: 'Wachtwoord hash aanwezig',
  birthDate: 'Geldige geboortedatum (niet 0000-00-00)',
  photoExists: 'Minimaal 1 foto beschikbaar',
  profileComplete: 'Naam en basis info aanwezig'
}
```

#### Stap 3: Wachtwoord Analyse
De oude database bevat twee types wachtwoord hashes:
- **MD5**: `'2e3f51dd077d7a964e1a94bdf74379f8'` (32 chars, onveilig)
- **bcrypt**: `'$2y$10$yYvxtneV0UrSrRziQld1CO...'` (60 chars, veilig)

**Strategie per type:**
| Hash Type | Detectie | Actie |
|-----------|----------|-------|
| bcrypt ($2y$, $2a$) | `password LIKE '$2%'` | Direct overnemen |
| MD5 (32 chars) | `LENGTH(password) = 32` | Forceer wachtwoord reset |

### 1.2 Data Mapping Tabel

#### User Tabel Mapping
| OogvoorLiefde (MySQL) | LiefdevoorIedereen (Prisma) | Transformatie |
|-----------------------|----------------------------|---------------|
| `user_id` (int) | `id` (cuid) | Genereer nieuwe CUID, bewaar mapping |
| `name` | `name` | Direct |
| `mail` | `email` | Lowercase, trim |
| `password` | `passwordHash` | Behoud bcrypt, invalideer MD5 |
| `gender` ('M'/'F') | `gender` (enum) | M→MALE, F→FEMALE |
| `birth` | `birthDate` | Parse date, skip '0000-00-00' |
| `city` | `city` | Direct |
| `country_id` → `geo_country` | - | Lookup landnaam |
| `register` | `createdAt` | Parse datetime |
| `last_visit` | `lastSeen` | Parse datetime |
| `is_photo` | `profileImage` | Lookup default photo |
| `type` ('gold','silver') | `subscriptionTier` | Map naar FREE/PREMIUM/GOLD |
| `active` | `isVerified` + `role` | 1→verified, ban→BANNED |

#### UserInfo Mapping
| OogvoorLiefde | LiefdevoorIedereen | Transformatie |
|---------------|-------------------|---------------|
| `essay`, `about_me` | `bio` | Merge, max 500 chars |
| `height` | `height` | Direct (cm) |
| `education` | `education` | Map naar nieuwe opties |
| `smoking` | `smoking` | Map enum |
| `drinking` | `drinking` | Map enum |
| `religion` | `religion` | Map enum |

#### Encounters → Swipe/Match
| OogvoorLiefde | LiefdevoorIedereen | Logica |
|---------------|-------------------|--------|
| `user_from`, `user_to` | `swiperId`, `swipedId` | |
| `from_reply='Y'` | `isLike=true` | Like |
| `from_reply='N'` | `isLike=false` | Dislike |
| beide `'Y'` | → Maak `Match` | Mutual like |

---

## Fase 2: Technische Migratie

### 2.1 Migratie Architectuur

```
┌─────────────────────┐     ┌──────────────────────┐
│  MySQL (Oude DB)    │     │  PostgreSQL (Nieuw)  │
│  u14932p48270_vin   │────▶│  LiefdevoorIedereen  │
└─────────────────────┘     └──────────────────────┘
         │                            │
         │  Extract                   │  Load
         ▼                            ▼
┌─────────────────────┐     ┌──────────────────────┐
│   Staging Tables    │────▶│   Migration Logs     │
│   (PostgreSQL)      │     │   ID Mapping Table   │
└─────────────────────┘     └──────────────────────┘
```

### 2.2 Migratie Script Updates

Voeg toe aan `migrate-data.js`:

```javascript
// migration-extended.js - Uitgebreide migratie

const MIGRATION_CONFIG = {
  // Alleen actieve gebruikers van laatste 2 jaar
  userFilter: `
    WHERE u.active = 1
    AND u.mail IS NOT NULL
    AND u.mail != ''
    AND u.last_visit >= '2023-01-01'
  `,

  // Batch grootte voor grote datasets
  batchSize: 500,

  // ID mapping tabel
  createMappingTable: true,

  // Wachtwoord handling
  passwordStrategy: 'force_reset_md5', // 'keep_all' | 'force_reset_all' | 'force_reset_md5'
};

// Wachtwoord type detectie
const detectPasswordType = (hash) => {
  if (!hash) return 'missing';
  if (hash.startsWith('$2y$') || hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return 'bcrypt';
  }
  if (hash.length === 32 && /^[a-f0-9]+$/.test(hash)) {
    return 'md5';
  }
  return 'unknown';
};

// Extended user transformation
const transformUserExtended = async (oldUser, oldUserInfo, idMapping) => {
  const newId = generateCuid();
  const passwordType = detectPasswordType(oldUser.password);

  // Bewaar mapping voor relaties
  idMapping.set(oldUser.user_id, newId);

  return {
    id: newId,
    name: oldUser.name?.trim() || null,
    email: oldUser.mail?.toLowerCase().trim() || null,

    // Wachtwoord strategie
    passwordHash: passwordType === 'bcrypt' ? oldUser.password : null,
    requiresPasswordReset: passwordType !== 'bcrypt',

    // Profiel data
    bio: sanitizeText(oldUserInfo?.essay || oldUserInfo?.about_me, 500),
    birthDate: parseDate(oldUser.birth),
    gender: mapGender(oldUser.gender),
    city: oldUser.city || null,

    // Nieuwe velden - defaults
    isVerified: false, // Moet opnieuw verifiëren
    isOnboarded: false, // Doorloop nieuwe onboarding
    onboardingStep: 1,
    profileComplete: false,

    // Subscription mapping
    subscriptionTier: mapSubscription(oldUser.type),

    // Tracking
    createdAt: parseDate(oldUser.register) || new Date(),
    lastSeen: parseDate(oldUser.last_visit),

    // Migratie metadata
    registrationSource: 'oogvoorliefde_migration',
  };
};

// Subscription mapping
const mapSubscription = (oldType) => {
  switch (oldType) {
    case 'gold':
    case 'platinum':
      return 'GOLD';
    case 'silver':
    case 'membership':
      return 'PREMIUM';
    default:
      return 'FREE';
  }
};
```

### 2.3 Foto Migratie

```javascript
// Photo migration met cloud upload
const migratePhotos = async (oldUserId, newUserId, idMapping) => {
  const [photos] = await mysqlConnection.execute(`
    SELECT photo_id, photo_name, default as is_default, date
    FROM photo
    WHERE user_id = ? AND visible = 'Y'
    ORDER BY \`default\` DESC, date ASC
  `, [oldUserId]);

  for (const [index, photo] of photos.entries()) {
    // 1. Download van oude server
    const oldUrl = `https://oogvoorliefde.nl/photos/${photo.photo_name}`;

    // 2. Upload naar nieuwe cloud storage (bijv. Cloudflare R2)
    const newUrl = await uploadToCloud(oldUrl, `users/${newUserId}/${photo.photo_name}`);

    // 3. Opslaan in nieuwe database
    await prisma.photo.create({
      data: {
        url: newUrl,
        order: index,
        userId: newUserId,
        createdAt: photo.date || new Date(),
      }
    });

    // 4. Set profile image als dit de default was
    if (photo.is_default === 'Y') {
      await prisma.user.update({
        where: { id: newUserId },
        data: { profileImage: newUrl }
      });
    }
  }
};
```

### 2.4 ID Mapping Tabel

```sql
-- Maak mapping tabel voor relatie migratie
CREATE TABLE migration_id_mapping (
  old_user_id INT PRIMARY KEY,
  new_user_id VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  migrated_at TIMESTAMP DEFAULT NOW(),
  activated BOOLEAN DEFAULT FALSE,
  activation_date TIMESTAMP
);

-- Index voor snelle lookups
CREATE INDEX idx_mapping_new_id ON migration_id_mapping(new_user_id);
CREATE INDEX idx_mapping_email ON migration_id_mapping(email);
```

---

## Fase 3: Activatie Campagne

### 3.1 Campagne Strategie Overzicht

```
                    ┌─────────────────────────────────┐
                    │     MIGRATIE CAMPAGNE           │
                    │   "Welkom bij de Toekomst"      │
                    └─────────────────────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
     ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
     │   WEEK 1-2  │       │   WEEK 3-4  │       │   WEEK 5-8  │
     │   VIP Wave  │       │ Main Launch │       │  Re-engage  │
     │  (Super Act)│       │  (Actief)   │       │  (Slapend)  │
     └─────────────┘       └─────────────┘       └─────────────┘
```

### 3.2 Activatie Waves

#### Wave 1: VIP Preview (Week 1-2)
**Doelgroep:** Super actieve gebruikers (laatste 3 maanden actief)
**Geschat:** ~500-1.000 gebruikers

**Email Subject:** "Je bent uitgenodigd: Exclusieve preview LiefdevoorIedereen.nl"

**Inhoud:**
- Persoonlijke uitnodiging als "founding member"
- Exclusieve vroege toegang
- Gratis PREMIUM upgrade voor 3 maanden
- Direct account claim met 1-click verificatie

```typescript
// Wave 1 Email Template Data
const wave1Template = {
  segment: 'vip_preview',
  incentive: {
    type: 'free_premium',
    duration: '3_months',
    value: '€38,97'
  },
  urgency: 'exclusief_early_access',
  cta: 'Claim je Account',
  deadline: '14 dagen'
};
```

#### Wave 2: Main Launch (Week 3-4)
**Doelgroep:** Actieve gebruikers (3-12 maanden geleden actief)
**Geschat:** ~2.000-3.000 gebruikers

**Email Subject:** "OogvoorLiefde wordt LiefdevoorIedereen - Claim je profiel!"

**Inhoud:**
- Aankondiging van de transitie
- Overzicht nieuwe features
- Gratis PREMIUM upgrade voor 1 maand
- Data behoud garantie

```typescript
const wave2Template = {
  segment: 'main_launch',
  incentive: {
    type: 'free_premium',
    duration: '1_month',
    value: '€12,99'
  },
  urgency: 'profiel_behouden',
  cta: 'Activeer je Profiel',
  deadline: '30 dagen'
};
```

#### Wave 3: Re-engagement (Week 5-8)
**Doelgroep:** Slapende gebruikers (1-2 jaar geleden actief)
**Geschat:** ~3.000-5.000 gebruikers

**Email Subject:** "We missen je! Nieuwe kans op liefde bij LiefdevoorIedereen"

**Inhoud:**
- "Het is een tijdje geleden..."
- Showcase nieuwe features
- Testimonials van succesvolle matches
- Speciale welkom-terug bonus

```typescript
const wave3Template = {
  segment: 're_engagement',
  incentive: {
    type: 'credits_bonus',
    amount: 5,
    description: '5 gratis SuperBerichten'
  },
  newFeatures: [
    'AI-powered matching',
    'Voice berichten',
    'Liveness verificatie',
    'Nieuw modern design'
  ],
  cta: 'Ontdek het Nieuwe Platform',
  deadline: '60 dagen'
};
```

### 3.3 Email Templates

#### Claim Account Email
```tsx
// lib/email/templates/migration/claim-account.tsx

import { Button, Container, Heading, Text, Section } from '@react-email/components';

interface ClaimAccountEmailProps {
  userName: string;
  claimUrl: string;
  incentive: string;
  deadline: string;
  matchesWaiting: number;
}

export default function ClaimAccountEmail({
  userName,
  claimUrl,
  incentive,
  deadline,
  matchesWaiting
}: ClaimAccountEmailProps) {
  return (
    <Container>
      <Heading>
        Hoi {userName}, je profiel staat klaar!
      </Heading>

      <Text>
        OogvoorLiefde.nl wordt LiefdevoorIedereen.nl - een compleet
        vernieuwde dating ervaring speciaal voor mensen met een beperking.
      </Text>

      <Section style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px' }}>
        <Text style={{ fontWeight: 'bold' }}>
          Jouw voordelen bij overstap:
        </Text>
        <ul>
          <li>✅ Al je profieldata automatisch overgezet</li>
          <li>✅ Je foto's en berichten bewaard</li>
          <li>✅ {incentive}</li>
          {matchesWaiting > 0 && (
            <li>💕 {matchesWaiting} potentiële matches wachten op je!</li>
          )}
        </ul>
      </Section>

      <Button href={claimUrl} style={{
        background: '#e11d48',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px'
      }}>
        Claim je Account
      </Button>

      <Text style={{ fontSize: '14px', color: '#666' }}>
        Deze link is geldig tot {deadline}. Daarna wordt je data
        permanent verwijderd conform AVG.
      </Text>
    </Container>
  );
}
```

### 3.4 Claim Flow Implementatie

```typescript
// app/api/migration/claim/route.ts

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/send';
import { generateClaimToken, verifyClaimToken } from '@/lib/migration/tokens';

export async function POST(req: Request) {
  const { email } = await req.json();

  // 1. Check of user bestaat in mapping
  const mapping = await prisma.migrationMapping.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!mapping) {
    return Response.json({ error: 'Email niet gevonden' }, { status: 404 });
  }

  if (mapping.activated) {
    return Response.json({ error: 'Account al geactiveerd' }, { status: 400 });
  }

  // 2. Genereer secure claim token
  const claimToken = await generateClaimToken({
    oldUserId: mapping.oldUserId,
    newUserId: mapping.newUserId,
    email: mapping.email,
    expiresIn: '7d'
  });

  // 3. Stuur claim email
  const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${claimToken}`;

  await sendEmail({
    to: email,
    subject: 'Bevestig je account op LiefdevoorIedereen.nl',
    template: 'migration-claim-verify',
    data: { claimUrl, userName: mapping.userName }
  });

  return Response.json({ success: true });
}
```

### 3.5 Claim Pagina

```typescript
// app/claim/[token]/page.tsx

export default async function ClaimPage({ params }: { params: { token: string }}) {
  const claim = await verifyClaimToken(params.token);

  if (!claim) {
    return <InvalidTokenPage />;
  }

  // Haal gemigreerde data op
  const user = await prisma.user.findUnique({
    where: { id: claim.newUserId },
    include: { photos: true }
  });

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold">
        Welkom terug, {user.name}!
      </h1>

      <div className="my-6 p-4 bg-green-50 rounded-lg">
        <p>✅ Je profielgegevens zijn overgezet</p>
        <p>✅ {user.photos.length} foto's bewaard</p>
      </div>

      {/* Wachtwoord reset formulier */}
      <ClaimForm
        userId={user.id}
        requiresPasswordReset={user.requiresPasswordReset}
        onComplete="/onboarding/welcome-back"
      />
    </div>
  );
}
```

### 3.6 Marketing Kanalen

#### Email Campagne
- **Tool:** Resend (al geïntegreerd)
- **Sending:** Max 100/uur eerste dag, opschalen naar 500/uur
- **A/B testing:** Subject lines, CTA buttons

#### SMS (Optioneel)
Voor super-actieve gebruikers die niet reageren op email:
```
"Hoi [naam]! Je LiefdevoorIedereen profiel staat klaar.
Claim binnen 7 dagen: [link]. Groetjes, Team Liefde"
```

#### Sociale Media
- Facebook post in OogvoorLiefde groep
- LinkedIn aankondiging (zakelijk)
- Instagram story met countdown

---

## Fase 4: Go-Live & Monitoring

### 4.1 Launch Checklist

```markdown
## Pre-Launch (T-7 dagen)
- [ ] Alle data gemigreerd naar staging
- [ ] Email templates goedgekeurd
- [ ] Claim flow getest met 10 beta users
- [ ] DNS redirect gepland (oogvoorliefde.nl → liefdeveoriedereen.nl)
- [ ] Support team gebriefd
- [ ] FAQ pagina bijgewerkt

## Launch Day (T-0)
- [ ] Wave 1 emails verzonden (VIP)
- [ ] Monitoring dashboard actief
- [ ] Support chat bemand
- [ ] Social media posts live

## Post-Launch (T+7 dagen)
- [ ] Wave 2 emails verzonden
- [ ] Eerste metrics review
- [ ] Bug fixes deployed
- [ ] Success stories verzameld
```

### 4.2 KPI Dashboard

```typescript
// lib/migration/analytics.ts

interface MigrationMetrics {
  // Claim metrics
  emailsSent: number;
  emailsOpened: number;
  claimLinksClicked: number;
  accountsClaimed: number;

  // Activation metrics
  onboardingStarted: number;
  onboardingCompleted: number;
  firstSwipesDone: number;
  firstMessagesSent: number;

  // Conversion funnel
  emailToClaimRate: number;      // Target: >30%
  claimToActivationRate: number; // Target: >70%
  activationToEngagement: number; // Target: >50%
}

// Dashboard API
export async function getMigrationDashboard(): Promise<MigrationMetrics> {
  const [
    emailStats,
    claimStats,
    activationStats
  ] = await Promise.all([
    getEmailStats(),
    getClaimStats(),
    getActivationStats()
  ]);

  return {
    ...emailStats,
    ...claimStats,
    ...activationStats,
    emailToClaimRate: (claimStats.accountsClaimed / emailStats.emailsSent) * 100,
    claimToActivationRate: (activationStats.onboardingCompleted / claimStats.accountsClaimed) * 100,
    activationToEngagement: (activationStats.firstMessagesSent / activationStats.onboardingCompleted) * 100,
  };
}
```

### 4.3 Monitoring Alerts

```typescript
// Stel alerts in voor kritieke metrics
const migrationAlerts = [
  {
    metric: 'claim_rate_24h',
    threshold: '<5%',
    action: 'Check email deliverability'
  },
  {
    metric: 'bounce_rate',
    threshold: '>10%',
    action: 'Pause campaign, clean email list'
  },
  {
    metric: 'unsubscribe_rate',
    threshold: '>2%',
    action: 'Review email content'
  },
  {
    metric: 'claim_errors',
    threshold: '>50/hour',
    action: 'Alert development team'
  }
];
```

---

## Risico's & Mitigatie

### Risico Matrix

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| **Email deliverability issues** | Hoog | Medium | Warm-up domain, SPF/DKIM setup, phased sending |
| **Wachtwoord reset frustratie** | Medium | Hoog | Duidelijke communicatie, magic link optie |
| **Data verlies tijdens migratie** | Kritiek | Laag | Full backups, staged rollout, rollback plan |
| **Server overload bij launch** | Hoog | Medium | Cloudflare caching, rate limiting, auto-scaling |
| **AVG klachten** | Medium | Laag | Opt-in proces, duidelijke privacy notice |
| **Negatieve reacties oude users** | Medium | Medium | Proactieve communicatie, support standby |

### Rollback Plan

```markdown
## Als claim rate <2% na 48 uur:
1. Pauzeer email campagne
2. Analyseer open/click rates
3. A/B test nieuwe subject lines
4. Overweeg SMS fallback

## Als technische issues:
1. Disable claim endpoint
2. Show maintenance page
3. Fix issues in staging
4. Re-enable met monitoring

## Als data issues:
1. Stop migratie script
2. Restore van backup
3. Fix transformation logic
4. Re-run met validation
```

---

## Timeline & Milestones

```
Week -2  │ Data cleaning & preparation
         │ Email templates finaliseren
         │ Claim flow development
         │
Week -1  │ Staging migratie
         │ Beta test met 10-20 users
         │ Load testing
         │
Week 0   │ 🚀 LAUNCH
         │ Wave 1: VIP emails (500-1000)
         │ Monitoring & support
         │
Week 1   │ Wave 1 follow-up
         │ Metrics review
         │ Bug fixes
         │
Week 2   │ Wave 2: Main launch (2000-3000)
         │ Success stories verzamelen
         │
Week 3-4 │ Wave 2 follow-ups
         │ Prepare Wave 3
         │
Week 5-8 │ Wave 3: Re-engagement
         │ Final cleanup
         │
Week 9+  │ Post-migratie review
         │ Archive oude data
         │ Close OogvoorLiefde.nl
```

---

## Appendix A: SQL Queries voor Data Extractie

```sql
-- Actieve gebruikers laatste 2 jaar
SELECT
  u.user_id,
  u.name,
  u.mail,
  u.password,
  u.gender,
  u.birth,
  u.city,
  u.register,
  u.last_visit,
  u.type,
  u.active,
  ui.essay,
  ui.about_me,
  COUNT(p.photo_id) as photo_count
FROM user u
LEFT JOIN userinfo ui ON u.user_id = ui.user_id
LEFT JOIN photo p ON u.user_id = p.user_id AND p.visible = 'Y'
WHERE u.active = 1
  AND u.mail IS NOT NULL
  AND u.mail != ''
  AND u.last_visit >= '2023-01-01'
GROUP BY u.user_id
ORDER BY u.last_visit DESC;

-- Matches voor migratie
SELECT
  e.id,
  e.user_from,
  e.user_to,
  e.from_reply,
  e.to_reply
FROM encounters e
JOIN user u1 ON e.user_from = u1.user_id AND u1.active = 1
JOIN user u2 ON e.user_to = u2.user_id AND u2.active = 1
WHERE e.from_reply = 'Y' AND e.to_reply = 'Y';
```

---

## Appendix B: Contactpunten

| Rol | Verantwoordelijkheid |
|-----|---------------------|
| **Project Lead** | Overall coördinatie |
| **Backend Dev** | Migratie scripts, API |
| **Frontend Dev** | Claim pages, onboarding |
| **Email Marketing** | Templates, A/B testing |
| **Support Lead** | Gebruikersvragen |
| **Legal/Privacy** | AVG compliance |

---

*Document versie: 1.0*
*Laatste update: 13 januari 2026*
*Auteur: Claude Code*
