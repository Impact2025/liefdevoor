import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacybeleid - Liefde Voor Iedereen',
  description: 'AVG-compliant privacybeleid van Liefde Voor Iedereen. Lees hoe wij omgaan met jouw persoonsgegevens, foto\'s en communicatie.',
  keywords: ['privacy', 'privacybeleid', 'AVG', 'persoonsgegevens', 'datingsite privacy'],
  openGraph: {
    title: 'Privacybeleid - Liefde Voor Iedereen',
    description: 'Hoe Liefde Voor Iedereen omgaat met jouw privacy en persoonsgegevens.',
    url: 'https://www.liefdevooriedereen.nl/privacy',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacybeleid - Liefde Voor Iedereen',
    description: 'Hoe Liefde Voor Iedereen omgaat met jouw privacy en persoonsgegevens.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
