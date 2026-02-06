# Migratie Campaign Status

**Laatst bijgewerkt:** 5 februari 2026, 10:11

## 🎯 FINAL STRATEGY: QUALITY OVER QUANTITY

**Besluit:** STOP INACTIVE segment (437 resterende emails)
**Actie:** 23 retargeting emails verzonden naar high-value users die landing bezochten
**Strategie:** Focus op kwaliteit, bescherm email reputation, maximaliseer ROI
**Expected impact:** +3 conversies uit retargeting (15% conversion)

## Huidige Status

| Segment | Totaal | Verzonden | Te gaan | Conversie | Status |
|---------|--------|-----------|---------|-----------|--------|
| VIP | 66 | 66 | 0 | 13.6% | ✅ KLAAR |
| GOLD | 75 | 75 | 0 | 9.3% | ✅ KLAAR |
| ACTIVE | 73 | 73 | 0 | 12.3% | ✅ KLAAR |
| DORMANT | 166 | 166 | 0 | 11.0% | ✅ KLAAR |
| INACTIVE | 8440 | 8003 | 437 | 0.3% | ⛔ GESTOPT |

**High-Value Segments (COMPLEET ✅):**
- Totaal verzonden: 380
- Totaal geactiveerd: 43 (+155 legacy)
- Overall conversie: **11.3%** ✅
- **+23 retargeting emails** verzonden (5-2-2026)

**INACTIVE Segment (GESTOPT ⛔):**
- Totaal verzonden: 8003
- Totaal geactiveerd: 23
- Overall conversie: **0.3%** ❌
- **STATUS: 437 resterende emails NIET verzonden** (besluit: te lage ROI)

## ✅ Volgende Stappen (COMPLEET)

1. ✅ Finish DORMANT segment (166/166 verzonden)
2. ✅ Retarget non-converters (23 emails verzonden op 5-2-2026)
3. ✅ Stop INACTIVE segment (437 niet verzonden - bewuste keuze)
4. ⏳ Monitor retargeting resultaten (2-3 dagen)

## 📊 Monitoring (Komende Dagen)

**Monitor vanaf 7 februari:**
- Retargeting email opens/clicks
- Nieuwe landing visits uit retargeting
- Conversies uit retargeting pool (target: 3+)
- Overall final conversie rate

**Expected Final Results:**
- High-Value conversie: **12-13%** (met retargeting)
- Total activaties: **~68-72** (quality over quantity)
- Email reputation: Beschermd ✅

## Commando's

```bash
# Finish DORMANT
npx tsx scripts/migration-batch-send.ts DORMANT 10

# Check webhook status
npx tsx scripts/test-webhook-endpoint.ts

# Retarget non-converters
npx tsx scripts/retarget-non-converters.ts

# Final dashboard
npx tsx scripts/migration-dashboard.ts
```

## Email Template Details

- **Subject:** "[Naam], je profiel staat klaar"
- **Incentive (per segment):**
  - VIP: 3 maanden Premium + 10 SuperBerichten
  - GOLD: 2 maanden Premium + 5 SuperBerichten
  - ACTIVE: 1 maand Premium + 3 SuperBerichten
  - DORMANT: 1 maand Premium + 5 SuperBerichten
  - INACTIVE: ~~0 maanden Premium~~ (GESTOPT)
- **Code:** OOGVOOR2026 (universeel)

## 💡 Final Decision Rationale

**Why STOP INACTIVE (437 remaining emails):**
- Conversie: **0.3%** (vs 11.3% voor high-value) - 38x lager!
- Volume: 8003 verzonden = 95% van alle emails
- Spam risk: Zeer hoog bij 0.3% engagement
- ROI: **Sterk negatief** (437 emails = ~1 extra conversie)
- Quality: Users inactive >2 jaar, zeer lage interesse

**Why RETARGET instead:**
- Pool: 23 high-value users die landing bezochten
- Expected conversie: **15%** (bewezen interesse)
- Expected activaties: **~3** (3x beter dan INACTIVE!)
- Spam risk: Zeer laag (targeted, bewezen interesse)
- ROI: **Sterk positief**

**Final Outcome:**
- Overall conversie (high-value): **11.3%** → 12-13% (met retargeting)
- Total activaties: ~68-72 (high quality users)
- Email reputation: **Beschermd** ✅
- Cost per activation: **Optimaal**

## Belangrijke Bestanden

- `docs/MIGRATION_ANALYSIS_COMPLETE.md` - Complete analysis
- `docs/EMAIL_STRATEGY_OPTIMIZATION.md` - Optimization strategie
- `docs/ACTION_PLAN_NEXT_BATCH.md` - Decision rationale
- `scripts/segment-conversion-analysis.ts` - Performance analyzer

## Conversie Stats (2-2-2026)

**Per Segment:**
- VIP: 27.3% Email → Landing
- ACTIVE: 19.2% Email → Landing
- DORMANT: 14.1% Email → Landing
- GOLD: 13.3% Email → Landing
- INACTIVE: 1.2% Email → Landing ❌

**Overall (High-Value only):**
- Email → Landing: ~18%
- Landing → Activated: ~42%
- Email → Activated: ~11%

**Overall (With INACTIVE):**
- Email → Landing: 2.3% (pulled down by INACTIVE)
- Landing → Activated: 42.1%
- Email → Activated: 1.0%
