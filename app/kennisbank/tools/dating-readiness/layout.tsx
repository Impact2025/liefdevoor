import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dating Readiness Check - Ben je er klaar voor? | Liefde Voor Iedereen',
  description: 'Check of je er klaar voor bent om te daten. Onze dating readiness quiz helpt je inzicht te krijgen in je emotionele paraatheid en datingdoelen.',
  keywords: ['dating readiness', 'klaar om te daten', 'dating voorbereiding', 'zelfreflectie dating', 'dating check'],
  openGraph: {
    title: 'Dating Readiness Check - Ben je er klaar voor?',
    description: 'Check of je er klaar voor bent om te daten. Gratis online test.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/dating-readiness',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dating Readiness Check',
    description: 'Check of je er klaar voor bent om te daten.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/dating-readiness',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DatingReadinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
