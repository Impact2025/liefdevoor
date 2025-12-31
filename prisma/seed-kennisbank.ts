/**
 * Kennisbank Seed Script
 *
 * Run with: npx ts-node prisma/seed-kennisbank.ts
 * Or add to package.json: "seed:kennisbank": "ts-node prisma/seed-kennisbank.ts"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Kennisbank Categories
const categories = [
  {
    name: 'Veiligheid',
    nameNl: 'Veiligheid',
    slug: 'veiligheid',
    description: 'Everything about staying safe while dating online',
    descriptionNl: 'Alles over veilig online daten, scams herkennen en je privacy beschermen.',
    icon: 'Shield',
    color: '#E11D48',
    order: 1,
    metaTitle: 'Veilig Online Daten - Tips & Gidsen',
    metaDescription: 'Leer hoe je veilig kunt daten. Herken scams, bescherm je privacy en date met vertrouwen.',
  },
  {
    name: 'Inclusief Daten',
    nameNl: 'Inclusief Daten',
    slug: 'inclusief-daten',
    description: 'Dating guides for everyone, regardless of ability or identity',
    descriptionNl: 'Dating voor iedereen. Specifieke gidsen voor autisme, LVB, LGBTQ+ en meer.',
    icon: 'Heart',
    color: '#8B5CF6',
    order: 2,
    metaTitle: 'Inclusief Daten - Voor Iedereen',
    metaDescription: 'Dating tips en gidsen voor mensen met autisme, LVB, LGBTQ+ en andere achtergronden.',
  },
  {
    name: 'Communicatie',
    nameNl: 'Communicatie',
    slug: 'communicatie',
    description: 'How to communicate effectively in dating',
    descriptionNl: 'Effectief communiceren, grenzen stellen en authentiek contact maken.',
    icon: 'MessageCircle',
    color: '#3B82F6',
    order: 3,
    metaTitle: 'Communicatie in Dating - Tips & Technieken',
    metaDescription: 'Leer effectief communiceren, grenzen stellen en authentieke connecties maken.',
  },
  {
    name: 'Relaties',
    nameNl: 'Relaties',
    slug: 'relaties',
    description: 'Building and maintaining healthy relationships',
    descriptionNl: 'Van eerste date tot langdurige relatie. Tips voor elke fase.',
    icon: 'Users',
    color: '#22C55E',
    order: 4,
    metaTitle: 'Relaties Opbouwen - Van Date tot Partner',
    metaDescription: 'Bouw gezonde relaties op. Van eerste date tot langdurige verbintenis.',
  },
  {
    name: 'Begrippenlijst',
    nameNl: 'Begrippenlijst',
    slug: 'begrippen',
    description: 'Dating terminology explained',
    descriptionNl: 'Alle dating termen uitgelegd. Van ghosting tot breadcrumbing.',
    icon: 'BookOpen',
    color: '#F97316',
    order: 5,
    metaTitle: 'Dating Begrippen A-Z',
    metaDescription: 'Complete begrippenlijst met alle dating termen uitgelegd in begrijpelijk Nederlands.',
  },
  {
    name: 'Succesverhalen',
    nameNl: 'Succesverhalen',
    slug: 'succesverhalen',
    description: 'Real stories from our community',
    descriptionNl: 'Echte verhalen van mensen die liefde vonden via online dating.',
    icon: 'Star',
    color: '#EAB308',
    order: 6,
    metaTitle: 'Dating Succesverhalen',
    metaDescription: 'Inspirerende verhalen van mensen die liefde vonden. Lees hoe anderen het deden.',
  },
  {
    name: 'Voor Professionals',
    nameNl: 'Voor Professionals',
    slug: 'professionals',
    description: 'Resources for therapists, coaches and care workers',
    descriptionNl: 'Materiaal voor therapeuten, coaches en zorgverleners.',
    icon: 'Briefcase',
    color: '#6366F1',
    order: 7,
    isProfessionalOnly: true,
    metaTitle: 'Professionele Resources - Dating & Relaties',
    metaDescription: 'Evidence-based materiaal voor professionals in de zorg en coaching.',
  },
  {
    name: 'Tools',
    nameNl: 'Tools',
    slug: 'tools',
    description: 'Interactive tools and assessments',
    descriptionNl: 'Interactieve tools om jezelf beter te leren kennen en veiliger te daten.',
    icon: 'Wrench',
    color: '#14B8A6',
    order: 8,
    metaTitle: 'Dating Tools & Assessments',
    metaDescription: 'Gratis tools voor veilig daten. Scam checker, quizzes en meer.',
  },
]

// Sample articles for each category
const articles = [
  // VEILIGHEID
  {
    categorySlug: 'veiligheid',
    title: 'Romance Scams Herkennen: De Complete Gids',
    titleNl: 'Romance Scams Herkennen: De Complete Gids',
    slug: 'romance-scams-herkennen-complete-gids',
    excerpt: 'Learn to recognize the warning signs of romance scams',
    excerptNl: 'Leer de waarschuwingssignalen van romance scams herkennen en bescherm jezelf tegen dating fraude.',
    content: 'Complete guide content here...',
    contentNl: `# Romance Scams Herkennen

Romance scams zijn een groeiend probleem in de online dating wereld. Fraudeurs maken misbruik van mensen die op zoek zijn naar liefde.

## Wat is een Romance Scam?

Een romance scam is een vorm van fraude waarbij een crimineel zich voordoet als een romantische partner om geld of persoonlijke informatie te stelen.

## De 10 Belangrijkste Rode Vlaggen

### 1. Te mooi om waar te zijn
Het profiel lijkt perfect. Prachtige foto's, een interessant beroep, en ze zeggen precies wat je wilt horen.

### 2. Snelle liefdesverklaringen
Binnen dagen of weken worden er al sterke gevoelens uitgesproken. "Ik heb nog nooit zo'n connectie gevoeld."

### 3. Excuses om niet te videobellen
Er is altijd een reden waarom een videogesprek niet kan: slechte verbinding, kapotte camera, of werkverplichtingen.

### 4. Werkt in het buitenland
Vaak claimen ze te werken op een olieplatform, bij de VN, of als militair in het buitenland.

### 5. Financiële problemen
Na een tijdje ontstaan er "plotselinge" financiële problemen waarvoor ze hulp nodig hebben.

## Wat te Doen Als Je Slachtoffer Bent

1. **Stop direct met betalen** - Stuur geen geld meer
2. **Bewaar bewijsmateriaal** - Screenshots van gesprekken
3. **Doe aangifte** - Bij de politie en Fraudehelpdesk
4. **Zoek steun** - Praat met iemand die je vertrouwt

## Hulpbronnen

- **Fraudehelpdesk**: 088-786 73 72
- **Politie**: aangifte doen via politie.nl
- **Slachtofferhulp**: 0900-0101

---

*Dit artikel is geschreven door de redactie van Liefde Voor Iedereen in samenwerking met de Fraudehelpdesk.*`,
    contentEasyRead: `# Romance Scams Herkennen

## Wat is een romance scam?

Een romance scam is oplichting.
Iemand doet alsof die van je houdt.
Maar die persoon wil alleen je geld.

## Hoe herken je een scammer?

**1. Mooie foto's**
De foto's zijn heel mooi.
Soms zijn het gestolen foto's.

**2. Snel verliefd**
De persoon zegt snel "ik hou van je".
Dat is vaak nep.

**3. Geen videobellen**
De persoon wil niet videobellen.
Er is altijd een excuus.

**4. Vraagt om geld**
Na een tijdje vraagt de persoon geld.
Dit is een grote waarschuwing!

## Wat moet je doen?

- Stuur NOOIT geld
- Praat met iemand die je vertrouwt
- Bel de Fraudehelpdesk: 088-786 73 72

## Belangrijk

Je bent niet dom als je bent opgelicht.
Scammers zijn heel slim.
Vraag om hulp.`,
    articleType: 'PILLAR',
    isPillarPage: true,
    isFeatured: true,
    targetAudience: ['GENERAL', 'LVB', 'SENIOR'],
    readingLevel: 'STANDARD',
    keywords: ['romance scam', 'dating fraude', 'oplichting', 'veilig daten', 'rode vlaggen'],
    metaTitle: 'Romance Scams Herkennen - Complete Gids 2025',
    metaDescription: 'Leer romance scams herkennen met onze complete gids. 10 rode vlaggen, tips en hulpbronnen.',
  },
  {
    categorySlug: 'veiligheid',
    title: 'Veilig Afspreken: De Ultieme Checklist',
    titleNl: 'Veilig Afspreken: De Ultieme Checklist',
    slug: 'veilig-afspreken-checklist',
    excerpt: 'Essential checklist for safe first dates',
    excerptNl: 'De essentiële checklist voor een veilige eerste date. Van locatie kiezen tot thuiskomen.',
    content: 'Checklist content...',
    contentNl: `# Veilig Afspreken: De Ultieme Checklist

Een eerste date is spannend! Met deze checklist zorg je dat het ook veilig is.

## Voor de Date

- [ ] Vertel iemand waar je heen gaat
- [ ] Deel je locatie via je telefoon
- [ ] Kies een openbare plek
- [ ] Regel je eigen vervoer
- [ ] Laad je telefoon volledig op

## Tijdens de Date

- [ ] Blijf op de afgesproken locatie
- [ ] Drink met mate
- [ ] Laat je drankje niet onbeheerd
- [ ] Vertrouw op je gevoel

## Na de Date

- [ ] Laat weten dat je veilig thuis bent
- [ ] Ga alleen mee als JIJ dat wilt
- [ ] Het is OK om nee te zeggen

## Red Flags Tijdens de Date

Let op deze waarschuwingssignalen:

- Dringt aan om ergens anders heen te gaan
- Negeert je grenzen
- Liegt over basale zaken
- Stelt ongepaste vragen over je financiën`,
    articleType: 'CHECKLIST',
    isFeatured: true,
    targetAudience: ['GENERAL'],
    readingLevel: 'EASY',
    keywords: ['veilig daten', 'eerste date', 'checklist', 'dating tips'],
  },

  // INCLUSIEF DATEN
  {
    categorySlug: 'inclusief-daten',
    title: 'Daten met Autisme: Praktische Gids',
    titleNl: 'Daten met Autisme: Praktische Gids',
    slug: 'daten-met-autisme-gids',
    excerpt: 'Practical dating guide for people on the autism spectrum',
    excerptNl: 'Praktische tips voor daten als je autisme hebt. Sociale signalen, sensorische overwegingen en meer.',
    content: 'Autism dating guide...',
    contentNl: `# Daten met Autisme: Praktische Gids

Dating kan uitdagend zijn voor iedereen, maar als je autisme hebt komen er extra overwegingen bij kijken. Deze gids helpt je navigeren door de dating wereld.

## Sociale Signalen Begrijpen

### Non-verbale communicatie

- **Oogcontact**: Je hoeft niet constant oogcontact te maken. Af en toe is genoeg.
- **Lichaamstaal**: Let op of iemand naar je toe leunt (interesse) of wegdraait (minder interesse).
- **Gezichtsuitdrukkingen**: Een glimlach betekent meestal dat het goed gaat.

### Gesprekstips

- Het is OK om te zeggen dat je autisme hebt
- Vraag om verduidelijking als je iets niet begrijpt
- Neem pauzes als je ze nodig hebt

## Sensorische Overwegingen

### Date Locaties Kiezen

Kies locaties waar je je comfortabel voelt:

- **Rustige cafés** in plaats van drukke bars
- **Buitenactiviteiten** als je dat prettiger vindt
- **Bekende plekken** waar je je op je gemak voelt

### Wanneer het te veel wordt

- Plan een "ontsnappingsroute"
- Het is OK om te zeggen dat je rust nodig hebt
- Korte eerste dates zijn prima

## Disclosure: Wanneer Vertel Je Het?

Er is geen goed of fout moment. Opties:

1. **In je profiel** - Filtert mensen die er niet mee kunnen omgaan
2. **Bij het eerste contact** - Eerlijk en direct
3. **Tijdens de eerste date** - Als het natuurlijk ter sprake komt
4. **Later** - Als je de persoon beter kent

## Tips van Anderen met Autisme

> "Ik vertel het altijd vooraf. Dan weten ze wat ze kunnen verwachten en voel ik minder druk."

> "Ik plan dates op plekken die ik goed ken. Dat geeft rust."`,
    articleType: 'GUIDE',
    isPillarPage: true,
    isFeatured: true,
    targetAudience: ['AUTISM', 'GENERAL'],
    readingLevel: 'STANDARD',
    keywords: ['autisme', 'asd', 'daten', 'neurodivergent', 'dating tips'],
    metaTitle: 'Daten met Autisme - Praktische Gids & Tips',
    metaDescription: 'Complete gids voor daten met autisme. Sociale signalen, sensorische tips en ervaringen.',
  },

  // BEGRIPPEN
  {
    categorySlug: 'begrippen',
    title: 'Ghosting',
    titleNl: 'Ghosting',
    slug: 'ghosting',
    excerpt: 'When someone suddenly stops all communication',
    excerptNl: 'Wanneer iemand plotseling stopt met alle communicatie zonder uitleg.',
    content: 'Ghosting explanation...',
    contentNl: `# Ghosting

## Wat is ghosting?

Ghosting is wanneer iemand plotseling alle contact verbreekt zonder uitleg. De persoon reageert niet meer op berichten, neemt de telefoon niet op, en verdwijnt als een "geest".

## Waarom doen mensen dit?

- Vermijden van confrontatie
- Weten niet hoe ze moeten afwijzen
- Verloren interesse
- Angst voor de reactie

## Hoe ga je ermee om?

1. **Het ligt niet aan jou** - Ghosting zegt meer over de ander
2. **Stuur maximaal 1-2 berichten** - Daarna is het duidelijk
3. **Geef jezelf tijd** - Het is normaal om je gekwetst te voelen
4. **Ga verder** - Investeer in mensen die wel communiceren

## Verwante begrippen

- **Zombieing**: Wanneer een ghoster na maanden weer opduikt
- **Caspering**: Vriendelijk ghosten met een vaag excuus
- **Orbiting**: Ghosten maar wel je social media volgen`,
    articleType: 'GLOSSARY',
    targetAudience: ['GENERAL'],
    readingLevel: 'EASY',
    keywords: ['ghosting', 'dating begrippen', 'communicatie'],
  },
  {
    categorySlug: 'begrippen',
    title: 'Love Bombing',
    titleNl: 'Love Bombing',
    slug: 'love-bombing',
    excerpt: 'Overwhelming someone with excessive affection',
    excerptNl: 'Iemand overspoelen met overdreven aandacht en affectie als manipulatietechniek.',
    content: 'Love bombing explanation...',
    contentNl: `# Love Bombing

## Wat is love bombing?

Love bombing is wanneer iemand je overspoelt met overdreven aandacht, complimenten en romantische gebaren. Het lijkt heel romantisch, maar het is vaak een manipulatietechniek.

## Tekenen van love bombing

- Constante berichtjes en telefoontjes
- Overdreven complimenten ("Je bent de mooiste persoon die ik ooit heb ontmoet")
- Snelle toekomstplannen ("We gaan trouwen!")
- Dure cadeaus heel vroeg in de relatie
- Wil al je tijd in beslag nemen

## Waarom is het gevaarlijk?

Love bombing is vaak de eerste fase van een ongezonde of zelfs misbruikende relatie. Na de "bombardement" fase komt vaak:

- Controlerend gedrag
- Jaloezie
- Isolatie van vrienden en familie
- Emotionele manipulatie

## Het verschil met echte liefde

| Love Bombing | Echte Liefde |
|--------------|--------------|
| Overweldigend snel | Groeit geleidelijk |
| Voelt claustrofobisch | Voelt vrij |
| Negeert grenzen | Respecteert grenzen |
| Voorwaardelijk | Onvoorwaardelijk |

## Wat te doen?

- Vertrouw op je gevoel als iets "te veel" voelt
- Neem de tijd om iemand te leren kennen
- Houd contact met vrienden en familie`,
    articleType: 'GLOSSARY',
    targetAudience: ['GENERAL'],
    readingLevel: 'STANDARD',
    keywords: ['love bombing', 'manipulatie', 'rode vlaggen', 'dating begrippen'],
  },

  // COMMUNICATIE
  {
    categorySlug: 'communicatie',
    title: 'Grenzen Stellen in Dating: Zo Doe Je Dat',
    titleNl: 'Grenzen Stellen in Dating: Zo Doe Je Dat',
    slug: 'grenzen-stellen-dating',
    excerpt: 'How to set healthy boundaries while dating',
    excerptNl: 'Leer hoe je gezonde grenzen stelt zonder je schuldig te voelen.',
    content: 'Boundaries guide...',
    contentNl: `# Grenzen Stellen in Dating

Grenzen stellen is essentieel voor gezonde relaties. Het is geen teken van afwijzing, maar van zelfrespect.

## Wat zijn grenzen?

Grenzen zijn de limieten die je stelt om je fysieke, emotionele en mentale welzijn te beschermen.

## Soorten grenzen

### Fysieke grenzen
- Wanneer en hoe je aangeraakt wilt worden
- Je persoonlijke ruimte
- Seksuele grenzen

### Emotionele grenzen
- Welke onderwerpen je wel/niet wilt bespreken
- Hoeveel tijd je samen doorbrengt
- Hoe vaak je contact hebt

### Digitale grenzen
- Wie toegang heeft tot je sociale media
- Hoe snel je reageert op berichten
- Wat je wel/niet online deelt

## Hoe stel je grenzen?

### De DEAR MAN techniek

- **D**escribe: Beschrijf de situatie
- **E**xpress: Uit je gevoel
- **A**ssert: Zeg wat je wilt
- **R**einforce: Benoem het voordeel

Voorbeeld: "Ik merk dat je vaak belt als ik aan het werk ben (D). Dat vind ik stressvol (E). Ik zou graag willen dat we afspraken maken over beltijden (A). Dan kan ik me ook beter op jou focussen als we bellen (R)."

## Grenzen en schuldgevoel

Het is normaal om je schuldig te voelen als je grenzen stelt. Onthoud:

- Je grenzen zijn geldig
- "Nee" is een volledige zin
- Iemand die je grenzen niet respecteert, verdient je tijd niet`,
    articleType: 'GUIDE',
    isFeatured: true,
    targetAudience: ['GENERAL'],
    readingLevel: 'STANDARD',
    keywords: ['grenzen stellen', 'assertiviteit', 'gezonde relatie', 'communicatie'],
  },
]

// Tools
const tools = [
  {
    name: 'Scam Checker',
    nameNl: 'Scam Checker',
    slug: 'scam-checker',
    description: 'Analyze messages for potential scam patterns and red flags',
    toolType: 'CHECKER',
    config: {
      minLength: 10,
      maxLength: 10000,
    },
    externalUrl: 'https://datingassistent.nl/scam-checker?ref=lvi',
  },
  {
    name: 'Love Language Quiz',
    nameNl: 'Liefdetaal Quiz',
    slug: 'liefdetaal-quiz',
    description: 'Discover your primary love language',
    toolType: 'QUIZ',
    config: {
      questions: 30,
      categories: ['words', 'acts', 'gifts', 'time', 'touch'],
    },
    externalUrl: 'https://datingassistent.nl/liefdetaal?ref=lvi',
  },
  {
    name: 'Dating Readiness Assessment',
    nameNl: 'Dating Readiness Test',
    slug: 'dating-readiness',
    description: 'Check if you are ready to start dating',
    toolType: 'ASSESSMENT',
    config: {
      questions: 20,
    },
  },
  {
    name: 'Red Flag Checker',
    nameNl: 'Rode Vlaggen Checker',
    slug: 'rode-vlaggen-checker',
    description: 'Evaluate potential red flags in a relationship',
    toolType: 'CHECKER',
    config: {
      categories: ['communication', 'respect', 'trust', 'control'],
    },
  },
]

async function main() {
  console.log('🌱 Starting Kennisbank seed...')

  // Get or create admin user for articles
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!adminUser) {
    console.log('⚠️ No admin user found. Creating placeholder...')
    adminUser = await prisma.user.create({
      data: {
        email: 'redactie@liefdevooridereen.nl',
        name: 'Redactie',
        role: 'ADMIN',
        passwordHash: 'placeholder-not-for-login',
      },
    })
  }

  // Create categories
  console.log('📁 Creating categories...')
  for (const cat of categories) {
    const existing = await prisma.knowledgeBaseCategory.findUnique({
      where: { slug: cat.slug },
    })

    if (!existing) {
      await prisma.knowledgeBaseCategory.create({
        data: {
          ...cat,
          isVisible: true,
          isProfessionalOnly: cat.isProfessionalOnly || false,
        },
      })
      console.log(`  ✓ Created category: ${cat.nameNl}`)
    } else {
      console.log(`  - Category exists: ${cat.nameNl}`)
    }
  }

  // Create articles
  console.log('📝 Creating articles...')
  for (const article of articles) {
    const existing = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: article.slug },
    })

    if (!existing) {
      const category = await prisma.knowledgeBaseCategory.findUnique({
        where: { slug: article.categorySlug },
      })

      if (category) {
        await prisma.knowledgeBaseArticle.create({
          data: {
            title: article.title,
            titleNl: article.titleNl,
            slug: article.slug,
            excerpt: article.excerpt,
            excerptNl: article.excerptNl,
            content: article.content,
            contentNl: article.contentNl,
            contentEasyRead: article.contentEasyRead || null,
            hasEasyRead: !!article.contentEasyRead,
            categoryId: category.id,
            articleType: article.articleType as any || 'STANDARD',
            isPillarPage: article.isPillarPage || false,
            isFeatured: article.isFeatured || false,
            targetAudience: article.targetAudience as any[] || ['GENERAL'],
            readingLevel: article.readingLevel as any || 'STANDARD',
            keywords: article.keywords || [],
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            isPublished: true,
            publishedAt: new Date(),
            authorId: adminUser.id,
          },
        })
        console.log(`  ✓ Created article: ${article.titleNl}`)
      }
    } else {
      console.log(`  - Article exists: ${article.titleNl}`)
    }
  }

  // Create tools
  console.log('🔧 Creating tools...')
  for (const tool of tools) {
    const existing = await prisma.knowledgeBaseTool.findUnique({
      where: { slug: tool.slug },
    })

    if (!existing) {
      await prisma.knowledgeBaseTool.create({
        data: {
          name: tool.name,
          nameNl: tool.nameNl,
          slug: tool.slug,
          description: tool.description,
          toolType: tool.toolType as any,
          config: tool.config,
          externalUrl: tool.externalUrl || null,
          isActive: true,
        },
      })
      console.log(`  ✓ Created tool: ${tool.nameNl}`)
    } else {
      console.log(`  - Tool exists: ${tool.nameNl}`)
    }
  }

  console.log('')
  console.log('✅ Kennisbank seed completed!')
  console.log('')
  console.log('Summary:')
  const catCount = await prisma.knowledgeBaseCategory.count()
  const artCount = await prisma.knowledgeBaseArticle.count()
  const toolCount = await prisma.knowledgeBaseTool.count()
  console.log(`  📁 Categories: ${catCount}`)
  console.log(`  📝 Articles: ${artCount}`)
  console.log(`  🔧 Tools: ${toolCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
