/**
 * Controleer verlopen ambassadeur gratis lidmaatschappen.
 * Zet subscriptionTier terug naar FREE als freeUntil verstreken is
 * en er geen actief betaald abonnement is.
 *
 * Gebruik: npx tsx scripts/check-ambassador-expiry.ts
 * Dry run: npx tsx scripts/check-ambassador-expiry.ts --dry-run
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log(`🌟 Ambassador expiry check${isDryRun ? ' (DRY RUN)' : ''}`)
  console.log(`Datum: ${new Date().toISOString()}\n`)

  const now = new Date()

  // Actieve ambassadeurs met verlopen gratis lidmaatschap
  const expired = await prisma.ambassador.findMany({
    where: {
      status: 'ACTIVE',
      freeUntil: { lt: now },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true,
        },
      },
    },
  })

  console.log(`Gevonden: ${expired.length} ambassadeurs met verlopen gratis lidmaatschap\n`)

  if (expired.length === 0) {
    console.log('Niets te doen.')
    return
  }

  let reverted = 0
  let skipped = 0

  for (const ambassador of expired) {
    const user = ambassador.user
    console.log(`→ ${user.name || user.email} (freeUntil: ${ambassador.freeUntil?.toISOString()})`)

    // Check op actief betaald abonnement
    const activePaidSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
    })

    if (activePaidSub) {
      console.log(`   ✓ Heeft actief betaald abonnement (${activePaidSub.plan}) — overgeslagen`)
      skipped++
      continue
    }

    if (user.subscriptionTier === 'FREE') {
      console.log(`   ✓ Staat al op FREE — overgeslagen`)
      skipped++
      continue
    }

    console.log(`   ↓ ${user.subscriptionTier} → FREE`)

    if (!isDryRun) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: 'FREE' },
      })
    }

    reverted++
  }

  console.log(`\nKlaar:`)
  console.log(`  Terugzet naar FREE: ${reverted}`)
  console.log(`  Overgeslagen:       ${skipped}`)
  if (isDryRun) console.log(`\n⚠️  Dry run — geen wijzigingen opgeslagen`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
