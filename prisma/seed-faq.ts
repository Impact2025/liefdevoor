/**
 * FAQ Seed Data
 * Seeds the database with FAQ categories and articles for Liefde Voor Iedereen
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding FAQ data...')

  // Get or create an admin user for authoring
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminUser) {
    console.log('No admin user found, creating one...')
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@liefdevooriedereen.nl',
        name: 'Support Team',
        role: 'ADMIN',
        hasAcceptedTerms: true
      }
    })
  }

  // Create FAQ Categories
  const accountCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'account-login' },
    update: {},
    create: {
      name: 'Account & Login',
      nameNl: 'Account & Inloggen',
      description: 'Vragen over je account, inloggen en registratie',
      icon: '👤',
      slug: 'account-login',
      order: 1,
      isVisible: true
    }
  })

  const matchingCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'matching-profielen' },
    update: {},
    create: {
      name: 'Matching & Profiles',
      nameNl: 'Matching & Profielen',
      description: 'Hoe werkt het match algoritme en profielen',
      icon: '💕',
      slug: 'matching-profielen',
      order: 2,
      isVisible: true
    }
  })

  const messagesCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'berichten-chat' },
    update: {},
    create: {
      name: 'Messages & Chat',
      nameNl: 'Berichten & Chat',
      description: 'Vragen over berichten en chatten',
      icon: '💬',
      slug: 'berichten-chat',
      order: 3,
      isVisible: true
    }
  })

  const paymentsCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'abonnementen-betalingen' },
    update: {},
    create: {
      name: 'Subscriptions & Payments',
      nameNl: 'Abonnementen & Betalingen',
      description: 'Informatie over abonnementen, prijzen en betalingen',
      icon: '💳',
      slug: 'abonnementen-betalingen',
      order: 4,
      isVisible: true
    }
  })

  const verificationCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'verificatie-veiligheid' },
    update: {},
    create: {
      name: 'Verification & Safety',
      nameNl: 'Verificatie & Veiligheid',
      description: 'Fotoverificatie, veiligheid en privacy',
      icon: '🛡️',
      slug: 'verificatie-veiligheid',
      order: 5,
      isVisible: true
    }
  })

  const technicalCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'technische-problemen' },
    update: {},
    create: {
      name: 'Technical Issues',
      nameNl: 'Technische Problemen',
      description: 'Hulp bij technische problemen en bugs',
      icon: '⚙️',
      slug: 'technische-problemen',
      order: 6,
      isVisible: true
    }
  })

  const privacyCategory = await prisma.fAQCategory.upsert({
    where: { slug: 'privacy-avg' },
    update: {},
    create: {
      name: 'Privacy & GDPR',
      nameNl: 'Privacy & AVG',
      description: 'Privacy, gegevensbescherming en AVG',
      icon: '🔒',
      slug: 'privacy-avg',
      order: 7,
      isVisible: true
    }
  })

  console.log('✅ Categories created')

  // Create FAQ Articles
  const articles = [
    // Account & Login
    {
      categoryId: accountCategory.id,
      title: 'How do I create an account?',
      titleNl: 'Hoe maak ik een account aan?',
      slug: 'account-aanmaken',
      excerpt: 'Leer hoe je een nieuw account aanmaakt bij Liefde Voor Iedereen',
      content: 'Step by step guide to creating an account',
      contentNl: `# Account aanmaken

Om een account aan te maken bij Liefde Voor Iedereen:

1. **Ga naar de registratiepagina**
   - Klik op "Aanmelden" op de homepage
   - Of ga direct naar https://liefdevooriedereen.nl/register

2. **Vul je gegevens in**
   - Naam
   - Email adres
   - Wachtwoord (minimaal 8 karakters)
   - Geboortedatum (je moet 18+ zijn)
   - Geslacht

3. **Accepteer de voorwaarden**
   - Lees en accepteer de Algemene Voorwaarden
   - Accepteer het Privacybeleid

4. **Verifieer je email**
   - Check je inbox voor een verificatie email
   - Klik op de verificatielink

5. **Voltooi je profiel**
   - Voeg foto's toe
   - Vul je bio in
   - Stel je voorkeuren in

Dat's alles! Je bent nu klaar om te starten met swipen.`,
      keywords: ['account', 'aanmaken', 'registreren', 'aanmelden', 'sign up'],
      isFeatured: true,
      order: 1
    },
    {
      categoryId: accountCategory.id,
      title: 'I forgot my password',
      titleNl: 'Ik ben mijn wachtwoord vergeten',
      slug: 'wachtwoord-vergeten',
      excerpt: 'Hoe je je wachtwoord kunt resetten',
      content: 'Password reset instructions',
      contentNl: `# Wachtwoord vergeten

Geen probleem! Je kunt je wachtwoord eenvoudig resetten:

1. **Ga naar de inlogpagina**
   - Klik op "Wachtwoord vergeten?"

2. **Vul je emailadres in**
   - Gebruik het emailadres waarmee je bent geregistreerd

3. **Check je email**
   - Je ontvangt binnen enkele minuten een email
   - Klik op de "Wachtwoord resetten" link

4. **Kies een nieuw wachtwoord**
   - Minimaal 8 karakters
   - Gebruik een combinatie van letters en cijfers
   - Een sterke wachtwoord wordt aanbevolen

5. **Log in met je nieuwe wachtwoord**

**Tip:** Krijg je geen email? Check je spam/junk folder!`,
      keywords: ['wachtwoord', 'vergeten', 'reset', 'password', 'inloggen'],
      isFeatured: true,
      order: 2
    },

    // Matching & Profielen
    {
      categoryId: matchingCategory.id,
      title: 'How does the matching algorithm work?',
      titleNl: 'Hoe werkt het match algoritme?',
      slug: 'match-algoritme',
      excerpt: 'Uitleg over hoe ons slim matchingalgoritme werkt',
      content: 'Matching algorithm explanation',
      contentNl: `# Ons Match Algoritme

Liefde Voor Iedereen gebruikt een geavanceerd algoritme om de best passende matches voor je te vinden.

## Wat we analyseren:

**1. Basisvoorkeuren**
- Leeftijd
- Afstand/locatie
- Geslacht

**2. Interesses en hobbies**
- Gedeelde interesses krijgen een hogere score
- Complementaire hobbies worden ook meegenomen

**3. Profielkwaliteit**
- Complete profielen krijgen prioriteit
- Geverifieerde foto's verhogen je zichtbaarheid

**4. Gedragspatronen**
- Welke profielen je liked
- Hoe lang je profielen bekijkt
- Op wie je reageert

**5. Activiteit**
- Actieve gebruikers worden vaker getoond
- Inactieve profielen worden minder vaak getoond

## Tips voor betere matches:

✅ Vul je profiel volledig in
✅ Voeg meerdere foto's toe
✅ Verifieer je foto
✅ Wees actief op de app
✅ Wees eerlijk in je voorkeuren`,
      keywords: ['algoritme', 'matching', 'matches', 'hoe werkt', 'profielen'],
      isFeatured: true,
      order: 1
    },
    {
      categoryId: matchingCategory.id,
      title: 'What is a Super Like?',
      titleNl: 'Wat is een Super Like?',
      slug: 'super-like',
      excerpt: 'Alles over Super Likes en hoe je ze gebruikt',
      content: 'Super Like explanation',
      contentNl: `# Super Like

Een Super Like is een speciale manier om iemand te laten zien dat je echt geïnteresseerd bent!

## Wat is het verschil?

**Normale Like:**
- De persoon ziet je like pas als ze jou ook liken
- Jullie matchen pas als het wederzijds is

**Super Like:**
- De persoon ziet direct dat je een Super Like hebt gegeven
- Je profiel wordt bovenaan getoond
- 3x meer kans op een match!

## Hoeveel Super Likes heb ik?

**Gratis account:**
- 1 Super Like per dag

**Liefde Plus:**
- 5 Super Likes per dag

**Liefde Compleet:**
- Onbeperkte Super Likes

## Hoe geef ik een Super Like?

1. Swipe **omhoog** op een profiel
2. Of klik op de blauwe ster knop

**Tip:** Gebruik je Super Likes strategisch voor profielen waar je echt een goede connectie mee voelt!`,
      keywords: ['super like', 'superlike', 'ster', 'swipe omhoog', 'premium'],
      isFeatured: false,
      order: 2
    },

    // Berichten & Chat
    {
      categoryId: messagesCategory.id,
      title: 'Why cannot I see my messages',
      titleNl: 'Waarom zie ik mijn berichten niet',
      slug: 'berichten-niet-zichtbaar',
      excerpt: 'Oplossingen als je je berichten niet kunt zien',
      content: 'Message visibility troubleshooting',
      contentNl: `# Berichten niet zichtbaar

Als je je berichten niet kunt zien, kan dit verschillende oorzaken hebben:

## Mogelijke oorzaken:

**1. Je hebt nog geen match**
- Je kunt alleen berichten sturen naar mensen waar je een match mee hebt
- Check of de match is gelukt (beide moeten elkaar geliket hebben)

**2. De match heeft je geblokkeerd**
- Als iemand je blokkeert, verdwijnt de conversatie
- Je kunt dit niet ongedaan maken

**3. Technisch probleem**
- Probeer de app te herladen
- Log uit en weer in
- Update naar de laatste versie

**4. Internetverbinding**
- Check je internetverbinding
- Probeer het op wifi of mobiel data

## Oplossingen:

✅ Herlaad de pagina (F5 of swipe down)
✅ Log uit en weer in
✅ Wis je browser cache
✅ Update de app naar de laatste versie
✅ Check je internetverbinding

Werkt het nog steeds niet? Neem contact op met support!`,
      keywords: ['berichten', 'messages', 'niet zichtbaar', 'verdwenen', 'chat'],
      isFeatured: false,
      order: 1
    },

    // Abonnementen & Betalingen
    {
      categoryId: paymentsCategory.id,
      title: 'What subscriptions are available?',
      titleNl: 'Welke abonnementen zijn er beschikbaar?',
      slug: 'abonnementen-overzicht',
      excerpt: 'Overzicht van alle beschikbare abonnementen en prijzen',
      content: 'Subscription plans overview',
      contentNl: `# Abonnementen Overzicht

Liefde Voor Iedereen biedt drie abonnementsniveaus:

## 💚 Gratis (Basis)
**€0 per maand**

✅ Profiel aanmaken
✅ Swipen door profielen
✅ 25 swipes per dag
✅ Matchen met anderen
✅ Berichten sturen naar matches
✅ 1 Super Like per dag

## 💙 Liefde Plus
**€9,95 per maand**

Alles van Gratis, plus:
✅ **Onbeperkt swipen**
✅ 5 Super Likes per dag
✅ Zie wie jou geliked heeft
✅ 1 gratis Boost per maand
✅ Terugdraaien van laatste swipe
✅ Geen advertenties

## 💜 Liefde Compleet
**€24,95 per 3 maanden** (€8,32/maand)

Alles van Plus, plus:
✅ **Onbeperkte Super Likes**
✅ **Onbeperkte Boosts**
✅ Lees bevestigingen
✅ Profiel verbergen (incognito modus)
✅ Passport functie (swipe in andere steden)
✅ Prioriteit in matches

## Veelgestelde vragen:

**Kan ik upgraden?**
Ja, je kunt op elk moment upgraden!

**Automatische verlenging?**
Ja, abonnementen verlengen automatisch. Je kunt op elk moment opzeggen.

**Opzeggen?**
Ga naar Instellingen → Abonnement → Opzeggen`,
      keywords: ['abonnement', 'prijzen', 'prijs', 'kosten', 'kost', 'betalen', 'subscription', 'plus', 'compleet', 'gratis', 'euro', 'maand', 'geld'],
      isFeatured: true,
      order: 1
    },
    {
      categoryId: paymentsCategory.id,
      title: 'How do I cancel my subscription?',
      titleNl: 'Hoe zeg ik mijn abonnement op?',
      slug: 'abonnement-opzeggen',
      excerpt: 'Stapsgewijze uitleg om je abonnement op te zeggen',
      content: 'Subscription cancellation guide',
      contentNl: `# Abonnement opzeggen

Je kunt je abonnement op elk moment opzeggen. Hier is hoe:

## Stappen om op te zeggen:

1. **Log in op je account**
   - Ga naar de website of app

2. **Ga naar Instellingen**
   - Klik op je profielfoto
   - Selecteer "Instellingen"

3. **Selecteer Abonnement**
   - Klik op "Abonnement beheren"

4. **Klik op Opzeggen**
   - Kies "Abonnement opzeggen"
   - Bevestig je keuze

## Wat gebeurt er na opzeggen?

✅ Je abonnement blijft actief tot het einde van de betaalde periode
✅ Je wordt niet meer automatisch verlengd
✅ Je profiel blijft bestaan
✅ Je matches en berichten blijven bewaard

## Belangrijke informatie:

⚠️ **Geen restitutie**: Al betaalde bedragen worden niet teruggestort
⚠️ **Toegang**: Je behoudt toegang tot premium features tot het einde van de periode
⚠️ **Heractiveren**: Je kunt op elk moment opnieuw een abonnement afsluiten

## Problemen met opzeggen?

Neem contact op met support via support@liefdevooriedereen.nl`,
      keywords: ['opzeggen', 'annuleren', 'cancel', 'abonnement', 'subscription'],
      isFeatured: false,
      order: 2
    },

    // Verificatie & Veiligheid
    {
      categoryId: verificationCategory.id,
      title: 'How does photo verification work?',
      titleNl: 'Hoe werkt fotoverificatie?',
      slug: 'fotoverificatie',
      excerpt: 'Alles over fotoverificatie en het blauwe vinkje',
      content: 'Photo verification guide',
      contentNl: `# Fotoverificatie

Fotoverificatie helpt anderen te vertrouwen dat je profiel echt is.

## Waarom verificatie?

✅ Verhoogt vertrouwen bij anderen
✅ Meer matches
✅ Hogere zichtbaarheid in het algoritme
✅ Blauwe verificatie badge op je profiel

## Hoe verifieer ik mijn foto?

1. **Ga naar Instellingen**
   - Klik op je profiel
   - Selecteer "Fotoverificatie"

2. **Volg de instructies**
   - Maak een selfie in de gevraagde pose
   - Zorg voor goed licht
   - Geen filters of bewerking!

3. **Upload je foto**
   - De foto wordt gecontroleerd door ons team
   - En door AI voor extra zekerheid

4. **Wacht op goedkeuring**
   - Meestal binnen 24 uur
   - Je krijgt een notificatie bij goedkeuring

## Tips voor succesvolle verificatie:

✅ Gebruik goed licht
✅ Kijk recht in de camera
✅ Geen zonnebril of pet
✅ Geen filters
✅ Match met je profielfoto's

## Verificatie afgewezen?

Als je verificatie wordt afgewezen:
- Check de reden in de notificatie
- Probeer opnieuw met een betere foto
- Zorg dat je gezicht duidelijk zichtbaar is`,
      keywords: ['verificatie', 'verification', 'blauwe vinkje', 'echt', 'veiligheid'],
      isFeatured: true,
      order: 1
    },

    // Privacy & AVG
    {
      categoryId: privacyCategory.id,
      title: 'How is my data protected?',
      titleNl: 'Hoe wordt mijn data beschermd?',
      slug: 'data-bescherming',
      excerpt: 'Informatie over hoe we je privacy en data beschermen',
      content: 'Data protection information',
      contentNl: `# Data Bescherming

Bij Liefde Voor Iedereen nemen we je privacy zeer serieus.

## Hoe beschermen we je data?

**1. Encryptie**
- Alle data wordt versleuteld opgeslagen
- HTTPS voor veilige verbindingen
- Wachtwoorden worden gehashed (nooit leesbaar opgeslagen)

**2. AVG Compliant**
- We voldoen aan alle AVG (GDPR) eisen
- Je hebt volledige controle over je data
- Recht op inzage, wijziging en verwijdering

**3. Beveiligde servers**
- Data wordt opgeslagen in beveiligde datacenters in de EU
- Regelmatige security audits
- 24/7 monitoring

**4. Beperkte toegang**
- Alleen geautoriseerd personeel heeft toegang
- Strikte toegangscontroles
- Logging van alle toegang

## Jouw rechten:

✅ **Recht op inzage**: Bekijk welke data we van je hebben
✅ **Recht op wijziging**: Pas je gegevens aan
✅ **Recht op verwijdering**: Verwijder je account en data
✅ **Recht op dataportabiliteit**: Download je data

## Wat delen we NIET:

❌ Je persoonlijke gegevens met derden (zonder toestemming)
❌ Je berichten met anderen
❌ Je locatiegegevens (alleen afstand wordt getoond)
❌ Je betalingsgegevens

## Data exporteren of verwijderen?

Ga naar Instellingen → Privacy → Data beheren

Voor vragen: privacy@liefdevooriedereen.nl`,
      keywords: ['privacy', 'data', 'avg', 'gdpr', 'bescherming', 'veiligheid'],
      isFeatured: false,
      order: 1
    }
  ]

  console.log('📝 Creating FAQ articles...')

  for (const article of articles) {
    await prisma.fAQArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        authorId: adminUser.id,
        isPublished: true
      }
    })
    console.log(`   ✓ ${article.titleNl}`)
  }

  console.log('✅ FAQ seed data complete!')
  console.log(`   📁 ${articles.length} articles created across 7 categories`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding FAQ data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
