/**
 * Kennisbank Content Seed Script
 *
 * Genereert wereldklasse content voor de kennisbank:
 * - Categorieën en subcategorieën
 * - Pillar artikelen (uitgebreide gidsen)
 * - Cluster artikelen
 * - Easy Read versies
 * - Tools
 */

import { PrismaClient, ArticleType, TargetAudience, ReadingLevel, ToolType } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// CATEGORIEËN
// ============================================
const categories = [
  {
    name: 'Safety & Protection',
    nameNl: 'Veiligheid & Bescherming',
    slug: 'veiligheid',
    description: 'Everything about staying safe while dating online and offline.',
    descriptionNl: 'Alles over romance scams, catfishing, fysieke veiligheid en online privacy bij daten.',
    icon: 'Shield',
    color: '#DC2626',
    metaTitle: 'Dating Veiligheid | Bescherm Jezelf Online',
    metaDescription: 'Leer hoe je jezelf beschermt tegen romance scams, catfishing en andere gevaren bij online daten.',
    subcategories: [
      { name: 'Romance Scams', nameNl: 'Romance Scams', slug: 'romance-scams' },
      { name: 'Catfishing', nameNl: 'Catfishing', slug: 'catfishing' },
      { name: 'Physical Safety', nameNl: 'Fysieke Veiligheid', slug: 'fysieke-veiligheid' },
      { name: 'Privacy & Data', nameNl: 'Privacy & Data', slug: 'privacy' },
      { name: 'Sextortion', nameNl: 'Sextortion', slug: 'sextortion' },
    ]
  },
  {
    name: 'Inclusive Dating',
    nameNl: 'Inclusief Daten',
    slug: 'inclusief-daten',
    description: 'Practical guides for dating with autism, intellectual disabilities, anxiety, or physical disabilities.',
    descriptionNl: 'Praktische gidsen voor daten met autisme, LVB, angst of fysieke beperking.',
    icon: 'Heart',
    color: '#7C3AED',
    metaTitle: 'Inclusief Daten | Tips voor Iedereen',
    metaDescription: 'Praktische dating tips voor mensen met autisme, LVB, angst of een beperking.',
    subcategories: [
      { name: 'Autism & Dating', nameNl: 'Autisme & Dating', slug: 'autisme' },
      { name: 'Intellectual Disabilities', nameNl: 'LVB & Dating', slug: 'lvb' },
      { name: 'Anxiety & Dating', nameNl: 'Angst & Dating', slug: 'angst' },
      { name: 'Physical Disabilities', nameNl: 'Fysieke Beperking', slug: 'fysieke-beperking' },
      { name: 'LGBTQ+ Dating', nameNl: 'LGBTQ+ Dating', slug: 'lgbtq' },
    ]
  },
  {
    name: 'Communication',
    nameNl: 'Communicatie & Contact',
    slug: 'communicatie',
    description: 'From the first message to planning a date - all communication tips.',
    descriptionNl: 'Van het eerste bericht tot het plannen van een date - alle communicatietips.',
    icon: 'MessageCircle',
    color: '#2563EB',
    metaTitle: 'Dating Communicatie | Eerste Berichten & Gesprekken',
    metaDescription: 'Leer effectief communiceren bij online daten. Tips voor eerste berichten, gesprekken en dates plannen.',
    subcategories: [
      { name: 'First Messages', nameNl: 'Eerste Berichten', slug: 'eerste-berichten' },
      { name: 'Conversation Skills', nameNl: 'Gesprekstechnieken', slug: 'gesprekken' },
      { name: 'Flirting', nameNl: 'Flirten', slug: 'flirten' },
      { name: 'Difficult Situations', nameNl: 'Moeilijke Situaties', slug: 'moeilijk' },
    ]
  },
  {
    name: 'Relationships',
    nameNl: 'Relaties',
    slug: 'relaties',
    description: 'From date to relationship, partner communication, and relationship maintenance.',
    descriptionNl: 'Van date naar relatie, communicatie met je partner, en relatie-onderhoud.',
    icon: 'Users',
    color: '#DB2777',
    metaTitle: 'Relatie Tips | Van Date naar Relatie',
    metaDescription: 'Tips voor het opbouwen en onderhouden van een gezonde relatie. Van eerste date tot langdurige partner.',
    subcategories: [
      { name: 'First Dates', nameNl: 'Eerste Dates', slug: 'eerste-dates' },
      { name: 'Building Relationships', nameNl: 'Relatie Opbouwen', slug: 'relatie-opbouwen' },
      { name: 'Partner Communication', nameNl: 'Partner Communicatie', slug: 'partner-communicatie' },
      { name: 'Problem Solving', nameNl: 'Problemen Oplossen', slug: 'problemen' },
      { name: 'Attachment Styles', nameNl: 'Hechtingsstijlen', slug: 'hechtingsstijlen' },
    ]
  },
  {
    name: 'Profile & Photos',
    nameNl: 'Profiel & Foto\'s',
    slug: 'profiel',
    description: 'Create an attractive dating profile that represents the real you.',
    descriptionNl: 'Maak een aantrekkelijk dating profiel dat de echte jij laat zien.',
    icon: 'Camera',
    color: '#0891B2',
    metaTitle: 'Dating Profiel Tips | Foto\'s & Bio',
    metaDescription: 'Maak een aantrekkelijk dating profiel. Tips voor foto\'s, bio teksten en je beste kant laten zien.',
    subcategories: [
      { name: 'Profile Photos', nameNl: 'Profielfoto\'s', slug: 'fotos' },
      { name: 'Bio Writing', nameNl: 'Bio Schrijven', slug: 'bio' },
      { name: 'Profile Review', nameNl: 'Profiel Check', slug: 'profiel-check' },
    ]
  },
  {
    name: 'Success Stories',
    nameNl: 'Succesverhalen',
    slug: 'succesverhalen',
    description: 'Inspiring stories of couples who found each other through Love for Everyone.',
    descriptionNl: 'Inspirerende verhalen van koppels die elkaar via Liefde Voor Iedereen vonden.',
    icon: 'Star',
    color: '#EA580C',
    metaTitle: 'Dating Succesverhalen | Echte Liefde',
    metaDescription: 'Lees inspirerende verhalen van koppels die online de liefde vonden.',
    subcategories: []
  },
]

// ============================================
// TOOLS
// ============================================
const tools = [
  {
    name: 'Love Language Quiz',
    nameNl: 'Liefdetaal Quiz',
    slug: 'liefdetaal-quiz',
    description: 'Discover how you give and receive love with the 5 Love Languages quiz.',
    descriptionNl: 'Ontdek hoe jij liefde geeft en ontvangt met de 5 Liefdetalen quiz.',
    toolType: 'QUIZ' as ToolType,
    apiEndpoint: '/kennisbank/tools/liefdetaal-quiz',
  },
  {
    name: 'Attachment Style Quiz',
    nameNl: 'Hechtingsstijl Quiz',
    slug: 'hechtingsstijl-quiz',
    description: 'Understand your attachment patterns in relationships.',
    descriptionNl: 'Begrijp jouw hechtingspatronen in relaties.',
    toolType: 'ASSESSMENT' as ToolType,
    apiEndpoint: '/kennisbank/tools/hechtingsstijl-quiz',
  },
  {
    name: 'Scam Checker',
    nameNl: 'Scam Checker',
    slug: 'scam-checker',
    description: 'Check if a message contains romance scam red flags.',
    descriptionNl: 'Check of een bericht kenmerken van romance scam bevat.',
    toolType: 'CHECKER' as ToolType,
    apiEndpoint: '/api/kennisbank/tools/scam-check',
  },
  {
    name: 'Dating Readiness Quiz',
    nameNl: 'Dating Readiness Quiz',
    slug: 'dating-readiness',
    description: 'Are you ready to start dating? Find out with this assessment.',
    descriptionNl: 'Ben je klaar om te daten? Ontdek het met deze test.',
    toolType: 'ASSESSMENT' as ToolType,
    apiEndpoint: '/kennisbank/tools/dating-readiness',
  },
  {
    name: 'Compatibility Quiz',
    nameNl: 'Compatibiliteit Quiz',
    slug: 'compatibility-quiz',
    description: 'Test your relationship compatibility across 5 dimensions.',
    descriptionNl: 'Test jullie relatie-compatibiliteit op 5 dimensies.',
    toolType: 'QUIZ' as ToolType,
    apiEndpoint: '/kennisbank/tools/compatibility-quiz',
  },
  {
    name: 'Red Flag Checklist',
    nameNl: 'Rode Vlaggen Checklist',
    slug: 'red-flag-checklist',
    description: 'Interactive checklist to identify warning signs in dating.',
    descriptionNl: 'Interactieve checklist om waarschuwingssignalen te herkennen.',
    toolType: 'INTERACTIVE' as ToolType,
    apiEndpoint: '/kennisbank/tools/red-flag-checklist',
  },
  {
    name: 'Icebreaker Generator',
    nameNl: 'Icebreaker Generator',
    slug: 'icebreaker-generator',
    description: 'Generate personalized first messages based on interests.',
    descriptionNl: 'Genereer persoonlijke eerste berichten op basis van interesses.',
    toolType: 'GENERATOR' as ToolType,
    apiEndpoint: '/kennisbank/tools/icebreaker-generator',
  },
]

// ============================================
// PILLAR ARTIKELEN - Uitgebreide Gidsen
// ============================================
const pillarArticles = [
  // VEILIGHEID - Romance Scams Pillar
  {
    title: 'The Complete Guide to Recognizing Romance Scams',
    titleNl: 'Romance Scams Herkennen: De Complete Gids',
    slug: 'romance-scams-herkennen-complete-gids',
    categorySlug: 'veiligheid',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL', 'LVB', 'SENIOR'] as TargetAudience[],
    keywords: ['romance scam', 'dating fraude', 'oplichting', 'online dating veiligheid', 'catfish', 'love scam'],
    metaTitle: 'Romance Scams Herkennen | Complete Gids 2025',
    metaDescription: 'Leer alle signalen van romance scams herkennen. Bescherm jezelf tegen dating fraude met deze uitgebreide gids.',
    excerptNl: 'Leer de belangrijkste signalen herkennen om jezelf te beschermen tegen dating fraude. Deze complete gids helpt je veilig te daten.',
    contentNl: `# Romance Scams Herkennen: De Complete Gids

Romance scams zijn een van de meest voorkomende vormen van online fraude. Jaarlijks worden duizenden Nederlanders slachtoffer, met een gemiddeld verlies van €10.000 tot €50.000. In deze uitgebreide gids leer je alles over het herkennen en voorkomen van romance scams.

## Wat is een Romance Scam?

Een romance scam is een vorm van oplichting waarbij de dader een romantische relatie simuleert om uiteindelijk geld of persoonlijke gegevens te stelen. De oplichter:

1. **Creëert een nep profiel** - Vaak met gestolen foto's van aantrekkelijke personen
2. **Bouwt vertrouwen op** - Door intensief contact en liefdevolle berichten
3. **Creëert een emotionele band** - Maakt je verliefd en afhankelijk
4. **Vraagt om geld** - Met een "noodgeval" als excuus

## De 10 Belangrijkste Waarschuwingssignalen

### 1. Te Mooi om Waar te Zijn
Als iemands foto's er professioneel of te perfect uitzien, doe dan een [reverse image search](https://images.google.com). Scammers gebruiken vaak foto's van modellen of social media influencers.

**Rode vlag:** Slechts 1-2 foto's, altijd dezelfde pose, geen casual foto's.

### 2. Snelle Escalatie van Gevoelens
Scammers verklaren vaak binnen dagen of weken hun "liefde". Dit heet **love bombing** - je overspoelen met aandacht en complimenten.

**Rode vlag:** "Ik heb nog nooit zo'n connectie gevoeld" na een paar dagen.

### 3. Altijd een Excuus om Niet te Videobellen
Een echte match wil je zien en horen. Scammers vermijden videobellen omdat ze niet zijn wie ze zeggen te zijn.

**Rode vlag:** Camera is "kapot", internet is "te slecht", moet altijd werken.

### 4. Het Verhaal Klopt Niet
Let op inconsistenties in hun verhaal. Verandert hun leeftijd, beroep of woonplaats?

**Rode vlag:** Zegt in Amsterdam te wonen maar kent basis dingen niet.

### 5. Werkt in het Buitenland
Veel scammers claimen:
- Militair op missie
- Ingenieur op olieplatform
- Arts voor VN/WHO
- Zakenreis in Afrika/Azië

**Rode vlag:** Kan nooit fysiek afspreken door "werk".

### 6. Vraagt om Geld of Cadeaubonnen
Dit is het ultieme doel. De "noodgevallen" zijn eindeloos:
- Medische kosten
- Reiskosten om jou te bezoeken
- Juridische problemen
- Familienood

**Rode vlag:** Vraagt om iTunes/Google Play kaarten (niet traceerbaar).

### 7. Wil Snel van het Platform Af
Scammers willen naar WhatsApp, Telegram of email verhuizen waar ze niet gemonitord worden.

**Rode vlag:** Pusht om binnen 24 uur van de dating app af te gaan.

### 8. Grammatica- en Spelfouten
Veel scammers opereren vanuit het buitenland. Let op:
- Vreemde zinsconstructies
- Verkeerd gebruik van Nederlandse uitdrukkingen
- Inconsistent taalgebruik

### 9. Dringende Verzoeken
Scammers creëren urgentie: "Als ik niet vandaag €2.000 krijg, ga ik de gevangenis in!"

**Rode vlag:** Emotionele chantage en tijdsdruk.

### 10. Vraagt om Persoonlijke Gegevens
Wees voorzichtig met het delen van:
- BSN nummer
- Kopie paspoort/ID
- Bankgegevens
- Wachtwoorden

## Wat te Doen bij Vermoeden van Scam?

### Stap 1: Stop het Contact
Blokkeer de persoon direct. Ga niet in discussie.

### Stap 2: Verzamel Bewijs
Maak screenshots van:
- Alle gesprekken
- Het profiel
- Eventuele betalingsverzoeken

### Stap 3: Meld het
- **Fraudehelpdesk:** 088-786 73 72
- **Politie:** Doe aangifte online via politie.nl
- **Dating platform:** Rapporteer het profiel

### Stap 4: Praat erover
Schaam je niet. Scammers zijn professionele manipulators. Praat met:
- Slachtofferhulp Nederland: 0900-0101
- Vrienden en familie

## Bescherm Jezelf: Preventie Tips

1. **Doe altijd een reverse image search** op profielfoto's
2. **Videobel binnen 2 weken** - geen excuus accepteren
3. **Stuur nooit geld** naar iemand die je niet persoonlijk kent
4. **Vertrouw je gevoel** - als het te mooi lijkt, is het dat vaak
5. **Houd je financiën privé** - deel nooit bankgegevens

## Hulp Nodig?

Als je slachtoffer bent geworden of twijfelt over iemand:

- **Fraudehelpdesk:** 088-786 73 72
- **Slachtofferhulp:** 0900-0101
- **Politie:** 0900-8844

---

## Veelgestelde Vragen

### Kan ik mijn geld terugkrijgen?
Helaas is dit zeer moeilijk. Meld het wel altijd bij de politie en je bank.

### Hoe weet ik zeker of het een scam is?
Gebruik onze [Scam Checker Tool](/kennisbank/tools/scam-checker) om berichten te analyseren.

### Zijn romance scams strafbaar?
Ja, dit valt onder oplichting (artikel 326 Wetboek van Strafrecht).

---

*Dit artikel is voor het laatst bijgewerkt in januari 2025.*
`,
    contentEasyRead: `# Romance Scams: Wat is het?

Een romance scam is wanneer iemand doet alsof ze van je houden.
Maar ze willen eigenlijk je geld stelen.

## Hoe herken je een scammer?

### 1. Ze zijn te perfect
Hun foto's zien er uit als van een model.
**Tip:** Zoek de foto op Google Images.

### 2. Ze zeggen snel "ik hou van je"
Na een paar dagen zeggen ze al dat ze van je houden.
Dat is niet normaal.

### 3. Ze willen niet videobellen
Ze hebben altijd een excuus:
- Camera kapot
- Slecht internet
- Geen tijd

### 4. Ze vragen om geld
Dit is het belangrijkste signaal!
Ze vragen om geld voor:
- Vliegticket
- Ziekenhuis
- Problemen

**Stuur nooit geld naar iemand die je niet kent!**

## Wat moet je doen?

1. **Stop met praten** met die persoon
2. **Blokkeer** ze
3. **Vertel** het aan iemand die je vertrouwt
4. **Bel de Fraudehelpdesk:** 088-786 73 72

## Hulp nodig?

- Fraudehelpdesk: 088-786 73 72
- Politie: 0900-8844

**Je hoeft je niet te schamen.**
Oplichters zijn heel slim.
`,
  },

  // INCLUSIEF DATEN - Autisme Pillar
  {
    title: 'Dating with Autism: A Complete Guide',
    titleNl: 'Daten met Autisme: De Complete Gids',
    slug: 'daten-met-autisme-complete-gids',
    categorySlug: 'inclusief-daten',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    hasEasyRead: true,
    targetAudience: ['AUTISM', 'GENERAL'] as TargetAudience[],
    keywords: ['autisme dating', 'ASS relaties', 'neurodivergent daten', 'autisme tips', 'sociale interactie'],
    metaTitle: 'Daten met Autisme | Complete Gids & Tips',
    metaDescription: 'Praktische tips voor daten met autisme. Van profiel maken tot eerste date - alles wat je moet weten.',
    excerptNl: 'Een praktische gids voor mensen met autisme die willen daten. Met concrete tips voor elke stap van het dating proces.',
    contentNl: `# Daten met Autisme: De Complete Gids

Daten kan uitdagend zijn voor iedereen, maar als je autisme hebt, komen er extra uitdagingen bij kijken. Deze gids biedt praktische, concrete tips voor elke stap van het dating proces.

## Waarom Daten Anders Kan Voelen

Met autisme kun je tegen bepaalde dingen aanlopen:

- **Sociale signalen lezen** - Flirten en hints kunnen verwarrend zijn
- **Small talk** - Oppervlakkige gesprekken kunnen zinloos aanvoelen
- **Sensorische prikkels** - Drukke date locaties kunnen overweldigend zijn
- **Verandering van routine** - Dating past niet in vaste patronen
- **Onzekerheid** - Niet weten wat er verwacht wordt

**Het goede nieuws:** Met de juiste strategieën en een partner die je begrijpt, kun je succesvol daten.

## Je Profiel Maken

### Wel of Niet Vermelden?
Dit is een persoonlijke keuze. Overweeg:

**Voordelen van vermelden:**
- Filtert mensen die niet open-minded zijn
- Trekt mensen aan die je accepteren
- Verklaart bepaald gedrag vooraf
- Minder masking nodig

**Nadelen van vermelden:**
- Sommige mensen hebben vooroordelen
- Je bent meer dan je diagnose

**Tip:** Je hoeft het niet in je bio te zetten. Je kunt het ook later bespreken als er een klik is.

### Profiel Tips voor Autisten

1. **Wees specifiek over je interesses**
   - Niet: "Ik hou van games"
   - Wel: "Ik kan uren praten over de lore van Dark Souls"

2. **Gebruik duidelijke taal**
   - Zeg wat je zoekt zonder hints

3. **Kies foto's in een rustige setting**
   - Dit trekt mensen aan die ook van rust houden

4. **Vermeld je communicatiestijl**
   - "Ik ben direct en waardeer eerlijkheid"

## Het Eerste Bericht

### Concrete Openers

In plaats van "Hey, hoe gaat het?" probeer:

- "Ik zag dat je ook van [interesse] houdt. Wat vind je van [specifieke vraag]?"
- "Je foto bij [locatie] viel me op. Wat was je favoriete deel?"
- "Ik ben [naam]. Ik vond je profiel interessant omdat [concrete reden]."

### Gesprek Gaande Houden

**Stel open vragen:**
- "Wat vind jij daarvan?"
- "Hoe kwam je daarbij?"
- "Kun je daar meer over vertellen?"

**Het is oké om:**
- Te zeggen dat je niet goed bent in small talk
- Te vragen wat iemand bedoelt
- Pauzes te nemen in het gesprek

## De Eerste Date Plannen

### Ideale Date Locaties voor Autisten

**Goed:**
- Rustig café (niet in het weekend)
- Wandeling in de natuur
- Museum (vaak rustiger doordeweeks)
- Activiteit met structuur (workshop, escape room)

**Vermijd:**
- Drukke restaurants op zaterdag
- Clubs of bars
- Plekken zonder duidelijke eindtijd

### Praktische Tips

1. **Verken de locatie vooraf**
   - Bekijk foto's online
   - Weet waar de toiletten zijn
   - Check of er een stille plek is

2. **Plan een eindtijd**
   - "Ik heb om 16:00 nog iets" geeft een natuurlijk moment om te stoppen

3. **Neem iets mee voor comfort**
   - Oordopjes
   - Fidget toy in je zak
   - Zonnebril

4. **Communiceer je behoeften**
   - "Ik kan me het beste concentreren in een rustige ruimte"

## Tijdens de Date

### Lichaamstaal Lezen

Omdat dit lastig kan zijn, let op deze duidelijke signalen:

**Positief:**
- Ze leunen naar je toe
- Ze stellen vervolgvragen
- Ze lachen oprecht (ogen bewegen mee)
- Ze stellen een volgende date voor

**Negatief:**
- Ze kijken vaak op hun telefoon
- Korte antwoorden zonder vragen terug
- Ze kijken naar de uitgang
- Gesloten houding (armen over elkaar)

### Hoe Lang Oogcontact?

Een vuistregel: kijk iemand aan terwijl ze praten, kijk weg als je nadenkt over je antwoord.

**Tip:** Het is oké om te zeggen: "Ik kijk soms weg omdat ik dan beter kan nadenken, niet omdat ik niet luister."

### Gespreksstokken Voorkomen

Heb een lijstje met vragen in je hoofd:
- "Wat doe je het liefst in je vrije tijd?"
- "Wat was het hoogtepunt van je week?"
- "Waar zou je naartoe reizen als geld geen rol speelde?"

## Na de Date

### Interesse Tonen

Als je een leuke date had:
- Stuur binnen 24 uur een bericht
- Wees duidelijk: "Ik vond het leuk en zou je graag weer zien"
- Stel een concreet plan voor

### Als Je Geen Klik Voelde

Wees eerlijk maar vriendelijk:
- "Bedankt voor de date. Ik voelde geen romantische klik, maar ik wens je het beste."

## Autisme Bespreken

### Wanneer Vertel Je Het?

Er is geen perfect moment. Opties:

1. **In je profiel** - Meteen duidelijk
2. **Tijdens chatten** - Als het relevant wordt
3. **Voor de eerste date** - "Ik wil even iets delen..."
4. **Tijdens of na de date** - Als er een klik is

### Hoe Vertel Je Het?

Wees feitelijk en positief:

"Ik heb autisme. Dat betekent dat ik [concrete voorbeelden]. Het helpt als je [wat je nodig hebt]."

**Voorbeeld:**
"Ik heb autisme. Ik ben heel eerlijk en direct in mijn communicatie. Soms mis ik hints, dus het helpt als je duidelijk zegt wat je bedoelt."

## Tips van Autisten voor Autisten

> "De juiste persoon zal je niet vragen om anders te zijn. Ze vinden je manier van zijn juist interessant." - Emma, 28

> "Ik heb geleerd om meteen te zeggen dat ik moeite heb met hints. Dat maakt alles makkelijker." - Tim, 32

> "Online daten gaf me tijd om na te denken over mijn antwoorden. Dat hielp enorm." - Lisa, 25

## Hulp en Ondersteuning

- **MEE Nederland** - Ondersteuning voor mensen met een beperking
- **NVA** - Nederlandse Vereniging voor Autisme
- **Autisme Cafe** - Ontmoetingen met andere autisten

---

## Veelgestelde Vragen

### Is er een dating app specifiek voor autisten?
Er zijn apps zoals Hiki, maar mainstream apps werken ook goed als je duidelijk bent in je profiel.

### Moet ik masking doen op een date?
Probeer jezelf te zijn. De juiste partner accepteert je zoals je bent.

### Hoe ga ik om met afwijzing?
Afwijzing hoort bij daten. Het zegt niet iets over jouw waarde. Neem de tijd om te verwerken.
`,
    contentEasyRead: `# Daten met Autisme

## Wat maakt daten soms lastig?

Als je autisme hebt, kan daten moeilijk zijn:
- Je weet niet altijd wat iemand bedoelt
- Drukke plekken zijn vermoeiend
- Je weet niet wat je moet zeggen

**Maar:** Met goede tips kun je prima daten!

## Je Profiel Maken

Schrijf op waar je van houdt.
Wees eerlijk over wie je bent.

**Tip:** Je hoeft niet te zeggen dat je autisme hebt.
Dat mag je zelf kiezen.

## De Eerste Date

### Goede plekken voor een date:
- Rustig café
- Wandelen in het park
- Museum

### Slechte plekken:
- Druk restaurant
- Club

### Neem mee:
- Oordopjes (als het te druk wordt)
- Je telefoon (voor noodgevallen)

## Praten op een Date

Je kunt deze vragen stellen:
- "Wat doe je graag in je vrije tijd?"
- "Heb je huisdieren?"
- "Waar werk je?"

**Het is oké om te zeggen:**
"Ik ben niet goed in hints. Zeg maar gewoon wat je bedoelt."

## Na de Date

Vond je het leuk?
Stuur een berichtje: "Ik vond het leuk. Zullen we weer afspreken?"

Vond je het niet leuk?
Zeg: "Bedankt, maar ik voelde geen klik."

## Hulp nodig?

- MEE Nederland kan je helpen
- Praat met iemand die je vertrouwt
`,
  },

  // INCLUSIEF DATEN - LVB Pillar
  {
    title: 'Dating with an Intellectual Disability: Tips and Advice',
    titleNl: 'Daten met een Licht Verstandelijke Beperking (LVB)',
    slug: 'daten-met-lvb-tips',
    categorySlug: 'inclusief-daten',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    hasEasyRead: true,
    targetAudience: ['LVB', 'GENERAL'] as TargetAudience[],
    keywords: ['LVB dating', 'verstandelijke beperking', 'veilig daten', 'relaties LVB'],
    metaTitle: 'Daten met LVB | Veilig Daten Tips',
    metaDescription: 'Tips voor veilig en leuk daten met een licht verstandelijke beperking. Makkelijk te lezen.',
    excerptNl: 'Praktische tips voor mensen met LVB die willen daten. Veilig, leuk en in makkelijke taal.',
    contentNl: `# Daten met een Licht Verstandelijke Beperking

Iedereen verdient liefde. Ook als je een licht verstandelijke beperking (LVB) hebt. In dit artikel lees je hoe je veilig en leuk kunt daten.

## Wat is Daten?

Daten betekent iemand leren kennen.
Je doet leuke dingen samen.
Je kijkt of jullie bij elkaar passen.

## Veilig Daten

### Regel 1: Vertel Niemand je Adres
Geef je adres niet aan iemand die je online kent.
Wacht tot je iemand goed kent.

### Regel 2: Spreek Af op een Openbare Plek
Spreek af waar andere mensen zijn:
- Een café
- Een winkelcentrum
- Een park

### Regel 3: Vertel Iemand Waar Je Bent
Zeg tegen een vriend of familielid:
- Met wie je afspreekt
- Waar je bent
- Hoe laat je klaar bent

### Regel 4: Stuur Nooit Geld
Iemand die echt van je houdt, vraagt niet om geld.
**Stuur nooit geld naar iemand die je online kent!**

## Een Profiel Maken

### Kies Goede Foto's
- Een foto waar je gezicht goed te zien is
- Foto's van dingen die je leuk vindt
- Vraag iemand om te helpen kiezen

### Schrijf Over Jezelf
Vertel wat je leuk vindt:
- Je hobby's
- Je favoriete muziek
- Wat voor persoon je zoekt

**Tip:** Vraag iemand om je tekst te controleren.

## Het Eerste Bericht

Je kunt zeggen:
- "Hoi, ik ben [naam]. Ik vind je profiel leuk!"
- "Hoi! Ik zag dat je ook van [hobby] houdt."

## De Eerste Afspraak

### Goede Ideeën
- Koffie drinken
- Wandelen
- Naar de bioscoop

### Bereid je Voor
- Weet hoe je er komt
- Neem geld mee
- Laad je telefoon op

### Tijdens de Afspraak
- Wees jezelf
- Stel vragen
- Luister goed

## Wanneer is Iemand Niet Oké?

Let op deze signalen:

**NIET OKÉ:**
- Ze vragen om geld
- Ze willen je adres weten
- Ze pushen voor seks
- Ze worden boos als je nee zegt
- Ze willen dat je het geheim houdt

**WEL OKÉ:**
- Ze respecteren je grenzen
- Ze zijn geduldig
- Ze stellen je voor aan vrienden
- Ze zijn eerlijk

## Hulp Vragen

Het is oké om hulp te vragen!

- **MEE Nederland** - Zij helpen je met daten
- **Je begeleider** - Vraag om tips
- **Iemand die je vertrouwt**

## Nee Zeggen

Je mag altijd nee zeggen:
- Nee tegen seks
- Nee tegen een tweede date
- Nee tegen dingen die niet oké voelen

**Niemand mag je dwingen.**

## Hulpnummers

Als iets niet goed voelt:
- **Bel 112** bij gevaar
- **Bel Sensoor:** 0900-0767
- **Bel je begeleider**

---

**Onthoud:**
Jij bent de moeite waard.
De juiste persoon respecteert je.
`,
    contentEasyRead: `# Daten met LVB

## Wat is daten?

Daten = iemand leren kennen.
Je doet leuke dingen samen.

## Veilig Daten

**Geef je adres niet!**
Spreek af waar andere mensen zijn.
Vertel iemand waar je bent.
**Stuur nooit geld!**

## De Eerste Afspraak

Goede plekken:
- Koffie drinken
- Wandelen
- Bioscoop

Neem mee:
- Telefoon (opgeladen!)
- Geld

## Wanneer is het NIET OKÉ?

❌ Ze vragen om geld
❌ Ze willen je adres
❌ Ze worden boos als je nee zegt

## Wanneer is het WEL OKÉ?

✅ Ze zijn lief
✅ Ze luisteren naar je
✅ Ze respecteren "nee"

## Hulp Nodig?

Bel MEE Nederland.
Vraag je begeleider.
`,
  },

  // COMMUNICATIE - Eerste Berichten Pillar
  {
    title: 'The Perfect First Message: Complete Guide',
    titleNl: 'Het Perfecte Eerste Bericht: Complete Gids',
    slug: 'perfecte-eerste-bericht-gids',
    categorySlug: 'communicatie',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['eerste bericht', 'dating app bericht', 'openingszin', 'conversation starter', 'ijsbreker'],
    metaTitle: 'Het Perfecte Eerste Bericht | Dating Tips',
    metaDescription: 'Leer het perfecte eerste bericht schrijven op dating apps. Met 20+ voorbeelden die écht werken.',
    excerptNl: 'Leer het perfecte eerste bericht schrijven. Met praktische tips en 20+ voorbeelden die echt werken.',
    contentNl: `# Het Perfecte Eerste Bericht: Complete Gids

Het eerste bericht kan het verschil maken tussen een match die uitdooft en een geweldig gesprek. In deze gids leer je precies hoe je een bericht schrijft dat antwoord krijgt.

## Waarom Eerste Berichten Zo Belangrijk Zijn

Onderzoek toont aan:
- 90% van de gesprekken begint met een bericht van de man
- Slechts 30% van de eerste berichten krijgt antwoord
- Berichten met een vraag krijgen 2x zo vaak antwoord
- Persoonlijke berichten scoren 3x beter dan "hey"

## De Gouden Regels

### Regel 1: Lees Hun Profiel
Het grootste verschil tussen succes en falen is **personalisatie**. Lees het profiel en reageer op iets specifieks.

**Slecht:** "Hey, je bent mooi"
**Goed:** "Ik zag dat je ook van hiking houdt! Wat was je mooiste wandeling?"

### Regel 2: Stel Een Open Vraag
Open vragen nodigen uit tot een gesprek. Gesloten vragen stoppen het gesprek.

**Gesloten:** "Hou je van reizen?" (Ja/Nee)
**Open:** "Wat is je favoriete reisbestemming geweest?"

### Regel 3: Houd het Kort
Ideale lengte: 1-3 zinnen. Niemand wil een essay lezen.

### Regel 4: Wees Positief
Geen klachten over dating apps. Geen negatieve opmerkingen.

### Regel 5: Wees Jezelf
Kopieer geen standaard teksten. Authenticiteit wint.

## 20+ Eerste Berichten Die Werken

### Gebaseerd op Interesses

**Reizen:**
- "Ik zag je foto in [land]. Wat was het beste eten dat je daar gegeten hebt?"
- "Nog travel bucket list items die je wilt afvinken dit jaar?"

**Muziek:**
- "Ik zag dat je van [artiest] houdt! Heb je ze live gezien?"
- "Als je leven een soundtrack had, welk nummer zou het openingsnummer zijn?"

**Sport:**
- "Nog meegedaan aan [sport] recent? Ik zoek altijd mensen om mee te [activiteit]."
- "Team sporten of solo? Ik ben zelf een [voorkeur] persoon."

**Eten:**
- "Je foto bij [restaurant] - aanrader? Ik zoek altijd goede tips!"
- "Als je maar één keuken kon eten voor de rest van je leven, welke zou het zijn?"

**Huisdieren:**
- "Je hond is schattig! Wat voor ras is het?"
- "Katten of honden persoon? Ik heb zelf een [huisdier]."

### Humor

- "Ik vroeg ChatGPT om een opening line, maar die was zo slecht dat ik besloot zelf iets te proberen. Hoe gaat het?"
- "Op een schaal van 1 tot 'ik heb net mijn ex geunmatcht', hoe gaat je dating week?"
- "Ik beloof dat ik interessanter ben dan mijn opening line doet vermoeden."

### Direct & Eerlijk

- "Je profiel viel me op omdat [reden]. Zou je zin hebben om een keer [activiteit] te doen?"
- "Ik heb een goede date radar en die slaat bij jou uit. Zin om te chatten?"

### Creatief

- "Twee waarheden en een leugen - jij eerst?"
- "Plot twist: dit is geen standaard opening line."
- "Ik scrollde langs 47 profielen tot ik bij die van jou stopte. Wat maakte jouw profiel zo speciaal? Jij mag raden."

## Wat Je NIET Moet Doen

### Vermijd Deze Berichten

❌ "Hey"
❌ "Hi mooie"
❌ "Hoe is het?"
❌ "Wat zoek je hier?"
❌ Seksuele opmerkingen
❌ Complimenten alleen over uiterlijk
❌ Kopieer-plak berichten
❌ Negatieve opmerkingen

### Waarom Deze Niet Werken

- Te generiek - laat geen moeite zien
- Geeft niets om op te reageren
- Komt lui of ongeïnteresseerd over
- Staat niet uit tussen de 50 andere "hey" berichten

## Het Gesprek Gaande Houden

### Na Het Eerste Antwoord

1. **Reageer op wat ze zeggen** - Toon dat je leest
2. **Voeg iets toe** - Deel een eigen ervaring
3. **Stel een vervolgvraag** - Houd de bal bij hen

### Voorbeeld Gesprek

**Jij:** "Je foto bij die hiking trail ziet er epic uit! Is dat in Nederland?"

**Zij:** "Thanks! Dat was in Oostenrijk, in Tirol. Prachtig gebied!"

**Jij:** "Ah Tirol! Daar wil ik ook graag een keer heen. Hoe was het met de hoogte? Ik ben meer een zeeniveau persoon 😄 Heb je nog andere tips voor die regio?"

## Wanneer Doorvragen naar een Date

Na 5-10 berichten heen en weer kun je voorstellen:

- "Dit gesprek is leuk! Zullen we een keer wat drinken?"
- "Ik merk dat ik niet zo goed ben in appen, maar wel in persoon. Koffie een keer?"
- "Ik wil je graag beter leren kennen. Zin in een date volgende week?"

## Tips per Platform

### Tinder/Bumble
- Kort en snappy werkt het beste
- Humor scoort goed
- Verwijs naar hun foto's

### Hinge
- Reageer op hun prompts
- Meer ruimte voor diepere gesprekken
- Toon persoonlijkheid

### Bumble (voor vrouwen)
- Jij moet het eerste bericht sturen
- Stel een vraag zodat hij makkelijk kan antwoorden
- Wees specifiek over waarom je hem likte

---

## Veelgestelde Vragen

### Hoe lang moet ik wachten met antwoorden?
Antwoord wanneer je tijd hebt. Games spelen werkt niet.

### Wat als ik geen antwoord krijg?
Ga door. Niet iedereen is actief. Stuur geen tweede bericht.

### Mag ik een GIF sturen?
Ja, maar alleen als het bij het gesprek past. Niet als eerste bericht.
`,
    contentEasyRead: `# Het Eerste Bericht

## Wat Werkt

✅ Lees hun profiel
✅ Stel een vraag
✅ Houd het kort
✅ Wees positief

## Goede Voorbeelden

"Ik zag dat je van [hobby] houdt. Wat vind je er zo leuk aan?"

"Je foto is leuk! Waar is die gemaakt?"

"Hey! Ik ben [naam]. Ik zag dat je ook van [interesse] houdt."

## Slechte Voorbeelden

❌ "Hey"
❌ "Hoe is het?"
❌ "Je bent mooi"

## Tips

1. Lees het profiel
2. Stel een vraag
3. Wees aardig
4. Wacht op antwoord
`,
  },

  // RELATIES - Hechtingsstijlen Pillar
  {
    title: 'Understanding Attachment Styles in Relationships',
    titleNl: 'Hechtingsstijlen in Relaties: Alles Wat Je Moet Weten',
    slug: 'hechtingsstijlen-relaties-gids',
    categorySlug: 'relaties',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['hechtingsstijl', 'attachment style', 'veilig gehecht', 'angstig gehecht', 'vermijdend', 'relatiepsychologie'],
    metaTitle: 'Hechtingsstijlen in Relaties | Complete Gids',
    metaDescription: 'Ontdek je hechtingsstijl en hoe dit je relaties beïnvloedt. Met praktische tips voor elke stijl.',
    excerptNl: 'Leer alles over hechtingsstijlen en hoe ze je relaties beïnvloeden. Met tips om gezondere relaties op te bouwen.',
    contentNl: `# Hechtingsstijlen in Relaties: Alles Wat Je Moet Weten

Je hechtingsstijl bepaalt voor een groot deel hoe je je gedraagt in romantische relaties. In deze gids leer je de vier hechtingsstijlen kennen en krijg je praktische tips om gezondere relaties op te bouwen.

## Wat Zijn Hechtingsstijlen?

Hechtingsstijlen zijn patronen in hoe we emotionele banden vormen met anderen. Ze ontwikkelen zich in de vroege kinderjaren op basis van onze ervaringen met verzorgers, maar kunnen gedurende het leven veranderen.

**De 4 Hechtingsstijlen:**
1. Veilig gehecht
2. Angstig gehecht
3. Vermijdend gehecht
4. Angstig-vermijdend gehecht

## Veilig Gehecht (50% van de bevolking)

### Kenmerken
- Comfortabel met intimiteit én onafhankelijkheid
- Vertrouwt partners en zichzelf
- Kan emoties goed reguleren
- Communiceet open over behoeften
- Herstelt snel van conflicten

### In Relaties
Je voelt je veilig om jezelf te zijn. Je kunt nabijheid verdragen zonder je te verliezen, en afstand zonder angst voor verlating.

### Ontstaan
Meestal opgegroeid met responsieve, betrouwbare verzorgers die emotioneel beschikbaar waren.

---

## Angstig Gehecht (20% van de bevolking)

### Kenmerken
- Sterk verlangen naar intimiteit
- Angst voor verlating of afwijzing
- Vaak bevestiging nodig
- Gevoelig voor kleine signalen
- Neiging tot "klampend" gedrag

### In Relaties
Je houdt veel van je partner en wilt veel samen zijn. Als je partner afstand neemt, word je onrustig. Je analyseert hun gedrag en zoekt geruststelling.

### Veelvoorkomende Gedachten
- "Houdt hij/zij wel echt van mij?"
- "Waarom reageert hij/zij niet meteen?"
- "Ik ben bang dat ze me verlaten"

### Tips voor Angstig Gehechten

**Doe:**
- Werk aan zelfvertrouwen buiten de relatie
- Ontwikkel eigen hobby's en vriendschappen
- Communiceer behoeften zonder beschuldigingen
- Leer emoties te reguleren voor je reageert

**Vermijd:**
- Constant checken of je partner nog van je houdt
- Je leven volledig rond de relatie bouwen
- Jezelf klein maken om aardig gevonden te worden

### Zinnen om te Oefenen
- "Ik voel me onzeker, maar dat betekent niet dat er iets mis is."
- "Ik kan voor mezelf zorgen, ook als mijn partner even niet beschikbaar is."

---

## Vermijdend Gehecht (25% van de bevolking)

### Kenmerken
- Sterke behoefte aan onafhankelijkheid
- Oncomfortabel met te veel intimiteit
- Trekt zich terug bij emotionele situaties
- Rationaliseert in plaats van voelen
- Waardeert vrijheid zeer hoog

### In Relaties
Je houdt van je partner, maar hebt veel ruimte nodig. Als dingen te intens worden, trek je je terug. Emotionele gesprekken kosten je energie.

### Veelvoorkomende Gedachten
- "Ik heb gewoon tijd voor mezelf nodig"
- "Waarom maken we hier zo'n drama van?"
- "Ik functioneer beter alleen"

### Tips voor Vermijdend Gehechten

**Doe:**
- Oefen met het benoemen van emoties
- Blijf in moeilijke gesprekken in plaats van weglopen
- Communiceer je behoefte aan ruimte
- Erken dat afhankelijkheid niet zwak is

**Vermijd:**
- Relaties beëindigen bij de eerste spanning
- Partner op afstand houden met kritiek
- Emoties volledig onderdrukken

### Zinnen om te Oefenen
- "Ik heb ruimte nodig, maar ik kom terug."
- "Ik vind het moeilijk om hierover te praten, maar ik wil het proberen."

---

## Angstig-Vermijdend Gehecht (5% van de bevolking)

### Kenmerken
- Tegenstrijdige gevoelens over intimiteit
- Wil nabijheid maar is er ook bang voor
- Chaotisch gedrag in relaties
- Moeite met emotieregulatie
- Vaak gelinkt aan vroege trauma's

### In Relaties
Je schommelt tussen verlangen naar je partner en hen wegduwen. Het ene moment wil je heel dichtbij zijn, het volgende moment heb je paniek en neem je afstand.

### Tips voor Angstig-Vermijdend Gehechten

**Doe:**
- Overweeg therapie (dit is de meest uitdagende stijl om mee om te gaan)
- Werk aan het herkennen van je triggers
- Bouw een ondersteunend netwerk buiten de relatie
- Wees geduldig met jezelf

**Vermijd:**
- Jezelf straffen voor je gedrag
- Relaties aangaan terwijl je nog niet geheeld bent
- Trauma negeren

---

## Kun Je Je Hechtingsstijl Veranderen?

**Ja!** Hechtingsstijlen zijn niet vastgelegd. Je kunt naar veilige hechting groeien door:

1. **Bewustwording** - Herken je patronen
2. **Therapie** - Werk met een professional
3. **Gezonde relatie** - Een veilig gehechte partner kan helend zijn
4. **Zelfwerk** - Boeken, cursussen, reflectie

## De Beste Combinaties

| Jij | Partner | Uitdaging |
|-----|---------|-----------|
| Veilig | Elke stijl | Laag - je kunt de ander helpen groeien |
| Angstig | Vermijdend | Hoog - trigger elkaar's onzekerheden |
| Angstig | Angstig | Medium - veel emotie, weinig stabiliteit |
| Vermijdend | Vermijdend | Medium - afstandelijk maar stabiel |

## Doe de Test

Ontdek je eigen hechtingsstijl met onze [Hechtingsstijl Quiz](/kennisbank/tools/hechtingsstijl-quiz).

---

## Veelgestelde Vragen

### Kan ik een mix van stijlen hebben?
Ja, veel mensen hebben elementen van meerdere stijlen. Meestal is er één dominant.

### Maakt mijn partner mij angstig gehecht?
Je partner kan patronen triggeren, maar de basis ligt in je eigen geschiedenis.

### Hoe lang duurt het om te veranderen?
Met consistent werk zie je vaak na 6-12 maanden verandering. Grote shifts kunnen jaren duren.
`,
    contentEasyRead: `# Hechtingsstijlen

## Wat is een hechtingsstijl?

Een hechtingsstijl is hoe je je gedraagt in relaties.
Er zijn 4 soorten:

## 1. Veilig Gehecht
Je voelt je goed in een relatie.
Je kunt nabij zijn én alleen.
Dit is de gezondste stijl.

## 2. Angstig Gehecht
Je bent vaak bang dat je partner weggaat.
Je hebt veel geruststelling nodig.
Je maakt je snel zorgen.

## 3. Vermijdend Gehecht
Je houdt van je eigen ruimte.
Te dichtbij voelt oncomfortabel.
Je trekt je terug bij emoties.

## 4. Angstig-Vermijdend
Je wilt nabijheid maar bent er ook bang voor.
Je gedrag wisselt veel.

## Kun je het veranderen?

Ja! Met hulp kun je veranderen.
- Praat met een therapeut
- Lees erover
- Oefen in relaties

## Test jezelf

Doe de [Hechtingsstijl Quiz](/kennisbank/tools/hechtingsstijl-quiz).
`,
  },
]

// ============================================
// SEED FUNCTIE
// ============================================
async function main() {
  console.log('🌱 Seeding Kennisbank Content...\n')

  // Find or create a system/admin user for article authorship
  console.log('👤 Finding admin user...')
  let adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'ADMIN' },
        { email: { contains: 'admin' } }
      ]
    }
  })

  if (!adminUser) {
    console.log('   ⚠️ No admin user found, creating system user...')
    adminUser = await prisma.user.create({
      data: {
        email: 'system@liefdevoor.nl',
        name: 'Kennisbank Redactie',
        role: 'ADMIN',
      }
    })
    console.log(`   ✅ Created system user: ${adminUser.email}`)
  } else {
    console.log(`   ✅ Using admin user: ${adminUser.email}`)
  }

  const authorId = adminUser.id

  // Clear existing data (optional - comment out in production)
  console.log('\n🗑️  Clearing existing kennisbank data...')
  await prisma.knowledgeBaseFeedback.deleteMany()
  await prisma.knowledgeBaseToolResult.deleteMany()
  await prisma.knowledgeBaseArticleTool.deleteMany()
  await prisma.knowledgeBaseRelation.deleteMany()
  await prisma.knowledgeBaseArticle.deleteMany()
  await prisma.knowledgeBaseTool.deleteMany()
  await prisma.knowledgeBaseCategory.deleteMany()

  // Create categories
  console.log('📁 Creating categories...')
  const categoryMap = new Map<string, string>()
  const subcategoryMap = new Map<string, string>()

  for (const cat of categories) {
    const category = await prisma.knowledgeBaseCategory.create({
      data: {
        name: cat.name,
        nameNl: cat.nameNl,
        slug: cat.slug,
        description: cat.description,
        descriptionNl: cat.descriptionNl,
        icon: cat.icon,
        color: cat.color,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        isVisible: true,
      }
    })
    categoryMap.set(cat.slug, category.id)
    console.log(`  ✅ Created category: ${cat.nameNl}`)

    // Create subcategories
    for (const sub of cat.subcategories) {
      const subcategory = await prisma.knowledgeBaseCategory.create({
        data: {
          name: sub.name,
          nameNl: sub.nameNl,
          slug: `${cat.slug}-${sub.slug}`,
          parentId: category.id,
          color: cat.color,
          isVisible: true,
        }
      })
      subcategoryMap.set(`${cat.slug}/${sub.slug}`, subcategory.id)
      console.log(`    ✅ Created subcategory: ${sub.nameNl}`)
    }
  }

  // Create tools
  console.log('\n🔧 Creating tools...')
  const toolMap = new Map<string, string>()

  for (const tool of tools) {
    const createdTool = await prisma.knowledgeBaseTool.create({
      data: {
        name: tool.name,
        nameNl: tool.nameNl,
        slug: tool.slug,
        description: tool.description,
        descriptionNl: tool.descriptionNl,
        toolType: tool.toolType,
        apiEndpoint: tool.apiEndpoint,
        isActive: true,
      }
    })
    toolMap.set(tool.slug, createdTool.id)
    console.log(`  ✅ Created tool: ${tool.nameNl}`)
  }

  // Create pillar articles
  console.log('\n📝 Creating pillar articles...')

  for (const article of pillarArticles) {
    const categoryId = categoryMap.get(article.categorySlug)
    if (!categoryId) {
      console.log(`  ⚠️ Category not found: ${article.categorySlug}`)
      continue
    }

    await prisma.knowledgeBaseArticle.create({
      data: {
        title: article.title,
        titleNl: article.titleNl,
        slug: article.slug,
        content: article.contentNl, // Using Dutch content for both
        contentNl: article.contentNl,
        contentEasyRead: article.contentEasyRead,
        hasEasyRead: article.hasEasyRead,
        excerpt: article.excerptNl,
        excerptNl: article.excerptNl,
        categoryId: categoryId,
        authorId: authorId,
        articleType: article.articleType,
        isPillarPage: article.isPillarPage,
        targetAudience: article.targetAudience,
        readingLevel: 'STANDARD',
        keywords: article.keywords,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        status: 'PUBLISHED',
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
      }
    })
    console.log(`  ✅ Created article: ${article.titleNl}`)
  }

  console.log('\n✨ Kennisbank seeding complete!')
  console.log(`   📁 ${categories.length} categories`)
  console.log(`   📂 ${categories.reduce((acc, c) => acc + c.subcategories.length, 0)} subcategories`)
  console.log(`   🔧 ${tools.length} tools`)
  console.log(`   📝 ${pillarArticles.length} pillar articles`)
}

main()
  .catch((e) => {
    console.error('Error seeding kennisbank:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
