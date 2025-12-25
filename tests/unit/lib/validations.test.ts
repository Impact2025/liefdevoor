/**
 * Validation Schemas Tests
 *
 * Comprehensive tests for Zod validation schemas to ensure:
 * - XSS prevention
 * - Input sanitization
 * - Data integrity
 * - Edge cases handling
 */

import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  messageSchema,
  swipeSchema,
  reportSchema,
  preferencesSchema,
  paginationSchema,
  validateInput,
  formatZodErrors,
} from '@/lib/validations/schemas'

describe('emailSchema', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'user.name@domain.nl',
      'user+tag@example.org',
      'USER@EXAMPLE.COM', // Should be lowercased
    ]

    validEmails.forEach((email) => {
      const result = emailSchema.safeParse(email)
      expect(result.success, `Expected ${email} to be valid`).toBe(true)
      if (result.success) {
        expect(result.data).toBe(email.toLowerCase())
      }
    })
  })

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'invalid',
      'no@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'missing.at.sign.com',
      '',
      'a@b',
    ]

    invalidEmails.forEach((email) => {
      const result = emailSchema.safeParse(email)
      expect(result.success, `Expected ${email} to be invalid`).toBe(false)
    })
  })

  it('should reject temporary email domains', () => {
    const tempEmails = [
      'user@tempmail.com',
      'user@guerrillamail.org',
      'user@10minutemail.net',
      'user@throwaway.email',
    ]

    tempEmails.forEach((email) => {
      const result = emailSchema.safeParse(email)
      expect(result.success, `Expected ${email} to be rejected as temp email`).toBe(false)
    })
  })

  it('should enforce maximum length', () => {
    const longEmail = 'a'.repeat(250) + '@test.com'
    const result = emailSchema.safeParse(longEmail)
    expect(result.success).toBe(false)
  })
})

describe('passwordSchema', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'ValidPass1',
      'SecureP@ss123',
      'MyStr0ngPassword',
      'Test1234',
      'ABCdef123',
    ]

    validPasswords.forEach((password) => {
      const result = passwordSchema.safeParse(password)
      expect(result.success, `Expected ${password} to be valid`).toBe(true)
    })
  })

  it('should reject passwords shorter than 8 characters', () => {
    const shortPasswords = ['Short1', 'Abc123', 'Test1', 'Aa1']

    shortPasswords.forEach((password) => {
      const result = passwordSchema.safeParse(password)
      expect(result.success, `Expected ${password} to be rejected (too short)`).toBe(false)
    })
  })

  it('should reject passwords without uppercase letters', () => {
    const result = passwordSchema.safeParse('lowercase123')
    expect(result.success).toBe(false)
  })

  it('should reject passwords without lowercase letters', () => {
    const result = passwordSchema.safeParse('UPPERCASE123')
    expect(result.success).toBe(false)
  })

  it('should reject passwords without numbers', () => {
    const result = passwordSchema.safeParse('NoNumbersHere')
    expect(result.success).toBe(false)
  })

  it('should reject passwords over 100 characters', () => {
    const longPassword = 'Aa1' + 'a'.repeat(100)
    const result = passwordSchema.safeParse(longPassword)
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validRegistration = {
    name: 'Jan de Vries',
    email: 'jan@example.com',
    password: 'SecurePass1',
    gender: 'MALE',
    birthDate: '1990-05-15',
    acceptTerms: true,
  }

  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse(validRegistration)
    expect(result.success).toBe(true)
  })

  it('should reject registration without accepted terms', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      acceptTerms: false,
    })
    expect(result.success).toBe(false)
  })

  it('should reject registration for users under 18', () => {
    const today = new Date()
    const under18 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())

    const result = registerSchema.safeParse({
      ...validRegistration,
      birthDate: under18.toISOString().split('T')[0],
    })
    expect(result.success).toBe(false)
  })

  it('should reject names shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      name: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('should reject names with XSS attempts', () => {
    const xssNames = [
      '<script>alert("xss")</script>',
      'Name<img onerror=alert(1)>',
      'javascript:void(0)',
      'Name onclick=alert(1)',
    ]

    xssNames.forEach((name) => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        name,
      })
      expect(result.success, `Expected XSS name "${name}" to be rejected`).toBe(false)
    })
  })

  it('should reject invalid genders', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      gender: 'INVALID',
    })
    expect(result.success).toBe(false)
  })
})

describe('profileUpdateSchema', () => {
  it('should accept valid profile updates', () => {
    const result = profileUpdateSchema.safeParse({
      name: 'Updated Name',
      bio: 'This is my bio. I love hiking and photography.',
      city: 'Amsterdam',
    })
    expect(result.success).toBe(true)
  })

  it('should accept partial updates', () => {
    const result = profileUpdateSchema.safeParse({
      bio: 'Just updating the bio',
    })
    expect(result.success).toBe(true)
  })

  it('should reject bio with XSS attempts', () => {
    const result = profileUpdateSchema.safeParse({
      bio: '<script>document.cookie</script>I am nice',
    })
    expect(result.success).toBe(false)
  })

  it('should validate Dutch postcodes', () => {
    const validPostcodes = ['1234 AB', '1234AB', '9999 ZZ']
    const invalidPostcodes = ['12345', 'ABCD 12', '123 ABC', '']

    validPostcodes.forEach((postcode) => {
      const result = profileUpdateSchema.safeParse({ postcode })
      expect(result.success, `Expected ${postcode} to be valid`).toBe(true)
    })

    invalidPostcodes.forEach((postcode) => {
      if (postcode === '') return // Empty is optional
      const result = profileUpdateSchema.safeParse({ postcode })
      expect(result.success, `Expected ${postcode} to be invalid`).toBe(false)
    })
  })

  it('should reject bio over 2000 characters', () => {
    const result = profileUpdateSchema.safeParse({
      bio: 'a'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })
})

describe('messageSchema', () => {
  it('should accept valid messages', () => {
    const result = messageSchema.safeParse({
      content: 'Hello! How are you today?',
      matchId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty messages', () => {
    const result = messageSchema.safeParse({
      content: '',
      matchId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })

  it('should reject messages with only whitespace', () => {
    const result = messageSchema.safeParse({
      content: '   \n\t   ',
      matchId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })

  it('should reject messages over 5000 characters', () => {
    const result = messageSchema.safeParse({
      content: 'a'.repeat(5001),
      matchId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid match IDs', () => {
    const invalidIds = ['not-a-uuid', '12345', '', 'invalid-uuid-format']

    invalidIds.forEach((matchId) => {
      const result = messageSchema.safeParse({
        content: 'Valid message',
        matchId,
      })
      expect(result.success, `Expected ${matchId} to be invalid`).toBe(false)
    })
  })

  it('should reject XSS attempts in messages', () => {
    const result = messageSchema.safeParse({
      content: '<script>stealCookies()</script>Hi there!',
      matchId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })
})

describe('swipeSchema', () => {
  it('should accept valid swipe data', () => {
    const result = swipeSchema.safeParse({
      swipedId: '550e8400-e29b-41d4-a716-446655440000',
      isLike: true,
    })
    expect(result.success).toBe(true)
  })

  it('should accept swipe with isLike false', () => {
    const result = swipeSchema.safeParse({
      swipedId: '550e8400-e29b-41d4-a716-446655440000',
      isLike: false,
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid user IDs', () => {
    const result = swipeSchema.safeParse({
      swipedId: 'invalid-id',
      isLike: true,
    })
    expect(result.success).toBe(false)
  })
})

describe('reportSchema', () => {
  it('should accept valid report data', () => {
    const result = reportSchema.safeParse({
      reportedUserId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'HARASSMENT',
      description: 'This user has been sending inappropriate messages repeatedly.',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid report reasons', () => {
    const result = reportSchema.safeParse({
      reportedUserId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'INVALID_REASON',
      description: 'Some description here that is long enough.',
    })
    expect(result.success).toBe(false)
  })

  it('should reject descriptions shorter than 10 characters', () => {
    const result = reportSchema.safeParse({
      reportedUserId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'SPAM',
      description: 'Too short',
    })
    expect(result.success).toBe(false)
  })

  it('should accept all valid report reasons', () => {
    const validReasons = [
      'INAPPROPRIATE_CONTENT',
      'HARASSMENT',
      'FAKE_PROFILE',
      'SPAM',
      'OTHER',
    ]

    validReasons.forEach((reason) => {
      const result = reportSchema.safeParse({
        reportedUserId: '550e8400-e29b-41d4-a716-446655440000',
        reason,
        description: 'This is a valid description with enough characters.',
      })
      expect(result.success, `Expected reason ${reason} to be valid`).toBe(true)
    })
  })
})

describe('preferencesSchema', () => {
  it('should accept valid preferences', () => {
    const result = preferencesSchema.safeParse({
      minAge: 25,
      maxAge: 35,
      maxDistance: 50,
      showMe: 'EVERYONE',
    })
    expect(result.success).toBe(true)
  })

  it('should reject when minAge is greater than maxAge', () => {
    const result = preferencesSchema.safeParse({
      minAge: 40,
      maxAge: 30,
    })
    expect(result.success).toBe(false)
  })

  it('should reject ages below 18', () => {
    const result = preferencesSchema.safeParse({
      minAge: 16,
      maxAge: 25,
    })
    expect(result.success).toBe(false)
  })

  it('should reject ages above 99', () => {
    const result = preferencesSchema.safeParse({
      minAge: 18,
      maxAge: 100,
    })
    expect(result.success).toBe(false)
  })

  it('should reject negative distances', () => {
    const result = preferencesSchema.safeParse({
      minAge: 18,
      maxAge: 30,
      maxDistance: -10,
    })
    expect(result.success).toBe(false)
  })

  it('should reject distances over 500 km', () => {
    const result = preferencesSchema.safeParse({
      minAge: 18,
      maxAge: 30,
      maxDistance: 600,
    })
    expect(result.success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('should accept valid pagination parameters', () => {
    const result = paginationSchema.safeParse({
      page: 1,
      limit: 20,
    })
    expect(result.success).toBe(true)
  })

  it('should coerce string numbers to integers', () => {
    const result = paginationSchema.safeParse({
      page: '5',
      limit: '25',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(5)
      expect(result.data.limit).toBe(25)
    }
  })

  it('should use default values when not provided', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('should reject limit over 100', () => {
    const result = paginationSchema.safeParse({
      page: 1,
      limit: 150,
    })
    expect(result.success).toBe(false)
  })

  it('should reject page less than 1', () => {
    const result = paginationSchema.safeParse({
      page: 0,
      limit: 20,
    })
    expect(result.success).toBe(false)
  })
})

describe('validateInput helper', () => {
  it('should return success with data for valid input', () => {
    const result = validateInput(emailSchema, 'test@example.com')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('test@example.com')
    }
  })

  it('should return failure with errors for invalid input', () => {
    const result = validateInput(emailSchema, 'invalid-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
    }
  })
})

describe('formatZodErrors helper', () => {
  it('should format errors into a readable object', () => {
    const result = registerSchema.safeParse({
      name: 'A',
      email: 'invalid',
      password: 'weak',
      gender: 'INVALID',
      birthDate: 'not-a-date',
      acceptTerms: false,
    })

    if (!result.success) {
      const formatted = formatZodErrors(result.error)
      expect(typeof formatted).toBe('object')
      expect(Object.keys(formatted).length).toBeGreaterThan(0)
    }
  })

  it('should handle nested paths correctly', () => {
    const nestedSchema = preferencesSchema
    const result = nestedSchema.safeParse({
      minAge: 40,
      maxAge: 30, // Invalid: min > max
    })

    if (!result.success) {
      const formatted = formatZodErrors(result.error)
      expect(formatted).toHaveProperty('minAge')
    }
  })
})

describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(document.cookie)',
    '<div onclick=alert(1)>Click me</div>',
    '<svg onload=alert(1)>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
  ]

  it('should block XSS in profile names', () => {
    xssPayloads.forEach((payload) => {
      const result = profileUpdateSchema.safeParse({ name: payload })
      expect(result.success, `XSS payload should be blocked: ${payload}`).toBe(false)
    })
  })

  it('should block XSS in bio', () => {
    xssPayloads.forEach((payload) => {
      const result = profileUpdateSchema.safeParse({ bio: payload })
      expect(result.success, `XSS payload should be blocked in bio: ${payload}`).toBe(false)
    })
  })

  it('should block XSS in messages', () => {
    xssPayloads.forEach((payload) => {
      const result = messageSchema.safeParse({
        content: payload,
        matchId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success, `XSS payload should be blocked in message: ${payload}`).toBe(false)
    })
  })
})
