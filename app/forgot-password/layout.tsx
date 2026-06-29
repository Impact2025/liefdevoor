import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wachtwoord Vergeten - Liefde Voor Iedereen',
  description: 'Wachtwoord vergeten? Geen probleem. Vraag eenvoudig een nieuw wachtwoord aan voor je Liefde Voor Iedereen account.',
  keywords: ['wachtwoord vergeten', 'wachtwoord resetten', 'inlogproblemen', 'account herstel'],
  openGraph: {
    title: 'Wachtwoord Vergeten',
    description: 'Vraag eenvoudig een nieuw wachtwoord aan.',
    url: 'https://www.liefdevooriedereen.nl/forgot-password',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Wachtwoord Vergeten',
    description: 'Vraag eenvoudig een nieuw wachtwoord aan.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/forgot-password',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
