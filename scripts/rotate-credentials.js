#!/usr/bin/env node
/**
 * Credential Rotation Script
 *
 * This script helps you rotate all sensitive credentials.
 * Run: node scripts/rotate-credentials.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 CREDENTIAL ROTATION HELPER\n');
console.log('=' .repeat(50));

// Generate new NEXTAUTH_SECRET
const newNextAuthSecret = crypto.randomBytes(32).toString('hex');
console.log('\n1. NEXTAUTH_SECRET (copy this to .env):');
console.log(`   NEXTAUTH_SECRET=${newNextAuthSecret}`);

console.log('\n2. DATABASE_URL:');
console.log('   → Go to Neon Dashboard: https://console.neon.tech/');
console.log('   → Select your project');
console.log('   → Go to "Settings" → "Connection Details"');
console.log('   → Click "Reset Password" to generate a new password');
console.log('   → Copy the new connection string to .env');

console.log('\n3. UPLOADTHING_SECRET:');
console.log('   → Go to UploadThing Dashboard: https://uploadthing.com/dashboard');
console.log('   → Select your app');
console.log('   → Go to "API Keys"');
console.log('   → Click "Regenerate" to create new keys');
console.log('   → Copy UPLOADTHING_SECRET and UPLOADTHING_TOKEN to .env');

console.log('\n4. MULTISAFEPAY_API_KEY:');
console.log('   → Go to MultiSafepay: https://merchant.multisafepay.com/');
console.log('   → Go to "Settings" → "API Keys"');
console.log('   → Generate a new API key');
console.log('   → Copy to .env');

console.log('\n5. OPENROUTER_API_KEY:');
console.log('   → Go to OpenRouter: https://openrouter.ai/keys');
console.log('   → Click "Create new key"');
console.log('   → Copy to .env');

console.log('\n' + '=' .repeat(50));
console.log('\n⚠️  IMPORTANT STEPS AFTER ROTATION:\n');
console.log('1. Update .env with ALL new credentials');
console.log('2. Restart your development server');
console.log('3. Test login functionality');
console.log('4. Test file uploads');
console.log('5. Test payments (if applicable)');
console.log('6. Deploy to production with new credentials');
console.log('7. NEVER commit .env to version control!');

console.log('\n✅ New NEXTAUTH_SECRET generated above.');
console.log('   Follow the steps for other credentials.\n');

// Check if .env exists and warn about old credentials
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  WARNING: .env file exists. Make sure to update it!');
  console.log(`   Location: ${envPath}\n`);
}
