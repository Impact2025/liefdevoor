/**
 * Doelgroepen Data - "Specifieke Voordeur, Gezamenlijke Woonkamer"
 *
 * Alle content voor de doelgroep landingspagina's
 * Gebaseerd op de 4 Zuilen strategie
 */

export type DoelgroepZuil = 'neurodiversiteit' | 'cognitief' | 'fysiek' | 'mentaal'

export interface DoelgroepFeature {
  icon: string
  title: string
  description: string
}

export interface DoelgroepTestimonial {
  quote: string
  name: string
  age: number
  location: string
  image?: string
}

export interface DoelgroepBlogPost {
  slug: string
  title: string
  excerpt: string
  category: 'specifiek' | 'universeel'
}

export interface DoelgroepData {
  slug: string
  zuil: DoelgroepZuil

  // Meta & SEO
  metaTitle: string
  metaDescription: string

  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroPainPoint: string
  heroImage: string

  // Features (3 iconen met uitleg)
  features: DoelgroepFeature[]

  // Social Proof
  testimonial: DoelgroepTestimonial

  // Blog content tags
  contentTags: string[]

  // Speciale modi
  enableSimpleMode?: boolean       // Voor LVB - eenvoudigere taal
  enableAudioMode?: boolean        // Voor slechtzienden - audio versies
  enableHighContrast?: boolean     // Voor slechtzienden - extra contrast
  enableLargeText?: boolean        // Grotere tekst standaard

  // CTA tracking
  sourceTag: string

  // Kleurenschema
  primaryColor: string
  gradientFrom: string
  gradientTo: string

  // Extra content secties
  faqItems?: Array<{ question: string; answer: string }>

  // Gerelateerde pagina's
  relatedSlugs?: string[]
}

// =============================================================================
// ZUIL A: NEURODIVERSITEIT
// =============================================================================

export const autismeData: DoelgroepData = {
  slug: 'dating-met-autisme',
  zuil: 'neurodiversiteit',

  metaTitle: 'Dating met Autisme | Liefde Voor Iedereen',
  metaDescription: 'Vind liefde die jouw taal spreekt. Dating zonder onduidelijke signalen, met focus op eerlijkheid en duidelijke communicatie. Speciaal voor mensen met autisme.',

  heroTitle: 'Vind liefde die jouw taal spreekt',
  heroSubtitle: 'Dating zonder spelletjes',
  heroPainPoint: 'Moe van onduidelijke signalen op Tinder? Hier draait het om eerlijkheid en duidelijke communicatie.',
  heroImage: '/images/landing/autisme-hero.jpg',

  features: [
    {
      icon: 'MessageSquare',
      title: 'Duidelijke Communicatie',
      description: 'Geen dubbele bodems of vage hints. Onze leden waarderen directe, eerlijke gesprekken.'
    },
    {
      icon: 'Heart',
      title: 'Begrip & Acceptatie',
      description: 'Een community waar je jezelf kunt zijn. Geen masker nodig, geen uitleg verschuldigd.'
    },
    {
      icon: 'Calendar',
      title: 'Rust in het Proces',
      description: 'Geen druk om snel te reageren. Neem de tijd die je nodig hebt voor een connectie.'
    }
  ],

  testimonial: {
    quote: 'Eindelijk een plek waar mijn directheid wordt gewaardeerd in plaats van verkeerd begrepen. Ik hoef geen spelletjes te spelen.',
    name: 'Thomas',
    age: 34,
    location: 'Utrecht'
  },

  contentTags: ['autisme', 'ass', 'neurodiversiteit', 'global'],

  sourceTag: 'autisme',

  primaryColor: '#6366f1', // Indigo - kalm en betrouwbaar
  gradientFrom: '#6366f1',
  gradientTo: '#8b5cf6',

  faqItems: [
    {
      question: 'Moet ik in mijn bio vertellen dat ik autisme heb?',
      answer: 'Dat is helemaal aan jou. Je kunt het direct vermelden, later in een gesprek delen, of helemaal niet. Er is geen "juiste" manier - doe wat voor jou prettig voelt.'
    },
    {
      question: 'Hoe weet ik of iemand ook autisme heeft?',
      answer: 'Sommige leden kiezen ervoor dit in hun profiel te vermelden via een tag. Anderen delen het pas later. We dwingen niemand om een diagnose te delen.'
    },
    {
      question: 'Kan ik de app gebruiken zonder videobellen?',
      answer: 'Absoluut. Videobellen is nooit verplicht. Je kunt chatten, voice berichten sturen, of bellen - wat voor jou werkt.'
    }
  ],

  relatedSlugs: ['dating-met-adhd', 'dating-hsp']
}

export const adhdData: DoelgroepData = {
  slug: 'dating-met-adhd',
  zuil: 'neurodiversiteit',

  metaTitle: 'Dating met ADHD | Liefde Voor Iedereen',
  metaDescription: 'Dating met ADHD kan overweldigend zijn. Wij begrijpen dat. Vind iemand die jouw energie waardeert en niet afschrikt van je spontaniteit.',

  heroTitle: 'Jouw energie is een superkracht',
  heroSubtitle: 'Dating zonder oordeel',
  heroPainPoint: 'Snel afgeleid of juist hyperfocused op liefde? Wij snappen het. Hier word je niet veroordeeld.',
  heroImage: '/images/landing/adhd-hero.jpg',

  features: [
    {
      icon: 'Zap',
      title: 'Spontaniteit Welkom',
      description: 'Impulsieve berichten om 2 uur \'s nachts? Prima! Hier worden spontane zielen gewaardeerd.'
    },
    {
      icon: 'Clock',
      title: 'Geen Druk',
      description: 'Vergeten te antwoorden? Dat snappen we. Geen passief-agressieve reacties hier.'
    },
    {
      icon: 'Sparkles',
      title: 'Eerlijk & Direct',
      description: 'Onze community waardeert directe communicatie - perfect als je geen zin hebt in games.'
    }
  ],

  testimonial: {
    quote: 'Op andere apps werd mijn enthousiasme als "te veel" gezien. Hier is mijn energie juist een pluspunt.',
    name: 'Lisa',
    age: 28,
    location: 'Amsterdam'
  },

  contentTags: ['adhd', 'neurodiversiteit', 'global'],

  sourceTag: 'adhd',

  primaryColor: '#f59e0b', // Amber - energiek
  gradientFrom: '#f59e0b',
  gradientTo: '#ef4444',

  relatedSlugs: ['dating-met-autisme', 'dating-hsp']
}

// =============================================================================
// ZUIL B: COGNITIEVE ONDERSTEUNING
// =============================================================================

export const lvbData: DoelgroepData = {
  slug: 'veilig-daten-lvb',
  zuil: 'cognitief',

  metaTitle: 'Veilig Daten met Begeleiding | Liefde Voor Iedereen',
  metaDescription: 'Veilig daten met extra uitleg en hulp. Duidelijke knoppen, eenvoudige tekst en begeleiding wanneer je dat wilt. Voor iedereen die het rustig aan wil doen.',

  heroTitle: 'Veilig daten doe je hier',
  heroSubtitle: 'Met hulp wanneer je wilt',
  heroPainPoint: 'Andere apps zijn ingewikkeld. Wij maken het makkelijk en veilig.',
  heroImage: '/images/landing/lvb-hero.jpg',

  features: [
    {
      icon: 'Shield',
      title: 'Extra Veilig',
      description: 'Alle profielen worden gecontroleerd. Wij passen op je.'
    },
    {
      icon: 'Mic',
      title: 'Spraakberichten',
      description: 'Typen hoeft niet. Spreek je bericht gewoon in.'
    },
    {
      icon: 'Users',
      title: 'Hulp Welkom',
      description: 'Je begeleider mag helpen als je dat wilt.'
    }
  ],

  testimonial: {
    quote: 'De grote knoppen en duidelijke tekst helpen mij enorm. Ik voel me hier veilig.',
    name: 'Kevin',
    age: 25,
    location: 'Tilburg'
  },

  contentTags: ['lvb', 'begeleiding', 'veilig', 'global'],

  enableSimpleMode: true,
  enableLargeText: true,

  sourceTag: 'lvb',

  primaryColor: '#10b981', // Emerald - veilig & vertrouwd
  gradientFrom: '#10b981',
  gradientTo: '#14b8a6',

  faqItems: [
    {
      question: 'Is het gratis?',
      answer: 'Ja! Aanmelden is gratis. Je kunt al veel doen zonder te betalen.'
    },
    {
      question: 'Kan mijn begeleider helpen?',
      answer: 'Ja! Je begeleider mag je helpen met alles. Dat is oké.'
    },
    {
      question: 'Hoe weet ik of iemand echt is?',
      answer: 'Wij controleren alle profielen. Zie je een blauw vinkje? Dan is iemand echt.'
    }
  ],

  relatedSlugs: ['dating-met-begeleiding']
}

// =============================================================================
// ZUIL C: FYSIEK & ZINTUIGLIJK
// =============================================================================

export const slechtziendData: DoelgroepData = {
  slug: 'dating-voor-slechtzienden',
  zuil: 'fysiek',

  metaTitle: 'Dating voor Slechtzienden & Blinden | Liefde Voor Iedereen',
  metaDescription: 'Volledig toegankelijke dating met screenreader ondersteuning, audio profielen en text-to-speech. Liefde zien we met het hart.',

  heroTitle: 'Liefde zien we met het hart',
  heroSubtitle: 'Volledig toegankelijk',
  heroPainPoint: 'De meeste dating apps zijn niet gebouwd voor screenreaders. Wij wel.',
  heroImage: '/images/landing/visual-hero.jpg',

  features: [
    {
      icon: 'Volume2',
      title: 'Audio Profielen',
      description: 'Luister naar profielen in plaats van lezen. Stem-introductie voor elk profiel.'
    },
    {
      icon: 'Keyboard',
      title: 'Volledig Toegankelijk',
      description: 'Optimaal voor screenreaders. Toetsenbordnavigatie door de hele app.'
    },
    {
      icon: 'Contrast',
      title: 'Hoog Contrast Modus',
      description: 'Extra groot en contrastrijk. Omdat details ertoe doen.'
    }
  ],

  testimonial: {
    quote: 'Eindelijk een dating app die ik zelfstandig kan gebruiken. De audio profielen zijn geweldig.',
    name: 'Marieke',
    age: 31,
    location: 'Den Haag'
  },

  contentTags: ['slechtziend', 'blind', 'visueel', 'toegankelijk', 'global'],

  enableAudioMode: true,
  enableHighContrast: true,
  enableLargeText: true,

  sourceTag: 'visueel',

  primaryColor: '#0ea5e9', // Sky - helder & duidelijk
  gradientFrom: '#0ea5e9',
  gradientTo: '#06b6d4',

  faqItems: [
    {
      question: 'Werkt de app met mijn screenreader?',
      answer: 'Ja! Wij ondersteunen VoiceOver (iOS), TalkBack (Android) en NVDA/JAWS (desktop). Alle knoppen en content hebben duidelijke labels.'
    },
    {
      question: 'Kan ik stemintroducties beluisteren?',
      answer: 'Absoluut. Veel leden nemen een korte audio-introductie op. Je kunt direct luisteren naar wie iemand is.'
    },
    {
      question: 'Hoe beschrijf ik mezelf zonder foto?',
      answer: 'Je kunt een audio-beschrijving van jezelf inspreken. Vertel over je persoonlijkheid, interesses en wat je zoekt.'
    }
  ],

  relatedSlugs: ['dating-met-beperking', 'toegankelijk-daten']
}

export const beperkingData: DoelgroepData = {
  slug: 'dating-met-beperking',
  zuil: 'fysiek',

  metaTitle: 'Dating met een Beperking | Liefde Voor Iedereen',
  metaDescription: 'Kijk verder dan de beperking. Een dating platform waar toegankelijkheid de standaard is. Voor rolstoelgebruikers, mensen met een chronische ziekte en iedereen die erbij hoort.',

  heroTitle: 'Kijk verder dan de beperking',
  heroSubtitle: 'Toegankelijkheid is hier de standaard',
  heroPainPoint: 'Op andere apps wordt je beperking het eerste wat mensen zien. Hier leren ze eerst jou kennen.',
  heroImage: '/images/landing/beperking-hero.jpg',

  features: [
    {
      icon: 'Eye',
      title: 'Jij Eerst, Niet Je Beperking',
      description: 'Profielen focussen op wie je bent, niet op je diagnose of hulpmiddel.'
    },
    {
      icon: 'MapPin',
      title: 'Toegankelijke Date Tips',
      description: 'Wij helpen met het vinden van rolstoeltoegankelijke locaties voor dates.'
    },
    {
      icon: 'Heart',
      title: 'Begripsvolle Community',
      description: 'Een plek waar je niet hoeft uit te leggen. Gewoon jezelf zijn is genoeg.'
    }
  ],

  testimonial: {
    quote: 'Ik dacht dat niemand op mijn rolstoel zat te wachten. Hier werd ik gezien om mijn humor en niet om mijn wielen.',
    name: 'Sanne',
    age: 28,
    location: 'Rotterdam'
  },

  contentTags: ['beperking', 'rolstoel', 'chronisch', 'fysiek', 'global'],

  sourceTag: 'beperking',

  primaryColor: '#8b5cf6', // Violet - kracht & waardigheid
  gradientFrom: '#8b5cf6',
  gradientTo: '#a855f7',

  faqItems: [
    {
      question: 'Moet ik mijn beperking in mijn profiel zetten?',
      answer: 'Dat is helemaal jouw keuze. Sommige leden vermelden het direct, anderen wachten tot een gesprek. Er is geen druk.'
    },
    {
      question: 'Zijn er andere mensen met een beperking op het platform?',
      answer: 'Ja, maar ook mensen zonder zichtbare beperking. Iedereen is welkom en respectvol naar elkaar.'
    }
  ],

  relatedSlugs: ['dating-voor-slechtzienden', 'toegankelijk-daten']
}

// =============================================================================
// ZUIL D: MENTALE GEZONDHEID
// =============================================================================

export const burnoutData: DoelgroepData = {
  slug: 'daten-met-burnout',
  zuil: 'mentaal',

  metaTitle: 'Daten met Burn-out | Liefde Voor Iedereen',
  metaDescription: 'Je hoeft niet perfect te zijn om liefde te vinden. Dating op jouw tempo, met begrip voor waar je doorheen gaat.',

  heroTitle: 'Je hoeft niet perfect te zijn',
  heroSubtitle: 'Dating op jouw tempo',
  heroPainPoint: '"Ik ben niet energiek genoeg voor dates." Wij snappen het. Hier mag je zijn wie je bent, ook op moeilijke dagen.',
  heroImage: '/images/landing/burnout-hero.jpg',

  features: [
    {
      icon: 'Battery',
      title: 'Energie-Bewust Daten',
      description: 'Geen druk om constant actief te zijn. Neem pauze wanneer je wilt.'
    },
    {
      icon: 'Moon',
      title: 'Rustige Matches',
      description: 'Vind iemand die ook een rustige avond thuis waardeert boven feesten.'
    },
    {
      icon: 'Heart',
      title: 'Begrip & Geduld',
      description: 'Een community waar mentale gezondheid bespreekbaar is, zonder oordeel.'
    }
  ],

  testimonial: {
    quote: 'Na mijn burnout dacht ik dat niemand mij zo zou willen. Hier vond ik iemand die snapt dat ik soms gewoon stil wil zijn.',
    name: 'Emma',
    age: 35,
    location: 'Eindhoven'
  },

  contentTags: ['burnout', 'mentaal', 'rust', 'global'],

  sourceTag: 'burnout',

  primaryColor: '#14b8a6', // Teal - kalmte & herstel
  gradientFrom: '#14b8a6',
  gradientTo: '#22c55e',

  relatedSlugs: ['dating-mentale-gezondheid']
}

export const alleenstaandeOudersData: DoelgroepData = {
  slug: 'dating-alleenstaande-ouders',
  zuil: 'mentaal',

  metaTitle: 'Dating voor Alleenstaande Ouders | Liefde Voor Iedereen',
  metaDescription: 'Je kinderen zijn geen dealbreaker, maar deel van wie je bent. Vind iemand die dat begrijpt en waardeert.',

  heroTitle: 'Je kinderen zijn een bonus',
  heroSubtitle: 'Liefde vinden als ouder',
  heroPainPoint: 'Op andere apps voelt het alsof kinderen een nadeel zijn. Hier zijn ze deel van het verhaal.',
  heroImage: '/images/landing/ouders-hero.jpg',

  features: [
    {
      icon: 'Users',
      title: 'Gezinsvriendelijk',
      description: 'Matches begrijpen dat je kinderen prioriteit zijn. Geen verrassingen.'
    },
    {
      icon: 'Calendar',
      title: 'Flexibel Plannen',
      description: 'We snappen dat je agenda vol zit. Date wanneer het uitkomt.'
    },
    {
      icon: 'Shield',
      title: 'Veiligheid Voorop',
      description: 'Extra verificatie en veiligheidsopties voor ouders.'
    }
  ],

  testimonial: {
    quote: 'Als alleenstaande vader was ik bang dat vrouwen zouden afhaken. Hier vond ik iemand die mijn zoon als bonus ziet.',
    name: 'Jeroen',
    age: 42,
    location: 'Breda'
  },

  contentTags: ['ouders', 'alleenstaand', 'gezin', 'global'],

  sourceTag: 'ouders',

  primaryColor: '#ec4899', // Pink - liefde & warmte
  gradientFrom: '#ec4899',
  gradientTo: '#f43f5e',

  relatedSlugs: ['dating-50-plus']
}

// =============================================================================
// EXTRA: 50+ / Eenzaamheid
// =============================================================================

export const vijftigPlusData: DoelgroepData = {
  slug: 'dating-50-plus',
  zuil: 'mentaal',

  metaTitle: '50+ Dating | Liefde Voor Iedereen',
  metaDescription: 'Nooit te laat voor de liefde. Een serieus dating platform voor 50-plussers die op zoek zijn naar een betekenisvolle connectie.',

  heroTitle: 'Nooit te laat voor liefde',
  heroSubtitle: 'Serieuze dating voor 50+',
  heroPainPoint: 'De meeste dating apps voelen als een jongerenfeestje. Wij zijn er voor volwassen liefde.',
  heroImage: '/images/landing/50plus-hero.jpg',

  features: [
    {
      icon: 'Coffee',
      title: 'Rust & Diepgang',
      description: 'Geen swipen. Leer iemand echt kennen via uitgebreide profielen.'
    },
    {
      icon: 'MessageCircle',
      title: 'Kwaliteit boven Kwantiteit',
      description: 'Minder matches, maar wel serieuze mensen die ook echt zoeken.'
    },
    {
      icon: 'Heart',
      title: 'Levenservaring Welkom',
      description: 'Je verhaal, met alle ups en downs, maakt je interessant.'
    }
  ],

  testimonial: {
    quote: 'Na 30 jaar huwelijk wist ik niet of er nog iemand voor mij zou zijn. Op deze site vond ik een nieuwe kans op geluk.',
    name: 'Henk',
    age: 62,
    location: 'Nijmegen'
  },

  contentTags: ['50plus', 'senioren', 'volwassen', 'global'],
  enableLargeText: true,

  sourceTag: '50plus',

  primaryColor: '#dc2626', // Red - passie & warmte
  gradientFrom: '#dc2626',
  gradientTo: '#f97316',

  relatedSlugs: ['dating-alleenstaande-ouders']
}

// =============================================================================
// ALLE DOELGROEPEN EXPORT
// =============================================================================

export const alleDoelgroepen: DoelgroepData[] = [
  autismeData,
  adhdData,
  lvbData,
  slechtziendData,
  beperkingData,
  burnoutData,
  alleenstaandeOudersData,
  vijftigPlusData
]

export const getDoelgroepBySlug = (slug: string): DoelgroepData | undefined => {
  return alleDoelgroepen.find(d => d.slug === slug)
}

export const getDoelgroepenByZuil = (zuil: DoelgroepZuil): DoelgroepData[] => {
  return alleDoelgroepen.filter(d => d.zuil === zuil)
}

// Prioriteit volgorde voor navigatie
export const prioriteitVolgorde = [
  'dating-met-autisme',      // Prio 1
  'veilig-daten-lvb',        // Prio 1
  'dating-met-beperking',    // Prio 1
  'dating-voor-slechtzienden', // Speciaal
  'dating-50-plus',          // Prio 2
  'daten-met-burnout',       // Prio 2
  'dating-met-adhd',         // Prio 3
  'dating-alleenstaande-ouders' // Prio 3
]

// =============================================================================
// BLOG ARTIKELEN DATA
// =============================================================================

export interface BlogArtikel {
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage: string
  category: 'dating-tips' | 'succesverhalen' | 'veiligheid' | 'voor-jou'
  tags: string[]
  readTime: number
  publishedAt: string
  simpleVersion?: string // Vereenvoudigde versie voor LVB
  audioAvailable?: boolean
}

export const blogArtikelen: BlogArtikel[] = [
  {
    slug: 'daten-zonder-masker',
    title: 'Daten zonder masker: Waarom je hier jezelf mag zijn',
    excerpt: 'Op veel dating apps voelt het alsof je een rol moet spelen. Wij geloven dat de beste relaties beginnen met eerlijkheid.',
    content: `
# Daten zonder masker

Op veel dating apps voelt het alsof je een rol moet spelen. Je foto's moeten perfect zijn, je bio moet grappig zijn, en je moet altijd snel en gevat reageren. Maar wat als dat niet jouw stijl is?

## Waarom eerlijkheid wint

De beste relaties beginnen niet met een perfect eerste indruk. Ze beginnen met echte connectie. Iemand die van je houdt om wie je écht bent, niet om wie je doet alsof je bent.

## Tips voor authentiek daten

1. **Schrijf je bio zoals je praat** - Geen marketingtaal, gewoon jij
2. **Gebruik recente foto's** - Beter een eerlijke foto dan teleurstelling bij de eerste date
3. **Wees open over wat je zoekt** - Serieus? Casual? Weet het nog niet? Prima, zeg het gewoon
4. **Neem de tijd** - Je hoeft niet binnen 5 minuten te reageren

## Het voordeel van neurodiversiteit in relaties

Veel mensen met autisme of ADHD zijn juist heel eerlijk en direct. In een wereld vol dating games is dat een verfrissende eigenschap. Omarm het.
    `,
    featuredImage: '/images/blog/daten-zonder-masker.jpg',
    category: 'voor-jou',
    tags: ['autisme', 'adhd', 'neurodiversiteit', 'authenticiteit'],
    readTime: 4,
    publishedAt: '2025-01-02',
    audioAvailable: true
  },
  {
    slug: 'veilig-daten-tips',
    title: 'Veilig daten doe je zo',
    excerpt: 'Hoe weet je of iemand te vertrouwen is? Wij leggen uit waar je op moet letten.',
    content: `
# Veilig daten doe je zo

Het is belangrijk om veilig te daten. Hier zijn tips die je helpen.

## Herken nepprofielen

- Foto lijkt te mooi? Pas op!
- Iemand vraagt snel om geld? Blokkeren!
- Wil iemand heel snel afspreken? Neem de tijd

## Eerste date tips

- Spreek af op een openbare plek
- Vertel een vriend waar je bent
- Ga niet mee naar huis bij de eerste date

## Wij passen op je

Alle profielen worden door ons gecontroleerd. Zie je iets raars? Meld het!
    `,
    featuredImage: '/images/blog/veilig-daten.jpg',
    category: 'veiligheid',
    tags: ['lvb', 'veilig', 'begeleiding', 'global'],
    readTime: 3,
    publishedAt: '2025-01-02',
    simpleVersion: `
# Veilig daten

## Pas op voor deze dingen:
- Iemand vraagt om geld = NEE
- Foto is te mooi = Pas op
- Te snel afspreken = Rustig aan

## Eerste date:
- Ga naar een café of restaurant
- Zeg tegen iemand waar je bent
- Ga niet mee naar iemands huis

## Hulp nodig?
Klik op de HELP knop. Wij helpen je.
    `,
    audioAvailable: true
  },
  {
    slug: 'liefde-is-blind',
    title: 'Liefde is blind, maar onze app niet',
    excerpt: 'Hoe wij dating toegankelijk maken voor slechtzienden en blinden.',
    content: `
# Liefde is blind, maar onze app niet

De meeste dating apps zijn visueel. Swipen op foto's, scannen van profielen - niet ideaal als je slechtziend of blind bent.

## Wat wij anders doen

### Audio Profielen
Elk lid kan een stemintroductie opnemen. Hoor hoe iemand klinkt, niet alleen hoe ze eruitzien.

### Screenreader Support
Onze app werkt naadloos met VoiceOver, TalkBack en NVDA. Elke knop heeft een duidelijk label.

### Hoog Contrast Modus
Voor slechtzienden: extra grote tekst en maximaal contrast.

## Persoonlijkheid boven uiterlijk

Is dat eigenlijk niet hoe dating zou moeten zijn? Verliefd worden op wie iemand is, niet alleen op hoe ze eruitzien.
    `,
    featuredImage: '/images/blog/liefde-is-blind.jpg',
    category: 'voor-jou',
    tags: ['slechtziend', 'blind', 'visueel', 'toegankelijk'],
    readTime: 5,
    publishedAt: '2025-01-02',
    audioAvailable: true
  },
  {
    slug: 'onze-missie',
    title: 'Liefde Voor Iedereen: Onze missie en belofte',
    excerpt: 'Waarom wij geloven dat liefde er voor iedereen is, ongeacht je achtergrond of situatie.',
    content: `
# Liefde Voor Iedereen

## Onze missie

Wij geloven dat iedereen liefde verdient. Of je nu neurodiverste bent, een beperking hebt, of gewoon moe bent van oppervlakkige dating apps - er is een plek voor je.

## Wat ons anders maakt

- **Geen swipen** - We geloven in kwaliteit boven kwantiteit
- **Toegankelijkheid** - Onze app werkt voor iedereen
- **Veiligheid** - Elk profiel wordt gecontroleerd
- **Nederlandse service** - Echte mensen, geen bots

## Onze belofte

We behandelen je met respect. Je data verkopen we niet. En we blijven luisteren naar wat jij nodig hebt.
    `,
    featuredImage: '/images/blog/onze-missie.jpg',
    category: 'succesverhalen',
    tags: ['global', 'missie', 'over-ons'],
    readTime: 4,
    publishedAt: '2025-01-01',
    audioAvailable: true
  }
]

export const getBlogBySlug = (slug: string) => blogArtikelen.find(b => b.slug === slug)

export const getBlogsByTag = (tag: string) => blogArtikelen.filter(b => b.tags.includes(tag))
