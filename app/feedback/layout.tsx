import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feedback & Verbeteringen - Liefde Voor Iedereen',
  description: 'Deel je feedback over Liefde Voor Iedereen. Wij luisteren naar onze gebruikers om de beste dating app van Nederland te blijven.',
  keywords: ['feedback', 'verbeteringen', 'dating app feedback', 'suggesties'],
  openGraph: {
    title: 'Feedback & Verbeteringen',
    description: 'Help ons de beste dating app te maken. Deel je feedback.',
    url: 'https://www.liefdevooriedereen.nl/feedback',
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Feedback & Verbeteringen',
    description: 'Help ons de beste dating app te maken.',
  },
  alternates: {
    canonical: 'https://www.liefdevooriedereen.nl/feedback',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
