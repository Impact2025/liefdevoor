import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Resultaat - Liefde Voor Iedereen',
  description: 'Bekijk jouw testresultaat. Deel je resultaat met je date of bewaar het voor jezelf.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
