import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scam Checker - Check of een Profiel Echt is | Liefde Voor Iedereen',
  description: 'Twijfel je of een datingprofiel echt is? Gebruik onze scam checker om verdachte profielen te controleren op oplichtingspatronen. Gratis en anoniem.',
  keywords: ['scam checker', 'dating profiel check', 'oplichting herkennen', 'nep profiel dating', 'romance scam check'],
  openGraph: {
    title: 'Scam Checker - Check of een profiel echt is',
    description: 'Twijfel je? Check of een profiel verdachte oplichtingspatronen vertoont.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/scam-checker',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scam Checker',
    description: 'Check of een datingprofiel echt of nep is. Gratis en anoniem.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/scam-checker',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ScamCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
