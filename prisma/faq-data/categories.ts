/**
 * FAQ Categories
 * All FAQ categories for Liefde Voor Iedereen
 */

export interface FAQCategoryData {
  name: string
  nameNl: string
  description: string
  icon: string
  slug: string
  order: number
  isVisible: boolean
}

export const faqCategories: FAQCategoryData[] = [
  {
    name: 'Getting Started',
    nameNl: 'Aan de slag',
    description: 'Alles over registreren, onboarding en je eerste stappen op Liefde Voor Iedereen',
    icon: '🚀',
    slug: 'aan-de-slag',
    order: 1,
    isVisible: true
  },
  {
    name: 'Profile Management',
    nameNl: 'Profielbeheer',
    description: 'Beheer je profiel, foto\'s, bio en persoonlijke instellingen',
    icon: '👤',
    slug: 'profielbeheer',
    order: 2,
    isVisible: true
  },
  {
    name: 'Discover & Matching',
    nameNl: 'Ontdekken & Matchen',
    description: 'Leer hoe je swipen, matchen en nieuwe mensen ontdekken werkt',
    icon: '💕',
    slug: 'ontdekken-matchen',
    order: 3,
    isVisible: true
  },
  {
    name: 'Messages & Chat',
    nameNl: 'Berichten & Chat',
    description: 'Alles over chatten, berichten sturen en communiceren met je matches',
    icon: '💬',
    slug: 'berichten-chat',
    order: 4,
    isVisible: true
  },
  {
    name: 'Premium Features',
    nameNl: 'Premium Functies',
    description: 'Ontdek alle premium functies zoals Boost, Passport en Incognito',
    icon: '⭐',
    slug: 'premium-functies',
    order: 5,
    isVisible: true
  },
  {
    name: 'Subscriptions & Payments',
    nameNl: 'Abonnementen & Betalingen',
    description: 'Informatie over abonnementen, prijzen, betalingen en opzeggen',
    icon: '💳',
    slug: 'abonnementen-betalingen',
    order: 6,
    isVisible: true
  },
  {
    name: 'Safety & Trust',
    nameNl: 'Veiligheid & Vertrouwen',
    description: 'Verificatie, blokkeren, rapporteren en veilig online daten',
    icon: '🛡️',
    slug: 'veiligheid-vertrouwen',
    order: 7,
    isVisible: true
  },
  {
    name: 'Privacy & Data',
    nameNl: 'Privacy & Gegevens',
    description: 'Je privacy, gegevensbescherming, AVG en data beheren',
    icon: '🔒',
    slug: 'privacy-gegevens',
    order: 8,
    isVisible: true
  },
  {
    name: 'Technical Help',
    nameNl: 'Technische Hulp',
    description: 'Oplossingen voor technische problemen, bugs en app-issues',
    icon: '⚙️',
    slug: 'technische-hulp',
    order: 9,
    isVisible: true
  },
  {
    name: 'Accessibility',
    nameNl: 'Toegankelijkheid',
    description: 'Toegankelijkheidsopties voor een betere gebruikservaring',
    icon: '♿',
    slug: 'toegankelijkheid',
    order: 10,
    isVisible: true
  }
]
