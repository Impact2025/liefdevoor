import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mijn Resultaten - Persoonlijke Testresultaten | Liefde Voor Iedereen',
  description: 'Bekijk jouw persoonlijke resultaten van de dating quizzes en tests op Liefde Voor Iedereen. Alleen jij kunt je resultaten inzien.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MijnResultatenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
