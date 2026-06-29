import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Center - Veilig Online Daten | Liefde Voor Iedereen',
  description: 'Veilig daten begint bij Liefde Voor Iedereen. Ontdek onze veiligheidstips, rapportage-opties, blokkeerfuncties en richtlijnen voor veilig online daten in Nederland en België.',
  keywords: ['veilig daten', 'online dating veiligheid', 'dating tips veiligheid', 'scam preventie', 'veiligheid dating app'],
  openGraph: {
    title: 'Safety Center - Veilig Online Daten',
    description: 'Veilig daten begint hier. Tips, tools en rapportage-opties.',
    url: 'https://www.liefdevooriedereen.nl/safety',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Safety Center - Veilig Online Daten',
    description: 'Veilig daten begint hier. Tips, tools en rapportage-opties.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/safety',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SafetyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
