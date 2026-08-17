/**
 * Centralized user-preference normalization
 *
 * VOORHEEN (bug):
 * - `lookingFor` (MALE/FEMALE/BOTH) werd op `user.lookingFor` opgeslagen (onboarding step 3)
 * - `genderPreference` werd in `user.preferences.genderPreference` opgeslagen (ProfileForm / preferences-PUT)
 * - leeftijd: onboarding schreef `user.minAgePreference`/`user.maxAgePreference`,
 *   maar discover las `prefs.minAge`/`prefs.maxAge` uit `user.preferences`
 * - gevolg: de twee bronnen raakten uit sync -> gebruikers kregen matches van het verkeerde
 *   geslacht / alle leeftijden ("mijn wensen veranderen steeds", "krijg mannen i.p.v. vrouwen")
 *
 * OPLOSSING:
 * - één bron van waarheid per veld, met expliciete prioriteit
 * - `normalizeUserPrefs(user)` leest overal vandaan en geeft één `UserPreferences` terug
 * - `applyPrefsToUser(prefs)` schrijft de relevante velden terug naar de `User`-kolommen
 *   zodat onboarding EN settings-pagina dezelfde database-velden vullen
 */

import type { Gender, LookingFor } from '@prisma/client'
import type { UserPreferences } from '@/lib/types'

export interface RawUserPrefs {
  lookingFor?: LookingFor | null
  minAgePreference?: number | null
  maxAgePreference?: number | null
  // Prisma Json column -> kan string of object zijn; wordt intern veilig gecast.
  preferences?: unknown
}

/**
 * Zet een `LookingFor`-waarde om naar het `Gender` dat bij matching gebruikt wordt.
 * `BOTH` betekent: geen genderfilter (alle geslachten).
 */
export function lookingForToGender(lookingFor?: LookingFor | string | null): Gender | undefined {
  if (lookingFor === 'MALE') return 'MALE'
  if (lookingFor === 'FEMALE') return 'FEMALE'
  // BOTH of onbekend -> geen filter
  return undefined
}

/**
 * Lees alle match-voorkeuren uit een user-object en geef één genormaliseerde
 * `UserPreferences` terug. Prioriteit per veld:
 *   - geslacht: user.lookingFor > user.preferences.genderPreference
 *   - minAge:   user.minAgePreference > user.preferences.minAge
 *   - maxAge:   user.maxAgePreference > user.preferences.maxAge
 */
export function normalizeUserPrefs(user: RawUserPrefs): UserPreferences {
  // preferences is een Prisma Json-column; kan een object of (in theorie) een
  // JSON-string zijn. Veilig parsen zonder te crashen op onverwachte vorm.
  let prefs: UserPreferences = {}
  if (user.preferences && typeof user.preferences === 'object') {
    prefs = user.preferences as UserPreferences
  } else if (typeof user.preferences === 'string') {
    try {
      prefs = JSON.parse(user.preferences) as UserPreferences
    } catch {
      prefs = {}
    }
  }

  const genderFromLookingFor = lookingForToGender(user.lookingFor)
  const genderPreference =
    genderFromLookingFor ?? (prefs.genderPreference as Gender | undefined) ?? undefined

  const minAge =
    user.minAgePreference != null
      ? user.minAgePreference
      : prefs.minAge != null
        ? prefs.minAge
        : 18

  const maxAge =
    user.maxAgePreference != null
      ? user.maxAgePreference
      : prefs.maxAge != null
        ? prefs.maxAge
        : 99

  const maxDistance = prefs.maxDistance ?? undefined
  const interests = prefs.interests ?? []

  return {
    genderPreference,
    minAge,
    maxAge,
    maxDistance,
    interests,
  }
}

/**
 * Bouw het Prisma `data`-object om voorkeuren terug te schrijven naar de
 * `User`-kolommen (zodat onboarding én settings dezelfde velden vullen).
 * Alleen de meegegeven velden worden overschreven.
 */
export function applyPrefsToUser(prefs: UserPreferences): {
  lookingFor?: LookingFor | null
  minAgePreference?: number
  maxAgePreference?: number
} {
  const data: {
    lookingFor?: LookingFor | null
    minAgePreference?: number
    maxAgePreference?: number
  } = {}

  // genderPreference -> lookingFor (BOTH/leeg => null = geen voorkeur in UI)
  if (prefs.genderPreference != null) {
    if (prefs.genderPreference === 'MALE' || prefs.genderPreference === 'FEMALE') {
      data.lookingFor = prefs.genderPreference as LookingFor
    } else {
      data.lookingFor = 'BOTH'
    }
  }

  if (prefs.minAge != null) data.minAgePreference = prefs.minAge
  if (prefs.maxAge != null) data.maxAgePreference = prefs.maxAge

  return data
}
