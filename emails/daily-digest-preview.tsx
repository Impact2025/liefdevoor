/**
 * Daily Digest Preview
 * For react-email dev server
 */

import DailyDigestEmail from '../lib/email/templates/engagement/daily-digest'

export default function DailyDigestPreview() {
  return (
    <DailyDigestEmail
      userName="Pieter"
      newVisitsCount={5}
      newLikesCount={3}
      featuredVisitor={{
        name: 'Bonnie',
        age: 67,
        photo: 'https://i.pravatar.cc/150?img=47',
        city: 'Amsterdam'
      }}
    />
  )
}
