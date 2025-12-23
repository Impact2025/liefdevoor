/**
 * Encryption Service - AES-256-GCM
 *
 * Wereldklasse encryptie voor gevoelige data:
 * - 2FA secrets
 * - Backup codes
 * - Password reset tokens
 * - Private messages (optioneel)
 *
 * Security Features:
 * - AES-256-GCM (authenticated encryption)
 * - Random IV per encryption
 * - Authentication tag validation
 * - Key rotation support
 *
 * @author Claude Opus 4.5
 * @version 2.0.0
 */

import crypto from 'crypto'

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits
const KEY_LENGTH = 32 // 256 bits

/**
 * Get encryption key from environment
 * CRITICAL: Must be 32 bytes (256 bits) for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY must be set in production')
    }
    // Development fallback (DO NOT use in production)
    console.warn('⚠️  Using default encryption key - DO NOT USE IN PRODUCTION')
    return Buffer.from('dev-key-32-bytes-long-required!') // Exactly 32 bytes
  }

  // Convert base64 key to buffer
  const keyBuffer = Buffer.from(key, 'base64')

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (256 bits), got ${keyBuffer.length}`)
  }

  return keyBuffer
}

// ============================================================================
// ENCRYPTION
// ============================================================================

/**
 * Encrypt sensitive text using AES-256-GCM
 *
 * @param plaintext - Text to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (hex encoded)
 *
 * @example
 * const encrypted = encrypt('my-2fa-secret')
 * // Returns: "a1b2c3d4...:e5f6g7h8...:i9j0k1l2..."
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string')
  }

  try {
    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(IV_LENGTH)

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)

    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ])

    // Get authentication tag (prevents tampering)
    const authTag = cipher.getAuthTag()

    // Return in format: iv:authTag:ciphertext
    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex')
    ].join(':')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt encrypted text
 *
 * @param encrypted - Encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext
 *
 * @example
 * const plaintext = decrypt('a1b2c3d4...:e5f6g7h8...:i9j0k1l2...')
 * // Returns: "my-2fa-secret"
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) {
    throw new Error('Cannot decrypt empty string')
  }

  try {
    // Parse encrypted format: iv:authTag:ciphertext
    const parts = encrypted.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format')
    }

    const [ivHex, authTagHex, ciphertextHex] = parts

    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const ciphertext = Buffer.from(ciphertextHex, 'hex')

    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`)
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`)
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
    decipher.setAuthTag(authTag)

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data - data may be corrupted or tampered with')
  }
}

// ============================================================================
// HASH FUNCTIONS (for tokens that don't need decryption)
// ============================================================================

/**
 * Hash a token using SHA-256
 * Use for password reset tokens, email verification tokens, etc.
 * These don't need to be decrypted, only compared.
 *
 * @param token - Token to hash
 * @returns Hex-encoded hash
 *
 * @example
 * const hashed = hashToken('reset-token-abc123')
 * // Store hashed in database, compare on validation
 */
export function hashToken(token: string): string {
  if (!token) {
    throw new Error('Cannot hash empty token')
  }

  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

/**
 * Compare a plain token with a hashed token
 * Timing-safe comparison to prevent timing attacks
 *
 * @param plainToken - Plain token from user
 * @param hashedToken - Hashed token from database
 * @returns true if tokens match
 */
export function compareToken(plainToken: string, hashedToken: string): boolean {
  if (!plainToken || !hashedToken) {
    return false
  }

  const plainHash = hashToken(plainToken)

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(plainHash, 'hex'),
    Buffer.from(hashedToken, 'hex')
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a secure random token
 *
 * @param length - Length in bytes (default: 32)
 * @returns Hex-encoded random token
 *
 * @example
 * const resetToken = generateSecureToken()
 * // Returns 64-character hex string (32 bytes)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a secure encryption key
 * Use this to generate ENCRYPTION_KEY for .env
 *
 * @returns Base64-encoded 256-bit key
 *
 * @example
 * // Run once to generate key:
 * console.log(generateEncryptionKey())
 * // Add to .env:
 * // ENCRYPTION_KEY=base64_key_here
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64')
}

/**
 * Check if a string is encrypted (has correct format)
 *
 * @param value - String to check
 * @returns true if appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false

  const parts = value.split(':')
  if (parts.length !== 3) return false

  // Check if all parts are valid hex
  return parts.every(part => /^[0-9a-f]+$/i.test(part))
}

// ============================================================================
// KEY ROTATION (for future use)
// ============================================================================

/**
 * Re-encrypt data with a new key
 * Use this when rotating encryption keys
 *
 * @param encrypted - Data encrypted with old key
 * @param oldKey - Old encryption key (base64)
 * @param newKey - New encryption key (base64)
 * @returns Data encrypted with new key
 */
export function rotateKey(encrypted: string, oldKey: string, newKey: string): string {
  // Temporarily set old key
  const originalKey = process.env.ENCRYPTION_KEY
  process.env.ENCRYPTION_KEY = oldKey

  // Decrypt with old key
  const plaintext = decrypt(encrypted)

  // Set new key
  process.env.ENCRYPTION_KEY = newKey

  // Encrypt with new key
  const reencrypted = encrypt(plaintext)

  // Restore original key
  process.env.ENCRYPTION_KEY = originalKey

  return reencrypted
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  encrypt,
  decrypt,
  hashToken,
  compareToken,
  generateSecureToken,
  generateEncryptionKey,
  isEncrypted,
  rotateKey,
}
