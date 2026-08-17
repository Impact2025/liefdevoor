/**
 * Backfill: synchroniseer user.lookingFor / minAgePreference / maxAgePreference
 * met user.preferences.* voor bestaande accounts.
 *
 * Achtergrond (bug BUG-1): voorkeuren stonden op twee plekken met verschillende
 * veldnamen. Gebruikers die hun voorkeuren vóór de fix invulden, kunnen nu
 * tegenstrijdige waarden hebben (bijv. user.lookingFor = FEMALE maar
 * user.preferences.genderPreference = MALE, of een leeg user.lookingFor terwijl
 * de preferences wel gevuld zijn). Deze backfill brengt de User-kolommen in
 * lijn met de preferences (prioriteit: preferences wint, want die is door de
 * gebruiker recentst ingesteld via de settings-pagina).
 *
 * Draaien:
 *   npx tsx scripts/backfill-user-preferences.ts        # dry-run (default)
 *   npx tsx scripts/backfill-user-preferences.ts --apply
 */

import { prisma } from '../lib/prisma'

type LookingFor = 'MALE' | 'FEMALE' | 'BOTH'

interface PrefsLike {
  genderPreference?: string | null
  minAge?: number | null
  maxAge?: number | null
}

function parsePrefs(raw: unknown): PrefsLike {
  if (raw && typeof raw === 'object') return raw as PrefsLike
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as PrefsLike
    } catch {
      return {}
    }
  }
  return {}
}

function toLookingFor(g: string | null | undefined): LookingFor | null {
  if (g === 'MALE' || g === 'FEMALE') return g
  if (g === 'BOTH') return 'BOTH'
  return null
}

async function main() {
  const apply = process.argv.includes('--apply')
  console.log(`[Backfill] mode=${apply ? 'APPLY' : 'DRY-RUN'}`)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      lookingFor: true,
      minAgePreference: true,
      maxAgePreference: true,
      preferences: true,
    },
  })

  let changed = 0
  let skipped = 0

  for (const u of users) {
    const prefs = parsePrefs(u.preferences)
    const targetLookingFor = toLookingFor(prefs.genderPreference ?? null)
    const targetMin = prefs.minAge != null ? prefs.minAge : u.minAgePreference
    const targetMax = prefs.maxAge != null ? prefs.maxAge : u.maxAgePreference

    const needsLookingFor =
      targetLookingFor != null && targetLookingFor !== u.lookingFor
    const needsMin = targetMin != null && targetMin !== u.minAgePreference
    const needsMax = targetMax != null && targetMax !== u.maxAgePreference

    if (!needsLookingFor && !needsMin && !needsMax) {
      skipped++
      continue
    }

    changed++
    if (!apply) {
      console.log(
        `[Backfill][DRY] user ${u.id}: lookingFor ${u.lookingFor}->${targetLookingFor}, ` +
          `min ${u.minAgePreference}->${targetMin}, max ${u.maxAgePreference}->${targetMax}`
      )
      continue
    }

    await prisma.user.update({
      where: { id: u.id },
      data: {
        ...(needsLookingFor ? { lookingFor: targetLookingFor } : {}),
        ...(needsMin ? { minAgePreference: targetMin } : {}),
        ...(needsMax ? { maxAgePreference: targetMax } : {}),
      },
    })
    console.log(`[Backfill][APPLY] user ${u.id} updated`)
  }

  console.log(
    `[Backfill] done. changed=${changed}, skipped=${skipped}, mode=${apply ? 'APPLY' : 'DRY-RUN'}`
  )
}

main()
  .catch((e) => {
    console.error('[Backfill] failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
