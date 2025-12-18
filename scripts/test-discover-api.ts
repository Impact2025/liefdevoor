async function testDiscoverAPI() {
  console.log('🔍 Testing Discover API...\n')

  // First, get a session for Sophie
  // We'll simulate being logged in as Sophie by calling the discover API
  const url = 'http://localhost:3005/api/discover'

  console.log('Making request to:', url)
  console.log('Note: This will fail without auth cookie, but let\'s see the response...\n')

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', response.status, response.statusText)

    if (response.ok) {
      const data = await response.json()
      console.log('\n✅ Success! Data received:')
      console.log(JSON.stringify(data, null, 2))

      if (data.users) {
        console.log(`\n📊 Found ${data.users.length} users`)
        data.users.forEach((user: any, i: number) => {
          console.log(`${i + 1}. ${user.name} (${user.gender}, ${user.city})`)
        })
      }
    } else {
      const error = await response.json().catch(() => response.text())
      console.log('\n❌ Error response:')
      console.log(error)
    }
  } catch (error) {
    console.error('❌ Fetch error:', error)
  }
}

testDiscoverAPI()
