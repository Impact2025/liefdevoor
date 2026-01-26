# Migratie Campaign Status

**Laatst bijgewerkt:** 26 januari 2026, 08:35

## Huidige Status

| Segment | Totaal | Verzonden | Te gaan | Status |
|---------|--------|-----------|---------|--------|
| VIP | 66 | 66 | 0 | ✅ KLAAR |
| GOLD | 75 | 75 | 0 | ✅ KLAAR |
| ACTIVE | 73 | 73 | 0 | ✅ KLAAR |
| DORMANT | 166 | 166 | 0 | ✅ KLAAR |
| INACTIVE | 8440 | ~1503 | ~6937 | ⏳ IN BEHANDELING |

**Totaal verzonden:** ~1.847
**Totaal geactiveerd:** 176+ (incl. 155 legacy)

## Lopende Batch

Er loopt mogelijk nog een batch op de achtergrond (1000 INACTIVE).
Check eerst met dashboard voordat je verder gaat.

## Commando's

```bash
# Dashboard bekijken (doe dit EERST)
npx tsx scripts/migration-dashboard.ts

# INACTIVE verder versturen (in stappen)
npx tsx scripts/migration-batch-send.ts INACTIVE 1000
npx tsx scripts/migration-batch-send.ts INACTIVE 2000
```

## Belangrijke Bestanden

- `scripts/migration-dashboard.ts` - Live stats dashboard
- `scripts/migration-batch-send.ts` - Batch email sender
- `scripts/send-single-email.ts` - Enkele email testen
- `app/admin/migration/page.tsx` - Admin dashboard
- `lib/email/templates/migration/welcome.tsx` - Email template

## Email Template Details

- **Subject:** "Geweldig nieuws [naam]! OogvoorLiefde wordt Liefde Voor Iedereen"
- **Incentive:** 2 maanden gratis Premium + 10 SuperBerichten
- **Code:** OOGVOOR2026 (universeel)
- **Counter offset:** +155 legacy users

## Volgende Sessie Instructies

Als je in een nieuwe Claude sessie bent:
1. Lees dit bestand: `MIGRATION_STATUS.md`
2. Run dashboard: `npx tsx scripts/migration-dashboard.ts`
3. Check hoeveel INACTIVE nog te gaan is
4. Verstuur batch met bijbehorend commando

## Conversie Stats (26 jan)

- Email → Landing: ~10%
- Landing → Activated: ~54%
- Email → Activated: ~5.5% (overall)
