/**
 * Valentine's Special Preview
 * For react-email dev server
 */

import ValentinesSpecialEmail from '../lib/email/templates/engagement/valentines-special'

export default function ValentinesSpecialPreview() {
  return (
    <ValentinesSpecialEmail
      userName="Lisa"
      suggestedMatches={[
        {
          name: 'Tom',
          age: 68,
          photo: 'https://i.pravatar.cc/150?img=33',
          city: 'Amsterdam',
          sharedInterest: 'Wandelen'
        },
        {
          name: 'Henk',
          age: 65,
          photo: 'https://i.pravatar.cc/150?img=12',
          city: 'Utrecht',
          sharedInterest: 'Lezen'
        },
        {
          name: 'Peter',
          age: 70,
          photo: 'https://i.pravatar.cc/150?img=59',
          city: 'Rotterdam',
          sharedInterest: 'Muziek'
        }
      ]}
    />
  )
}
