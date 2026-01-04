/**
 * Extra Kennisbank Content Seed Script
 *
 * Voegt wereldklasse content toe voor:
 * - Profiel & Foto's (0 → 5 artikelen)
 * - Succesverhalen (0 → 4 artikelen)
 * - Extra Veiligheid artikelen
 * - Uitgebreide Begrippen glossary
 */

import { PrismaClient, ArticleType, TargetAudience, ReadingLevel } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// PROFIEL & FOTO'S ARTIKELEN
// ============================================
const profielArticles = [
  {
    title: 'The Perfect Profile Photo: Science-Based Tips',
    titleNl: 'De Perfecte Profielfoto: Tips Gebaseerd op Wetenschap',
    slug: 'perfecte-profielfoto-tips',
    categorySlug: 'profiel',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    isFeatured: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['profielfoto', 'dating foto', 'tinder foto', 'beste foto', 'dating profiel'],
    metaTitle: 'Perfecte Profielfoto voor Dating | Bewezen Tips',
    metaDescription: 'Ontdek welke foto\'s het beste werken op dating apps. Wetenschappelijk onderbouwde tips voor meer matches.',
    excerptNl: 'Ontdek welke foto\'s wetenschappelijk bewezen meer matches opleveren. Van belichting tot poses - alles wat je moet weten.',
    contentNl: `# De Perfecte Profielfoto: Tips Gebaseerd op Wetenschap

Je profielfoto is het eerste wat mensen zien. Onderzoek toont aan dat 90% van de eerste indruk op dating apps gebaseerd is op foto's. In deze gids leer je precies welke foto's werken - en waarom.

## De Wetenschap Achter Aantrekkelijke Foto's

### Wat Onderzoek Zegt

**Photofeeler** analyseerde miljoenen foto's en ontdekte:
- Foto's met echte glimlach scoren 76% hoger op "likeability"
- Oogcontact met de camera verhoogt vertrouwen met 35%
- Squinching (licht dichtknijpen ogen) maakt je 20% aantrekkelijker
- Natuurlijk licht scoort 40% beter dan kunstlicht

**Hinge** rapporteerde:
- Foto's met natuurlijke setting krijgen 30% meer likes
- Groepsfoto's als eerste foto verminderen matches met 45%
- Foto's met honden verhogen likes met 5% voor mannen

## De 6 Foto's Die Je Nodig Hebt

### 1. De Hoofdfoto (Cruciaal!)

Dit is de belangrijkste foto. Vereisten:

✅ **Wel:**
- Alleen jij in beeld
- Van schouders en hoger
- Echte, ontspannen glimlach
- Goede belichting (natuurlijk licht het beste)
- Hoge resolutie (minimaal 1080x1080)
- Neutrale of mooie achtergrond

❌ **Niet:**
- Zonnebril
- Groepsfoto
- Selfie van onderaf
- Badkamer spiegel
- Te ver weg
- Donker of korrelig

### 2. De Lichaamsfoto

Laat zien hoe je er "in het echt" uitziet:

- Volledig lichaam zichtbaar
- Goed passende kleding
- Natuurlijke houding
- Niet in de gym (tenzij fitness je hobby is)

### 3. De Activiteitenfoto

Toon een hobby of interesse:

**Goede voorbeelden:**
- Wandelen in de natuur
- Koken in de keuken
- Muziek maken
- Sporten (niet in de spiegel)
- Reizen op een mooie locatie

### 4. De Sociale Foto

Laat zien dat je een sociaal leven hebt:

- Met 1-2 vrienden (niet te veel)
- Op een feestje of evenement
- Jij moet duidelijk zichtbaar zijn
- Knip anderen er NIET uit (ziet er raar uit)

### 5. De Geklede Foto

Toon een andere kant van jezelf:

- Netjes gekleed voor een gelegenheid
- Of juist casual en relaxed
- Variatie in je foto's is belangrijk

### 6. De Bonus/Fun Foto

Iets unieks of grappigs:

- Met je huisdier
- Op een bijzondere locatie
- Een leuk moment
- Toont persoonlijkheid

## Technische Tips voor Betere Foto's

### Belichting

**Golden Hour** (uur na zonsopkomst of voor zonsondergang):
- Zachte, warme gloed
- Geen harde schaduwen
- Natuurlijke schoonheid

**Bewolkte dag:**
- Perfecte diffuse belichting
- Geen schaduwen onder ogen
- Vleiende look voor iedereen

### Camera Positie

- Camera op **ooghoogte of iets hoger**
- Nooit van onderaf (dubbele kin effect)
- Lichte hoek (¾ van gezicht) is vleiender dan frontaal

### De Squinch

Een subtiele techniek van fotografen:
1. Knijp je onderste ooglid licht samen
2. Houd je bovenste ooglid ontspannen
3. Dit maakt je blik intenser en zelfverzekerder

### Houding Tips

**Mannen:**
- Schouders iets naar achteren
- Kin licht naar voren en naar beneden
- Ontspannen handen (niet in vuist)

**Vrouwen:**
- Gewicht op één been
- Lichaam licht gedraaid
- Armen niet plat tegen lichaam

## Veelgemaakte Fouten

### ❌ De Badkamer Selfie
Zegt: "Ik heb geen vrienden die foto's van me maken"

### ❌ Alleen Groepsfoto's
Mensen willen weten wie JIJ bent

### ❌ Oude Foto's
Als je er nu anders uitziet, is het misleidend

### ❌ Te Veel Filters
Snapchat filters zijn een instant left-swipe voor velen

### ❌ Geen Glimlach
Je lijkt onbenaderbaar of boos

### ❌ Extreme Close-up
Geeft een oncomfortabel gevoel

### ❌ Gym Spiegelselfie
Komt narcistisch over (tenzij je een fitness profiel hebt)

### ❌ Met Ex (uitgeknipt)
De afgeknipte arm of schouder is altijd zichtbaar

## Specifieke Tips per Platform

### Tinder
- Eerste foto is ALLES
- Houd het simpel en duidelijk
- Humor werkt goed in latere foto's

### Bumble
- Vrouwen hebben controle, dus toon vertrouwen
- Foto's met activiteiten starten gesprekken

### Hinge
- Meer ruimte voor persoonlijkheid
- Foto's die verhalen vertellen werken goed

## Foto's Laten Maken: DIY Guide

Geen fotograaf nodig! Zo maak je zelf goede foto's:

### Wat Je Nodig Hebt
- Smartphone (moderne camera's zijn goed genoeg)
- Statief of iets om telefoon op te zetten
- Timer of afstandsbediening
- Natuurlijk licht

### Stap voor Stap

1. **Kies het juiste moment**
   - 1-2 uur na zonsopkomst
   - Of 1-2 uur voor zonsondergang

2. **Zoek een goede locatie**
   - Venster met indirect licht
   - Buiten op een bewolkte dag
   - Schone, opgeruimde achtergrond

3. **Zet je camera op**
   - Portretmodus aan
   - Timer op 3 of 10 seconden
   - Maak VEEL foto's (minimum 50)

4. **Poses**
   - Varieer: lachen, serieus, zijkant
   - Beweeg tussen shots
   - Probeer verschillende achtergronden

5. **Selecteer**
   - Laat anderen kiezen (ze zijn objectiever)
   - Gebruik Photofeeler voor feedback

## Professionele Foto's: Wanneer Waard?

Overweeg een professional als:
- Je geen goede recente foto's hebt
- Je niet handig bent met fotografie
- Je er serieus mee aan de slag wilt

**Kosten:** €75-€250 voor een dating-specifieke shoot
**Resultaat:** 5-15 geoptimaliseerde foto's

---

## Veelgestelde Vragen

### Hoeveel foto's moet ik hebben?
Minimaal 3, ideaal 5-6. Niet meer dan 9.

### Mag ik selfies gebruiken?
Één selfie is oké, maar niet als hoofdfoto en niet in de badkamer.

### Hoe oud mogen foto's zijn?
Maximaal 1-2 jaar, en alleen als je er nog hetzelfde uitziet.

### Werken foto's met huisdieren echt?
Ja, maar alleen als het je eigen huisdier is en natuurlijk overkomt.
`,
    contentEasyRead: `# De Perfecte Profielfoto

## Waarom zijn foto's belangrijk?

Mensen kijken eerst naar je foto's.
Goede foto's zorgen voor meer matches.

## De Beste Foto

### Wel:
✅ Alleen jij op de foto
✅ Je gezicht goed zichtbaar
✅ Lachen
✅ Goed licht

### Niet:
❌ Zonnebril op
❌ Groepsfoto
❌ Donkere foto
❌ Badkamer selfie

## Welke Foto's Heb Je Nodig?

1. **Gezichtsfoto** - Van dichtbij
2. **Hele lichaam** - Zo kunnen mensen zien hoe je eruit ziet
3. **Hobby foto** - Wat doe je graag?
4. **Met vrienden** - 1 foto is genoeg

## Tips voor Betere Foto's

- Maak foto's overdag, buiten
- Vraag iemand om je te helpen
- Maak veel foto's
- Kies de beste

## Wat Werkt Niet?

❌ Oude foto's
❌ Filters (zoals Snapchat)
❌ Alleen selfies
❌ Foto's met je ex
`
  },
  {
    title: 'Writing the Perfect Dating Bio',
    titleNl: 'De Perfecte Dating Bio Schrijven: Complete Gids',
    slug: 'perfecte-dating-bio-schrijven',
    categorySlug: 'profiel',
    articleType: 'PILLAR' as ArticleType,
    isPillarPage: true,
    isFeatured: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['dating bio', 'tinder bio', 'profiel tekst', 'over mij', 'dating app bio'],
    metaTitle: 'Dating Bio Schrijven | Tips & Voorbeelden',
    metaDescription: 'Leer een onweerstaanbare dating bio schrijven. Met 30+ voorbeelden en bewezen formules.',
    excerptNl: 'Je bio is je verkooppitch. Leer hoe je een profiel schrijft dat matches aantrekt met praktische tips en voorbeelden.',
    contentNl: `# De Perfecte Dating Bio Schrijven: Complete Gids

Je bio is je kans om persoonlijkheid te tonen na die eerste foto-impressie. Een goede bio kan het verschil maken tussen een "meh" en een "ja!" In deze gids leer je precies hoe je een bio schrijft die werkt.

## Waarom Je Bio Ertoe Doet

Onderzoek van Hinge toont:
- Profielen met een bio krijgen 4x meer matches
- Bio's met specifieke details krijgen 3x meer berichten
- Humor in je bio verhoogt matches met 15%

## De Formule voor een Goede Bio

### De 3-Punts Structuur

Een effectieve bio bevat:

1. **Hook** - Iets pakkends dat aandacht trekt
2. **Wie je bent** - 2-3 interessante feiten
3. **Uitnodiging** - Reden om te matchen

### Voorbeeld:

> Voormalig pizzabakker die ontdekte dat data science leuker betaalt 🍕
>
> Op zaterdag vind je me op de mountainbike of in de keuken experimenteren met Aziatisch eten.
>
> Swipe rechts als je iemand zoekt om samen de beste ramen van Amsterdam te ontdekken.

## Wat WEL te Doen

### ✅ Wees Specifiek

**Generiek:** "Ik hou van reizen"
**Specifiek:** "Net terug van 3 weken door Japan, nog steeds geobsedeerd door ramen"

### ✅ Toon Humor (Als het bij je past)

> Professioneel e-mail beantwoorder. Hobby: mezelf wijsmaken dat ik morgen wel naar de sportschool ga.

### ✅ Geef Gespreksstarters

> Vraag me naar de keer dat ik per ongeluk op date ging met mijn Uber chauffeur.

### ✅ Wees Eerlijk Over Wat Je Zoekt

> Op zoek naar iemand om zondagen mee te verdoen en de week mee door te plannen.

### ✅ Vermeld Unieke Eigenschappen

> Enige in mijn vriendengroep die kaart kan lezen zonder Google Maps.

## Wat NIET te Doen

### ❌ Clichés

Vermijd:
- "Partner in crime zoeken"
- "Leef, lach, liefde"
- "Geen drama"
- "Niet hier voor hookups" (staat negatief)
- "Vraag maar"
- "Ik ben slecht in dit soort dingen"

### ❌ Negativiteit

**Slecht:** "Geen tijdverspillers. Swipe links als je..."
**Beter:** Focus op wat je WEL zoekt

### ❌ Te Vaag

**Vaag:** "Ik hou van leuke dingen doen"
**Specifiek:** "Ik maak de beste carbonara en zoek iemand om het aan te bewijzen"

### ❌ Je Hele Levensverhaal

Houd het kort. 3-4 zinnen is ideaal. Max 500 karakters.

### ❌ Eisen Stellen

**Slecht:** "Minimum 1.80m. Moet van honden houden. Geen kinderen."
**Beter:** Filter via gesprek, niet via je bio

## 30+ Bio Voorbeelden Die Werken

### Humoristisch

> Op zoek naar iemand die mijn algoritme kan hacken 💻
> Overdag marketeer, 's avonds Netflix criticus.
> Perfecte date: jij lacht om mijn grappen (vereist).

> Pros: Kan goed koken, heb Netflix account, ken alle Friends quotes
> Cons: Zal waarschijnlijk je koelkast reorganiseren

> Vacature: partner in crime (geen echte misdaden, max verkeerd geparkeerd staan)

### Avontuurlijk

> 23 landen. 0 gevaarlijke foto's van een klif.
> Volgend jaar: Peru. Vorige maand: IKEA op zaterdag (ook een avontuur).

> Weekdagen: Excel sheets
> Weekenden: Alpine sheets
> Op zoek naar iemand die beide kan waarderen.

### Romantisch/Serieus

> Op zoek naar iemand om mee te groeien.
> Fan van lange gesprekken, koffie op zondagochtend, en plannen maken zonder haast.

> Klaar voor iets echts.
> Zoek iemand om lief en leed mee te delen - en een goede pizzatent.

### Creatief

> Ik schrijf dit terwijl ik op werk eigenlijk zou moeten werken.
> Als dit een match wordt, vertel ik je wat ik eigenlijk zou moeten doen.

> Plot twist: ik ben eigenlijk heel saai.
>
> Kidding. Ik ben gemiddeld interessant, wat eerlijk gezegd al behoorlijk indrukwekkend is.

### Voor Introverten

> Introvert die af en toe sociale vlinder speelt.
> Perfecte avond: thuisbezorgd, goede serie, iemand om tegenaan te zitten.

> I don't always leave my house, but when I do... actually no, that's it.

### Met Huisdier

> Package deal met [naam kat/hond].
> Ze is veeleisend maar ik ben makkelijk. Samen vormen we een gebalanceerd huishouden.

### Voor Ouders (Single Parents)

> Papa van [leeftijd]. Zij is de baas.
> Zoek iemand die begrijpt dat dates soms om 17:00 zijn en dat ik om 21:00 slaap.

## Tips per Platform

### Tinder (150-300 karakters)
- Kort en pakkend
- 1-2 emoji's max
- Humor werkt goed
- Eindig met haak

### Bumble (300 karakters)
- Iets meer ruimte voor persoonlijkheid
- Prompts helpen het gesprek starten
- Wees specifiek over interesses

### Hinge (Prompts-focused)
- Kies prompts die bij je passen
- Geef gespreksstarters
- Toon meerdere kanten van jezelf

## De "Herschrijf" Oefening

Neem je huidige bio en verbeter met deze vragen:

1. Is er iets specifieks dat gesprek uitlokt?
2. Komt mijn persoonlijkheid erdoorheen?
3. Zou ik zelf reageren op deze bio?
4. Is er een vraag of uitnodiging?

---

## Veelgestelde Vragen

### Moet ik mijn beroep vermelden?
Alleen als het interessant is of een gesprek kan starten.

### Emoji's: ja of nee?
Max 2-3 relevant gebruikte emoji's.

### Hoe vaak moet ik mijn bio updaten?
Check elke 2-3 maanden of het nog bij je past.

### Moet ik mijn lengte vermelden?
Optioneel. Sommigen appreciëren de transparantie.
`,
    contentEasyRead: `# Je Dating Bio Schrijven

## Wat is een bio?

Een bio is een kort stukje tekst over jezelf.
Mensen lezen dit om je beter te leren kennen.

## Wat schrijf je op?

Schrijf op:
- Wat je leuk vindt
- Wat je zoekt
- Iets grappigs of interessants

## Goede Voorbeelden

> "Ik hou van wandelen en koken. Zoek iemand om samen te eten."

> "Werk als [beroep]. In mijn vrije tijd [hobby]."

## Slechte Voorbeelden

❌ "Vraag maar"
❌ "Ik ben niet goed in dit"
❌ "Geen drama"

Deze zijn te vaag of negatief.

## Tips

1. Houd het kort (3-4 zinnen)
2. Wees eerlijk
3. Schrijf wat je leuk maakt
4. Eindig met een vraag

**Voorbeeld:**
> "Ik kan goed koken. Zoek jij iemand om samen pasta te maken?"
`
  },
  {
    title: '10 Profile Mistakes Killing Your Matches',
    titleNl: '10 Profielfouten Die Je Matches Verpesten',
    slug: 'profielfouten-die-matches-verpesten',
    categorySlug: 'profiel',
    articleType: 'GUIDE' as ArticleType,
    isPillarPage: false,
    isFeatured: false,
    hasEasyRead: false,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['dating fouten', 'geen matches', 'tinder tips', 'profiel verbeteren', 'meer matches'],
    metaTitle: '10 Profielfouten Die Matches Kosten | Fix Ze Nu',
    metaDescription: 'Waarom krijg je geen matches? Ontdek de 10 meest voorkomende profielfouten en hoe je ze fixt.',
    excerptNl: 'Geen matches? Het ligt waarschijnlijk aan deze 10 veelgemaakte fouten. Check je profiel en verbeter direct.',
    contentNl: `# 10 Profielfouten Die Je Matches Verpesten

Krijg je minder matches dan je zou willen? Je bent niet alleen. 80% van de dating app gebruikers maakt dezelfde fouten. In dit artikel leer je welke fouten jouw matches verpesten - en hoe je ze fixt.

## Fout 1: De Slechte Hoofdfoto

**Het probleem:** Je hoofdfoto is het eerste wat mensen zien. Binnen 0.3 seconden beslissen ze of ze verder kijken.

**Veelgemaakte fouten:**
- Groepsfoto (wie ben jij?)
- Zonnebril op
- Te ver weg
- Slechte belichting
- Geen glimlach

**De fix:** Eén solo foto, goed licht, echte glimlach, ogen zichtbaar.

---

## Fout 2: Geen Bio of "Vraag Maar"

**Het probleem:** 40% van de gebruikers swiped links bij een lege bio.

**Waarom het niet werkt:**
- Geeft geen gespreksstarters
- Lijkt alsof je geen moeite doet
- Geeft geen persoonlijkheid weer

**De fix:** Schrijf minimaal 2-3 zinnen over wie je bent en wat je zoekt.

---

## Fout 3: Alleen Selfies

**Het probleem:** Alleen selfies suggereert dat niemand anders foto's van je maakt.

**Beter:**
- Mix van selfies en andere foto's
- Vraag vrienden om foto's te maken
- Gebruik een statief en timer

---

## Fout 4: Te Veel Groepsfoto's

**Het probleem:** Mensen moeten zoeken naar wie jij bent.

**De regel:** Maximum 1 groepsfoto, en nooit als eerste.

---

## Fout 5: Oude of Misleidende Foto's

**Het probleem:** Als je er bij de date anders uitziet, start je met een leugen.

**De fix:**
- Gebruik recente foto's (max 1-2 jaar oud)
- Geen extreme filters
- Representatief voor hoe je er echt uitziet

---

## Fout 6: Negativiteit in Je Bio

**Voorbeelden van negativiteit:**
- "Geen tijdverspillers"
- "Swipe links als je niet kan communiceren"
- "Ziek van dating apps"
- "Geen ONS"

**Waarom het niet werkt:** Negatieve mensen zijn niet aantrekkelijk. Het zegt meer over jou dan over wat je wilt vermijden.

**De fix:** Focus op wat je WEL zoekt, niet wat je niet zoekt.

---

## Fout 7: Cliché Quotes en Bio's

**Dodelijke clichés:**
- "Partner in crime"
- "Leef, lach, liefde"
- "Hou van reizen, eten en lachen"
- "Zoek mijn andere helft"

**Waarom het niet werkt:** Iedereen schrijft dit. Je valt niet op.

**De fix:** Wees specifiek. Niet "hou van reizen" maar "net terug uit Japan, nog steeds ramen-obsessed."

---

## Fout 8: Te Veel of Te Weinig Foto's

**Te weinig (1-2):** Mensen vertrouwen het niet. Je hebt iets te verbergen?

**Te veel (10+):** Overweldigend en lijkt wanhopig.

**De sweet spot:** 5-6 gevarieerde foto's.

---

## Fout 9: Geen Gesprekshaak

**Het probleem:** Je profiel geeft niets om op te reageren.

**Slechte bio:** "Ik ben Pieter, 28, Amsterdam."

**Goede bio:** "Ik ben Pieter, 28. Overdag accountant, 's avonds amateurchef die nog moet leren dat niet alles knoflook nodig heeft. Vertel me je guilty pleasure takeaway."

---

## Fout 10: Het Verkeerde Platform

**Het probleem:** Niet elk platform past bij jou.

**Tinder:** Casual, volume-based
**Bumble:** Vrouwen maken de eerste zet
**Hinge:** Meer gericht op relaties
**Inner Circle:** Meer selectief

**De fix:** Kies het platform dat past bij wat jij zoekt.

---

## Quick Fix Checklist

Ga je profiel langs met deze checklist:

□ Hoofdfoto: solo, goed licht, glimlach
□ 5-6 gevarieerde foto's
□ Recente foto's (< 2 jaar)
□ Bio van 2-3 zinnen
□ Specifieke interesses genoemd
□ Geen negativiteit
□ Gespreksstarter aanwezig
□ Geen clichés
□ Mix van foto types

---

## Nog Steeds Geen Matches?

Als je alles hebt verbeterd en nog steeds weinig matches krijgt:

1. **Verbreed je criteria** - Ben je te selectief?
2. **Check je instellingen** - Staat je afstand goed?
3. **Wees actief** - Apps belonen actieve gebruikers
4. **Vraag feedback** - Laat vrienden je profiel reviewen
5. **Probeer een ander platform** - Misschien past een andere app beter
`,
    contentEasyRead: null
  },
  {
    title: 'What Your Photos Say About You',
    titleNl: 'Wat Je Foto\'s Over Je Zeggen: De Psychologie',
    slug: 'wat-fotos-over-je-zeggen',
    categorySlug: 'profiel',
    articleType: 'GUIDE' as ArticleType,
    isPillarPage: false,
    isFeatured: false,
    hasEasyRead: false,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['profielfoto betekenis', 'dating psychologie', 'foto analyse', 'eerste indruk'],
    metaTitle: 'Wat Je Dating Foto\'s Zeggen | Psychologie',
    metaDescription: 'Ontdek wat je foto\'s onbewust communiceren aan potentiële matches.',
    excerptNl: 'Elke foto vertelt een verhaal. Ontdek wat jouw foto\'s onbewust communiceren - en hoe je dat kunt optimaliseren.',
    contentNl: `# Wat Je Foto's Over Je Zeggen: De Psychologie

Mensen vormen binnen milliseconden een indruk op basis van je foto's. Wat communiceer jij onbewust? In dit artikel duiken we in de psychologie van profielfoto's.

## De Wetenschap van Eerste Indrukken

Onderzoek van Princeton toont aan dat we binnen **100 milliseconden** oordelen vormen over:
- Betrouwbaarheid
- Competentie
- Warmte
- Aantrekkelijkheid

En het ergste? Deze snelle oordelen zijn verrassend accuraat en blijven hangen.

## Wat Elke Foto Communiceert

### De Gym Selfie

**Wat je denkt dat het zegt:** "Ik ben fit en gedisciplineerd"

**Wat veel mensen zien:**
- Mogelijk narcistisch
- Oppervlakkig
- Meer bezig met uiterlijk dan persoonlijkheid

**Wanneer het WEL werkt:** Als fitness echt je passie is en je iemand zoekt die dat deelt.

---

### De Reisfoto (Eiffeltoren, Machu Picchu, etc.)

**Wat je denkt dat het zegt:** "Ik ben avontuurlijk en werelds"

**Wat veel mensen zien:**
- Je hebt geld/tijd om te reizen
- Je bent open voor nieuwe ervaringen
- Mogelijk: dit is de meest interessante foto die je hebt

**Tips:** Kies minder cliché locaties of toon een echte ervaring, niet alleen de landmark.

---

### De Foto Met Je Hond

**Wat het zegt:**
- Je bent verzorgend
- Je hebt verantwoordelijkheidsgevoel
- Je houdt van dieren

**Let op:**
- Moet WEL je eigen hond zijn
- De hond moet er verzorgd uitzien
- Jij moet ook duidelijk in beeld zijn

---

### De Groepsfoto

**Wat je denkt dat het zegt:** "Ik heb vrienden, ik ben sociaal"

**Het risico:**
- Mensen weten niet wie jij bent
- Je staat misschien niet flatterend naast anderen
- Het suggereert dat je geen goede solo foto's hebt

---

### De Professionele Foto

**Positief:**
- Serieus over dating
- Je investeert in jezelf
- Goede kwaliteit

**Potentieel negatief:**
- Kan te stijf overkomen
- Voelt minder authentiek
- Werkt alleen als het natuurlijk oogt

---

### De Auto/Motor Foto

**Wat je denkt dat het zegt:** "Ik ben succesvol, ik heb gave spullen"

**Wat veel mensen zien:**
- Materialistisch
- Probeert te imponeren
- Compensatie?

**Uitzondering:** Als het echt je hobby is (motor restaureren, racen)

---

### De Kinderfoto (Met Neefje/Nichtje)

**Wat je denkt dat het zegt:** "Ik ben goed met kinderen, klaar voor gezin"

**Het probleem:**
- Verwarrend: is dit jouw kind?
- Kan mensen afschrikken die geen kinderen willen
- Komt gecalculeerd over

**Beter:** Vermeld in je bio dat je van kinderen houdt, zonder de foto.

---

### De Foto Zonder Glimlach

**Wat het zegt:**
- Onbenaderbaar
- Misschien onvriendelijk
- Nerveus of onzeker

**De oplossing:** Minstens 2-3 foto's met echte glimlach.

---

### De Drankje-In-Hand Foto

**Één foto:** Sociaal, relaxed
**Elke foto:** Potentieel drankprobleem?

**Tip:** Max 1 foto met alcohol, en liever met vrienden dan alleen.

---

### De Spiegel Selfie

**Wat het zegt:**
- Geen vrienden om foto's te maken?
- Weinig moeite gedaan
- Focus op uiterlijk

**Wanneer het werkt:** Eigenlijk nooit echt. Vermijd.

## De Ideale Mix

### Voor Maximale Aantrekkingskracht

1. **Hoofdfoto:** Vriendelijke solo shot, glimlach, goed licht
2. **Lichaamsfoto:** Laat zien hoe je eruit ziet
3. **Activiteit:** Echte hobby, niet geposeerd
4. **Sociaal:** Met 1-2 vrienden
5. **Persoonlijkheid:** Iets unieks aan jou

## Het Experiment

Wil je weten wat jouw foto's echt communiceren?

1. Stuur ze naar 3-5 vrienden van het andere geslacht
2. Vraag: "Wat voor persoon denk je dat dit is?"
3. Vergelijk met wat je WILT communiceren
4. Pas aan waar nodig

---

## Conclusie

Elke foto vertelt een verhaal. Zorg dat jouw foto's het juiste verhaal vertellen - een authentieke representatie van wie je bent en wie je wilt aantrekken.

De beste profielen tonen meerdere kanten van dezelfde persoon: sociaal én introspectief, serieus én speels, avontuurlijk én huiselijk.
`,
    contentEasyRead: null
  },
  {
    title: 'Profile Prompts That Get Responses',
    titleNl: 'Prompts Die Echt Werken: Voorbeelden en Tips',
    slug: 'prompts-die-werken-voorbeelden',
    categorySlug: 'profiel',
    articleType: 'GUIDE' as ArticleType,
    isPillarPage: false,
    isFeatured: false,
    hasEasyRead: false,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['hinge prompts', 'bumble prompts', 'dating antwoorden', 'profiel prompts'],
    metaTitle: 'Beste Dating Prompts | Voorbeelden Die Werken',
    metaDescription: 'De beste antwoorden op Hinge en Bumble prompts. 50+ voorbeelden die gesprekken starten.',
    excerptNl: 'Prompts op Hinge en Bumble zijn goud waard als je ze goed gebruikt. Hier zijn 50+ voorbeelden die echt werken.',
    contentNl: `# Prompts Die Echt Werken: Voorbeelden en Tips

Prompts zijn je kans om persoonlijkheid te tonen én gesprekken te starten. Op platforms zoals Hinge en Bumble kunnen goede prompts het verschil maken. Hier zijn de beste strategieën en 50+ voorbeelden.

## Waarom Prompts Zo Belangrijk Zijn

- **Hinge:** Mensen kunnen direct reageren op je prompts
- **Bumble:** Prompts helpen vrouwen een eerste bericht te sturen
- **Gespreksstarters:** Een goede prompt = makkelijker eerste contact

## De Strategieën

### Strategie 1: Wees Specifiek

**Slecht:** "Ik hou van eten"
**Goed:** "De weg naar mijn hart is via huisgemaakte pasta carbonara"

### Strategie 2: Geef Een Haak

**Slecht:** "Ik reis graag"
**Goed:** "Vertel me je verborgen parelrestaurant en ik boek de volgende vlucht"

### Strategie 3: Toon Kwetsbaarheid

**Slecht:** "Ik ben grappig"
**Goed:** "Mijn guilty pleasure is dat ik nog steeds huil bij The Notebook"

### Strategie 4: Maak Het Makkelijk

Geef mensen iets om op te reageren:
- Een mening om te delen
- Een vraag om te beantwoorden
- Een verhaal om op door te vragen

## 50+ Prompt Antwoorden Die Werken

### "Two truths and a lie"

> "Ik heb een keer per ongeluk met de Spaanse koning gedineerd. Ik spreek vloeiend 4 talen. Ik heb nog nooit een plantje in leven gehouden."

> "Ik ben bang voor eenden. Ik heb 3 maanden in een klooster gewoond. Ik heb Ed Sheeran ontmoet in een lift."

### "A shower thought I recently had"

> "Waarom heet het 'vliegtuig' als het meeste van de tijd niet vliegt?"

> "Tanden zijn de enige skeletten die we poetsen."

### "I'm convinced that"

> "Pizza is nooit een verkeerde keuze. Ook als ontbijt."

> "Er is een speciaal plekje in de hemel voor mensen die hun winkelwagentje terugbrengen."

### "Dating me is like"

> "Dating me is like een Netflix serie - een slow burn met onverwachte plot twists."

> "Dating me is like IKEA meubels - verwarrend in het begin maar de moeite waard als het eenmaal staat."

### "My simple pleasures"

> "Vers gewassen lakens, koffie op zondagochtend, en de geur van regen op warm asfalt."

> "Het moment dat de zon doorbreekt na een regenbui, een perfect krakerig croissant."

### "I'll pick the first date"

> "... want ik ken een plek waar ze pasta serveren die je doet vergeten dat je ooit ergens anders pasta hebt gegeten."

> "... en het wordt nergens waar we moeten schreeuwen om elkaar te verstaan."

### "The way to win me over is"

> "Door mij ongepland naar een nieuwe plek mee te nemen. Of gewoon door goed te zijn voor servicepersoneel."

> "Door net zo enthousiast te zijn over kleine dingen als ik. En kaas."

### "This year I want to"

> "Eindelijk die berg beklimmen die ik al 3 jaar uittel. En leren fermenteren."

> "Meer 'ja' zeggen tegen spontane plannen en minder tegen FOMO scrollen."

### "My most irrational fear"

> "Dat de persoon achter me in de rij denkt dat ik te lang doe bij de zelfscankassa."

> "Vogels. Don't @ me, het is niet rationeel, maar ze zijn gewoon mini dinosaurussen."

### "I'm looking for"

> "Iemand die samen de beste dim sum van de stad wilt vinden."

> "Mijn favoriete melding. En iemand om mee te groeien."

### "The key to my heart is"

> "Obscure memes sturen om 2 uur 's nachts en daadwerkelijk luisteren als ik over mijn dag vertel."

> "Spontane roadtrips voorstellen en dan ook echt gaan."

### "I recently discovered"

> "Dat ik eigenlijk heel goed ben in klussen. Of in ieder geval in YouTube tutorials kijken over klussen."

> "De Aziatische supermarkt om de hoek en nu is mijn koelkast 80% sauzen."

### "Unusual skills"

> "Ik kan elk liedje raden binnen 3 noten. En elke kaas proeven en vertellen waar die vandaan komt."

> "Ik kan extreem snel een koffer inpakken. 15 minuten voor een week, mijn superpower."

### "Together we could"

> "De ranking maken van elke pizzatent in een straal van 5km."

> "Debatteren over of een hotdog een sandwich is tot de zon opkomt."

### "I guarantee you that"

> "Ik ken meer random weetjes dan wie je ook kent. En ik deel ze op de meest ongelegen momenten."

> "Je zult nooit een betere Spotify playlist krijgen dan van mij."

### "My biggest date fail"

> "Koffie gemorst over mijn witte shirt in de eerste 5 minuten. We hebben er 4 dates over gedaan om erover heen te komen."

> "Ik zwaaide naar iemand die naar iemand anders zwaaide. Hij deed alsof het niet gebeurde. Held."

## Tips voor Hinge Specifiek

### Kies Prompts Die Conversatie Starten

✅ "I'm looking for" - Duidelijk wat je zoekt
✅ "A shower thought" - Toont creativiteit
✅ "Together we could" - Nodigt uit voor plan

### Vermijd

❌ "I'll pick the first date if..." (laat dit een verassing)
❌ Te serious prompts (luchtig werkt beter)

## Tips voor Bumble

### Maak Het Makkelijk Voor Vrouwen

Vrouwen moeten het eerste bericht sturen. Maak het ze makkelijk:

- Stel een vraag
- Geef iets om op te reageren
- Toon persoonlijkheid

**Voorbeeld:**
> "Ik debatteer al dagen: is appelmoes bij patat acceptabel? Ik heb een tiebreaker nodig."

---

## De Don'ts

### Vermijd Deze Antwoorden

❌ "Ik weet niet wat ik hier moet schrijven"
❌ "Vraag maar" / "Zoek zelf maar uit"
❌ Inspirational quotes
❌ Te seksueel/suggestief
❌ Negatief of cynisch
❌ Te vaag

---

## Experiment: Test Je Prompts

1. Wissel je prompts elke 2 weken
2. Houd bij welke de meeste reacties krijgen
3. Optimaliseer op basis van data

Het beste profiel is altijd work-in-progress.
`,
    contentEasyRead: null
  }
]

// ============================================
// SUCCESVERHALEN
// ============================================
const successStories = [
  {
    title: 'Emma and Thomas: When Algorithms Get It Right',
    titleNl: 'Emma en Thomas: Toen het Algoritme Klopte',
    slug: 'succesverhaal-emma-thomas',
    categorySlug: 'succesverhalen',
    articleType: 'SUCCESS_STORY' as ArticleType,
    isPillarPage: false,
    isFeatured: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL'] as TargetAudience[],
    keywords: ['succesverhaal', 'dating app relatie', 'liefde gevonden', 'online dating succes'],
    metaTitle: 'Emma & Thomas: Hun Verhaal | Succesverhaal',
    metaDescription: 'Hoe Emma en Thomas elkaar vonden via Liefde Voor Iedereen. Hun verhaal van eerste bericht tot samenwonen.',
    excerptNl: 'Emma (28) en Thomas (31) matchten op een regenachtige donderdagavond. Nu, twee jaar later, delen ze hun verhaal.',
    contentNl: `# Emma en Thomas: Toen het Algoritme Klopte

*"Ik had bijna opgegeven met dating apps. Tot ik Thomas tegenkwam."* - Emma, 28

## Hoe Het Begon

Emma scrollde door haar matches terwijl ze alleen op de bank zat met haar kat en een glas wijn. Het was een grauwe donderdagavond in november.

**Emma:** "Ik had al maanden gedatet. Tientallen matches, handjevol dates, geen klik. Ik was het eerlijk gezegd een beetje zat. Die avond was ik eigenlijk van plan om de app te verwijderen."

Toen zag ze Thomas' profiel.

**Thomas:** "Mijn profiel was vrij basic. Foto bij een berg, foto met mijn hond, een slechte selfie die mijn vrienden erin hadden gezet als grap."

Het was niet zijn foto die Emma's aandacht trok, maar zijn bio:

> "Zoek iemand om samen te discussiëren of een hotdog een sandwich is. Ik zeg nee. Verander mijn mind."

**Emma:** "Ik moest hardop lachen. Eindelijk iemand met een beetje humor. Ik stuurde hem een bericht: 'Een hotdog is een taco, change MY mind.'"

## De Eerste Berichten

De eerste avond chatten ze drie uur door. Over hotdogs, over hun katten (beide hadden er een), over hun banen en dromen.

**Thomas:** "Ik merkte meteen dat dit anders was. Ze gaf niet de standaard antwoorden. Ze was grappig en direct. Om middernacht vroeg ik of we konden bellen."

**Emma:** "Dat was eng. Ik bel nooit. Maar ik zei ja."

Ze belden nog twee uur. Toen de zon bijna opkwam, maakten ze een afspraak voor die zaterdag.

## De Eerste Date

Ze spraken af in een klein café in Amsterdam-Oost. Emma was te vroeg. Thomas ook.

**Emma:** "Ik zag hem binnenkomen en mijn eerste gedachte was: 'Hij ziet er echt uit zoals op zijn foto's.' Dat klinkt gek, maar na zoveel teleurstellingen..."

**Thomas:** "Ze zwaaide en ik dacht: dit gaat goed komen. Dat wist ik gewoon."

De date duurde zeven uur. Ze begonnen met koffie, gingen over op lunch, liepen door het park, en eindigden met diner.

**Thomas:** "Ik kan me niet herinneren waar we het allemaal over hadden. Alleen dat het makkelijk voelde. Alsof we al jaren vrienden waren."

## De Uitdagingen

Het was niet allemaal perfect. Emma had net een moeilijke periode achter de rug na een lange relatie. Thomas werkte veel en had moeite met werk-privé balans.

**Emma:** "Ik was bang. Ik had mezelf voorgenomen om het rustig aan te doen, niet weer hals-over-kop te vallen. Maar met Thomas voelde het anders. Veiliger."

Na drie maanden hadden ze hun eerste echte ruzie.

**Thomas:** "Ik had een werktrip verzwegen omdat ik haar niet wilde teleurstellen. Stom. Ze was boos, terecht."

**Emma:** "Het was niet de trip, het was dat hij het niet had verteld. We hadden een lang gesprek over communicatie. Sindsdien zijn we daar heel bewust mee."

## Nu, Twee Jaar Later

Emma en Thomas wonen samen in een appartement in Utrecht. Met twee katten – die van haar en die van hem, inmiddels dikke vrienden.

**Emma:** "We hebben het nog steeds over hotdogs. Het is nu onze code voor 'we moeten praten over iets raars.'"

**Thomas:** "Vorig jaar hebben we een lijst gemaakt van alle hotdog-discussies die we hadden. Er staan er nu 47 op."

## Hun Advies

**Emma:** "Geef niet op na een paar slechte dates. Maar geef ook toe wanneer iemand anders voelt. Je voelt het meteen."

**Thomas:** "Wees jezelf in je profiel. Mijn stomme bio over hotdogs was het beste wat ik had kunnen schrijven. Het trok precies de juiste persoon aan."

**Samen:** "En als je denkt dat je iemand leuk vindt: bel. Niet eindeloos appen. Je leert iemand pas echt kennen als je hun stem hoort."

---

*Emma en Thomas trouwden in september 2025. De taart was in de vorm van een hotdog.*
`,
    contentEasyRead: `# Emma en Thomas

## Hoe ze elkaar leerden kennen

Emma en Thomas ontmoetten elkaar via een dating app.

Thomas had een grappige bio:
"Is een hotdog een sandwich? Ik zeg nee."

Emma stuurde hem een bericht.
Ze chatten de hele avond.

## De eerste date

Ze spraken af in een café.
De date duurde 7 uur!
Ze konden goed met elkaar praten.

## Nu

Emma en Thomas wonen nu samen.
Ze hebben twee katten.
Ze zijn heel gelukkig.

## Hun tip

"Wees jezelf. De juiste persoon vindt je leuk zoals je bent."
`
  },
  {
    title: 'Mark and Lisa: Love at 50+',
    titleNl: 'Mark en Lisa: Liefde na je 50e',
    slug: 'succesverhaal-mark-lisa-50plus',
    categorySlug: 'succesverhalen',
    articleType: 'SUCCESS_STORY' as ArticleType,
    isPillarPage: false,
    isFeatured: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL', 'SENIOR'] as TargetAudience[],
    keywords: ['50+ dating', 'senioren dating', 'liefde later in leven', 'tweede kans liefde'],
    metaTitle: 'Mark & Lisa: Liefde na 50 | Succesverhaal',
    metaDescription: 'Mark (54) en Lisa (52) bewijzen dat het nooit te laat is voor de liefde. Hun inspirerende verhaal.',
    excerptNl: 'Na twee scheidingen en jaren alleen dachten ze dat de liefde aan hen voorbij was gegaan. Tot ze elkaar vonden.',
    contentNl: `# Mark en Lisa: Liefde na je 50e

*"Ik dacht dat mijn kans voorbij was. Dat liefde iets was voor jongere mensen."* - Lisa, 52

## Opnieuw Beginnen

Mark was 54 toen hij na 23 jaar huwelijk scheidde. Lisa was 51, ook gescheiden, met twee volwassen kinderen.

**Mark:** "Mijn kinderen gaven me de app als grap voor mijn verjaardag. 'Tijd om weer te daten, pa.' Ik lachte het weg, maar installeerde het toch."

**Lisa:** "Mijn vriendinnen hadden me overgehaald. Ik voelde me belachelijk. Dating apps, op mijn leeftijd?"

## De Eerste Matches

Beide hadden een ongemakkelijke start.

**Mark:** "Mijn eerste matches waren veel jonger. Dat voelde niet goed. Ik zocht iemand met levenservaring, niet iemand die mijn dochter kon zijn."

**Lisa:** "Ik kreeg veel berichten van mannen die duidelijk alleen op mijn foto reageerden. Oppervlakkig."

Na weken zonder succes, matchten ze.

**Lisa:** "Zijn profiel was eerlijk. Hij schreef over zijn scheiding, over zijn kinderen, over wat hij zocht. Geen spelletjes."

## Het Eerste Contact

**Mark:** "Ik stuurde haar een lang bericht. Geen 'hey'. Ik schreef waarom haar profiel me aansprak en stelde drie specifieke vragen."

**Lisa:** "Eindelijk iemand die moeite deed. We schreven ellenlange berichten, alsof we brieven uitwisselden. Dat deden mensen vroeger toch?"

Ze mailden twee weken voordat ze afspraken.

## De Eerste Date

Ze ontmoetten elkaar in een restaurant in Den Haag. Beiden waren nerveus.

**Mark:** "Ik had in geen 25 jaar een eerste date gehad. Ik wist niet eens meer hoe het ging."

**Lisa:** "Hij stond op toen ik binnenkwam. Old school. Dat raakte me."

De date duurde vier uur. Ze praatten over hun kinderen, hun scheidingen, hun angsten en dromen.

**Lisa:** "Het was zo bevrijdend om te praten met iemand die het begreep. De complexiteit van een volwassen leven."

## De Uitdagingen

Dating na je 50e brengt unieke uitdagingen.

**Mark:** "Onze kinderen moesten wennen aan het idee. Vooral de mijne. Ze waren nog niet over de scheiding heen."

**Lisa:** "En dan de praktische kant. We hadden beide een huis, een leven, een netwerk. Hoe combineer je dat?"

Ze namen de tijd. Anderhalf jaar lang hielden ze hun eigen huizen aan.

**Mark:** "Geen haast. We hadden al genoeg overhaaste beslissingen genomen in ons leven."

## Nu, Drie Jaar Later

Mark en Lisa wonen nu samen in een nieuw huis - neutraal terrein voor beiden.

**Lisa:** "We hebben een bonus-familie gebouwd. Mijn kinderen, zijn kinderen. Het is soms chaotisch met Kerst, maar het is ons."

**Mark:** "Ik heb geleerd dat liefde op elk moment kan komen. Je moet alleen open staan."

## Hun Advies voor 50+-Daters

**Mark:** "Neem de tijd. Je hoeft niet te bewijzen dat je nog 'in de markt' bent. Wees selectief."

**Lisa:** "Wees eerlijk over je verleden, maar laat het je niet definiëren. Je bent meer dan je scheiding."

**Samen:** "En het allerbelangrijkste: het is nooit te laat. Als twee gescheiden vijftigers de liefde kunnen vinden, kan iedereen dat."

---

*Mark en Lisa vierden vorig jaar hun eerste kerst als getrouwd koppel, omringd door zes kinderen en twee kleinkinderen.*
`,
    contentEasyRead: `# Mark en Lisa

## Hun verhaal

Mark en Lisa waren beide gescheiden.
Ze waren allebei ouder dan 50.
Ze dachten dat het te laat was voor de liefde.

## Hoe ze elkaar vonden

Ze ontmoetten elkaar via een dating app.
Ze schreven lange berichten naar elkaar.
Na twee weken spraken ze af.

## Nu

Mark en Lisa wonen nu samen.
Ze zijn getrouwd.
Hun kinderen komen vaak op bezoek.

## Hun tip

"Het is nooit te laat voor de liefde."
`
  },
  {
    title: 'Jamie and Robin: Love Beyond Labels',
    titleNl: 'Jamie en Robin: Liefde Zonder Labels',
    slug: 'succesverhaal-jamie-robin-lgbtq',
    categorySlug: 'succesverhalen',
    articleType: 'SUCCESS_STORY' as ArticleType,
    isPillarPage: false,
    isFeatured: true,
    hasEasyRead: false,
    targetAudience: ['GENERAL', 'LGBTQ'] as TargetAudience[],
    keywords: ['lgbtq dating', 'queer liefde', 'non-binair', 'inclusief daten'],
    metaTitle: 'Jamie & Robin: Liefde Zonder Labels | Succesverhaal',
    metaDescription: 'Het verhaal van Jamie en Robin: hoe ze navigeerden door labels en vonden wat echt telt.',
    excerptNl: 'Voor Jamie en Robin was de weg naar elkaar niet altijd makkelijk. Maar ze vonden een liefde die verder gaat dan labels.',
    contentNl: `# Jamie en Robin: Liefde Zonder Labels

*"We moesten eerst onszelf leren kennen voordat we elkaar konden vinden."* - Jamie, 26

## De Zoektocht

Jamie identificeert zich als non-binair. Robin als panseksueel. Beiden hadden moeite met de standaard dating apps.

**Jamie:** "Elke app vroeg om 'man' of 'vrouw'. Dat voelde al als een muur. Alsof ik niet bestond."

**Robin:** "Ik kreeg altijd de vraag: 'Maar wat vind je nou echt?' Alsof mijn seksualiteit een fase was."

Liefde Voor Iedereen bood meer opties. Niet-binaire genderidentiteiten. Ruimte voor nuance.

**Jamie:** "Eindelijk een plek waar ik mezelf kon zijn."

## De Match

Ze matchten op een moment dat beiden bijna waren gestopt.

**Robin:** "Ik had het gehad met mensen die mijn identiteit niet respecteerden. Jamie's profiel was een verademing - open, eerlijk, geen excuses."

**Jamie:** "Robin had in hun bio staan: 'Mensen over labels.' Dat was alles wat ik nodig had."

## Het Eerste Gesprek

Ze begonnen te praten over hun favoriete boeken. Dat ging over in gender identiteit, familie acceptatie, en dromen voor de toekomst.

**Jamie:** "Het was de eerste keer dat ik met een date kon praten over mijn ervaring zonder eerst een essay uit te moeten leggen."

**Robin:** "We begrepen elkaar. Niet alleen romantisch, maar fundamenteel."

Na twee weken chatten en bellen, spraken ze af in een queer-friendly café in Amsterdam.

## De Eerste Date

**Robin:** "Ik was zenuwachtig, maar op een goede manier. Alsof ik wist dat dit belangrijk zou zijn."

**Jamie:** "Ze - sorry, hen - gebruikte meteen mijn juiste voornaamwoorden. Zonder aarzeling. Dat klinkt klein, maar het betekende alles."

De date duurde vijf uur. Ze sloten het café.

## De Uitdagingen

Niet iedereen in hun leven begreep hun relatie.

**Jamie:** "Mijn ouders moesten wennen. Ze hadden al moeite met mijn identiteit. Nu ook nog een relatie die 'anders' was."

**Robin:** "Sommige vrienden begrepen het niet. 'Maar wie is dan de man?' Ugh."

Ze leerden samen te navigeren door deze situaties.

**Jamie:** "Robin leerde me om minder te verklaren en meer te zijn."

**Robin:** "Jamie leerde me dat geduld hebben met anderen niet hetzelfde is als jezelf klein maken."

## Nu

Jamie en Robin wonen samen in Rotterdam. Ze organiseren maandelijks een dinner party voor hun queer community.

**Robin:** "We hebben onze eigen familie gebouwd. Niet gebaseerd op bloedband, maar op acceptatie."

**Jamie:** "Liefde is liefde. Dat klinkt cliché, maar het is zo. Labels zijn voor buitenstaanders. Wij weten wat we hebben."

## Hun Advies

**Jamie:** "Zoek plekken die ruimte geven aan wie je bent. Niet waar je jezelf moet uitleggen om te mogen bestaan."

**Robin:** "En als je iemand vindt die je begrijpt zonder uitleg - hou ze vast."

**Samen:** "Er is iemand voor iedereen. Echt iedereen."

---

*Jamie en Robin zijn nu 2 jaar samen. Ze adopteren volgend jaar een kat genaamd "Label."*
`,
    contentEasyRead: null
  },
  {
    title: 'Sarah and David: Love with Autism',
    titleNl: 'Sarah en David: Liefde met Autisme',
    slug: 'succesverhaal-sarah-david-autisme',
    categorySlug: 'succesverhalen',
    articleType: 'SUCCESS_STORY' as ArticleType,
    isPillarPage: false,
    isFeatured: true,
    hasEasyRead: true,
    targetAudience: ['GENERAL', 'AUTISM'] as TargetAudience[],
    keywords: ['autisme dating', 'neurodivergent relatie', 'daten met autisme'],
    metaTitle: 'Sarah & David: Liefde met Autisme | Succesverhaal',
    metaDescription: 'Sarah en David delen hoe ze als twee mensen met autisme de liefde vonden en een relatie bouwden.',
    excerptNl: 'Beide met autisme, allebei dachten ze dat dating niet voor hen was. Tot ze elkaar vonden.',
    contentNl: `# Sarah en David: Liefde met Autisme

*"Ik dacht altijd dat ik 'te raar' was om lief te hebben. David bewees het tegendeel."* - Sarah, 29

## De Strijd met Dating

Sarah kreeg haar autisme diagnose op haar 23e. David op zijn 19e. Beiden hadden jaren geworsteld met dating.

**Sarah:** "Elke date voelde als een toneelstuk. Ik moest 'normaal' doen, hints begrijpen, het juiste zeggen. Uitputtend."

**David:** "Ik begreep de regels niet. Wanneer bel je terug? Wanneer is het 'te veel'? Het voelde als een spel waar iedereen de regels kende behalve ik."

## Eerlijkheid Als Strategie

Beide besloten om hun autisme direct in hun profiel te zetten.

**David:** "Ik was het masking zat. Als iemand me niet accepteerde met autisme, dan maar geen match."

**Sarah:** "Mijn bio zei: 'Autist. Ik ben direct, hou van routines, en heb moeite met hints. Als dat een dealbreaker is, swipe links. Als je dat interessant vindt, laten we praten.'"

## De Match

Ze matchten op een donderdag om precies 14:47. David weet dat nog.

**David:** "Haar eerlijkheid over autisme trok me aan. Eindelijk iemand die het begreep."

**Sarah:** "Hij had in zijn profiel staan dat hij van treinen hield. Niet 'een beetje' - een hele paragraaf over treinen. Ik dacht: deze persoon schaamt zich niet voor zijn interesses."

## Het Eerste Contact

Hun eerste gesprek was atypisch.

**Sarah:** "Hij vroeg niet 'hoe gaat het?' Hij vroeg: 'Wat is je special interest?' Ik wist meteen dat dit anders was."

**David:** "We praatten drie dagen non-stop over onze interesses. Zij over historische kostuums, ik over treinstellen."

Na een week stelde David een date voor. Met een complete planning.

**David:** "Ik stuurde haar een schedule. Tijden, locaties, een backup plan als het te druk was, en een exit-strategie als een van ons overweldigd raakte."

**Sarah:** "Elke andere date zou dat 'te veel' vinden. Ik vond het perfect."

## De Eerste Date

Ze ontmoetten in een rustig museum, doordeweeks, vroeg in de ochtend.

**Sarah:** "Weinig mensen, weinig prikkels. We konden praten zonder te schreeuwen."

**David:** "We hoefden geen oogcontact te forceren. We liepen naast elkaar en keken naar de kunst. Praten was makkelijker zo."

De date duurde precies de geplande 2 uur. Geen minuut langer.

**Sarah:** "En dat was perfect. Geen uitrekken omdat het 'hoort'. We hadden afgesproken 2 uur, en dat was het."

## Hoe Ze Communiceren

Hun relatie werkt omdat ze expliciet communiceren.

**David:** "We hebben een Google Doc met 'relatieregels'. Wanneer we ruimte nodig hebben, hoe we conflicten bespreken, wat we nodig hebben bij een meltdown."

**Sarah:** "Geen hints, geen 'je zou moeten weten wat ik bedoel'. Alles wordt uitgesproken."

**David:** "Als ik boos ben, zeg ik: 'Ik ben boos om X. Ik heb Y nodig.' Geen raadspelletjes."

## De Uitdagingen

Het is niet altijd makkelijk.

**Sarah:** "Soms overlappen onze triggers. Als we allebei overweldigd zijn, hebben we geen 'sociaal persoon' om het op te vangen."

**David:** "We hebben geleerd om 'parallel te reguleren'. Samen in de kamer, maar ieder bezig met eigen kalmering."

Ze kregen ook reacties van buitenaf.

**Sarah:** "Mensen vinden het 'cute' dat twee autisten samen zijn. Alsof we een curiositeit zijn."

**David:** "Of ze vragen wie de 'normale' is. Niemand. Wij zijn wie we zijn."

## Nu, Anderhalf Jaar Later

Sarah en David wonen samen. Hun appartement is ingericht op beide behoeften.

**Sarah:** "Aparte werkplekken. Stilte-uren. Een gedeelde kalender voor alles."

**David:** "Het werkt omdat we dezelfde taal spreken. De taal van expliciet zijn."

## Hun Advies voor Autisten Die Daten

**Sarah:** "Wees jezelf vanaf het begin. Masking houdt je niet vol in een relatie."

**David:** "Zoek iemand die je begrijpt, niet iemand die je tolereert."

**Samen:** "Je hoeft niet 'normaal' te zijn om liefde te verdienen. Er is iemand die jou perfect vindt, precies zoals je bent."

---

*Sarah en David plannen nu hun bruiloft. De trouwlocatie? Een historisch treinstation.*
`,
    contentEasyRead: `# Sarah en David

## Hun verhaal

Sarah en David hebben allebei autisme.
Ze dachten dat dating niet voor hen was.
Maar ze vonden elkaar.

## Hoe ze matchten

Ze waren allebei eerlijk in hun profiel.
Ze schreven over hun autisme.
Dat maakte het makkelijker.

## Hun eerste date

Ze spraken af in een rustig museum.
Niet te veel mensen.
Ze hadden een planning gemaakt.
Dat hielp.

## Wat werkt voor hen

Ze zeggen precies wat ze denken.
Geen hints of raadsels.
Ze helpen elkaar als het moeilijk is.

## Nu

Sarah en David wonen samen.
Ze zijn heel gelukkig.

## Hun tip

"Wees jezelf. Er is iemand die jou perfect vindt."
`
  }
]

// ============================================
// EXTRA BEGRIPPEN
// ============================================
const extraBegrippen = [
  {
    titleNl: 'Ghosting',
    slug: 'ghosting-betekenis',
    excerptNl: 'Wanneer iemand plotseling stopt met reageren zonder uitleg.',
    contentNl: `# Ghosting

## Wat is ghosting?

Ghosting is wanneer iemand waarmee je contact hebt plotseling **stopt met reageren**, zonder uitleg of waarschuwing. De persoon verdwijnt als een "ghost" (geest).

## Voorbeelden

- Je hebt een paar goede dates gehad, en dan ineens niets meer
- Midden in een gesprek stopt iemand met antwoorden
- Na weken praten wordt je geblokkeerd zonder reden

## Waarom doen mensen dit?

Veel redenen:
- **Conflict vermijden** - ze willen niet "het gesprek" voeren
- **Overweldiging** - te veel dates tegelijk
- **Desinteresse** - makkelijker om te verdwijnen dan uit te leggen
- **Emotionele onbeschikbaarheid**

## Hoe ga je ermee om?

1. **Neem het niet persoonlijk** - het zegt meer over hen dan over jou
2. **Stuur maximaal 1 follow-up bericht** - "Hey, alles goed?"
3. **Ga door** - als ze niet reageren, heb je je antwoord
4. **Blokkeer indien nodig** - voor je eigen gemoedsrust

## Is ghosting oké?

Kort antwoord: **nee**, maar het is wel begrijpelijk in sommige situaties.

Het is minder erg na 1-2 berichten. Het is pijnlijker na meerdere dates.

De vriendelijke versie is een kort "Ik voel geen klik" bericht.
`,
  },
  {
    titleNl: 'Breadcrumbing',
    slug: 'breadcrumbing-betekenis',
    excerptNl: 'Wanneer iemand net genoeg aandacht geeft om je geïnteresseerd te houden, zonder echte intentie.',
    contentNl: `# Breadcrumbing

## Wat is breadcrumbing?

Breadcrumbing is wanneer iemand je **"kruimeltjes"** van aandacht geeft - net genoeg om je geïnteresseerd te houden, maar zonder echte intentie om iets serieus te beginnen.

## Hoe herken je het?

- Inconsistent contact (dagen niets, dan ineens heel lief)
- Vage plannen die nooit concreet worden
- "Ik mis je" berichten, maar nooit opvolging
- Reageert alleen als jij initiatief neemt
- Complimenten zonder actie

## Typische berichten van een breadcrumber

- "We moeten echt een keer afspreken!" (maar stelt nooit een datum voor)
- "Hey jij 😊" (na weken stilte)
- "Ik denk aan je" (maar geen vervolgvraag)

## Waarom doen mensen dit?

- **Ego boost** - jouw aandacht voelt goed
- **Backup optie** - ze houden je warm voor het geval dat
- **Conflictvermijding** - ze willen niet echt afwijzen
- **Dating FOMO** - bang om opties te verliezen

## Wat te doen?

1. **Herken het patroon** - inconsistent = niet geïnteresseerd
2. **Stop met initiatief nemen** - zie wat er gebeurt
3. **Wees direct** - "Ik merk dat onze plannen nooit doorgaan. Wil je dit nog?"
4. **Kies voor jezelf** - je verdient iemand die enthousiast is
`,
  },
  {
    titleNl: 'Love Bombing',
    slug: 'love-bombing-betekenis',
    excerptNl: 'Extreme, overweldigende aandacht in het begin van een relatie.',
    contentNl: `# Love Bombing

## Wat is love bombing?

Love bombing is wanneer iemand je **overspoelt met aandacht, liefde en complimenten** in het begin van een relatie. Het voelt geweldig, maar kan een rode vlag zijn.

## Kenmerken van love bombing

- Zegt "ik hou van je" na een paar dagen
- Constant contact (berichten, bellen, bezoeken)
- Extreme complimenten ("je bent perfect", "ik heb nog nooit zo iemand ontmoet")
- Cadeau's en grote gebaren heel vroeg
- Plannen maken voor de verre toekomst (samen wonen, trouwen) na weken
- Jaloers worden als je met anderen bent

## Waarom is het problematisch?

Love bombing kan zijn:
- Een teken van **narcisme** - controle door afhankelijkheid te creëren
- **Onveilige hechting** - de persoon is angstig gehecht
- **Romance scam** - oplichters gebruiken het om vertrouwen te winnen

## Verschil met echte verliefdheid

| Love Bombing | Echte Verliefdheid |
|--------------|-------------------|
| Overweldigend tempo | Geleidelijke opbouw |
| Voelt bijna dwingend | Respecteert je ruimte |
| Te mooi om waar te zijn | Realistisch en gebalanceerd |
| Wordt boos bij grenzen | Respecteert grenzen |

## Wat te doen?

1. **Vertraag** - "Ik waardeer je, maar ik wil het rustig opbouwen"
2. **Kijk naar hun reactie** - accepteren ze grenzen?
3. **Praat met vrienden** - buitenstaanders zien het vaak eerder
4. **Vertrouw je gevoel** - als het "te" voelt, is het dat waarschijnlijk
`,
  },
  {
    titleNl: 'Benching',
    slug: 'benching-betekenis',
    excerptNl: 'Wanneer iemand je "op de bank" houdt als backup optie.',
    contentNl: `# Benching

## Wat is benching?

Benching komt van het Engelse "bench" (bank). Net als een sportcoach spelers op de bank houdt, houdt een bencher jou als **reserve optie**.

## Hoe werkt het?

De persoon:
- Reageert genoeg om je geïnteresseerd te houden
- Stelt dates uit of annuleert vaak
- Is ineens weer heel aanwezig als een andere optie wegvalt
- Geeft je hoop, maar nooit zekerheid

## Verschil met breadcrumbing

| Benching | Breadcrumbing |
|----------|---------------|
| Er is meestal een "hoofdpersoon" | Er is niet per se iemand anders |
| Je wordt bewust als backup gehouden | Meer gedachteloos gedrag |
| Ze weten wat ze doen | Soms onbewust |

## Hoe herken je het?

- Ze zijn heel warm na afwijzing door iemand anders
- Plannen gaan nooit door op momenten dat het hen uitkomt
- Je hoort vaag over "druk zijn" zonder details
- Hun interesse fluctueert met hun andere opties

## Wat te doen?

1. **Wees direct:** "Ik heb het gevoel dat ik niet je prioriteit ben. Klopt dat?"
2. **Stel een deadline:** maak concrete plannen, zie of ze doorgaan
3. **Respecteer jezelf:** je bent niemands plan B
`,
  },
  {
    titleNl: 'Catfishing',
    slug: 'catfishing-betekenis',
    excerptNl: 'Wanneer iemand een neppe online identiteit gebruikt om anderen te misleiden.',
    contentNl: `# Catfishing

## Wat is catfishing?

Catfishing is wanneer iemand een **valse identiteit** aanneemt online, meestal met gestolen foto's en verzonnen verhalen.

## Waarschuwingssignalen

- **Foto's te mooi** - lijken professioneel of als van een model
- **Nooit videobellen** - altijd een excuus
- **Verhaal klopt niet** - inconsistenties in wat ze vertellen
- **Snel intiem** - verklaren snel liefde
- **Vermijden ontmoeting** - kunnen nooit afspreken

## Hoe check je het?

1. **Reverse image search** - zoek hun foto's op Google Images
2. **Sociale media** - weinig vrienden/volgers en oude accounts zijn verdacht
3. **Videobellen** - weiger verder contact zonder video
4. **Details checken** - vraag specifieke vragen over hun verhaal

## Waarom doen mensen dit?

- **Scam** - geld of gegevens stelen
- **Onzekerheid** - niet gelukkig met eigen uiterlijk
- **Spanning** - kick van het bedriegen
- **Wraak** - iemand kwetsen

## Wat te doen bij vermoeden?

1. Stop met persoonlijke informatie delen
2. Vraag om video bewijs
3. Blokkeer bij twijfel
4. Rapporteer het profiel

Zie ook: [Romance Scams Herkennen](/kennisbank/veiligheid/romance-scams-herkennen-complete-gids)
`,
  },
  {
    titleNl: 'Situationship',
    slug: 'situationship-betekenis',
    excerptNl: 'Een romantische connectie die nooit een officiële relatie wordt.',
    contentNl: `# Situationship

## Wat is een situationship?

Een situationship is een romantische verbinding die **meer is dan vriendschap, maar niet officieel een relatie**. Het zit "ergens tussenin".

## Kenmerken

- Geen duidelijke labels ("wat zijn wij?")
- Gedragen als koppel, maar noemen het niet zo
- Geen toekomstplannen samen
- Geen introductie aan familie/vrienden als partner
- Onduidelijkheid over exclusiviteit

## Hoe ontstaat het?

- Beide partijen vermijden "het gesprek"
- Angst voor commitment
- "Chill" willen houden
- Onzeker over gevoelens
- Verschillende verwachtingen niet uitgesproken

## Is het erg?

Niet per se. Een situationship kan prima zijn als:
- **Beide partijen het willen** - open communicatie
- **Niemand meer verwacht** - eerlijk over intenties
- **Het tijdelijk is** - niet jarenlang

Het wordt problematisch als:
- **Eén persoon meer wil** - ongelijke verwachtingen
- **Het te lang duurt** - jaren in onduidelijkheid
- **Het pijn doet** - onzekerheid vreet aan je

## Wat te doen?

1. **Definieer wat JIJ wilt** - relatie of casual?
2. **Vraag het** - "Wat is dit voor jou?"
3. **Luister naar woorden EN acties**
4. **Kies voor jezelf** - als je een relatie wilt, blijf daar niet te lang hangen
`,
  },
  {
    titleNl: 'DTR (Define The Relationship)',
    slug: 'dtr-define-the-relationship',
    excerptNl: 'Het gesprek over wat jullie relatie precies is.',
    contentNl: `# DTR - Define The Relationship

## Wat is DTR?

DTR staat voor "Define The Relationship" - **het gesprek** waarin je bespreekt wat jullie voor elkaar zijn en waar het naartoe gaat.

## Wanneer heb je dit gesprek?

Goede timing:
- Na 1-3 maanden regelmatig daten
- Als je exclusiviteit wilt
- Voordat je verder gaat (samen op vakantie, ontmoeten van familie)
- Als de onduidelijkheid je stress geeft

Te vroeg:
- Na 1-2 dates
- Als je de ander nog niet goed kent
- Om hen te "vangen"

## Hoe begin je het gesprek?

Niet: "Wat zijn wij?" (te vaag)

Wel:
- "Ik vind het leuk hoe dit gaat. Ik zou graag weten hoe jij ernaar kijkt."
- "Ik merk dat ik gevoelens krijg. Ik vroeg me af of we het erover kunnen hebben waar dit naartoe gaat."
- "Ik date op dit moment alleen jou. Is dat voor jou ook zo?"

## Wat te vragen?

- Zijn we exclusief?
- Hoe zien we dit in de toekomst?
- Wat zijn je verwachtingen?
- Mogen we dit een relatie noemen?

## Tips

1. **Kies het juiste moment** - niet na ruzie, seks, of dronken
2. **Wees direct** - geen hints of vissen
3. **Luister echt** - naar wat ze zeggen EN niet zeggen
4. **Accepteer hun antwoord** - ook als het niet is wat je wilt horen
`,
  },
  {
    titleNl: 'Slow Fade',
    slug: 'slow-fade-betekenis',
    excerptNl: 'Geleidelijk minder contact tot het stopt - een langzame versie van ghosting.',
    contentNl: `# Slow Fade

## Wat is een slow fade?

De slow fade is **ghosting in slow motion**. In plaats van plotseling te verdwijnen, bouwt iemand het contact langzaam af tot het stopt.

## Hoe ziet het eruit?

Week 1: Dagelijks contact, enthousiaste berichten
Week 2: Iets minder, maar nog steeds warm
Week 3: Antwoorden duren langer, worden korter
Week 4: Nauwelijks contact, vage excuses
Week 5: Stilte

## Verschil met druk hebben

| Slow Fade | Echt Druk |
|-----------|-----------|
| Steeds minder initiatief | Legt uit wat er speelt |
| Excuses worden vager | Stelt alternatieve momenten voor |
| Geen plannen maken | Plant voor wanneer ze wel kunnen |
| Warmte verdwijnt | Warmte blijft, alleen timing lastig |

## Waarom doen mensen dit?

- **Confrontatie vermijden** - hopen dat jij de hint snapt
- **Onzekerheid** - weten niet wat ze willen
- **Iemand anders** - maar durven niet te zeggen
- **Laf** - sorry, maar het is waar

## Hoe reageer je?

1. **Herken het patroon** - als het al weken afneemt, weet je genoeg
2. **Wees direct** - "Ik merk dat ons contact minder wordt. Wat is er aan de hand?"
3. **Accepteer het antwoord** - ook stilte is een antwoord
4. **Ga door** - investeer je energie in mensen die wél enthousiast zijn
`,
  }
]

// ============================================
// SEED FUNCTIE
// ============================================
async function main() {
  console.log('🌱 Seeding Extra Kennisbank Content...\n')

  // Find admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'ADMIN' },
        { email: { contains: 'admin' } },
        { email: { contains: 'system' } }
      ]
    }
  })

  if (!adminUser) {
    console.error('❌ No admin user found. Run the main seed first.')
    process.exit(1)
  }

  console.log(`👤 Using author: ${adminUser.email}\n`)

  // Get category IDs
  const profielCategory = await prisma.knowledgeBaseCategory.findFirst({
    where: { slug: 'profiel' }
  })

  const succesverhaalCategory = await prisma.knowledgeBaseCategory.findFirst({
    where: { slug: 'succesverhalen' }
  })

  const begrippenCategory = await prisma.knowledgeBaseCategory.findFirst({
    where: { slug: 'begrippen' }
  })

  if (!profielCategory || !succesverhaalCategory || !begrippenCategory) {
    console.error('❌ Required categories not found. Run seed-kennisbank-content.ts first.')
    process.exit(1)
  }

  // Seed Profiel & Foto's articles
  console.log('📸 Creating Profiel & Foto\'s articles...')
  for (const article of profielArticles) {
    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { slug: article.slug }
    })

    if (existing) {
      console.log(`   ⏭️ Skipping existing: ${article.titleNl}`)
      continue
    }

    await prisma.knowledgeBaseArticle.create({
      data: {
        title: article.title,
        titleNl: article.titleNl,
        slug: article.slug,
        content: article.contentNl,
        contentNl: article.contentNl,
        contentEasyRead: article.contentEasyRead,
        hasEasyRead: article.hasEasyRead,
        excerpt: article.excerptNl,
        excerptNl: article.excerptNl,
        categoryId: profielCategory.id,
        authorId: adminUser.id,
        articleType: article.articleType,
        isPillarPage: article.isPillarPage,
        isFeatured: article.isFeatured,
        targetAudience: article.targetAudience,
        keywords: article.keywords,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      }
    })
    console.log(`   ✅ Created: ${article.titleNl}`)
  }

  // Seed Succesverhalen
  console.log('\n💕 Creating Succesverhalen...')
  for (const story of successStories) {
    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { slug: story.slug }
    })

    if (existing) {
      console.log(`   ⏭️ Skipping existing: ${story.titleNl}`)
      continue
    }

    await prisma.knowledgeBaseArticle.create({
      data: {
        title: story.title,
        titleNl: story.titleNl,
        slug: story.slug,
        content: story.contentNl,
        contentNl: story.contentNl,
        contentEasyRead: story.contentEasyRead,
        hasEasyRead: story.hasEasyRead,
        excerpt: story.excerptNl,
        excerptNl: story.excerptNl,
        categoryId: succesverhaalCategory.id,
        authorId: adminUser.id,
        articleType: story.articleType,
        isPillarPage: story.isPillarPage,
        isFeatured: story.isFeatured,
        targetAudience: story.targetAudience,
        keywords: story.keywords,
        metaTitle: story.metaTitle,
        metaDescription: story.metaDescription,
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      }
    })
    console.log(`   ✅ Created: ${story.titleNl}`)
  }

  // Seed Extra Begrippen
  console.log('\n📚 Creating Extra Begrippen...')
  for (const begrip of extraBegrippen) {
    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { slug: begrip.slug }
    })

    if (existing) {
      console.log(`   ⏭️ Skipping existing: ${begrip.titleNl}`)
      continue
    }

    await prisma.knowledgeBaseArticle.create({
      data: {
        title: begrip.titleNl,
        titleNl: begrip.titleNl,
        slug: begrip.slug,
        content: begrip.contentNl,
        contentNl: begrip.contentNl,
        excerpt: begrip.excerptNl,
        excerptNl: begrip.excerptNl,
        categoryId: begrippenCategory.id,
        authorId: adminUser.id,
        articleType: 'GLOSSARY',
        isPillarPage: false,
        isFeatured: false,
        hasEasyRead: false,
        targetAudience: ['GENERAL'],
        keywords: [begrip.titleNl.toLowerCase()],
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      }
    })
    console.log(`   ✅ Created: ${begrip.titleNl}`)
  }

  // Summary
  console.log('\n✨ Extra Kennisbank content seeded!')
  console.log(`   📸 ${profielArticles.length} Profiel & Foto's artikelen`)
  console.log(`   💕 ${successStories.length} Succesverhalen`)
  console.log(`   📚 ${extraBegrippen.length} Begrippen`)
}

main()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
