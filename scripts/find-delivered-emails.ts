import { config } from 'dotenv'
config()

/**
 * Find emails that are delivered in Resend and check if tracking works
 */
async function findDeliveredEmails() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found')
    return
  }

  console.log('🔍 Fetching recent emails from Resend...\n')

  try {
    // Get recent emails from Resend
    const response = await fetch('https://api.resend.com/emails?limit=20', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`❌ Resend API error: ${response.status}`)
      return
    }

    const result = await response.json()
    const emails = result.data || []

    console.log(`Found ${emails.length} recent emails in Resend\n`)

    // Group by status
    const byStatus: Record<string, number> = {}

    for (const email of emails) {
      const status = email.last_event || 'pending'
      byStatus[status] = (byStatus[status] || 0) + 1
    }

    console.log('📊 Status breakdown:')
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })

    console.log('\n📧 First 10 emails:')
    emails.slice(0, 10).forEach((email: any) => {
      const icon = email.last_event === 'delivered' ? '✅' :
                   email.last_event === 'bounced' ? '❌' :
                   email.last_event === 'opened' ? '👁️' : '⏳'
      console.log(`${icon} ${email.to[0]} - ${email.last_event || 'pending'} - ID: ${email.id}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

findDeliveredEmails()
