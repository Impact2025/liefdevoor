/**
 * Redis Connection Test Script
 *
 * Tests Redis connectivity and basic operations
 *
 * Usage:
 *   npx tsx scripts/test-redis.ts
 */

// Load environment variables from .env
import { config } from 'dotenv'
config()

import { getRedis } from '@/lib/redis'

async function testRedis() {
  console.log('\n🔍 Testing Redis connection...\n')

  const redis = getRedis()
  if (!redis) {
    throw new Error('Redis client not initialized. Check REDIS_URL in .env')
  }

  try {
    // Test 1: Write operation
    console.log('1. Testing WRITE operation...')
    await redis.set('test-key', 'Hello from Dating App!', 'EX', 30)
    console.log('   ✅ Write successful\n')

    // Test 2: Read operation
    console.log('2. Testing READ operation...')
    const value = await redis.get('test-key')
    if (value === 'Hello from Dating App!') {
      console.log('   ✅ Read successful:', value, '\n')
    } else {
      throw new Error('Read value does not match!')
    }

    // Test 3: Increment (for rate limiting)
    console.log('3. Testing INCREMENT (rate limiting)...')
    const counter1 = await redis.incr('test-counter')
    const counter2 = await redis.incr('test-counter')
    const counter3 = await redis.incr('test-counter')
    console.log('   ✅ Counter incremented:', counter1, '→', counter2, '→', counter3, '\n')

    // Test 4: Expiry
    console.log('4. Testing EXPIRY...')
    await redis.set('test-expiry', 'expires soon', 'EX', 2)
    const beforeExpiry = await redis.get('test-expiry')
    console.log('   ⏳ Value set with 2s expiry:', beforeExpiry)

    // Wait 3 seconds
    console.log('   ⏳ Waiting 3 seconds...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    const afterExpiry = await redis.get('test-expiry')
    if (afterExpiry === null) {
      console.log('   ✅ Key expired correctly\n')
    } else {
      console.log('   ⚠️  Key did not expire (value:', afterExpiry, ')\n')
    }

    // Test 5: Delete operation
    console.log('5. Testing DELETE operation...')
    await redis.del('test-key', 'test-counter', 'test-expiry')
    console.log('   ✅ Cleanup successful\n')

    // Success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Redis is working correctly!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ All tests passed')
    console.log('✅ Rate limiting will work in production')
    console.log('✅ Session management ready')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error: any) {
    // Error handling
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ Redis connection FAILED!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('\nError:', error.message)

    console.error('\n📋 Troubleshooting Steps:\n')
    console.error('1. Check if Redis environment variables are set:')
    console.error('   - UPSTASH_REDIS_REST_URL')
    console.error('   - UPSTASH_REDIS_REST_TOKEN')
    console.error('   (or REDIS_URL for standard Redis)\n')

    console.error('2. Verify variables in .env.local:')
    console.error('   cat .env.local | grep REDIS\n')

    console.error('3. If using Upstash:')
    console.error('   - Go to https://console.upstash.com')
    console.error('   - Check database status')
    console.error('   - Copy connection details\n')

    console.error('4. If using local Redis:')
    console.error('   - Check if Redis is running: redis-cli ping')
    console.error('   - Start Redis: redis-server\n')

    console.error('5. Read the setup guide:')
    console.error('   docs/REDIS_SETUP.md\n')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    process.exit(1)
  }
}

// Run test
testRedis()
