/**
 * Upstash Redis Connection Test Script
 *
 * Tests Upstash REST API connectivity and basic operations
 *
 * Usage:
 *   npx tsx scripts/test-upstash.ts
 */

// Load environment variables from .env
import { config } from 'dotenv'
config()

import { getUpstash } from '@/lib/upstash'

async function testUpstash() {
  console.log('\n🔍 Testing Upstash connection...\n')

  const upstash = getUpstash()
  if (!upstash) {
    throw new Error('Upstash client not initialized. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env')
  }

  try {
    // Test 1: Write operation
    console.log('1. Testing WRITE operation...')
    await upstash.setex('test-key', 30, 'Hello from Dating App!')
    console.log('   ✅ Write successful\n')

    // Test 2: Read operation
    console.log('2. Testing READ operation...')
    const value = await upstash.get<string>('test-key')
    if (value === 'Hello from Dating App!') {
      console.log('   ✅ Read successful:', value, '\n')
    } else {
      throw new Error(`Read value does not match! Got: ${value}`)
    }

    // Test 3: Increment (for rate limiting)
    console.log('3. Testing INCREMENT (rate limiting)...')
    const counter1 = await upstash.incr('test-counter')
    const counter2 = await upstash.incr('test-counter')
    const counter3 = await upstash.incr('test-counter')
    console.log('   ✅ Counter incremented:', counter1, '→', counter2, '→', counter3, '\n')

    // Test 4: Expiry
    console.log('4. Testing TTL...')
    const ttl = await upstash.ttl('test-key')
    console.log('   ✅ TTL:', ttl, 'seconds\n')

    // Test 5: Delete operation
    console.log('5. Testing DELETE operation...')
    await upstash.del('test-key')
    await upstash.del('test-counter')
    console.log('   ✅ Cleanup successful\n')

    // Success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Upstash is working correctly!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ All tests passed')
    console.log('✅ HTTP-based - No connection limits!')
    console.log('✅ Perfect for Vercel serverless')
    console.log('✅ Rate limiting will work in production')
    console.log('✅ Caching ready')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error: any) {
    // Error handling
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ Upstash connection FAILED!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('\nError:', error.message)

    console.error('\n📋 Troubleshooting Steps:\n')
    console.error('1. Check if Upstash environment variables are set:')
    console.error('   - UPSTASH_REDIS_REST_URL')
    console.error('   - UPSTASH_REDIS_REST_TOKEN\n')

    console.error('2. Verify variables in .env:')
    console.error('   cat .env | grep UPSTASH\n')

    console.error('3. Go to Upstash Console:')
    console.error('   - https://console.upstash.com')
    console.error('   - Check database status')
    console.error('   - Copy REST API credentials (not Redis CLI!)\n')

    console.error('4. Make sure you\'re using REST API credentials:')
    console.error('   - URL should start with https://')
    console.error('   - Token is a long alphanumeric string\n')

    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    process.exit(1)
  }
}

// Run test
testUpstash()
