import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Icebreaker Generator - Originele Openingszinnen | Liefde Voor Iedereen',
  description: 'Geen inspiratie voor een eerste bericht? Gebruik onze icebreaker generator voor originele en speelse openingszinnen. Gratis en direct te gebruiken.',
  keywords: ['icebreaker generator', 'openingszinnen', 'eerste bericht dating', 'gesprek starten', 'dating tips eerste bericht'],
  openGraph: {
    title: 'Icebreaker Generator - Originele openingszinnen',
    description: 'Geen inspiratie? Laat je verrassen met originele openingszinnen.',
    url: 'https://www.liefdevooriedereen.nl/kennisbank/tools/icebreaker-generator',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Icebreaker Generator',
    description: 'Originele openingszinnen voor je eerste bericht.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/kennisbank/tools/icebreaker-generator',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function IcebreakerGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
