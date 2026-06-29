import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liefdestaal Quiz - Ontdek Jouw Liefdestaal | Liefde Voor Iedereen',
  description: 'Welke liefdestaal spreek jij? Ontdek of je liefde geeft via bevestiging, tijd, dienstbaarheid, cadeaus of aanraking. Doe de gratis quiz.',
  keywords: ['liefdestaal quiz', '5 love languages test', 'liefdestalen', 'relatie test', 'hoe geef ik liefde'],
  openGraph: {
    title: 'Liefdestaal Quiz - Ontdek hoe jij liefde geeft',
    description: 'Bevestiging, tijd, dienstbaarheid, cadeaus of aanraking? Ontdek jouw liefdestaal.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/liefdetaal-quiz',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liefdestaal Quiz',
    description: 'Ontdek hoe jij liefde geeft en ontvangt. Gratis test.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/liefdetaal-quiz',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LiefdestaalQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
