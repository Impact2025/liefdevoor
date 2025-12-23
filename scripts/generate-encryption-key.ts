/**
 * Generate Encryption Key
 *
 * Run this script once to generate a secure encryption key
 * Add the generated key to your .env file
 *
 * Usage:
 *   npx tsx scripts/generate-encryption-key.ts
 */

import { generateEncryptionKey } from '../lib/encryption'

console.log('\n🔐 ENCRYPTION KEY GENERATOR\n')
console.log('=' .repeat(60))

const key = generateEncryptionKey()

console.log('\n✅ Generated 256-bit AES encryption key:\n')
console.log(`ENCRYPTION_KEY=${key}`)
console.log('\n' + '='.repeat(60))
console.log('\n📋 INSTRUCTIONS:')
console.log('1. Copy the key above')
console.log('2. Add to your .env file')
console.log('3. NEVER commit this key to git!')
console.log('4. Use different keys for dev/staging/production')
console.log('5. Store production key in secure vault (Vercel, AWS Secrets Manager)')
console.log('\n⚠️  SECURITY NOTES:')
console.log('- Keep this key secret - anyone with it can decrypt your data')
console.log('- Losing this key = permanent data loss')
console.log('- Rotate keys every 90 days for best security')
console.log('\n')
