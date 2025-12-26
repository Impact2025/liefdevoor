/**
 * FAQ Articles: Aan de slag (Getting Started)
 * 5 articles about registration, onboarding and first steps
 */

export interface FAQArticleData {
  categorySlug: string
  title: string
  titleNl: string
  slug: string
  excerpt: string
  content: string
  contentNl: string
  keywords: string[]
  isFeatured: boolean
  order: number
}

export const gettingStartedArticles: FAQArticleData[] = [
  {
    categorySlug: 'aan-de-slag',
    title: 'How do I create an account?',
    titleNl: 'Hoe maak ik een account aan?',
    slug: 'account-aanmaken',
    excerpt: 'Stap voor stap uitleg over het aanmaken van je Liefde Voor Iedereen account',
    content: 'How to create an account on Liefde Voor Iedereen',
    contentNl: `# Hoe maak ik een account aan?

Welkom bij Liefde Voor Iedereen! In een paar simpele stappen maak je een account aan en kun je beginnen met het ontdekken van nieuwe mensen.

## Aanmelden via de website

1. **Ga naar de website**
   - Bezoek [liefdevooriedereen.nl](https://liefdevooriedereen.nl)
   - Klik op de knop "Aanmelden" of "Start nu"

2. **Kies je aanmeldmethode**
   - **E-mail**: Vul je e-mailadres en een wachtwoord in
   - **Google**: Meld je aan met je Google-account (sneller!)

3. **Vul je basisgegevens in**
   - Je voornaam
   - Geboortedatum (je moet minimaal 18 jaar zijn)
   - Geslacht

4. **Accepteer de voorwaarden**
   - Lees de Algemene Voorwaarden
   - Accepteer het Privacybeleid
   - Vink aan dat je 18 jaar of ouder bent

5. **Verifieer je e-mailadres**
   - Check je inbox voor een verificatie-e-mail
   - Klik op de link om je e-mailadres te bevestigen
   - Check ook je spam-folder als je de e-mail niet ziet

## Na het aanmelden

Zodra je account is aangemaakt, doorloop je de onboarding om je profiel compleet te maken:

- Foto's uploaden
- Bio schrijven
- Interesses kiezen
- Zoekvoorkeuren instellen
- Optioneel: Voice Intro opnemen

## Tips voor een succesvolle start

✅ Gebruik een e-mailadres waar je toegang toe hebt
✅ Kies een sterk wachtwoord (minimaal 8 tekens)
✅ Gebruik je echte voornaam
✅ Vul je echte geboortedatum in (dit kun je later niet wijzigen)

## Veelgestelde vragen

**Kan ik me aanmelden zonder e-mailadres?**
Nee, een geldig e-mailadres is verplicht voor accountverificatie en veiligheid.

**Is aanmelden gratis?**
Ja! Het aanmaken van een account en basisfuncties zijn volledig gratis.

**Ik heb geen verificatie-e-mail ontvangen, wat nu?**
Check je spam-folder. Je kunt ook een nieuwe verificatie-e-mail aanvragen via de inlogpagina.`,
    keywords: ['aanmelden', 'registreren', 'account', 'account aanmaken', 'inschrijven', 'sign up', 'nieuw account', 'gratis'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'What are the onboarding steps?',
    titleNl: 'Wat zijn de stappen van de onboarding?',
    slug: 'onboarding-stappen',
    excerpt: 'Ontdek welke stappen je doorloopt om je profiel volledig in te vullen',
    content: 'Onboarding steps explanation',
    contentNl: `# Wat zijn de stappen van de onboarding?

Na het aanmaken van je account doorloop je onze onboarding. Dit helpt je om een compleet en aantrekkelijk profiel te maken.

## De onboarding stappen

### 1. Welkom
Een korte introductie over wat Liefde Voor Iedereen te bieden heeft.

### 2. Profielfoto's
Upload minimaal 1 foto van jezelf. Je kunt tot 6 foto's toevoegen.
- Kies een duidelijke hoofdfoto waar je gezicht goed zichtbaar is
- Voeg variatie toe: hobby's, reizen, met vrienden
- Vermijd groepsfoto's als hoofdfoto

### 3. Over jezelf (Bio)
Schrijf een korte beschrijving over jezelf.
- Wie ben je?
- Wat zijn je passies?
- Wat zoek je?

**Tip:** Onze AI kan je helpen met het schrijven van je bio!

### 4. Interesses
Kies je interesses uit verschillende categorieën:
- Sport & Fitness
- Muziek & Kunst
- Reizen & Avontuur
- Eten & Drinken
- Films & Series
- En meer...

### 5. Basisinformatie
Vul aanvullende informatie in:
- Woonplaats of postcode
- Lengte
- Opleiding
- Beroep

### 6. Zoekvoorkeuren
Stel in wie je wilt ontmoeten:
- Geslacht
- Leeftijdsbereik
- Maximum afstand

### 7. Voice Intro (optioneel)
Neem een korte audio-introductie op (max 60 seconden).
- Laat je persoonlijkheid horen
- Maak je profiel uniek
- Verhoogt je kans op matches!

### 8. Fotoverificatie (optioneel)
Verifieer je profiel voor een blauw vinkje.
- Maak een selfie in een specifieke pose
- Bewijs dat jij echt bent
- Meer vertrouwen bij andere gebruikers

### 9. Huisregels
Lees en accepteer onze community-richtlijnen voor respectvol gedrag.

## Kan ik stappen overslaan?

Sommige stappen zijn verplicht (foto, basis info), andere zijn optioneel maar verhogen wel je kans op matches.

## Kan ik dit later nog aanpassen?

Ja! Alles wat je invult tijdens de onboarding kun je later wijzigen via je profielinstellingen.

## Tips voor een sterk profiel

✅ Vul zoveel mogelijk velden in
✅ Upload meerdere foto's
✅ Schrijf een unieke, persoonlijke bio
✅ Verifieer je profiel voor meer vertrouwen
✅ Neem een Voice Intro op om op te vallen`,
    keywords: ['onboarding', 'stappen', 'profiel invullen', 'setup', 'instellen', 'beginnen', 'eerste keer', 'wizard'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'How do I activate my account?',
    titleNl: 'Hoe activeer ik mijn account?',
    slug: 'account-activeren',
    excerpt: 'Leer hoe je je account activeert via e-mailverificatie',
    content: 'Account activation guide',
    contentNl: `# Hoe activeer ik mijn account?

Om je account te activeren moet je je e-mailadres verifiëren. Dit is een belangrijke beveiligingsstap.

## Stappen voor activatie

### 1. Check je inbox
Na het aanmelden ontvang je automatisch een e-mail van Liefde Voor Iedereen.

**Onderwerp:** "Verifieer je e-mailadres" of "Welkom bij Liefde Voor Iedereen"

### 2. Open de e-mail
Klik op de verificatielink in de e-mail. Deze link is 24 uur geldig.

### 3. Bevestiging
Je wordt doorgestuurd naar de app en ziet een bevestiging dat je account is geactiveerd.

## Geen e-mail ontvangen?

**Check deze plekken:**
- Spam of Junk folder
- Promoties tab (Gmail)
- Alle mail / Overige (Outlook)

**Nog steeds niets?**
1. Ga naar de inlogpagina
2. Probeer in te loggen
3. Klik op "Verificatie-e-mail opnieuw versturen"

## Veelvoorkomende problemen

**De link werkt niet**
- Links verlopen na 24 uur
- Vraag een nieuwe verificatie-e-mail aan

**Ik heb een verkeerd e-mailadres opgegeven**
- Maak een nieuw account aan met het juiste e-mailadres

**Mijn account is nog steeds niet actief**
- Zorg dat je op de link klikt (niet kopiëren/plakken)
- Gebruik dezelfde browser/device

## Waarom is verificatie nodig?

✅ Beschermt je account tegen misbruik
✅ Zorgt dat we je kunnen bereiken
✅ Voorkomt nepaccounts
✅ Maakt wachtwoord reset mogelijk

## Hulp nodig?

Als je problemen blijft ervaren, neem contact op met onze support via support@liefdevooriedereen.nl`,
    keywords: ['activeren', 'verificatie', 'email', 'e-mail', 'bevestigen', 'link', 'verificatielink', 'activatie'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'What are the house rules?',
    titleNl: 'Wat zijn de huisregels?',
    slug: 'huisregels',
    excerpt: 'De belangrijkste gedragsregels voor een veilige en respectvolle community',
    content: 'Community guidelines and house rules',
    contentNl: `# Wat zijn de huisregels?

Bij Liefde Voor Iedereen willen we een veilige en respectvolle omgeving creëren. Daarom hebben we huisregels waar iedereen zich aan moet houden.

## Onze kernwaarden

### 1. Respect
Behandel anderen zoals je zelf behandeld wilt worden.
- Geen beledigingen of discriminatie
- Respecteer grenzen
- Accepteer een "nee"

### 2. Eerlijkheid
Wees eerlijk over wie je bent.
- Gebruik echte, recente foto's van jezelf
- Geef correcte informatie over je leeftijd
- Geen nepprofielen of catfishing

### 3. Veiligheid
Help mee aan een veilige omgeving.
- Deel geen persoonlijke gegevens te snel
- Meld verdacht gedrag
- Ontmoet op openbare plekken

## Wat is NIET toegestaan

❌ **Haatdragende content**
Discriminatie op basis van ras, religie, gender, seksuele oriëntatie of handicap

❌ **Intimidatie of stalking**
Herhaaldelijk contact zoeken na afwijzing

❌ **Seksueel expliciete content**
Ongevraagde naaktfoto's of expliciete berichten

❌ **Oplichting of spam**
Financiële verzoeken, phishing of commerciële berichten

❌ **Geweld of bedreigingen**
Dreigen met geweld of aanzetten tot geweld

❌ **Minderjarigen**
Je moet 18+ zijn om de app te gebruiken

❌ **Nepprofielen**
Profielen met valse informatie of foto's van anderen

## Wat gebeurt er bij overtredingen?

**Waarschuwing**
Bij milde overtredingen krijg je een waarschuwing.

**Tijdelijke blokkade**
Bij herhaalde overtredingen wordt je account tijdelijk geblokkeerd.

**Permanente ban**
Bij ernstige overtredingen of herhaling word je permanent verbannen.

## Melden van overtredingen

Zie je iets dat niet hoort? Meld het!

1. Ga naar het profiel van de persoon
2. Tik op de drie puntjes (...)
3. Kies "Rapporteren"
4. Selecteer de reden
5. Voeg eventueel details toe

Alle meldingen worden vertrouwelijk behandeld.

## Samenvatting

✅ Wees respectvol
✅ Wees eerlijk
✅ Wees veilig
✅ Meld overtredingen
✅ Heb plezier!

Door je aan deze regels te houden, help je mee aan een prettige ervaring voor iedereen.`,
    keywords: ['huisregels', 'regels', 'gedragsregels', 'richtlijnen', 'community', 'veiligheid', 'respect', 'verboden'],
    isFeatured: false,
    order: 4
  },
  {
    categorySlug: 'aan-de-slag',
    title: 'Why do I need to verify my age?',
    titleNl: 'Waarom moet ik mijn leeftijd verifiëren?',
    slug: 'leeftijd-verificatie',
    excerpt: 'Uitleg over waarom leeftijdsverificatie belangrijk is',
    content: 'Age verification explanation',
    contentNl: `# Waarom moet ik mijn leeftijd verifiëren?

Liefde Voor Iedereen is alleen toegankelijk voor mensen van 18 jaar en ouder. Leeftijdsverificatie is een belangrijk onderdeel van onze veiligheidsmaatregelen.

## Waarom 18+?

### Wettelijke vereisten
Dating apps zijn wettelijk verplicht om alleen volwassenen toe te laten. Dit beschermt minderjarigen tegen ongepaste contacten.

### Veiligheid
Een volwassen community zorgt voor:
- Passende gesprekken
- Verantwoordelijke interacties
- Een veiligere omgeving

### Vertrouwen
Andere gebruikers weten dat ze met volwassenen communiceren.

## Hoe wordt mijn leeftijd geverifieerd?

### Bij registratie
Je voert je geboortedatum in. Het systeem controleert automatisch of je 18+ bent.

### Aanvullende verificatie
Bij twijfel kunnen we aanvullende verificatie vragen:
- Identiteitsbewijs (ID-kaart, rijbewijs, paspoort)
- Foto van jezelf met je ID

## Privacy van je gegevens

- Je geboortedatum wordt veilig opgeslagen
- ID-documenten worden alleen gebruikt voor verificatie
- We delen deze gegevens nooit met derden
- Na verificatie worden ID-foto's verwijderd

## Veelgestelde vragen

**Kan ik mijn geboortedatum later wijzigen?**
Nee, om fraude te voorkomen kan je geboortedatum na registratie niet gewijzigd worden.

**Ik ben 18+ maar mijn verificatie is afgewezen**
- Controleer of je de juiste geboortedatum hebt ingevuld
- Neem contact op met support als dit incorrect is

**Wordt mijn leeftijd getoond aan anderen?**
Je leeftijd wordt getoond op je profiel. Je kunt dit niet verbergen.

**Ik ben bijna 18, kan ik me alvast aanmelden?**
Nee, je moet op het moment van aanmelding 18 jaar of ouder zijn.

## Samenvatting

✅ Leeftijdsverificatie beschermt minderjarigen
✅ Het creëert een veiligere community
✅ Je gegevens worden privé gehouden
✅ Dit is een wettelijke vereiste`,
    keywords: ['leeftijd', 'verificatie', '18+', 'achttien', 'minderjarig', 'geboortedatum', 'id', 'identiteit'],
    isFeatured: false,
    order: 5
  }
]
