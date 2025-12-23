/**
 * Register Layout - SEO Metadata
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gratis Aanmelden - Liefde Voor Iedereen',
  description: 'Maak gratis een account aan en ontmoet lokale singles. Start vandaag met online daten op de #1 Nederlandse dating app.',
  keywords: ['aanmelden', 'registreren', 'dating app', 'gratis', 'singles', 'online daten'],
  openGraph: {
    title: 'Gratis Aanmelden - Liefde Voor Iedereen',
    description: 'Start vandaag gratis met online daten',
    url: 'https://liefdevooriederen.nl/register',
    type: 'website',
    images: [
      {
        url: 'https://liefdevooriederen.nl/og-register.png',
        width: 1200,
        height: 630,
        alt: 'Gratis aanmelden bij Liefde Voor Iedereen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gratis Aanmelden - Liefde Voor Iedereen',
    description: 'Start vandaag gratis met online daten',
    images: ['https://liefdevooriederen.nl/og-register.png'],
  },
  alternates: {
    canonical: 'https://liefdevooriederen.nl/register',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
