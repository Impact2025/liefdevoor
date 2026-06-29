import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Begrippen - Liefde Voor Iedereen',
    default: 'Begrippen & Termen - Dating Encyclopedie | Liefde Voor Iedereen',
  },
  description: 'Alles wat je moet weten over dating termen en begrippen. Van swipen tot ghosting, onze begrippenlijst legt het allemaal uit.',
  keywords: ['dating begrippen', 'dating termen', 'swipen', 'ghosting', 'dating woordenboek'],
  openGraph: {
    title: 'Begrippen & Termen - Dating Encyclopedie',
    description: 'Alles over dating termen uitgelegd. Van swipen tot ghosting.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/begrippen',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Begrippen & Termen - Dating Encyclopedie',
    description: 'Alles over dating termen uitgelegd.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/begrippen',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BegrippenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
