import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compatibility Quiz - Match Test | Liefde Voor Iedereen',
  description: 'Ontdek hoe goed jij en je date bij elkaar passen met onze compatibility quiz. Beantwoord 10 vragen en krijg inzicht in jullie match.',
  keywords: ['compatibility quiz', 'match test', 'relatie quiz', 'dating quiz', 'passen wij bij elkaar'],
  openGraph: {
    title: 'Compatibility Quiz - Ontdek jullie match',
    description: 'Hoe goed passen jullie bij elkaar? Doe de gratis test.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/compatibility-quiz',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compatibility Quiz - Ontdek jullie match',
    description: 'Hoe goed passen jullie bij elkaar? Doe de gratis test.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/compatibility-quiz',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CompatibilityQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
