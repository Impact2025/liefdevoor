/**
 * Profile Nudge Preview
 * For react-email dev server
 */

import ProfileNudgeEmail from '../lib/email/templates/engagement/profile-nudge'

export default function ProfileNudgePreview() {
  return (
    <ProfileNudgeEmail
      userName="Marja"
      profileScore={40}
      missingFields={['Profielfoto', 'Interesses', 'Over jezelf (bio)']}
    />
  )
}
