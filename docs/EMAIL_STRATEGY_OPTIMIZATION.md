# Email Strategy Optimization Plan
## Migration Campaign - Liefde Voor Iedereen

**Datum:** 1 februari 2026
**Status:** URGENT - Conversie moet omhoog!

---

## 🚨 CRITICAL ISSUES GEVONDEN

### 1. Email Tracking is Kapot (PRIORITY 1)

**Probleem:**
- **0% open rate** tracking
- **0% click rate** tracking
- Webhooks zijn niet geconfigureerd in Resend

**Impact:**
- Geen visibility in wat werkt
- Kunnen niet A/B testen
- Geen spam folder detectie
- Geen real-time status tracking

**Oplossing:**
1. Setup Resend webhooks VANDAAG (5 minuten werk)
2. Volg instructies in `docs/RESEND_WEBHOOK_SETUP.md`
3. Test met 1 email
4. Verify tracking werkt voordat meer emails worden verstuurd

**Verwacht resultaat:**
- Van 0% → 25%+ open rate visibility
- Real-time status updates
- Betere data voor optimalisatie

---

### 2. INACTIVE Segment Vernietigt Overall Stats (PRIORITY 2)

**Probleem:**
- INACTIVE: **1.2%** Email → Landing conversie
- INACTIVE is **93%** van alle verzonden emails (5000 van 5377)
- Trekt overall conversie van 10%+ naar 2.3%

**Vergelijking:**
| Segment | Email→Landing | Volume Verzonden |
|---------|--------------|-----------------|
| VIP | 27.3% ✅ | 66 |
| ACTIVE | 19.2% ✅ | 73 |
| DORMANT | 14.1% ✅ | 163 |
| GOLD | 13.3% ✅ | 75 |
| **INACTIVE** | **1.2% ❌** | **5000** |

**Conclusie:** High-value segments presteren excellent! INACTIVE heeft gewoon geen interesse.

---

## 💡 STRATEGISCHE AANBEVELINGEN

### Optie A: STOP INACTIVE Emails (Aanbevolen)

**Redenen:**
1. ROI is negatief (1.2% conversie = 60 activaties van 5000 emails)
2. Risico op spam klachten → schaadt deliverability voor andere segmenten
3. Kost Resend credits
4. Geen waardevolle users (INACTIVE > 2 jaar)

**Actie:**
```bash
# Update migration-batch-send.ts om INACTIVE te skippen
# Focus op high-value segments
```

**Expected outcome:**
- Overall conversie: 2.3% → 15%+
- Betere email reputation
- Meer budget voor retargeting high-value users

### Optie B: Optimaliseer INACTIVE Email (Experimenteel)

Als je toch wilt proberen INACTIVE te converteren:

**Nieuwe INACTIVE-specifieke strategie:**

#### 1. Drastisch Andere Messaging

**Huidig probleem:** Te veel tekst, te corporate, te weinig urgentie

**Nieuw:**
- **Subject:** "Je account wordt verwijderd 🗑️ - laatste kans"
- **Tone:** Direct, urgent, persoonlijk
- **Length:** 50% korter
- **Focus:** FOMO (Fear Of Missing Out)
- **Incentive:** Verhoog naar 3 maanden Premium (niet 0!)

#### 2. Simplified Email Template

```tsx
// lib/email/templates/migration/welcome-inactive.tsx
// Ultra-kort, mobile-first, 1 CTA
```

#### 3. Alternatieve Kanalen

Voor INACTIVE segment die niet op email reageren:
- SMS reminder (indien telefoonnummer beschikbaar)
- Push notification via oude app
- Retargeting ads op social media

---

## 📧 EMAIL IMPROVEMENTS (All Segments)

### Subject Line Optimization

**Huidige subject lines zijn te lang en weinig urgent:**

```typescript
// ❌ TE LANG:
"Geweldig nieuws [naam]! OogvoorLiefde wordt Liefde Voor Iedereen"
// 62 karakters - wordt afgesneden op mobile

// ✅ BETER:
"[Naam], je account staat klaar 🎁"
// 32 karakters - past op mobile
```

**A/B Test Variants:**

| Variant | Subject | Focus |
|---------|---------|-------|
| A (Control) | "[Naam], je profiel staat klaar" | Neutrale tone |
| B (Urgency) | "⏰ [Naam], nog 7 dagen om te activeren" | Urgentie |
| C (Social Proof) | "847 leden zijn al overgestapt. Jij ook?" | Social proof |
| D (Curiosity) | "[Naam], zie wat er nieuw is..." | Curiosity gap |
| E (Direct Value) | "3 maanden gratis Premium - activeer nu" | Direct benefit |

### Email Content Optimization

**Probleem:** Emails zijn te lang voor INACTIVE users

**Current:** ~400 woorden
**Target:** ~150 woorden voor INACTIVE

**Structuur:**
1. **Greeting** (1 zin)
2. **What's happening** (1 zin)
3. **What you get** (bullets, 3 items max)
4. **CTA** (prominent button)
5. **Urgency** (dagen remaining)
6. **Social proof** (1 zin)

### Mobile Optimization

**Critical:** 70%+ van emails worden geopend op mobile

**Checklist:**
- [ ] Hero image < 600px breed
- [ ] Font size ≥ 16px
- [ ] CTA button ≥ 44px hoog
- [ ] Single column layout
- [ ] Max 1 CTA per email
- [ ] Test op iPhone en Android

---

## 🎯 SEGMENTED APPROACH

### VIP + GOLD (142 users, 27% + 13% conversie)

**Status:** ✅ Performing excellent!

**Strategy:** Don't change what works!
- Gebruik huidige template
- Personaliseer meer (gebruik old profile data)
- Add VIP badge in email
- Highlight exclusivity

### ACTIVE + DORMANT (236 users, 19% + 14% conversie)

**Status:** ✅ Goed!

**Strategy:** Kleine optimalisaties
- Meer social proof
- Highlight "anderen zijn al overgestapt"
- Show potential matches (blurred photos)
- Emphasize "je data is bewaard"

### INACTIVE (3437 nog te gaan, 1.2% conversie)

**Status:** ❌ Problematisch

**Strategy:** Drastische verandering OF stop
- **Optie 1:** Stop met versturen
- **Optie 2:** Nieuwe ultra-korte template
- **Optie 3:** Verlaag naar 1 email (LAST_CHANCE only)

---

## 📊 A/B TESTING FRAMEWORK

### Test Setup

**Current A/B system:** Random 50/50 split per user

**Improvements:**
1. Track variant performance per segment
2. Auto-winner selection na 100 sends
3. Report variance significance

### Key Metrics per Variant

```sql
SELECT
  "abVariant",
  segment,
  COUNT(*) as sent,
  COUNT("openedAt") as opened,
  COUNT("clickedAt") as clicked,
  AVG(CASE WHEN status IN ('CLAIMED', 'ACTIVATED') THEN 1 ELSE 0 END) as conversion_rate
FROM "MigrationEmail"
JOIN "MigrationUser" ON "MigrationEmail"."migrationUserId" = "MigrationUser".id
GROUP BY "abVariant", segment
```

### Test Priority

1. **Subject lines** (hoogste impact)
2. **Email length** (INACTIVE only)
3. **CTA wording** ("Activeer Account" vs "Claim Je Premium")
4. **Incentive presentation** (prominent vs subtle)
5. **Send time** (morning vs evening)

---

## 🚀 IMMEDIATE ACTION PLAN

### Week 1: Fix & Measure

**Dag 1 (VANDAAG):**
- [ ] Setup Resend webhooks (5 min)
- [ ] Test tracking met 1 email
- [ ] Verify webhooks werken
- [ ] **STOP INACTIVE batch emails tot optimalisatie klaar is**

**Dag 2-3:**
- [ ] Maak INACTIVE-specific template (kort, urgent)
- [ ] A/B test subject lines (5 variants)
- [ ] Setup automated winner selection

**Dag 4-5:**
- [ ] Test nieuwe INACTIVE template op 100 users
- [ ] Measure results
- [ ] Decide: continue of stop INACTIVE

**Dag 6-7:**
- [ ] Analyze all data
- [ ] Optimize winning variants
- [ ] Document learnings

### Week 2: Scale What Works

**Als INACTIVE test succesvol (>5% conversie):**
- Scale to remaining 3437 INACTIVE users
- Monitor daily

**Als INACTIVE test mislukt (<5% conversie):**
- **STOP INACTIVE campaign**
- Focus 100% op:
  - Retargeting VIP/GOLD/ACTIVE die niet hebben geclicked
  - Reminder sequence voor DORMANT
  - New user acquisition (niet migratie)

---

## 💰 ROI CALCULATION

### Current Situation (INACTIVE included)

```
5377 emails verzonden
53 activaties (zonder legacy)
Conversie: 1.0%
Cost per activation: €X / 53 = €Y
```

### Projected (INACTIVE excluded)

```
377 emails verzonden (alleen high-value)
~60 activaties (15% van 377)
Conversie: 15%+
Cost per activation: €X / 60 = €Z (lager!)
```

**Conclusie:** Door INACTIVE te stoppen:
- Hogere conversie rate (1% → 15%)
- Lower cost per activation
- Betere email reputation
- Meer tijd voor optimization

---

## 📋 SUCCESS METRICS

### Before Optimization (current)

- Email → Landing: 2.3%
- Landing → Activated: 42.1%
- Overall: 1.0%
- Open rate: 0% (broken tracking)
- Click rate: 0% (broken tracking)

### After Optimization (target)

- Email → Landing: **12%+** (high-value segments only)
- Landing → Activated: **50%+** (already goed!)
- Overall: **6%+**
- Open rate: **25%+** (industry standard)
- Click rate: **8%+** (industry standard)

### KPIs to Track Daily

1. **Open rate** (should be 20-30%)
2. **Click rate** (should be 5-10%)
3. **Landing visits** (should match clicks)
4. **Activations** (target: 5% of emails sent)
5. **Bounce rate** (should be <2%)
6. **Spam complaints** (should be <0.1%)

---

## 🎨 CREATIVE RECOMMENDATIONS

### Email Design

**Current:** Corporate, veel tekst, weinig visuals
**Recommended:** Modern, scanbaar, mobile-first

**Elements:**
- Hero image met nieuwe platform screenshot
- Animated counter ("847 leden zijn al overgestapt...")
- Social proof: Recent activation names
- Trust badges: AVG, SSL, Veilig
- Testimonials (blurred for privacy)

### Personalization Opportunities

**Currently using:**
- First name
- Member since year
- Photo count
- Message count

**Could also use:**
- Last login date
- Favorite city/region
- Age preferences
- Previous Gold status

### Timing Optimization

**Current:** Batch send, random times

**Recommended:**
| Segment | Best Time | Rationale |
|---------|-----------|-----------|
| VIP/GOLD | 19:00-21:00 | Prime time, high engagement |
| ACTIVE | 18:00-20:00 | After work |
| DORMANT | Weekend 10:00 | Leisure browsing |
| INACTIVE | Don't send | Save budget |

---

## 🔧 TECHNICAL IMPLEMENTATION

### New Email Templates Needed

1. `welcome-inactive-v3.tsx` - Ultra-short voor INACTIVE
2. `subject-variants.ts` - 5 A/B test variants
3. `timing-optimizer.ts` - Send time optimization

### Database Schema Updates

```sql
-- Track A/B test performance
ALTER TABLE "MigrationEmail"
ADD COLUMN "subjectVariant" VARCHAR(1),
ADD COLUMN "sendTimeOptimized" BOOLEAN DEFAULT false;

-- Segment-specific tracking
CREATE INDEX idx_segment_performance
ON "MigrationEmail"(segment, "abVariant", "openedAt", "clickedAt");
```

### Scripts to Create

```bash
# Segment performance analyzer
scripts/analyze-segment-performance.ts

# A/B test winner selector
scripts/ab-test-winner.ts

# Send time optimizer
scripts/optimize-send-times.ts

# INACTIVE-specific sender (met nieuwe template)
scripts/migration-batch-send-inactive-v3.ts
```

---

## 📞 DECISION MATRIX

### Should we continue with INACTIVE segment?

**Continue IF:**
- [ ] Nieuwe template test yields >5% conversion
- [ ] Webhooks are working and tracking accurately
- [ ] Spam complaint rate stays <0.1%
- [ ] Cost per activation is acceptable

**STOP IF:**
- [ ] Conversion remains <3% after optimization
- [ ] Spam complaints >0.5%
- [ ] Bounce rate >5%
- [ ] ROI is negative

---

## 🎯 NEXT STEPS

### Immediate (TODAY)

1. **Setup webhooks** (BLOCKING - moet eerst!)
2. **Stop INACTIVE batch** tot optimalisatie klaar is
3. **Run segment analysis** (already done ✅)
4. **Review findings** met team

### This Week

1. Create INACTIVE-optimized template
2. A/B test subject lines
3. Test on 100 INACTIVE users
4. Measure & decide

### Next Week

1. Scale winning strategy
2. Continue high-value segments
3. Monitor metrics daily
4. Iterate based on data

---

## 📚 RESOURCES

- `docs/RESEND_WEBHOOK_SETUP.md` - Webhook setup guide
- `scripts/segment-conversion-analysis.ts` - Performance analyzer
- `lib/email/templates/migration/` - Email templates
- `lib/migration/migration-engine.ts` - Campaign engine

---

**Bottom Line:**

1. **Fix webhooks VANDAAG** (blocking issue)
2. **Stop INACTIVE emails** tot optimalisatie klaar is
3. **Focus op high-value segments** (VIP, GOLD, ACTIVE, DORMANT)
4. **Test & optimize** voordat verder schalen

De data laat zien: high-value segments werken prima (15-27% conversie)!
INACTIVE is het probleem. Don't let INACTIVE ruin the overall stats.
