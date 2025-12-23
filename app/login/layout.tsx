/**
 * Login Layout - SEO Metadata
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inloggen - Liefde Voor Iedereen',
  description: 'Log in op je account en ontdek lokale singles. Vind vandaag nog je perfecte match op Liefde Voor Iedereen.',
  openGraph: {
    title: 'Inloggen - Liefde Voor Iedereen',
    description: 'Log in op je account en ontdek lokale singles',
    url: 'https://liefdevooriederen.nl/login',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Inloggen - Liefde Voor Iedereen',
    description: 'Log in op je account en ontdek lokale singles',
  },
  alternates: {
    canonical: 'https://liefdevooriederen.nl/login',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
