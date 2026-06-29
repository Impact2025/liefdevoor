import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Red Flag Checklist - Herken Waarschuwingssignalen | Liefde Voor Iedereen',
  description: 'Herken rode vlaggen in online dating met onze red flag checklist. Leer waarschuwingssignalen herkennen voordat je een foute match maakt.',
  keywords: ['red flag checklist', 'rode vlaggen dating', 'waarschuwingssignalen', 'online dating gevaren', 'foute match herkennen'],
  openGraph: {
    title: 'Red Flag Checklist - Herken waarschuwingssignalen',
    description: 'Leer rode vlaggen herkennen voordat je een foute match maakt.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/red-flag-checklist',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Red Flag Checklist',
    description: 'Herken waarschuwingssignalen in online dating.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/red-flag-checklist',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RedFlagChecklistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
