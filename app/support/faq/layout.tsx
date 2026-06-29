import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veelgestelde Vragen - FAQ | Liefde Voor Iedereen',
  description: 'Antwoorden op de meest gestelde vragen over Liefde Voor Iedereen. Van aanmelden tot betalen, van veiligheid tot profiel verwijderen.',
  keywords: ['FAQ', 'veelgestelde vragen', 'hulp', 'ondersteuning', 'dating app vragen'],
  openGraph: {
    title: 'Veelgestelde Vragen - FAQ',
    description: 'Antwoorden op de meest gestelde vragen over Liefde Voor Iedereen.',
    url: 'https://www.liefdevooriedereen.nl/support/faq',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Veelgestelde Vragen - FAQ', description: 'Antwoorden op de meest gestelde vragen.' },
  alternates: { canonical: 'https://www.liefdevooriedereen.nl/support/faq' },
  robots: { index: true, follow: true },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
