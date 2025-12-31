import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Kennisbank - Liefde Voor Iedereen',
    default: 'Kennisbank - Liefde Voor Iedereen',
  },
  description: 'De complete dating encyclopedie van Nederland. Alles over veilig daten, inclusief daten, communicatie en relaties.',
  keywords: ['dating kennisbank', 'veilig daten', 'online dating tips', 'romance scam', 'dating met autisme', 'dating met lvb'],
  openGraph: {
    title: 'Kennisbank - Liefde Voor Iedereen',
    description: 'De complete dating encyclopedie van Nederland. Veiligheid, inclusiviteit, en praktische tips.',
    type: 'website',
    locale: 'nl_NL',
    url: 'https://liefdevoorIedereen.nl/kennisbank',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://liefdevoorIedereen.nl/kennisbank',
  },
}

export default function KennisbankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
