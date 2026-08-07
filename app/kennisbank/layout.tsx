import { Metadata } from 'next'
import { canonical } from '@/lib/site-url'

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
    url: canonical('/kennisbank'),
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: canonical('/kennisbank'),
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
