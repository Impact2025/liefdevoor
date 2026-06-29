// Create 5 ADHD/HSP-focused blog posts for liefdevooriedereen.nl
// Spread between 1 Aug 2026 and 30 Sep 2026
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = {
  DATE_TIPS: 'cmjmi6w910000muaa8e4is1p0',
  RELATIE_ADVIES: 'cmjmi6w910001muaay1zn2d6t',
  DATING_TIPS: 'cmk19r5di0000amufkwkhhtj6',
  PSYCHOLOGIE: 'cmjmi6w920004muaarecos10v',
  VEILIGHEID: 'cmk19r5lj0003amuf328whxhm',
  LIFESTYLE: 'cmjmi6w920003muaawg4imwhd',
  SUCCESVERHALEN: 'cmk19r5qm0008amufplz28bf4',
}

const ADMIN_ID = 'cmjkyvwx0000013bukgrwpkuh'
const SITE_URL = 'https://www.liefdevooriedereen.nl'

const posts = [
  {
    title: 'ADHD en daten: waarom jouw brein anders werkt (en waarom dat oké is)',
    slug: 'adhd-daten-brein-werkt-anders',
    excerpt: 'Daten met ADHD brengt uitdagingen, maar ook superkrachten. Leer waarom jouw ADHD-brein anders werkt — en hoe je dat inzet bij het daten.',
    content: `<h1>ADHD en daten: waarom jouw brein anders werkt (en waarom dat oké is)</h1>

<p>Je bent enthousiast, je hebt een klik, je berichten sturen vliegt heen en weer. En dan — ineens — ben je de draad kwijt. Je vergeet te antwoorden. Je raakt afgeleid. De ander denkt dat je niet geïnteresseerd bent.</p>

<p>Herkenbaar? Dit is geen onverschilligheid. Dit is hoe een ADHD-brein werkt. En als je dat eenmaal begrijpt, kun je er ook mee daten.</p>

<h2>Hoe werkt een ADHD-brein bij daten?</h2>
<p>Mensen met ADHD hebben een brein dat anders omgaat met dopamine, focus en impulsiviteit. Bij daten betekent dat:</p>
<ul>
  <li><strong>Hyperfocus:</strong> je kunt je helemaal verliezen in een nieuwe date — tot je opeens op iets anders zit</li>
  <li><strong>Vergeten te reageren:</strong> niet omdat je niet geïnteresseerd bent, maar omdat je brein andere prioriteiten stelt</li>
  <li><strong>Impulsiviteit:</strong> je zegt snel ja tegen een date, zonder erover na te denken</li>
  <li><strong>Emotionele intensiteit:</strong> je voelt alles sterker — verliefdheid, afwijzing, blijdschap</li>
</ul>

<p>Op <a href="/daten-adhd-hsp">onze ADHD & HSP-pagina</a> lees je waarom wij hier speciaal aandacht aan besteden.</p>

<h2>De superkrachten van ADHD bij daten</h2>
<p>ADHD is niet alleen maar lastig. Het geeft ook voordelen:</p>
<ul>
  <li><strong>Creativiteit:</strong> je bedenkt de beste date-ideeën en origineelste openingszinnen</li>
  <li><strong>Enthousiasme:</strong> jouw energie werkt aanstekelijk — mensen vinden dat aantrekkelijk</li>
  <li><strong>Eerlijkheid:</strong> je kunt slecht toneelspelen, dus wat je zegt is echt</li>
  <li><strong>Diepgang:</strong> je gaat snel van smalltalk naar echte gesprekken</li>
</ul>

<h2>5 tips voor daten met ADHD</h2>
<ol>
  <li><strong>Gebruik hyperfocus in je voordeel</strong> — plan date-avonden waarop je je helemaal op die ene persoon kunt richten</li>
  <li><strong>Zet herinneringen</strong> — een simpele reminder in je telefoon om te reageren op berichten voorkomt misverstanden</li>
  <li><strong>Kies actieve dates</strong> — wandelen, bowlen, een museum — iets waarbij je energie kwijt kunt</li>
  <li><strong>Wees eerlijk</strong> — "Ik heb ADHD, soms vergeet ik te antwoorden. Dat heeft niets met jou te maken." Werkt verrassend goed</li>
  <li><strong>Neem pauze als het teveel wordt</strong> — daten kan overweldigend zijn. Zet de app uit en kom tot rust</li>
</ol>

<p>Lees ook <a href="/blog/daten-met-adhd-tips-die-echt-werken">onze eerdere blog met 7 ADHD-date-tips</a> voor nog meer advies.</p>

<h2>Welke partner past bij jou?</h2>
<p>Mensen met ADHD floreren vaak bij een partner die:<br>
- Geduldig is en niet snel beledigd<br>
- Structuur biedt zonder controlerend te zijn<br>
- Spontaniteit waardeert<br>
- Direct communiceert (geen spelletjes!<br>
- Jouw energie begrijpt zonder het uit te willen doven</p>

<p>Op <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> lees je meer over hoe neurodiversiteit relaties beïnvloedt — wetenschappelijk onderbouwd en praktisch toepasbaar.</p>

<p>Onthoud: ADHD maakt daten niet onmogelijk. Het maakt het alleen anders. En anders is niet minder — het is gewoon wie jij bent.</p>`,

    categoryId: CATEGORIES.PSYCHOLOGIE,
    publishedAt: '2026-08-03T10:00:00.000Z',
    seoTitle: 'ADHD en Daten: Hoe Jouw Brein Werkt in de Liefde',
    seoDescription: 'Daten met ADHD: waarom jouw brein anders werkt in de liefde. Ontdek de superkrachten én uitdagingen. 5 praktische tips voor ADHD-daters.',
    keywords: ['adhd daten', 'adhd relatie', 'adhd brein liefde', 'daten met adhd tips', 'adhd en relaties', 'neurodiversiteit daten', 'adhd dating advies'],
  },

  {
    title: 'Hoogsensitief daten: 7 dingen die alleen HSPs begrijpen',
    slug: 'hoogsensitief-daten-hsp-7-dingen',
    excerpt: 'Daten als HSP is intens. Je voelt alles, je raakt snel overweldigd en smalltalk put je uit. 7 dingen die alleen hoogsensitieve daters begrijpen.',
    content: `<h1>Hoogsensitief daten: 7 dingen die alleen HSPs begrijpen</h1>

<p>Je zit tegenover een date. Het café is druk. Er staat muziek op. Mensen lopen langs. Je date vertelt een verhaal, maar jij hoort vooral de herrie. Na een half uur ben je helemaal uitgeput. De date was misschien leuk — maar je kunt niet meer.</p>

<p>Herkenbaar? Dan ben je waarschijnlijk hoogsensitief (HSP). Ongeveer 15 tot 20% van de mensen is HSP. En daten is voor ons gewoon... anders.</p>

<p>Op <a href="/daten-adhd-hsp">onze speciale HSP-pagina</a> lees je waarom wij dit begrijpen.</p>

<h2>1. Je voelt de date al voordat je gaat</h2>
<p>Al dagen van tevoren ben je ermee bezig. Wat moet je aan? Wat ga je zeggen? Je voelt de zenuwen alsof de date nu al begonnen is. HSPs beleven dingen vooruit — dat kost energie.</p>

<h2>2. Smalltalk is je grootste vijand</h2>
<p>"Hoe was je dag?" "Wat doe je voor werk?" Na drie van dit soort vragen ben je al afgehaakt. Jij wilt diepgang. Echte gesprekken. Waaróm iemand doet wat hij doet, niet alleen wát hij doet.</p>

<h2>3. Je merkt direct of er een klik is</h2>
<p>Binnen vijf minuten weet je of het iets wordt. Je voelt de energie van de ander, leest tussen de regels door en merkt of iemand echt is of een masker draagt. HSPs hebben een radar voor echtheid.</p>

<h2>4. Overprikkeling is een datingkiller</h2>
<p>Een eerste date in een lawaaierige kroeg? Liever niet. Kies een rustig café, een wandeling in het park of een museum. Jij hebt rust nodig om te kunnen connecten. Lees ook onze <a href="/blog/eerste-date-lvb-7-tips">date-tips voor rustige ontmoetingen</a>.</p>

<h2>5. Je hebt tijd nodig om bij te komen</h2>
<p>Na een date ben je niet alleen blij of teleurgesteld — je bent ook moe. Een date kost een HSP twee keer zoveel energie. Plan dus geen date op dezelfde dag als een drukke werkdag.</p>

<h2>6. Afwijzing voelt als een klap</h2>
<p>Omdat je alles dieper voelt, voelt afwijzing ook heviger. Een date die niet reageert? Dat zit je dagen dwars. Wees lief voor jezelf en gun jezelf de tijd om het te verwerken.</p>

<h2>7. Je zoekt geen oppervlakkige relatie</h2>
<p>Je kunt wel daten, maar alleen als het ergens over gaat. Oppervlakkige gesprekken, oppervlakkige mensen — daar krijg jij geen energie van. Jij zoekt een zielsconnectie. En die vind je hier.</p>

<p>Op <a href="https://www.bijeen.app" target="_blank" rel="noopener">bijeen.app</a> vind je professionals die gespecialiseerd zijn in HSP en relaties. Echt een aanrader als je hier meer over wilt weten.</p>

<h2>Tips voor HSP-daters</h2>
<ul>
  <li>Plan dates op rustige momenten en plekken</li>
  <li>Neem de tijd om te reageren — geen druk</li>
  <li>Wees eerlijk over je sensitiviteit</li>
  <li>Stop als het teveel wordt — dat mag</li>
</ul>

<p>Onthoud: jouw gevoeligheid is geen zwakte. Het is je kracht. En de juiste persoon ziet dat ook zo.</p>`,

    categoryId: CATEGORIES.DATE_TIPS,
    publishedAt: '2026-08-17T10:00:00.000Z',
    seoTitle: 'Hoogsensitief Daten (HSP): 7 Dingen Die Alleen Jij Begrijpt',
    seoDescription: 'Daten als hoogsensitief persoon (HSP): 7 herkenbare situaties van overprikkeling tot diepgang. Praktische tips voor fijne dates als HSP.',
    keywords: ['hsp daten', 'hoogsensitief daten', 'hsp relatie', 'hoogsensitief in de liefde', 'dating als hsp', 'hsp tips daten', 'overprikkeld date'],
  },

  {
    title: 'ADHD + HSP combi: hoe daten als je beide hebt',
    slug: 'adhd-hsp-combi-daten',
    excerpt: 'ADHD én HSP? Dat is een intense combi — hoge energie plus diepe gevoeligheid. Lees hoe je dat inzet bij het daten zonder overprikkeld te raken.',
    content: `<h1>ADHD + HSP combi: hoe daten als je beide hebt</h1>

<p>Je bent energiek en impulsief — maar ook intens en gevoelig. Je kunt hypergefocust zijn op iemand, maar hebt tegelijkertijd rust nodig om niet overprikkeld te raken. Klinkt tegenstrijdig? Welkom bij de ADHD+HSP-combinatie!</p>

<p>Veel mensen denken dat ADHD en HSP elkaar uitsluiten, maar niets is minder waar. Een groot deel van de mensen met ADHD is ook hoogsensitief. De combinatie kan verwarrend zijn — ook in de datingwereld.</p>

<p>Op <a href="/daten-adhd-hsp">onze ADHD & HSP-pagina</a> leggen we uit hoe wij hier rekening mee houden.</p>

<h2>De paradox van ADHD+HSP bij daten</h2>
<p>Waar je als ADHD'er snel enthousiast wordt en vol energie zit, heb je als HSP juist behoefte aan rust en diepgang. Die twee kanten kunnen botsen:</p>
<ul>
  <li>Je wilt de hele dag appen — maar bent na drie berichten al uitgeput</li>
  <li>Je wilt avontuurlijke dates — maar raakt overprikkeld in drukke omgevingen</li>
  <li>Je valt snel voor iemand — maar voelt afwijzing extra diep</li>
</ul>

<h2>Hoe maak je er het beste van?</h2>
<ol>
  <li><strong>Erken beide kanten</strong> — je bent niet "te veel" of "te gevoelig". Je bent beide, en dat is oké</li>
  <li><strong>Wissel actie en rust af</strong> — plan een actieve date (wandelen) gevolgd door een rustige dag</li>
  <li><strong>Communiceer je behoeften</strong> — "Ik heb ADHD, dus ik vergeet weleens te reageren. En ik ben HSP, dus ik heb rust nodig." Simpel en duidelijk</li>
  <li><strong>Gebruik hyperfocus voor connectie</strong> — als je in hyperfocus raakt op iemand, ben je de beste date ooit. Geniet ervan!</li>
  <li><strong>Weet wanneer je pauze nodig hebt</strong> — zet de app uit, neem een dag offline. Jouw brein heeft hersteltijd nodig</li>
</ol>

<p>Lees ook <a href="/blog/daten-met-adhd-tips-die-echt-werken">onze ADHD-date tips</a> en <a href="/blog/hoogsensitief-daten-hsp-7-dingen">HSP-date inzichten</a> voor meer herkenning.</p>

<h2>Welke partner past bij ADHD+HSP?</h2>
<p>Iemand die:<br>
- Energie kan verdragen én rust begrijpt<br>
- Niet schrikt van intense gesprekken, maar ze juist zoekt<br>
- Geduldig is, niet pusht en direct communiceert<br>
- Jouw complexiteit ziet als rijkdom, niet als gedoe</p>

<p>Op <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> vind je inzichten over hoe neurodiversiteit relaties beïnvloedt — goed onderbouwde artikelen die écht helpen.</p>

<p>Weet je het even niet? Dat mag. Daten met ADHD+HSP is een uitdaging, maar het geeft je ook een uniek perspectief. Jij kunt iemand begrijpen op een manier die anderen niet kunnen.</p>`,

    categoryId: CATEGORIES.RELATIE_ADVIES,
    publishedAt: '2026-08-31T10:00:00.000Z',
    seoTitle: 'ADHD en HSP Combineren: Daten met Beide',
    seoDescription: 'ADHD én HSP tegelijk: hoe date je met hoge energie én diepe gevoeligheid? Praktische tips voor de ADHD+HSP-combinatie in de liefde.',
    keywords: ['adhd hsp combi', 'adhd en hsp samen', 'neurodiversiteit adhd hsp', 'daten met adhd en hsp', 'hoogsensitief en adhd', 'adhd hsp relatie'],
  },

  {
    title: 'De beste eerste date-ideeën voor ADHD en HSP singles',
    slug: 'beste-eerste-date-ideeen-adhd-hsp',
    excerpt: 'De juiste omgeving maakt het verschil. Ontdek de beste date-ideeën voor mensen met ADHD of HSP — van rustig wandelen tot actief ontdekken.',
    content: `<h1>De beste eerste date-ideeën voor ADHD en HSP singles</h1>

<p>Een eerste date is spannend voor iedereen. Maar als je ADHD of HSP hebt, kan de plek waar je afspreekt het verschil maken tussen een leuke avond en een overprikkelde chaos.</p>

<p>Dit zijn de beste date-ideeën, speciaal voor neurodiverse singles. <a href="/daten-adhd-hsp">Bekijk ook onze ADHD & HSP-pagina</a> voor meer tips.</p>

<h2>Voor HSP: rust en diepgang</h2>
<ul>
  <li><strong>Wandeling in het park</strong> — rustig, prikkelarm, en je kunt makkelijk stoppen als het teveel wordt</li>
  <li><strong>Museum of galerie</strong> — loop langs kunst, praat erover. Geen druk, geen oogcontact-dwang</li>
  <li><strong>Rustig café in de middag</strong> — kies een rustig tijdstip (14:00u) en een hoekcafé zonder harde muziek</li>
  <li><strong>Koffie en een boekwinkel</strong> — samen struinen en praten over favoriete boeken</li>
</ul>

<h2>Voor ADHD: actief en prikkelend</h2>
<ul>
  <li><strong>Bowlen of minigolf</strong> — actief, speels, en je hebt iets te doen tijdens het praten</li>
  <li><strong>Fietsen of wandelen met doel</strong> — wandel naar een leuk eindpunt, bijvoorbeeld een ijssalon of uitzichtpunt</li>
  <li><strong>Streetfood markt</strong> — veel te zien, veel te proeven, veel gespreksstof</li>
  <li><strong>Bootje varen</strong> — rustig water, maar wel actief bezig — ideaal voor onrustige handen</li>
</ul>

<h2>Date-ideeën voor ADHD+HSP (combi)</h2>
<ul>
  <li><strong>Dierentuin of botanische tuin</strong> — rustig wandelen, maar wel interessante prikkels</li>
  <li><strong>Creatieve workshop</strong> — samen iets maken (pottenbakken, schilderen) — prikkelend maar gecontroleerd</li>
  <li><strong>Ontbijt of lunch date</strong> — korter, minder intensief dan een diner, en je kunt makkelijk weggaan</li>
</ul>

<h2>Vermijd deze plekken</h2>
<ul>
  <li>Drukke kroegen of clubs (te veel prikkels voor HSP)</li>
  <li>Bioscoop op eerste date (geen interactie, te stil voor ADHD)</li>
  <li>Eindeloos terras zitten (geen afleiding, ongemakkelijk voor beide)</li>
</ul>

<p>Onthoud: een goede date is een date waarbij jij jezelf kunt zijn. Of dat nu is met 100% energie of in stille diepgang. <a href="/register?source=adhd-hsp">Maak een gratis profiel</a> en vind iemand die bij jouw tempo past.</p>`,

    categoryId: CATEGORIES.DATE_TIPS,
    publishedAt: '2026-09-14T10:00:00.000Z',
    seoTitle: 'Beste Date-Ideeën voor ADHD en HSP Singles',
    seoDescription: 'De beste eerste date-ideeën voor ADHD- en HSP-singles. Van rustige wandelingen voor HSP tot actieve dates voor ADHD. Vind de perfecte omgeving.',
    keywords: ['date ideeën adhd', 'date ideeën hsp', 'eerste date neurodiversiteit', 'adhd date activiteiten', 'hsp date tips', 'rustige dates hsp', 'actieve dates adhd'],
  },

  {
    title: 'Communiceren in een relatie met ADHD of HSP: zo doe je dat',
    slug: 'communiceren-relatie-adhd-hsp',
    excerpt: 'Goede communicatie is de basis van elke relatie, maar met ADHD of HSP werkt het nét even anders. Lees hoe je misverstanden voorkomt.',
    content: `<h1>Communiceren in een relatie met ADHD of HSP: zo doe je dat</h1>

<p>"Je luistert niet." "Je reageert te fel." "Je bent te afstandelijk." Herken je deze opmerkingen? In een relatie met ADHD of HSP ontstaan misverstanden vaak door hoe we communiceren — niet door wát we voelen.</p>

<p>Gelukkig kun je eraan werken. <a href="/daten-adhd-hsp">Op onze ADHD & HSP-pagina</a> lees je waarom wij hier speciaal aandacht aan besteden.</p>

<h2>ADHD en communicatie</h2>
<p>Mensen met ADHD communiceren anders. Dit zijn veelvoorkomende situaties:</p>
<ul>
  <li><strong>Onderbreken:</strong> niet uit onbeleefdheid, maar omdat je anders vergeet wat je wilde zeggen</li>
  <li><strong>Vergeten:</strong> "Dat had ik toch gezegd?" — Nee, dat dacht je alleen</li>
  <li><strong>Rejection Sensitive Dysphoria (RSD):</strong> een klein kritiekpuntje voelt als een enorme afwijzing</li>
  <li><strong>Emotional dysregulation:</strong> emoties komen harder binnen dan bij anderen</li>
</ul>

<h2>HSP en communicatie</h2>
<p>Hoogsensitieve communicatie heeft eigen kenmerken:</p>
<ul>
  <li><strong>Diepgang nodig:</strong> jij hebt moeite met oppervlakkige gesprekken</li>
  <li><strong>Non-verbale radar:</strong> je voelt haarfijn aan hoe de ander écht is — ook wat er níet gezegd wordt</li>
  <li><strong>Snel overprikkeld:</strong> te veel praten, te harde stemmen, te veel tegelijk — je raakt de draad kwijt</li>
  <li><strong>Behoefte aan verwerkingstijd:</strong> je kunt niet altijd meteen reageren</li>
</ul>

<h2>Tips voor betere communicatie</h2>
<ol>
  <li><strong>Gebruik ik-punten</strong> — "Ik voel me overweldigd" werkt beter dan "Jij praat te veel"</li>
  <li><strong>Plan vaste gespreksmomenten</strong> — voorkom dat belangrijke gesprekken op verkeerde momenten vallen</li>
  <li><strong>Schrijf het op</strong> — een appje of briefje werkt vaak beter dan mondelinge afspraken</li>
  <li><strong>Neem pauze bij conflict</strong> — 20 minuten rust voorkomt dat ADHD-impulsiviteit of HSP-overprikkeling escaleert</li>
  <li><strong>Wees nieuwsgierig</strong> — vraag: "Hoe komt dit bij jou binnen?" in plaats van meteen te reageren</li>
</ol>

<p>Op <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> lees je meer over neurodiverse relaties en communicatie. Zeer aan te raden voor stellen met ADHD of HSP.</p>

<p>Communicatie is geen vaststaand gegeven. Het is iets waar je samen aan kunt werken. En met een beetje begrip voor elkaars neurodiversiteit wordt het niet makkelijker — het wordt mooier.</p>`,

    categoryId: CATEGORIES.RELATIE_ADVIES,
    publishedAt: '2026-09-28T10:00:00.000Z',
    seoTitle: 'Communiceren in Relatie met ADHD of HSP',
    seoDescription: 'Communicatietips voor relaties met ADHD of HSP. Leer omgaan met onderbreken, RSD, overprikkeling en emotionele diepgang. Praktisch en eerlijk.',
    keywords: ['communicatie adhd relatie', 'communiceren hsp', 'adhd relatie tips', 'hsp relatie communicatie', 'rsd adhd relatie', 'neurodiversiteit communicatie', 'relatie advies adhd'],
  },
]

async function main() {
  console.log(`📝 Starting to create ${posts.length} ADHD/HSP blog posts...`)

  for (const post of posts) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`⏭️  Skipping "${post.title}" — already exists`)
      continue
    }

    const publishedDate = new Date(post.publishedAt)

    await prisma.post.create({
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

    console.log(`✅ Created: "${post.title}" — ${publishedDate.toLocaleDateString('nl-NL')}`)
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
