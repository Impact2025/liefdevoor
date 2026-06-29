// Create 5 LVB-focused blog posts for liefdevooriedereen.nl
// Spread between 1 Jun 2026 and 31 Jul 2026
// Focused on dating with mild intellectual disability (LVB)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Category IDs from the database
const CATEGORIES = {
  DATE_TIPS: 'cmjmi6w910000muaa8e4is1p0',
  RELATIE_ADVIES: 'cmjmi6w910001muaay1zn2d6t',
  DATING_STORIES: 'cmjmi6w910002muaavx62lgfu',
  LIFESTYLE: 'cmjmi6w920003muaawg4imwhd',
  PSYCHOLOGIE: 'cmjmi6w920004muaarecos10v',
  DATING_TIPS: 'cmk19r5di0000amufkwkhhtj6',
  VEILIGHEID: 'cmk19r5lj0003amuf328whxhm',
  SUCCESVERHALEN: 'cmk19r5qm0008amufplz28bf4',
}

const ADMIN_ID = 'cmjkyvwx0000013bukgrwpkuh'
const SITE_URL = 'https://www.liefdevooriedereen.nl'

const posts = [
  // ===== 1. LVB Veilig chatten (Veiligheid) - 1 jun 2026 =====
  {
    title: 'Veilig chatten op een datingsite als je LVB hebt: 10 regels',
    slug: 'veilig-chatten-lvb-10-regels',
    excerpt: 'Chatten op een datingsite is leuk, maar je moet wel opletten. Met deze 10 regels blijf jij veilig, ook als je LVB hebt.',
    content: `<h1>Veilig chatten op een datingsite als je LVB hebt: 10 regels</h1>

<p>Je hebt een profiel aangemaakt en je krijgt berichtjes. Spannend! Maar hoe weet je of iemand te vertrouwen is? En wat deel je wel en niet in een gesprek?</p>

<p>Bij Liefde Voor Iedereen vinden we veiligheid het allerbelangrijkst. Daarom hebben we deze 10 regels voor veilig chatten opgeschreven — in duidelijke taal, zonder moeilijke woorden.</p>

<h2>Regel 1: Deel nooit je adres</h2>
<p>Ook niet als iemand aardig lijkt. Je adres geef je pas als je iemand goed kent. En dan nog: spreek liever eerst af op een openbare plek. Lees ook onze <a href="/veilig-daten-lvb">veiligheidstips voor daten met LVB</a>.</p>

<h2>Regel 2: Stuur geen geld</h2>
<p>Dit is de belangrijkste regel: stuur nooit geld naar iemand die je online hebt ontmoet. Ook niet als diegene een mooi verhaal vertelt. Echte liefde vraagt geen geld. Twijfel je? Overleg dan met je begeleider of bel Slachtofferhulp via 0900-0101.</p>

<h2>Regel 3: Blijf op het platform</h2>
<p>Praat via de chat van Liefde Voor Iedereen. Als iemand snel naar WhatsApp of Snapchat wil, is dat vaak een alarmsignaal. Op ons platform zijn gesprekken veilig en kunnen wij helpen als er iets misgaat.</p>

<h2>Regel 4: Vraag om een nieuwe foto</h2>
<p>Twijfel je of iemand echt is? Vraag dan om een nieuwe foto, bijvoorbeeld met een briefje met de datum erop. Een echt persoon kan dat maken, een nep-profiel niet. Bij een profiel met een <strong>blauw vinkje</strong> weet je zeker dat het is gecontroleerd.</p>

<h2>Regel 5: Laat je begeleider meelezen</h2>
<p>Je begeleider mag altijd meekijken met je gesprekken. Samen zie je meer dan alleen. Als je twijfelt over een bericht: stuur het door aan iemand die je vertrouwt. Op <a href="https://www.bijeen.app" target="_blank" rel="noopener">bijeen.app</a> vind je ook professionals die je hierbij kunnen helpen.</p>

<h2>Regel 6: Neem de tijd</h2>
<p>Iemand die het goed met je voorheeft, heeft geen haast. Als iemand meteen heel close wil zijn of snel wil afspreken: doe het rustig aan. Echte liefde heeft geduld. Neem ook eens een kijkje in onze <a href="/kennisbank">kennisbank</a> voor meer tips.</p>

<h2>Regel 7: Vertrouw op je gevoel</h2>
<p>Voelt iets niet goed? Dan is het vaak ook niet goed. Je mag altijd stoppen met een gesprek, ook zonder uitleg. Blokkeren kan met één klik op de rode knop.</p>

<h2>Regel 8: Geen gekke vragen over foto's</h2>
<p>Als iemand vraagt om foto's waarop je weinig aan hebt: niet doen. Iemand die echt van je houdt, vraagt dat niet. Rapporteer dit meteen bij ons.</p>

<h2>Regel 9: Check of verhalen kloppen</h2>
<p>Vertelt iemand steeds andere dingen? Of kloppen data niet? Dat is een alarmsignaal. Vraag door of overleg met je begeleider. Bij een blauw vinkje is het profiel al door ons gecontroleerd.</p>

<h2>Regel 10: Praat erover</h2>
<p>Daten is leuk, maar ook spannend. Praat erover met vrienden, familie of je begeleider. Je hoeft het niet alleen te doen. En als je vragen hebt: ons <a href="/support/faq">FAQ-team</a> staat voor je klaar.</p>

<p>Onthoud: veilig daten is fijn daten. Bij Liefde Voor Iedereen zorgen wij dat jij je veilig voelt. Vanaf het eerste berichtje tot jullie eerste ontmoeting.</p>`,

    categoryId: CATEGORIES.VEILIGHEID,
    publishedAt: '2026-06-01T10:00:00.000Z',
    seoTitle: 'Veilig Chatten met LVB: 10 Belangrijke Regels',
    seoDescription: 'Veilig chatten op een datingsite met LVB. 10 duidelijke regels: geen geld sturen, begeleider mag meelezen, blijf op het platform en vertrouw op je gevoel.',
    keywords: ['veilig chatten', 'chatten met lvb', 'dating veiligheid lvb', 'online chatten lvb', 'veilige datingchat', 'lvb chatregels', 'veilig daten tips'],
  },

  // ===== 2. Begeleider helpt bij daten (Relatie Advies) - 15 jun 2026 =====
  {
    title: 'Zo helpt een begeleider bij het daten (zonder dat het ongemakkelijk wordt)',
    slug: 'begeleider-helpt-bij-daten-lvb',
    excerpt: 'Je begeleider mag meedenken bij het daten, maar hoe doe je dat zonder dat het voelt alsof hij of zij overal bij is? Wij leggen het uit.',
    content: `<h1>Zo helpt een begeleider bij het daten (zonder dat het ongemakkelijk wordt)</h1>

<p>Je wilt daten, maar je vindt het spannend. Of je begeleider zegt: "laat mij je helpen." Hoe pak je dat aan zonder dat het ongemakkelijk voelt? Goed nieuws: het kan gewoon op een fijne manier.</p>

<h2>Wat mag een begeleider doen?</h2>
<p>Op Liefde Voor Iedereen mag een begeleider:<br>
- Helpen met het aanmaken van je profiel<br>
- Meekijken of een bericht duidelijk is<br>
- Tips geven over wie er bij je past<br>
- Meegaan naar een eerste afspraak (als jij dat wilt)</p>

<p>Wat de begeleider niet mag: zélf berichten sturen alsof hij of zij jou is. Jij blijft de baas over jouw account. Lees ook onze <a href="/veilig-daten-lvb">pagina over veilig daten met LVB</a> voor meer informatie.</p>

<h2>Hoe blijf jij de baas?</h2>
<p>Drie simpele afspraken die helpen:</p>
<ul>
  <li><strong>Jij beslist</strong> — je begeleider geeft alleen advies</li>
  <li><strong>Jij stuurt de berichten</strong> — je begeleider kijkt alleen mee</li>
  <li><strong>Jij bepaalt wie er mee gaat</strong> — naar een date hoeft alleen wie jij wilt</li>
</ul>

<h2>Praktisch: hoe regel je het?</h2>
<p>Maak samen een vast moment in de week om profielen te bekijken. Bijvoorbeeld een half uurtje op dinsdagavond. Dan blijft het gezellig en niet te veel. En als je liever alleen chat: dat mag ook. Je begeleider kan op afstand helpen en hoeft niet overal bij te zijn.</p>

<p>Tip: lees ook onze <a href="/kennisbank/tools/red-flag-checklist">red flag checklist</a> — die kun je samen doornemen.</p>

<h2>Kan mijn begeleider mij helpen met veiligheid?</h2>
<p>Zeker. Een begeleider kan:<br>
- Checken of een profiel er betrouwbaar uitziet<br>
- Meelezen met berichten die je niet vertrouwt<br>
- Helpen herkennen van <a href="/kennisbank/veiligheid/romance-scams-herkennen">romance scams</a><br>
- Je geruststellen als je zenuwachtig bent</p>

<p>Wil je meer weten over hoe je veilig datet? Op <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> delen we ook ervaringen over begeleiding bij daten.</p>

<p>Onthoud: een begeleider is er om jou te helpen, niet om over te nemen. Jij zoekt de liefde — hij of zij loopt alleen even mee.</p>`,

    categoryId: CATEGORIES.RELATIE_ADVIES,
    publishedAt: '2026-06-15T10:00:00.000Z',
    seoTitle: 'Begeleider Helpt bij Daten met LVB | Praktische Tips',
    seoDescription: 'Hoe helpt een begeleider bij daten met LVB? Jij blijft de baas, hij of zij denkt mee. Praktische tips voor begeleiders en mensen met LVB.',
    keywords: ['daten met begeleiding', 'begeleider daten lvb', 'lvb begeleider dating', 'zorgbegeleider daten', 'ondersteuning daten lvb', 'daten met ondersteuning'],
  },

  // ===== 3. LVB dating profiel maken (Dating Tips) - 29 jun 2026 =====
  {
    title: 'Een goed profiel maken op een datingsite: zo doe je dat (LVB)',
    slug: 'goed-profiel-maken-datingsite-lvb',
    excerpt: 'Een profiel maken op een datingsite is makkelijk met deze stappen. Grote knoppen, simpele vragen — jij kunt het!',
    content: `<h1>Een goed profiel maken op een datingsite: zo doe je dat (LVB)</h1>

<p>Je wilt een profiel maken op Liefde Voor Iedereen, maar je weet niet zo goed wat je moet schrijven. Dat is heel normaal. Veel mensen vinden dat spannend. Geen zorgen: wij helpen jou stap voor stap.</p>

<h2>Stap 1: Kies een leuke foto</h2>
<p>Een foto is niet verplicht, maar het helpt wel. Kies een foto waarop je lacht en die er netjes uitziet. Vraag iemand om een foto van jou te maken. Liever geen selfie in de sportschool of met een biertje — tenzij dat echt bij je hoort natuurlijk!</p>

<p>Heb je geen goede foto? Vraag je <a href="/begeleider-helpt-bij-daten-lvb">begeleider</a> om te helpen.</p>

<h2>Stap 2: Schrijf iets over jezelf</h2>
<p>Houd het simpel. Schrijf bijvoorbeeld:<br>
- Waar je woont<br>
- Wat je leuk vindt om te doen<br>
- Wat voor iemand je zoekt</p>

<p>Een voorbeeld: "Ik ben Tim, 28 jaar uit Eindhoven. Ik hou van voetbal kijken en wandelen. Ik zoek een lieve meid om leuke dingen mee te doen."</p>

<p>Zie je? Meer heb je niet nodig!</p>

<h2>Stap 3: Vertel wat je zoekt</h2>
<p>Zoek je een vriend of vriendin? Of een relatie? Of eerst gewoon iemand om mee te chatten? Dat mag allemaal. Schrijf het gewoon in je profiel. Dan weten mensen meteen wat ze van je kunnen verwachten.</p>

<h2>Stap 4: Vink het blauwe vinkje aan</h2>
<p>Op Liefde Voor Iedereen controleren wij elk profiel. Zodra jouw profiel is goedgekeurd, krijg je een blauw vinkje. Andere leden zien dan dat jij echt bent. Dat geeft vertrouwen.</p>

<h2>Voorbeelden van een goed profiel</h2>
<p><strong>Voorbeeld 1 — kort:</strong><br>
"Ik ben Sanne, 24 jaar, uit Utrecht. Ik werk in de supermarkt. In mijn vrije tijd kook ik graag en kijk ik series. Ik zoek een leuke man om mee te daten."</p>

<p><strong>Voorbeeld 2 — uitgebreider:</strong><br>
"Kevin, 25 jaar, Tilburg. Ik hou van gamen en naar de film gaan. Ik zoek vrienden en misschien wel een vriendin. Ik heb LVB, maar dat maakt mij niet anders dan anderen. Stuur gerust een berichtje!"</p>

<h2>Wat je beter niet kunt doen</h2>
<ul>
  <li>Geen negatieve dingen schrijven over je ex</li>
  <li>Niet te veel willen vertellen in één keer</li>
  <li>Geen foto's van vroeger gebruiken (gebruik een recente foto)</li>
  <li>Niet zeggen dat je eenzaam bent (dat trekt verkeerde mensen aan)</li>
</ul>

<p>Wil je meer datingtips? Bekijk ook <a href="/kennisbank">onze kennisbank</a> voor meer hulp. En vergeet niet: op Liefde Voor Iedereen doet iedereen mee, precies zoals je bent.</p>`,

    categoryId: CATEGORIES.DATING_TIPS,
    publishedAt: '2026-06-29T10:00:00.000Z',
    seoTitle: 'Profiel Maken op Datingsite met LVB: Stappenplan',
    seoDescription: 'Stap voor stap een datingsite profiel maken als je LVB hebt. Simpele uitleg, voorbeelden en tips voor een goed profiel op Liefde Voor Iedereen.',
    keywords: ['profiel maken', 'datingsite profiel', 'lvb profiel', 'datingsite aanmelden', 'profiel tips lvb', 'dating profiel voorbeeld', 'profiel aanmaken dategsite'],
  },

  // ===== 4. Eerste date met LVB: wat moet je weten? (Date Tips) - 13 jul 2026 =====
  {
    title: 'Eerste date als je LVB hebt: 7 praktische tips',
    slug: 'eerste-date-lvb-7-tips',
    excerpt: 'Je eerste date is spannend, helemaal als je LVB hebt. Met deze 7 tips ga je ontspannen op date en weet je wat je kunt verwachten.',
    content: `<h1>Eerste date als je LVB hebt: 7 praktische tips</h1>

<p>Je hebt leuke gesprekken gehad in de chat. Nu wordt het echt: jullie gaan afspreken! Een eerste date is spannend voor iedereen. Dat is heel normaal. Maar deze tips helpen je om er een leuke dag van te maken.</p>

<h2>Tip 1: Kies een vertrouwde plek</h2>
<p>Spreek af op een plek die je kent. Bijvoorbeeld het café bij jou in de buurt, de bioscoop waar je vaker komt of het winkelcentrum. Een bekende plek voelt veiliger en dan kun je beter genieten van de date. Op <a href="/veilig-daten-lvb">onze LVB-pagina</a> vind je nog meer veiligheidstips.</p>

<h2>Tip 2: Vertel iemand waar je bent</h2>
<p>Laat je begeleider, je moeder of een vriend weten waar je naartoe gaat en hoe laat je ongeveer klaar bent. Stuur een berichtje als je weer thuis bent. Zo weet iemand anders waar je bent en voelt dat veilig.</p>

<h2>Tip 3: Regel je eigen vervoer</h2>
<p>Ga op eigen gelegenheid naar de date. Met de bus, de fiets of lopend. Dan kun je zelf weggaan wanneer jij wilt. Niet meerijden met iemand die je nog niet goed kent.</p>

<h2>Tip 4: Kies een korte date</h2>
<p>Een eerste date hoeft niet uren te duren. Een kop koffie of een wandeling van een half uur is genoeg. Als het gezellig is, kun je altijd langer blijven. Als het niet klikt, ben je snel thuis.</p>

<h2>Tip 5: Neem een eigen telefoon mee</h2>
<p>Zorg dat je telefoon vol is en meeneemt. Dan kun je altijd iemand bellen als dat nodig is. Zet een noodcontact in je telefoon die je kunt bellen als het niet goed voelt.</p>

<h2>Tip 6: Luister naar je gevoel</h2>
<p>Dit is de allerbelangrijkste tip. Als iets niet goed voelt, dan is het ook niet goed. Je mag altijd weggaan. Ook al zit de date pas 5 minuten. Je hoeft geen sorry te zeggen. Jouw veiligheid is het belangrijkst.</p>

<h2>Tip 7: Wees eerlijk over LVB</h2>
<p>Je mag best vertellen dat je LVB hebt. Iemand die het waard is, accepteert je zoals je bent. Je kunt het simpel zeggen: "Ik heb iets meer tijd nodig om dingen te begrijpen, is dat oké?" Meestal zegt iemand dan: "Natuurlijk, geen probleem."</p>

<h2>Wat neem je mee naar een date?</h2>
<ul>
  <li>Je telefoon (opgeladen!)</li>
  <li>Een beetje geld of je pinpas</li>
  <li>Je ov-kaart of fietssleutel</li>
  <li>Een goed gevoel</li>
</ul>

<p>Lees ook onze <a href="/kennisbank/veiligheid/romance-scams-herkennen">tips over het herkennen van romance scams</a> zodat je weet waar je op moet letten. En vergeet niet: daten is vooral leuk! Geniet ervan.</p>`,

    categoryId: CATEGORIES.DATE_TIPS,
    publishedAt: '2026-07-13T10:00:00.000Z',
    seoTitle: 'Eerste Date met LVB: 7 Praktische Tips',
    seoDescription: 'Ga jij voor het eerst op date met LVB? 7 tips die je helpen: kies een bekende plek, vertel iemand waar je bent en luister naar je gevoel. Veilig daten begint hier.',
    keywords: ['eerste date lvb', 'date met beperking', 'veilige date lvb', 'daten met lvb tips', 'date afspraak lvb', 'eerste date tips beperking', 'lvb dating'],
  },

  // ===== 5. Vrienden maken via datingsite (Lifestyle) - 27 jul 2026 =====
  {
    title: 'Vrienden maken via een datingsite: kan dat als je LVB hebt?',
    slug: 'vrienden-maken-datingsite-lvb',
    excerpt: 'Niet iedereen zoekt direct de liefde. Ook vriendschap vinden via een datingsite is mogelijk — zeker als je LVB hebt. Lees hoe.',
    content: `<h1>Vrienden maken via een datingsite: kan dat als je LVB hebt?</h1>

<p>Wist je dat veel mensen op Liefde Voor Iedereen niet direct een relatie zoeken? Ze willen eerst vrienden maken. Of gewoon leuke gesprekken hebben. Dat mag allemaal!</p>

<p>Voor mensen met LVB kan het lastig zijn om nieuwe mensen te leren kennen. Misschien zit je niet op een sportclub of vind je het eng om naar een vereniging te gaan. Een datingsite is dan een fijne manier om toch nieuwe mensen te ontmoeten.</p>

<h2>Waarom vrienden zoeken via een datingsite?</h2>
<ul>
  <li><strong>Veilig</strong> — alle profielen worden gecontroleerd</li>
  <li><strong>Vanaf de bank</strong> — je hoeft niet naar een drukke plek</li>
  <li><strong>Op jouw tempo</strong> — je kunt eerst chatten voordat je afspreekt</li>
  <li><strong>Zelf kiezen</strong> — jij bepaalt met wie je praat</li>
</ul>

<p>Op <a href="/veilig-daten-lvb">onze speciale LVB-pagina</a> lees je waarom wij het veiligste platform zijn om nieuwe mensen te ontmoeten.</p>

<h2>Zo schrijf je in je profiel dat je vrienden zoekt</h2>
<p>Maak het duidelijk in je profiel. Schrijf bijvoorbeeld:<br>
"Ik zoek vooral vrienden om mee te kletsen en leuke dingen te doen."<br>
Of: "Ik sta open voor alles, maar ik wil eerst iemand leren kennen als vriend."</p>

<p>Veel mensen waarderen het als je eerlijk bent over wat je zoekt. Zo voorkom je verwarring.</p>

<h2>Hoe herken je mensen die ook vrienden zoeken?</h2>
<p>Let op deze dingen in een profiel:<br>
- Ze zeggen dat ze "open staan voor vriendschap"<br>
- Ze stellen vragen over jouw hobby's (niet alleen over relaties)<br>
- Ze zijn geduldig en dringen niet aan om snel af te spreken</p>

<h2>Van chat naar echte vriendschap</h2>
<p>Als je een tijdje chat en het voelt goed, kun je afspreken. Kies een veilige, drukke plek. Vertel iemand waar je bent. Je kunt ook samen met een vriend(in) gaan, dat is vaak minder spannend.</p>

<p>Tip: lees ook de <a href="/eerste-date-lvb-7-tips">7 tips voor een eerste date met LVB</a> — die tips werken ook voor vriendschap!</p>

<h2>Wat als iemand toch meer wil?</h2>
<p>Het kan gebeuren dat iemand verliefd op je wordt terwijl jij alleen vriendschap zoekt. Wees dan aardig maar duidelijk: "Ik vind je leuk als vriend, maar ik wil geen relatie." Echte vrienden respecteren dat.</p>

<p>Bij Liefde Voor Iedereen mag je zijn wie je bent — of je nou de liefde zoekt of gewoon een maatje om mee te kletsen. <a href="/register?source=lvb">Maak gratis een profiel aan</a> en ontdek hoeveel leuke mensen er zijn.</p>`,

    categoryId: CATEGORIES.LIFESTYLE,
    publishedAt: '2026-07-27T10:00:00.000Z',
    seoTitle: 'Vrienden Maken via Datingsite met LVB: Zo Doe Je Dat',
    seoDescription: 'Ook vriendschap vinden via een datingsite als je LVB hebt. Veilig, vanaf de bank en op jouw tempo. Ontdek hoe het werkt op Liefde Voor Iedereen.',
    keywords: ['vrienden maken lvb', 'vriendschap datingsite', 'vrienden zoeken datingsite', 'lvb vrienden', 'sociale contacten lvb', 'vrienden dating', 'eenzaamheid lvb'],
  },
]

async function main() {
  console.log(`📝 Starting to create ${posts.length} LVB-focused blog posts...`)

  for (const post of posts) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`⏭️  Skipping \"${post.title}\" — already exists (slug: ${post.slug})`)
      continue
    }

    const publishedDate = new Date(post.publishedAt)

    const created = await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content.trim(),
        excerpt: post.excerpt,
        published: true,
        showOnMainBlog: true,
        publishedAt: publishedDate,
        createdAt: publishedDate,
        authorId: ADMIN_ID,
        categoryId: post.categoryId,
        keywords: post.keywords,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        aiOptimized: false,
      }
    })

    console.log(`✅ Created: \"${post.title}\" — ${publishedDate.toLocaleDateString('nl-NL')}`)
  }

  const total = await prisma.post.count({ where: { published: true } })
  console.log(`\n📊 Total published posts: ${total}`)
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
