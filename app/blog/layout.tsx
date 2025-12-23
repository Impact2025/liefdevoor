/**
 * Blog Layout - SEO Metadata
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dating Tips & Advies - Liefde Voor Iedereen Blog',
  description: 'Ontdek tips voor succesvol online daten, relatie-advies en dating trends. Leer hoe je de perfecte match vindt.',
  keywords: ['dating tips', 'online daten', 'relatie advies', 'dating blog', 'singles'],
  openGraph: {
    title: 'Dating Tips & Advies - Blog',
    description: 'Ontdek tips voor succesvol online daten',
    url: 'https://liefdevooriederen.nl/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dating Tips & Advies - Blog',
    description: 'Ontdek tips voor succesvol online daten',
  },
  alternates: {
    canonical: 'https://liefdevooriederen.nl/blog',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
