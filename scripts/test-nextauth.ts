// Test NextAuth credentials endpoint directly
async function testNextAuth() {
  const url = 'http://localhost:3005/api/auth/callback/credentials'
  const credentials = {
    email: 'sophie@demo.nl',
    password: 'Demo123!',
    redirect: 'false',
    json: 'true',
  }

  console.log('🔍 Testing NextAuth endpoint...')
  console.log('URL:', url)
  console.log('Credentials:', { email: credentials.email, password: '***' })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(credentials),
    })

    console.log('Response status:', response.status, response.statusText)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    console.log()

    const data = await response.json().catch(() => response.text())
    console.log('Response body:', data)

    if (response.ok || response.status === 200) {
      console.log('\n✅ NextAuth endpoint is working!')
    } else {
      console.log('\n❌ NextAuth returned an error')
    }
  } catch (error) {
    console.error('❌ Error calling NextAuth:', error)
  }
}

testNextAuth()
