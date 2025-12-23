/**
 * Perfect Match Preview
 * For react-email dev server
 */

import PerfectMatchEmail from '../lib/email/templates/engagement/perfect-match'

export default function PerfectMatchPreview() {
  return (
    <PerfectMatchEmail
      userName="Jan"
      matchName="Bonnie"
      matchAge={67}
      matchPhoto="https://i.pravatar.cc/150?img=47"
      matchCity="Rotterdam"
      sharedInterests={['Wandelen', 'Koffie drinken', 'Lezen']}
      compatibilityScore={85}
    />
  )
}
