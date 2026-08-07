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

  /**
   * Zoekwoordgerichte H1. De heroTitle is emotionele copy zonder zoekwoord,
   * waardoor deze pagina's op positie 20-50 bleven hangen terwijl de
   * handgebouwde /veilig-daten-lvb (H1 "Veilig Daten met LVB") wel scoort.
   * Staat deze gezet, dan wordt de heroTitle de zichtbare subkop.
   */
  seoH1?: string

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

  metaTitle: 'Daten met Autisme: Datingsite zonder Spelletjes',
  metaDescription: 'Daten met autisme zonder onduidelijke signalen. Een Nederlandse datingsite met duidelijke communicatie, rust in het tempo en leden die je niet hoeven te begrijpen — ze snappen het al.',

  seoH1: 'Daten met Autisme',
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

  metaTitle: 'Daten met ADHD: Dating zonder Oordeel',
  metaDescription: 'Dating met ADHD kan overweldigend zijn. Wij begrijpen dat. Vind iemand die jouw energie waardeert en niet afschrikt van je spontaniteit.',

  seoH1: 'Daten met ADHD',
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

  metaTitle: 'Veilig Daten met LVB: Datingsite met Begeleiding',
  metaDescription: 'Veilig daten met extra uitleg en hulp. Duidelijke knoppen, eenvoudige tekst en begeleiding wanneer je dat wilt. Voor iedereen die het rustig aan wil doen.',

  seoH1: 'Veilig Daten met LVB',
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

  metaTitle: 'Daten voor Blinden en Slechtzienden',
  metaDescription: 'Volledig toegankelijke dating met screenreader ondersteuning, audio profielen en text-to-speech. Liefde zien we met het hart.',

  seoH1: 'Daten voor Blinden en Slechtzienden',
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

  metaTitle: 'Datingsite voor Mensen met een Beperking',
  metaDescription: 'Daten met een beperking op een Nederlandse datingsite waar toegankelijkheid de standaard is. Voor rolstoelgebruikers, mensen met een chronische ziekte en iedereen die er gewoon bij hoort.',

  seoH1: 'Daten met een Beperking',
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

  metaTitle: 'Daten met Burn-out: Dating op Jouw Tempo',
  metaDescription: 'Je hoeft niet perfect te zijn om liefde te vinden. Dating op jouw tempo, met begrip voor waar je doorheen gaat.',

  seoH1: 'Daten met Burn-out',
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

  metaTitle: 'Daten als Alleenstaande Ouder: Serieus Daten',
  metaDescription: 'Je kinderen zijn geen dealbreaker, maar deel van wie je bent. Vind iemand die dat begrijpt en waardeert.',

  seoH1: 'Daten als Alleenstaande Ouder',
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

  metaTitle: 'Daten 50 Plus: Serieuze Dating voor 50-plussers',
  metaDescription: 'Nooit te laat voor de liefde. Een serieus dating platform voor 50-plussers die op zoek zijn naar een betekenisvolle connectie.',

  seoH1: 'Daten 50 Plus',
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

// adhdData en lvbData zijn hier bewust uitgesloten: ADHD heeft een eigen,
// uitgebreidere static route op /daten-adhd-hsp en LVB op /veilig-daten-lvb.
// Die routes winnen toch van deze catch-all, dus meedraaien hier levert
// alleen een dode, onbereikbare tweede URL per doelgroep op (zie SEO-audit).
export const alleDoelgroepen: DoelgroepData[] = [
  autismeData,
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
// BLOG ARTIKELEN DATA - DEPRECATED
// =============================================================================
// NOTE: Blog articles have been migrated to the database.
// They are now managed via /admin/blog and fetched via /api/blog/posts
// The static blog data below has been removed to avoid confusion.
// See scripts/migrate-static-blogs.ts for the migration script.
