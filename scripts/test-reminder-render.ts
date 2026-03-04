import { render } from '@react-email/render'
import MigrationReminderEmail from '../lib/email/templates/migration/reminder'

const emailData = {
  userName: 'Test',
  landingUrl: 'https://test.com',
  couponCode: 'TEST',
  daysRemaining: 15,
  photoCount: 10,
  messageCount: 20
}

console.log('Testing render...')

const html = render(MigrationReminderEmail(emailData))

console.log('Type of html:', typeof html)
console.log('Is string:', typeof html === 'string')
console.log('HTML object:', html)
console.log('HTML keys:', Object.keys(html))

// Try different methods
if (typeof html === 'object') {
  console.log('\nTrying .html:', html.html?.substring(0, 100))
  console.log('Trying .toString():', html.toString()?.substring(0, 100))
}
