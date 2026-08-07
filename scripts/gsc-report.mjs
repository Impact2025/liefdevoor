#!/usr/bin/env node
/**
 * Search Console rapport voor liefdevooriedereen.nl.
 *
 * Draait de analyse die je anders handmatig in de GSC-interface doet: totalen
 * met vergelijking, queries en pagina's, striking distance (positie 4-20, waar
 * een kleine verbetering direct clicks oplevert), pagina's met vertoningen maar
 * zonder clicks, en de grootste stijgers/dalers.
 *
 * Merkzoekwoorden van concurrenten worden apart gehouden: die leverden 20% van
 * de vertoningen en nul clicks, waardoor de gemiddelde CTR en positie een
 * vertekend beeld gaven.
 *
 * Vereist GOOGLE_SERVICE_ACCOUNT_JSON in .env.local, met het service account
 * toegevoegd als gebruiker in Search Console.
 *
 * Gebruik:
 *   npm run seo:gsc                 # laatste 28 dagen vs de 28 daarvoor
 *   npm run seo:gsc -- --days 90
 *   npm run seo:gsc -- --json > rapport.json
 */
import { readFileSync } from 'node:fs'
import { google } from 'googleapis'

const SITE_URL = 'sc-domain:liefdevooriedereen.nl'

/**
 * Merknamen van andere datingsites. We ranken hierop met de homepage, maar
 * wie op een concurrentnaam zoekt klikt niet op ons - het vervuilt alleen de
 * gemiddelden. Aanvullen zodra er nieuwe opduiken in de "genegeerd"-lijst.
 */
const CONCURRENT_MERKEN = [
  'vindliefde',
  'vind liefde',
  'oogvoorliefde',
  'vriendinvoorjou',
  'hey leukerd',
  'wie date jij',
  'puur relatiebemiddeling',
  'alles is liefde',
  'bestemd voor elkaar',
  'dateliefde',
]

function parseArgs() {
  const args = process.argv.slice(2)
  const days = Number(args[args.indexOf('--days') + 1]) || 28
  return { days, json: args.includes('--json') }
}

function loadServiceAccount() {
  for (const file of ['.env.local', '.env']) {
    let content
    try {
      content = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    const line = content.split(/\r?\n/).find((l) => l.startsWith('GOOGLE_SERVICE_ACCOUNT_JSON=') && l.includes('{'))
    if (line) {
      return JSON.parse(line.slice('GOOGLE_SERVICE_ACCOUNT_JSON='.length).trim().replace(/^['"]|['"]$/g, ''))
    }
  }
  throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON niet gevonden in .env.local of .env')
}

const iso = (d) => d.toISOString().slice(0, 10)
const isMerk = (query) => CONCURRENT_MERKEN.some((merk) => query.includes(merk))
const pad = (s, n) => String(s).slice(0, n).padEnd(n)

async function main() {
  const { days, json } = parseArgs()

  const auth = new google.auth.GoogleAuth({
    credentials: loadServiceAccount(),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  // GSC-data is pas na ~3 dagen definitief; eerder meten geeft te lage cijfers.
  const end = new Date(Date.now() - 3 * 864e5)
  const start = new Date(end - (days - 1) * 864e5)
  const vorigEind = new Date(start - 864e5)
  const vorigStart = new Date(vorigEind - (days - 1) * 864e5)

  const query = async (dimensions, van, tot, rowLimit = 500) => {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: iso(van), endDate: iso(tot), dimensions, rowLimit, dataState: 'final' },
    })
    return res.data.rows ?? []
  }

  const [totaal, totaalVorig, queries, queriesVorig, paginas, paginasVorig, devices] = await Promise.all([
    query([], start, end, 1),
    query([], vorigStart, vorigEind, 1),
    query(['query'], start, end),
    query(['query'], vorigStart, vorigEind),
    query(['page'], start, end),
    query(['page'], vorigStart, vorigEind),
    query(['device'], start, end, 10),
  ])

  const sitemaps = await searchconsole.sitemaps
    .list({ siteUrl: SITE_URL })
    .then((r) => r.data.sitemap ?? [])
    .catch(() => [])

  if (json) {
    console.log(JSON.stringify({ periode: [iso(start), iso(end)], totaal, queries, paginas, devices, sitemaps }, null, 2))
    return
  }

  const som = (rows) => rows.reduce(
    (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
    { clicks: 0, impressions: 0 },
  )
  const ctr = ({ clicks, impressions }) => (impressions ? (clicks / impressions) * 100 : 0)
  const delta = (nu, vorig) => (vorig ? `${nu > vorig ? '+' : ''}${(((nu - vorig) / vorig) * 100).toFixed(0)}%` : 'n.v.t.')

  const nu = totaal[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  const toen = totaalVorig[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 }

  console.log(`\nSEARCH CONSOLE  ${iso(start)} t/m ${iso(end)}  (${days} dagen)`)
  console.log(`vergeleken met  ${iso(vorigStart)} t/m ${iso(vorigEind)}\n`)
  console.log(`  clicks       ${String(nu.clicks).padStart(6)}   was ${String(toen.clicks).padStart(6)}   ${delta(nu.clicks, toen.clicks)}`)
  console.log(`  vertoningen  ${String(nu.impressions).padStart(6)}   was ${String(toen.impressions).padStart(6)}   ${delta(nu.impressions, toen.impressions)}`)
  console.log(`  CTR          ${(nu.ctr * 100).toFixed(2).padStart(6)}%  was ${(toen.ctr * 100).toFixed(2).padStart(6)}%`)
  console.log(`  positie      ${nu.position.toFixed(1).padStart(6)}   was ${toen.position.toFixed(1).padStart(6)}`)

  const merk = queries.filter((r) => isMerk(r.keys[0]))
  const eigen = queries.filter((r) => !isMerk(r.keys[0]))
  if (merk.length) {
    // Aftrekken van de sitetotalen, niet optellen over de queryrijen: GSC
    // anonimiseert zeldzame zoekopdrachten, dus die rijen tellen nooit op tot
    // het sitetotaal en zouden een veel te lage CTR opleveren.
    const m = som(merk)
    const gecorrigeerd = { clicks: nu.clicks - m.clicks, impressions: nu.impressions - m.impressions }
    console.log(`\n  Zonder ${merk.length} merkzoekwoorden van concurrenten (${m.impressions} vertoningen, ${m.clicks} clicks):`)
    console.log(`  CTR          ${ctr(gecorrigeerd).toFixed(2).padStart(6)}%  op ${gecorrigeerd.impressions} vertoningen`)
  }

  const index = (rows) => new Map(rows.map((r) => [r.keys[0], r]))
  const vorigeQueries = index(queriesVorig)
  const vorigePaginas = index(paginasVorig)
  const kort = (url) => url.replace(/^https?:\/\/(www\.)?liefdevooriedereen\.nl/, '') || '/'

  console.log('\n── STRIKING DISTANCE (positie 4-20, >=10 vertoningen) ─────────────────')
  console.log('   Hier levert een paar posities winst direct clicks op.\n')
  const striking = paginas
    .filter((r) => r.position >= 4 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions)
  for (const r of striking.slice(0, 20)) {
    console.log(`   ${pad(kort(r.keys[0]), 56)} c=${String(r.clicks).padStart(3)} v=${String(r.impressions).padStart(5)} ctr=${(r.ctr * 100).toFixed(1).padStart(5)}% pos=${r.position.toFixed(1).padStart(5)}`)
  }

  console.log('\n── VERTONINGEN ZONDER CLICKS (>=20 vertoningen) ───────────────────────')
  console.log('   Goede positie, geen klik: titel en omschrijving winnen het niet.\n')
  for (const r of paginas.filter((r) => r.clicks === 0 && r.impressions >= 20).sort((a, b) => b.impressions - a.impressions).slice(0, 15)) {
    console.log(`   ${pad(kort(r.keys[0]), 56)} v=${String(r.impressions).padStart(5)} pos=${r.position.toFixed(1).padStart(5)}`)
  }

  for (const [label, rijen, vorige, formatter] of [
    ['ZOEKWOORDEN', eigen, vorigeQueries, (k) => k],
    ['PAGINA\'S', paginas, vorigePaginas, kort],
  ]) {
    console.log(`\n── ${label}: grootste verschuivingen in vertoningen ───────────────`)
    const bewegers = rijen
      .map((r) => ({ r, vorig: vorige.get(r.keys[0]) }))
      .filter(({ r, vorig }) => vorig && r.impressions + vorig.impressions >= 30)
      .map(({ r, vorig }) => ({ r, vorig, verschil: r.impressions - vorig.impressions }))
      .sort((a, b) => b.verschil - a.verschil)

    // Top 5 stijgers en top 5 dalers, zonder overlap als er minder dan 10 zijn.
    const selectie = bewegers.length <= 10
      ? bewegers
      : [...bewegers.slice(0, 5), ...bewegers.slice(-5)]

    for (const { r, vorig, verschil } of selectie) {
      const teken = verschil >= 0 ? '+' : ''
      console.log(`   ${pad(formatter(r.keys[0]), 50)} ${String(vorig.impressions).padStart(5)} -> ${String(r.impressions).padEnd(5)} (${teken}${verschil})  pos ${vorig.position.toFixed(1)} -> ${r.position.toFixed(1)}`)
    }
  }

  console.log('\n── APPARATEN ─────────────────────────────────────────────────────────\n')
  for (const r of devices) {
    console.log(`   ${pad(r.keys[0], 10)} c=${String(r.clicks).padStart(4)} v=${String(r.impressions).padStart(5)} ctr=${(r.ctr * 100).toFixed(1).padStart(5)}% pos=${r.position.toFixed(1).padStart(5)}`)
  }

  console.log('\n── SITEMAPS ──────────────────────────────────────────────────────────\n')
  for (const s of sitemaps) {
    console.log(`   ${s.path}`)
    console.log(`   opgehaald ${s.lastDownloaded?.slice(0, 10) ?? 'nooit'}  fouten ${s.errors ?? 0}  waarschuwingen ${s.warnings ?? 0}  ingediend ${s.contents?.[0]?.submitted ?? '?'}`)
  }

  const genegeerd = merk.map((r) => r.keys[0])
  if (genegeerd.length) {
    console.log(`\n   Genegeerd als merkzoekwoord van een concurrent: ${genegeerd.join(', ')}`)
  }
  console.log()
}

main().catch((e) => {
  console.error('\nMislukt:', e.message)
  if (String(e.message).includes('insufficient permission')) {
    console.error('Voeg het service account toe in Search Console > Instellingen > Gebruikers en machtigingen.')
  }
  process.exit(1)
})
