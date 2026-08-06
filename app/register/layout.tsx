/**
 * Register Layout - SEO Metadata
 */

import { Metadata } from 'next'
import { canonical } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Gratis Aanmelden - Liefde Voor Iedereen',
  description: 'Maak gratis een account aan en ontmoet lokale singles. Start vandaag met online daten op de #1 Nederlandse dating app.',
  keywords: ['aanmelden', 'registreren', 'dating app', 'gratis', 'singles', 'online daten'],
  openGraph: {
    title: 'Gratis Aanmelden - Liefde Voor Iedereen',
    description: 'Start vandaag gratis met online daten',
    url: canonical('/register'),
    type: 'website',
    images: [
      {
        url: canonical('/og-register.png'),
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
    images: [canonical('/og-register.png')],
  },
  alternates: {
    canonical: canonical('/register'),
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
