import { config } from 'dotenv'
config()

/**
 * Check the status of a specific email in Resend
 * Uses Resend API to fetch email details
 */
async function checkResendEmailStatus() {
  const resendId = '34c3498c-799a-4be8-83b3-05484a6f786e' // Rich91_
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment')
    return
  }

  console.log(`🔍 Checking Resend status for email: ${resendId}\n`)

  try {
    const response = await fetch(`https://api.resend.com/emails/${resendId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`❌ Resend API error: ${response.status} ${response.statusText}`)
      const error = await response.text()
      console.error('Response:', error)
      return
    }

    const data = await response.json()

    console.log('✅ Email found in Resend!')
    console.log('\nDetails:')
    console.log(JSON.stringify(data, null, 2))
    console.log('\n📊 Status:', data.last_event || 'No events yet')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkResendEmailStatus()
