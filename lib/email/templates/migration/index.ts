/**
 * Migration Email Templates Index
 *
 * Export all migration email templates with tracking helpers
 */

export { default as MigrationWelcomeEmail } from './welcome'
export { default as MigrationMatchesWaitingEmail } from './matches-waiting'
export { default as MigrationReminderEmail } from './reminder'
export { default as MigrationFeaturesEmail } from './features'
export { default as MigrationSocialProofEmail } from './social-proof'
export { default as MigrationLastChanceEmail } from './last-chance'
export { default as MigrationGoodbyeEmail } from './goodbye'

/**
 * Generate tracking pixel URL
 */
export function getTrackingPixelUrl(token: string, emailId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'
  return `${baseUrl}/api/migration/track?t=${token}&e=${emailId}`
}

/**
 * Generate tracked landing URL
 */
export function getTrackedLandingUrl(token: string, emailId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'
  let url = `${baseUrl}/welkom/${token}`
  if (emailId) {
    url += `?e=${emailId}`
  }
  return url
}
