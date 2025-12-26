/**
 * FAQ Articles: Ontdekken & Matchen (Discover & Matching)
 * 7 articles about swiping, matching and discovering profiles
 */

import { FAQArticleData } from './articles-getting-started'

export const discoverArticles: FAQArticleData[] = [
  {
    categorySlug: 'ontdekken-matchen',
    title: 'How does swiping work?',
    titleNl: 'Hoe werkt swipen?',
    slug: 'hoe-werkt-swipen',
    excerpt: 'Leer de basis van swipen en hoe je matches krijgt',
    content: 'How swiping works',
    contentNl: `# Hoe werkt swipen?

Swipen is de kern van Liefde Voor Iedereen. Zo ontdek je nieuwe mensen en krijg je matches!

## De basis

### Naar rechts swipen = Like 💚
Je vindt iemand leuk en wilt hem/haar beter leren kennen.

### Naar links swipen = Nee bedankt ❌
Deze persoon is niet je type.

### Naar boven swipen = Super Like ⭐
Je bent ECHT geïnteresseerd (beperkt aantal per dag).

## Hoe krijg je een match?

Een **match** ontstaat wanneer twee mensen elkaar liken:
1. Jij swiped rechts op Emma
2. Emma swiped ook rechts op jou
3. 🎉 Match! Nu kunnen jullie chatten

## Waar vind ik swipen?

Tik op het **hart-icoon** of **"Ontdekken"** in de navigatiebalk. Je ziet dan profielkaarten die je kunt swipen.

## Swipe-opties

### Op een profielkaart:
- **Swipe links** → Nee
- **Swipe rechts** → Like
- **Swipe omhoog** → Super Like
- **Tik op de foto** → Bekijk meer info

### Met de knoppen:
- ❌ **Rood kruis** → Nee
- 💚 **Groen hart** → Like
- ⭐ **Blauwe ster** → Super Like
- ⏪ **Gele pijl** → Rewind (Premium)

## Swipe-limieten

### Gratis account:
- **25 likes per dag**
- **1 Super Like per dag**
- Limieten resetten om middernacht

### Liefde Plus:
- **Onbeperkt likes**
- **5 Super Likes per dag**

### Liefde Compleet:
- **Onbeperkt alles!**

## Tips voor beter swipen

✅ Neem de tijd om profielen te bekijken
✅ Lees de bio voordat je swiped
✅ Kijk naar meerdere foto's
✅ Beluister de Voice Intro als die er is
✅ Gebruik Super Likes strategisch

## Veelgestelde vragen

**Ziet iemand dat ik links heb geswiped?**
Nee, alleen Super Likes worden (soms) gemeld.

**Kan ik een swipe ongedaan maken?**
Ja, met Rewind (Premium functie).

**Krijgen beide mensen een melding bij een match?**
Ja! Jullie krijgen allebei een match-notificatie.

**Waarom zijn mijn likes op?**
Gratis accounts hebben een daglimiet. Wacht tot middernacht of upgrade naar Plus.`,
    keywords: ['swipen', 'swipe', 'like', 'liken', 'match', 'rechts', 'links', 'ontdekken', 'discover'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'What is a Super Like?',
    titleNl: 'Wat is een Super Like?',
    slug: 'super-like',
    excerpt: 'Alles over Super Likes: hoe ze werken en wanneer je ze gebruikt',
    content: 'Super Like explanation',
    contentNl: `# Wat is een Super Like?

Een Super Like is een krachtige manier om te laten zien dat je ECHT geïnteresseerd bent in iemand.

## Hoe werkt het?

### Normaal like:
- De ander weet niet dat je hebt geliket
- Pas bij een match (wederzijds like) weten jullie van elkaar

### Super Like:
- De ander ziet DIRECT dat je hem/haar hebt Super Liked
- Je profiel wordt met een blauwe ster gemarkeerd
- **3x meer kans op een match!**

## Hoe geef ik een Super Like?

### Swipen:
Swipe **omhoog** op een profielkaart.

### Knop:
Tik op de **blauwe ster** ⭐ onderaan de profielkaart.

## Hoeveel Super Likes heb ik?

| Abonnement | Super Likes per dag |
|------------|---------------------|
| Gratis | 1 |
| Liefde Plus | 5 |
| Liefde Compleet | Onbeperkt |

Super Likes resetten om middernacht.

## Wanneer Super Like gebruiken?

✅ Als je echt enthousiast bent over iemand
✅ Als je denkt dat je profiel anders onopgemerkt blijft
✅ Bij profielen met veel gemeenschappelijke interesses
✅ Als iemands bio je echt aanspreekt

## Ziet de ander mijn Super Like?

Ja! De persoon ziet:
- Een melding dat jij een Super Like hebt gegeven
- Een blauwe rand om je profielkaart
- Een ster-icoon bij je foto

## Tips

✅ Wees selectief - gebruik ze voor profielen waar je echt een connectie voelt
✅ Schrijf een sterke bio - mensen bekijken je profiel extra goed na een Super Like
✅ Zorg voor goede foto's - eerste indruk telt extra

## Veelgestelde vragen

**Garandeert een Super Like een match?**
Nee, de ander moet je nog steeds terug-liken.

**Kan ik een Super Like ongedaan maken?**
Niet direct. Met Rewind (Premium) kun je je laatste actie terugdraaien.

**Krijg ik mijn Super Like terug als de ander niet reageert?**
Nee, gebruikte Super Likes komen niet terug.`,
    keywords: ['super like', 'superlike', 'ster', 'blauw', 'omhoog swipen', 'speciaal', 'opvallen'],
    isFeatured: true,
    order: 2
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'How does the matching algorithm work?',
    titleNl: 'Hoe werkt het match algoritme?',
    slug: 'match-algoritme',
    excerpt: 'Ontdek hoe we de beste matches voor je vinden',
    content: 'How the matching algorithm works',
    contentNl: `# Hoe werkt het match algoritme?

Ons slimme algoritme helpt je om de beste matches te vinden. Hier lees je hoe het werkt.

## Wat analyseert het algoritme?

### 1. Basisvoorkeuren (40%)
We respecteren je ingestelde voorkeuren:
- Leeftijdsbereik
- Geslacht
- Maximum afstand

### 2. Gemeenschappelijke interesses (25%)
Hoe meer overlappende interesses, hoe hoger de score:
- Sport & hobby's
- Muziek & entertainment
- Lifestyle keuzes

### 3. Profielkwaliteit (15%)
Complete profielen krijgen voorrang:
- Aantal foto's
- Bio ingevuld
- Voice Intro aanwezig
- Verificatiestatus

### 4. Activiteit (10%)
Actieve gebruikers worden vaker getoond:
- Hoe vaak je inlogt
- Hoe vaak je swiped
- Hoe snel je reageert op matches

### 5. Gedragspatronen (10%)
We leren van je swipe-gedrag:
- Welk type profielen je liket
- Hoeveel tijd je aan profielen besteedt
- Met wie je daadwerkelijk chat

## De Match Score

Op sommige profielen zie je een **match-percentage**. Dit geeft aan hoe goed jullie bij elkaar passen op basis van:
- Overlappende interesses
- Vergelijkbare bio's
- Compatibele voorkeuren

## Hoe verbeter je je matches?

### Vul je profiel volledig in
- Upload minimaal 3 foto's
- Schrijf een persoonlijke bio
- Selecteer al je interesses
- Voeg een Voice Intro toe

### Verifieer je profiel
Geverifieerde profielen krijgen een boost in zichtbaarheid.

### Wees actief
Log regelmatig in en swipe dagelijks.

### Wees specifiek in je voorkeuren
Te brede voorkeuren geven minder relevante matches.

## Premium voordelen

Met een premium abonnement:
- **Prioriteit** in het algoritme
- Zie wie jou liket **vóórdat je matched**
- Gebruik **Boost** voor extra zichtbaarheid

## Veelgestelde vragen

**Waarom zie ik steeds dezelfde profielen?**
Je hebt mogelijk alle beschikbare profielen in je bereik gezien. Pas je voorkeuren aan.

**Wordt afstand exact berekend?**
We berekenen afstand op basis van postcodes, niet exacte adressen (voor privacy).

**Beïnvloeden mijn berichten het algoritme?**
Ja, actief chatten met matches verbetert je zichtbaarheid.`,
    keywords: ['algoritme', 'matching', 'hoe werkt', 'score', 'compatibiliteit', 'vinden', 'suggesties'],
    isFeatured: true,
    order: 3
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'What are Top Picks / De Selectie?',
    titleNl: 'Wat zijn Top Picks / De Selectie?',
    slug: 'top-picks-selectie',
    excerpt: 'Dagelijks geselecteerde profielen speciaal voor jou',
    content: 'Top Picks feature explanation',
    contentNl: `# Wat zijn Top Picks / De Selectie?

Top Picks (ook wel "De Selectie" genoemd) zijn dagelijks door ons algoritme geselecteerde profielen die extra goed bij jou passen.

## Hoe werkt het?

Elke dag selecteert ons algoritme een aantal profielen speciaal voor jou, gebaseerd op:
- Je interesses en voorkeuren
- Je swipe-geschiedenis
- Profielkwaliteit van de voorgestelde personen
- Compatibiliteitsscore

## Waar vind ik Top Picks?

1. Tik op **"Ontdekken"** in de navigatie
2. Zoek de sectie **"Top Picks"** of **"De Selectie"**
3. Of tik op het **diamant-icoon** 💎

## Wat maakt Top Picks speciaal?

### Hogere kwaliteit
- Profielen met goede foto's en complete bio's
- Vaak geverifieerde accounts
- Actieve gebruikers

### Betere match
- Hoge compatibiliteitsscore
- Veel gemeenschappelijke interesses
- Passend bij je voorkeuren

### Matchpercentage
Bij elke Top Pick zie je een **matchpercentage** dat aangeeft hoe goed jullie bij elkaar passen.

## Hoeveel Top Picks krijg ik?

| Abonnement | Aantal per dag |
|------------|----------------|
| Gratis | 1-2 picks (bekijken) |
| Liefde Plus | 5+ picks |
| Liefde Compleet | 10+ picks |

Top Picks vernieuwen elke 24 uur.

## Tips voor Top Picks

✅ Check je Top Picks dagelijks - ze verdwijnen na 24 uur
✅ Besteed extra aandacht aan deze profielen
✅ Een Super Like op een Top Pick is extra effectief
✅ Vul je eigen profiel goed in voor betere Top Picks

## Veelgestelde vragen

**Weet de ander dat ze mijn Top Pick zijn?**
Nee, alleen jij ziet je Top Picks.

**Waarom heb ik geen nieuwe Top Picks?**
- Je hebt mogelijk alle profielen in je bereik gezien
- Pas je zoekvoorkeuren aan voor meer opties

**Tellen Top Picks mee als gewone swipes?**
Nee, Top Picks hebben een aparte sectie en tellen niet mee voor je swipe-limiet.

**Kan ik oude Top Picks terugzien?**
Nee, gemiste Top Picks zijn voorgoed weg. Check ze dagelijks!`,
    keywords: ['top picks', 'selectie', 'dagelijks', 'speciaal', 'uitgelicht', 'beste matches', 'diamant'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'How do I use search filters?',
    titleNl: 'Hoe gebruik ik de zoekfilters?',
    slug: 'zoekfilters-gebruiken',
    excerpt: 'Vind precies wie je zoekt met onze geavanceerde filters',
    content: 'How to use search filters',
    contentNl: `# Hoe gebruik ik de zoekfilters?

Met zoekfilters vind je sneller mensen die bij je passen. Hier lees je hoe ze werken.

## Basis zoekfilters

### Locatie
Kies hoe je wilt zoeken:
- **Op postcode**: Zoek binnen een straal van je postcode
- **Op stad**: Zoek in een specifieke stad

### Afstand
Stel je maximum reisafstand in:
- Schuif de slider van 5 tot 500 km
- Kleinere afstand = makkelijker afspreken
- Grotere afstand = meer opties

### Leeftijd
Kies een leeftijdsbereik:
- Minimum leeftijd (bijv. 25)
- Maximum leeftijd (bijv. 35)

### Geslacht
Selecteer wie je wilt zien:
- Mannen
- Vrouwen
- Iedereen

## Geavanceerde filters (Premium)

Met **Liefde Compleet** krijg je extra filters:

### Verificatie
- Alleen geverifieerde profielen tonen
- Meer zekerheid dat profielen echt zijn

### Online status
- Toon alleen gebruikers die recent online waren
- "Nu online" filter beschikbaar

### Met foto's
- Toon alleen profielen met minimaal X foto's

## Filters toepassen

1. Ga naar **Ontdekken** of **Zoeken**
2. Tik op het **filter-icoon** ⚙️
3. Pas de gewenste filters aan
4. Tik op **"Toepassen"** of **"Zoeken"**

## Tips voor effectief filteren

✅ **Begin breed, verfijn later**
Start met ruime filters en maak ze strikter als je te veel matches hebt.

✅ **Wees niet te strikt**
Zeer nauwe filters kunnen leiden tot nul resultaten.

✅ **Experimenteer**
Probeer verschillende combinaties om te zien wat werkt.

✅ **Check je locatie**
Zorg dat je postcode/stad correct is ingesteld.

## Filters resetten

Wil je opnieuw beginnen?
1. Ga naar de filters
2. Tik op **"Reset"** of **"Wis alles"**
3. Je ziet weer alle profielen

## Veelgestelde vragen

**Worden mijn filters opgeslagen?**
Ja, je laatst gebruikte filters blijven bewaard.

**Zien anderen mijn filters?**
Nee, je zoekfilters zijn privé.

**Waarom krijg ik geen resultaten?**
- Je filters zijn te strikt
- Er zijn weinig gebruikers in je gebied
- Probeer je afstand te vergroten`,
    keywords: ['filters', 'zoeken', 'zoekfilters', 'afstand', 'leeftijd', 'locatie', 'geavanceerd'],
    isFeatured: false,
    order: 5
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'What are Stories and how do I create one?',
    titleNl: 'Wat zijn Stories en hoe maak ik er een?',
    slug: 'stories',
    excerpt: 'Deel momenten uit je dag met Stories die 24 uur zichtbaar zijn',
    content: 'Stories feature explanation',
    contentNl: `# Wat zijn Stories en hoe maak ik er een?

Stories zijn korte foto- of video-updates die 24 uur zichtbaar zijn. Ze geven je matches een kijkje in je dagelijks leven!

## Wat is een Story?

- Een **foto of video** die je deelt
- Zichtbaar voor **24 uur**
- Daarna verdwijnt de Story automatisch
- Vergelijkbaar met Instagram Stories

## Waarom Stories delen?

✅ **Toon je persoonlijkheid**
Laat meer zien dan alleen je profielfoto's.

✅ **Blijf top-of-mind**
Matches zien je Stories bovenaan hun scherm.

✅ **Start gesprekken**
Stories zijn perfecte gespreksopeners.

✅ **Deel spontane momenten**
Geen perfecte foto nodig - authenticiteit werkt!

## Hoe maak ik een Story?

### Stap 1: Open Stories
- Ga naar je **matches** of **homepage**
- Tik op je **profielfoto** met het + icoon
- Of tik op **"Voeg Story toe"**

### Stap 2: Maak content
- **Camera**: Maak een nieuwe foto/video
- **Galerij**: Kies een bestaande foto

### Stap 3: Bewerk (optioneel)
- Voeg tekst toe
- Gebruik stickers
- Pas filters toe

### Stap 4: Delen
Tik op **"Deel"** of **"Publiceer"**

## Wie kan mijn Stories zien?

- **Al je matches** kunnen je Stories zien
- **Mensen die je hebben geliket** (Premium)
- Je kunt Stories **niet** verbergen voor specifieke personen

## Stories bekijken

### Waar vind ik Stories?
Stories verschijnen bovenaan:
- Je matches-pagina
- Je homepage

### Hoe bekijk ik ze?
- Tik op iemands profielfoto
- Swipe om naar de volgende te gaan
- Tik om te pauzeren

### Story beantwoorden
- Onder een Story kun je direct reageren
- Dit opent een chat met die persoon

## Story verwijderen

Wil je een Story eerder verwijderen?
1. Open je eigen Story
2. Tik op de drie puntjes (...)
3. Kies **"Verwijderen"**

## Richtlijnen voor Stories

✅ **Toegestaan:**
- Selfies en foto's van jezelf
- Hobby's en activiteiten
- Reizen en uitjes
- Huisdieren
- Eten en drinken

❌ **Niet toegestaan:**
- Naaktheid of expliciete content
- Andere personen zonder toestemming
- Contactgegevens
- Spam of reclame

## Veelgestelde vragen

**Hoe lang blijft mijn Story zichtbaar?**
Precies 24 uur na publicatie.

**Kan ik zien wie mijn Story heeft bekeken?**
Ja! Tik op je Story en swipe omhoog voor de kijkers.

**Hoeveel Stories kan ik per dag plaatsen?**
Onbeperkt!`,
    keywords: ['stories', 'story', 'verhaal', 'delen', 'foto', 'video', '24 uur', 'tijdelijk'],
    isFeatured: false,
    order: 6
  },
  {
    categorySlug: 'ontdekken-matchen',
    title: 'Why am I not seeing new profiles?',
    titleNl: 'Waarom zie ik geen nieuwe profielen?',
    slug: 'geen-nieuwe-profielen',
    excerpt: 'Oplossingen wanneer je geen nieuwe profielen meer te zien krijgt',
    content: 'Troubleshooting no new profiles',
    contentNl: `# Waarom zie ik geen nieuwe profielen?

Het kan frustrerend zijn als je geen nieuwe profielen meer ziet. Hier zijn de mogelijke oorzaken en oplossingen.

## Mogelijke oorzaken

### 1. Je hebt alle profielen gezien
In je huidige zoekgebied en met je huidige filters heb je iedereen al bekeken.

**Oplossing:**
- Vergroot je afstandsfilter
- Verbreed je leeftijdsbereik
- Wacht een paar dagen op nieuwe gebruikers

### 2. Je filters zijn te strikt
Zeer specifieke filters beperken je opties drastisch.

**Oplossing:**
- Reset je filters naar standaard
- Verruim je voorkeuren stap voor stap

### 3. Je dagelijkse swipes zijn op
Gratis accounts hebben een limiet van 25 swipes per dag.

**Oplossing:**
- Wacht tot middernacht (reset)
- Upgrade naar Liefde Plus voor onbeperkt swipen

### 4. Technisch probleem
Soms helpt het om de app te verversen.

**Oplossing:**
- Sluit de app volledig af en open opnieuw
- Trek omlaag om te verversen (pull-to-refresh)
- Wis de cache (zie Technische Hulp)

### 5. Je woont in een klein gebied
In minder bevolkte gebieden zijn er simpelweg minder gebruikers.

**Oplossing:**
- Vergroot je zoekradius significant
- Gebruik Passport (Premium) om in grotere steden te zoeken

## Stap-voor-stap checklist

1. ✅ Check je internetverbinding
2. ✅ Ververs de app (pull-to-refresh)
3. ✅ Bekijk je huidige filters
4. ✅ Vergroot je afstandsinstelling
5. ✅ Check of je swipes nog over zijn
6. ✅ Herstart de app volledig

## Meer profielen krijgen

### Korte termijn:
- Pas je filters aan
- Wacht op nieuwe gebruikers
- Upgrade je abonnement

### Lange termijn:
- Verbeter je eigen profiel (betere zichtbaarheid)
- Wees geduldiger met swipen
- Check de app op verschillende tijdstippen

## Premium oplossingen

Met een premium abonnement:
- **Onbeperkt swipen** (geen dagelijkse limiet)
- **Passport** - Zoek in andere steden
- **Rewind** - Draai swipes terug die je per ongeluk hebt gemaakt

## Veelgestelde vragen

**Wanneer komen er nieuwe profielen bij?**
Dagelijks melden nieuwe gebruikers zich aan. Check regelmatig!

**Komen profielen die ik heb afgekeurd terug?**
Soms, maar niet vaak. Ze kunnen terugkomen als:
- Ze hun foto's/bio hebben geüpdatet
- Er zeer weinig profielen beschikbaar zijn

**Ik woon in een grote stad, waarom zie ik toch niemand?**
- Check of je locatie correct is ingesteld
- Bekijk je filterinstellingen
- Zorg dat je profiel actief is (niet gepauzeerd)`,
    keywords: ['geen profielen', 'leeg', 'niemand', 'op', 'geen matches', 'geen resultaten', 'wachten'],
    isFeatured: false,
    order: 7
  }
]
