# SEO-audit op basis van Search Console — augustus 2026

Meetperiode 7 juli t/m 3 augustus 2026, vergeleken met de 28 dagen daarvoor.
Data via `npm run seo:gsc`.

## Uitgangssituatie

| | Nu | Vorig | Δ |
|---|---|---|---|
| Clicks | 68 | 47 | +45% |
| Vertoningen | 1.693 | 844 | +101% |
| CTR | 4,02% | 5,57% | −28% |
| Gemiddelde positie | 16,8 | 15,0 | −1,8 |
| Unieke zoekwoorden | 120 | 55 | +118% |

De CTR-daling is grotendeels schijn: 165 vertoningen komen van merknamen van
concurrenten (`vindliefde`, `oogvoorliefde`, `alles is liefde matchmaking`) waar
we wel op ranken maar die nooit klikken. Zonder die zoekwoorden is de CTR 4,38%.
Het rapportscript filtert ze standaard uit; de lijst staat in
`scripts/gsc-report.mjs` onder `CONCURRENT_MERKEN` en moet af en toe worden
aangevuld.

## Hoofdoorzaak: canonicals wezen naar een doorverwijzende URL

De site draait op `www`; `https://liefdevooriedereen.nl` geeft een redirect naar
`https://www.liefdevooriedereen.nl`. Zes routes zetten hun canonical hardcoded op
de non-www variant. Een canonical die naar een doorverwijzende URL wijst, wordt
door Google genegeerd en splitst de signalen over twee URL's.

Het patroon in de data is eenduidig:

| Pagina | Canonical was | Positie |
|---|---|---|
| `/veilig-daten-lvb` | www (goed) | best presterende pagina, CTR 7,2% |
| `/daten-adhd-hsp` | www (goed) | net gelanceerd |
| `/dating-met-beperking` | non-www | 22,9 |
| `/dating-met-autisme` | non-www | 16,7 (query `daten met autisme`: 50,6) |
| `/prijzen`, `/blog`, `/kennisbank` | non-www | vertoningen zonder clicks |

Opgelost met `lib/site-url.ts` (`SITE_URL` en `canonical()`), gebruikt in
`app/(marketing)/[slug]/layout.tsx`, `app/blog/layout.tsx`,
`app/kennisbank/layout.tsx`, `app/prijzen/layout.tsx`, `app/login/layout.tsx` en
`app/register/layout.tsx`.

## Tweede oorzaak: de doelgroeppagina's renderden volledig client-side

`app/(marketing)/[slug]/page.tsx` was één groot `'use client'` component dat de
doelgroepdata pas in een `useEffect` ophaalde via `useParams()`. De HTML die de
server terugstuurde bevatte daardoor uitsluitend:

```html
<div class="rounded-full h-12 w-12 ... animate-spin"></div>
<p class="mt-4 text-slate-600">Laden...</p>
```

Geen `<h1>`, geen koppen, geen tekst — voor alle acht landingspagina's. Te
verifiëren met `curl` op productie: `/dating-met-autisme` gaf nul `<h1>`-tags,
terwijl `/veilig-daten-lvb` (een losse, server-gerenderde route) er wél één had.
Dat is precies het verschil tussen de pagina die het goed doet en de pagina's die
op positie 20-50 blijven staan.

Opgelost door de route te splitsen: `page.tsx` is nu een server component die de
doelgroep opzoekt en als prop doorgeeft aan `DoelgroepLandingClient.tsx`. De
animaties en het nalezen van blogs/kennisbankartikelen blijven client-side.

## Derde oorzaak: H1 zonder zoekwoord op de doelgroeppagina's

De acht doelgroep-landingspagina's gebruikten de emotionele `heroTitle` als H1:
"Vind liefde die jouw taal spreekt", "Kijk verder dan de beperking". Daarin komt
het zoekwoord niet voor. De handgebouwde `/veilig-daten-lvb` heeft H1
"Veilig Daten met LVB" — exact het zoekwoord — en levert in z'n eentje evenveel
clicks als de hele homepage.

Toegevoegd: optioneel veld `seoH1` in `DoelgroepData`. Staat het gezet, dan is
dat de H1 en zakt de `heroTitle` naar een zichtbare subkop eronder, zodat de
copy behouden blijft.

## Vierde oorzaak: dubbele titels en dubbele pagina's

- De root-layout plakt `| Liefde Voor Iedereen` achter elke title, terwijl de
  `metaTitle` van de doelgroeppagina's dat al bevatte. Resultaat:
  `Dating met Autisme | Liefde Voor Iedereen | Liefde Voor Iedereen`.
  De kennisbank deed er nog `| Kennisbank - Liefde Voor Iedereen` overheen, wat
  titels van 90+ tekens gaf waarin het zoekwoord werd weggekapt.
  Opgelost met `buildPageTitle()` in `lib/seo/metadata.ts`.
- Twee bijna identieke pillar pages over romance scams en twee over daten met
  autisme concurreerden om dezelfde zoekwoorden. 301-redirects staan in
  `next.config.mjs`; het depubliceren van de zwakste variant doe je met
  `npm run seo:consolidate -- --apply` (zonder vlag is het een dry run).
- De sitemap bevatte dubbele vermeldingen (`/kennisbank/begrippen`,
  `/kennisbank/tools`, `/veilig-daten-lvb`) en `/dating-met-adhd`, dat 301
  redirect. Beide opgelost in `app/sitemap.ts`.

## Wat níét het probleem is

- **`/blog/hoe-weet-je-of-het-liefde-is-7-tekens`**: 91 vertoningen op positie
  3,3 met nul clicks. De titel is prima. De zoekopdrachten zijn definitievragen
  (`wat is liefde`) die Google bovenaan zelf beantwoordt. Hier valt met een
  titelwijziging weinig te winnen.
- **Engelse titels in de kennisbank-database**: 17 van de 35 artikelen hebben een
  Engelse `title`. Dat is by design — het schema heeft `title` (Engels) naast
  `titleNl` (Nederlands), en de site rendert `titleNl`. Geen actie nodig.

## Overig opgelost

- **robots.txt**: er stond een aparte, kortere `Googlebot`-groep onder de
  `*`-groep. In robots.txt geldt per bot alleen de meest specifieke groep, dus
  Googlebot mocht juist méér crawlen dan de rest — `/settings`, `/likes`,
  `/subscription` en `/welkom` waren voor Google gewoon open. Beide groepen delen
  nu dezelfde lijst.
- **`SITE_URL` gebruikt niet `NEXTAUTH_URL`**: die staat lokaal en op previews op
  een Vercel-URL, waardoor previews canonicals naar zichzelf uitzonden. Nu
  `NEXT_PUBLIC_SITE_URL` met het productiedomein als vaste terugval.
- **`.env.local`**: `DATABASE_URL` bevatte een geplakt `psql '...'`-commando in
  plaats van een kale URL. Omdat `.env.local` voorrang heeft op `.env` brak dat
  Prisma lokaal. Hersteld.

## Openstaand

- Desktop staat op gemiddelde positie 29,1 tegen 8,5 op mobiel, met minder dan de
  helft van de CTR. Twintig posities verschil is te groot om aan zoekintentie toe
  te schrijven; verdient onderzoek naar desktop-rendering en Core Web Vitals.
- België: 63 vertoningen op positie 6,9 met 1 click.
- Er is nog geen merkverkeer: `/login`, `/register` en `/prijzen` ranken op
  positie 2,8-4,0 en krijgen geen clicks.
- De ADHD/HSP-pagina's hadden in deze periode nul vertoningen; te recent
  gepubliceerd om al iets te zeggen.
