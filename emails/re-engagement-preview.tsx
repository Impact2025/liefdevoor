/**
 * Re-Engagement Preview
 * For react-email dev server
 */

import ReEngagementEmail from '../lib/email/templates/engagement/re-engagement'

export default function ReEngagementPreview() {
  return (
    <ReEngagementEmail
      userName="Sophie"
      daysSinceLastVisit={30}
      newMatchesCount={8}
      newMessagesCount={3}
      featuredMatches={[
        {
          name: 'Henk',
          age: 65,
          photo: 'https://i.pravatar.cc/150?img=12',
          city: 'Utrecht'
        },
        {
          name: 'Maria',
          age: 62,
          photo: 'https://i.pravatar.cc/150?img=44',
          city: 'Den Haag'
        },
        {
          name: 'Tom',
          age: 68,
          photo: 'https://i.pravatar.cc/150?img=33',
          city: 'Rotterdam'
        }
      ]}
      whatsNew={[
        'Verbeterde matching algoritme',
        'Nieuwe chat functies met voice berichten',
        'Meer leden in jouw regio'
      ]}
    />
  )
}
