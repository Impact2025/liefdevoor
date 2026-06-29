import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ambassadeur Worden - Liefde Voor Iedereen',
  description: 'Word ambassadeur van Liefde Voor Iedereen en help mee om daten voor iedereen toegankelijk te maken. Ontdek onze ambassadeursprogramma\'s.',
  keywords: ['ambassadeur', 'dating ambassadeur', 'promoten', 'dating app ambassadeur'],
  openGraph: {
    title: 'Ambassadeur Worden - Liefde Voor Iedereen',
    description: 'Help mee om daten voor iedereen toegankelijk te maken.',
    url: 'https://www.liefdevooriedereen.nl/ambassadeur',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ambassadeur Worden',
    description: 'Help mee om daten voor iedereen toegankelijk te maken.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/ambassadeur',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AmbassadeurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
