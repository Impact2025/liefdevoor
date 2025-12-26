/**
 * Personalized Conversation Starters Generator
 *
 * Generates conversation starters based on:
 * - Shared interests
 * - Personality compatibility
 * - Love languages
 * - Profile information
 */

interface UserData {
  name: string
  interests?: string | null
  bio?: string | null
  city?: string | null
  occupation?: string | null
  psychProfile?: {
    introvertScale?: number | null
    spontaneityScale?: number | null
    adventureScale?: number | null
    relationshipGoal?: string | null
    loveLangWords?: number | null
    loveLangTime?: number | null
    loveLangGifts?: number | null
    loveLangActs?: number | null
    loveLangTouch?: number | null
  } | null
}

interface PersonalizedStarter {
  emoji: string
  text: string
  reason: string // Why this starter was suggested
  category: 'shared_interest' | 'personality' | 'love_language' | 'location' | 'generic'
}

// Interest-based conversation starters
const INTEREST_STARTERS: Record<string, { emoji: string; questions: string[] }> = {
  reizen: {
    emoji: '✈️',
    questions: [
      'Wat is de mooiste plek waar je ooit bent geweest?',
      'Welk land staat nog op je bucket list?',
      'Reis je liever alleen of met gezelschap?',
      'Wat is je favoriete vakantieherinnering?',
    ],
  },
  muziek: {
    emoji: '🎵',
    questions: [
      'Welke artiest zou je nog willen zien live?',
      'Wat is je favoriete liedje op dit moment?',
      'Speel je zelf een instrument?',
      'Wat voor muziek luister je het liefst?',
    ],
  },
  sport: {
    emoji: '⚽',
    questions: [
      'Doe je aan sport? Zo ja, welke?',
      'Ben je fan van een specifiek team?',
      'Wat is het spannendste sportevenement dat je hebt meegemaakt?',
    ],
  },
  fitness: {
    emoji: '💪',
    questions: [
      'Hoe vaak ga je naar de gym?',
      'Wat is je favoriete workout?',
      'Train je liever solo of met iemand?',
    ],
  },
  koken: {
    emoji: '👨‍🍳',
    questions: [
      'Wat is je signature gerecht?',
      'Welke keuken maak je het liefst?',
      'Heb je een geheim recept dat je wilt delen?',
    ],
  },
  fotografie: {
    emoji: '📸',
    questions: [
      'Wat fotografeer je het liefst?',
      'Heb je een favoriete foto die je hebt gemaakt?',
      'Ben je meer van spontane of geposeerde fotos?',
    ],
  },
  film: {
    emoji: '🎬',
    questions: [
      'Wat is je favoriete film aller tijden?',
      'Welke film zou je nog wel een keer willen zien?',
      'Ben je meer van actiefilms of romcoms?',
    ],
  },
  lezen: {
    emoji: '📚',
    questions: [
      'Welk boek las je het laatst?',
      'Heb je een favoriete auteur?',
      'Fysiek boek of e-reader?',
    ],
  },
  gaming: {
    emoji: '🎮',
    questions: [
      'Welke game speel je nu?',
      'Wat is je all-time favorite game?',
      'Console of PC?',
    ],
  },
  wandelen: {
    emoji: '🥾',
    questions: [
      'Wat is de mooiste wandeling die je hebt gemaakt?',
      'Ga je liever korte of lange wandelingen?',
      'Heb je een favoriete wandelplek?',
    ],
  },
  yoga: {
    emoji: '🧘',
    questions: [
      'Hoe lang doe je al aan yoga?',
      'Welke stijl yoga vind je het fijnst?',
      'Doe je yoga thuis of in een studio?',
    ],
  },
  dieren: {
    emoji: '🐕',
    questions: [
      'Heb je huisdieren?',
      'Wat is je favoriete dier?',
      'Ben je meer een honden- of kattenmens?',
    ],
  },
  kunst: {
    emoji: '🎨',
    questions: [
      'Welke kunstvorm spreekt je het meest aan?',
      'Heb je een favoriete artiest?',
      'Maak je zelf ook kunst?',
    ],
  },
}

// Personality-based starters
const PERSONALITY_STARTERS = {
  adventurous: [
    { emoji: '🌍', text: 'Wat is het gekste avontuur dat je ooit hebt beleefd?' },
    { emoji: '🎢', text: 'Ben je iemand die ja zegt tegen spontane uitjes?' },
    { emoji: '🏔️', text: 'Wat staat nog op je adventure bucket list?' },
  ],
  spontaneous: [
    { emoji: '🎲', text: 'Wat was het laatste spontane dat je hebt gedaan?' },
    { emoji: '🌙', text: 'Ben je iemand voor last-minute plannen?' },
    { emoji: '🚗', text: 'Zin in een spontane roadtrip?' },
  ],
  social: [
    { emoji: '🎉', text: 'Ben je iemand voor grote feesten of kleine gezelschappen?' },
    { emoji: '☕', text: 'Hoe zou jouw ideale weekend eruitzien?' },
    { emoji: '🍷', text: 'Liever uit of thuis met vrienden?' },
  ],
  introverted: [
    { emoji: '📖', text: 'Hoe breng je het liefst een rustige avond door?' },
    { emoji: '🏠', text: 'Ben je ook zo iemand die quality time waardeert?' },
    { emoji: '🎧', text: 'Wat is jouw go-to om te relaxen?' },
  ],
}

// Love language based starters
const LOVE_LANGUAGE_STARTERS = {
  words: [
    { emoji: '💬', text: 'Wat is het mooiste compliment dat je ooit hebt gekregen?' },
    { emoji: '✍️', text: 'Ben je iemand die liefde uitspreekt of liever laat zien?' },
  ],
  time: [
    { emoji: '⏰', text: 'Hoe zou jouw perfecte date eruitzien?' },
    { emoji: '🌅', text: 'Welke activiteit zou je samen willen doen?' },
  ],
  gifts: [
    { emoji: '🎁', text: 'Wat is het meest thoughtful cadeau dat je ooit hebt gegeven?' },
    { emoji: '💝', text: 'Ben je iemand die graag kleine attenties geeft?' },
  ],
  acts: [
    { emoji: '🤝', text: 'Wat doe je het liefst voor iemand om ze te laten weten dat je om ze geeft?' },
    { emoji: '💪', text: 'Ben je iemand die graag helpt?' },
  ],
  touch: [
    { emoji: '🤗', text: 'Ben je iemand voor spontane knuffels?' },
    { emoji: '💑', text: 'Wat vind je fijner: hand vasthouden of arm om je heen?' },
  ],
}

// Location-based starters
function getLocationStarters(city: string): PersonalizedStarter[] {
  return [
    {
      emoji: '📍',
      text: `Ken je leuke plekjes in ${city} die je zou aanraden?`,
      reason: `Jullie wonen allebei in ${city}`,
      category: 'location',
    },
    {
      emoji: '☕',
      text: `Wat is je favoriete café in ${city}?`,
      reason: `Gedeelde locatie`,
      category: 'location',
    },
    {
      emoji: '🍕',
      text: `Heb je een restaurant tip in ${city}?`,
      reason: `Jullie wonen in dezelfde stad`,
      category: 'location',
    },
  ]
}

// Parse interests from string
function parseInterests(interests: string): string[] {
  return interests
    .toLowerCase()
    .split(/[,;|]/)
    .map((i) => i.trim())
    .filter((i) => i.length > 0)
}

// Find shared interests
function findSharedInterests(user1: string[], user2: string[]): string[] {
  return user1.filter((i) => user2.includes(i))
}

// Get primary love language
function getPrimaryLoveLanguage(
  profile: UserData['psychProfile']
): 'words' | 'time' | 'gifts' | 'acts' | 'touch' | null {
  if (!profile) return null

  const languages = [
    { key: 'words', value: profile.loveLangWords },
    { key: 'time', value: profile.loveLangTime },
    { key: 'gifts', value: profile.loveLangGifts },
    { key: 'acts', value: profile.loveLangActs },
    { key: 'touch', value: profile.loveLangTouch },
  ] as const

  let max = 0
  let primary: 'words' | 'time' | 'gifts' | 'acts' | 'touch' | null = null

  for (const lang of languages) {
    if (lang.value !== null && lang.value !== undefined && lang.value > max) {
      max = lang.value
      primary = lang.key
    }
  }

  return primary
}

/**
 * Generate personalized conversation starters for two users
 */
export function generatePersonalizedStarters(
  currentUser: UserData,
  otherUser: UserData,
  limit = 5
): PersonalizedStarter[] {
  const starters: PersonalizedStarter[] = []

  // 1. Shared interests (highest priority)
  if (currentUser.interests && otherUser.interests) {
    const userInterests = parseInterests(currentUser.interests)
    const otherInterests = parseInterests(otherUser.interests)
    const shared = findSharedInterests(userInterests, otherInterests)

    for (const interest of shared) {
      // Find matching interest category
      for (const [key, data] of Object.entries(INTEREST_STARTERS)) {
        if (interest.includes(key) || key.includes(interest)) {
          const randomQuestion = data.questions[Math.floor(Math.random() * data.questions.length)]
          starters.push({
            emoji: data.emoji,
            text: randomQuestion,
            reason: `Jullie houden allebei van ${interest}`,
            category: 'shared_interest',
          })
          break
        }
      }
    }
  }

  // 2. Same city
  if (
    currentUser.city &&
    otherUser.city &&
    currentUser.city.toLowerCase() === otherUser.city.toLowerCase()
  ) {
    const locationStarters = getLocationStarters(currentUser.city)
    starters.push(locationStarters[Math.floor(Math.random() * locationStarters.length)])
  }

  // 3. Personality-based
  const otherPsych = otherUser.psychProfile
  if (otherPsych) {
    // Adventurous
    if (otherPsych.adventureScale && otherPsych.adventureScale >= 6) {
      const advStarters = PERSONALITY_STARTERS.adventurous
      const random = advStarters[Math.floor(Math.random() * advStarters.length)]
      starters.push({
        ...random,
        reason: `${otherUser.name} lijkt avontuurlijk`,
        category: 'personality',
      })
    }

    // Spontaneous
    if (otherPsych.spontaneityScale && otherPsych.spontaneityScale >= 6) {
      const spStarters = PERSONALITY_STARTERS.spontaneous
      const random = spStarters[Math.floor(Math.random() * spStarters.length)]
      starters.push({
        ...random,
        reason: `${otherUser.name} lijkt spontaan`,
        category: 'personality',
      })
    }

    // Social vs Introverted
    if (otherPsych.introvertScale !== null && otherPsych.introvertScale !== undefined) {
      if (otherPsych.introvertScale >= 6) {
        const socStarters = PERSONALITY_STARTERS.social
        const random = socStarters[Math.floor(Math.random() * socStarters.length)]
        starters.push({
          ...random,
          reason: 'Gebaseerd op persoonlijkheid',
          category: 'personality',
        })
      } else if (otherPsych.introvertScale <= 4) {
        const intStarters = PERSONALITY_STARTERS.introverted
        const random = intStarters[Math.floor(Math.random() * intStarters.length)]
        starters.push({
          ...random,
          reason: 'Gebaseerd op persoonlijkheid',
          category: 'personality',
        })
      }
    }
  }

  // 4. Love language based
  const userLoveLang = getPrimaryLoveLanguage(currentUser.psychProfile)
  const otherLoveLang = getPrimaryLoveLanguage(otherUser.psychProfile)

  if (userLoveLang && otherLoveLang && userLoveLang === otherLoveLang) {
    const langStarters = LOVE_LANGUAGE_STARTERS[userLoveLang]
    const random = langStarters[Math.floor(Math.random() * langStarters.length)]
    starters.push({
      ...random,
      reason: 'Gedeelde love language',
      category: 'love_language',
    })
  }

  // 5. Relationship goal based
  if (otherPsych?.relationshipGoal === 'serious' || otherPsych?.relationshipGoal === 'marriage') {
    starters.push({
      emoji: '💭',
      text: 'Wat zoek je eigenlijk in een relatie?',
      reason: 'Jullie zoeken allebei iets serieus',
      category: 'personality',
    })
  }

  // Remove duplicates and limit
  const uniqueStarters = starters.filter(
    (s, i, arr) => arr.findIndex((x) => x.text === s.text) === i
  )

  // Shuffle and limit
  const shuffled = uniqueStarters.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

/**
 * Get generic conversation starters (fallback)
 */
export function getGenericStarters(): PersonalizedStarter[] {
  return [
    {
      emoji: '👋',
      text: 'Hey! Hoe gaat het met je?',
      reason: 'Klassieke opener',
      category: 'generic',
    },
    {
      emoji: '😊',
      text: 'Leuk om je te matchen! Vertel eens iets over jezelf',
      reason: 'Nieuwsgierig naar de ander',
      category: 'generic',
    },
    {
      emoji: '🌟',
      text: 'Je profiel sprak me meteen aan! Wat doe je zoal?',
      reason: 'Interesse tonen',
      category: 'generic',
    },
    {
      emoji: '☕',
      text: 'Zin om een keer koffie te drinken en te kletsen?',
      reason: 'Direct to the point',
      category: 'generic',
    },
    {
      emoji: '🎯',
      text: 'Wat is het leukste dat je deze week hebt gedaan?',
      reason: 'Recente ervaringen delen',
      category: 'generic',
    },
  ]
}
