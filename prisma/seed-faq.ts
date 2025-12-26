/**
 * FAQ Seed Data
 * Seeds the database with comprehensive FAQ categories and articles for Liefde Voor Iedereen
 *
 * Run with: npx ts-node prisma/seed-faq.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// CATEGORIES
// ============================================================================

const faqCategories = [
  {
    name: 'Getting Started',
    nameNl: 'Aan de slag',
    description: 'Alles over registreren, onboarding en je eerste stappen op Liefde Voor Iedereen',
    icon: '🚀',
    slug: 'aan-de-slag',
    order: 1,
    isVisible: true
  },
  {
    name: 'Profile Management',
    nameNl: 'Profielbeheer',
    description: 'Beheer je profiel, foto\'s, bio en persoonlijke instellingen',
    icon: '👤',
    slug: 'profielbeheer',
    order: 2,
    isVisible: true
  },
  {
    name: 'Discover & Matching',
    nameNl: 'Ontdekken & Matchen',
    description: 'Leer hoe je swipen, matchen en nieuwe mensen ontdekken werkt',
    icon: '💕',
    slug: 'ontdekken-matchen',
    order: 3,
    isVisible: true
  },
  {
    name: 'Messages & Chat',
    nameNl: 'Berichten & Chat',
    description: 'Alles over chatten, berichten sturen en communiceren met je matches',
    icon: '💬',
    slug: 'berichten-chat',
    order: 4,
    isVisible: true
  },
  {
    name: 'Premium Features',
    nameNl: 'Premium Functies',
    description: 'Ontdek alle premium functies zoals Boost, Passport en Incognito',
    icon: '⭐',
    slug: 'premium-functies',
    order: 5,
    isVisible: true
  },
  {
    name: 'Subscriptions & Payments',
    nameNl: 'Abonnementen & Betalingen',
    description: 'Informatie over abonnementen, prijzen, betalingen en opzeggen',
    icon: '💳',
    slug: 'abonnementen-betalingen',
    order: 6,
    isVisible: true
  },
  {
    name: 'Safety & Trust',
    nameNl: 'Veiligheid & Vertrouwen',
    description: 'Verificatie, blokkeren, rapporteren en veilig online daten',
    icon: '🛡️',
    slug: 'veiligheid-vertrouwen',
    order: 7,
    isVisible: true
  },
  {
    name: 'Privacy & Data',
    nameNl: 'Privacy & Gegevens',
    description: 'Je privacy, gegevensbescherming, AVG en data beheren',
    icon: '🔒',
    slug: 'privacy-gegevens',
    order: 8,
    isVisible: true
  },
  {
    name: 'Technical Help',
    nameNl: 'Technische Hulp',
    description: 'Oplossingen voor technische problemen, bugs en app-issues',
    icon: '⚙️',
    slug: 'technische-hulp',
    order: 9,
    isVisible: true
  },
  {
    name: 'Accessibility',
    nameNl: 'Toegankelijkheid',
    description: 'Toegankelijkheidsopties voor een betere gebruikservaring',
    icon: '♿',
    slug: 'toegankelijkheid',
    order: 10,
    isVisible: true
  }
]

// ============================================================================
// ARTICLES
// ============================================================================

const allArticles = [
  // -------------------------------------------------------------------------
  // Aan de slag (5 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'aan-de-slag',
    title: 'How do I create an account?',
    titleNl: 'Hoe maak ik een account aan?',
    slug: 'account-aanmaken',
    excerpt: 'Stap voor stap uitleg over het aanmaken van je Liefde Voor Iedereen account',
    content: 'How to create an account',
    contentNl: `# Hoe maak ik een account aan?

Welkom bij Liefde Voor Iedereen! In een paar simpele stappen maak je een account aan.

## Aanmelden via de website

1. **Ga naar de website** - Bezoek liefdevooriedereen.nl
2. **Kies je aanmeldmethode** - E-mail of Google
3. **Vul je basisgegevens in** - Naam, geboortedatum, geslacht
4. **Accepteer de voorwaarden**
5. **Verifieer je e-mailadres**

## Na het aanmelden

Doorloop de onboarding om je profiel compleet te maken:
- Foto's uploaden
- Bio schrijven
- Interesses kiezen
- Zoekvoorkeuren instellen

## Tips

✅ Gebruik een geldig e-mailadres
✅ Kies een sterk wachtwoord
✅ Vul je echte geboortedatum in`,
    keywords: ['aanmelden', 'registreren', 'account', 'inschrijven', 'nieuw'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'What are the onboarding steps?',
    titleNl: 'Wat zijn de stappen van de onboarding?',
    slug: 'onboarding-stappen',
    excerpt: 'Ontdek welke stappen je doorloopt om je profiel volledig in te vullen',
    content: 'Onboarding steps',
    contentNl: `# Wat zijn de stappen van de onboarding?

Na het aanmaken van je account doorloop je onze onboarding.

## De stappen

1. **Welkom** - Introductie
2. **Profielfoto's** - Upload minimaal 1 foto
3. **Over jezelf** - Schrijf je bio
4. **Interesses** - Kies je hobby's
5. **Basisinformatie** - Woonplaats, lengte, etc.
6. **Zoekvoorkeuren** - Wie wil je ontmoeten?
7. **Voice Intro** (optioneel) - Audio-introductie
8. **Fotoverificatie** (optioneel) - Krijg een blauw vinkje

## Tips voor een sterk profiel

✅ Vul zoveel mogelijk velden in
✅ Upload meerdere foto's
✅ Verifieer je profiel`,
    keywords: ['onboarding', 'stappen', 'profiel', 'beginnen'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'How do I activate my account?',
    titleNl: 'Hoe activeer ik mijn account?',
    slug: 'account-activeren',
    excerpt: 'Leer hoe je je account activeert via e-mailverificatie',
    content: 'Account activation',
    contentNl: `# Hoe activeer ik mijn account?

Om je account te activeren moet je je e-mailadres verifiëren.

## Stappen

1. **Check je inbox** - Zoek de verificatie-e-mail
2. **Klik op de link** - De link is 24 uur geldig
3. **Bevestiging** - Je account is geactiveerd!

## Geen e-mail ontvangen?

- Check je spam-folder
- Vraag een nieuwe verificatie-e-mail aan

## Waarom verificatie?

✅ Beschermt je account
✅ Voorkomt nepaccounts
✅ Maakt wachtwoord reset mogelijk`,
    keywords: ['activeren', 'verificatie', 'email', 'bevestigen'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'What are the house rules?',
    titleNl: 'Wat zijn de huisregels?',
    slug: 'huisregels',
    excerpt: 'De belangrijkste gedragsregels voor een veilige community',
    content: 'House rules',
    contentNl: `# Wat zijn de huisregels?

Bij Liefde Voor Iedereen willen we een veilige omgeving creëren.

## Kernwaarden

### 1. Respect
Behandel anderen met respect. Geen beledigingen of discriminatie.

### 2. Eerlijkheid
Gebruik echte foto's en correcte informatie.

### 3. Veiligheid
Deel geen persoonlijke gegevens te snel. Meld verdacht gedrag.

## Niet toegestaan

❌ Haatdragende content
❌ Intimidatie of stalking
❌ Expliciete content
❌ Oplichting of spam
❌ Nepprofielen`,
    keywords: ['huisregels', 'regels', 'gedrag', 'community'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'Why do I need to verify my age?',
    titleNl: 'Waarom moet ik mijn leeftijd verifiëren?',
    slug: 'leeftijd-verificatie',
    excerpt: 'Uitleg over waarom leeftijdsverificatie belangrijk is',
    content: 'Age verification',
    contentNl: `# Waarom moet ik mijn leeftijd verifiëren?

Liefde Voor Iedereen is alleen voor 18+.

## Waarom 18+?

- **Wettelijk vereist** - Dating apps moeten volwassenen beschermen
- **Veiligheid** - Een volwassen community
- **Vertrouwen** - Iedereen weet dat ze met volwassenen communiceren

## Hoe wordt mijn leeftijd geverifieerd?

Je voert je geboortedatum in bij registratie. Het systeem controleert automatisch.

## Let op

⚠️ Je geboortedatum kan later niet gewijzigd worden`,
    keywords: ['leeftijd', '18+', 'verificatie', 'geboortedatum'],
    isFeatured: false,
    order: 5
  },

  // -------------------------------------------------------------------------
  // Profielbeheer (8 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'profielbeheer',
    title: 'How do I edit my profile?',
    titleNl: 'Hoe wijzig ik mijn profielgegevens?',
    slug: 'profielgegevens-wijzigen',
    excerpt: 'Leer hoe je je profiel kunt aanpassen',
    content: 'Edit profile',
    contentNl: `# Hoe wijzig ik mijn profielgegevens?

Je kunt je profiel op elk moment aanpassen.

## Stappen

1. Tik op het **profiel-icoon**
2. Tik op **"Profiel bewerken"**
3. Wijzig wat je wilt
4. Tik op **"Opslaan"**

## Wat kun je wijzigen?

- Naam en bio
- Foto's
- Interesses
- Zoekvoorkeuren
- Voice Intro`,
    keywords: ['profiel', 'wijzigen', 'bewerken', 'aanpassen'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'profielbeheer',
    title: 'How do I upload photos?',
    titleNl: 'Hoe upload ik foto\'s?',
    slug: 'fotos-uploaden',
    excerpt: 'Stapsgewijze uitleg voor het toevoegen van profielfoto\'s',
    content: 'Upload photos',
    contentNl: `# Hoe upload ik foto's?

Foto's zijn het belangrijkste onderdeel van je profiel.

## Foto's toevoegen

1. Ga naar **Profiel bewerken**
2. Tik op een leeg fotovak
3. Kies camera of galerij
4. Selecteer en bevestig

## Tips

✅ Duidelijke gezichtsfoto's
✅ Goede belichting
✅ Variatie (hobby's, reizen)
✅ Maximaal 6 foto's`,
    keywords: ['foto', 'uploaden', 'afbeelding', 'camera'],
    isFeatured: true,
    order: 2
  },
  {
    categorySlug: 'profielbeheer',
    title: 'What is a Voice Intro?',
    titleNl: 'Wat is een Voice Intro en hoe maak ik er een?',
    slug: 'voice-intro',
    excerpt: 'Ontdek hoe je een audio-introductie opneemt',
    content: 'Voice Intro',
    contentNl: `# Wat is een Voice Intro?

Een Voice Intro is een korte audio-opname (max 60 sec) waarin je jezelf voorstelt.

## Waarom?

- Laat je persoonlijkheid horen
- Val op tussen andere profielen
- Krijg meer matches!

## Hoe maken?

1. Ga naar **Profiel bewerken**
2. Tik op **Voice Intro**
3. Houd de opnameknop ingedrukt
4. Spreek je boodschap in
5. Opslaan

## Tips

✅ Wees jezelf
✅ Spreek duidelijk
✅ Kies een rustige plek`,
    keywords: ['voice intro', 'audio', 'stem', 'opnemen'],
    isFeatured: true,
    order: 3
  },
  {
    categorySlug: 'profielbeheer',
    title: 'How do I write a good bio?',
    titleNl: 'Hoe schrijf ik een goede bio?',
    slug: 'goede-bio-schrijven',
    excerpt: 'Tips voor een aantrekkelijke profielbeschrijving',
    content: 'Write bio',
    contentNl: `# Hoe schrijf ik een goede bio?

Je bio is je kans om jezelf voor te stellen.

## Tips

✅ Wees authentiek
✅ Wees specifiek (niet "ik hou van reizen" maar "afgelopen jaar door Azië gereisd")
✅ Wees positief
✅ Wees beknopt (2-4 zinnen)

## Wat erin moet

1. Iets unieks over jezelf
2. Je passies
3. Wat je zoekt

## AI Bio Generator

Weet je niet waar je moet beginnen? Gebruik onze AI Bio Generator!`,
    keywords: ['bio', 'beschrijving', 'tekst', 'schrijven'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'profielbeheer',
    title: 'How do I choose interests?',
    titleNl: 'Hoe kies ik mijn interesses?',
    slug: 'interesses-kiezen',
    excerpt: 'Selecteer interesses voor betere matches',
    content: 'Choose interests',
    contentNl: `# Hoe kies ik mijn interesses?

Interesses helpen bij het vinden van matches.

## Stappen

1. Ga naar **Profiel bewerken**
2. Scroll naar **Interesses**
3. Tik om te selecteren
4. Max 10 interesses

## Categorieën

- Sport & Fitness
- Muziek & Kunst
- Reizen
- Eten & Drinken
- Entertainment`,
    keywords: ['interesses', 'hobbys', 'selecteren'],
    isFeatured: false,
    order: 5
  },
  {
    categorySlug: 'profielbeheer',
    title: 'How do I set search preferences?',
    titleNl: 'Hoe stel ik mijn zoekvoorkeuren in?',
    slug: 'zoekvoorkeuren-instellen',
    excerpt: 'Pas aan wie je te zien krijgt',
    content: 'Search preferences',
    contentNl: `# Hoe stel ik mijn zoekvoorkeuren in?

Zoekvoorkeuren bepalen welke profielen je ziet.

## Instellingen

- **Geslacht** - Wie wil je ontmoeten?
- **Leeftijd** - Min en max leeftijd
- **Afstand** - Maximum afstand (5-500 km)

## Stappen

1. Ga naar **Instellingen**
2. Tik op **Zoekvoorkeuren**
3. Pas aan
4. Opslaan`,
    keywords: ['zoekvoorkeuren', 'filters', 'leeftijd', 'afstand'],
    isFeatured: false,
    order: 6
  },
  {
    categorySlug: 'profielbeheer',
    title: 'How do I hide my profile?',
    titleNl: 'Hoe verberg ik mijn profiel tijdelijk?',
    slug: 'profiel-verbergen',
    excerpt: 'Pauzeer je profiel zonder te verwijderen',
    content: 'Hide profile',
    contentNl: `# Hoe verberg ik mijn profiel?

Je kunt je profiel tijdelijk verbergen.

## Stappen

1. Ga naar **Instellingen**
2. Tik op **Profiel pauzeren**
3. Bevestig

## Wat gebeurt er?

- Je bent onzichtbaar voor anderen
- Je kunt nog chatten met matches
- Je kunt niet swipen

## Heractiveren

Log gewoon in en kies **Profiel heractiveren**.`,
    keywords: ['verbergen', 'pauzeren', 'onzichtbaar'],
    isFeatured: false,
    order: 7
  },
  {
    categorySlug: 'profielbeheer',
    title: 'How do I delete my account?',
    titleNl: 'Hoe verwijder of pauzeer ik mijn account?',
    slug: 'account-verwijderen-pauzeren',
    excerpt: 'Account pauzeren of permanent verwijderen',
    content: 'Delete account',
    contentNl: `# Hoe verwijder ik mijn account?

Je hebt twee opties: pauzeren of permanent verwijderen.

## Pauzeren

- Tijdelijk - je kunt terugkomen
- Matches blijven bewaard

## Permanent verwijderen

1. Ga naar **Instellingen** → **Account**
2. Tik op **Account verwijderen**
3. Typ "VERWIJDEREN"
4. Bevestig

⚠️ Dit is permanent! Zeg eerst je abonnement op.`,
    keywords: ['verwijderen', 'pauzeren', 'account', 'stoppen'],
    isFeatured: false,
    order: 8
  },

  // -------------------------------------------------------------------------
  // Ontdekken & Matchen (7 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'ontdekken-matchen',
    title: 'How does swiping work?',
    titleNl: 'Hoe werkt swipen?',
    slug: 'hoe-werkt-swipen',
    excerpt: 'Leer de basis van swipen',
    content: 'Swiping',
    contentNl: `# Hoe werkt swipen?

Swipen is de kern van Liefde Voor Iedereen.

## De basis

- **Rechts** = Like 💚
- **Links** = Nee ❌
- **Omhoog** = Super Like ⭐

## Match

Een match ontstaat als beide mensen elkaar liken.

## Limieten

| Account | Swipes/dag | Super Likes |
|---------|------------|-------------|
| Gratis | 25 | 1 |
| Plus | Onbeperkt | 5 |
| Compleet | Onbeperkt | Onbeperkt |`,
    keywords: ['swipen', 'like', 'match', 'ontdekken'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'What is a Super Like?',
    titleNl: 'Wat is een Super Like?',
    slug: 'super-like',
    excerpt: 'Alles over Super Likes',
    content: 'Super Like',
    contentNl: `# Wat is een Super Like?

Een Super Like laat zien dat je ECHT geïnteresseerd bent.

## Verschil met normale like

- De ander ziet direct dat je Super Liked hebt
- Je profiel krijgt een blauwe ster
- 3x meer kans op match!

## Hoe geven?

Swipe **omhoog** of tik op de **blauwe ster** ⭐`,
    keywords: ['super like', 'ster', 'speciaal'],
    isFeatured: true,
    order: 2
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'How does the algorithm work?',
    titleNl: 'Hoe werkt het match algoritme?',
    slug: 'match-algoritme',
    excerpt: 'Ontdek hoe we matches vinden',
    content: 'Algorithm',
    contentNl: `# Hoe werkt het algoritme?

Ons algoritme analyseert:

1. **Basisvoorkeuren** (40%) - Leeftijd, geslacht, afstand
2. **Interesses** (25%) - Gemeenschappelijke hobby's
3. **Profielkwaliteit** (15%) - Complete profielen krijgen voorrang
4. **Activiteit** (10%) - Actieve gebruikers
5. **Gedrag** (10%) - Je swipe-patronen

## Tips voor meer matches

✅ Vul je profiel volledig in
✅ Verifieer je profiel
✅ Wees actief`,
    keywords: ['algoritme', 'matching', 'score'],
    isFeatured: true,
    order: 3
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'What are Top Picks?',
    titleNl: 'Wat zijn Top Picks / De Selectie?',
    slug: 'top-picks-selectie',
    excerpt: 'Dagelijks geselecteerde profielen',
    content: 'Top Picks',
    contentNl: `# Wat zijn Top Picks?

Top Picks zijn dagelijks door ons algoritme geselecteerde profielen die extra goed bij jou passen.

## Waar vinden?

Tik op **Ontdekken** → **Top Picks** of het diamant-icoon 💎

## Hoeveel per dag?

| Account | Picks/dag |
|---------|-----------|
| Gratis | 1-2 |
| Plus | 5+ |
| Compleet | 10+ |`,
    keywords: ['top picks', 'selectie', 'dagelijks'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'How do I use filters?',
    titleNl: 'Hoe gebruik ik de zoekfilters?',
    slug: 'zoekfilters-gebruiken',
    excerpt: 'Vind precies wie je zoekt',
    content: 'Filters',
    contentNl: `# Hoe gebruik ik zoekfilters?

## Basis filters

- **Locatie** - Op postcode of stad
- **Afstand** - 5 tot 500 km
- **Leeftijd** - Min en max
- **Geslacht**

## Geavanceerd (Premium)

- Alleen geverifieerde profielen
- Online status
- Minimum aantal foto's`,
    keywords: ['filters', 'zoeken', 'afstand', 'leeftijd'],
    isFeatured: false,
    order: 5
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'What are Stories?',
    titleNl: 'Wat zijn Stories en hoe maak ik er een?',
    slug: 'stories',
    excerpt: 'Deel momenten die 24 uur zichtbaar zijn',
    content: 'Stories',
    contentNl: `# Wat zijn Stories?

Stories zijn foto- of video-updates die 24 uur zichtbaar zijn.

## Waarom delen?

✅ Toon je persoonlijkheid
✅ Blijf top-of-mind bij matches
✅ Start gesprekken

## Hoe maken?

1. Tik op je profielfoto met + icoon
2. Maak foto of kies uit galerij
3. Bewerk (optioneel)
4. Deel!`,
    keywords: ['stories', 'delen', 'foto', '24 uur'],
    isFeatured: false,
    order: 6
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'Why no new profiles?',
    titleNl: 'Waarom zie ik geen nieuwe profielen?',
    slug: 'geen-nieuwe-profielen',
    excerpt: 'Oplossingen als je geen profielen ziet',
    content: 'No profiles',
    contentNl: `# Waarom zie ik geen nieuwe profielen?

## Mogelijke oorzaken

1. **Alle profielen gezien** - Vergroot je filters
2. **Te strikte filters** - Verruim voorkeuren
3. **Swipes op** - Wacht tot middernacht of upgrade
4. **Technisch probleem** - Herstart de app

## Oplossingen

✅ Vergroot afstandsfilter
✅ Verbreed leeftijdsbereik
✅ Wis de cache`,
    keywords: ['geen profielen', 'leeg', 'op'],
    isFeatured: false,
    order: 7
  },

  // -------------------------------------------------------------------------
  // Berichten & Chat (6 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'berichten-chat',
    title: 'How do I start a conversation?',
    titleNl: 'Hoe start ik een gesprek?',
    slug: 'gesprek-starten',
    excerpt: 'Tips voor het eerste bericht',
    content: 'Start conversation',
    contentNl: `# Hoe start ik een gesprek?

## Tips

✅ Wees persoonlijk - verwijs naar hun profiel
✅ Stel een open vraag
✅ Wees speels

## Wat niet werkt

❌ "Hey" of "Hoi"
❌ Direct te persoonlijk
❌ Kopieer-plak berichten

## AI Icebreakers

Geen idee? Tik op de **gloeilamp** 💡 voor suggesties!`,
    keywords: ['gesprek', 'bericht', 'opener', 'starten'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'berichten-chat',
    title: 'How do I send audio/video?',
    titleNl: 'Hoe stuur ik audio- of videoberichten?',
    slug: 'audio-video-berichten',
    excerpt: 'Stuur spraak- en videoberichten',
    content: 'Audio video',
    contentNl: `# Audio- en videoberichten

## Audiobericht

1. Open gesprek
2. Houd **microfoon** 🎤 ingedrukt
3. Spreek in
4. Laat los om te versturen

## Videobericht

1. Tik op **camera** 📹
2. Neem op
3. Verstuur

*Beschikbaar voor Plus en Compleet*`,
    keywords: ['audio', 'video', 'spraak', 'opnemen'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'berichten-chat',
    title: 'How do I share photos/GIFs?',
    titleNl: 'Hoe deel ik foto\'s en GIFs?',
    slug: 'fotos-gifs-delen',
    excerpt: 'Deel afbeeldingen in chat',
    content: 'Photos GIFs',
    contentNl: `# Foto's en GIFs delen

## Foto's

1. Tik op **+** of foto-icoon
2. Kies uit galerij of maak nieuw
3. Verstuur

## GIFs

1. Tik op **GIF** icoon
2. Zoek op term
3. Tik om te versturen`,
    keywords: ['foto', 'gif', 'delen', 'sturen'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'berichten-chat',
    title: 'What are read receipts?',
    titleNl: 'Wat zijn leesbevestigingen?',
    slug: 'leesbevestigingen',
    excerpt: 'Zie wanneer berichten zijn gelezen',
    content: 'Read receipts',
    contentNl: `# Leesbevestigingen

## Iconen

- **✓** = Verzonden
- **✓✓** = Afgeleverd
- **✓✓ blauw** = Gelezen

## Beschikbaarheid

Leesbevestigingen zijn beschikbaar voor **Plus** en **Compleet** abonnementen.`,
    keywords: ['leesbevestiging', 'gelezen', 'vinkje'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'berichten-chat',
    title: 'What are AI Icebreakers?',
    titleNl: 'Wat zijn AI Icebreakers?',
    slug: 'ai-icebreakers',
    excerpt: 'Gepersonaliseerde gespreksopeners',
    content: 'AI Icebreakers',
    contentNl: `# AI Icebreakers

Onze AI genereert unieke gespreksopeners op basis van jullie profielen.

## Hoe gebruiken?

1. Open een gesprek
2. Tik op **gloeilamp** 💡
3. Kies een suggestie
4. Pas aan en verstuur

## Gratis

AI Icebreakers zijn voor iedereen beschikbaar!`,
    keywords: ['ai', 'icebreaker', 'suggestie', 'opener'],
    isFeatured: false,
    order: 5
  },
  {
    categorySlug: 'berichten-chat',
    title: 'Why can\'t I see messages?',
    titleNl: 'Waarom zie ik mijn berichten niet?',
    slug: 'berichten-niet-zichtbaar',
    excerpt: 'Oplossingen voor berichtenproblemen',
    content: 'Messages not visible',
    contentNl: `# Berichten niet zichtbaar?

## Mogelijke oorzaken

1. **Internetverbinding** - Check wifi/data
2. **App verversen** - Pull-to-refresh
3. **Unmatch** - De match is verdwenen
4. **Geblokkeerd** - Door de ander

## Oplossingen

✅ Herstart de app
✅ Log uit en weer in
✅ Wis de cache`,
    keywords: ['berichten', 'niet zichtbaar', 'verdwenen'],
    isFeatured: false,
    order: 6
  },

  // -------------------------------------------------------------------------
  // Premium Functies (7 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'premium-functies',
    title: 'What is Boost?',
    titleNl: 'Wat is Boost en hoe werkt het?',
    slug: 'boost',
    excerpt: 'Verhoog je zichtbaarheid',
    content: 'Boost',
    contentNl: `# Wat is Boost?

Boost plaatst je profiel **30 minuten bovenaan** bij andere gebruikers.

## Resultaat

Tot **10x meer profielweergaven**!

## Beschikbaarheid

| Account | Boost/maand |
|---------|-------------|
| Gratis | 0 |
| Plus | 1 |
| Compleet | Onbeperkt |

## Beste moment

Zondagavond 19:00-22:00 voor maximaal effect.`,
    keywords: ['boost', 'zichtbaarheid', 'opvallen'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'premium-functies',
    title: 'What is Passport?',
    titleNl: 'Wat is Passport en hoe reis ik virtueel?',
    slug: 'passport',
    excerpt: 'Swipe in andere steden',
    content: 'Passport',
    contentNl: `# Wat is Passport?

Met Passport kun je je locatie virtueel veranderen.

## Hoe activeren?

1. Ga naar **Instellingen** → **Passport**
2. Zoek een stad
3. Selecteer en swipe!

## Alleen voor Compleet

Passport is exclusief voor **Liefde Compleet** abonnees.`,
    keywords: ['passport', 'locatie', 'reizen', 'stad'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'premium-functies',
    title: 'What is Incognito?',
    titleNl: 'Wat is Incognito mode?',
    slug: 'incognito-mode',
    excerpt: 'Browse anoniem',
    content: 'Incognito',
    contentNl: `# Wat is Incognito?

Met Incognito ben je onzichtbaar. Alleen mensen die JIJ liket kunnen je profiel zien.

## Voordelen

✅ Maximale privacy
✅ Zelf bepalen wie je ziet
✅ Geen ongewenste aandacht

## Alleen voor Compleet`,
    keywords: ['incognito', 'onzichtbaar', 'privacy'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'premium-functies',
    title: 'What is Rewind?',
    titleNl: 'Hoe draai ik een swipe terug (Rewind)?',
    slug: 'rewind',
    excerpt: 'Maak een swipe ongedaan',
    content: 'Rewind',
    contentNl: `# Wat is Rewind?

Rewind laat je je laatste swipe terugdraaien.

## Hoe gebruiken?

Direct na een swipe: tik op de **gele pijl** ⏪

## Beschikbaar voor

Plus en Compleet abonnementen.`,
    keywords: ['rewind', 'terugdraaien', 'ongedaan'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'premium-functies',
    title: 'What are Super Messages?',
    titleNl: 'Wat zijn Superberichten?',
    slug: 'superberichten',
    excerpt: 'Stuur een bericht vóór de match',
    content: 'Super Messages',
    contentNl: `# Wat zijn Superberichten?

Met Superberichten kun je een bericht sturen **voordat** jullie matchen.

## Credits

1 Superbericht = 1 credit

| Account | Gratis credits/maand |
|---------|---------------------|
| Plus | 1 |
| Compleet | 3 |

Extra credits: €1,50/stuk`,
    keywords: ['superbericht', 'credit', 'direct bericht'],
    isFeatured: false,
    order: 5
  },
  {
    categorySlug: 'premium-functies',
    title: 'How do I see who liked me?',
    titleNl: 'Hoe zie ik wie mij heeft geliket?',
    slug: 'wie-liket-mij',
    excerpt: 'Bekijk wie jou leuk vindt',
    content: 'See who liked',
    contentNl: `# Wie liket mij?

Met Premium zie je wie jou heeft geliket vóórdat je matcht.

## Waar vinden?

Tik op het **hart-icoon** ❤️ in de navigatie.

## Beschikbaar voor

Plus en Compleet abonnementen.

Gratis gebruikers zien wazige profielen.`,
    keywords: ['likes', 'wie liket', 'bekijken'],
    isFeatured: false,
    order: 6
  },
  {
    categorySlug: 'premium-functies',
    title: 'Subscription comparison',
    titleNl: 'Vergelijking: wat krijg ik per abonnement?',
    slug: 'abonnement-vergelijking',
    excerpt: 'Overzicht van alle features',
    content: 'Comparison',
    contentNl: `# Abonnement vergelijking

| Feature | Gratis | Plus | Compleet |
|---------|--------|------|----------|
| Swipes/dag | 25 | ∞ | ∞ |
| Super Likes | 1 | 5 | ∞ |
| Zie likes | ❌ | ✅ | ✅ |
| Rewind | ❌ | ✅ | ✅ |
| Boost | ❌ | 1/mnd | ∞ |
| Passport | ❌ | ❌ | ✅ |
| Incognito | ❌ | ❌ | ✅ |

## Prijzen

- **Plus**: €9,95/maand
- **Compleet**: €24,95/3 maanden`,
    keywords: ['vergelijking', 'abonnement', 'features', 'prijs'],
    isFeatured: true,
    order: 7
  },

  // -------------------------------------------------------------------------
  // Abonnementen & Betalingen (5 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'abonnementen-betalingen',
    title: 'What subscriptions are available?',
    titleNl: 'Welke abonnementen zijn er?',
    slug: 'abonnementen-overzicht',
    excerpt: 'Overzicht van alle abonnementen',
    content: 'Subscriptions overview',
    contentNl: `# Welke abonnementen zijn er?

## 💚 Gratis - €0
Basis toegang

## 💙 Liefde Plus - €9,95/maand
Onbeperkt swipen, zie wie jou liket, leesbevestigingen

## 💜 Liefde Compleet - €24,95/3 maanden
Alles van Plus + Passport, Incognito, onbeperkte Boosts`,
    keywords: ['abonnement', 'prijs', 'gratis', 'premium'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'abonnementen-betalingen',
    title: 'How do I upgrade?',
    titleNl: 'Hoe upgrade ik naar Plus of Compleet?',
    slug: 'upgraden',
    excerpt: 'Stapsgewijze uitleg voor upgraden',
    content: 'Upgrade',
    contentNl: `# Hoe upgrade ik?

1. Ga naar **Instellingen** → **Abonnement**
2. Kies **Plus** of **Compleet**
3. Selecteer looptijd
4. Betaal
5. Direct actief!`,
    keywords: ['upgraden', 'kopen', 'premium'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'abonnementen-betalingen',
    title: 'How do I pay?',
    titleNl: 'Hoe betaal ik?',
    slug: 'betalen',
    excerpt: 'Betalingsmethodes en info',
    content: 'Payment',
    contentNl: `# Hoe betaal ik?

## Betaalmethodes

- **iDEAL** (Nederlandse banken)
- **Creditcard** (Visa, Mastercard)
- **PayPal**
- **Bancontact** (België)

Alle betalingen zijn SSL-beveiligd.`,
    keywords: ['betalen', 'ideal', 'creditcard', 'paypal'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'abonnementen-betalingen',
    title: 'How do I cancel?',
    titleNl: 'Hoe zeg ik mijn abonnement op?',
    slug: 'abonnement-opzeggen',
    excerpt: 'Stap voor stap opzeggen',
    content: 'Cancel',
    contentNl: `# Hoe zeg ik op?

1. Ga naar **Instellingen** → **Abonnement**
2. Tik op **Opzeggen**
3. Bevestig

Je behoudt toegang tot het einde van de betaalde periode.`,
    keywords: ['opzeggen', 'annuleren', 'stoppen'],
    isFeatured: true,
    order: 4
  },
  {
    categorySlug: 'abonnementen-betalingen',
    title: 'Do I get a refund?',
    titleNl: 'Krijg ik mijn geld terug bij opzeggen?',
    slug: 'restitutie',
    excerpt: 'Restitutiebeleid',
    content: 'Refund',
    contentNl: `# Krijg ik geld terug?

## Algemeen beleid

Geen restitutie voor de resterende periode. Je behoudt wel toegang tot het einde.

## Uitzonderingen

Bij technische problemen of dubbele afschrijving: neem contact op met support.`,
    keywords: ['restitutie', 'geld terug', 'refund'],
    isFeatured: false,
    order: 5
  },

  // -------------------------------------------------------------------------
  // Veiligheid & Vertrouwen (6 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'veiligheid-vertrouwen',
    title: 'How does verification work?',
    titleNl: 'Hoe werkt profielverificatie?',
    slug: 'profielverificatie',
    excerpt: 'Alles over het blauwe vinkje',
    content: 'Verification',
    contentNl: `# Hoe werkt verificatie?

Verificatie bewijst dat jij echt bent.

## Stappen

1. Ga naar profiel → **Verifieer**
2. Maak een selfie in de gevraagde pose
3. Wacht op goedkeuring (meestal 24 uur)

## Voordelen

✅ Blauw vinkje op je profiel
✅ Meer vertrouwen
✅ Meer matches`,
    keywords: ['verificatie', 'blauw vinkje', 'echt'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'veiligheid-vertrouwen',
    title: 'How do I block someone?',
    titleNl: 'Hoe blokkeer ik iemand?',
    slug: 'blokkeren',
    excerpt: 'Leer hoe je blokkeert',
    content: 'Block',
    contentNl: `# Hoe blokkeer ik iemand?

1. Open het gesprek of profiel
2. Tik op **drie puntjes** (...)
3. Kies **Blokkeren**
4. Bevestig

De persoon verdwijnt en kan je niet meer vinden. Ze krijgen geen melding.`,
    keywords: ['blokkeren', 'block', 'verbergen'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'veiligheid-vertrouwen',
    title: 'How do I report someone?',
    titleNl: 'Hoe rapporteer ik iemand?',
    slug: 'rapporteren',
    excerpt: 'Meld ongepast gedrag',
    content: 'Report',
    contentNl: `# Hoe rapporteer ik?

1. Open profiel of gesprek
2. Tik op **drie puntjes**
3. Kies **Rapporteren**
4. Selecteer reden
5. Verstuur

Rapporteren is anoniem. Wij onderzoeken elke melding.`,
    keywords: ['rapporteren', 'melden', 'onveilig'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'veiligheid-vertrouwen',
    title: 'Safe dating tips',
    titleNl: 'Tips voor veilig online daten',
    slug: 'veilig-daten-tips',
    excerpt: 'Belangrijke veiligheidstips',
    content: 'Safety tips',
    contentNl: `# Veilig daten

## Voordat je afspreekt

✅ Leer iemand eerst kennen via chat
✅ Videobel voordat je afpreekt
✅ Vertrouw je instinct

## Eerste date

✅ Kies een openbare plek
✅ Vertel iemand waar je bent
✅ Regel je eigen vervoer

## Rode vlaggen

🚩 Weigert te videobellen
🚩 Vraagt om geld
🚩 Pusht voor persoonlijke info`,
    keywords: ['veilig', 'tips', 'date', 'voorzichtig'],
    isFeatured: true,
    order: 4
  },
  {
    categorySlug: 'veiligheid-vertrouwen',
    title: 'How to spot a catfish?',
    titleNl: 'Hoe herken ik een catfish of scammer?',
    slug: 'catfish-scammer-herkennen',
    excerpt: 'Herken nepprofielen',
    content: 'Catfish',
    contentNl: `# Catfish herkennen

## Rode vlaggen

🚩 Te mooie foto's
🚩 Weigert videobellen
🚩 Verhalen kloppen niet
🚩 Vraagt om geld
🚩 Wil snel van platform af

## Controleren

Gebruik Google Reverse Image Search om foto's te checken.

## Bij twijfel

Blokkeer en rapporteer!`,
    keywords: ['catfish', 'scammer', 'nep', 'fraude'],
    isFeatured: false,
    order: 5
  },
  {
    categorySlug: 'veiligheid-vertrouwen',
    title: 'What happens with my report?',
    titleNl: 'Wat gebeurt er met mijn melding?',
    slug: 'wat-gebeurt-met-melding',
    excerpt: 'Hoe wij rapportages behandelen',
    content: 'Report handling',
    contentNl: `# Wat gebeurt met mijn melding?

## Het proces

1. **Ontvangst** - Bevestiging
2. **Onderzoek** - Wij bekijken de melding
3. **Actie** - Waarschuwing, blokkade of verwijdering

## Tijdlijn

Ernstige meldingen: < 24 uur
Overige: < 72 uur

Rapporteren is anoniem.`,
    keywords: ['melding', 'rapport', 'actie'],
    isFeatured: false,
    order: 6
  },

  // -------------------------------------------------------------------------
  // Privacy & Gegevens (4 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'privacy-gegevens',
    title: 'How is my data protected?',
    titleNl: 'Hoe worden mijn gegevens beschermd?',
    slug: 'gegevens-bescherming',
    excerpt: 'Alles over privacy en beveiliging',
    content: 'Data protection',
    contentNl: `# Hoe worden mijn gegevens beschermd?

## Beveiliging

- Alle data **versleuteld**
- **HTTPS/SSL** verbindingen
- Datacenters in de **EU**
- AVG/GDPR compliant

## Jouw rechten

✅ Inzage in je gegevens
✅ Gegevens aanpassen
✅ Gegevens verwijderen
✅ Data downloaden`,
    keywords: ['privacy', 'gegevens', 'bescherming', 'avg'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'privacy-gegevens',
    title: 'How do I download my data?',
    titleNl: 'Hoe download ik mijn data?',
    slug: 'data-downloaden',
    excerpt: 'Vraag een kopie van je gegevens aan',
    content: 'Download data',
    contentNl: `# Hoe download ik mijn data?

1. Ga naar **Instellingen** → **Privacy**
2. Tik op **Data exporteren**
3. Bevestig
4. Wacht op e-mail met downloadlink

De export bevat al je gegevens, foto's en berichten.`,
    keywords: ['download', 'data', 'export'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'privacy-gegevens',
    title: 'How do I delete everything?',
    titleNl: 'Hoe verwijder ik mijn account en data volledig?',
    slug: 'account-data-verwijderen',
    excerpt: 'Permanent alles verwijderen',
    content: 'Delete all',
    contentNl: `# Alles verwijderen

1. Ga naar **Instellingen** → **Account**
2. Tik op **Account verwijderen**
3. Typ "VERWIJDEREN"
4. Bevestig

⚠️ Dit is permanent!
⚠️ Zeg eerst je abonnement op!

Je hebt 14 dagen bedenktijd.`,
    keywords: ['verwijderen', 'wissen', 'permanent'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'privacy-gegevens',
    title: 'How do I manage cookies?',
    titleNl: 'Hoe beheer ik mijn cookie-instellingen?',
    slug: 'cookie-instellingen',
    excerpt: 'Pas cookie-voorkeuren aan',
    content: 'Cookies',
    contentNl: `# Cookie-instellingen

## Aanpassen

1. Ga naar **Instellingen** → **Privacy**
2. Tik op **Cookie-voorkeuren**
3. Kies welke cookies je toestaat

## Categorieën

- **Noodzakelijk** - Altijd aan
- **Analytisch** - Optioneel
- **Marketing** - Optioneel`,
    keywords: ['cookies', 'instellingen', 'privacy'],
    isFeatured: false,
    order: 4
  },

  // -------------------------------------------------------------------------
  // Technische Hulp (4 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'technische-hulp',
    title: 'App not loading?',
    titleNl: 'De app laadt niet, wat nu?',
    slug: 'app-laadt-niet',
    excerpt: 'Oplossingen als de app niet werkt',
    content: 'App not loading',
    contentNl: `# App laadt niet?

## Snelle oplossingen

1. Check je **internetverbinding**
2. **Ververs** de app (pull-to-refresh)
3. **Herstart** de app
4. **Herstart** je telefoon

## Geavanceerd

- Wis de cache
- Installeer opnieuw`,
    keywords: ['laden', 'werkt niet', 'probleem'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'technische-hulp',
    title: 'No notifications?',
    titleNl: 'Ik krijg geen meldingen, wat kan ik doen?',
    slug: 'geen-meldingen',
    excerpt: 'Oplossingen voor notificaties',
    content: 'No notifications',
    contentNl: `# Geen meldingen?

## Check in de app

Instellingen → Meldingen → Alles aan?

## Check op je telefoon

### iPhone
Instellingen → Liefde Voor Iedereen → Meldingen → Aan

### Android
Instellingen → Apps → Liefde Voor Iedereen → Meldingen → Aan

Check ook of "Niet storen" uit staat!`,
    keywords: ['meldingen', 'notificaties', 'push'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'technische-hulp',
    title: 'How to clear cache?',
    titleNl: 'Hoe wis ik de cache?',
    slug: 'cache-wissen',
    excerpt: 'Cache wissen stap voor stap',
    content: 'Clear cache',
    contentNl: `# Cache wissen

## Android

1. Instellingen → Apps
2. Zoek Liefde Voor Iedereen
3. Opslag → Cache wissen

## iPhone

1. Instellingen → iPhone-opslag
2. Zoek de app
3. Offload of verwijder en herinstalleer

Je verliest geen matches of berichten!`,
    keywords: ['cache', 'wissen', 'opruimen'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'technische-hulp',
    title: 'App is slow?',
    titleNl: 'De app is traag, hoe los ik dit op?',
    slug: 'app-traag',
    excerpt: 'Tips om de app sneller te maken',
    content: 'App slow',
    contentNl: `# App traag?

## Oplossingen

1. Sluit andere apps
2. Check je internetsnelheid
3. Wis de cache
4. Update de app
5. Maak opslagruimte vrij

## Systeemvereisten

- iOS 13+ of Android 8+
- Minimaal 2 GB RAM`,
    keywords: ['traag', 'langzaam', 'snel'],
    isFeatured: false,
    order: 4
  },

  // -------------------------------------------------------------------------
  // Toegankelijkheid (3 artikelen)
  // -------------------------------------------------------------------------
  {
    categorySlug: 'toegankelijkheid',
    title: 'Visually impaired mode',
    titleNl: 'Hoe activeer ik de modus voor slechtzienden?',
    slug: 'modus-slechtzienden',
    excerpt: 'Speciale instellingen voor slechtzienden',
    content: 'Visually impaired',
    contentNl: `# Modus voor slechtzienden

## Wat biedt het?

- Grotere tekst
- Hoger contrast
- Duidelijkere knoppen
- Screenreader ondersteuning

## Activeren

1. Instellingen → Toegankelijkheid
2. Zet de modus aan

Werkt ook met VoiceOver (iOS) en TalkBack (Android).`,
    keywords: ['slechtzienden', 'toegankelijk', 'visueel'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'toegankelijkheid',
    title: 'How to enlarge text?',
    titleNl: 'Hoe vergroot ik de tekst?',
    slug: 'tekst-vergroten',
    excerpt: 'Maak tekst groter',
    content: 'Enlarge text',
    contentNl: `# Tekst vergroten

## In de app

1. Instellingen → Weergave
2. Tekstgrootte → Schuif naar groter
3. Opslaan

## Via je telefoon

Ook je telefooninstellingen voor tekstgrootte werken in de app.`,
    keywords: ['tekst', 'vergroten', 'groter'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'toegankelijkheid',
    title: 'All accessibility options',
    titleNl: 'Welke toegankelijkheidsopties zijn er?',
    slug: 'toegankelijkheidsopties',
    excerpt: 'Overzicht van alle opties',
    content: 'Accessibility options',
    contentNl: `# Toegankelijkheidsopties

## Visueel

- Tekstgrootte aanpassen
- Hoog contrast
- Donkere modus
- Modus voor slechtzienden

## Beweging

- Verminderde animaties
- Haptic feedback aan/uit

## Screenreaders

- VoiceOver (iOS)
- TalkBack (Android)

Alle opties zijn **gratis**!`,
    keywords: ['toegankelijkheid', 'opties', 'overzicht'],
    isFeatured: false,
    order: 3
  }
]

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Seeding FAQ data...')
  console.log(`   📁 ${faqCategories.length} categories`)
  console.log(`   📝 ${allArticles.length} articles`)
  console.log('')

  // Get or create admin user
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminUser) {
    console.log('⚠️  No admin user found, creating one...')
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@liefdevooriedereen.nl',
        name: 'Support Team',
        role: 'ADMIN',
        hasAcceptedTerms: true
      }
    })
  }

  // Create categories
  console.log('📂 Creating categories...')
  const categoryMap = new Map<string, string>()

  for (const category of faqCategories) {
    const created = await prisma.fAQCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        nameNl: category.nameNl,
        description: category.description,
        icon: category.icon,
        order: category.order,
        isVisible: category.isVisible
      },
      create: category
    })
    categoryMap.set(category.slug, created.id)
    console.log(`   ✓ ${category.icon} ${category.nameNl}`)
  }

  // Create articles
  console.log('')
  console.log('📝 Creating articles...')
  let created = 0
  let updated = 0

  for (const article of allArticles) {
    const categoryId = categoryMap.get(article.categorySlug)
    if (!categoryId) continue

    const existing = await prisma.fAQArticle.findUnique({
      where: { slug: article.slug }
    })

    const data = {
      categoryId,
      title: article.title,
      titleNl: article.titleNl,
      content: article.content,
      contentNl: article.contentNl,
      excerpt: article.excerpt,
      keywords: article.keywords,
      isFeatured: article.isFeatured,
      order: article.order,
      isPublished: true
    }

    if (existing) {
      await prisma.fAQArticle.update({ where: { slug: article.slug }, data })
      updated++
    } else {
      await prisma.fAQArticle.create({
        data: { ...data, slug: article.slug, authorId: adminUser.id }
      })
      created++
    }
  }

  console.log(`   ✓ ${created} created, ${updated} updated`)

  // Summary
  console.log('')
  console.log('✅ FAQ seed complete!')
  console.log('')
  console.log('📊 Summary:')
  for (const cat of faqCategories) {
    const count = allArticles.filter(a => a.categorySlug === cat.slug).length
    console.log(`   ${cat.icon} ${cat.nameNl}: ${count}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
