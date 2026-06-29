// Create 10 blog posts for liefdevooriedereen.nl
// Spread between 1 Jan 2026 and 23 Jun 2026
// Includes references to WeAreImpact.nl, bijeen.app, bewaardvoorjou.nl

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
  // ===== 1. Hechtingsstijlen (Psychologie) - 12 jan 2026 =====
  {
    title: 'Hechtingsstijlen in relaties: ben jij veilig, angstig of vermijdend?',
    slug: 'hechtingsstijlen-relaties-veilig-angstig-vermijdend',
    excerpt: 'Je hechtingsstijl bepaalt hoe jij datet, verliefd wordt en relaties aangaat. Ontdek welke stijl jij hebt en hoe het je datingleven beïnvloedt.',
    content: `<h1>Hechtingsstijlen in relaties: ben jij veilig, angstig of vermijdend?</h1>

<p>Waarom voelt de ene date meteen als thuiskomen, terwijl de ander je onrustig maakt? Waarom trek je steeds hetzelfde type aan, ook al weet je diep van binnen dat het niet goed voor je is?</p>

<p>Het antwoord ligt in je hechtingsstijl. Dit psychologische concept, gebaseerd op het baanbrekende werk van John Bowlby, verklaart hoe jij je gedraagt in relaties — en waarom. En het mooie: je kunt eraan werken.</p>

<h2>Wat is een hechtingsstijl?</h2>

<p>Een hechtingsstijl is het patroon dat je als kind ontwikkelde in hoe je omgaat met nabijheid en afstand. Het bepaalt hoe jij je als volwassene gedraagt in romantische relaties. Grofweg zijn er drie stijlen:</p>

<h3>Veilige hechting (50-60% van de mensen)</h3>
<p>Mensen met een veilige hechtingsstijl voelen zich prettig in intimiteit en zijn niet bang om alleen te zijn. Ze kunnen goed communiceren over hun gevoelens en geven hun partner ruimte zonder angst voor verlies.</p>
<ul>
  <li>Kunnen makkelijk vertrouwen geven</li>
  <li>Zoeken steun bij hun partner als dat nodig is</li>
  <li>Staan open voor compromissen</li>
  <li>Herstellen snel na een conflict</li>
</ul>

<h3>Angstige/Preoccupated hechting (20%)</h3>
<p>Angstig gehechte mensen zijn vaak onzeker in relaties. Ze hebben veel bevestiging nodig en zijn bang dat hun partner bij hen weggaat. Dit kan leiden tot aanhankelijkheid of jaloezie.</p>
<ul>
  <li>Voelen snel onzekerheid na een date</li>
  <li>Hebben moeite met stilte in gesprekken</li>
  <li>Checken vaak of hun partner nog geïnteresseerd is</li>
  <li>Nemen afwijzing persoonlijk</li>
</ul>

<h3>Vermijdende hechting (20-25%)</h3>
<p>Vermijdend gehechte mensen houden graag afstand in relaties. Intimiteit voelt bedreigend en ze hebben het idee dat ze hun vrijheid verliezen als ze te dichtbij komen.</p>
<ul>
  <li>Worden ongemakkelijk bij te veel intimiteit</li>
  <li>Trekken zich terug als het te serieus wordt</li>
  <li>Vinden vaak "foutjes" bij hun date</li>
  <li>Zeggen dingen als "ik ben niet goed in relaties"</li>
</ul>

<h2>Herken jij jezelf?</h2>

<p>De meesten van ons herkennen wel elementen uit meerdere stijlen. Dat is normaal. Het gaat erom welk patroon dominant is en hoe dat jouw datingleven beïnvloedt.</p>

<p>Bij Liefde Voor Iedereen geloven we dat bewustwording de eerste stap is naar betere relaties. Daarom hebben we een speciale <a href="/kennisbank/tools/hechtingsstijl-quiz">hechtingsstijl-quiz</a> ontwikkeld, waarmee je in 5 minuten ontdekt waar jouw patroon ligt.</p>

<h2>Hoe verander je je hechtingsstijl?</h2>

<p>Het goede nieuws: hechtingsstijlen zijn niet voor altijd vastgelegd. Je kunt veiliger worden in relaties door:</p>

<ol>
  <li><strong>Zelfreflectie</strong> — herken je patronen zonder oordeel</li>
  <li><strong>Daten met intentie</strong> — kies bewust voor mensen die veiligheid bieden</li>
  <li><strong>Communicatie</strong> — leer praten over wat je nodig hebt</li>
  <li><strong>Therapie of coaching</strong> — professionele begeleiding werkt écht</li>
</ol>

<p>Platforms zoals <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> bieden goede tools voor zelfreflectie en persoonlijke ontwikkeling. Ook als het gaat om relatiepatronen. En op <a href="https://www.bijeen.app" target="_blank" rel="noopener">bijeen.app</a> vind je professionals die gespecialiseerd zijn in relatiecoaching — laagdrempelig en dicht bij huis.</p>

<h2>Praktische tip voor je volgende date</h2>

<p>Weet je wat jouw hechtingsstijl is? Praat er dan eens over op een date. Het klinkt spannend, maar eerlijkheid over wie je bent en waar je aan werkt, schept vertrouwen. Mensen waarderen authenticiteit — zeker op een platform waar <a href="/over-ons">veiligheid en echtheid voorop staan</a>.</p>`,
    categoryId: CATEGORIES.PSYCHOLOGIE,
    publishedAt: '2026-01-12T10:00:00.000Z',
    seoTitle: 'Hechtingsstijlen in Relaties: Veilig, Angstig of Vermijdend?',
    seoDescription: 'Ontdek jouw hechtingsstijl en leer hoe het je datingleven beïnvloedt. Praktische tips voor veiligere relaties. Met gratis hechtingsstijl-quiz.',
    keywords: ['hechtingsstijlen', 'relatiepatronen', 'angstige hechting', 'vermijdende hechting', 'veilige hechting', 'relatiepsychologie', 'dating psychologie'],
  },

  // ===== 2. Eerste date tips (Relatie Advies) - 19 jan 2026 =====
  {
    title: 'Eerste date tips: van zenuwen naar een echte connectie',
    slug: 'eerste-date-tips-zenuwen-echte-connectie',
    excerpt: 'Van de juiste locatie tot de beste gespreksonderwerpen — ontdek hoe je van een eerste date een onvergetelijke ervaring maakt.',
    content: `<h1>Eerste date tips: van zenuwen naar een echte connectie</h1>

<p>Een eerste date. Het kan voelen als een sollicitatiegesprek, een blinde test en een avondje uit in één. Zenuwen? Heel normaal. Maar met de juiste voorbereiding maak je er iets bijzonders van.</p>

<h2>Kies een dateplek die bij jullie past</h2>

<p>De locatie bepaalt de sfeer. Kies iets waar jullie je allebei prettig voelen en waar genoeg te zien en te bespreken valt.</p>
<ul>
  <li><strong>Koffie wandeling</strong> — laagdrempelig, makkelijk te verlengen of af te ronden</li>
  <li><strong>Museum of expositie</strong> — gespreksstof vanzelf, minder druk op elkaar</li>
  <li><strong>Mini-golf of bowlen</strong> — speels, luchtig, goed voor verlegen types</li>
  <li><strong>Markt of foodhall</strong> — informeel, samen kiezen, delen</li>
</ul>

<p>Vermijd de standaard avond uit eten. Dat is duur, formeel en kan ongemakkelijk aanvoelen als de klik er niet is.</p>

<h2>Gespreksonderwerpen die werken</h2>

<p>Een veelgehoorde angst: "Wat moet ik zeggen?" Het antwoord is simpel: stel vragen waar je écht nieuwsgierig naar bent.</p>

<h3>Goede openingsvragen</h3>
<ul>
  <li>"Wat was het hoogtepunt van je week?"</li>
  <li>"Als je morgen een vrije dag hebt, wat doe je dan?"</li>
  <li>"Wat is het beste boek of de beste serie die je recent hebt ontdekt?"</li>
</ul>

<h3>Vermijd</h3>
<ul>
  <li>Te veel over ex-relaties praten</li>
  <li>De datinggeschiedenis uitpluizen</li>
  <li>Te directe vragen over geld, kinderen of trouwen</li>
</ul>

<p>Bij <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> weten ze uit onderzoek dat de beste eerste indruk ontstaat wanneer je oprecht geïnteresseerd bent, niet wanneer je indruk probeert te maken. Authenticiteit wint altijd van perfectie.</p>

<h2>De ongeschreven regels van een eerste date</h2>
<ol>
  <li><strong>Wees op tijd</strong> — het zegt alles over hoe je de ander waardeert</li>
  <li><strong>Leg je telefoon weg</strong> — écht. Niets zo ontmoedigend als een trillend scherm</li>
  <li><strong>Deel de rekening</strong> — aanbieden is netjes en geeft gelijkwaardigheid aan</li>
  <li><strong>Wees duidelijk achteraf</strong> — stuur een berichtje na de date, hoe dan ook</li>
</ol>

<h2>Hoe weet je of er een tweede date komt?</h2>
<p>Let op signalen: wordt er gelachen? Voelt stilte comfortabel of ongemakkelijk? Maakt de ander plannen voor de toekomst ("hier moeten we nog eens eten")? Als het voelt alsof de tijd voorbij vliegt, is dat een goed teken.</p>

<p>Op <a href="https://www.bewaarvoorjou.nl" target="_blank" rel="noopener">bewaardvoorjou.nl</a> schrijven ze over bewust leven — en dat geldt ook voor daten. Neem de tijd, wees aanwezig, en forceer niets. De beste relaties ontstaan vanzelf.</p>`,
    categoryId: CATEGORIES.RELATIE_ADVIES,
    publishedAt: '2026-01-19T10:00:00.000Z',
    seoTitle: 'Eerste Date Tips: Van Zenuwen naar Echte Connectie',
    seoDescription: 'Praktische tips voor een succesvolle eerste date. Van locatiekeuze tot gespreksonderwerpen — maak van elke date een onvergetelijke ervaring.',
    keywords: ['eerste date tips', 'date locatie', 'gespreksonderwerpen date', 'dating advies', 'succesvol daten', 'date ideeën'],
  },

  // ===== 3. Daten met ADHD (Date Tips) - 2 feb 2026 =====
  {
    title: 'Daten met ADHD: 7 tips die écht werken',
    slug: 'daten-met-adhd-tips-die-echt-werken',
    excerpt: 'Daten met ADHD brengt unieke uitdagingen — maar ook bijzondere kansen. Ontdek hoe je ADHD kunt omarmen in je datingleven.',
    content: `<h1>Daten met ADHD: 7 tips die écht werken</h1>

<p>Als je ADHD hebt, is daten soms een achtbaan. Je kunt overenthousiast zijn in het begin, snel verveeld raken, of juist hyperfocus ervaren op iemand. Maar ADHD is geen beperking — het is een andere manier van verbinding maken.</p>

<h2>De ADHD-datingervaring</h2>
<p>Mensen met ADHD zijn vaak creatief, spontaan, empathisch en gepassioneerd. Geweldige eigenschappen voor een relatie. Maar de uitdagingen — impulsiviteit, vergeetachtigheid, emotionele intensiteit — kunnen roet in het eten gooien als je er niet bewust mee omgaat.</p>

<h2>7 tips voor daten met ADHD</h2>

<h3>1. Wees eerlijk over je ADHD</h3>
<p>Je hoeft het niet op de eerste date te vertellen, maar verberg het niet. Veel mensen met ADHD ervaren juist meer begrip en ruimte als ze er open over zijn. Onze <a href="/dating-met-autisme">speciale pagina voor neurodivers daten</a> laat zien hoe we hier op een fijne manier mee omgaan.</p>

<h3>2. Kies prikkelarme date-ideeën</h3>
<p>Een druk restaurant met harde muziek is vragen om overprikkeling. Kies liever voor een wandeling in het park, een museum op een rustig moment, of een kop koffie op een terras zonder herrie.</p>

<h3>3. Gebruik reminders voor afspraken</h3>
<p>Vergeetachtigheid is een bekend ADHD-symptoom. Zet dubbele alerts in je telefoon, noteer dates direct in je agenda, en wees niet te hard voor jezelf als het misgaat. Een goede date begrijpt het.</p>

<h3>4. Neem pauzes van je telefoon</h3>
<p>ADHD maakt het moeilijk om niet constant te scrollen. Leg tijdens het daten bewust je telefoon weg. Gebruik de <a href="/kennisbank/tools/icebreaker-generator">icebreaker generator</a> voor gespreksstarters als je even vastloopt.</p>

<h3>5. Durf te zeggen wat je nodig hebt</h3>
<p>"Ik heb even tijd nodig om na te denken", "Kunnen we wat rustiger aan doen?" — goede communicatie is alles. Je date kan niet raden wat er in je omgaat.</p>

<h3>6. Omarm je hyperfocus (maar pas op)</h3>
<p>Hyperfocus op een nieuwe date voelt heerlijk, maar kan ook leiden tot overhaaste beslissingen. Gun jezelf de tijd om iemand echt te leren kennen, ook al voelt het meteen goed.</p>

<h3>7. Zoek een partner die past bij jouw energie</h3>
<p>Niet iedereen kan omgaan met de intensiteit en spontaniteit van ADHD. En dat is oké. Zoek iemand die jouw energie waardeert, niet iemand die je probeert af te remmen.</p>

<h2>Daten zonder oordeel</h2>
<p>Bij Liefde Voor Iedereen geloven we dat neurodiversiteit geen label is, maar een andere manier van liefhebben. Of je nu autisme, ADHD of HSP hebt — je bent welkom zoals je bent. Ook <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> zet zich in voor inclusieve technologie en dienstverlening, zodat iedereen mee kan doen — in de liefde en in de maatschappij.</p>

<p>Wil je meer lezen? Check dan ook onze <a href="/kennisbank/inclusief-daten/daten-met-autisme-complete-gids">complete gids voor daten met autisme</a> — veel tips zijn ook toepasbaar voor ADHD.</p>`,
    categoryId: CATEGORIES.DATE_TIPS,
    publishedAt: '2026-02-02T10:00:00.000Z',
    seoTitle: 'Daten met ADHD: 7 Tips die Écht Werken | Liefde Voor Iedereen',
    seoDescription: 'Ontdek praktische tips voor daten met ADHD. Van prikkelarme dates tot eerlijke communicatie — maak van neurodiversiteit een kracht in je datingleven.',
    keywords: ['daten met adhd', 'adhd dating tips', 'neurodiversiteit daten', 'adhd relatie', 'impulsiviteit daten', 'adhd hulp dating'],
  },

  // ===== 4. Catfishing herkennen (Veiligheid) - 9 feb 2026 =====
  {
    title: 'Catfishing herkennen: 5 waarschuwingssignalen die je niet mag negeren',
    slug: 'catfishing-herkennen-5-waarschuwingssignalen',
    excerpt: 'Catfishing komt vaker voor dan je denkt. Leer de signalen herkennen voordat je erin trapt. Met praktische tips om jezelf te beschermen.',
    content: `<h1>Catfishing herkennen: 5 waarschuwingssignalen die je niet mag negeren</h1>

<p>Catfishing — iemand die zich voordoet als een ander persoon online — is een van de grootste risico's van online daten. Het gebeurt vaker dan je denkt, en de gevolgen variëren van een gebroken hart tot financieel verlies.</p>

<p>Goed nieuws: catfishers zijn te herkennen als je weet waar je op moet letten.</p>

<h2>Wat is catfishing precies?</h2>
<p>Catfishing is het aanmaken van een fictief online profiel om een romantische relatie aan te gaan met een nietsvermoedend slachtoffer. De motieven verschillen: aandacht, wraak, financiële oplichting of gewoon eenzaamheid. Wat het doel ook is — het is altijd een vorm van misleiding.</p>

<p>Op <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> weten ze uit onderzoek dat digitale veiligheid begint bij bewustwording. Hoe beter je de signalen kent, hoe kleiner de kans dat je erin trapt.</p>

<h2>5 signalen dat je met een catfish te maken hebt</h2>

<h3>1. Het profiel is te mooi om waar te zijn</h3>
<p>Een aantrekkelijke, succesvolle arts die toevallig in het buitenland werkt, maar nog nooit een videocall heeft gedaan? Pas op. Catfishers gebruiken vaak gestolen foto's van modellen of influencers. Je kunt foto's checken met Google Afbeeldingen zoeken.</p>

<h3>2. Ze vermijden videobellen en ontmoetingen</h3>
<p>Altijd een smoes waarom ze niet kunnen videobellen of afspreken. "Mijn camera is stuk", "Ik zit in het buitenland", "Ik ben verlegen" — allemaal klassieke catfish-excuses. Na twee weken chatten zonder videocall of afspraak is het tijd om vragen te stellen.</p>

<h3>3. Het gaat te snel</h3>
<p>Binnen een paar dagen praten over de toekomst, soulmate-gevoelens, of eeuwige liefde? Catfishers creëren vaak een 'love bombing' effect om je vertrouwen te winnen. Leer <a href="/kennisbank/begrippen/love-bombing">love bombing herkennen</a> in onze begrippenlijst.</p>

<h3>4. Ze vragen om geld of gegevens</h3>
<p>Dit is de grootste rode vlag. Zodra iemand vraagt om geld voor een vliegticket, medische noodsituatie of investering — blokkeren en rapporteren. Ook vragen om je bankgegevens of ID-bewijs is verdacht.</p>

<h3>5. Het verhaal klopt niet</h3>
<p>Let op inconsistenties. Werden ze eerst geboren in Amsterdam, maar later blijken ze in een klein dorpje in Friesland te wonen? Noteer details en check of het klopt. Catfishers kunnen hun verhaal moeilijk onthouden.</p>

<h2>Hoe bescherm je jezelf?</h2>
<ul>
  <li>Gebruik een platform dat profielen verifieert — zoals <a href="/">Liefde Voor Iedereen</a> waar elk profiel handmatig wordt gecontroleerd</li>
  <li>Deel nooit je adres, financiële gegevens of wachtwoorden</li>
  <li>Sta altijd een videocall voor de eerste date</li>
  <li>Spreek af op een openbare plek voor de eerste ontmoeting</li>
  <li>Gebruik onze <a href="/kennisbank/tools/scam-checker">scam-checker tool</a> om verdachte profielen te testen</li>
</ul>

<h2>Wat te doen als je bent gecatfisht?</h2>
<ol>
  <li>Stop direct alle communicatie</li>
  <li>Maak screenshots van het gesprek</li>
  <li>Rapporteer het profiel op het platform</li>
  <li>Doe aangifte als er geld gestolen is</li>
</ol>

<p>Je bent niet de enige. Op <a href="https://www.bewaarvoorjou.nl" target="_blank" rel="noopener">bewaardvoorjou.nl</a> lees je verhalen van mensen die hun ervaring delen — herkenning en steun kunnen enorm helpen bij het verwerken.</p>`,
    categoryId: CATEGORIES.VEILIGHEID,
    publishedAt: '2026-02-09T10:00:00.000Z',
    seoTitle: 'Catfishing Herkennen: 5 Waarschuwingssignalen | Liefde Voor Iedereen',
    seoDescription: 'Leer catfishing herkennen met deze 5 signalen. Bescherm jezelf tegen nepprofielen en romance oplichting. Praktische tips voor veilig online daten.',
    keywords: ['catfishing herkennen', 'nepprofiel dating', 'online dating veiligheid', 'catfish signalen', 'romance scam', 'neppe dating profielen'],
  },

  // ===== 5. Dating profiel verbeteren (Dating Tips) - 16 feb 2026 =====
  {
    title: 'Je dating profiel verbeteren: 10 do\'s en don\'ts',
    slug: 'dating-profiel-verbeteren-10-dos-en-donts',
    excerpt: 'Een goed profiel is het verschil tussen matches of overgeslagen worden. Ontdek hoe je een profiel maakt dat opvalt en uitnodigt tot een gesprek.',
    content: `<h1>Je dating profiel verbeteren: 10 do's en don'ts</h1>

<p>Je profiel is je eerste indruk. In een paar seconden beslist iemand of ze verder lezen, een bericht sturen, of doorgaan naar de volgende. Hoe zorg je dat jij die felbegeerde 'like' krijgt?</p>

<h2>De 5 do's</h2>

<h3>1. Kies een duidelijke, lachende profielfoto</h3>
<p>Geen zonnebril, geen groepsfoto waar we moeten raden wie jij bent, geen selfie in de sportschool. Kies een foto waar je naturel lacht, bij daglicht, bij voorkeur met een neutrale achtergrond. Onze <a href="/kennisbank/profiel/perfecte-profielfoto-tips">profielfoto tips</a> helpen je stap voor stap.</p>

<h3>2. Schrijf een bio die vertelt wie je bent</h3>
<p>Niet "Ik hou van reizen, lekker eten en gezelligheid" — dat zegt iedereen. Wees specifiek: "Afgelopen zomer fietste ik door de Dordogne, at 27 verschillende kazen en ontdekte dat ik slecht ben in kaartlezen." Dat blijft hangen.</p>

<h3>3. Toon je humor</h3>
<p>Een grapje op het juiste moment maakt je menselijk en benaderbaar. Het hoeft geen comedy-act te zijn — een beetje zelfspot of een luchtige opmerking over jezelf werkt al.</p>

<h3>4. Vermeld wat je zoekt</h3>
<p>Serieus, casual of gewoon zien waar het heen gaat? Wees eerlijk. Dat trekt de juiste mensen aan en filtert de rest. Bij Liefde Voor Iedereen zie je op elk profiel <a href="/prijzen">welk abonnement</a> iemand heeft — dat zegt ook iets over intentie.</p>

<h3>5. Vraag om een reactie</h3>
<p>Sluit af met een vraag: "Dus, wat is jouw favoriete plek in Nederland?" of "Welk boek lees je nu?" Dit maakt het makkelijk voor iemand om een bericht te sturen.</p>

<h2>De 5 don'ts</h2>

<h3>1. Geen verlanglijstje</h3>
<p>"Moet langer zijn dan 1.80m, eigen auto, geen kinderen" — dit schrikt af, ook als het goedbedoeld is. Focus op wat je wél zoekt, niet op wat je uitsluit.</p>

<h3>2. Geen negativiteit</h3>
<p>"Geen spelletjes", "Geen drama", "Ben je eindelijk normaal?" — negativiteit in je bio trekt negatieve aandacht. Houd het positief en uitnodigend.</p>

<h3>3. Geen te oude foto's</h3>
<p>Een foto van 3 jaar geleden is valsspelen. Je date ziet het verschil direct bij een ontmoeting. Gebruik foto's van het afgelopen jaar.</p>

<h3>4. Geen 'mijn kinderen zijn mijn wereld' openingszin</h3>
<p>Natuurlijk zijn je kinderen belangrijk. Maar een datingprofiel gaat eerst over jou, niet over je rol als ouder. Noem het, maar maak er niet je openingszin van.</p>

<h3>5. Geen groepsfoto als hoofdfoto</h3>
<p>Mensen willen niet raden wie jij bent. Gebruik een solo-foto als hoofdfoto. Groepsfoto's kunnen in je album, maar niet op nummer 1.</p>

<h2>Jouw profiel, jouw kans</h2>
<p>Je profiel is de etalage van wie je bent. Neem er de tijd voor, vraag feedback aan vrienden, en pas het aan als het niet werkt. En onthoud: authenticiteit trekt altijd de juiste mensen aan.</p>

<p>Bij <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> adviseren ze ook in de zorgsector: maak het persoonlijk, niet anoniem. Dat advies geldt dubbel voor datingprofielen.</p>`,
    categoryId: CATEGORIES.DATING_TIPS,
    publishedAt: '2026-02-16T10:00:00.000Z',
    seoTitle: 'Dating Profiel Verbeteren: 10 Do\'s en Don\'ts',
    seoDescription: 'Leer hoe je een onweerstaanbaar dating profiel maakt. Van profielfoto tot bio — ontdek wat wél werkt en wat je moet vermijden voor meer matches.',
    keywords: ['dating profiel tips', 'profielfoto tips', 'dating bio schrijven', 'meer matches', 'dating profiel verbeteren', 'online dating profiel'],
  },

  // ===== 6. Love Bombing Herkennen (Psychologie) - 2 mrt 2026 =====
  {
    title: 'Love bombing: herken het in 3 simpele stappen',
    slug: 'love-bombing-herkennen-3-stappen',
    excerpt: 'Love bombing lijkt op ware liefde, maar is een gevaarlijke manipulatie techniek. Ontdek hoe je het herkent voordat het te laat is.',
    content: `<h1>Love bombing: herken het in 3 simpele stappen</h1>

<p>Het begint als een sprookje. Overdreven aandacht, constante berichtjes, toekomstplannen binnen een week. Je voelt je de bijzonderste persoon op aarde. Tot het plotseling omslaat.</p>

<p>Love bombing is een manipulatie techniek die vaak wordt gebruikt door mensen met narcistische persoonlijkheidstrekken. Het doel: jou verslaafd maken aan de aandacht, zodat je later moeilijker kunt vertrekken.</p>

<h2>Wat is love bombing?</h2>
<p>Love bombing is het overdreven tonen van affectie, aandacht en bewondering in het begin van een relatie, met als doel controle te krijgen. Het verschilt van echte liefde doordat het niet oprecht is — het is een strategie.</p>

<p>In onze <a href="/kennisbank/begrippen/love-bombing">begrippenlijst</a> leggen we het verschil uit tussen echte verliefdheid en love bombing. Want hoewel de signalen op elkaar lijken, is het verschil essentieel.</p>

<h2>Stap 1: Herken de signalen in de eerste 2 weken</h2>
<ul>
  <li>Binnen een paar dagen praten over zielsverwanten en de toekomst</li>
  <li>Overdreven complimenten die niet passen bij hoe goed jullie elkaar kennen</li>
  <li>Constant sms'en, bellen en aandacht vragen</li>
  <li>Jaloezie als je niet direct reageert</li>
  <li>Kleine (of grote) cadeautjes en verrassingen</li>
  <li>Willen dat jullie exclusief zijn na 1 of 2 dates</li>
</ul>

<h2>Stap 2: Check het gedrag als de "honeymoon" voorbij is</h2>
<p>Bij love bombing volgt na de overdreven fase een periode van afstand. De aandacht verdwijnt, kritiek sluipt erin, en jij voelt je onzeker. Dit is geen toeval — het is de cyclus: hoog → laag → hoog → laag, waardoor jij verslaafd raakt aan de pieken.</p>

<p>Vraag jezelf af:</p>
<ul>
  <li>Voel ik me onrustig als ik geen bericht krijg?</li>
  <li>Moet ik mijn gedrag aanpassen om de lieve versie terug te krijgen?</li>
  <li>Zijn er kleine beledigingen verpakt als "grapjes"?</li>
  <li>Voelt het alsof ik op eieren loop?</li>
</ul>

<h2>Stap 3: Bescherm jezelf</h2>
<ol>
  <li><strong>Neem afstand.</strong> Reageer minder snel en kijk wat er gebeurt. Een liefhebber begrijpt dat je een eigen leven hebt.</li>
  <li><strong>Praat erover.</strong> Vertel een vriend(in) hoe de relatie verloopt. Een buitenstaander ziet vaak sneller wat er mis is.</li>
  <li><strong>Stel grenzen.</strong> "Ik heb tijd nodig om iemand te leren kennen" — als dat niet wordt gerespecteerd, weet je genoeg.</li>
  <li><strong>Gebruik onze <a href="/kennisbank/tools/red-flag-checklist">red flag checklist</a></strong> om objectief te beoordelen of er zorgelijke signalen zijn.</li>
</ol>

<h2>Het verschil tussen echte liefde en love bombing</h2>
<p>Echte liefde voelt veilig, consistent en rustig. Love bombing voelt opwindend, verslavend en chaotisch. Echte liefde geeft je ruimte. Love bombing vult elke centimeter.</p>

<p>Ook in de professionele wereld zien we dit patroon terug. <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> geeft trainingen over gezonde relaties en grenzen stellen — zowel in de liefde als op de werkvloer. Want dezelfde principes gelden overal.</p>

<p>Vertrouw op je gevoel. Als iets te mooi is om waar te zijn, is dat het vaak ook.</p>`,
    categoryId: CATEGORIES.PSYCHOLOGIE,
    publishedAt: '2026-03-02T10:00:00.000Z',
    seoTitle: 'Love Bombing Herkennen: 3 Simpele Stappen',
    seoDescription: 'Leer love bombing herkennen in 3 stappen. Ontdek het verschil tussen echte liefde en manipulatie. Met praktische tips om jezelf te beschermen.',
    keywords: ['love bombing herkennen', 'narcistische relatie', 'manipulatie dating', 'emotionele manipulatie', 'toxische relatie signalen', 'liefde vs manipulatie'],
  },

  // ===== 7. 50+ Dating (Lifestyle) - 16 mrt 2026 =====
  {
    title: '50+ dating: waarom het nooit te laat is voor de liefde',
    slug: '50-plus-dating-nooit-te-laat-voor-liefde',
    excerpt: 'Daten op latere leeftijd brengt andere vragen met zich mee. Maar ook andere kansen: wijsheid, zelfkennis en tijd voor echte verbinding.',
    content: `<h1>50+ dating: waarom het nooit te laat is voor de liefde</h1>

<p>Op je 50e weer gaan daten. Het voelt soms spannender dan op je 20e. Je hebt meer bagage, meer verantwoordelijkheden en een duidelijker beeld van wat je wel en niet wilt. Maar juist dát maakt 50+ dating zo bijzonder.</p>

<h2>Waarom 50+ daten anders is (en beter)</h2>

<h3>Je weet wat je wilt</h3>
<p>Geen giswerk meer. Je hebt genoeg relaties meegemaakt om te weten wat voor jou werkt. Dat bespaart tijd en voorkomt teleurstellingen. Je stelt betere vragen en herkent rode vlaggen sneller.</p>

<h3>Geen spelletjes</h3>
<p>Naarmate je ouder wordt, verdwijnt de behoefte aan dating spelletjes. "Pas over 3 dagen terug appen" of "doen alsof je het druk hebt" — daar heeft niemand op deze leeftijd meer energie voor. Eerlijkheid en directheid winnen.</p>

<h3>Tijd voor echte verbinding</h3>
<p>De kinderen zijn vaak (bijna) de deur uit, carrière is gestabiliseerd. Er is tijd en rust om écht te investeren in een relatie. Geen haast, geen prestatiedruk — gewoon twee mensen die elkaar leren kennen.</p>

<h2>Veelgehoorde zorgen over 50+ dating</h2>

<h3>"Ben ik niet te oud om te daten?"</h3>
<p>Nee. Absoluut niet. Liefde kent geen leeftijd. In onze <a href="/kennisbank/succesverhalen/succesverhaal-mark-lisa-50plus">succesverhalen</a> lees je over Mark en Lisa die elkaar op hun 58e vonden en nu samen reizen door Europa.</p>

<h3>"Wat zeg ik over mijn verleden?"</h3>
<p>Je hebt een geschiedenis. Dat is oké. Weduwe(naar), gescheiden, al jaren single — het is onderdeel van je verhaal, niet je identiteit. Deel het wanneer het natuurlijk voelt, niet als verplichting.</p>

<h3>"Online dating is voor jongeren"</h3>
<p>Steeds meer 50-plussers zijn actief op datingplatforms. Bij Liefde Voor Iedereen hebben we bewust geen ingewikkelde functies. Geen swipe-stress, geen gamification — gewoon oprechte profielen en duidelijke communicatie. Precies waar 50-plussers behoefte aan hebben.</p>

<h2>Tips voor een goede start</h2>
<ul>
  <li><strong>Begin rustig</strong> — je hoeft niet meteen alles te delen. Eerst koffie, dan zien we wel</li>
  <li><strong>Vraag hulp bij je profiel</strong> — een kind, vriend of kennis helpt je graag met een goede tekst en foto</li>
  <li><strong>Wees open over je leven</strong> — heb je tijd voor een relatie? Reizen? Mantelzorg? Wees eerlijk</li>
  <li><strong>Veiligheid eerst</strong> — check altijd ons <a href="/kennisbank/veiligheid/veilig-afspreken-checklist">veilig afspreken advies</a></li>
</ul>

<h2>De kracht van late liefde</h2>
<p>Wat 50+ dating bijzonder maakt, is de diepgang. Je bent niet meer op zoek naar bevestiging of status. Je zoekt naar iemand die het leven mooier maakt. En dat is de beste basis voor een relatie.</p>

<p>Platforms zoals <a href="https://www.bewaarvoorjou.nl" target="_blank" rel="noopener">bewaardvoorjou.nl</a> laten zien dat bewust leven en liefde op elke leeftijd hand in hand gaan. Neem de tijd, geniet van het proces, en vertrouw erop dat de juiste persoon op het juiste moment verschijnt.</p>

<p>Ben je klaar om de stap te zetten? <a href="/register">Maak gratis een profiel aan</a> en ontdek zelf waarom het nooit te laat is.</p>`,
    categoryId: CATEGORIES.LIFESTYLE,
    publishedAt: '2026-03-16T10:00:00.000Z',
    seoTitle: '50+ Dating: Waarom het Nooit te Laat is voor de Liefde',
    seoDescription: 'Ontdek de voordelen van 50+ daten. Meer zelfkennis, minder spelletjes, en tijd voor echte verbinding. Praktische tips voor een nieuwe start.',
    keywords: ['50 plus dating', 'dating voor senioren', 'late liefde', 'datingsite 50 plus', 'relatie vinden op latere leeftijd', 'weduwe daten'],
  },

  // ===== 8. Daten als alleenstaande ouder (Relatie Advies) - 6 apr 2026 =====
  {
    title: 'Daten als alleenstaande ouder: zo pak je het aan',
    slug: 'daten-als-alleenstaande-ouder-aanpak',
    excerpt: 'Daten met kinderen vraagt om een andere aanpak. Ontdek hoe je de balans vindt tussen ouderschap en een nieuw liefdesleven.',
    content: `<h1>Daten als alleenstaande ouder: zo pak je het aan</h1>

<p>Daten als alleenstaande ouder is een delicate balans. Je wilt openstaan voor de liefde, maar je kinderen staan altijd op de eerste plaats. Je hebt minder tijd, meer verantwoordelijkheid en een extra stem in je hoofd die meedenkt over elke beslissing.</p>

<p>Maar het is absoluut mogelijk — en het kan prachtig uitpakken.</p>

<h2>De uitdagingen van daten met kinderen</h2>
<ul>
  <li><strong>Tijdgebrek</strong> — tussen school, hobby's, huiswerk en je eigen werk blijft er weinig over</li>
  <li><strong>Schuldgevoel</strong> — "Neem ik tijd weg van mijn kinderen om te daten?"</li>
  <li><strong>Wanneer stel je ze voor?</strong> — te vroeg is onrustig, te laat voelt alsof je je kinderen verbergt</li>
  <li><strong>Afwijzing door kinderen</strong> — niet elke kind staat open voor een nieuwe partner</li>
  <li><strong>Bagage van de ander</strong> — jij hebt jouw verhaal, je date heeft het zijne</li>
</ul>

<h2>Praktische tips voor daten als alleenstaande ouder</h2>

<h3>1. Wees eerlijk in je profiel</h3>
<p>Vermeld dat je kinderen hebt. Niet in detail, maar duidelijk genoeg zodat een date weet waar hij of zij aan begint. "Trotse moeder van 2" of "Vader van 3, dus mijn agenda zit vol" werkt goed.</p>

<h3>2. Plan efficiënt</h3>
<p>Lunchdates, wandelingen in het weekend als de kinderen bij de ex-partner zijn, of een kop koffie tussen school en sport door. Het hoeft geen hele avond te zijn.</p>

<h3>3. Houd het eerste half jaar gescheiden</h3>
<p>De vuistregel die veel coaches aanraden: wacht minimaal 6 maanden voordat je kinderen voorstelt aan een nieuwe partner. Tegen die tijd weet je of het serieus is en kun je het gesprek beter voeren.</p>

<h3>4. Wees duidelijk over je grenzen</h3>
<p>"Ik kan alleen op dinsdag en om het weekend" is oké. Een begripvolle partner respecteert dat. Als iemand er moeite mee heeft, zegt dat genoeg over zijn of haar geschiktheid.</p>

<h3>5. Blijf geduldig</h3>
<p>Het duurt even om de juiste balans te vinden. Gun jezelf tijd. Liever een goede relatie over een jaar dan een slechte over een maand.</p>

<h2>Wanneer stel je een nieuwe partner voor?</h2>
<p>Het moment verschilt per gezin, maar deze signalen helpen:</p>
<ul>
  <li>De relatie is stabiel en serieus (minimaal 6 maanden)</li>
  <li>Jullie hebben het erover gehad met een rustig hoofd</li>
  <li>Je kinderen zijn in een stabiele periode (geen examens, geen verhuizing, etc.)</li>
  <li>Je kunt uitleggen waarom deze persoon belangrijk voor je is</li>
</ul>

<p>Onze <a href="/kennisbank/relaties/hechtingsstijlen-relaties-gids">relatiegids</a> helpt je bij het navigeren van deze gesprekken — zowel met je kinderen als met je nieuwe partner.</p>

<h2>Geef jezelf toestemming</h2>
<p>Het is niet egoïstisch om liefde te zoeken. Het is menselijk. Gelukkige ouders zijn betere ouders. En een gezonde relatie kan een prachtig voorbeeld zijn voor je kinderen van wat liefde écht betekent.</p>

<p>Ook platforms zoals <a href="https://www.bijeen.app" target="_blank" rel="noopener">bijeen.app</a> bieden ondersteuning voor alleenstaande ouders die weer willen daten — in de vorm van ontmoetingen en events met andere alleenstaande ouders. Want je staat er niet alleen voor.</p>`,
    categoryId: CATEGORIES.RELATIE_ADVIES,
    publishedAt: '2026-04-06T10:00:00.000Z',
    seoTitle: 'Daten als Alleenstaande Ouder: Zo Pak Je Het Aan',
    seoDescription: 'Praktische gids voor daten als alleenstaande ouder. Van profiel tot het voorstellen aan je kinderen — ontdek hoe je de balans vindt.',
    keywords: ['daten als alleenstaande ouder', 'single ouder dating', 'daten met kinderen', 'alleenstaande moeder daten', 'alleenstaande vader daten', 'wanneer kinderen voorstellen'],
  },

  // ===== 9. Veilige eerste date checklist (Veiligheid) - 20 apr 2026 =====
  {
    title: 'De ultieme checklist voor een veilige eerste date',
    slug: 'ultieme-checklist-veilige-eerste-date',
    excerpt: 'Veiligheid tijdens een eerste date gaat verder dan een openbare plek. Download deze checklist en date met een gerust hart.',
    content: `<h1>De ultieme checklist voor een veilige eerste date</h1>

<p>Een eerste date moet leuk zijn, niet spannend om de verkeerde redenen. Of je nu voor het eerst iemand ontmoet of al vaker hebt gedatet — veiligheid staat altijd voorop.</p>

<h2>Voor de date: check dit</h2>

<h3>✔️ Ken zijn of haar echte naam</h3>
<p>Check of de naam klopt met sociale media. Een catfish gebruikt vaak een valse naam. Het is niet gek om voor de date te vragen naar LinkedIn of Instagram.</p>

<h3>✔️ Deel je locatie met een vriend(in)</h3>
<p>Vertel iemand waar je naartoe gaat, met wie, en hoe laat je verwacht thuis te zijn. Het klinkt overdreven, maar het geeft rust — voor jou en voor de mensen die om je geven.</p>

<h3>✔️ Kies een openbare plek</h3>
<p>Een terras, een museum, een wandelroute. Geen afspraak bij iemand thuis en geen afgelegen plek. Als de date verandert van locatie, check dan of de nieuwe plek ook veilig aanvoelt.</p>

<h3>✔️ Zorg voor eigen vervoer</h3>
<p>Neem je eigen auto, fiets of zorg dat je met het OV kunt komen en gaan. Niet afhankelijk zijn van je date om thuis te komen geeft controle. Gebruik onze <a href="/kennisbank/tools/red-flag-checklist">red flag checklist</a> voor een extra check.</p>

<h2>Tijdens de date: blijf alert</h2>

<h3>✔️ Houd je telefoon binnen handbereik</h3>
<p>Niet om te scrollen, maar voor het geval je iemand nodig hebt. Laat je telefoon niet onbeheerd achter.</p>

<h3>✔️ Vertrouw op je onderbuik</h3>
<p>Dat ongemakkelijke gevoel? Neem het serieus. Of het nu een opmerking is die niet lekker valt, een blik, of een aanraking die te snel gaat — je mag altijd weggaan.</p>

<h3>✔️ Houd het bij één of twee drankjes</h3>
<p>Te veel alcohol vertroebelt je oordeel. Houd het bij één glas wijn of een biertje. Niet uit beleefdheid blijven drinken als de ander bijbestelt.</p>

<h3>✔️ Check je telefoon halverwege</h3>
<p>Stuur een appje naar je vriend(in): "Alles oké, leuke date, bel je straks." Dat geeft niet alleen hun een gerust gevoel, het herinnert jou eraan dat iemand op je wacht.</p>

<h2>Na de date: wees duidelijk</h2>

<h3>✔️ Laat iemand weten dat je veilig thuis bent</h3>
<p>Stuur het berichtje dat je eerder afsprak. "Ben thuis, was leuk!" is genoeg.</p>

<h3>✔️ Stuur een bericht naar je date</h3>
<p>Of je het nu leuk vond of niet —wees duidelijk. "Ik vond het gezellig, maar ik voel geen klik" is beter dan ghosten. Op <a href="https://www.bewaarvoorjou.nl" target="_blank" rel="noopener">bewaardvoorjou.nl</a> schrijven ze over bewuste communicatie — en dat geldt ook voor daten.</p>

<h3>✔️ Vertrouw je het niet? Meld het</h3>
<p>Als er iets gebeurde waardoor je je onveilig voelde, meld het profiel dan bij het platform. Bij <a href="/">Liefde Voor Iedereen</a> nemen we elke melding serieus en controleren we profielen handmatig.</p>

<h2>Onze belofte aan jou</h2>
<p>Wij doen er alles aan om daten veilig te maken. Elk profiel wordt handmatig gecontroleerd, we hebben duidelijke huisregels en een actief moderatieteam. En met onze <a href="/kennisbank/tools/scam-checker">scam-checker tool</a> kun je verdachte profielen zelf checken.</p>

<p>Ook <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> zet zich in voor veiligheid in de digitale wereld — van daten tot zorg. Want of je nu op zoek bent naar liefde of hulp, je hebt recht op een veilige omgeving.</p>`,
    categoryId: CATEGORIES.VEILIGHEID,
    publishedAt: '2026-04-20T10:00:00.000Z',
    seoTitle: 'Ultieme Checklist voor een Veilige Eerste Date',
    seoDescription: 'Complete veiligheidschecklist voor je eerste date. Van voorbereiding tot nazorg — date met een gerust hart. Handige red flag checklist inbegrepen.',
    keywords: ['veilige eerste date', 'date veiligheid', 'eerste date tips veiligheid', 'veilig daten', 'date checklist', 'online date veiligheid'],
  },

  // ===== 10. Liefde of verliefdheid? (Psychologie) - 4 mei 2026 =====
  {
    title: 'Hoe weet je of het liefde is? 7 tekens die het verschil maken',
    slug: 'hoe-weet-je-of-het-liefde-is-7-tekens',
    excerpt: 'Is het verliefdheid, gewoonte, of echte liefde? Dit zijn de signalen die het verschil maken tussen een fase en een fundering.',
    content: `<h1>Hoe weet je of het liefde is? 7 tekens die het verschil maken</h1>

<p>Je hebt een aantal dates gehad, de gesprekken worden dieper, en je merkt dat je steeds vaker aan hem of haar denkt. Maar is het liefde, verliefdheid, of gewoon prettig gezelschap? Het verschil kan lastig te zien zijn.</p>

<h2>Verliefdheid vs. liefde</h2>
<p>Verliefdheid is een chemische roes in je brein. Dopamine, adrenaline, oxytocine — je lichaam zorgt voor een cocktail die je euforisch, energiek en een beetje obsessief maakt. Het is intens, maar tijdelijk.</p>

<p>Liefde is wat overblijft als de roes is uitgedoofd. Het is rustiger, dieper en stabieler. En hoewel het minder opwindend klinkt, is het oneindig veel bevredigender.</p>

<h2>7 tekens dat het echte liefde is</h2>

<h3>1. Je kunt jezelf zijn (ook op je slechtste dagen)</h3>
<p>Verliefdheid laat je je beste beentje voorzetten. Liefde voelt veilig genoeg om ook je mindere kanten te laten zien. Als je naast iemand kunt zijn zonder masker, zonder energie te moeten steken in indruk maken, dan is dat een krachtig teken.</p>

<h3>2. Stilte voelt niet ongemakkelijk</h3>
<p>In het begin van een relatie moet elk gesprek interessant zijn. Bij echte liefde kun je samen op de bank zitten, ieder met een boek, zonder dat het ongemakkelijk voelt. Stilte is geen gat, het is gezelschap.</p>

<h3>3. Conflicten lossen jullie samen op</h3>
<p>Niet of jullie ruzie maken, maar hoe jullie het oplossen — dat is de echte test. Echte liefde betekent dat je na een conflict niet het gevoel hebt dat de relatie op de helling staat. Je zoekt samen naar een oplossing, niet naar gelijk.</p>

<h3>4. Je toekomstplannen bevatten de ander (vanzelf)</h3>
<p>Niet omdat je het gesprek forceert over de toekomst, maar omdat het vanzelfsprekend aanvoelt. "Volgende zomer..." of "Over een paar jaar..." — je merkt dat je automatisch rekening houdt met de ander.</p>

<h3>5. Jullie groeien, niet alleen samen maar ook apart</h3>
<p>Echte liefde geeft ruimte voor individuele groei. Je partner moedigt je aan om je eigen dromen na te jagen, ook als dat betekent dat jullie even minder tijd samen hebben.</p>

<h3>6. Je kiest bewust voor elkaar</h3>
<p>Niet uit gewoonte, niet uit angst om alleen te zijn, niet omdat het makkelijk is — maar omdat je elke dag opnieuw kiest voor deze persoon. Dat is het mooiste teken van liefde.</p>

<h3>7. Het voelt als thuis</h3>
<p>Na een lange dag, na een feestje, na een reis — thuiskomen bij je partner voelt als thuiskomen. Niet omdat het altijd perfect is, maar omdat het vertrouwd en veilig voelt.</p>

<h2>Wat als je het niet zeker weet?</h2>
<p>Twijfel is oké. Liefde heeft geen haast. De beste relaties groeien organisch, zonder dat je constant hoeft te checken of het wel "echt" is. En als je twijfelt tussen twee mensen, kies dan degene bij wie je het minst in de war bent van jezelf.</p>

<p>Bij <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a> weten ze uit onderzoek dat duurzame relaties bouwen op vertrouwen en veiligheid — niet op intensiteit. En op <a href="https://www.bijeen.app" target="_blank" rel="noopener">bijeen.app</a> organiseren ze ontmoetingen voor mensen die bewust met relaties bezig zijn.</p>

<p>Onthoud: echte liefde voelt niet als een achtbaan. Het voelt als een rustige rivier — met af en toe een stroomversnelling, maar nooit eng.</p>`,
    categoryId: CATEGORIES.PSYCHOLOGIE,
    publishedAt: '2026-05-04T10:00:00.000Z',
    seoTitle: 'Hoe Weet Je of het Liefde is? 7 Tekens',
    seoDescription: 'Het verschil tussen verliefdheid en echte liefde herkennen. 7 signalen die je helpen te weten of het echt is. Praktische relatiepsychologie.',
    keywords: ['liefde vs verliefdheid', 'echte liefde herkennen', 'relatie tekens', 'wanneer is het liefde', 'verliefdheid fase', 'duurzame relatie'],
  },
]

async function main() {
  console.log(`📝 Starting to create ${posts.length} blog posts...`)
  console.log(`👤 Admin: Support Team (${ADMIN_ID})`)
  console.log('')
  
  for (const post of posts) {
    // Check if slug already exists
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`⏭️  Skipping "${post.title}" — already exists (slug: ${post.slug})`)
      continue
    }

    const publishedDate = new Date(post.publishedAt)
    
    // Create the post
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
    
    console.log(`✅ Created: "${post.title}" — ${publishedDate.toLocaleDateString('nl-NL')} (${post.slug})`)
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
