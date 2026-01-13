/**
 * Migration Welcome Landing Page
 *
 * Personalized landing page for OogvoorLiefde.nl users
 * migrating to LiefdevoorIedereen.nl
 */

import { Metadata } from 'next'
import { MigrationLandingClient } from './MigrationLandingClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Welkom bij LiefdevoorIedereen | Activeer je Account',
    description: 'Je OogvoorLiefde profiel staat klaar. Activeer je account en krijg gratis Premium!',
    robots: { index: false, follow: false }
  }
}

export default async function MigrationWelkomePage({ params }: PageProps) {
  const { token } = await params

  return <MigrationLandingClient token={token} />
}
