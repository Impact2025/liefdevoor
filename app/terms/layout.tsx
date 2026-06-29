import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden - Liefde Voor Iedereen',
  description: 'De algemene voorwaarden van Liefde Voor Iedereen - de dating app voor iedereen in Nederland en België.',
  keywords: ['algemene voorwaarden', 'terms', 'voorwaarden', 'dating app voorwaarden'],
  openGraph: {
    title: 'Algemene Voorwaarden - Liefde Voor Iedereen',
    description: 'De algemene voorwaarden van Liefde Voor Iedereen.',
    url: 'https://www.liefdevooriedereen.nl/terms',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Algemene Voorwaarden - Liefde Voor Iedereen',
    description: 'De algemene voorwaarden van Liefde Voor Iedereen.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
