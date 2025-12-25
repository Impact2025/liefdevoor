/**
 * Zod Validation Schemas
 *
 * Comprehensive input validation to prevent XSS, injection, and data corruption
 */

import { z } from 'zod'
import { Gender } from '@prisma/client'

/**
 * XSS pattern detection - comprehensive list of dangerous patterns
 * Blocks: script tags, javascript: protocol, and all event handlers
 */
const XSS_PATTERN = /<script|javascript:|on\w+\s*=/i

/**
 * Sanitize string input to prevent XSS
 */
const sanitizedString = (maxLength: number = 500) =>
  z.string()
    .trim()
    .max(maxLength, `Maximaal ${maxLength} karakters toegestaan`)
    .refine(
      (val) => !XSS_PATTERN.test(val),
      'Ongeldige karakters gedetecteerd'
    )

/**
 * Email validation with common patterns
 */
export const emailSchema = z
  .string()
  .email('Ongeldig email adres')
  .toLowerCase()
  .max(255)
  .refine(
    (email) => {
      // Block common temporary email domains
      const tempDomains = ['tempmail', 'guerrillamail', '10minutemail', 'throwaway']
      return !tempDomains.some(domain => email.includes(domain))
    },
    'Gebruik een geldig email adres'
  )

/**
 * Strong password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Wachtwoord moet minimaal 8 karakters zijn')
  .max(100, 'Wachtwoord mag maximaal 100 karakters zijn')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Wachtwoord moet minimaal één hoofdletter bevatten'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Wachtwoord moet minimaal één kleine letter bevatten'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Wachtwoord moet minimaal één cijfer bevatten'
  )

/**
 * User Registration Schema
 */
export const registerSchema = z.object({
  name: sanitizedString(50)
    .min(2, 'Naam moet minimaal 2 karakters zijn')
    .max(50, 'Naam mag maximaal 50 karakters zijn'),

  email: emailSchema,

  password: passwordSchema,

  gender: z.nativeEnum(Gender, {
    message: 'Selecteer een geldig geslacht',
  }),

  birthDate: z
    .string()
    .or(z.date())
    .refine((date) => {
      const birthDate = new Date(date)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      return age >= 18 && age <= 120
    }, 'Je moet minimaal 18 jaar oud zijn'),

  acceptTerms: z.boolean().refine((val) => val === true, 'Je moet de voorwaarden accepteren'),
})

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Wachtwoord is verplicht'),
})

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
  name: sanitizedString(50)
    .min(2, 'Naam moet minimaal 2 karakters zijn')
    .optional(),

  bio: sanitizedString(2000)
    .max(2000, 'Bio mag maximaal 2000 karakters zijn')
    .optional(),

  city: sanitizedString(100)
    .max(100, 'Stad mag maximaal 100 karakters zijn')
    .optional(),

  postcode: z
    .string()
    .regex(/^[0-9]{4}\s?[A-Z]{2}$/i, 'Ongeldige Nederlandse postcode')
    .optional(),

  profileImage: z.string().url('Ongeldige URL').optional(),
})

/**
 * Message Schema
 */
export const messageSchema = z.object({
  content: sanitizedString(5000)
    .min(1, 'Bericht mag niet leeg zijn')
    .max(5000, 'Bericht mag maximaal 5000 karakters zijn')
    .refine(
      (content) => content.trim().length > 0,
      'Bericht mag niet alleen uit spaties bestaan'
    ),

  matchId: z.string().uuid('Ongeldige match ID'),
})

/**
 * Swipe Schema
 */
export const swipeSchema = z.object({
  swipedId: z.string().uuid('Ongeldige gebruiker ID'),
  isLike: z.boolean(),
})

/**
 * Report Schema
 */
export const reportSchema = z.object({
  reportedUserId: z.string().uuid('Ongeldige gebruiker ID'),

  reason: z.enum(
    ['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'FAKE_PROFILE', 'SPAM', 'OTHER'],
    {
      message: 'Selecteer een geldige reden',
    }
  ),

  description: sanitizedString(1000)
    .min(10, 'Beschrijving moet minimaal 10 karakters zijn')
    .max(1000, 'Beschrijving mag maximaal 1000 karakters zijn'),
})

/**
 * Preferences Schema
 */
export const preferencesSchema = z.object({
  minAge: z
    .number()
    .int()
    .min(18, 'Minimale leeftijd is 18')
    .max(99, 'Maximale leeftijd is 99'),

  maxAge: z
    .number()
    .int()
    .min(18, 'Minimale leeftijd is 18')
    .max(99, 'Maximale leeftijd is 99'),

  maxDistance: z
    .number()
    .int()
    .min(1, 'Minimale afstand is 1 km')
    .max(500, 'Maximale afstand is 500 km')
    .optional(),

  showMe: z
    .enum(['EVERYONE', 'MALE', 'FEMALE', 'NON_BINARY'])
    .optional(),

  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
}).refine(
  (data) => data.minAge <= data.maxAge,
  {
    message: 'Minimale leeftijd mag niet hoger zijn dan maximale leeftijd',
    path: ['minAge'],
  }
)

/**
 * Notification Preferences Schema
 */
export const notificationPreferencesSchema = z.object({
  matches: z.boolean(),
  messages: z.boolean(),
  likes: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
})

/**
 * ID Parameter Schema (for URL parameters)
 */
export const idParamSchema = z.object({
  id: z.string().uuid('Ongeldige ID'),
})

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * Search Schema
 */
export const searchSchema = z.object({
  query: sanitizedString(100)
    .min(1, 'Zoekterm mag niet leeg zijn')
    .max(100, 'Zoekterm mag maximaal 100 karakters zijn'),

  filters: z
    .object({
      gender: z.nativeEnum(Gender).optional(),
      minAge: z.number().int().min(18).max(99).optional(),
      maxAge: z.number().int().min(18).max(99).optional(),
      city: sanitizedString(100).optional(),
    })
    .optional(),
})

/**
 * Helper function to validate and sanitize input
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Format Zod errors for API responses
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}

  error.issues.forEach((err) => {
    const path = err.path.join('.')
    formatted[path] = err.message
  })

  return formatted
}

/**
 * Middleware helper to validate request body
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; details: Record<string, string> }
> {
  try {
    const body = await request.json()
    const result = validateInput(schema, body)

    if (!result.success) {
      return {
        success: false,
        error: 'Validatie fout',
        details: formatZodErrors(result.errors),
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      error: 'Ongeldige request body',
      details: {},
    }
  }
}
