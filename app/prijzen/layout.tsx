/**
 * Prijzen Layout - SEO Metadata
 */

import { Metadata } from 'next'
import { canonical } from '@/lib/site-url'

export const metadata: Metadata = {
  // Staat op positie 4 met nul clicks (Search Console): het concrete
  // startpunt "gratis" en de prijs horen in de title, niet alleen in de tekst.
  title: { absolute: 'Prijzen: Gratis Starten of €9,95 per Maand | Liefde Voor Iedereen' },
  description: 'Gratis beginnen, daarna Liefde Plus voor €9,95 per maand of Liefde Compleet voor €24,95 per 3 maanden. Geen verborgen kosten, maandelijks opzegbaar.',
  keywords: ['prijzen', 'abonnementen', 'gratis', 'premium', 'kosten', 'dating app'],
  openGraph: {
    title: 'Abonnementen & Prijzen - Liefde Voor Iedereen',
    description: 'Van gratis tot premium - kies het abonnement dat bij jou past',
    url: canonical('/prijzen'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Abonnementen & Prijzen',
    description: 'Van gratis tot premium - kies je abonnement',
  },
  alternates: {
    canonical: canonical('/prijzen'),
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrijzenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
