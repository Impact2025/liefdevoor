import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hechtingsstijl Quiz - Ontdek Jouw Hechtingsstijl | Liefde Voor Iedereen',
  description: 'Ontdek of je een veilige, angstige of vermijdende hechtingsstijl hebt. Deze gratis quiz geeft je inzicht in hoe jij je hecht in relaties.',
  keywords: ['hechtingsstijl quiz', 'hechtingsstijlen test', 'attachment style test', 'relatiepatronen', 'veilig hechten'],
  openGraph: {
    title: 'Hechtingsstijl Quiz - Ontdek hoe jij je hecht',
    description: 'Veilig, angstig of vermijdend? Ontdek jouw hechtingsstijl. Gratis test.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/hechtingsstijl-quiz',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hechtingsstijl Quiz',
    description: 'Veilig, angstig of vermijdend? Ontdek jouw hechtingsstijl.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/hechtingsstijl-quiz',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HechtingsstijlQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
