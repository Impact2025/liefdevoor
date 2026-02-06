import { sendEmail } from '../lib/email/send'

async function sendSimpleTest() {
  console.log('📧 Sending simple test email...\n')

  try {
    const result = await sendEmail({
      to: 'vincent@stichtingphilia.nl',
      subject: 'Test email voor webhook test',
      html: `
        <h1>Test Email</h1>
        <p>Dit is een test email om de webhook te testen.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      category: 'test'
    })

    if (!result.success) {
      console.error('❌ Error:', result.error)
      return
    }

    console.log('✅ Email sent!')
    console.log('📨 Resend ID:', result.id)
    console.log('\nNow check:')
    console.log('1. Resend webhook events')
    console.log('2. Vercel logs for /api/webhooks/test')
    console.log('3. Your inbox: vincent@stichtingphilia.nl\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

sendSimpleTest()
