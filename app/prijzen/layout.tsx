/**
 * Prijzen Layout - SEO Metadata
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Abonnementen & Prijzen - Liefde Voor Iedereen',
  description: 'Bekijk onze abonnementen: Gratis basis, Liefde Plus (€9,95/maand) en Liefde Compleet (€24,95/3 maanden). Kies het abonnement dat bij jou past.',
  keywords: ['prijzen', 'abonnementen', 'gratis', 'premium', 'kosten', 'dating app'],
  openGraph: {
    title: 'Abonnementen & Prijzen - Liefde Voor Iedereen',
    description: 'Van gratis tot premium - kies het abonnement dat bij jou past',
    url: 'https://liefdevooriederen.nl/prijzen',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Abonnementen & Prijzen',
    description: 'Van gratis tot premium - kies je abonnement',
  },
  alternates: {
    canonical: 'https://liefdevooriederen.nl/prijzen',
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
