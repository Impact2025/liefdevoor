import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookiebeleid - Liefde Voor Iedereen',
  description: 'Lees hoe Liefde Voor Iedereen cookies gebruikt voor een optimale gebruikservaring. AVG-compliant cookiebeleid voor onze dating app.',
  keywords: ['cookies', 'cookiebeleid', 'privacy', 'AVG', 'cookie toestemming'],
  openGraph: {
    title: 'Cookiebeleid - Liefde Voor Iedereen',
    description: 'Hoe wij cookies gebruiken voor een betere dating ervaring.',
    url: 'https://www.liefdevooriedereen.nl/cookies',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cookiebeleid - Liefde Voor Iedereen',
    description: 'Hoe wij cookies gebruiken voor een betere dating ervaring.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/cookies',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
