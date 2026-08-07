#!/usr/bin/env node
/**
 * Consolideert dubbele kennisbank-pillar pages.
 *
 * Aanleiding (Search Console, 7 jul - 3 aug 2026): twee bijna identieke gidsen
 * over romance scams en twee over daten met autisme kregen allebei vertoningen
 * op dezelfde zoekwoorden. Google koos wisselend en beide bleven op pagina 2-3.
 *
 * Dit script markeert de zwakste variant als niet-gepubliceerd zodat die uit de
 * sitemap en de categorie-overzichten verdwijnt. De 301-redirects naar de
 * blijvende URL staan in next.config.mjs.
 *
 * Gebruik:
 *   node scripts/seo-consolidate-duplicates.mjs            # dry run
 *   node scripts/seo-consolidate-duplicates.mjs --apply    # schrijft naar de DB
 */
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  const line = readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('DATABASE_URL='))
  if (line) process.env.DATABASE_URL = line.slice('DATABASE_URL='.length).replace(/^"|"$/g, '')
}

const APPLY = process.argv.includes('--apply')

/** retire -> de slug die verdwijnt, keep -> de slug die blijft */
const CONSOLIDATIONS = [
  {
    retire: 'romance-scams-herkennen-complete-gids',
    keep: 'romance-scam-herkennen',
    reason: '4,5k tekens / positie 14 / CTR 0,7% vs 13k tekens / positie 6,7 / CTR 4,3%',
  },
  {
    retire: 'daten-met-autisme-gids',
    keep: 'daten-met-autisme-complete-gids',
    reason: '1,5k tekens dunne variant vs 5,7k tekens complete gids',
  },
]

const prisma = new PrismaClient()

async function main() {
  console.log(APPLY ? '=== APPLY: schrijft naar de database ===' : '=== DRY RUN (geen wijzigingen) ===')

  for (const { retire, keep, reason } of CONSOLIDATIONS) {
    const [oud, nieuw] = await Promise.all([
      prisma.knowledgeBaseArticle.findUnique({
        where: { slug: retire },
        select: { id: true, titleNl: true, keywords: true, isPublished: true },
      }),
      prisma.knowledgeBaseArticle.findUnique({
        where: { slug: keep },
        select: { id: true, titleNl: true, keywords: true, isPillarPage: true },
      }),
    ])

    if (!oud || !nieuw) {
      console.log(`OVERGESLAGEN ${retire} -> ${keep}: artikel niet gevonden`)
      continue
    }

    // Zoekwoorden van het opgeheven artikel meenemen naar de blijver, zodat de
    // interne zoekfunctie en de related-articles-logica niets verliezen.
    const samengevoegd = [...new Set([...nieuw.keywords, ...oud.keywords])]

    console.log(`\n${retire}  ->  ${keep}`)
    console.log(`  reden      : ${reason}`)
    console.log(`  depubliceer: "${oud.titleNl}" (nu gepubliceerd: ${oud.isPublished})`)
    console.log(`  blijver    : "${nieuw.titleNl}" wordt pillar page`)
    console.log(`  zoekwoorden: ${nieuw.keywords.length} -> ${samengevoegd.length}`)

    if (!APPLY) continue

    await prisma.$transaction([
      prisma.knowledgeBaseArticle.update({
        where: { id: oud.id },
        // isPillarPage ook uit: een gearchiveerd artikel hoort geen pillar meer
        // te zijn, anders blijft het opduiken in pillar/cluster-overzichten.
        data: { isPublished: false, status: 'ARCHIVED', isPillarPage: false },
      }),
      prisma.knowledgeBaseArticle.update({
        where: { id: nieuw.id },
        data: { isPillarPage: true, keywords: samengevoegd },
      }),
    ])
    console.log('  ✅ doorgevoerd')
  }

  if (!APPLY) {
    console.log('\nNiets gewijzigd. Draai met --apply om door te voeren.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
